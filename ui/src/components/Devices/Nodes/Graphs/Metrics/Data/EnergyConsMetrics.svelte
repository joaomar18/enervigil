<script lang="ts">
    import InlineLoader from "../../../../../General/InlineLoader.svelte";
    import { getPowerFactorDirectionString } from "$lib/logic/util/energy";
    import type { EnergyConsumptionMetrics } from "$lib/types/nodes/logs";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Styles
    import { EnergyConsMetricStyle } from "$lib/style/graph";
    import { onDestroy, onMount } from "svelte";
    import { roundToDecimalPlaces } from "$lib/logic/util/generic";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $EnergyConsMetricStyle;

    // Props
    export let metrics: EnergyConsumptionMetrics | undefined;
    export let roundMetrics: boolean = false;
    export let activeEnergyUnit: string = "";
    export let reactiveEnergyUnit: string = "";
    export let activeEnergyDecimalPlaces: number | null = null;
    export let reactiveEnergyDecimalPlaces: number | null = null;
    export let powerFactorDecimalPlaces: number | null = null;
    export let dataFetched: boolean;
    export let firstFetch: boolean;
    export let metricsTimeoutMs: number = 1000;

    // Variables
    let showLoader = false;
    let colStackWidthReached = false;
    let forceColStack = false;
    let desktopView = false;
    let colStack = false;
    let loaderTimeout: number | null = null;
    let numberOfVariables: number;
    let containerEl: HTMLDivElement;
    let pfDirectionStr: string = "";

    // Reactive Statements
    $: forceColStack = String(effectiveStyle.forceCollapse) === "TRUE";
    $: desktopView = String(effectiveStyle.desktopView) === "TRUE";
    $: colStack = forceColStack || colStackWidthReached;
    $: numberOfVariables = 3;

    $: if (metrics && roundMetrics) {
        if ("active_energy" in metrics) metrics.active_energy = roundToDecimalPlaces(metrics.active_energy, activeEnergyDecimalPlaces || 0);
        if ("reactive_energy" in metrics) metrics.reactive_energy = roundToDecimalPlaces(metrics.reactive_energy, reactiveEnergyDecimalPlaces || 0);
        if ("power_factor" in metrics) metrics.power_factor = roundToDecimalPlaces(metrics.power_factor, powerFactorDecimalPlaces || 0);
    }

    $: if (metrics?.power_factor_direction) {
        pfDirectionStr = getPowerFactorDirectionString(metrics?.power_factor_direction);
    }

    $: if (!dataFetched && !showLoader) {
        if (firstFetch) {
            loaderTimeout = setTimeout(() => {
                showLoader = !dataFetched;
            }, metricsTimeoutMs);
        } else {
            showLoader = true;
        }
    }
    $: if (dataFetched) {
        if (loaderTimeout) {
            clearInterval(loaderTimeout);
            loaderTimeout = null;
        }
        showLoader = false;
    }

    $: if (containerEl) {
        requestAnimationFrame(() => handleColumnStack());
    }

    // Functions
    function handleColumnStack(): void {
        if (containerEl && numberOfVariables) {
            colStackWidthReached = containerEl.offsetWidth < parseInt(String(effectiveStyle.rowWidth)) * numberOfVariables;
        }
    }

    onMount(() => {
        window.addEventListener("resize", handleColumnStack);
    });

    onDestroy(() => {
        window.removeEventListener("resize", handleColumnStack);
    });
</script>

<!--
    EnergyConsMetrics - Energy consumption metrics display component
    
    Shows active energy, reactive energy, and power factor metrics with icons, labels,
    values, and units. Supports responsive column/row layouts, desktop/mobile views,
    loading states, and automatic rounding based on decimal precision settings.
