###########EXTERNAL IMPORTS############

from typing import Dict, List, Any
from types import NoneType

#######################################

#############LOCAL IMPORTS#############

from model.controller.protocol.mqtt import MQTTOptions, MQTTNodeOptions, MQTTNodeType, MQTTNodeMode, MQTTBrokerMode
import web.parsers.helpers as parse_helper
import web.exceptions as api_exception

#######################################


def parse_mqtt_meter_comm_options(dict_communication_options: Dict[str, Any]) -> MQTTOptions:
    """
    Parse and validate MQTT communication options from an API payload.

    Extracts the broker connection mode and staleness threshold, along with
    the connection parameters required when connecting to an external broker.
    Fields specific to external brokers are not required when the internal
    broker is selected.

    Args:
        dict_communication_options: Raw MQTT communication options dictionary
            provided by the API request.

    Returns:
        MQTTOptions: Parsed and type-safe MQTT communication options.

    Raises:
        InvalidRequestPayload: If required fields are missing or cannot be
            parsed from the request.
        ValueError: If parsed values violate expected internal types,
            indicating an unexpected internal state.
    """

    missing: List[str] = []

    # Parse Broker Mode
    broker_mode = parse_helper.parse_str_field_from_dict(dict_communication_options, "broker_mode", missing)
    if broker_mode is not None:
        try:
            broker_mode = MQTTBrokerMode(broker_mode)
        except Exception as e:
            broker_mode = None
            missing.append("broker_mode")

    # Parse Stale After
    stale_after = parse_helper.parse_int_field_from_dict(dict_communication_options, "stale_after", missing)

    if len(missing) > 0:
        raise api_exception.InvalidRequestPayload(
            api_exception.Errors.DEVICE.MISSING_DEVICE_COMUNICATION_FIELDS, None, details={"missing_fields": missing}
        )

    if not isinstance(broker_mode, MQTTBrokerMode) or not isinstance(stale_after, int):
        raise ValueError(f"Invalid types in MQTT communication options.")

    if broker_mode is MQTTBrokerMode.INTERNAL:
        return MQTTOptions(broker_mode=broker_mode, stale_after=stale_after)

    # External broker: hostname, port and authentication settings are required
    external_missing: List[str] = []

    hostname = parse_helper.parse_str_field_from_dict(dict_communication_options, "hostname", external_missing)
    port = parse_helper.parse_int_field_from_dict(dict_communication_options, "port", external_missing)
    use_tls = parse_helper.parse_bool_field_from_dict(dict_communication_options, "use_tls", external_missing)
    authentication = parse_helper.parse_bool_field_from_dict(dict_communication_options, "authentication", external_missing)

    if len(external_missing) > 0:
        raise api_exception.InvalidRequestPayload(
            api_exception.Errors.DEVICE.MISSING_DEVICE_COMUNICATION_FIELDS, None, details={"missing_fields": external_missing}
        )

    if (
        not isinstance(hostname, str)
        or not isinstance(port, int)
        or not isinstance(use_tls, bool)
        or not isinstance(authentication, bool)
    ):
        raise ValueError(f"Invalid types in MQTT external broker options.")

    username: str | None = None
    password: str | None = None

    if authentication:
        auth_missing: List[str] = []
        username = parse_helper.parse_str_field_from_dict(dict_communication_options, "username", auth_missing)
        password = parse_helper.parse_str_field_from_dict(dict_communication_options, "password", auth_missing)

        if len(auth_missing) > 0:
            raise api_exception.InvalidRequestPayload(
                api_exception.Errors.DEVICE.MISSING_DEVICE_COMUNICATION_FIELDS, None, details={"missing_fields": auth_missing}
            )

        if not isinstance(username, str) or not isinstance(password, str):
            raise ValueError(f"Invalid types in MQTT authentication options.")

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


def parse_mqtt_node_protocol_options(dict_protocol_options: Dict[str, Any]) -> MQTTNodeOptions:
    """
    Parse and validate MQTT node protocol options from an API payload.

    Extracts the topic, payload extraction mode, expected data type and QoS
    level. When mode is JSON, a dot-separated JSON path used to locate the
    value within the message payload is also required.

    Args:
        dict_protocol_options: Raw MQTT node protocol options dictionary
            provided by the API request.

    Returns:
        MQTTNodeOptions: Parsed and type-safe MQTT node protocol options.

    Raises:
        InvalidRequestPayload: If required fields are missing or cannot be
            parsed from the request.
        ValueError: If parsed values violate expected internal types,
            indicating an unexpected internal state.
    """

    missing: List[str] = []

    # Parse Topic
    topic = parse_helper.parse_str_field_from_dict(dict_protocol_options, "topic", missing)

    # Parse Mode
    mode = parse_helper.parse_str_field_from_dict(dict_protocol_options, "mode", missing)
    if mode is not None:
        try:
            mode = MQTTNodeMode(mode)
        except Exception as e:
            mode = None
            missing.append("mode")

    # Parse Type
    type = parse_helper.parse_str_field_from_dict(dict_protocol_options, "type", missing)
    if type is not None:
        try:
            type = MQTTNodeType(type)
        except Exception as e:
            type = None
            missing.append("type")

    # Parse QoS
    qos = parse_helper.parse_int_field_from_dict(dict_protocol_options, "qos", missing)

    # Parse JSON Path (required only in JSON mode, validated below)
    json_path = parse_helper.parse_str_field_from_dict(dict_protocol_options, "json_path", missing, True)

    if len(missing) > 0:
        raise api_exception.InvalidRequestPayload(
            api_exception.Errors.NODES.MISSING_NODE_PROTOCOL_OPTIONS_FIELDS, None, details={"missing_fields": missing}
        )

    if (
        not isinstance(topic, str)
        or not isinstance(mode, MQTTNodeMode)
        or not isinstance(type, MQTTNodeType)
        or not isinstance(qos, int)
        or not isinstance(json_path, (str, NoneType))
    ):
        raise ValueError(f"Invalid types in MQTT Node Protocol options.")

    if mode is MQTTNodeMode.JSON and not json_path:
        raise api_exception.InvalidRequestPayload(
            api_exception.Errors.NODES.MISSING_NODE_PROTOCOL_OPTIONS_FIELDS, None, details={"missing_fields": ["json_path"]}
        )

    return MQTTNodeOptions(topic=topic, mode=mode, type=type, json_path=json_path if mode is MQTTNodeMode.JSON else None, qos=qos)
