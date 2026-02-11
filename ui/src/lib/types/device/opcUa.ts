import type { BaseCommunicationConfig, EditableBaseCommunicationConfig } from "./base";

/*****     C O N S T A N T S     *****/

/*****     E N U M S     *****/

/*****     I N T E R F A C E S     *****/

/**
 * Configuration interface for OPC UA (OPC Unified Architecture) communication protocol.
 * Defines all the network communication parameters and authentication settings
 * required to establish and maintain a connection with OPC UA servers.
 *
 * @interface DeviceOPCUAConfig
 * @property {string | null} username - Username for server authentication (null if no authentication required)
 * @property {string | null} password - Password for server authentication (null if no authentication required)
 * @property {number} read_period - Time interval in seconds between consecutive data readings from the server
 * @property {number} timeout - Maximum time in seconds to wait for server response before considering request failed
 * @property {string} url - OPC UA server endpoint URL (e.g., "opc.tcp://192.168.1.100:4840")
 */
export interface DeviceOPCUAConfig extends BaseCommunicationConfig {
    username: string | null;
    password: string | null;
    read_period: number;
    timeout: number;
    url: string;
}

/**
 * Editable configuration interface for OPC UA communication protocol.
 * This interface mirrors OPCUAConfig but uses string types for all properties to support
 * form input handling and validation before conversion to the final types. Used primarily
 * in UI components where users input configuration values as text.
 *
 * @interface EditableDeviceOPCUAConfig
 * @property {string} username - Authentication username (empty string if not required)
 * @property {string} password - Authentication password (empty string if not required)
 * @property {string} read_period - Data reading interval in seconds (string for form compatibility)
 * @property {string} timeout - Connection timeout in seconds (string for form compatibility)
 * @property {string} url - OPC UA server endpoint URL (e.g., "opc.tcp://192.168.1.100:4840")
 * @property {boolean} valid - Validation flag indicating if configuration is complete and valid
 */
export interface EditableDeviceOPCUAConfig extends EditableBaseCommunicationConfig {
    username: string;
    password: string;
    read_period: string;
    timeout: string;
    url: string;
    valid: boolean;
}

/*****     T Y P E S     *****/

/*****     O B J E C T S     *****/

/**
 * Default configuration values for OPC UA communication options.
 * Provides sensible defaults for form initialization and new device creation.
 */
export const defaultOPCUAOptions: EditableDeviceOPCUAConfig = {
    url: "opc.tcp://",
    read_period: "5",
    timeout: "10",
    username: "",
    password: "",
    valid: false,
};