-->
<div
    style="
        --desktop-content-padding-top: {effectiveStyle.desktopContentPaddingTop};
        --desktop-row-padding-top: {effectiveStyle.desktopRowPaddingTop};
        --icon-size: {effectiveStyle.iconSize};
        --text-size: {effectiveStyle.textSize};
        --row-width: {effectiveStyle.rowWidth};
        --row-padding-left: {effectiveStyle.rowPaddingLeft};
        --row-padding-right: {effectiveStyle.rowPaddingRight};
        --row-border-right: {effectiveStyle.rowBorderRight};
        --row-border-bottom: {effectiveStyle.rowBorderBottom};
        --label-width: {effectiveStyle.labelWidth};
        --label-padding-left: {effectiveStyle.labelPaddingLeft};
        --label-color: {effectiveStyle.labelColor};
        --label-weight: {effectiveStyle.labelWeight};
        --value-right-padding: {effectiveStyle.valueRightPadding};
        --value-color: {effectiveStyle.valueColor};
        --value-weight: {effectiveStyle.valueWeight};
        --unit-max-width: {effectiveStyle.unitMaxWidth};
        --unit-color: {effectiveStyle.unitColor};
        --unit-weight: {effectiveStyle.unitWeight};
        --no-data-label-color: {effectiveStyle.noDataLabelColor};
        --no-data-label-weight: {effectiveStyle.noDataLabelWeight};
        --number-variables: {numberOfVariables};
    "
    bind:this={containerEl}
    class="container"
    class:col-stack={colStack}
