import type { BaseCommunicationConfig, EditableBaseCommunicationConfig } from "./base";

/*****     C O N S T A N T S     *****/

// Modbus Limits
export const SLAVE_ID_LIM: Record<string, number> = { MIN: 1, MAX: 247 };
export const RETRIES_NUMBER_LIM: Record<string, number> = { MIN: 0, MAX: 5 };

/*****     E N U M S     *****/

/*****     I N T E R F A C E S     *****/

/**
 * Configuration interface for Modbus RTU communication protocol.
 * Defines all the serial communication parameters required to establish
 * and maintain a connection with Modbus RTU devices.
 *
 * @interface DeviceModbusRTUConfig
 * @property {number} baudrate - Data transmission rate in bits per second (e.g., 9600, 19200, 115200)
 * @property {number} bytesize - Number of data bits per character (typically 7 or 8)
 * @property {string} parity - Error checking method ("N" for None, "E" for Even, "O" for Odd)
 * @property {string} port - Serial communication port identifier (e.g., "COM1", "/dev/ttyUSB0")
 * @property {number} read_period - Time interval in seconds between consecutive data readings
 * @property {number} retries - Number of retry attempts for failed communication requests
 * @property {number} slave_id - Modbus slave device identifier (1-247)
 * @property {number} stopbits - Number of stop bits used to signal end of character (1 or 2)
 * @property {number} timeout - Maximum time in seconds to wait for device response
 */
export interface DeviceModbusRTUConfig extends BaseCommunicationConfig {
    baudrate: number;
    bytesize: number;
    parity: string;
    port: string;
    read_period: number;
    retries: number;
    slave_id: number;
    stopbits: number;
    timeout: number;
}

/**
 * Editable configuration interface for Modbus RTU communication protocol.
 * This interface mirrors ModbusRTUConfig but uses string types for all properties
 * to support form input handling and validation before conversion to the final numeric types.
 * Used primarily in UI components where users input configuration values as text.
 *
 * @interface EditableDeviceModbusRTUConfig
 * @property {string} baudrate - Data transmission rate in bits per second as string (e.g., "9600", "19200", "115200")
 * @property {string} bytesize - Number of data bits per character as string (typically "7" or "8")
 * @property {string} parity - Error checking method ("N" for None, "E" for Even, "O" for Odd)
 * @property {string} port - Serial communication port identifier (e.g., "COM1", "/dev/ttyUSB0")
 * @property {string} read_period - Time interval in seconds between consecutive data readings as string
 * @property {string} retries - Number of retry attempts for failed communication requests as string
 * @property {string} slave_id - Modbus slave device identifier (1-247) as string
 * @property {string} stopbits - Number of stop bits used to signal end of character as string (1 or 2)
 * @property {string} timeout - Maximum time in seconds to wait for device response as string
 * @property {boolean} valid - Indicates whether all communication options are valid
 */
export interface EditableDeviceModbusRTUConfig extends EditableBaseCommunicationConfig {
    baudrate: string;
    bytesize: string;
    parity: string;
    port: string;
    read_period: string;
    retries: string;
    slave_id: string;
    stopbits: string;
    timeout: string;
    valid: boolean;
}

/*****     T Y P E S     *****/

/*****     O B J E C T S     *****/

/**
 * Default configuration values for Modbus RTU communication options.
 * Provides sensible defaults for form initialization and new device creation.
 */
export const defaultModbusRTUOptions: EditableDeviceModbusRTUConfig = {
    port: "",
    slave_id: "1",
    baudrate: "9600",
    parity: "N",
    stopbits: "1",
    bytesize: "8",
    read_period: "10",
    timeout: "10",
    retries: "3",
    valid: false,
};
