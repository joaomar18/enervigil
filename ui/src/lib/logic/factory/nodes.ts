import { get } from "svelte/store";
import { MeterType } from "$lib/types/device/base";
import { NodePhase, NodePrefix, nodePhaseSections, CounterMode } from "$lib/types/nodes/base";
import { defaultVariables } from "$lib/stores/device/variables";
import { addPrefix, removePrefix, getNodePrefix, isNumeric, typeIsNumeric } from "../util/nodes";
import { sortNodesLogically } from "../handlers/nodes/base";
import { getInitialNodeValidation } from "../validation/nodes/base";
import { stringIsValidInteger, stringIsValidFloat } from "$lib/logic/util/generic";
import { protocolPlugins } from "$lib/stores/device/protocol";
import { normalizeNode } from "../util/nodes";
import { showToast } from "../view/toast";
import { AlertType } from "$lib/stores/view/toast";
import { getNodeRealTimeDisplayComponent, getNodeLogGraphType, getNodeCategory } from "../view/nodes";
import { convertISOToTimestamp } from "../util/date";
import type { DefaultNodeInfo } from "$lib/types/nodes/default";
import type { EditableDevice, NewDevice } from "$lib/types/device/base";
import {
    type BaseNodeConfig,
    type NodeRecord,
    type EditableNodeRecord,
    type EditableBaseNodeConfig,
    type NodeAttributes,
    type EditableBaseNodeProtocolOptions,
    type BaseNodeProtocolOptions,
    defaultBaseNodeConfig,
} from "$lib/types/nodes/config";
import type { NodeState, ProcessedNodeState } from "$lib/types/nodes/realtime";
import type {
    CounterLogPoint,
    CounterMetrics,
    EnergyConsumptionMetrics,
    NodeLogs,
    ProcessedBaseLogPoint,
    ProcessedEnergyConsumptionLogPoint,
    ProcessedNodeLogs,
    SingleValueLogPoint,
    SingleValueMetrics,
} from "$lib/types/nodes/logs";
import type { EnergyConsumptionType } from "$lib/types/device/energy";

/**
 * Converts an internal BaseNodeConfig into its editable UI representation.
 * Formats numeric fields as strings, applies decimal rounding for alarm values,
 * and prepares configuration values for form input handling.
 *
 * @function convertToEditableBaseNodeConfig
 * @param {BaseNodeConfig} config - The internal node configuration.
 * @param {boolean} isNumeric - Whether the node represents a numeric variable.
 * @returns {EditableBaseNodeConfig} The configuration formatted for UI editing.
 */
export function convertToEditableBaseNodeConfig(config: BaseNodeConfig, isNumeric: boolean): EditableBaseNodeConfig {
    let decimal_places: string = isNumeric && config.decimal_places !== null ? config.decimal_places.toString() : "";
    let number_decimal_places: number = parseInt(decimal_places) ?? 0;
    return {
        calculated: config.calculated,
        custom: config.custom,
        decimal_places: decimal_places,
        enabled: config.enabled,
        is_counter: config.is_counter,
        counter_mode: config.counter_mode,
        logging: config.logging,
        logging_period: config.logging_period.toString(),
        max_alarm: config.max_alarm,
        max_alarm_value: config.max_alarm_value !== null ? String(Number(config.max_alarm_value.toFixed(number_decimal_places))) : "",
        min_alarm: config.min_alarm,
        min_alarm_value: config.min_alarm_value !== null ? String(Number(config.min_alarm_value.toFixed(number_decimal_places))) : "",
        max_warning: config.max_warning,
        max_warning_value: config.max_warning_value !== null ? String(Number(config.max_warning_value.toFixed(number_decimal_places))) : "",
        min_warning: config.min_warning,
        min_warning_value: config.min_warning_value !== null ? String(Number(config.min_warning_value.toFixed(number_decimal_places))) : "",
        publish: config.publish,
        unit: config.unit ?? "",
    } as EditableBaseNodeConfig;
}

