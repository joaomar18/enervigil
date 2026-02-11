<script lang="ts">
    import GraphDataToolTip from "../GraphDataToolTip.svelte";
    import type { CounterLogPoint } from "$lib/types/nodes/logs";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Props
    export let logPoint: CounterLogPoint | null;
    export let unit: string = "";

    // Variables
    let dataAvailable: boolean = false;

    // Reactive Statements
    $: dataAvailable = logPoint?.value !== null;
</script>

<!--
    CounterToolTip Component
    
    A specialized tooltip component for displaying counter/cumulative data points in graph overlays.
    Extends GraphDataToolTip with counter-specific data formatting, showing total values with
    appropriate units and conditional rendering based on data availability. Features automatic
    null value detection for data availability states and provides structured display of
    counter measurements with consistent typography and overflow handling. Integrates with
    internationalization for counter-specific labels and maintains theming consistency
    with the base GraphDataToolTip component.
-->
<GraphDataToolTip {logPoint} {dataAvailable}>
    {#if dataAvailable}
        <div class="row">
            <span class="label">{$texts.total}</span>
            <span class="value" class:remove-right-padding={!unit}>{logPoint?.value}</span>
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

    /* Counter label - Fixed width area for counter labels (Total, etc.) */
    .label {
        text-align: left;
        width: var(--label-width);
        font-size: var(--text-size);
        color: var(--label-color);
        font-weight: var(--label-weight);
    }

    /* Counter value - Flexible area for counter numeric data with ellipsis overflow */
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
