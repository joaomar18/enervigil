<script lang="ts">
    import { roundToDecimalPlaces } from "$lib/logic/util/generic";
    import Metrics from "../Metrics.svelte";
    import { getMetricsViewVariables } from "$lib/logic/view/nodes";
    import { NodeCategory } from "$lib/types/nodes/base";
    import type { CounterMetrics } from "$lib/types/nodes/logs";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;

    // Props
    export let metrics: CounterMetrics;
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
        if ("value" in metrics) metrics.value = roundToDecimalPlaces(metrics.value, decimalPlaces || 0);
    }

    $: if (metrics) {
        metricsVariables = getMetricsViewVariables(NodeCategory.Counters, metrics);
    }
</script>

<!--
    CounterMetrics Component
    
    A specialized wrapper component for displaying counter/accumulator node metrics with
    cumulative value tracking. Extends the base Metrics component with counter-specific
    configuration for single total value display, optional decimal rounding for cleaner
    presentation, and automatic mapping to counter category icons and text keys.
    Handles reactive metric transformation using getMetricsViewVariables for seamless
    integration with internationalization and theming. Provides consistent counter data
    presentation for energy meters, usage trackers, and other cumulative measurements.
-->
<Metrics {style} {dataFetched} {firstFetch} {metricsVariables} {unit} metricsCategory={NodeCategory.Counters} bind:previousCategory></Metrics>
