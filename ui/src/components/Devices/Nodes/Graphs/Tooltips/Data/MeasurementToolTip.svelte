<script lang="ts">
    import GraphDataToolTip from "../GraphDataToolTip.svelte";
    import type { MeasurementLogPoint } from "$lib/types/nodes/logs";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Props
    export let logPoint: MeasurementLogPoint | null;
    export let unit: string = "";

    // Variables
    let dataAvailable: boolean = false;
    
    // Reactive Statements
    $: dataAvailable = logPoint?.average_value !== null && logPoint?.min_value !== null && logPoint?.max_value !== null;
</script>

<!--
    MeasurementToolTip Component
    
    A specialized tooltip component for displaying measurement data points with statistical
    aggregations in graph overlays. Extends GraphDataToolTip with measurement-specific
    formatting, showing maximum, average, and minimum values with appropriate units.
    Features comprehensive null value validation across all measurement fields for data
    availability detection and provides structured display of statistical measurement
    data with consistent typography and overflow handling. Integrates with internationalization
    for measurement-specific labels (Máx, Méd, Mín) and maintains theming consistency
    with the base GraphDataToolTip component.
-->
<GraphDataToolTip {logPoint} {dataAvailable}>
    {#if dataAvailable}
        <div class="row">
            <span class="label">{$texts.maxValueShort}</span>
            <span class="value" class:remove-right-padding={!unit}>{logPoint?.max_value}</span>
            <span class="unit">{unit}</span>
        </div>
        <div class="row">
            <span class="label">{$texts.averageValueShort}</span>
            <span class="value" class:remove-right-padding={!unit}>{logPoint?.average_value}</span>
            <span class="unit">{unit}</span>
        </div>
        <div class="row">
            <span class="label">{$texts.minValueShort}</span>
            <span class="value" class:remove-right-padding={!unit}>{logPoint?.min_value}</span>
            <span class="unit">{unit}</span>
        </div>
    {/if}
</GraphDataToolTip>

<style>
    /* Data row - Horizontal layout for label, value, and unit triplets */
    .row {
        width: 100%;
        height: fit-content;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    /* Measurement label - Fixed width area for abbreviated labels (Máx, Méd, Mín) */
    .label {
        text-align: left;
        width: var(--label-width);
        font-size: var(--text-size);
        color: var(--label-color);
        font-weight: var(--label-weight);
    }

    /* Measurement value - Flexible area for numeric data with ellipsis overflow */
    .value {
        min-width: 0;
        padding: 0;
        padding-right: var(--value-right-padding);
        flex: 1;
        text-align: right;
        font-size: var(--text-size);
        color: var(--value-color);
        font-weight: var(--value-weight);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Remove right padding when the unit is empty */
    .value.remove-right-padding {
        padding-right: 0;
    }

    /* Unit display - Right-aligned area for measurement units with ellipsis overflow */
    .unit {
        width: fit-content;
        max-width: var(--unit-max-width);
        text-align: right;
        font-size: var(--text-size);
        color: var(--unit-color);
        font-weight: var(--unit-weight);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
