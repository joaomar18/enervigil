<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { slide } from "svelte/transition";
    import { getElegantStringFromDate } from "$lib/logic/util/date";
    import InlineLoader from "../../../General/InlineLoader.svelte";
    import type { DatePeriodString } from "$lib/types/date";
    import type { MeasurementMetrics } from "$lib/types/nodes/logs";
    import type { PeakPowerType } from "$lib/types/device/energy";

    // Texts
    import { selectedLang } from "$lib/stores/lang/definition";
    import { variableNameTexts } from "$lib/stores/lang/energyMeterTexts";
    import { texts } from "$lib/stores/lang/generalTexts";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { PeakPowerMetricsStyle } from "$lib/style/nodes";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $PeakPowerMetricsStyle;

    // Props
    export let metrics: PeakPowerType | undefined;
    export let dataFetched: boolean;
    export let firstFetch: boolean;

    // Layout / styling props
    export let paddingTop: string | undefined = undefined;
    export let paddingBottom: string | undefined = undefined;
    export let paddingHorizontal: string | undefined = undefined;
    export let rowPaddingTop: string | undefined = undefined;
    export let rowPaddingBottom: string | undefined = undefined;
    export let rowBorderBottom: string | undefined = undefined;
    export let rowBorderBottomHover: string | undefined = undefined;
    export let labelColor: string | undefined = undefined;
    export let labelWeight: string | undefined = undefined;
    export let labelSize: string | undefined = undefined;
    export let labelPaddingBottom: string | undefined = undefined;
    export let labelBorderBottom: string | undefined = undefined;
    export let iconSize: string | undefined = undefined;
    export let valuePaddingTop: string | undefined = undefined;
    export let valuePaddingRight: string | undefined = undefined;
    export let valueColor: string | undefined = undefined;
    export let valueWeight: string | undefined = undefined;
    export let valueSize: string | undefined = undefined;
    export let valueTextSpacing: string | undefined = undefined;
    export let unitMaxWidth: string | undefined = undefined;
    export let unitColor: string | undefined = undefined;
    export let unitWeight: string | undefined = undefined;
    export let unitSize: string | undefined = undefined;
    export let noDataLabelColor: string | undefined = undefined;
    export let noDataLabelWeight: string | undefined = undefined;
    export let dateMarginTop: string | undefined = undefined;
    export let dateMarginBottom: string | undefined = undefined;
    export let datePaddingTop: string | undefined = undefined;
    export let datePaddingBottom: string | undefined = undefined;
    export let datePaddingHorizontal: string | undefined = undefined;
    export let dateLineHeight: string | undefined = undefined;
    export let dateBorderRadius: string | undefined = undefined;
    export let dateBackgroundColor: string | undefined = undefined;
    export let dateBorder: string | undefined = undefined;
    export let dateSize: string | undefined = undefined;
    export let dateMainColor: string | undefined = undefined;
    export let dateSubColor: string | undefined = undefined;
    export let dateMainWeight: string | undefined = undefined;
    export let dateSubWeight: string | undefined = undefined;

    $: localOverrides = {
        paddingTop,
        paddingBottom,
        paddingHorizontal,
        rowPaddingTop,
        rowPaddingBottom,
        rowBorderBottom,
        rowBorderBottomHover,
        labelColor,
        labelWeight,
        labelSize,
        labelPaddingBottom,
        labelBorderBottom,
        iconSize,
        valuePaddingTop,
        valuePaddingRight,
        valueColor,
        valueWeight,
        valueSize,
        valueTextSpacing,
        unitMaxWidth,
        unitColor,
        unitWeight,
        unitSize,
        noDataLabelColor,
        noDataLabelWeight,
        dateMarginTop,
        dateMarginBottom,
        datePaddingTop,
        datePaddingBottom,
        datePaddingHorizontal,
        dateLineHeight,
        dateBorderRadius,
        dateBackgroundColor,
        dateBorder,
        dateSize,
        dateMainColor,
        dateSubColor,
        dateMainWeight,
        dateSubWeight,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let showLoader: boolean = false;
    let showDateCheckerActivePower: boolean = false;
    let showDateCheckerReactivePower: boolean = false;
    let showDateCheckerApparentPower: boolean = false;
    let loaderTimeout: number | null = null;
    let activePowerDiv: HTMLDivElement;
    let reactivePowerDiv: HTMLDivElement;
    let apparentPowerDiv: HTMLDivElement;
    let activePowerMetrics: MeasurementMetrics;
    let reactivePowerMetrics: MeasurementMetrics;
    let apparentPowerMetrics: MeasurementMetrics;
    let activePowerUnit: string;
    let reactivePowerUnit: string;
    let apparentPowerUnit: string;
    let activePowerDp: number | null;
    let reactivePowerDp: number | null;
    let apparentPowerDp: number | null;
    let peakActivePowerPeriod: DatePeriodString | null = null;
    let peakReactivePowerPeriod: DatePeriodString | null = null;
    let peakApparentPowerPeriod: DatePeriodString | null = null;

    // Reactive Statements
    $: if (!dataFetched && !showLoader) {
        if (firstFetch) {
            loaderTimeout = setTimeout(() => {
                showLoader = !dataFetched;
            }, 500);
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

    $: activePowerMetrics = metrics?.active_power.global_metrics as MeasurementMetrics;
    $: reactivePowerMetrics = metrics?.reactive_power.global_metrics as MeasurementMetrics;
    $: apparentPowerMetrics = metrics?.apparent_power.global_metrics as MeasurementMetrics;
    $: activePowerUnit = metrics?.active_power.unit ?? "";
    $: reactivePowerUnit = metrics?.reactive_power.unit ?? "";
    $: apparentPowerUnit = metrics?.apparent_power.unit ?? "";
    $: activePowerDp = metrics?.active_power.decimal_places ?? null;
    $: reactivePowerDp = metrics?.reactive_power.decimal_places ?? null;
    $: apparentPowerDp = metrics?.apparent_power.decimal_places ?? null;
    $: if ($selectedLang)
        peakApparentPowerPeriod =
            apparentPowerMetrics?.max_value_start_time && apparentPowerMetrics?.max_value_end_time
                ? {
                      initialDate: getElegantStringFromDate(new Date(apparentPowerMetrics?.max_value_start_time)),
                      endDate: getElegantStringFromDate(new Date(apparentPowerMetrics?.max_value_end_time)),
                  }
                : null;
    $: if ($selectedLang)
        peakActivePowerPeriod =
            activePowerMetrics?.max_value_start_time && activePowerMetrics?.max_value_end_time
                ? {
                      initialDate: getElegantStringFromDate(new Date(activePowerMetrics?.max_value_start_time)),
                      endDate: getElegantStringFromDate(new Date(activePowerMetrics?.max_value_end_time)),
                  }
                : null;

    $: if ($selectedLang)
        peakReactivePowerPeriod =
            reactivePowerMetrics?.max_value_start_time && reactivePowerMetrics?.max_value_end_time
                ? {
                      initialDate: getElegantStringFromDate(new Date(reactivePowerMetrics?.max_value_start_time)),
                      endDate: getElegantStringFromDate(new Date(reactivePowerMetrics?.max_value_end_time)),
                  }
                : null;

    // Functions
    function handleClickOutside(event: MouseEvent): void {
        if (showDateCheckerApparentPower && apparentPowerDiv && !apparentPowerDiv.contains(event.target as Node)) {
            showDateCheckerApparentPower = false;
        }
        if (showDateCheckerActivePower && activePowerDiv && !activePowerDiv.contains(event.target as Node)) {
            showDateCheckerActivePower = false;
        }

        if (showDateCheckerReactivePower && reactivePowerDiv && !reactivePowerDiv.contains(event.target as Node)) {
            showDateCheckerReactivePower = false;
        }
    }

    onMount(() => {
        window.addEventListener("click", handleClickOutside);
    });
    onDestroy(() => {
        window.removeEventListener("click", handleClickOutside);
    });
</script>

<!--
    PeakPowerMetrics.svelte

    Compact metric list showing peak power metrics (apparent / active / reactive).
    - Shows the peak value and unit, with an optional period indicator when the peak has an associated time range.
    - Provides an expandable date / period area (animated with Svelte's slide transition) for details on mobile.
    - Designed for use inside the node metrics card or side sheet; styling accepts overrides via exported props.
-->
<div
    style="
        --padding-top: {mergedStyle.paddingTop};
        --padding-bottom: {mergedStyle.paddingBottom};
        --padding-horizontal: {mergedStyle.paddingHorizontal};
        --row-padding-top: {mergedStyle.rowPaddingTop};
        --row-padding-bottom: {mergedStyle.rowPaddingBottom};
        --row-border-bottom: {mergedStyle.rowBorderBottom};
        --row-border-bottom-hover: {mergedStyle.rowBorderBottomHover};
        --label-color: {mergedStyle.labelColor};
        --label-weight: {mergedStyle.labelWeight};
        --label-size: {mergedStyle.labelSize};
        --label-padding-bottom: {mergedStyle.labelPaddingBottom};
        --label-border-bottom: {mergedStyle.labelBorderBottom};
        --icon-size: {mergedStyle.iconSize};
        --value-padding-top: {mergedStyle.valuePaddingTop};
        --value-padding-right: {mergedStyle.valuePaddingRight};
        --value-color: {mergedStyle.valueColor};
        --value-weight: {mergedStyle.valueWeight};
        --value-size: {mergedStyle.valueSize};
        --value-text-spacing: {mergedStyle.valueTextSpacing};
        --unit-max-width: {mergedStyle.unitMaxWidth};
        --unit-color: {mergedStyle.unitColor};
        --unit-weight: {mergedStyle.unitWeight};
        --unit-size: {mergedStyle.unitSize};
        --no-data-label-weight: {mergedStyle.noDataLabelWeight};
        --no-data-label-color: {mergedStyle.noDataLabelColor};
        --date-margin-top: {mergedStyle.dateMarginTop};
        --date-margin-bottom: {mergedStyle.dateMarginBottom};
        --date-padding-top: {mergedStyle.datePaddingTop};
        --date-padding-bottom: {mergedStyle.datePaddingBottom};
        --date-padding-horizontal: {mergedStyle.datePaddingHorizontal};
        --date-line-height: {mergedStyle.dateLineHeight};
        --date-border-radius: {mergedStyle.dateBorderRadius};
        --date-background-color: {mergedStyle.dateBackgroundColor};
        --date-border: {mergedStyle.dateBorder};
        --date-size: {mergedStyle.dateSize};
        --date-main-color: {mergedStyle.dateMainColor};
        --date-sub-color: {mergedStyle.dateSubColor};
        --date-main-weight: {mergedStyle.dateMainWeight};
        --date-sub-weight: {mergedStyle.dateSubWeight};
    "
    class="container"
>
    <div class="content">
        <div bind:this={apparentPowerDiv} class="row" class:active={peakApparentPowerPeriod}>
            <div class="label-div">
                <span class="label">{$variableNameTexts.apparent_power}</span>
                {#if peakApparentPowerPeriod}
                    <img class="period-check" src="/img/calendar-icon.svg" alt="Period check" />
                    <img class="period-check-hovered" src="/img/calendar-icon-hovered.svg" alt="Period check hovered" />
                {/if}
            </div>
            {#if showDateCheckerApparentPower && peakApparentPowerPeriod}
                <div transition:slide={{ duration: 200 }} class="period-div">
                    <div><span class="date-sub">{$texts.registeredDate}:</span></div>
                    <div>
                        <span class="date">
                            {peakApparentPowerPeriod.initialDate}
                        </span>
                        <span class="date-sub"> - </span>
                        <span class="date">
                            {peakApparentPowerPeriod.endDate}
                        </span>
                    </div>
                </div>
            {/if}
            <InlineLoader loaded={!showLoader}>
                <div class="value-div">
                    {#if apparentPowerMetrics?.max_value !== null && apparentPowerMetrics?.max_value !== undefined}
                        <span class="value"
                            >{apparentPowerDp ? apparentPowerMetrics?.max_value.toFixed(apparentPowerDp) : apparentPowerMetrics?.max_value}</span
                        >
                        <span class="unit">{apparentPowerUnit}</span>
                    {:else}
                        <span class="no-data-label">{$texts.noDataAvailableShort}</span>
                    {/if}
                </div>
            </InlineLoader>
            {#if peakApparentPowerPeriod}
                <button
                    aria-label="Show date range"
                    on:click={() => {
                        showDateCheckerApparentPower = !showDateCheckerApparentPower;
                    }}
                ></button>
            {/if}
        </div>
        <div bind:this={activePowerDiv} class="row" class:active={peakActivePowerPeriod}>
            <div class="label-div">
                <span class="label">{$variableNameTexts.active_power}</span>
                {#if peakActivePowerPeriod}
                    <img class="period-check" src="/img/calendar-icon.svg" alt="Period check" />
                    <img class="period-check-hovered" src="/img/calendar-icon-hovered.svg" alt="Period check hovered" />
                {/if}
            </div>
            {#if showDateCheckerActivePower && peakActivePowerPeriod}
                <div transition:slide={{ duration: 200 }} class="period-div">
                    <div><span class="date-sub">{$texts.registeredDate}:</span></div>
                    <div>
                        <span class="date">
                            {peakActivePowerPeriod.initialDate}
                        </span>
                        <span class="date-sub"> - </span>
                        <span class="date">
                            {peakActivePowerPeriod.endDate}
                        </span>
                    </div>
                </div>
            {/if}
            <InlineLoader loaded={!showLoader}>
                <div class="value-div">
                    {#if activePowerMetrics?.max_value !== null && activePowerMetrics?.max_value !== undefined}
                        <span class="value">{activePowerDp ? activePowerMetrics?.max_value.toFixed(activePowerDp) : activePowerMetrics?.max_value}</span>
                        <span class="unit">{activePowerUnit}</span>
                    {:else}
                        <span class="no-data-label">{$texts.noDataAvailableShort}</span>
                    {/if}
                </div>
            </InlineLoader>
            {#if peakActivePowerPeriod}
                <button
                    aria-label="Show date range"
                    on:click={() => {
                        showDateCheckerActivePower = !showDateCheckerActivePower;
                    }}
                ></button>
            {/if}
        </div>
        <div bind:this={reactivePowerDiv} class="row" class:active={peakReactivePowerPeriod}>
            <div class="label-div">
                <span class="label">{$variableNameTexts.reactive_power}</span>
                {#if peakReactivePowerPeriod}
                    <img class="period-check" src="/img/calendar-icon.svg" alt="Period check" />
                    <img class="period-check-hovered" src="/img/calendar-icon-hovered.svg" alt="Period check hovered" />
                {/if}
            </div>
            {#if showDateCheckerReactivePower && peakReactivePowerPeriod}
                <div transition:slide={{ duration: 200 }} class="period-div">
                    <div><span class="date-sub">{$texts.registeredDate}:</span></div>
                    <div>
                        <span class="date">
                            {peakReactivePowerPeriod.initialDate}
                        </span>
                        <span class="date-sub"> - </span>
                        <span class="date">
                            {peakReactivePowerPeriod.endDate}
                        </span>
                    </div>
                </div>
            {/if}
            <InlineLoader loaded={!showLoader}>
                <div class="value-div">
                    {#if reactivePowerMetrics?.max_value !== null && reactivePowerMetrics?.max_value !== undefined}
                        <span class="value"
                            >{reactivePowerDp ? reactivePowerMetrics?.max_value.toFixed(reactivePowerDp) : reactivePowerMetrics?.max_value}</span
                        >
                        <span class="unit">{reactivePowerUnit}</span>
                    {:else}
                        <span class="no-data-label">{$texts.noDataAvailableShort}</span>
                    {/if}
                </div>
            </InlineLoader>
            {#if peakReactivePowerPeriod}
                <button
                    aria-label="Show date range"
                    on:click={() => {
                        showDateCheckerReactivePower = !showDateCheckerReactivePower;
                    }}
                ></button>
            {/if}
        </div>
    </div>
</div>

<style>
    /* Root container — sizing, padding and box-model for the metric block */
    .container {
        box-sizing: border-box;
        margin: 0;
        padding-top: var(--padding-top);
        padding-bottom: var(--padding-bottom);
        padding-left: var(--padding-horizontal);
        padding-right: var(--padding-horizontal);
        width: 100%;
        height: fit-content;
    }

    /* Content wrapper — holds rows and keeps layout flow */
    .content {
        margin: 0;
        padding: 0;
        position: relative;
        width: 100%;
        height: fit-content;
    }

    /* Individual metric row — vertical stacking of label and value, supports hover state */
    .content .row {
        padding: 0;
        margin: 0;
        position: relative;
        padding-top: var(--row-padding-top);
        padding-bottom: var(--row-padding-bottom);
        border-bottom: var(--row-border-bottom);
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
    }

    /* Hover state for rows that contain period data (applies the hover border) */
    .content .row.active:hover {
        border-bottom: var(--row-border-bottom-hover);
    }

    /* Row left-side label area (name and optional period icon) */
    .label-div {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    /* Label text styling: color, size, weight and spacing */
    .label {
        text-align: left;
        color: var(--label-color);
        font-weight: var(--label-weight);
        font-size: var(--label-size);
        padding-bottom: var(--label-padding-bottom);
        border-bottom: var(--label-border-bottom);
        flex: 1;
        line-height: var(--icon-size);
    }

    /* Small calendar icon used to indicate a peak period exists; hovered state swaps imagery */
    .period-check,
    .period-check-hovered {
        width: var(--icon-size);
        height: var(--icon-size);
    }

    .period-check-hovered {
        display: none;
    }

    /* Swap the calendar icon on hover (normal -> hovered image) */
    .content .row:hover .period-check {
        display: none;
    }

    /* Hovered calendar variant appears when row is hovered */
    .content .row:hover .period-check-hovered {
        display: block;
    }

    /* Right-side value area — value and unit alignment and overflow handling */
    .value-div {
        padding: 0;
        padding-top: var(--value-padding-top);
        display: flex;
        flex-direction: row;
        align-items: baseline;
        justify-content: end;
    }

    /* Numeric value styling — uses tabular numbers and respects available space */
    .value {
        padding: 0;
        padding-right: var(--value-padding-right);
        color: var(--value-color);
        font-size: var(--value-size);
        font-weight: var(--value-weight);
        letter-spacing: var(--value-text-spacing);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
        text-align: right;
        min-width: 0;
        line-height: 1;
        font-variant-numeric: tabular-nums;
        font-feature-settings:
            "tnum" 1,
            "lnum" 1;
    }

    /* Placeholder when no data is available */
    .no-data-label {
        padding: 0;
        padding-right: var(--value-padding-right);
        color: var(--no-data-label-color);
        font-size: var(--value-size);
        font-weight: var(--no-data-label-weight);
        letter-spacing: var(--value-text-spacing);
        flex: 1;
        text-align: right;
        line-height: 1;
    }

    /* Unit label styling (kW, kVA, etc.) placed next to the value */
    .unit {
        padding: 0;
        width: fit-content;
        max-width: var(--unit-max-width);
        color: var(--unit-color);
        font-size: var(--unit-size);
        font-weight: var(--unit-weight);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Expandable period panel: contains display strings and uses the date theming variables */
    .period-div {
        box-sizing: border-box;
        margin: 0;
        margin-top: var(--date-margin-top);
        margin-bottom: var(--date-margin-bottom);
        width: 100%;
        padding: var(--date-padding-top) var(--date-padding-horizontal) var(--date-padding-bottom);
        border-radius: var(--date-border-radius);
        background-color: var(--date-background-color);
        border: var(--date-border);
        /* remove top radius so the panel visually connects to the row above */
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
        line-height: var(--date-line-height);
    }

    /* Primary date text — main timestamp or formatted date string for the period */
    .period-div .date {
        color: var(--date-main-color);
        font-size: var(--date-size);
        font-weight: var(--date-main-weight);
    }

    /* Secondary / meta date text — labels, separators or smaller secondary text */
    .period-div .date-sub {
        color: var(--date-sub-color);
        font-size: calc(var(--date-size));
        font-weight: var(--date-sub-weight);
    }

    /* Invisible full-row button used as a large hit target for touch; positioned over each row */
    button {
        position: absolute;
        inset: 0;
        border: none;
        opacity: 0;
        width: 100%;
        height: 100%;
        cursor: pointer;
    }
</style>
