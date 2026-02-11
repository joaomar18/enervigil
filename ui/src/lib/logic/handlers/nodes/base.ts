import { get } from "svelte/store";
import { Protocol } from "$lib/types/device/base";
import { NodePhase, NodeType } from "$lib/types/nodes/base";
import {
    getNodePhasePriority,
    getNodePriority,
    getNodeSubPriority,
    isDefault,
    isCustom,
    isCounter,
    isNumeric,
    removePrefix,
    getNodePrefix,
    getNodeIndex,
    getNodePhaseFromRecordOrState,
} from "../../util/nodes";
import { defaultVariables } from "$lib/stores/device/variables";
import { protocolPlugins } from "$lib/stores/device/protocol";
import { nodePhaseSections } from "$lib/types/nodes/base";
import {
    type NodeRecordEditingState,
    type EditableNodeRecord,
    type NodeRecord,
    defaultNoProtocolNodeOptions,
} from "$lib/types/nodes/config";
import type { ProcessedNodeState } from "$lib/types/nodes/realtime";

/**
 * Sorts nodes logically by phase, type, incremental status, and variable groups for consistent UI display.
 * @param nodes - Array of nodes to sort (supports EditableNodeRecord, NodeRecord, or ProcessedNodeState).
 * @returns Sorted array maintaining the same type as input.
 */
export function sortNodesLogically(
    nodes: Array<EditableNodeRecord | NodeRecord | ProcessedNodeState>
): Array<EditableNodeRecord | NodeRecord | ProcessedNodeState> {
    return nodes.slice().sort((a, b) => {
        // Priority is organized from top to bottom

        // Phase order (higher priority)
        const phaseA = getNodePhasePriority(getNodePhaseFromRecordOrState(a));
        const phaseB = getNodePhasePriority(getNodePhaseFromRecordOrState(b));
        if (phaseA !== phaseB) return phaseA - phaseB;

        // Non-incremental numeric types (default nodes first)
        if (isDefault(a) && !isDefault(b)) return -1;
        if (!isDefault(a) && isDefault(b)) return 1;

        // Custom nodes after default nodes
        if (isCustom(a) && !isCustom(b)) return 1;
        if (!isCustom(a) && isCustom(b)) return -1;

        // Non-incremental numeric before non-incremental non-numeric
        if (!isCounter(a) && isNumeric(a) && !isCounter(b) && !isNumeric(b)) return -1;
        if (!isCounter(a) && !isNumeric(a) && !isCounter(b) && isNumeric(b)) return 1;

        // Incremental nodes after non-incremental
        if (isCounter(a) && !isCounter(b)) return 1;
        if (!isCounter(a) && isCounter(b)) return -1;

        // Grouping (power, energy, power factor)
        const groupA = getNodePriority(a.name);
        const groupB = getNodePriority(b.name);
        if (groupA !== groupB) return groupA - groupB;

        // Subgroup (active, reactive, apparent)
        const subA = getNodeSubPriority(a.name);
        const subB = getNodeSubPriority(b.name);
        if (subA !== subB) return subA - subB;

        // Within incremental, apply same grouping
        if (isCounter(a) && isCounter(b)) {
            if (groupA !== groupB) return groupA - groupB;
            if (subA !== subB) return subA - subB;
        }

        // Fallback: alphabetical by name (without prefix)
        return removePrefix(a.name).localeCompare(removePrefix(b.name));
    });
}

/**
 * Handles node name changes by updating the full name with correct prefix and unit.
 * @param node - The editable node to update.
 * @param phase - The electrical phase to determine the correct prefix.
 */
export function nodeNameChange(node: EditableNodeRecord, phase: NodePhase): void {
    const newName = getNodePrefix(phase) + node.display_name;
    const currentDefaultVariables = get(defaultVariables);
    node.name = newName;
    if (!node.config.custom) {
        const defaultNodeProps = Object.values(currentDefaultVariables).find((v) => v.name === node.display_name);
        node.config.unit = defaultNodeProps?.defaultUnit || "";
    }
}

/**
 * Handles changes to custom status by updating node name and unit configuration.
 * @param node - The editable node to update.
 * @param nodeState - Previous editing state to store/restore values.
 * @param phase - The electrical phase to determine the correct prefix.
 */
export function customNodeChange(node: EditableNodeRecord, nodeState: NodeRecordEditingState, phase: NodePhase): void {
    if (node.config.custom) {
        nodeState.oldVariableName = node.display_name;
        nodeState.oldVariableUnit = node.config.unit;
        node.display_name = "";
        node.config.unit = "";
    } else {
        node.display_name = nodeState.oldVariableName;
        node.config.unit = nodeState.oldVariableUnit;
    }
    node.name = getNodePrefix(phase) + node.display_name;
}

/**
 * Handles updates required when a node's type changes.
 *
 * Re-evaluates whether the node is numeric and clears any configuration
 * options that are only valid for numeric nodes. Additionally, resets
 * decimal precision when the underlying protocol type is not a float.
 *
 * This ensures the node configuration remains consistent and valid
 * after a type change.
 *
 * @param {EditableNodeRecord} node - The editable node whose type has changed.
 */
