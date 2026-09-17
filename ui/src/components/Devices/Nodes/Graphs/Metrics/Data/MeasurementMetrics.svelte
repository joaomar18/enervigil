<script lang="ts">
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
    export let isDefaultVariable: boolean = false;

    // Variables
    let metricsVariables: Record<string, { textKey: string; imageFile: string; value: any }>;

    // Reactive Statements
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
<Metrics {style} labelWidth="150px" {dataFetched} {firstFetch} {metricsVariables} {unit} {isDefaultVariable} {decimalPlaces} {roundMetrics} metricsCategory={NodeCategory.Measurements} bind:previousCategory
></Metrics>
