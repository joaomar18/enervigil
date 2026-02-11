import { APICaller } from "$lib/logic/api/api";
import type { APIDescriptor } from "$lib/logic/api/api";
import type { Device, DeviceStatus, EditableDevice, ExtendedDeviceInfo } from "$lib/types/device/base";
import type { NodeRecord } from "$lib/types/nodes/config";
import { processInitialDevice, convertToEditableDevice } from "../factory/device";
import { navigateTo } from "../view/navigation";

/**
 * Retrieves all devices status.
 * Device images are excluded to reduce payload size and improve load time.
 *
 * @returns Object containing a record of processed devices status, or null on failure.
 */
export function getAllDevicesStatusAPI(): APIDescriptor<{ devicesStatus: Record<number, DeviceStatus> } | null> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            let devicesStatus: Record<number, DeviceStatus> = {};

            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/device/get_all_devices_status",
                method: "GET",
                requestId,
                setLoaded: true,
                signal,
                timeout,
                numberOfRetries: 2,
            });
            if (sucess) {
                for (let deviceStatus of data as Array<DeviceStatus>) {
                    devicesStatus[deviceStatus.id] = deviceStatus;
                }
            } else {
                return null;
            }
            return { devicesStatus };
        },
    };
}

/**
 * Retrieves all devices status including their associated images.
 * Converts base64 image data into data URLs mapped by device ID.
 *
 * @returns Object containing processed devices status and a map of device images, or null on failure.
 */
export function getAllDevicesStatusWithImageAPI(): APIDescriptor<{
    devicesStatus: Record<number, DeviceStatus>;
    devicesImages: Record<number, string>;
} | null> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            let devicesStatus: Record<number, DeviceStatus> = {};
            let devicesImages: Record<number, string> = {};

            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/device/get_all_devices_status_with_image",
                method: "GET",
                requestId,
                setLoaded: true,
                signal,
                timeout,
                numberOfRetries: 2,
            });
            if (sucess) {
                for (let deviceData of data as Array<DeviceStatus & { image: Record<string, string> }>) {
                    const { image: deviceImage, ...requestDeviceStatus } = deviceData as DeviceStatus & { image: Record<string, string> };
                    devicesStatus[requestDeviceStatus.id] = requestDeviceStatus;
                    devicesImages[requestDeviceStatus.id] = `data:${deviceImage["type"]};base64,${deviceImage["data"]}`;
                }
            } else {
                return null;
            }

            return { devicesStatus, devicesImages };
        },
    };
}

/**
 * Retrieves a single device with its initial configuration and state.
 * Image data is excluded.
 *
 * @param id - Device identifier.
 * @returns Object containing initial device data, or null on failure.
 */
export function getDeviceAPI(id: number): APIDescriptor<{ initialDeviceData: Device } | null> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            let initialDeviceData: Device;
            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/device/get_device",
                method: "GET",
                requestId,
                params: { id },
                setLoaded: true,
                signal,
                timeout,
                numberOfRetries: 2,
            });
            if (sucess) {
                const { ...requestDeviceData } = data as Device;
                initialDeviceData = processInitialDevice(requestDeviceData as Device);
            } else {
                return null;
            }

            return { initialDeviceData };
        },
    };
}

/**
 * Retrieves detailed device metadata along with processed historical data.
 *
 * @param id - Device identifier.
 * @returns Object containing device information and history, or null on failure.
 */
export function getDeviceExtendedInfoAPI(id: number): APIDescriptor<{ deviceInfo: ExtendedDeviceInfo } | null> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            let deviceInfo: ExtendedDeviceInfo;

            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/device/get_device_extended_info",
                method: "GET",
                requestId,
                params: { id },
                signal,
                timeout,
                numberOfRetries: 2,
            });
            if (sucess) {
                const { ...requestDeviceInfo } = data;
                deviceInfo = requestDeviceInfo as ExtendedDeviceInfo;
            } else {
                return null;
            }
            return { deviceInfo };
        },
    };
}

/**
 * Retrieves the identification of a device.
 *
 * @param id - Device identifier.
 * @returns Object containing device info and image URL, or null on failure.
 */
export function getDeviceIdentificationAPI(id: number): APIDescriptor<{ deviceId: number; deviceName: string } | null> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            let deviceId: number;
            let deviceName: string;

            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/device/get_device_identification_with_image",
                method: "GET",
                requestId,
                params: { id },
                signal,
                timeout,
                numberOfRetries: 2,
            });
            if (sucess) {
                const { ...requestDeviceIdentication } = data;
                deviceId = requestDeviceIdentication?.id as number;
                deviceName = requestDeviceIdentication?.name as string;
            } else {
                return null;
            }
            return { deviceId, deviceName };
        },
    };
}

/**
 * Retrieves a device including its image and editable configuration data.
 *
 * @param id - Device identifier.
 * @returns Object containing initial and editable device data, or null on failure.
 */
