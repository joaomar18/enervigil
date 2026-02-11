import { APICaller } from "$lib/logic/api/api";
import type { APIDescriptor } from "$lib/logic/api/api";
import { processInitialNodes, initNodes, processNodesState, processNodeLogs, mergeEnergyConsumptionLogs } from "../factory/nodes";
import { NodePhase } from "$lib/types/nodes/base";
import { addPrefix, getNodePrefix, removePrefix } from "../util/nodes";
import { toISOStringLocal } from "../util/date";
import type { EnergyConsumptionType, PeakPowerType } from "$lib/types/device/energy";
import type { NodeRecord, EditableNodeRecord } from "$lib/types/nodes/config";
import type { NodeState, ProcessedNodeState, BaseNodeExtendedInfo } from "$lib/types/nodes/realtime";
import type { EnergyConsumptionMetrics, NodeLogs, ProcessedEnergyConsumptionLogPoint, ProcessedNodeLogs } from "$lib/types/nodes/logs";
import type { EnergyDirectionFilter, SelectablePhaseFilter } from "$lib/types/view/nodes";
import type { MeterType } from "$lib/types/device/base";

/**
 * Retrieves and processes the configuration of all nodes for a given device.
 *
 * Fetches the raw node configuration from the backend, converts it into
 * initial node records, and initializes editable node representations
 * for UI interaction.
 *
 * @param id - Unique identifier of the device.
 * @returns Object containing the initial node records and editable node configurations,
 *          or null if the request fails.
 */
export function getDeviceNodesConfigAPI(id: number): APIDescriptor<{ initialNodes: Array<NodeRecord>; nodes: Array<EditableNodeRecord> } | null> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            let initialNodes: Array<NodeRecord> = [];
            let nodes: Array<EditableNodeRecord> = [];
            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/nodes/get_nodes_config",
                method: "GET",
                requestId,
                params: { id },
                signal,
                timeout,
                numberOfRetries: 2,
            });

            if (sucess) {
                let requestDeviceNodes: Record<string, NodeRecord> = data;
                initialNodes = processInitialNodes(Object.values(requestDeviceNodes) as Array<NodeRecord>);
                const { sucess, editableNodes } = initNodes(initialNodes);
                if (sucess) {
                    nodes = editableNodes;
                }
            } else {
                return null;
            }

            return { initialNodes, nodes };
        },
    };
}

/**
 * Retrieves the real-time operational state of all nodes for a given device.
 *
 * Fetches current node values from the backend and processes them into
 * a UI-ready format, including derived and phase-aware node states.
 *
 * @param id - Unique identifier of the device.
 * @returns Object containing meter type, raw node state record, and processed node states,
 *          or null if the request fails.
 */
export function getDeviceNodesStateAPI(
    id: number,
): APIDescriptor<{ meterType: MeterType; nodesState: Record<string, NodeState>; processedNodesState: Array<ProcessedNodeState> } | null> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            let meter_type: MeterType;
            let nodes_state: Record<string, NodeState>;
            let processedNodesState: Array<ProcessedNodeState>;
            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/nodes/get_nodes_state",
                method: "GET",
                requestId,
                params: { id },
                setLoaded: true,
                signal,
                timeout,
                numberOfRetries: 2,
            });
            if (sucess) {
                ({ meter_type, nodes_state } = data as { meter_type: MeterType; nodes_state: Record<string, NodeState> });
                processedNodesState = processNodesState(nodes_state);
            } else {
                return null;
            }

            return { meterType: meter_type, nodesState: nodes_state, processedNodesState };
        },
    };
}

/**
 * Retrieves additional metadata for a specific node of a device.
 *
 * Automatically resolves the correct phase-prefixed node name before
 * querying the backend for extended node information.
 *
 * @param id - Unique identifier of the device.
 * @param nodeName - Base name of the node.
 * @param nodePhase - Electrical phase associated with the node.
 * @returns Object containing the node additional information,
 *          or null if the request fails.
 */
export function getNodeExtendedInfoAPI(
    id: number,
    nodeName: string,
    nodePhase: NodePhase,
): APIDescriptor<{ nodeAdditionalInfo: BaseNodeExtendedInfo } | null> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            let nodeAdditionalInfo: BaseNodeExtendedInfo;
            const prefix = getNodePrefix(nodePhase);
            const processedName = addPrefix(removePrefix(nodeName), prefix);

            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/nodes/get_node_extended_info",
                method: "GET",
                requestId,
                params: { id, node_name: processedName },
                signal,
                timeout,
                numberOfRetries: 2,
            });

            if (sucess) {
                nodeAdditionalInfo = data as BaseNodeExtendedInfo;
            } else {
                return null;
            }

            return { nodeAdditionalInfo };
        },
    };
}

/**
 * Retrieves and processes historical log data for a specific device node.
 *
 * Fetches time-series measurements from the backend and converts them
 * into a UI-friendly structure with normalized timestamps and formatting.
 *
 * @param id - Unique identifier of the device.
 * @param nodeName - Base name of the node.
 * @param nodePhase - Electrical phase associated with the node.
 * @param formatted - Whether to request formatted backend data.
 * @param start_time - Optional start date for the log query.
 * @param end_time - Optional end date for the log query.
 * @param time_step - Optional aggregation interval.
 * @returns Object containing processed node logs,
 *          or null if the request fails.
 */
