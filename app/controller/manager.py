###########EXTERNAL IMPORTS############

import asyncio
from typing import Optional, Dict, Set, Any

#######################################

#############LOCAL IMPORTS#############

from mqtt.client import MQTTMessage
from db.db import SQLiteDBClient
from model.controller.device import EnergyMeterRecord
from controller.registry.protocol import ProtocolRegistry
from controller.meter.device import EnergyMeter
from controller.node.node import Node

#######################################


class DeviceManager:
    """
    Manages a collection of energy meters, including their registration,
    database persistence, and periodic state publishing via MQTT.

    Responsibilities:
        - Maintains a set of active devices (EnergyMeter instances).
        - Publishes device status and data to an MQTT broker.
        - Interfaces with the SQLite database for persisting and retrieving device configurations.
        - Routes measurement data from devices to the appropriate processing queue.

    Attributes:
        devices (Set[Device]): A set of registered devices currently managed in memory.
        enable_publish (asyncio.Event): Event used to enable/disable device publishing.
        publish_queue (asyncio.Queue): Queue used to send MQTT messages from devices.
        measurements_queue (asyncio.Queue): Queue used to send measurement data from devices.
        devices_db (SQLiteDBClient): Database client used for persisting and loading devices and their nodes.
    """

    def __init__(
        self,
        enable_publish: asyncio.Event,
        publish_queue: asyncio.Queue,
        measurements_queue: asyncio.Queue,
        devices_db: SQLiteDBClient,
    ):
        self.devices: Set[EnergyMeter] = set()
        self.enable_publish = enable_publish
        self.publish_queue = publish_queue
        self.measurements_queue = measurements_queue
        self.devices_db = devices_db
        self.handler_task: Optional[asyncio.Task] = None

    async def start(self) -> None:
        """
        Starts the device handling background task.
        """

        if self.handler_task is not None:
            raise RuntimeError("Handler task is already instantiated")

        await self.init_devices()
        loop = asyncio.get_event_loop()
        self.handler_task = loop.create_task(self.handle_devices())

    async def stop(self) -> None:
        """
        Stops and cancels the device handling background task.
        """

        try:
            await self.stop_devices()
            if self.handler_task:
                self.handler_task.cancel()
                await self.handler_task
                self.handler_task = None
        except asyncio.CancelledError:
            pass

    async def init_devices(self) -> None:
        """
        Loads all devices from the database, initializes them, and starts
        the background task that handles periodic device state publishing.
        """

        meter_records = await self.devices_db.get_all_energy_meters()

        for record in meter_records:
            device = self.create_device_from_record(record)
            await self.add_device(device)

    async def stop_devices(self) -> None:
        """
        Stops all registered devices asynchronously.
        """

        for device in self.devices:
            await device.stop()

    async def add_device(self, device: EnergyMeter):
        """
        Registers and starts a device, configuring callbacks and queues if not already set.

        Args:
            device (Device): The device to add.
        """

        if device.measurements_queue != self.measurements_queue:
            device.measurements_queue = self.measurements_queue
        if device.last_seen_update is None:
            device.last_seen_update = self.devices_db.update_device_last_seen
        if device.publish_data is None:
            device.publish_data = self.publish_device_data

        await device.start()
        self.devices.add(device)

    async def delete_device(self, device: EnergyMeter) -> None:
        """
        Stops and removes a device from the manager asynchronously.

        Args:
            device (Device): The device instance to remove.
        """

        await device.stop()
        self.devices.discard(device)

    def get_device(self, device_id: int) -> Optional[EnergyMeter]:
        """
        Retrieves a device by ID.

        Args:
            device_id (int): The unique identifier of the device.

        Returns:
            Optional[Device]: The matched device, or None if not found.
        """

        return next((device for device in self.devices if device.id == device_id), None)

    async def handle_devices(self):
        """
        Periodically publishes the state of all registered devices.
        """

        while True:
            await self.publish_devices_state()
            await asyncio.sleep(10)

    async def publish_devices_state(self):
        """
        Publishes a dictionary of all device states to the MQTT queue.
        """

        if not self.enable_publish.is_set():
            return

        topic = "devices"
        payload: Dict[int, Dict[str, Any]] = {device.id: device.get_device() for device in self.devices}
        await self.publish_queue.put(MQTTMessage(qos=0, topic=topic, payload=payload))

    async def publish_device_data(self, device: EnergyMeter) -> None:
        """
        Publishes device data to the MQTT queue if publishing is enabled.

        Args:
            device (EnergyMeter): The device to publish data for.
        """

        if not self.enable_publish.is_set():
            return

        publish_nodes: Dict[str, Node] = {
            name: node for name, node in device.meter_nodes.nodes.items() if node.config.publish
        }

        topic = f"{device.name}_{device.id}_nodes"
        payload: Dict[str, Any] = {}

        for node in publish_nodes.values():
            payload[node.config.name] = node.get_publish_format()

        if payload:
            await self.publish_queue.put(MQTTMessage(qos=0, topic=topic, payload=payload))

    def create_device_from_record(self, record: EnergyMeterRecord) -> EnergyMeter:
        """
        Instantiate an EnergyMeter from a persisted device record.

        Uses the protocol registry to resolve the appropriate meter class and
        constructs a fully initialized EnergyMeter instance, including its
        nodes and communication options.

        Args:
            record: Persisted energy meter configuration record.

        Returns:
            EnergyMeter: Runtime energy meter instance created from the record.

        Raises:
            ValueError: If the record does not have a valid device ID.
            RuntimeError: If no meter class is registered for the record's protocol.
        """

        if record.id is None:
            raise ValueError(f"Cannot add device {record.name} with none id to the device manager")

        plugin = ProtocolRegistry.get_protocol_plugin(record.protocol)

        if not plugin.meter_class:
            raise RuntimeError(f"No meter class registered for protocol {record.protocol}.")

        return plugin.meter_class(
            id=record.id,
            name=record.name,
            measurements_queue=self.measurements_queue,
            meter_type=record.type,
            meter_options=record.options,
            communication_options=record.communication_options,
            nodes=self.create_nodes(record),
            last_seen_update=self.devices_db.update_device_last_seen,
            publish_data=self.publish_device_data,
        )

    def create_nodes(self, record: EnergyMeterRecord) -> Set[Node]:
        """
        Creates a set of Node instances based on the NodeRecords in the given EnergyMeterRecord.

        Args:
            record (EnergyMeterRecord): The record containing node configurations.

        Returns:
            Set[Node]: A set of fully constructed Node, ModbusRTUNode, or OPCUANode instances.
        """

        created_nodes: Set[Node] = set()

        for node_record in record.nodes:

            protocol = node_record.protocol
            plugin = ProtocolRegistry.get_protocol_plugin(protocol)
            created_nodes.add(plugin.node_factory(node_record))

        return created_nodes
