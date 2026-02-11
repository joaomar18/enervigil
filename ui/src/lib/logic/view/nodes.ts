import { NodeCategory, NodeType } from "$lib/types/nodes/base";
import { GraphType } from "./graph/base";
import { logsDisplayGraphTypeMap, realTimeDisplayComponentMap } from "$lib/types/view/device";
import { metricsTextKeyMap } from "$lib/types/view/nodes";
import type { SvelteComponent } from "svelte";
import type { BaseMetrics } from "$lib/types/nodes/logs";

/**
 * Determines the category of a node based on its type and incremental flag.
 * @param nodeType - The data type of the node (FLOAT, INT, BOOL, STRING)
 * @param counterNode - Whether the node is of counter type
 * @returns The appropriate node category for UI organization
 */
export function getNodeCategory(nodeType: NodeType, counterNode: boolean): NodeCategory {
    let category: NodeCategory;
    if (nodeType === NodeType.FLOAT || nodeType === NodeType.INT) {
        if (counterNode) {
            category = NodeCategory.Counters;
        } else {
            category = NodeCategory.Measurements;
        }
    } else if (nodeType === NodeType.BOOL) {
        category = NodeCategory.States;
    } else if (nodeType === NodeType.STRING) {
        category = NodeCategory.Texts;
    } else {
        category = NodeCategory.Other;
    }

    return category;
}

/**
 * Retrieves the appropriate Svelte component for displaying real-time node values.
 * @param category - The node category to get the display component for
 * @returns Svelte component class for rendering real-time node data
 * @throws Error if no component is mapped for the given category
 */
export function getNodeRealTimeDisplayComponent(category: NodeCategory): typeof SvelteComponent<any> {
    const component = realTimeDisplayComponentMap[category];
    if (!component) {
        throw new Error(`${category} category real time component is not implemented.`);
    }

    return component;
}

/**
 * Retrieves the appropriate graph type for displaying historical node log data.
 * @param category - The node category to get the graph type for
 * @returns GraphType identifier for rendering the appropriate chart visualization, or null if no graph type is mapped
 */
export function getNodeLogGraphType(category: NodeCategory): GraphType | null {
    let component = logsDisplayGraphTypeMap[category];
    return component;
}

/**
 * Transforms metrics data into view-ready format with internationalization keys and icons.
 * Maps raw metric values to UI display configuration using metricsTextKeyMap for the given category.
 * 
 * @param category - The node category to determine appropriate metric display mappings
 * @param metrics - The metrics object containing measurement or counter values to transform
 * @returns Record mapping metric keys to display objects with textKey for i18n labels, imageFile for icons, and metric values
 */
export function getMetricsViewVariables(category: NodeCategory, metrics: BaseMetrics): Record<string, { textKey: string; imageFile: string; value: any }> {
    let output: Record<string, { textKey: string; imageFile: string; value: any }> = {};

    Object.entries(metricsTextKeyMap[category]).forEach(([key, value]) => {
        let metricValue = key in metrics ? (metrics as any)[key] : null;
        output[key] = ({ textKey: value.textKey, imageFile: value.imageFile, value: metricValue });
    });

    return output;
}