/**
 * Converts an editable UI configuration back into the internal BaseNodeConfig format.
 * Parses numeric fields from strings, normalizes optional values, and removes fields
 * not applicable for non-numeric variables.
 *
 * @function convertToBaseNodeConfig
 * @param {EditableBaseNodeConfig} config - The UI-provided editable configuration.
 * @param {boolean} isNumeric - Whether the node represents a numeric variable.
 * @returns {BaseNodeConfig} The normalized internal configuration.
 */
export function convertToBaseNodeConfig(config: EditableBaseNodeConfig, isNumeric: boolean): BaseNodeConfig {
    return {
        calculated: config.calculated,
        custom: config.custom,
        decimal_places: stringIsValidInteger(config.decimal_places) ? parseInt(config.decimal_places) : null,
        enabled: config.enabled,
        is_counter: config.is_counter,
        counter_mode: config.counter_mode,
        logging: config.logging,
        logging_period: parseInt(config.logging_period),
        max_alarm: config.max_alarm,
        max_alarm_value: stringIsValidFloat(config.max_alarm_value) ? parseFloat(config.max_alarm_value) : null,
        min_alarm: config.min_alarm,
        min_alarm_value: stringIsValidFloat(config.min_alarm_value) ? parseFloat(config.min_alarm_value) : null,
        max_warning: config.max_warning,
        max_warning_value: stringIsValidFloat(config.max_warning_value) ? parseFloat(config.max_warning_value) : null,
        min_warning: config.min_warning,
        min_warning_value: stringIsValidFloat(config.min_warning_value) ? parseFloat(config.min_warning_value) : null,
        publish: config.publish,
        unit: isNumeric ? config.unit : null,
    } as BaseNodeConfig;
}

/**
 * Generates an EditableBaseNodeConfig from a default variable and meter options.
 * Used to create editable node configs for UI forms based on variable defaults and device options.
 * @param variable - Default variable information.
 * @param options - Meter options for the device.
 * @returns EditableBaseNodeConfig for UI editing.
 */
export function getEditableBaseNodeConfigFromDefaultVar(variable: DefaultNodeInfo): EditableBaseNodeConfig {
    let decimal_places: string = "";
    let min_alarm_value: string = "";
    let max_alarm_value: string = "";
    let min_warning_value: string = "";
    let max_warning_value: string = "";

    if (variable.isNumeric) {
        decimal_places = variable.defaultNumberOfDecimals ? variable.defaultNumberOfDecimals.toString() : "0";

        if (!variable.isCounter) {
            min_alarm_value = variable.defaultMinAlarm ? String(Number(variable.defaultMinAlarm.toFixed(parseInt(decimal_places)))) : "";
            min_warning_value = min_alarm_value ? String(Number((Number(min_alarm_value) * (1 + 0.02)).toFixed(parseInt(decimal_places)))) : "";
            max_alarm_value = variable.defaultMaxAlarm ? String(Number(variable.defaultMaxAlarm.toFixed(parseInt(decimal_places)))) : "";
            max_warning_value = max_alarm_value ? String(Number((Number(max_alarm_value) * (1 + 0.02)).toFixed(parseInt(decimal_places)))) : "";
        }
    }

    return {
        calculated: false,
        custom: false,
        decimal_places: decimal_places,
        enabled: true,
        is_counter: variable.isCounter,
        counter_mode: variable.isCounter ? CounterMode.DIRECT : null,
        logging: variable.defaultLoggingEnabled,
        logging_period: String(variable.defaultLoggingPeriod),
        max_alarm: variable.defaultMaxAlarmEnabled ? true : false,
        max_alarm_value: max_alarm_value,
        min_alarm: variable.defaultMinAlarmEnabled !== undefined ? true : false,
        min_alarm_value: min_alarm_value,
        max_warning: false,
        max_warning_value: max_warning_value,
        min_warning: false,
        min_warning_value: min_warning_value,
        publish: variable.defaultPublished,
        unit: variable.defaultUnit,
    } as EditableBaseNodeConfig;
}

/**
 * Converts an array of NodeRecord objects to EditableNodeRecord objects for UI editing.
 * @param nodes - Array of device nodes to convert.
 * @returns Array of editable nodes suitable for UI forms.
 */