export function getNodeLogsAPI(
    id: number,
    nodeName: string,
    nodePhase: NodePhase,
    formatted: boolean | null = null,
    start_time: Date | null = null,
    end_time: Date | null = null,
    time_step: string | null = null,
): APIDescriptor<{ nodeLogs: ProcessedNodeLogs } | null> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            let nodeLogs: ProcessedNodeLogs;
            const prefix = getNodePrefix(nodePhase);
            const processedName = addPrefix(removePrefix(nodeName), prefix);
            let start_time_str: string | null = null;
            let end_time_str: string | null = null;
            start_time_str = start_time !== null ? toISOStringLocal(start_time) : null;
            end_time_str = end_time !== null ? toISOStringLocal(end_time) : null;
            const time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/nodes/get_logs_from_node",
                method: "GET",
                params: { id, node_name: processedName, formatted, start_time: start_time_str, end_time: end_time_str, time_step, time_zone },
                requestId,
                signal,
                timeout,
                numberOfRetries: 2,
            });

            if (sucess) {
                nodeLogs = processNodeLogs(data as NodeLogs);
            } else {
                return null;
            }

            return { nodeLogs };
        },
    };
}

/**
 * Retrieves and processes energy consumption data for a device.
 *
 * Fetches energy-related metrics from the backend (active energy, reactive energy,
 * power factor, and direction), then merges them into unified, time-aligned
 * data points suitable for visualization.
 *
 * @param id - Unique identifier of the device.
 * @param phase - Phase selection filter (single-phase, total, or per-phase).
 * @param direction - Energy flow direction filter.
 * @param formatted - Whether to request formatted backend data.
 * @param start_time - Optional start date for the query.
 * @param end_time - Optional end date for the query.
 * @param time_step - Optional aggregation interval.
 * @returns Object containing raw energy logs, merged log points, and global metrics,
 *          or null if the request fails.
 */
export function getEnergyConsumptionAPI(
    id: number,
    phase: SelectablePhaseFilter,
    direction: EnergyDirectionFilter,
    formatted: boolean | null = null,
    start_time: Date | null = null,
    end_time: Date | null = null,
    time_step: string | null = null,
): APIDescriptor<{
    energyLogs: EnergyConsumptionType;
    mergedPoints: Array<ProcessedEnergyConsumptionLogPoint>;
    mergedGlobalMetrics: EnergyConsumptionMetrics;
} | null> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            let energyLogs: EnergyConsumptionType;
            let mergedPoints: Array<ProcessedEnergyConsumptionLogPoint>;
            let mergedGlobalMetrics: EnergyConsumptionMetrics;
            let start_time_str: string | null = null;
            let end_time_str: string | null = null;
            start_time_str = start_time !== null ? toISOStringLocal(start_time) : null;
            end_time_str = end_time !== null ? toISOStringLocal(end_time) : null;
            const time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/nodes/get_energy_consumption",
                method: "GET",
                requestId,
                params: { id, phase, direction, formatted, start_time: start_time_str, end_time: end_time_str, time_step, time_zone },
                signal,
                timeout,
                numberOfRetries: 2,
            });

            if (sucess) {
                energyLogs = data as EnergyConsumptionType;
                ({ mergedPoints, mergedGlobalMetrics } = mergeEnergyConsumptionLogs(energyLogs));
            } else {
                return null;
            }

            return { energyLogs, mergedPoints, mergedGlobalMetrics };
        },
    };
}

export async function mapMetricsAPI(
    metric: string,
    device_id: number,
    phase: SelectablePhaseFilter,
    start_time: Date | null = null,
    end_time: Date | null = null,
): Promise<any> {
    switch (metric.toLowerCase()) {
        case "peakpower":
            return await getPeakPowerAPI(device_id, phase, start_time, end_time).call({ timeout: 5000 });
        default:
            return null;
    }
}

/**
 * Retrieves the configuration of all nodes for a given device.
 * Fetches raw node configuration data from the backend, converts it into
 * initial node records, and initializes editable node representations
 * for UI interaction.
 *
 * @param id - Unique identifier of the device
 * @returns Object containing initial node records and editable node configurations,
 *          or null if the request fails
 */
export function getPeakPowerAPI(
    id: number,
    phase: SelectablePhaseFilter,
    start_time: Date | null = null,
    end_time: Date | null = null,
): APIDescriptor<PeakPowerType | null> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            let peakPower: PeakPowerType;
            let start_time_str: string | null = null;
            let end_time_str: string | null = null;
            start_time_str = start_time !== null ? toISOStringLocal(start_time) : null;
            end_time_str = end_time !== null ? toISOStringLocal(end_time) : null;
            const time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/nodes/get_peak_power",
                method: "GET",
                requestId,
                params: { id, phase, start_time: start_time_str, end_time: end_time_str, time_zone },
                signal,
                timeout,
                numberOfRetries: 2,
            });

            if (sucess) {
                peakPower = data as PeakPowerType;
            } else {
                return null;
            }

            return peakPower;
        },
    };
}
