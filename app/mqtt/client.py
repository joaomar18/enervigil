###########EXTERNAL IMPORTS############

import asyncio
from dataclasses import dataclass
from typing import Optional, Dict, Any
import os
import aiomqtt.client as mqtt
import json

#######################################

#############LOCAL IMPORTS#############

import mqtt.exceptions as mqtt_exception
from util.debug import LoggerManager
import util.functions.auth as auth_util
from conf.env import APP_DATA_PATH

#######################################


@dataclass
class MQTTMessage:
    """
    Simple container for MQTT message data.

    Attributes:
        qos (int): Quality of Service level for the message.
        topic (str): Topic to which the message will be published.
        payload (Dict): Message content.
    """

    qos: int
    topic: str
    payload: Dict


@dataclass
class MQTTClientConfig:
    """
    Represents MQTT client configuration settings.

    Attributes:
        enabled (bool): Whether the MQTT client is enabled.
        port (int | None): Port to use for the MQTT client.
        id (str | None): Client ID to use for the MQTT client.
        authentication (bool): Whether the MQTT client requires authentication.
        username (str | None): Username to use for authentication.
        password (str | None): Encrypted Password to use for authentication.
        pass_key (str | None): Key to use for encrypting the password.
    """

    enabled: bool
    port: Optional[int] = None
    id: Optional[str] = None
    authentication: bool = False
    username: Optional[str] = None
    password: Optional[str] = None
    pass_key: Optional[str] = None


class MQTTClient:
    """
    Asynchronous MQTT client that handles connection and publishing messages through an internal queue.
    """

    CLIENT_CONFIG_PATH = str(f"{APP_DATA_PATH}/mqtt.json")

    @staticmethod
    def get_config() -> MQTTClientConfig:
        """
        Loads the environment and validates required MQTT settings.

        Args:
            config_file (str): Path to the .env config file.

        Raises:
            ValueError: If any required setting is missing.
        """

        # Checks if configuration file exists
        if not os.path.exists(MQTTClient.CLIENT_CONFIG_PATH):
            return MQTTClientConfig(enabled=False)

        # Obtain user configuration
        with open(MQTTClient.CLIENT_CONFIG_PATH, "r") as file:
            config: Dict[str, Any] = json.load(file)
            return MQTTClientConfig(
                enabled=config.get("enabled", False),
                port=config.get("port", None),
                id=config.get("id", None),
                authentication=config.get("authentication", False),
                username=config.get("username", None),
                password=config.get("password", None),
                pass_key=config.get("pass_key", None),
            )

    @staticmethod
    def validate_config(config: MQTTClientConfig) -> None:
        """
        Validates the provided MQTT client configuration.

        Args:
            config (MQTTClientConfig): Configuration object to validate.

        Raises:
            ValueError: If any required setting is missing or invalid.
        """

        if not config.enabled:
            return

        if not isinstance(config.port, int) or config.port < 1 or config.port > 65535:
            raise mqtt_exception.PortInvalidError(f"MQTT port {config.port} is invalid.")

        if config.authentication:
            if not config.username or not config.password or not config.pass_key:
                raise mqtt_exception.AuthInvalidError(f"MQTT authentication is enabled but username or password is missing.")
        else:
            if config.username or config.password or config.pass_key:
                raise mqtt_exception.AuthInvalidError(
                    f"MQTT authentication is disabled but username or password is provided."
                )

    def __init__(self):
        """
        Initializes the MQTT client using a .env configuration file.
        """

        self.config = MQTTClient.get_config()
        MQTTClient.validate_config(self.config)
        self.enable_publish = asyncio.Event()
        self.publish_queue: asyncio.Queue[MQTTMessage] = asyncio.Queue(maxsize=1000)
        self.publish_task: Optional[asyncio.Task] = None
        self.client: Optional[mqtt.Client] = None

    async def start(self) -> None:
        """
        Starts background tasks for MQTT handling and publishing.
        """

        if not self.config.enabled:
            return

        if self.client is not None or self.publish_task is not None:
            raise RuntimeError("Client or publish task are already instantiated")

        loop = asyncio.get_event_loop()

        if self.config.authentication and self.config.username and self.config.password and self.config.pass_key:
            self.client = mqtt.Client(
                hostname="127.0.0.1",
                port=self.config.port or 1883,
                identifier=self.config.id,
                username=self.config.username,
                password=auth_util.decrypt_password(self.config.password, self.config.pass_key),
            )
        else:
            self.client = mqtt.Client(hostname="127.0.0.1", port=self.config.port or 1883, identifier=self.config.id)
        self.publish_task = loop.create_task(self.publisher())
        self.enable_publish.set()

    async def stop(self) -> None:
        """
        Stops the MQTT client by cancelling the publish task.
        """

        try:
            if self.publish_task:
                self.publish_task.cancel()
                await self.publish_task
        except asyncio.CancelledError:
            pass

        self.enable_publish.clear()
        self.clear_queue()
        self.publish_task = None
        if self.client:
            self.client = None

    def __require_client(self) -> mqtt.Client:
        """
        Return the active mqtt client connection.

        Raises:
            RuntimeError: If the client is not initialized.
        """

        if self.client is None:
            raise RuntimeError(f"MQTT client is not instantiated properly. ")
        return self.client

    async def publisher(self) -> None:
        """
        Publishes messages from the internal queue to the MQTT broker.

        Automatically connects and reconnects to the broker.
        Upon the first successful connection, clears any queued messages
        to avoid publishing stale device state.

        This method runs indefinitely in the background.
        """

        logger = LoggerManager.get_logger(__name__)
        mqtt_client = self.__require_client()

        while True:
            try:
                async with mqtt_client as client:
                    logger.info("Connected to the MQTT broker.")
                    self.clear_queue()
                    while True:
                        message: MQTTMessage = await self.publish_queue.get()
                        await client.publish(topic=message.topic, payload=json.dumps(message.payload), qos=message.qos)
                        logger.debug(f"Published to topic {message.topic}")
            except Exception as e:
                logger.error(f"MQTT publish task error: {e}")
                await asyncio.sleep(2)

    def clear_queue(self) -> None:
        """
        Clears all pending messages from the publish queue.

        Intended to be called right after a (re)connection to the MQTT broker,
        to prevent publishing outdated or irrelevant messages.
        """

        while not self.publish_queue.empty():
            try:
                self.publish_queue.get_nowait()
            except asyncio.QueueEmpty:
                break
