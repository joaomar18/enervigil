<script lang="ts">
    import { roundToDecimalPlaces } from "$lib/logic/util/generic";
    import Metrics from "../Metrics.svelte";
    import { getMetricsViewVariables } from "$lib/logic/view/nodes";
    import { NodeCategory } from "$lib/types/nodes/base";
    import type { MeasurementMetrics } from "$lib/types/nodes/logs";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;

    // Props
    export let metrics: MeasurementMetrics;
    export let previousCategory: NodeCategory | undefined;
    export let unit: string = "";
    export let decimalPlaces: number | null;
    export let dataFetched: boolean;
    export let firstFetch: boolean;
    export let roundMetrics: boolean = false;

    // Variables
    let metricsVariables: Record<string, { textKey: string; imageFile: string; value: any }>;

    // Reactive Statements
    $: if (metrics && roundMetrics) {
        if ("min_value" in metrics) metrics.min_value = roundToDecimalPlaces(metrics.min_value, decimalPlaces || 0);
        if ("max_value" in metrics) metrics.max_value = roundToDecimalPlaces(metrics.max_value, decimalPlaces || 0);
        if ("average_value" in metrics) metrics.average_value = roundToDecimalPlaces(metrics.average_value, decimalPlaces || 0);
    }

    $: if (metrics) {
        metricsVariables = getMetricsViewVariables(NodeCategory.Measurements, metrics);
    }
</script>

<!--
    MeasurementMetrics Component
    
    A specialized wrapper component for displaying measurement node metrics with statistical
    aggregations (minimum, maximum, average values). Extends the base Metrics component with
    measurement-specific configuration including proper label width for statistical terms,
    optional decimal rounding for cleaner display, and automatic mapping to measurement
    category icons and text keys. Handles reactive metric transformation using 
    getMetricsViewVariables for seamless integration with internationalization and theming.
    Provides consistent measurement data presentation across the application.
-->
<Metrics {style} labelWidth="150px" {dataFetched} {firstFetch} {metricsVariables} {unit} metricsCategory={NodeCategory.Measurements} bind:previousCategory
></Metrics>
