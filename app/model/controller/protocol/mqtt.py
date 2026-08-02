###########EXTERNAL IMPORTS############

from enum import Enum
from dataclasses import dataclass
from typing import Dict, Any, Optional

#######################################

#############LOCAL IMPORTS#############

from model.controller.node import BaseNodeProtocolOptions, NodeType
from model.controller.device import BaseCommunicationOptions

#######################################


class MQTTNodeType(str, Enum):
    """
    Enumeration of supported MQTT payload data types.

    Attributes:
        BOOL (str): Boolean value.
        INT (str): Integer value.
        FLOAT (str): Floating-point value.
        STRING (str): String value.
    """

    BOOL = "BOOL"
    INT = "INT"
    FLOAT = "FLOAT"
    STRING = "STRING"


"""Mapping from MQTTNodeType enum values to their corresponding internal type NodeType."""
MQTT_TO_INTERNAL_TYPE_MAP = {
    MQTTNodeType.BOOL: NodeType.BOOL,
    MQTTNodeType.INT: NodeType.INT,
    MQTTNodeType.FLOAT: NodeType.FLOAT,
    MQTTNodeType.STRING: NodeType.STRING,
}


class MQTTNodeMode(str, Enum):
    """
    Enumeration of supported MQTT payload extraction modes.

    Attributes:
        RAW (str): The topic's payload is the value itself (e.g. "230.5").
        JSON (str): The topic's payload is a JSON object; the value is extracted
            from a field identified by a dot-separated path.
    """

    RAW = "RAW"
    JSON = "JSON"


@dataclass
class MQTTNodeOptions(BaseNodeProtocolOptions):
    """
    Protocol-specific configuration for an MQTT node.

    Defines the topic a node's value is published to, how the value should be
    extracted from the message payload, and the expected data type.

    Attributes:
        topic (str): MQTT topic the node's value is published to. Multiple nodes
            may share the same topic when using JSON mode.
        mode (MQTTNodeMode): Determines whether the payload is the raw value or
            a JSON object requiring field extraction.
        type (MQTTNodeType): Expected data type of the node's value.
        json_path (Optional[str]): Dot-separated path used to locate the value
            within a JSON payload (e.g. "data.voltage"). Required when mode is
            JSON, ignored otherwise.
        qos (int): MQTT Quality of Service level used when subscribing. Defaults to 0.
    """

    topic: str
    mode: MQTTNodeMode
    type: MQTTNodeType
    json_path: Optional[str] = None
    qos: int = 0

    @staticmethod
    def cast_from_dict(options_dict: Dict[str, Any]) -> "MQTTNodeOptions":
        """
        Construct MQTTNodeOptions from a persisted options dictionary.

        Converts stored primitive values into MQTT-specific domain types.
        Assumes the input dictionary has already been validated.

        Raises:
            ValueError: If the dictionary cannot be cast into valid MQTT node
            options (e.g. due to corrupted or incompatible data).
        """

        try:
            topic = str(options_dict["topic"])
            mode = MQTTNodeMode(options_dict["mode"])
            type = MQTTNodeType(options_dict["type"])
            json_path = str(options_dict["json_path"]) if options_dict.get("json_path") is not None else None
            qos = int(options_dict["qos"])
            return MQTTNodeOptions(topic=topic, mode=mode, type=type, json_path=json_path, qos=qos)

        except Exception as e:
            raise ValueError(f"Couldn't cast dictionary into MQTT Node Options: {e}.")


class MQTTBrokerMode(str, Enum):
    """
    Enumeration of supported MQTT broker connection modes.

    Attributes:
        INTERNAL (str): Reuses the connection already configured for the
            application's own internal MQTT broker.
        EXTERNAL (str): Connects to a separate, user-configured broker.
    """

    INTERNAL = "INTERNAL"
    EXTERNAL = "EXTERNAL"


@dataclass
class MQTTOptions(BaseCommunicationOptions):
    """
    Configuration options for MQTT communication.

    Unlike Modbus RTU or OPC UA, MQTT is a push protocol: node values are
    updated asynchronously as messages arrive rather than through periodic
    reads, so there is no equivalent of a read period to configure. Derived
    value calculation, logging, and publishing are triggered directly by
    incoming messages instead.

    Attributes:
        broker_mode (MQTTBrokerMode): Whether to reuse the internal broker
            connection or connect to an external, user-configured broker.
        stale_after (int): Maximum time in seconds since a node's last
            received message before it is considered disconnected. This is
            necessary because the subscriber's connection to the broker can
            remain active even if the physical meter itself has stopped
            publishing. Defaults to 60.
        hostname (Optional[str]): Broker hostname, required when broker_mode is EXTERNAL.
        port (Optional[int]): Broker port, required when broker_mode is EXTERNAL.
        use_tls (bool): Whether to connect to the external broker using TLS.
        authentication (bool): Whether the external broker requires authentication.
        username (Optional[str]): Username for external broker authentication.
        password (Optional[str]): Password for external broker authentication, stored as
            provided (not encrypted), matching the existing OPC UA credential handling.
    """

    broker_mode: MQTTBrokerMode
    stale_after: int = 60
    hostname: Optional[str] = None
    port: Optional[int] = None
    use_tls: bool = False
    authentication: bool = False
    username: Optional[str] = None
    password: Optional[str] = None

    @staticmethod
    def cast_from_dict(options_dict: Dict[str, Any]) -> "MQTTOptions":
        """
        Construct MQTTOptions from a persisted communication options dictionary.

        Converts stored primitive values into strongly typed MQTT communication
        options. Assumes the input dictionary has already been validated.

        Raises:
            ValueError: If the dictionary cannot be cast into valid MQTT
            communication options (e.g. due to corrupted or incompatible data).
        """

        try:
            broker_mode = MQTTBrokerMode(options_dict["broker_mode"])
            stale_after = int(options_dict["stale_after"])
            hostname = str(options_dict["hostname"]) if options_dict.get("hostname") is not None else None
            port = int(options_dict["port"]) if options_dict.get("port") is not None else None
            use_tls = bool(options_dict["use_tls"])
            authentication = bool(options_dict["authentication"])
            username = str(options_dict["username"]) if options_dict.get("username") is not None else None
            password = str(options_dict["password"]) if options_dict.get("password") is not None else None
            return MQTTOptions(
                broker_mode=broker_mode,
                stale_after=stale_after,
                hostname=hostname,
                port=port,
                use_tls=use_tls,
                authentication=authentication,
                username=username,
                password=password,
            )

        except Exception as e:
            raise ValueError(f"Couldn't cast dictionary into MQTT Device Options: {e}.")
