import type { BaseCommunicationConfig, EditableBaseCommunicationConfig } from "./base";

/*****     C O N S T A N T S     *****/

// MQTT Limits
export const STALE_AFTER_LIM: Record<string, number> = { MIN: 10, MAX: 600 };

/*****     E N U M S     *****/

/**
 * Broker connection modes supported by the MQTT protocol.
 *
 * @enum
 */
export enum MQTTBrokerMode {
    INTERNAL = "INTERNAL",
    EXTERNAL = "EXTERNAL",
}

/*****     I N T E R F A C E S     *****/

/**
 * Configuration interface for MQTT communication protocol.
 *
 * Unlike Modbus RTU or OPC UA, MQTT is a push protocol: node values are
 * updated as messages arrive rather than through periodic reads, so there
 * is no read period to configure here.
 *
 * @interface DeviceMQTTConfig
 * @property {MQTTBrokerMode} broker_mode - Whether to reuse the internal broker connection or connect to an external broker.
 * @property {number} stale_after - Maximum time in seconds since a node's last received message before it is considered disconnected.
 * @property {string | null} hostname - External broker hostname, required when broker_mode is EXTERNAL.
 * @property {number | null} port - External broker port, required when broker_mode is EXTERNAL.
 * @property {boolean} use_tls - Whether to connect to the external broker using TLS.
 * @property {boolean} authentication - Whether the external broker requires authentication.
 * @property {string | null} username - Username for external broker authentication.
 * @property {string | null} password - Password for external broker authentication.
 */
export interface DeviceMQTTConfig extends BaseCommunicationConfig {
    broker_mode: MQTTBrokerMode;
    stale_after: number;
    hostname: string | null;
    port: number | null;
    use_tls: boolean;
    authentication: boolean;
    username: string | null;
    password: string | null;
}

/**
 * Editable configuration interface for MQTT communication protocol.
 * Mirrors DeviceMQTTConfig but uses string types for numeric properties to
 * support form input handling and validation before conversion.
 *
 * @interface EditableDeviceMQTTConfig
 * @property {MQTTBrokerMode} broker_mode - Whether to reuse the internal broker connection or connect to an external broker.
 * @property {string} stale_after - Staleness threshold in seconds (string for form compatibility).
 * @property {string} hostname - External broker hostname (empty string if not applicable).
 * @property {string} port - External broker port as string (empty string if not applicable).
 * @property {boolean} use_tls - Whether to connect to the external broker using TLS.
 * @property {boolean} authentication - Whether the external broker requires authentication.
 * @property {string} username - Authentication username (empty string if not required).
 * @property {string} password - Authentication password (empty string if not required).
 * @property {boolean} valid - Validation flag indicating if configuration is complete and valid.
 */
export interface EditableDeviceMQTTConfig extends EditableBaseCommunicationConfig {
    broker_mode: MQTTBrokerMode;
    stale_after: string;
    hostname: string;
    port: string;
    use_tls: boolean;
    authentication: boolean;
    username: string;
    password: string;
    valid: boolean;
}

/*****     T Y P E S     *****/

/*****     O B J E C T S     *****/

/**
 * Default configuration values for MQTT communication options.
 * Provides sensible defaults for form initialization and new device creation,
 * defaulting to the internal broker to minimize required configuration.
 */
export const defaultMQTTOptions: EditableDeviceMQTTConfig = {
    broker_mode: MQTTBrokerMode.INTERNAL,
    stale_after: "60",
    hostname: "",
    port: "1883",
    use_tls: false,
    authentication: false,
    username: "",
    password: "",
    valid: false,
};
