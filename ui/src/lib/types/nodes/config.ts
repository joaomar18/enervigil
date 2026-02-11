import { NodeType, NodePhase, CounterMode } from "./base";
import { Protocol } from "../device/base";

/*****     C O N S T A N T S     *****/

export const DECIMAL_PLACES_LIM: Record<string, number> = { MIN: 0, MAX: 6 };
export const LOGGING_PERIOD_LIM: Record<string, number> = { MIN: 1, MAX: 1440 };

/*****     E N U M S     *****/

/*****     I N T E R F A C E S     *****/

/**
 * Base configuration shared by all node types, independent of the communication protocol.
 * Defines common behavior, formatting, logging, publishing, and limit-handling settings applicable to every node in the system.
 *
 * @interface BaseNodeConfig
 * @property {boolean} calculated - Indicates whether the node value is calculated internally rather than obtained via protocol communication.
 * @property {boolean} custom - True if the node is user-defined rather than provided by the device template.
 * @property {number | null} decimal_places - Number of decimal places used when displaying numeric values; null for non-numeric or unformatted node types.
 * @property {boolean} enabled - Controls whether the node is active and processed by the system.
 * @property {boolean} is_counter - Indicates whether the node represents a counter value.
 * @property {CounterMode | null} counter_mode - Defines the counter behavior mode; null when the node is not configured as a counter.
 * @property {boolean} logging - Enables or disables periodic logging of the node value.
 * @property {number} logging_period - Logging interval in minutes when logging is enabled.
 * @property {boolean} max_alarm - Enables a maximum threshold alarm condition.
 * @property {number | null} max_alarm_value - Threshold value that triggers the maximum alarm; null when the alarm is disabled.
 * @property {boolean} min_alarm - Enables a minimum threshold alarm condition.
 * @property {number | null} min_alarm_value - Threshold value that triggers the minimum alarm; null when the alarm is disabled.
 * @property {boolean} max_warning - Enables a maximum threshold warning condition.
 * @property {number | null} max_warning_value - Threshold value that triggers the maximum warning; null when the warning is disabled.
 * @property {boolean} min_warning - Enables a minimum threshold warning condition.
 * @property {number | null} min_warning_value - Threshold value that triggers the minimum warning; null when the warning is disabled.
 * @property {boolean} publish - Controls whether the node value is published to external systems (e.g., MQTT, APIs).
 * @property {string | null} unit - Measurement unit associated with the node value (e.g., V, A, kW); null for non-numeric or unitless values.
 */

export interface BaseNodeConfig {
    calculated: boolean;
    custom: boolean;
    decimal_places: number | null;
    enabled: boolean;
    is_counter: boolean;
    counter_mode: CounterMode | null;
    logging: boolean;
    logging_period: number;
    max_alarm: boolean;
    max_alarm_value: number | null;
    min_alarm: boolean;
    min_alarm_value: number | null;
    max_warning: boolean;
    max_warning_value: number | null;
    min_warning: boolean;
    min_warning_value: number | null;
    publish: boolean;
    unit: string | null;
}

/**
 * Editable version of the base node configuration for UI forms.
 * All numeric fields are represented as strings to support user input and validation.
 */
export interface EditableBaseNodeConfig {
    calculated: boolean;
    custom: boolean;
    decimal_places: string;
    enabled: boolean;
    is_counter: boolean;
    counter_mode: CounterMode | null;
    logging: boolean;
    logging_period: string;
    max_alarm: boolean;
    max_alarm_value: string;
    min_alarm: boolean;
    min_alarm_value: string;
    max_warning: boolean;
    max_warning_value: string;
    min_warning: boolean;
    min_warning_value: string;
    publish: boolean;
    unit: string;
}

/**
 * Base interface for all protocol-specific node configuration options.
 * Serves as a shared parent type that protocol option interfaces extend.
 *
 * @interface
 */
export interface BaseNodeProtocolOptions { }

