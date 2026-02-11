import { get } from "svelte/store";
import type { DeviceValidation, Device, EditableDevice, NewDevice } from "$lib/types/device/base";
import type { EditableNodeRecord } from "$lib/types/nodes/config";
import { normalizeDevice } from "$lib/logic/util/device";
import { getAllNodesValidation } from "../nodes/base";
import { showToast } from "$lib/logic/view/toast";
import { AlertType } from "$lib/stores/view/toast";
import { protocolTexts } from "$lib/stores/lang/energyMeterTexts";
import { isEqual } from "$lib/logic/util/generic";


/**
 * Creates and returns a new DeviceValidation object with all validation properties set to false.
 * Used to initialize the validation state for new devices or reset validation during editing.
 *
 * @returns {DeviceValidation} A fresh validation object with all checks set to false
 */
export function getInitialDeviceValidation(): DeviceValidation {
    return {
        deviceName: false,
        deviceProtocol: false,
        communicationOptions: false,
        meterOptions: false,
        nodes: false,
        isValid() {
            return this.deviceName && this.deviceProtocol && this.communicationOptions && this.meterOptions && this.nodes;
        },
    };
}

/**
 * Validates a device name.
 * @param name - Device name.
 * @returns True if valid.
 */
export function validateDeviceName(name: string): boolean {
    if (typeof name !== "string") return false;
    if (name !== name.trim()) return false;
    if (name.length < 3 || name.length > 64) return false;
    if (!/^[a-zA-Z0-9 _-]+$/.test(name)) return false;
    return true;
}

/**
 * Updates device validation state.
 * @param deviceData - Device config.
 * @param nodes - Associated nodes (can be undefined if nodes validation is not needed).
 */
export function updateDeviceValidation(deviceData: EditableDevice | NewDevice, nodes: Array<EditableNodeRecord> | undefined): void {
    deviceData.validation.deviceName = validateDeviceName(deviceData.name);
    deviceData.validation.deviceProtocol = Object.keys(get(protocolTexts)).includes(deviceData.protocol);
    deviceData.validation.communicationOptions = deviceData.communication_options.valid;
    if (nodes) {
        deviceData.validation.nodes = getAllNodesValidation(nodes);
    }
}

/**
 * Validates device config and shows error alerts.
 * @param deviceData - Device config.
 * @returns True if valid, else false.
 */
export function validDeviceOperation(deviceData: EditableDevice | NewDevice): boolean {
    if (deviceData.validation.isValid()) {
        return true;
    }
    if (!deviceData.validation.deviceName) {
        showToast("invalidDeviceName", AlertType.ALERT); // Invalid device name
    } else if (!deviceData.validation.deviceProtocol) {
        showToast("invalidProtocol", AlertType.ALERT); // Invalid device protocol
    } else if (!deviceData.validation.communicationOptions) {
        showToast("invalidCommunicationOptions", AlertType.ALERT); // Invalid Communication Options
    } else if (!deviceData.validation.meterOptions) {
        showToast("invalidMeterOptions", AlertType.ALERT); // Invalid Meter Options
    } else if (!deviceData.validation.nodes) {
        showToast("invalidDeviceNodes", AlertType.ALERT); // Invalid Device Nodes
    }
    return false;
}

/**
 * Compares if a new device configuration is equal to an initial device.
 * @param initialDevice - Initial device configuration.
 * @param newDevice - New device configuration.
 * @returns True if equal.
 */
export function areDevicesEqual(initialDevice: Device, newDevice: Device): boolean {
    return isEqual(initialDevice, normalizeDevice(newDevice));
}
