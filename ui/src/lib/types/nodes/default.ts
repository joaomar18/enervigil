import { NodePhase, NodeType } from "./base";
import { Protocol } from "../device/base";
import type { EditableBaseNodeProtocolOptions, EditableNodeNoProtocolOptions } from "./config";
import { ModbusRTUFunction, ModbusRTUNodeMode, ModbusRTUNodeType, type EditableModbusRTUNodeOptions } from "./protocol/modbusRtu";
import { OPCUANodeType, type EditableOPCUANodeOptions } from "./protocol/opcUa";

/*****     C O N S T A N T S     *****/

/*****     E N U M S     *****/

/*****     I N T E R F A C E S     *****/

/**
 * Defines the default configuration template for a known measurement variable
 * in the energy monitoring system. These defaults are used when creating new nodes
 * or resetting existing ones, providing preset units, phases, data types,
 * logging behavior, alarm thresholds, and protocol-specific options.
 *
 * @interface DefaultNodeInfo
 * @property {string} name - Identifier of the measurement variable (e.g., "voltage", "current", "active_power").
 * @property {number} [defaultNumberOfDecimals] - Default number of decimal places for formatting numeric values.
 * @property {string} defaultUnit - Default unit used for presenting this variable (e.g., "V", "A", "kW").
 * @property {string[]} [availableUnits] - List of selectable units for this variable.
 * @property {NodePhase[]} applicablePhases - Phases where this variable is applicable (e.g., L1, L2, L3, single-phase).
 * @property {NodeType[]} applicableTypes - Supported internal data types for this variable.
 * @property {boolean} canBeVirtual - Whether this variable may be defined as a calculated/virtual node.
 * @property {boolean} defaultPublished - Whether this variable is published externally by default (e.g., MQTT).
 * @property {number} defaultLoggingPeriod - Default logging interval in minutes.
 * @property {boolean} defaultLoggingEnabled - Whether logging is enabled by default.
 * @property {boolean} isNumeric - Whether the variable represents numeric data, affecting units, alarms, and decimal places.
 * @property {boolean} isCounter - Indicates if the variable behaves as a counter (e.g., energy, kWh).
 * @property {number} [defaultMinAlarm] - Default minimum alarm threshold, if applicable.
 * @property {number} [defaultMaxAlarm] - Default maximum alarm threshold, if applicable.
 * @property {boolean} [defaultMinAlarmEnabled] - Whether the minimum alarm is enabled by default.
 * @property {boolean} [defaultMaxAlarmEnabled] - Whether the maximum alarm is enabled by default.
 * @property {boolean} useByDefault - Whether this node should be created automatically for compatible devices.
 * @property {Record<Protocol, EditableBaseNodeProtocolOptions>} defaultProtocolOptions - Protocol-specific default configuration options (e.g., Modbus RTU, OPC UA, no protocol).
 */
export interface DefaultNodeInfo {
    name: string;
    defaultNumberOfDecimals?: number;
    defaultUnit: string;
    availableUnits?: string[];
    applicablePhases: NodePhase[];
    applicableTypes: NodeType[];
    canBeVirtual: boolean;
    defaultPublished: boolean;
    defaultLoggingPeriod: number;
    defaultLoggingEnabled: boolean;
    isNumeric: boolean;
    isCounter?: boolean;
    defaultMinAlarm?: number;
    defaultMaxAlarm?: number;
    defaultMinAlarmEnabled?: boolean;
    defaultMaxAlarmEnabled?: boolean;
    useByDefault: boolean;
    defaultProtocolOptions: Record<Protocol, EditableBaseNodeProtocolOptions>;
}

/*****     T Y P E S     *****/

/*****     O B J E C T S     *****/

export const defaultFloatNodeProtocolOptions: Record<Protocol, EditableBaseNodeProtocolOptions> = {
    [Protocol.NONE]: {
        type: NodeType.FLOAT,
    } as EditableNodeNoProtocolOptions,
    [Protocol.MODBUS_RTU]: {
        function: ModbusRTUFunction.READ_HOLDING_REGISTERS,
        address: "",
        type: ModbusRTUNodeType.FLOAT_32,
        endian_mode: ModbusRTUNodeMode.WORD_SWAP,
        bit: null,
    } as EditableModbusRTUNodeOptions,
    [Protocol.OPC_UA]: {
        node_id: "",
        type: OPCUANodeType.FLOAT,
    } as EditableOPCUANodeOptions,
};