/**
 * Base interface for editable protocol-specific node configuration options.
 * Used as a shared parent type for UI-side editable protocol option interfaces.
 *
 * @interface
 */
export interface EditableBaseNodeProtocolOptions { }

/**
 * Represents a minimal node definition used when no protocol-specific
 * configuration is needed. Specifies only the internal data type of the node.
 *
 * @interface
 * @property {NodeType} type - Internal variable type (e.g., INT, BOOL, FLOAT, STRING).
 */
export interface NodeNoProtocolOptions {
    type: NodeType;
}

/**
 * Editable version of a minimal node definition used when no protocol-specific
 * configuration is required. Contains only the editable internal data type field.
 *
 * @interface
 * @property {NodeType} type - Internal variable type selected by the user (e.g., INT, BOOL, FLOAT, STRING).
 */
export interface EditableNodeNoProtocolOptions {
    type: NodeType;
}

/**
 * Additional metadata for a device node, such as its associated electrical phase.
 * Used to extend node information with properties not included in the main node interface,
 * enabling more precise grouping, filtering, and processing of nodes.
 *
 * @property {NodePhase | null} phase - The electrical phase associated with the node
 */
export interface NodeAttributes {
    phase: NodePhase;
}

/**
 * Represents a complete node in a device's configuration as stored or sent to the backend.
 * Contains all information required to identify, configure, and communicate with a node,
 * including protocol, configuration, protocol-specific options, and additional attributes.
 *
 * @interface
 * @property {number | undefined} device_id - Unique identifier of the device this node belongs to. Undefined for new nodes not yet saved.
 * @property {string} name - Full name of the node, typically including phase or grouping prefixes.
 * @property {Protocol} protocol - Communication protocol associated with this node.
 * @property {BaseNodeConfig} config - Base node configuration shared across protocols.
 * @property {BaseNodeProtocolOptions} protocol_options - Protocol-specific configuration options.
 * @property {NodeAttributes} attributes - Additional metadata for the node, such as phase or visibility flags.
 */
export interface NodeRecord {
    device_id?: number;
    name: string;
    protocol: Protocol;
    config: BaseNodeConfig;
    protocol_options: BaseNodeProtocolOptions;
    attributes: NodeAttributes;
}

/**
 * Editable version of a device node used in UI forms for user input and validation.
 * Represents node data with editable fields, user-friendly naming, validation state,
 * and protocol-specific editable configuration.
 *
 * @interface
 * @property {number | undefined} device_id - Unique identifier of the device this node belongs to. Undefined for new nodes not yet saved.
 * @property {string} name - Full internal node name, typically including phase or grouping prefixes.
 * @property {Protocol} protocol - Communication protocol chosen for this node.
 * @property {EditableBaseNodeConfig} config - Editable node configuration used for UI input and validation.
 * @property {EditableBaseNodeProtocolOptions} protocol_options - Editable protocol-specific configuration options.
 * @property {NodeAttributes} attributes - Additional metadata for the node, such as phase or visibility flags.
 * @property {string} display_name - User-friendly display name of the node.
 * @property {string} is_numeric - If node is of numeric type.
 * @property {NodeValidation} validation - Validation state of all editable fields for this node.
 */
export interface EditableNodeRecord {
    device_id?: number;
    name: string;
    protocol: Protocol;
    config: EditableBaseNodeConfig;
    protocol_options: EditableBaseNodeProtocolOptions;
    attributes: NodeAttributes;
    display_name: string;
    is_numeric: boolean;
    validation: NodeValidation;
}

/**
 * Represents the previous state of a node's editable properties during configuration changes.
 * Used to restore values when modifying name, unit, or protocol-specific options.
 *
 * @interface
 * @property {string} oldVariableName - The node's previous variable name.
 * @property {string} oldVariableUnit - The node's previous unit value.
 * @property {EditableBaseNodeProtocolOptions | undefined} oldProtocolOptions - Previously applied protocol-specific options, if any.
 */
export interface NodeRecordEditingState {
    oldVariableName: string;
    oldVariableUnit: string;
    oldProtocolOptions: EditableBaseNodeProtocolOptions | undefined;
}

