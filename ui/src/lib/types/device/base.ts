/*****     C O N S T A N T S     *****/

// Communication Limits
export const READ_PERIOD_LIM: Record<string, number> = { MIN: 5, MAX: 300 };
export const TIMEOUT_LIM: Record<string, number> = { MIN: 1, MAX: 15 };

/*****     E N U M S     *****/

/**
 * Communication protocols supported by the energy monitoring system.
 * Defines the available protocols for communicating with external devices and systems.
 */
export enum Protocol {
    MODBUS_RTU = "MODBUS_RTU",
    OPC_UA = "OPC_UA",
    NONE = "NONE",
}

/**
 * Meter types supported by the energy monitoring system.
 * Defines the electrical connection types for energy metering and analysis.
 */
export enum MeterType {
    SINGLE_PHASE = "SINGLE_PHASE",
    THREE_PHASE = "THREE_PHASE",
}

/*****     I N T E R F A C E S     *****/

/**
 * Base interface for protocol-specific communication configuration objects.
 * Extend for each protocol to define its configuration shape.
 */
export interface BaseCommunicationConfig {}

/**
 * Base interface for editable protocol configuration objects in forms and UI.
 * Extend for each protocol to define its editable config shape. The 'valid' property indicates validation status.
 */
export interface EditableBaseCommunicationConfig {
    valid: boolean;
}

/**
 * Placeholder interface for future energy meter configuration options.
 *
 * This interface is intentionally empty in the current version.
 * It will be extended when meter-specific operational settings
 * are implemented in future releases.
 *
 * @interface MeterOptions
 */
export interface MeterOptions {}

/**
 * Complete device meter configuration interface.
 * Represents a comprehensive energy monitoring device with all its configuration
 * parameters, operational settings, and communication details. This is the main
 * interface that combines all other configuration interfaces into a single device entity.
 *
 * @interface Device
 * @property {boolean} connected - Current connection status of the device (true if actively connected)
 * @property {number} id - Unique numeric identifier for the device within the system
 * @property {string} name - Human-readable name/label for the device (e.g., "Main Building Meter")
 * @property {Protocol} protocol - Communication protocol used by this device (MODBUS_RTU, OPC_UA, or NONE)
 * @property {MeterType} type - Electrical connection type (SINGLE_PHASE or THREE_PHASE)
 * @property {MeterOptions} options - Operational settings controlling measurement capabilities and data acquisition
 * @property {CommunicationOptions} communication_options - Protocol-specific communication parameters and settings
 */
export interface Device {
    connected: boolean;
    id: number;
    name: string;
    protocol: Protocol;
    type: MeterType;
    options: MeterOptions;
    communication_options: BaseCommunicationConfig;
}

/**
 * Represents the status of a device in the energy monitoring system.
 * Provides information about the device's connection state, alarm status,
 * and warning indicators. This interface is used for monitoring and
 * displaying the current state of devices in the system.
 *
 * @interface DeviceStatus
 * @property {number} id - Unique numeric identifier for the device
 * @property {string} name - Human-readable name/label for the device
 * @property {boolean} connected - Indicates whether the device is currently connected
 * @property {boolean} alarm - True if the device is in an alarm state
 * @property {boolean} warning - True if the device is in a warning state
 */
export interface DeviceStatus {
    id: number;
    name: string;
    connected: boolean;
    alarm: boolean;
    warning: boolean;
}

/**
 * Editable device meter configuration interface.
 * This interface mirrors DeviceMeter but uses EditableCommunicationOptions to support
 * form input handling where communication parameters are entered as strings. Used primarily
 * in device configuration forms and editing components where user input validation is required.
 *
 * @interface EditableDevice
 * @property {boolean} connected - Current connection status of the device (true if actively connected)
 * @property {number} id - Unique numeric identifier for the device within the system
 * @property {string} name - Human-readable name/label for the device (e.g., "Main Building Meter")
 * @property {Protocol} protocol - Communication protocol used by this device (MODBUS_RTU, OPC_UA, or NONE)
 * @property {MeterType} type - Electrical connection type (SINGLE_PHASE or THREE_PHASE)
 * @property {MeterOptions} options - Operational settings controlling measurement capabilities and data acquisition
 * @property {EditableBaseCommunicationConfig} communication_options - Protocol-specific communication parameters and settings (as strings for form input)
 * @property {File | undefined} device_image - Optional image file for the device (for visual identification in UI)
 * @property {string | undefined} current_image_url - Optional URL of the device's current image (for displaying existing images in forms)
 * @property {DeviceValidation} validation - Validation state for all device configuration properties
 */
