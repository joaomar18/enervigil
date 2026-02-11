import type { NodeRecordEditingState } from "$lib/types/nodes/config";
import { multiregisterTypes, ModbusRTUNodeMode, type ModbusRTUNodeOptions } from "$lib/types/nodes/protocol/modbusRtu";
import {
    type EditableModbusRTUNodeOptions,
    ModbusRTUFunction,
    ModbusRTUNodeType,
} from "$lib/types/nodes/protocol/modbusRtu";

/**
 * Handles UI-side state updates when the Modbus RTU function selection changes.
 *
 * This function updates the validity and value of the `bit` field based on
 * the selected Modbus function and node data type:
 * - READ_COILS and READ_DISCRETE_INPUTS do not support bit indexing
 * - Other functions may require a bit index when the node type is BOOL
 *
 * The previously selected function is retrieved from the editing state to
 * determine whether the `bit` field should be reset or preserved during
 * transitions.
 *
 * @param {EditableModbusRTUNodeOptions} commOptions - Editable Modbus RTU communication options.
 * @param {ModbusRTUNodeType} type - Currently selected node data type.
 * @param {ModbusRTUFunction} modbus_function - Newly selected Modbus RTU function.
 * @param {NodeRecordEditingState} editingState - Stores the previous protocol options for comparison.
 */
export function modbusRTUFunctionChange(
    commOptions: EditableModbusRTUNodeOptions,
    type: ModbusRTUNodeType,
    modbus_function: ModbusRTUFunction,
    editingState: NodeRecordEditingState
): void {
    let previousState = editingState.oldProtocolOptions as ModbusRTUNodeOptions;
    let previousBoolFunction =
        previousState.function === ModbusRTUFunction.READ_COILS || previousState.function === ModbusRTUFunction.READ_DISCRETE_INPUTS;
    let currentBoolFunction = modbus_function === ModbusRTUFunction.READ_COILS || modbus_function === ModbusRTUFunction.READ_DISCRETE_INPUTS;

    if (!currentBoolFunction && type === ModbusRTUNodeType.BOOL) {
        if (previousBoolFunction) {
            commOptions.bit = "";
        }
    } else {
        commOptions.bit = null;
    }

    previousState.function = modbus_function;
}

/**
 * Handles UI-side state updates when the Modbus RTU node data type changes.
 *
 * This function:
 * - Updates endianness when switching between single-register and multi-register types
 * - Manages the `bit` field when entering or leaving BOOL node types
 *
 * Previous protocol options are retrieved from the editing state to apply
 * only the necessary transitions and prevent invalid configurations.
 *
 * @param {EditableModbusRTUNodeOptions} commOptions - Editable Modbus RTU communication options.
 * @param {ModbusRTUNodeType} type - Newly selected node data type.
 * @param {NodeRecordEditingState} editingState - Stores the previous protocol options for comparison.
 */
export function modbusNodeTypeChange(
    commOptions: EditableModbusRTUNodeOptions,
    type: ModbusRTUNodeType,
    editingState: NodeRecordEditingState
): void {

    let previousState = editingState.oldProtocolOptions as ModbusRTUNodeOptions;

    if (!multiregisterTypes.includes(previousState.type) && multiregisterTypes.includes(type)) {
        // Multi-register type change
        commOptions.endian_mode = ModbusRTUNodeMode.BIG_ENDIAN;
    } else if (multiregisterTypes.includes(previousState.type) && !multiregisterTypes.includes(type)) {
        // Change to non Multi-register type
        commOptions.endian_mode = null;
    }

    let currentBoolFunction = previousState.function === ModbusRTUFunction.READ_COILS || previousState.function === ModbusRTUFunction.READ_DISCRETE_INPUTS;

    if (!currentBoolFunction && type === ModbusRTUNodeType.BOOL) {
        if (previousState.type !== ModbusRTUNodeType.BOOL) {
            commOptions.bit = "";
        }
    } else {
        commOptions.bit = null;
    }
}
