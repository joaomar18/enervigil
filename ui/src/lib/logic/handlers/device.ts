import { get } from "svelte/store";
import type { EditableDevice, NewDevice } from "$lib/types/device/base";
import type { EditableNodeRecord } from "$lib/types/nodes/config";
import { changeNodeProtocol } from "./nodes/base";
import { protocolPlugins } from "$lib/stores/device/protocol";
import { convertDateToLocalDate } from "../util/date";

/**
 * Handles device protocol changes by updating communication options and converting all nodes to the new protocol.
 * @param deviceData - The device configuration being edited.
 * @param nodes - Array of device nodes to update with the new protocol.
 */
export function deviceProtocolChange(deviceData: EditableDevice | NewDevice, nodes: Array<EditableNodeRecord>): void {
    let newDefaultOptions = { ...get(protocolPlugins)[deviceData.protocol].defaultOptions };
    deviceData.communication_options = newDefaultOptions;

    for (let node of nodes) {
        if (deviceData.protocol !== node.protocol && !node.config.calculated) {
            changeNodeProtocol(deviceData.protocol, node);
        }
    }

    nodes = [...nodes];
}