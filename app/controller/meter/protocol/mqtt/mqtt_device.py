###########EXTERNAL IMPORTS############

import asyncio
import json
import ssl
import time
import logging
from typing import Optional, Set, Dict, List, Callable, Awaitable, Any

import aiomqtt.client as mqtt

#######################################

#############LOCAL IMPORTS#############

from util.debug import LoggerManager
import util.functions.auth as auth_util
import util.functions.date as date
from controller.node.node import Node, MQTTNode
from model.controller.general import Protocol
from model.controller.device import EnergyMeterType, EnergyMeterOptions, DeviceHistoryStatus
from model.controller.protocol.mqtt import MQTTOptions, MQTTBrokerMode, MQTTNodeMode, MQTTNodeType
from controller.meter.device import EnergyMeter
from mqtt.client import MQTTClient
from analytics.validation import validation_metrics

#######################################

LoggerManager.get_logger(__name__).setLevel(logging.ERROR)


class MQTTEnergyMeter(EnergyMeter):
    """
    Energy meter implementation that communicates using the MQTT protocol.

    Unlike Modbus RTU or OPC UA, MQTT is a push protocol: this class never
    polls the meter for values. Instead, it subscribes to the topics
    referenced by its nodes and updates them as messages arrive, immediately
    triggering the shared node processing cycle (derived value calculation,
    logging, and publishing).

    A lightweight internal tick still runs periodically, independent of
    message arrival, for two reasons that message-driven processing alone
    cannot cover:
        - Detecting stale nodes: the subscriber's connection to the broker can
          remain healthy even if the physical meter has stopped publishing, so
          liveness has to be inferred from how recently each node last
          received a message.
        - Guaranteeing logging windows are not missed: if no message arrives
          for longer than a node's logging period, the periodic tick still
          runs the processing cycle so the logging window check is evaluated.

    Inherits:
        EnergyMeter: Base abstraction for energy meter devices.

    Args:
        id (int): Unique identifier of the meter.
        name (str): Display name of the meter.
        measurements_queue (asyncio.Queue): Queue used to push values for logging.
        meter_type (EnergyMeterType): Single-phase or three-phase meter type.
        meter_options (EnergyMeterOptions): General meter configuration.
        communication_options (MQTTOptions): MQTT connection parameters.
        nodes (Optional[Set[Node]]): Node definitions for this meter.
        last_seen_update (Callable[[int], Awaitable[bool]] | None): Optional callback
            invoked when the meter's last seen timestamp changes.
        publish_data (Callable[[EnergyMeter], Awaitable[None]]): Optional callback triggered on device data publication.

    Attributes:
        client (Optional[mqtt.Client]): MQTT client instance used to subscribe to node topics.
        communication_options (MQTTOptions): Connection configuration.
        nodes (Set[Node]): All nodes associated with this meter.
        mqtt_nodes (Set[MQTTNode]): Nodes specific to the MQTT protocol.
        nodes_by_topic (Dict[str, List[MQTTNode]]): Enabled nodes indexed by their source topic.
    """

    STALENESS_CHECK_INTERVAL = 5  # seconds; internal safety-net tick, not user-configurable

    def __init__(
        self,
        id: int,
        name: str,
        measurements_queue: asyncio.Queue,
        meter_type: EnergyMeterType,
        meter_options: EnergyMeterOptions,
        communication_options: MQTTOptions,
        nodes: Optional[Set[Node]] = None,
        last_seen_update: Callable[[int], Awaitable[bool]] | None = None,
        publish_data: Callable[[EnergyMeter], Awaitable[None]] | None = None,
    ):
        super().__init__(
            id=id,
            name=name,
            protocol=Protocol.MQTT,
            measurements_queue=measurements_queue,
            meter_type=meter_type,
            meter_options=meter_options,
            communication_options=communication_options,
            nodes=nodes if nodes else set(),
            last_seen_update=last_seen_update,
            publish_data=publish_data,
        )

        self.communication_options = communication_options
        self.client: Optional[mqtt.Client] = None

        self.nodes: Set[Node] = nodes if nodes else set()
        self.mqtt_nodes: Set[MQTTNode] = {node for node in self.nodes if isinstance(node, MQTTNode)}

        self.nodes_by_topic: Dict[str, List[MQTTNode]] = {}
        for node in self.mqtt_nodes:
            if node.config.enabled:
                self.nodes_by_topic.setdefault(node.options.topic, []).append(node)

        self.run_connection_task = False
        self.run_staleness_task = False

        self.connection_task: Optional[asyncio.Task] = None
        self.receiver_task: Optional[asyncio.Task] = None

        self.get_value_map: Dict[MQTTNodeType, Callable[[Any], float | int | str | bool]] = {
            MQTTNodeType.FLOAT: self.get_float,
            MQTTNodeType.INT: self.get_int,
            MQTTNodeType.STRING: self.get_string,
            MQTTNodeType.BOOL: self.get_bool,
        }

        self.force_nodes_disconnection = False
        self.first_connection = False

        # Guards process_nodes() against concurrent invocation, since unlike the
        # polling protocols this device has two independent tasks that can each
        # trigger it: incoming messages and the periodic staleness tick.
        self.processing_lock = asyncio.Lock()

    async def start(self) -> None:
        """
        Starts the MQTT energy meter background tasks for broker connection,
        message handling, and staleness monitoring.
        """

        if self.client is not None:
            raise RuntimeError(f"MQTT Client for device {self.name} is already running")

        self.__renew_client()
        loop = asyncio.get_event_loop()
        self.run_connection_task = True
        self.run_staleness_task = True
        self.connection_task = loop.create_task(self.manage_connection())
        self.receiver_task = loop.create_task(self.staleness_monitor())

    async def stop(self) -> None:
        """
        Stops the MQTT energy meter tasks and closes the connection.
        """

        if self.client is None:
            raise RuntimeError(f"MQTT Client for device {self.name} is already not running")

        self.run_connection_task = False
        self.run_staleness_task = False
        try:
            if self.connection_task:
                self.connection_task.cancel()
                await self.connection_task
        except asyncio.CancelledError:
            pass
        try:
            if self.receiver_task:
                self.receiver_task.cancel()
                await self.receiver_task
        except asyncio.CancelledError:
            pass
        self.connection_task = None
        self.receiver_task = None
        self.disconnect_nodes()
        await self.close_connection()

    def __renew_client(self) -> None:
        """
        Initializes a new MQTT client, either reusing the application's
        internal broker connection or using the device's own external broker
        configuration.
        """

        if self.communication_options.broker_mode is MQTTBrokerMode.INTERNAL:
            internal_config = MQTTClient.get_config()
            if not internal_config.enabled or not internal_config.hostname or not internal_config.port:
                raise RuntimeError(f"Internal MQTT broker is not enabled or configured for device {self.name}.")

            tls_context = None
            if internal_config.cert_path is not None:
                tls_context = ssl.create_default_context()
                tls_context.load_verify_locations(internal_config.cert_path)

            if (
                internal_config.authentication
                and internal_config.username
                and internal_config.password
                and internal_config.pass_key
            ):
                self.client = mqtt.Client(
                    hostname=internal_config.hostname,
                    port=internal_config.port,
                    identifier=f"enervigil-device-{self.id}",
                    username=internal_config.username,
                    password=auth_util.decrypt_password(internal_config.password, internal_config.pass_key),
                    tls_context=tls_context,
                )
            else:
                self.client = mqtt.Client(
                    hostname=internal_config.hostname,
                    port=internal_config.port,
                    identifier=f"enervigil-device-{self.id}",
                    tls_context=tls_context,
                )
        else:
            if not self.communication_options.hostname or not self.communication_options.port:
                raise RuntimeError(f"External MQTT broker hostname/port not configured for device {self.name}.")

            tls_context = ssl.create_default_context() if self.communication_options.use_tls else None

            if self.communication_options.authentication and self.communication_options.username and self.communication_options.password:
                self.client = mqtt.Client(
                    hostname=self.communication_options.hostname,
                    port=self.communication_options.port,
                    identifier=f"enervigil-device-{self.id}",
                    username=self.communication_options.username,
                    password=self.communication_options.password,
                    tls_context=tls_context,
                )
            else:
                self.client = mqtt.Client(
                    hostname=self.communication_options.hostname,
                    port=self.communication_options.port,
                    identifier=f"enervigil-device-{self.id}",
                    tls_context=tls_context,
                )

    async def manage_connection(self) -> None:
        """
        Connects to the configured broker, subscribes to all topics referenced
        by this device's nodes, and dispatches incoming messages as they
        arrive. Reconnects automatically, with a short delay, on failure.

        Raises:
            RuntimeError: If the MQTT client is not initialized.
        """

        logger = LoggerManager.get_logger(__name__)

        if self.client is None:
            raise RuntimeError(f"Client {self.name} with id {self.id} is not initialized.")

        while self.run_connection_task:
            try:
                logger.info(f"Trying to connect MQTT client {self.name} with id {self.id}...")
                async with self.client as client:
                    self.set_network_state(True)
                    logger.info(f"Client {self.name} with id {self.id} connected")

                    for topic, topic_nodes in self.nodes_by_topic.items():
                        qos = max((node.options.qos for node in topic_nodes), default=0)
                        await client.subscribe(topic, qos=qos)

                    async for message in client.messages:
                        await self.handle_message(str(message.topic), message.payload)

            except Exception as e:
                if self.network_connected:
                    logger.warning(f"Client {self.name} with id {self.id} disconnected: {e}")
                self.set_network_state(False)
                await asyncio.sleep(3)

    async def handle_message(self, topic: str, payload: Any) -> None:
        """
        Updates every node subscribed to the given topic from a single
        incoming message, then triggers the shared processing cycle so fresh
        data is reflected immediately rather than waiting for the next
        staleness check.
        """

        logger = LoggerManager.get_logger(__name__)
        nodes = self.nodes_by_topic.get(topic)
        if not nodes:
            return

        try:
            raw = payload.decode("utf-8") if isinstance(payload, (bytes, bytearray)) else str(payload)
        except Exception as e:
            logger.warning(f"Failed to decode MQTT payload on topic {topic} for device {self.name}: {e}")
            for node in nodes:
                node.set_connection_state(False)
            return

        decoded_json: Any = None
        json_error: Optional[Exception] = None
        if any(node.options.mode is MQTTNodeMode.JSON for node in nodes):
            try:
                decoded_json = json.loads(raw)
            except Exception as e:
                json_error = e

        now = date.get_current_utc_datetime()
        any_node_updated = False

        for node in nodes:
            try:
                if node.options.mode is MQTTNodeMode.RAW:
                    value = self.get_value_map[node.options.type](raw)
                else:
                    if json_error is not None:
                        raise json_error
                    value = self.get_value_map[node.options.type](
                        self.extract_json_path(decoded_json, node.options.json_path)
                    )

                node.processor.set_value(value)
                node.last_message_time = now
                node.set_connection_state(True)
                any_node_updated = True

            except Exception as e:
                logger.warning(
                    f"Failed to process message on topic {topic} for node {node.config.name} on device {self.name}: {e}"
                )
                node.set_connection_state(False)

        if any_node_updated:
            self.update_device_connection_state()
            async with self.processing_lock:
                await self.process_nodes()

    @staticmethod
    def extract_json_path(payload: Any, json_path: Optional[str]) -> Any:
        """
        Extracts a value from a decoded JSON payload using a dot-separated path
        (e.g. "data.voltage").

        Raises:
            ValueError: If no path is provided.
            KeyError: If the path does not resolve to a value in the payload.
        """

        if not json_path:
            raise ValueError("JSON path is required for nodes in JSON mode.")

        value: Any = payload
        for key in json_path.split("."):
            if not isinstance(value, dict) or key not in value:
                raise KeyError(f"JSON path '{json_path}' not found in payload.")
            value = value[key]
        return value

    def get_float(self, value: Any) -> float:
        """Convert a raw or decoded MQTT value to float."""
        return float(value)

    def get_int(self, value: Any) -> int:
        """Convert a raw or decoded MQTT value to int."""
        return int(float(value)) if isinstance(value, str) else int(value)

    def get_string(self, value: Any) -> str:
        """Convert a raw or decoded MQTT value to string."""
        return str(value)

    def get_bool(self, value: Any) -> bool:
        """
        Convert a raw or decoded MQTT value to bool, accepting common
        truthy/falsy string representations in addition to native types.

        Raises:
            ValueError: If a string value cannot be interpreted as boolean.
        """

        if isinstance(value, bool):
            return value
        if isinstance(value, (int, float)):
            return bool(value)
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in ("true", "1", "on"):
                return True
            if normalized in ("false", "0", "off"):
                return False

        raise ValueError(f"Cannot interpret '{value}' as a boolean value.")

    def update_device_connection_state(self, enabled_nodes: Optional[List[MQTTNode]] = None) -> bool:
        """
        Recomputes and applies the device's overall connection state from the
        connection state of its enabled MQTT nodes, mirroring the semantics
        used by the polling protocols.

        Returns:
            bool: The recomputed connection state.
        """

        if enabled_nodes is None:
            enabled_nodes = [node for node in self.mqtt_nodes if node.config.enabled]

        connected = not enabled_nodes or any(node.connected for node in enabled_nodes)
        self.set_connection_state(connected)
        return connected

    def check_staleness(self, enabled_nodes: List[MQTTNode]) -> None:
        """
        Marks nodes as disconnected if no message has been received for
        longer than the configured staleness threshold.
        """

        now = date.get_current_utc_datetime()
        for node in enabled_nodes:
            if node.last_message_time is None:
                continue
            elapsed = (now - node.last_message_time).total_seconds()
            if elapsed > self.communication_options.stale_after:
                node.set_connection_state(False)

    async def staleness_monitor(self) -> None:
        """
        Periodically checks node staleness, updates the device's overall
        connection state, and runs the shared processing cycle independently
        of message arrival.
        """

        logger = LoggerManager.get_logger(__name__)

        while self.run_staleness_task:
            try:
                if self.network_connected:
                    self.first_connection = True
                    self.force_nodes_disconnection = False
                    enabled_nodes = [node for node in self.mqtt_nodes if node.config.enabled]

                    start_time = time.perf_counter()
                    self.check_staleness(enabled_nodes)
                    end_time = time.perf_counter()
                    elapsed_time = (end_time - start_time) * 1000
                    validation_metrics.devices_comm[self.id].comm_metrics.update_metrics(elapsed_time)

                    connected = self.update_device_connection_state(enabled_nodes)
                    if connected:
                        if self.last_seen_update:
                            await self.last_seen_update(self.id)

                        connected_nodes = sum(1 for node in enabled_nodes if node.connected)
                        has_disconnected_enabled_nodes = connected_nodes != len(enabled_nodes)
                        validation_metrics.devices_comm[self.id].add_executed_cycle(False, has_disconnected_enabled_nodes)
                    else:
                        validation_metrics.devices_comm[self.id].add_executed_cycle(True, False)

                elif not self.force_nodes_disconnection:
                    self.disconnect_communication_nodes()
                    self.force_nodes_disconnection = True
                    if self.first_connection:
                        validation_metrics.devices_comm[self.id].add_executed_cycle(True, False)

                async with self.processing_lock:
                    await self.process_nodes()

            except Exception as e:
                logger.exception(f"{e}")
                self.set_connection_state(False)
            if self.first_connection:
                validation_metrics.devices_comm[self.id].add_expected_cycle()
            await asyncio.sleep(MQTTEnergyMeter.STALENESS_CHECK_INTERVAL)

    def disconnect_nodes(self) -> None:
        """Marks all nodes as disconnected."""

        mqtt_nodes = [node for node in self.mqtt_nodes if node.config.enabled]
        calculated_nodes = [node for node in self.nodes if not isinstance(node, MQTTNode) and node.config.enabled]
        for node in mqtt_nodes:
            node.set_connection_state(False)
            node.processor.set_value(None)
        for node in calculated_nodes:
            node.processor.set_value(None)

    def disconnect_communication_nodes(self) -> None:
        """Marks all communication nodes as disconnected."""

        mqtt_nodes = [node for node in self.mqtt_nodes if node.config.enabled]
        for node in mqtt_nodes:
            node.set_connection_state(False)
            node.processor.set_value(None)

    async def close_connection(self) -> None:
        """Releases the MQTT client reference and updates connection state."""

        self.set_network_state(False)
        self.client = None

    async def get_extended_info(
        self, get_history_method: Callable[[int], Awaitable[DeviceHistoryStatus]], additional_data: Dict[str, Any] = {}
    ) -> Dict[str, Any]:
        """
        Extends the base device information with MQTT-specific data.

        Returns:
            Dict[str, Any]:
                Base extended device info plus:
                    - broker_mode: Whether the internal or an external broker is in use
                    - stale_after: Staleness threshold in seconds
        """

        output: Dict[str, Any] = additional_data.copy()
        output["broker_mode"] = self.communication_options.broker_mode
        output["stale_after"] = self.communication_options.stale_after
        return await super().get_extended_info(get_history_method, additional_data=output)
