import type { BaseNodeProtocolOptions, EditableBaseNodeProtocolOptions, BaseNodeProtocolOptionsValidation } from "../config";

/*****     C O N S T A N T S     *****/

/*****     E N U M S     *****/

/**
 * Defines the supported OPC UA data types for node values.
 *
 * @enum
 */
export enum OPCUANodeType {
    BOOL = "BOOL",
    INT = "INT",
    FLOAT = "FLOAT",
    STRING = "STRING",
}

/*****     I N T E R F A C E S     *****/

/**
 * Represents the configuration for an OPC UA node used for reading or writing values.
 * Extends the base protocol options and includes the OPC UA node identifier and type.
 *
 * @interface
 * @extends BaseNodeProtocolOptions
 * @property {string} node_id - The fully qualified OPC UA NodeId (e.g., "ns=2;s=PowerMeter/Voltage").
 * @property {OPCUANodeType} type - The OPC UA variable's underlying data type.
 */
export interface OPCUANodeOptions extends BaseNodeProtocolOptions {
    node_id: string;
    type: OPCUANodeType;
}

/**
 * Represents an editable version of OPC UA node configuration, used in UI forms or
 * device editing workflows. Contains the same fields as `OPCUANodeOptions` but is
 * conceptually separate for stricter typing in the UI layer.
 *
 * @interface
 * @extends BaseNodeProtocolOptions
 * @property {string} node_id - The OPC UA NodeId provided by the user.
 * @property {OPCUANodeType} type - The selected OPC UA data type for this node.
 */
export interface EditableOPCUANodeOptions extends EditableBaseNodeProtocolOptions {
    node_id: string;
    type: OPCUANodeType;
}

/**
 * Represents the validation state for OPC UA protocol options of a node.
 *
 * Used to validate the configuration of OPC UA–specific parameters
 * required to read data from an OPC UA server.
 *
 * @interface OPCUANodeOptionsValidation
 *
 * @property {boolean} node_id - True if the configured OPC UA NodeId is valid.
 * @property {boolean} type - True if the selected OPC UA data type is valid for the node.
 *
 */
export interface OPCUANodeOptionsValidation extends BaseNodeProtocolOptionsValidation {
    node_id: boolean;
    type: boolean;
}

/*****     T Y P E S     *****/

/*****     O B J E C T S     *****/

/**
 * Default editable OPC UA configuration for newly created nodes.
 * Uses an empty NodeId and FLOAT type as a common starting point.
 *
 * @constant
 */
export const defaultOPCUANodeOptions: EditableOPCUANodeOptions = {
    node_id: "",
    type: OPCUANodeType.FLOAT,
};
