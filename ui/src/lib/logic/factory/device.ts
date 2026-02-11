import { get } from "svelte/store";
import { Protocol } from "$lib/types/device/base";
import { protocolPlugins } from "$lib/stores/device/protocol";
import { MeterType } from "$lib/types/device/base";
import type { Device, EditableDevice, NewDevice, MeterOptions, EditableBaseCommunicationConfig, BaseCommunicationConfig } from "$lib/types/device/base";
import { getInitialDeviceValidation } from "../validation/device/base";
import { normalizeDevice } from "../util/device";

/**
 * Converts a Device object to an EditableDevice for UI editing.
 * @param device - The device object to convert.
 * @param deviceImage - Device image data with type and base64 content.
 * @returns EditableDevice suitable for UI forms and validation.
 */
export function convertToEditableDevice(device: Device, deviceImage: Record<string, string>): EditableDevice {
    let plugin = get(protocolPlugins)[device.protocol];
    let editableCommunicationOptions: EditableBaseCommunicationConfig = plugin.convertCommOptionsToEditable(device.communication_options);

    return {
        connected: device.connected,
        id: device.id,
        name: device.name,
        protocol: device.protocol,
        type: device.type,
        options: { ...device.options },
        communication_options: editableCommunicationOptions,
        device_image: undefined,
        current_image_url: `data:${deviceImage["type"]};base64,${deviceImage["data"]}`,
        validation: getInitialDeviceValidation(),
    };
}

/**
 * Converts an EditableDevice or NewDevice back to a Device object for API operations.
 * @param device - The editable or new device to convert.
 * @returns Device object suitable for backend operations.
 */
export function convertToDevice(device: EditableDevice | NewDevice): Device {
    let plugin = get(protocolPlugins)[device.protocol];
    let communicationOptions: BaseCommunicationConfig = plugin.convertCommOptionsToNormal(device.communication_options);

    const baseDevice = {
        name: device.name,
        protocol: device.protocol,
        type: device.type,
        options: { ...device.options },
        communication_options: communicationOptions,
    };

    // Handle different device types - EditableDeviceMeter has id and connected, NewDeviceMeter doesn't
    if ("id" in device) {
        return {
            ...baseDevice,
            connected: device.connected,
            id: device.id,
        } as Device;
    } else {
        return {
            ...baseDevice,
            connected: false,
            id: 0,
        } as Device;
    }
}

/**
 * Processes and normalizes initial device data from the API.
 * @param device - Device or NewDevice object to process.
 * @returns Normalized Device object ready for use.
 */
export function processInitialDevice(device: Device | NewDevice): Device {
    const baseDevice = {
        name: device.name,
        protocol: device.protocol,
        type: device.type,
        options: device.options,
        communication_options: device.communication_options,
    };

    let deviceMeter: Device;
    // Handle different device types - EditableDeviceMeter has id and connected, NewDeviceMeter doesn't
    if ("id" in device) {
        deviceMeter = {
            ...baseDevice,
            connected: device.connected,
            id: device.id,
        };
    } else {
        deviceMeter = {
            ...baseDevice,
            connected: false,
            id: 0,
        };
    }

    return normalizeDevice(deviceMeter);
}

/**
 * Creates a new device configuration with default values for the specified protocol and type.
 * @param protocol - Communication protocol for the new device.
 * @param meter_type - Type of meter (single-phase or three-phase).
 * @param meter_options - Meter-specific configuration options.
 * @returns NewDevice object ready for configuration and creation.
 */
export function createNewDevice(protocol: Protocol, meter_type: MeterType, meter_options: MeterOptions): NewDevice {
    let protocolPlugin = get(protocolPlugins)[protocol];
    let communication_options: EditableBaseCommunicationConfig = { ...protocolPlugin.defaultOptions };

    let new_device: NewDevice = {
        name: "",
        protocol: protocol,
        type: meter_type,
        options: { ...meter_options },
        communication_options: communication_options,
        device_image: undefined,
        current_image_url: undefined,
        validation: getInitialDeviceValidation(),
    };

    return new_device;
}