export function getDeviceWithImageAPI(id: number): APIDescriptor<{ initialDeviceData: Device; deviceData: EditableDevice } | null> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            let initialDeviceData: Device;
            let deviceData: EditableDevice;
            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/device/get_device_with_image",
                method: "GET",
                requestId,
                params: { id },
                setLoaded: true,
                signal,
                timeout,
                numberOfRetries: 2,
            });
            if (sucess) {
                const { image: deviceImage, ...requestDeviceData } = data as Device & { image: Record<string, string> };
                initialDeviceData = processInitialDevice(requestDeviceData as Device);
                deviceData = convertToEditableDevice(initialDeviceData, deviceImage);
            } else {
                return null;
            }

            return { initialDeviceData, deviceData };
        },
    };
}

/**
 * Retrieves detailed device information including image and processed history.
 *
 * @param id - Device identifier.
 * @returns Object containing device info and image URL, or null on failure.
 */
export function getDeviceExtendedInfoWithImageAPI(id: number): APIDescriptor<{ deviceInfo: ExtendedDeviceInfo; deviceImageUrl: string } | null> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            let deviceInfo: ExtendedDeviceInfo;
            let deviceImageUrl: string;

            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/device/get_device_extended_info_with_image",
                method: "GET",
                requestId,
                params: { id },
                signal,
                timeout,
                numberOfRetries: 2,
            });
            if (sucess) {
                const { image: requestDeviceImage, ...requestDeviceInfo } = data as ExtendedDeviceInfo & { image: Record<string, string> };
                deviceInfo = requestDeviceInfo as ExtendedDeviceInfo;
                deviceImageUrl = `data:${requestDeviceImage["type"]};base64,${requestDeviceImage["data"]}`;
            } else {
                return null;
            }
            return { deviceInfo, deviceImageUrl };
        },
    };
}

/**
 * Retrieves the identification of a device including image.
 *
 * @param id - Device identifier.
 * @returns Object containing device info and image URL, or null on failure.
 */
export function getDeviceIdentificationWithImageAPI(id: number): APIDescriptor<{ deviceId: number; deviceName: string; deviceImageUrl: string } | null> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            let deviceImageUrl: string;
            let deviceId: number;
            let deviceName: string;

            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/device/get_device_identification_with_image",
                method: "GET",
                requestId,
                params: { id },
                signal,
                timeout,
                numberOfRetries: 2,
            });
            if (sucess) {
                const { image: requestDeviceImage, ...requestDeviceIdentication } = data as Record<string, string | number> & {
                    image: Record<string, string>;
                };
                deviceId = requestDeviceIdentication?.id as number;
                deviceName = requestDeviceIdentication?.name as string;
                deviceImageUrl = `data:${requestDeviceImage["type"]};base64,${requestDeviceImage["data"]}`;
            } else {
                return null;
            }
            return { deviceId, deviceName, deviceImageUrl };
        },
    };
}

/**
 * Retrieves the system default device image.
 * Converts the image data into a display-ready data URL.
 *
 * @returns Default device image URL, or null on failure.
 */
export function getDefaultImageAPI(): APIDescriptor<string | null> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            let imageData: Record<string, string>;
            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/device/get_default_image",
                method: "GET",
                requestId,
                setLoaded: true,
                signal,
                timeout,
                numberOfRetries: 2,
            });
            if (sucess) {
                imageData = data as Record<string, string>;
            } else {
                return null;
            }
            return `data:${imageData["type"]};base64,${imageData["data"]}`;
        },
    };
}

/**
 * Creates a new device with configuration data, optional image, and associated nodes.
 * Navigates to devices page on successful creation.
 *
 * @param deviceData - Complete device configuration and settings.
 * @param deviceImage - Optional image file to associate with the device.
 * @param deviceNodes - Array of nodes/variables associated with the device.
 */
export function addDeviceAPI(deviceData: Device, deviceImage: File | undefined, deviceNodes: Array<NodeRecord>): APIDescriptor<void> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/device/add_device",
                method: "POST",
                requestId,
                params: { device_data: deviceData, device_nodes: deviceNodes },
                file: deviceImage,
                fileFieldName: "device_image",
                signal,
                timeout,
            });
            if (sucess) {
                await navigateTo("/devices/dashboard", {});
            }
        },
    };
}

/**
 * Updates an existing device with modified configuration data, image, and nodes.
 * Navigates to devices page on successful update.
 *
 * @param deviceData - Updated device configuration and settings.
 * @param deviceImage - Optional new image file for the device.
 * @param deviceNodes - Updated array of nodes/variables for the device.
 */
export function editDeviceAPI(deviceData: Device, deviceImage: File | undefined, deviceNodes: Array<NodeRecord>): APIDescriptor<void> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/device/edit_device",
                method: "POST",
                requestId,
                params: { device_data: deviceData, device_nodes: deviceNodes },
                file: deviceImage,
                fileFieldName: "device_image",
                signal,
                timeout,
            });
            if (sucess) {
                await navigateTo("/devices/dashboard", {});
            }
        },
    };
}

/**
 * Permanently deletes a device from the system.
 * Navigates to devices page on successful deletion.
 *
 * @param deviceID - Unique identifier of the device to delete.
 */
export function deleteDeviceAPI(deviceID: number): APIDescriptor<void> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/device/delete_device",
                method: "DELETE",
                requestId,
                params: { id: deviceID },
                signal,
                timeout,
            });
            if (sucess) {
                await navigateTo("/devices/dashboard", {});
            }
        },
    };
}