export function convertToEditableNodes(nodes: Array<NodeRecord>): Array<EditableNodeRecord> {
    let editableNodes: Array<EditableNodeRecord> = [];

    for (const node of nodes) {
        let editableNode: EditableNodeRecord;
        let plugin = get(protocolPlugins)[node.protocol];
        let editableConfig: EditableBaseNodeConfig = convertToEditableBaseNodeConfig(node.config, isNumeric(node));
        let editableProtocolOptions: EditableBaseNodeProtocolOptions = plugin.convertNodeProtocolOptionsToEditable(node.protocol_options);

        editableNode = {
            name: node.name,
            device_id: node.device_id,
            protocol: node.protocol,
            display_name: removePrefix(node.name),
            is_numeric: isNumeric(node),
            validation: getInitialNodeValidation(node.protocol, editableProtocolOptions),
            config: editableConfig,
            protocol_options: editableProtocolOptions,
            attributes: node.attributes,
        };

        editableNodes.push(editableNode);
    }

    return sortNodesLogically(editableNodes) as Array<EditableNodeRecord>;
}

/**
 * Converts an array of EditableNodeRecord objects back to NodeRecord objects for API operations.
 * @param nodes - Array of editable nodes to convert.
 * @returns Array of device nodes suitable for backend operations.
 */
export function convertToNodes(nodes: Array<EditableNodeRecord>): Array<NodeRecord> {
    const deviceNodes: Array<NodeRecord> = [];

    for (const editableNode of nodes) {
        let plugin = get(protocolPlugins)[editableNode.protocol];

        let nodeConfig: BaseNodeConfig = convertToBaseNodeConfig(editableNode.config, isNumeric(editableNode));
        let protocolOptions: BaseNodeProtocolOptions = plugin.convertNodeProtocolOptionsToNormal(editableNode.protocol_options);

        const deviceNode: NodeRecord = {
            name: editableNode.name,
            device_id: editableNode.device_id,
            protocol: editableNode.protocol,
            config: nodeConfig,
            protocol_options: protocolOptions,
            attributes: editableNode.attributes,
        };

        deviceNodes.push(deviceNode);
    }

    return sortNodesLogically(deviceNodes) as Array<NodeRecord>;
}

/**
 * Processes and normalizes initial node data from the API.
 * @param nodes - Array of nodes to process and normalize.
 * @returns Array of processed and sorted NodeRecord objects.
 */
export function processInitialNodes(nodes: Array<NodeRecord>): Array<NodeRecord> {
    const deviceNodes: Array<NodeRecord> = nodes;
    return (sortNodesLogically(deviceNodes) as Array<NodeRecord>).map(normalizeNode);
}

/**
 * Initializes nodes configuration by converting to editable format with error handling.
 * @param initialNodes - Array of initial nodes to initialize.
 * @returns Object containing success status and converted editable nodes array.
 */
export function initNodes(initialNodes: Array<NodeRecord>): { sucess: boolean; editableNodes: Array<EditableNodeRecord> } {
    let editableNodes: Array<EditableNodeRecord> = [];
    let sucess = false;
    try {
        editableNodes = convertToEditableNodes(initialNodes);
        sucess = true;
    } catch (e) {
        showToast("initNodesError", AlertType.ALERT, { error: String(e) });
    }
    return { sucess, editableNodes };
}

/**
 * Creates a default editable node from variable definition and device configuration.
 * @param variable - Default variable information.
 * @param phase - Electrical phase for the node.
 * @param device_data - Device configuration data.
 * @returns EditableNodeRecord configured with defaults.
 */
function createDefaultEditableDeviceNode(variable: DefaultNodeInfo, phase: NodePhase, device_data: EditableDevice | NewDevice): EditableNodeRecord {
    const full_name = getNodePrefix(phase) + variable.name;

    let editableConfig = getEditableBaseNodeConfigFromDefaultVar(variable);
    let editableProtocolOptions = { ...variable.defaultProtocolOptions[device_data.protocol] };
    let attributes = {
        phase: phase,
    } as NodeAttributes;

    let node: EditableNodeRecord = {
        device_id: "id" in device_data ? device_data.id : undefined,
        name: full_name,
        protocol: device_data.protocol,
        config: editableConfig,
        protocol_options: editableProtocolOptions,
        attributes: attributes,
        display_name: variable.name,
        is_numeric: variable.isNumeric,
        validation: getInitialNodeValidation(device_data.protocol, editableProtocolOptions),
    };

    return node;
}