>
    <div class="content" class:desktop={desktopView}>
        <div class="row">
            <div class="identifier">
                <img class="icon" src="/img/active-energy.svg" alt="Active energy" />
                <span class="label">{$texts.activeEnergyValue} ({$texts.activeEnergyValueShort})</span>
            </div>
            <div class="request-content">
                <InlineLoader loaded={!showLoader}>
                    <div class="loader-div">
                        {#if metrics && "active_energy" in metrics}
                            {#if metrics.active_energy !== null}
                                <span class="value">{metrics.active_energy}</span>
                                <span class="unit">{activeEnergyUnit}</span>
                            {:else}
                                <span class="no-data-label">{$texts.noDataAvailableShort}</span>
                            {/if}
                        {/if}
                    </div>
                </InlineLoader>
            </div>
        </div>
        <div class="row">
            <div class="identifier">
                <img class="icon" src="/img/reactive-energy.svg" alt="Reactive energy" />
                <span class="label">{$texts.reactiveEnergyValue} ({$texts.reactiveEnergyValueShort})</span>
            </div>
            <div class="request-content">
                <InlineLoader loaded={!showLoader}>
                    <div class="loader-div">
                        {#if metrics && "reactive_energy" in metrics}
                            {#if metrics.reactive_energy !== null}
                                <span class="value">{metrics.reactive_energy}</span>
                                <span class="unit">{reactiveEnergyUnit}</span>
                            {:else}
                                <span class="no-data-label">{$texts.noDataAvailableShort}</span>
                            {/if}
                        {/if}
                    </div>
                </InlineLoader>
            </div>
        </div>
        <div class="row">
            <div class="identifier">
                <img class="icon" src="/img/power-factor.svg" alt="Power Factor" />
                <span class="label">{$texts.powerFactorValue} ({$texts.powerFactorValueShort})</span>
            </div>
            <div class="request-content">
                <InlineLoader loaded={!showLoader}>
                    <div class="loader-div">
                        {#if metrics && "power_factor" in metrics && "power_factor_direction" in metrics}
                            {#if metrics.power_factor !== null}
                                <span class="value">{metrics.power_factor}{pfDirectionStr}</span>
                            {:else if metrics.active_energy == 0 && metrics.reactive_energy == 0}
                                <span class="no-data-label">{$texts.invalid}</span>
                            {:else}
                                <span class="no-data-label">{$texts.noDataAvailableShort}</span>
                            {/if}
                        {/if}
                    </div>
                </InlineLoader>
            </div>
        </div>
    </div>
</div>

<style>
    /* Main container - Root wrapper for all metric rows */
    .container {
        margin: 0;
        padding: 0;
        width: 100%;
        height: fit-content;
    }

    /* Column stack layout - Vertical stacking for narrow viewports or forced collapse */
    .container.col-stack {
        .content {
            flex-direction: column;
            align-items: start;
            gap: 15px;
        }
        .content.desktop {
            gap: 0px;
        }

        .row {
            width: 100%;
            padding-left: 0;
            padding-right: 0;
            border-right: none;
        }
    }

    /* Content wrapper - Flex container for metric rows with responsive direction */
    .content {
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
    }

    /* Metric row - Individual stat display with icon, label, value, and unit */
    .content .row {
        box-sizing: border-box;
        margin: 0;
        width: var(--row-width);
        padding-left: var(--row-padding-left);
        padding-right: var(--row-padding-right);
        border-right: var(--row-border-right);
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    /* Desktop row layout - Vertical column layout with bottom borders */
    .content.desktop .row {
        flex-direction: column;
        justify-content: start;
        align-items: center;
        border-bottom: var(--row-border-bottom);
        padding-top: var(--desktop-row-padding-top);
    }

    /* Remove left and top padding from the first row child */
    .content .row:first-child {
        padding-top: 0;
        padding-left: 0;
    }

    /* Remove border and padding right from last row - Prevents trailing divider */
    .content .row:last-child {
        padding-right: 0;
        border-right: none;
    }

    /* Metric identifier section - Container for icon and label */
    .content .row .identifier {
        width: fit-content;
        height: fit-content;
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
    }

    /* Desktop identifier - Full-width identifier for desktop layout */
    .content.desktop .row .identifier {
        width: 100%;
    }

    /* Metric icon - Visual indicator for metric type (varies by node category) */
    .content .row .identifier .icon {
        width: var(--icon-size);
        height: var(--icon-size);
    }

    /* Metric label - Descriptive text with consistent spacing and typography */
    .content .row .identifier .label {
        text-align: left;
        padding-left: var(--label-padding-left);
        line-height: var(--icon-size);
        font-size: var(--text-size);
        width: var(--label-width);
        color: var(--label-color);
        font-weight: var(--label-weight);
        white-space: nowrap;
        overflow: hidden;
    }

    /* Desktop label - Auto-width label for desktop vertical layout */
    .content.desktop .row .identifier .label {
        width: auto;
    }

    /* Request content wrapper - Container for value/unit with loading state support */
    .content .row .request-content {
        min-width: 0;
        flex: 1;
        height: 100%;
    }

    /* Desktop request content - Full-width content wrapper for desktop layout */
    .content.desktop .row .request-content {
        width: 100%;
    }

    /* Loader content layout - Flex container for value and unit with space distribution */
    .content .row .request-content .loader-div {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    /* Metric value - Numerical data with flexible width and ellipsis overflow */
    .content .row .request-content .loader-div .value {
        text-align: right;
        font-size: var(--text-size);
        padding-right: var(--value-right-padding);
        line-height: var(--icon-size);
        min-width: 0;
        flex: 1;
        color: var(--value-color);
        font-weight: var(--value-weight);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Desktop request content padding - Top padding for desktop vertical spacing */
    .content.desktop .row .request-content {
        padding-top: var(--desktop-content-padding-top);
    }

    /* Metric unit - Measurement unit display (kWh, VArh, A, etc.) with constrained width */
    .content .row .request-content .loader-div .unit {
        text-align: right;
        font-size: var(--text-size);
        line-height: var(--icon-size);
        min-width: 0;
        width: fit-content;
        max-width: var(--unit-max-width);
        color: var(--unit-color);
        font-weight: var(--unit-weight);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* No-data indicator - Fallback text displayed when metric values are null */
    .content .row .request-content .loader-div .no-data-label {
        text-align: right;
        font-size: var(--text-size);
        line-height: var(--icon-size);
        width: fit-content;
        color: var(--no-data-label-color);
        font-weight: var(--no-data-label-weight);
        width: 100%;
    }
</style>
