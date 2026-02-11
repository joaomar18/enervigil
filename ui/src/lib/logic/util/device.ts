import type { Device, DeviceStatus, EditableDevice, NewDevice } from "$lib/types/device/base";
import type { NodeRecord, EditableNodeRecord } from "$lib/types/nodes/config";
import type { DeviceOPCUAConfig } from "$lib/types/device/opcUa";
import type { DeviceModbusRTUConfig } from "$lib/types/device/modbusRtu";
import { areDevicesEqual } from "../validation/device/base";
import { areNodesEqual } from "../validation/nodes/base";
import { convertToDevice } from "../factory/device";
import { convertToNodes } from "../factory/nodes";

/**
 * Filters devices status by name or ID based on a search query with smart matching logic.
 * @param devices - Array of devices to filter.
 * @param searchQuery - Search string to match against device names and IDs.
 * @returns Filtered and sorted array of devices matching the search criteria.
 */
export function filterDevicesStatus(devicesStatus: Record<number, DeviceStatus>, searchQuery: string): Array<DeviceStatus> {
    let filteredDevices: Array<DeviceStatus> = Object.values(devicesStatus).sort((a, b) => a.id - b.id);

    if (!searchQuery || searchQuery.trim() === "") {
        return filteredDevices;
    }

    const query = searchQuery.trim().toLowerCase();

    // Filter devices that match the search query in name or ID
    filteredDevices = filteredDevices.filter((device) => {
        const nameMatch = device.name.toLowerCase().includes(query);

        // ID matching: handle both partial string matching and numeric matching with leading zeros
        const idString = device.id.toString();
        const partialIdMatch = idString.includes(query);

        // For numeric queries, parse and compare the numeric values to handle leading zeros
        const numericMatch = !isNaN(parseInt(query)) && parseInt(query) === device.id;

        return nameMatch || partialIdMatch || numericMatch;
    });

    return filteredDevices;
}

/**
 * Normalizes a device object by sorting communication options alphabetically for consistent structure.
 * @param device - The device object to normalize.
 * @returns Normalized device with sorted communication options.
 */
export function normalizeDevice(device: Device): Device {
    return {
        connected: device.connected,
        id: device.id,
        name: device.name,
        protocol: device.protocol,
        type: device.type,
        options: device.options,
        communication_options: Object.fromEntries(Object.entries(device.communication_options).sort(([a], [b]) => a.localeCompare(b))) as
            | DeviceOPCUAConfig
            | DeviceModbusRTUConfig,
    };
}

/**
 * Checks if there are any changes between initial and current device/nodes data to determine if saving is needed.
 * @param initialDeviceData - Original device data from the backend.
 * @param deviceData - Current editable device data from the form.
 * @param initialNodes - Original nodes data from the backend.
 * @param nodes - Current editable nodes data from the form.
 * @returns True if no changes detected, false if there are pending changes to save.
 */
export function noChangesToDevice(
    initialDeviceData: Device,
    deviceData: EditableDevice | NewDevice,
    initialNodes: Array<NodeRecord>,
    nodes: Array<EditableNodeRecord>
): boolean {
    if (
        areNodesEqual(initialNodes, convertToNodes(nodes)) &&
        areDevicesEqual(initialDeviceData, convertToDevice(deviceData)) &&
        deviceData.device_image === undefined
    ) {
        return true;
    }
    return false;
}