/**
 * Generates a list of default nodes based on device type (single-phase or three-phase).
 * @param device_data - Device configuration to determine which default nodes to create.
 * @returns Array of default editable nodes for the device type.
 */
export function getDefaultNodesList(device_data: EditableDevice | NewDevice): Array<EditableNodeRecord> {
    const nodes: Array<EditableNodeRecord> = [];
    const defaultVars = get(defaultVariables);

    if (device_data.type === MeterType.SINGLE_PHASE) {
        const singlePhaseVars = defaultVars.filter((v) => v.applicablePhases.includes(NodePhase.SINGLEPHASE) && v.useByDefault);

        for (const variable of singlePhaseVars) {
            nodes.push(createDefaultEditableDeviceNode(variable, NodePhase.SINGLEPHASE, device_data));
        }
    } else if (device_data.type === MeterType.THREE_PHASE) {
        const threePhaseeSections = nodePhaseSections.filter((section) => section.phase !== NodePhase.SINGLEPHASE);

        for (const section of threePhaseeSections) {
            const phaseVars = defaultVars.filter((v) => v.useByDefault && v.applicablePhases.includes(section.phase));

            for (const variable of phaseVars) {
                nodes.push(createDefaultEditableDeviceNode(variable, section.phase, device_data));
            }
        }
    }

    return sortNodesLogically(nodes) as Array<EditableNodeRecord>;
}

/**
 * Creates a new empty editable node for a specific phase and device configuration.
 * @param sectionPhase - The electrical phase for the new node.
 * @param sectionPrefix - The prefix to apply to the node name.
 * @param device_data - Device configuration data.
 * @returns A new empty EditableNodeRecord ready for configuration.
 */
export function addNode(sectionPhase: NodePhase, sectionPrefix: NodePrefix, device_data: EditableDevice | NewDevice): EditableNodeRecord {
    const nodeBaseName = ``;
    const fullNodeName = addPrefix(nodeBaseName, sectionPrefix);

    let plugin = get(protocolPlugins)[device_data.protocol];
    let newEditableConfig = { ...defaultBaseNodeConfig };
    let newProtocolOptions = { ...plugin.defaultNodeProtocolOptions };
    let newAttributes = {
        phase: sectionPhase,
    } as NodeAttributes;

    const newFormattedNode: EditableNodeRecord = {
        device_id: "id" in device_data ? device_data.id : undefined,
        name: fullNodeName,
        protocol: device_data.protocol,
        config: newEditableConfig,
        protocol_options: newProtocolOptions,
        attributes: newAttributes,
        display_name: nodeBaseName,
        is_numeric: typeIsNumeric(plugin.convertTypeToGeneric(newProtocolOptions)),
        validation: getInitialNodeValidation(device_data.protocol, newProtocolOptions),
    };

    return newFormattedNode;
}

/**
 * Processes raw node state data into UI-ready format with display components.
 * @param nodesState - Record of node names to their current state values.
 * @returns Array of processed node states ready for UI consumption.
 */
export function processNodesState(nodesState: Record<string, NodeState>): Array<ProcessedNodeState> {
    let processedNodesState: Array<ProcessedNodeState> = [];

    for (let [nodeName, nodeState] of Object.entries(nodesState)) {
        const processedName = removePrefix(nodeName);
        let category = getNodeCategory(nodeState.type, nodeState.is_counter);
        const displayComponent = getNodeRealTimeDisplayComponent(category);
        const graphType = getNodeLogGraphType(category);
        processedNodesState.push({ ...nodeState, name: processedName, displayComponent: displayComponent, graphType: graphType } as ProcessedNodeState);
    }

    return sortNodesLogically(processedNodesState) as Array<ProcessedNodeState>;
}