export interface EditableDevice {
    connected: boolean;
    id: number;
    name: string;
    protocol: Protocol;
    type: MeterType;
    options: MeterOptions;
    communication_options: EditableBaseCommunicationConfig;
    device_image: File | undefined;
    current_image_url: string | undefined;
    validation: DeviceValidation;
}

/**
 * Interface for creating a new device meter (device creation payload).
 * Used when adding a new device to the backend, omitting properties managed by the backend (id, connected).
 *
 * @interface NewDevice
 * @property {string} name - Human-readable name/label for the device (e.g., "Main Building Meter")
 * @property {Protocol} protocol - Communication protocol used by this device (MODBUS_RTU, OPC_UA, or NONE)
 * @property {MeterType} type - Electrical connection type (SINGLE_PHASE or THREE_PHASE)
 * @property {MeterOptions} options - Operational settings controlling measurement capabilities and data acquisition
 * @property {EditableBaseCommunicationConfig} communication_options - Protocol-specific communication parameters and settings (as strings for form input)
 * @property {File | undefined} device_image - Optional image file for the device (for visual identification in UI)
 * @property {string | undefined} current_image_url - Optional URL of the device's current image (for displaying existing images in forms)
 * @property {DeviceValidation} validation - Validation state for all device configuration properties
 */
export interface NewDevice {
    name: string;
    protocol: Protocol;
    type: MeterType;
    options: MeterOptions;
    communication_options: EditableBaseCommunicationConfig;
    device_image: File | undefined;
    current_image_url: string | undefined;
    validation: DeviceValidation;
}

/**
 * Represents the validation state for all editable properties of a device.
 * Each boolean property indicates whether the corresponding device configuration section passes validation.
 * Used to provide real-time feedback in the UI and prevent invalid device configurations from being saved.
 *
 * @interface DeviceValidation
 * @property {boolean} deviceName - True if the device name is valid (non-empty, follows naming rules, etc.)
 * @property {boolean} deviceProtocol - True if the selected communication protocol is valid
 * @property {boolean} communicationOptions - True if all protocol-specific communication settings are valid
 * @property {boolean} meterOptions - True if all meter operational options are configured correctly
 * @property {boolean} nodes - True if all device nodes are properly configured and valid
 * @method isValid - Returns true if all validation checks pass (logical AND of all other properties)
 */
export interface DeviceValidation {
    deviceName: boolean;
    deviceProtocol: boolean;
    communicationOptions: boolean;
    meterOptions: boolean;
    nodes: boolean;
    isValid(): boolean;
}

/**
 * Extended device information for status and health overview.
 * Includes connection state, alarm indicators, device type, and lifecycle timestamps.
 *
 * @interface ExtendedDeviceInfo
 * @property {Protocol} protocol - Communication protocol used by the device
 * @property {boolean} connected - Current connection state
 * @property {boolean} alarm - Indicates whether any enabled node is in an alarm state
 * @property {boolean} warning - Indicates whether any enabled node is in a warning state
 * @property {MeterType} type - Meter type
 * @property {string | null} last_seen - Timestamp of the last disconnection or connection event (ISO string)
 * @property {string | null} created_at - Device creation timestamp (ISO string)
 * @property {string | null} updated_at - Last configuration update timestamp (ISO string)
 * @property {string | null} enabled_nodes - Number of enabled nodes in the device
 * @property {string | null} ok_nodes - Number of healthy nodes in the device
 * @property {number | undefined} read_period - Read period of the device (if not applicable is undefined)
 */
export interface ExtendedDeviceInfo {
    protocol: Protocol;
    connected: boolean;
    alarm: boolean;
    warning: boolean;
    type: MeterType;
    last_seen: string | null;
    created_at: string | null;
    updated_at: string | null;
    enabled_nodes: number;
    ok_nodes: number;
    read_period?: number;
}

/*****     T Y P E S     *****/

/*****     O B J E C T S     *****/

/**
 * Default device options for initializing new device forms or objects.
 * Provides default protocol, meter type, and measurement options for convenience.
 */
export const defaultDeviceOptions = {
    protocol: Protocol.OPC_UA,
    type: MeterType.THREE_PHASE,
    options: {
        frequency_reading: true,
        negative_reactive_power: true,
        read_energy_from_meter: true,
        read_separate_forward_reverse_energy: false,
    } as MeterOptions,
};
