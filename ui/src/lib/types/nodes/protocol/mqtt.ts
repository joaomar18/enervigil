import type { BaseNodeProtocolOptions, EditableBaseNodeProtocolOptions, BaseNodeProtocolOptionsValidation } from "../config";

/*****     C O N S T A N T S     *****/

/*****     E N U M S     *****/

/**
 * Defines the supported MQTT payload data types for node values.
 *
 * @enum
 */
export enum MQTTNodeType {
    BOOL = "BOOL",
    INT = "INT",
    FLOAT = "FLOAT",
    STRING = "STRING",
}

/**
 * Defines how a node's value is extracted from its MQTT message payload.
 *
 * @enum
 */
export enum MQTTNodeMode {
    RAW = "RAW",
    JSON = "JSON",
}

/*****     I N T E R F A C E S     *****/

/**
 * Represents the configuration for an MQTT node.
 *
 * @interface
 * @extends BaseNodeProtocolOptions
 * @property {string} topic - MQTT topic the node's value is published to. Multiple nodes may share the same topic when using JSON mode.
 * @property {MQTTNodeMode} mode - Whether the payload is the raw value (RAW) or a JSON object requiring field extraction (JSON).
 * @property {MQTTNodeType} type - The expected data type of the node's value.
 * @property {string | null} json_path - Dot-separated path used to locate the value within a JSON payload (e.g. "data.voltage"). Required when mode is JSON, null otherwise.
 * @property {number} qos - MQTT Quality of Service level used when subscribing to the topic.
 */
export interface MQTTNodeOptions extends BaseNodeProtocolOptions {
    topic: string;
    mode: MQTTNodeMode;
    type: MQTTNodeType;
    json_path: string | null;
    qos: number;
}

/**
 * Represents an editable version of MQTT node configuration, used in UI forms.
 * Mirrors MQTTNodeOptions but keeps `qos` as a string for Selector binding.
 *
 * @interface
 * @extends EditableBaseNodeProtocolOptions
 */
export interface EditableMQTTNodeOptions extends EditableBaseNodeProtocolOptions {
    topic: string;
    mode: MQTTNodeMode;
    type: MQTTNodeType;
    json_path: string | null;
    qos: string;
}

/**
 * Represents the validation state for MQTT protocol options of a node.
 *
 * @interface MQTTNodeOptionsValidation
 * @property {boolean} topic - True if the configured MQTT topic is valid.
 * @property {boolean} mode - True if the selected payload mode is valid.
 * @property {boolean} type - True if the selected MQTT data type is valid.
 * @property {boolean} json_path - True if the JSON path is valid for the current mode.
 * @property {boolean} qos - True if the selected QoS level is valid.
 */
export interface MQTTNodeOptionsValidation extends BaseNodeProtocolOptionsValidation {
    topic: boolean;
    mode: boolean;
    type: boolean;
    json_path: boolean;
    qos: boolean;
}

/*****     T Y P E S     *****/

/*****     O B J E C T S     *****/

/**
 * Default editable MQTT configuration for newly created nodes.
 * Uses RAW mode and FLOAT type as a common starting point.
 *
 * @constant
 */
export const defaultMQTTNodeOptions: EditableMQTTNodeOptions = {
    topic: "",
    mode: MQTTNodeMode.RAW,
    type: MQTTNodeType.FLOAT,
    json_path: null,
    qos: "0",
};