/**
 * Processes raw node logs into UI-ready format with converted timestamps and display components.
 * Converts ISO timestamps to Unix seconds for uPlot compatibility and adds appropriate graph/metrics components.
 * @param nodeLogs - Raw node logs with ISO timestamps and metadata
 * @returns Processed node logs with Unix timestamps and UI components for visualization
 */
export function processNodeLogs(nodeLogs: NodeLogs): ProcessedNodeLogs {
    let processedPoints: Array<ProcessedBaseLogPoint> = [];
    let category = getNodeCategory(nodeLogs.type, nodeLogs.is_counter);
    const graphType = getNodeLogGraphType(category);
    for (let point of nodeLogs.points) {
        const { start_time: start_time_str, end_time: end_time_str, ...logData } = point;

        let start_time = convertISOToTimestamp(start_time_str) / 1000;
        let end_time = convertISOToTimestamp(end_time_str) / 1000;

        let processedLog = {
            start_time: start_time,
            end_time: end_time,
            ...logData,
        } as ProcessedBaseLogPoint;

        processedPoints.push(processedLog);
    }

    return {
        unit: nodeLogs.unit,
        decimal_places: nodeLogs.decimal_places,
        type: nodeLogs.type,
        is_counter: nodeLogs.is_counter,
        time_step: nodeLogs.time_step,
        graphType: graphType,
        points: processedPoints,
        global_metrics: nodeLogs.global_metrics,
    } as ProcessedNodeLogs;
}

/**
 * Merges separate energy consumption data streams into unified log points with Unix timestamps.
 * Combines active energy, reactive energy, power factor, and power factor direction data into
 * single time-aligned data points for visualization and analysis.
 * @param energyLogs - Energy consumption data with separate streams for each metric type
 * @returns Object containing merged log points array and combined global metrics
 * @throws Error if the log point arrays have mismatched lengths
 */
export function mergeEnergyConsumptionLogs(energyLogs: EnergyConsumptionType): {
    mergedPoints: Array<ProcessedEnergyConsumptionLogPoint>;
    mergedGlobalMetrics: EnergyConsumptionMetrics;
} {
    let mergedPoints: Array<ProcessedEnergyConsumptionLogPoint> = [];
    let mergedGlobalMetrics: EnergyConsumptionMetrics;

    let active_energy_points = energyLogs.active_energy.points;
    let reactive_energy_points = energyLogs.reactive_energy.points;
    let pf_points = energyLogs.power_factor.points;
    let pf_direction_points = energyLogs.power_factor_direction.points;

    const allLengthsEqual =
        active_energy_points.length === reactive_energy_points.length &&
        reactive_energy_points.length === pf_points.length &&
        pf_points.length === pf_direction_points.length;

    if (!allLengthsEqual) {
        throw new Error("Energy consumption log points have mismatched lengths");
    }

    for (let i = 0; i < active_energy_points.length; i++) {
        const { start_time: start_time_str, end_time: end_time_str } = active_energy_points[i];
        let start_time = convertISOToTimestamp(start_time_str) / 1000;
        let end_time = convertISOToTimestamp(end_time_str) / 1000;

        let mergedPoint = {
            start_time: start_time,
            end_time: end_time,
            active_energy: (active_energy_points[i] as CounterLogPoint).value,
            reactive_energy: (reactive_energy_points[i] as CounterLogPoint).value,
            power_factor: (pf_points[i] as SingleValueLogPoint).value,
            power_factor_direction: (pf_direction_points[i] as SingleValueLogPoint).value,
        } as ProcessedEnergyConsumptionLogPoint;

        mergedPoints.push(mergedPoint);
    }

    mergedGlobalMetrics = {
        active_energy: (energyLogs.active_energy.global_metrics as CounterMetrics).value,
        reactive_energy: (energyLogs.reactive_energy.global_metrics as CounterMetrics).value,
        power_factor: (energyLogs.power_factor.global_metrics as SingleValueMetrics).value as number,
        power_factor_direction: (energyLogs.power_factor_direction.global_metrics as SingleValueMetrics).value as string,
    };

    return { mergedPoints, mergedGlobalMetrics };
}