export function nodeTypeChange(node: EditableNodeRecord, nodeState: NodeRecordEditingState): void {
    let nodeIsNumeric = isNumeric(node);
    let plugin = get(protocolPlugins)[node.protocol];
    if (!nodeIsNumeric) {
        node.config.logging = false;
        node.config.min_alarm = false;
        node.config.max_alarm = false;
        node.config.min_alarm_value = "";
        node.config.max_alarm_value = "";
        node.config.unit = "";
    }
    if (plugin.convertTypeToGeneric(node.protocol_options) !== NodeType.FLOAT) {
        node.config.decimal_places = "";
    }
    nodeState.oldProtocolOptions = { ...node.protocol_options };
    node.is_numeric = nodeIsNumeric;
}

/**
 * Handles transitions between physical and virtual (calculated) node modes.
 *
 * When a node is set to virtual, its protocol is switched to `Protocol.NONE`,
 * protocol-specific options are replaced with default no-protocol options,
 * and the node type is converted to a generic type understood by the
 * no-protocol plugin.
 *
 * When reverting to a physical node, the previously selected protocol is
 * restored and its default protocol options are applied.
 *
 * The node's numeric state is recalculated after the transition.
 *
 * @function virtualNodeChange
 * @param {EditableNodeRecord} node - The node being updated.
 * @param {NodeRecordEditingState} nodeState - Editing state used during protocol type conversion.
 * @param {Protocol} selectedProtocol - The protocol to restore when leaving virtual mode.
 * @returns {void}
 */
export function virtualNodeChange(node: EditableNodeRecord, nodeState: NodeRecordEditingState, selectedProtocol: Protocol): void {
    let plugin = get(protocolPlugins)[selectedProtocol];
    if (node.config.calculated) {
        let noProtocolPlugin = get(protocolPlugins)[Protocol.NONE];
        let newType = plugin.convertTypeToGeneric(node.protocol_options);
        node.protocol = Protocol.NONE;
        node.protocol_options = { ...defaultNoProtocolNodeOptions };
        noProtocolPlugin.setProtocolType(node, newType, nodeState);
    } else {
        node.protocol = selectedProtocol;
        node.protocol_options = { ...plugin.defaultNodeProtocolOptions };
    }
    node.is_numeric = isNumeric(node);
}

/**
 * Updates a node's protocol and resets its protocol-specific configuration
 * to the default options defined by the corresponding protocol plugin.
 * Used when a user selects a new communication protocol from the UI.
 *
 * @function changeNodeProtocol
 * @param {Protocol} protocol - The newly selected protocol.
 * @param {EditableNodeRecord} node - The node whose protocol and options are being updated.
 * @returns {void}
 */
export function changeNodeProtocol(protocol: Protocol, node: EditableNodeRecord): void {
    let plugin = get(protocolPlugins)[protocol];
    node.protocol = protocol;
    node.protocol_options = { ...plugin.defaultNodeProtocolOptions };
    node.is_numeric = isNumeric(node);
}

/**
 * Updates a specific node in the nodes array and returns a new array with the changes.
 * @param node - The node with updated data to replace in the array.
 * @param nodes - The array of nodes to update.
 * @returns New array with the updated node, maintaining immutability.
 */
export function updateNodes(node: EditableNodeRecord, nodes: Array<EditableNodeRecord>): Array<EditableNodeRecord> {
    const editNodesIndex = getNodeIndex(node, nodes);
    let newNodes = nodes;
    if (editNodesIndex !== -1) {
        newNodes[editNodesIndex] = node;
    }
    return [...newNodes];
}

/**
 * Groups nodes by their respective electrical phase sections for organized display.
 * @param meterType - Type of meter to determine which phase sections to include.
 * @param nodes - Array of nodes to group by phase sections.
 * @returns Record with nodes organized by phase sections (L1, L2, L3, Total, etc.).
 */
export function updateNodesBySection(nodes: Array<EditableNodeRecord>): Record<NodePhase, Array<EditableNodeRecord>> {
    return nodePhaseSections.reduce((acc: Record<NodePhase, Array<EditableNodeRecord>>, section) => {
        acc[section.key] = nodes.filter((node) => section.filter(node.attributes.phase));
        return acc;
    }, {} as Record<NodePhase, Array<EditableNodeRecord>>);
}

/**
 * Updates the editing node reference if it matches the updated node in the array.
 * @param node - The node that was updated.
 * @param editingNode - The currently active editing node reference.
 * @param nodes - Array of all nodes to find the updated reference.
 * @returns Updated editing node reference or the original if no match found.
 */
export function updateEditingNode(node: EditableNodeRecord, editingNode: EditableNodeRecord, nodes: Array<EditableNodeRecord>): EditableNodeRecord {
    const editNodesIndex = getNodeIndex(node, nodes);
    let newEditingNode = editingNode;
    if (editNodesIndex !== -1 && getNodeIndex(editingNode, nodes) === editNodesIndex) {
        newEditingNode = nodes[editNodesIndex];
    }
    return newEditingNode;
}

/**
 * Removes a specific node from the nodes array and returns a new array without it.
 * @param node - The node to delete from the array.
 * @param nodes - Array of nodes to delete from.
 * @returns New array with the specified node removed, maintaining immutability.
 */
export function deleteNodeFromArray(node: EditableNodeRecord, nodes: Array<EditableNodeRecord>): Array<EditableNodeRecord> {
    let deletedNodeIndex = getNodeIndex(node, nodes);
    let newNodes: Array<EditableNodeRecord> = [...nodes];
    if (deletedNodeIndex !== -1) {
        newNodes = [...newNodes.slice(0, deletedNodeIndex), ...newNodes.slice(deletedNodeIndex + 1)];
    }
    return newNodes;
}
