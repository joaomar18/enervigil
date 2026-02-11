<script lang="ts">
    import { roundToDecimalPlaces } from "$lib/logic/util/generic";
    import GraphDataToolTip from "../GraphDataToolTip.svelte";
    import { getPowerFactorDirectionString } from "$lib/logic/util/energy";
    import type { EnergyConsumptionLogPoint } from "$lib/types/nodes/logs";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Props
    export let logPoint: EnergyConsumptionLogPoint | null;
    export let activeEnergyUnit: string = "";
    export let reactiveEnergyUnit: string = "";

    // Variables
    let dataAvailable: boolean = false;
    let pfDirectionStr: string = "";

    // Reactive Statements
    $: dataAvailable = logPoint?.active_energy !== null || logPoint?.reactive_energy !== null;
    $: if (logPoint?.power_factor_direction) {
        pfDirectionStr = getPowerFactorDirectionString(logPoint?.power_factor_direction);
    }
</script>

<!--
    EnergyConsToolTip - Energy consumption graph hover tooltip
    
    Displays active energy, reactive energy, and power factor values for a specific
    data point when hovering over the energy consumption graph. Handles null values,
    shows directional indicators for power factor (capacitive/inductive), and displays
    "Not valid" for zero-energy conditions.
-->
<GraphDataToolTip {logPoint} {dataAvailable}>
    {#if dataAvailable}
        {#if logPoint?.active_energy !== null}
            <div class="row">
                <span class="label">{$texts.activeEnergyValueShort}</span>
                <span class="value" class:remove-right-padding={!activeEnergyUnit}>{logPoint?.active_energy}</span>
                <span class="unit">{activeEnergyUnit}</span>
            </div>
        {:else}
            <div class="row">
                <span class="label">{$texts.activeEnergyValueShort}</span>
                <span class="value no-data-label remove-right-padding">{$texts.noDataAvailableShort}</span>
            </div>
        {/if}
        {#if logPoint?.reactive_energy !== null}
            <div class="row">
                <span class="label">{$texts.reactiveEnergyValueShort}</span>
                <span class="value" class:remove-right-padding={!reactiveEnergyUnit}>{logPoint?.reactive_energy}</span>
                <span class="unit">{reactiveEnergyUnit}</span>
            </div>
        {:else}
            <div class="row">
                <span class="label">{$texts.reactiveEnergyValueShort}</span>
                <span class="value no-data-label remove-right-padding">{$texts.noDataAvailableShort}</span>
            </div>
        {/if}
        {#if logPoint?.power_factor !== null}
            <div class="row">
                <span class="label">{$texts.powerFactorValueShort}</span>
                <span class="value remove-right-padding">{logPoint?.power_factor}{pfDirectionStr}</span>
            </div>
        {:else if logPoint?.active_energy == 0 && logPoint?.reactive_energy == 0}
            <div class="row">
                <span class="label">{$texts.powerFactorValueShort}</span>
                <span class="value no-data-label remove-right-padding">{$texts.notValid}</span>
            </div>
        {:else}
            <div class="row">
                <span class="label">{$texts.powerFactorValueShort}</span>
                <span class="value no-data-label remove-right-padding">{$texts.noDataAvailableShort}</span>
            </div>
        {/if}
    {/if}
</GraphDataToolTip>

<style>
    /* Data row - Horizontal layout for label, value, and unit triplets in tooltip */
    .row {
        width: 100%;
        height: fit-content;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    /* Measurement label - Fixed width for abbreviated metric names (Ea, Er, Fp) */
    .label {
        text-align: left;
        width: var(--label-width);
        font-size: var(--text-size);
        color: var(--label-color);
        font-weight: var(--label-weight);
    }

    /* Measurement value - Flexible numeric display with ellipsis for long decimals */
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

    /* No-data state modifier - Dimmed styling for null/unavailable measurements */
    .value.no-data-label {
        color: var(--no-data-label-color);
        font-weight: var(--no-data-label-weight);
    }

    /* Padding removal modifier - Applied when unit is empty to prevent spacing gap */
    .value.remove-right-padding {
        padding-right: 0;
    }

    /* Unit display - Right-aligned measurement unit (kWh, VArh) with overflow handling */
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
