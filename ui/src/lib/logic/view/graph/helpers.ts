import uPlot from "uplot";
import { get } from "svelte/store";
import { GraphType } from "./base";
import MeasurementMetrics from "../../../../components/Devices/Nodes/Graphs/Metrics/Data/MeasurementMetrics.svelte"
import MeasurementToolTip from "../../../../components/Devices/Nodes/Graphs/Tooltips/Data/MeasurementToolTip.svelte";
import CounterMetrics from "../../../../components/Devices/Nodes/Graphs/Metrics/Data/CounterMetrics.svelte"
import CounterToolTip from "../../../../components/Devices/Nodes/Graphs/Tooltips/Data/CounterToolTip.svelte";
import { MeasurementGraphStyle, CounterGraphStyle, EnergyConsGraphStyle } from "$lib/style/graph";
import type { AlignedData } from "uplot";
import type { SvelteComponent } from "svelte";

/**
 * Extracts period start timestamps from aligned data for x-axis splits.
 * Filters even-indexed timestamps since data contains start/end pairs.
 * 
 * @param data - Aligned data array where data[0] contains timestamps
 * @returns Array of period start timestamps
 */
export function getGraphTimeSplits(data: AlignedData): Array<number> {
    const timestamps = data[0] as number[];
    const startsOnly = timestamps.filter((_, i) => i % 2 === 0);
    return startsOnly;
}

/**
 * Calculates graph dimensions based on container, data, and styling.
 * Width includes data width plus y-axis and padding; height from container.
 * 
 * @param graphContainer - Container element for height measurement
 * @param pxPerPeriod - Pixels per time period for width calculation
 * @param alignedData - Graph data for period count
 * @param style - Style object containing axis and padding dimensions
 * @returns Object with calculated width and height
 */
export function getGraphSize(graphContainer: HTMLElement, pxPerPeriod: number, alignedData: AlignedData, style: { [property: string]: string | number }): { width: number; height: number } {
    let containerWidth = 0;
    let containerHeight = 0;
    if (graphContainer) {
        const containerRect = graphContainer.getBoundingClientRect();
        containerHeight = containerRect.height;
        containerWidth = containerRect.width;
    }
    const splitsNumber = (getGraphTimeSplits(alignedData).length - 1)
    const splitsWidth = splitsNumber * pxPerPeriod;
    const extraWidth = parseInt(String(style.yAxisWidth)) + parseInt(String(style.graphPaddingLeft)) + parseInt(String(style.graphPaddingRight));
    let dataWidth = splitsWidth + extraWidth;
    let finalWidth;

    if (dataWidth > containerWidth) {
        finalWidth = dataWidth;
    }
    else {
        if ((containerWidth - extraWidth) / splitsNumber > Number(style.graphPeriodWidthMaxPx)) {
            finalWidth = splitsNumber * Number(style.graphPeriodWidthMaxPx) + extraWidth;
        }
        else {
            finalWidth = containerWidth;
        }
    }

    return { width: finalWidth, height: containerHeight };
}

/**
 * Creates a y-axis formatter that trims trailing zeros and removes duplicate labels.
 * Returns a function for uPlot to format y-axis tick values cleanly.
 * 
 * @returns Formatter function that takes uPlot instance and splits, returns formatted labels
 */
export function yAxisValuesFormatter(): (u: uPlot, splits: number[]) => string[] {
    return (u: uPlot, splits: number[]): string[] => {
        const nums = (splits || []) as number[];
        if (nums.length === 0) return [];

        // Trim zeros
        const fmt = (v: number) => {
            let s = String(v);
            if (s.includes('.')) {
                while (s.endsWith('0')) s = s.slice(0, -1);
                if (s.endsWith('.')) s = s.slice(0, -1);
            }
            return s;
        };

        // Removes duplicates
        const out: string[] = [];
        let prev: string | null = null;
        for (let i = 0; i < nums.length; i++) {
            const label = fmt(nums[i]);
            if (label === prev) out.push("");
            else {
                out.push(label);
                prev = label;
            }
        }
        return out;
    };
}

/**
 * Returns the appropriate tooltip component for the given graph type.
 * 
 * @param graphType - The type of graph
 * @returns Svelte component constructor for the tooltip
 */
export function getGraphToolTipDisplayComponent(graphType: GraphType): typeof SvelteComponent<any> {
    switch (graphType) {
        case GraphType.Measurement:
            return MeasurementToolTip;
        case GraphType.Counter:
            return CounterToolTip;
        case GraphType.EnergyConsumption: // TO DO
            throw new Error(`Energy Consumption Graph needs an external implementation.`);
    }
}

/**
 * Returns the appropriate metrics component for the given graph type.
 * 
 * @param graphType - The type of graph
 * @returns Svelte component constructor for the metrics display
 */
export function getGraphMetricsComponent(graphType: GraphType): typeof SvelteComponent<any> {
    switch (graphType) {
        case GraphType.Measurement:
            return MeasurementMetrics;
        case GraphType.Counter:
            return CounterMetrics;
        case GraphType.EnergyConsumption: // TO DO
            return CounterMetrics;
    }
}

/**
 * Returns the appropriate style configuration for the given graph type.
 * Retrieves reactive style values from Svelte stores for graph theming.
 * 
 * @param graphType - The type of graph (Measurement or Counter)
 * @returns Style object containing CSS properties and values for the graph type
 */
export function getGraphStyle(graphType: GraphType): { [property: string]: string | number } {
    const styleMap = {
        [GraphType.Measurement]: get(MeasurementGraphStyle),
        [GraphType.Counter]: get(CounterGraphStyle),
        [GraphType.EnergyConsumption]: get(EnergyConsGraphStyle),
    };
    return styleMap[graphType];
}