/**
 * Represents the validation state for all editable properties of a node.
 * Each validation field indicates whether the corresponding configuration
 * passes validation.
 *
 * Used by the UI to provide real-time feedback and to block saving invalid
 * node configurations.
 *
 * @interface NodeValidation
 *
 * @property {boolean} variableName - True if the node's display name is valid (syntax, uniqueness, etc.).
 * @property {boolean} variableType - True if the selected internal variable type is valid for this node.
 * @property {boolean} variableUnit - True if the selected measurement unit is valid for the node's type.
 * @property {boolean} protocol - True if the selected communication protocol is valid for this node.
 * @property {BaseNodeProtocolOptionsValidation} protocolOptions - Validation state for protocol-specific options (or virtual node options).
 * @property {boolean} decimalPlaces - True if the number of decimal places is within an acceptable range.
 * @property {boolean} loggingPeriod - True if the logging interval is valid for the node.
 * @property {boolean} minAlarm - True if the minimum alarm value (if enabled) is valid.
 * @property {boolean} maxAlarm - True if the maximum alarm value (if enabled) is valid.
 * @property {boolean} minWarning - True if the minimum warning value (if enabled) is valid.
 * @property {boolean} maxWarning - True if the maximum warning value (if enabled) is valid.
 * @property {boolean} calculated - True if the configuration for a calculated or virtual node is valid.
 * @property {boolean} isCounter - True if the node is correctly configured as a counter-type variable.
 * @property {boolean} counterMode - True if the counter mode configuration (incremental, rollover, etc.) is valid.
 *
 * @method isValid - Returns true only if all validation states are valid.
 */
export interface NodeValidation {
    variableName: boolean;
    variableType: boolean;
    variableUnit: boolean;
    protocol: boolean;
    protocolOptions: BaseNodeProtocolOptionsValidation;
    decimalPlaces: boolean;
    loggingPeriod: boolean;
    minAlarm: boolean;
    maxAlarm: boolean;
    minWarning: boolean;
    maxWarning: boolean;
    calculated: boolean;
    isCounter: boolean;
    counterMode: boolean;
    isValid(): boolean;
}

/**
 * Represents the validation state for protocol-specific options of a node.
 *
 * Provides a common validation method shared by all protocol option
 * validation models.
 *
 * @interface BaseNodeProtocolOptionsValidation
 *
 * @method isValid - Returns true if the protocol options configuration is valid.
 */
export interface BaseNodeProtocolOptionsValidation {
    isValid(): boolean;
}

/**
 * Represents the validation state for nodes that do not use
 * a communication protocol (virtual nodes).
 *
 * Used for node types whose values are calculated or derived
 * internally and therefore do not require protocol-specific
 * configuration options.
 *
 * @interface NoProtocolNodeOptionsValidation
 *
 * @property {boolean} type - True if the selected node type is valid.
 *
 */
export interface NoProtocolNodeOptionsValidation extends BaseNodeProtocolOptionsValidation {
    type: boolean;
}

/*****     O B J E C T S     *****/

/**
 * Default editable base node configuration used for initializing new nodes in UI forms.
 */
export const defaultBaseNodeConfig: EditableBaseNodeConfig = {
    calculated: false,
    custom: true,
    decimal_places: String(2),
    enabled: true,
    is_counter: false,
    counter_mode: null,
    logging: false,
    logging_period: String(15),
    max_alarm: false,
    max_alarm_value: "",
    min_alarm: false,
    min_alarm_value: "",
    min_warning: false,
    min_warning_value: "",
    max_warning: false,
    max_warning_value: "",
    unit: "",
    publish: true,
};

/**
 * Default editable configuration for nodes without protocol-specific options.
 * Initializes the internal data type to FLOAT as a common starting value.
 *
 * @constant
 */
export const defaultNoProtocolNodeOptions: EditableNodeNoProtocolOptions = {
    type: NodeType.FLOAT,
};
