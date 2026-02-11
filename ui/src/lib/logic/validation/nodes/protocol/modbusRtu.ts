import { ModbusRTUNodeMode, ModbusRTUNodeType, ModbusRTUFunction } from "$lib/types/nodes/protocol/modbusRtu";
import { multiregisterTypes } from "$lib/types/nodes/protocol/modbusRtu";

/**
 * Validates whether the specified Modbus function is compatible with the given node type.
 *
 * READ_COILS and READ_DISCRETE_INPUTS are only valid for boolean node types.
 * All other function–type combinations are considered valid.
 *
 * @param modbus_function - The Modbus RTU function code to validate.
 * @param type - The node's data type.
 * @returns True if the combination is valid; otherwise, false.
 */
export function validateModbusFunction(modbus_function: ModbusRTUFunction, type: ModbusRTUNodeType): boolean {
    if (modbus_function === ModbusRTUFunction.READ_COILS || modbus_function === ModbusRTUFunction.READ_DISCRETE_INPUTS) {
        if (type !== ModbusRTUNodeType.BOOL) {
            return false;
        }
    }
    return true;
}

/**
 * Validates a Modbus register address provided as a string.
 * Supports both decimal (e.g., "100") and hexadecimal formats (e.g., "0x64").
 * Ensures the converted numeric value falls within the valid Modbus address
 * range of 0 to 65535.
 *
 * @function validateModbusAddress
 * @param {string} rawAddress - The user-provided address as a string.
 * @returns {boolean} True if the address is valid, false otherwise.
 */
export function validateModbusAddress(rawAddress: string): boolean {
    let address: number;
    if (rawAddress === "" || rawAddress == null) return false;

    if (rawAddress.startsWith("0x") || rawAddress.startsWith("0X")) {
        address = parseInt(rawAddress, 16);
    } else {
        address = parseInt(rawAddress, 10);
    }
    if (isNaN(address) || address < 0 || address > 65535) {
        return false;
    }

    return true;
}

/**
 * Validates whether the provided endian mode is appropriate for the given
 * Modbus RTU data type. Multi-register types (e.g., FLOAT_32, INT_32, FLOAT_64)
 * require a non-null endian mode to specify register ordering, while
 * single-register types (e.g., INT_16, BOOL) must not define an endian mode.
 *
 * @function validateModbusEndianMode
 * @param {ModbusRTUNodeType} type - The Modbus data type being validated.
 * @param {ModbusRTUNodeMode | null} endianMode - The endian mode selected for the type, or null if none.
 * @returns {boolean} True if the endian mode is valid for the specified type, false otherwise.
 */
export function validateModbusEndianMode(type: ModbusRTUNodeType, endianMode: ModbusRTUNodeMode | null): boolean {
    if (endianMode) {
        if (!multiregisterTypes.includes(type)) {
            return false;
        }
    } else {
        if (multiregisterTypes.includes(type)) {
            return false;
        }
    }
    return true;
}

/**
 * Validates the bit index for a Modbus RTU node.
 *
 * A bit index is only permitted when:
 * - The node data type is BOOL
 * - The Modbus function is NOT READ_COILS or READ_DISCRETE_INPUTS
 *
 * In this case, the bit value must be an integer between 0 and 15.
 * For all other type/function combinations, the bit field must be null.
 *
 * @function validateModbusBitIndex
 * @param {ModbusRTUNodeType} type - The Modbus node data type being validated.
 * @param {ModbusRTUFunction} modbus_function - The Modbus RTU function in use.
 * @param {string | null} bit - User-provided bit index as a string or null.
 * @returns {boolean} `true` if the bit value is valid for the given configuration, `false` otherwise.
 */
export function validateModbusBitIndex(type: ModbusRTUNodeType, modbus_function: ModbusRTUFunction, bit: string | null): boolean {
    if (
        type === ModbusRTUNodeType.BOOL &&
        modbus_function !== ModbusRTUFunction.READ_COILS &&
        modbus_function !== ModbusRTUFunction.READ_DISCRETE_INPUTS
    ) {
        if (bit === null || bit === "") return false;
        const n = Number(bit);
        return Number.isInteger(n) && n >= 0 && n <= 15;
    }

    if (bit !== null) {
        return false;
    }

    return true;
}
