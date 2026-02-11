<script lang="ts">
    import { roundToDecimalPlaces } from "$lib/logic/util/generic";
    import BaseDisplay from "./BaseDisplay.svelte";
    import Bar from "../../../General/Bar.svelte";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { MeasurementDisplayStyle, NodesBaseDisplayStyle } from "$lib/style/nodes";

    // Props
    export let disableLabel: boolean = false;
    export let disableClick: boolean = false;
    export let labelText: string;
    export let minRangeValue: number | undefined = undefined;
    export let maxRangeValue: number | undefined = undefined;
    export let minAlarmState: boolean | undefined = undefined;
    export let maxAlarmState: boolean | undefined = undefined;
    export let minWarningState: boolean | undefined = undefined;
    export let maxWarningState: boolean | undefined = undefined;
    export let value: number | null;
    export let unitText: string;
    export let decimalPlaces: number | undefined;
    export let minClickTimeMs: number | undefined = undefined; // Filter time for the button click

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    export let baseDisplayStyle: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $MeasurementDisplayStyle;
    $: baseDisplayStyle = baseDisplayStyle ?? $NodesBaseDisplayStyle;

    // Layout / styling props
    export let valueTextSize: string | undefined = undefined;
    export let valueTextColor: string | undefined = undefined;
    export let valueTextSpacing: string | undefined = undefined;
    export let valueTextWeight: string | undefined = undefined;
    export let valueTextPaddingRight: string | undefined = undefined;
    export let unitWidth: string | undefined = undefined;
    export let unitTextSize: string | undefined = undefined;
    export let unitTextColor: string | undefined = undefined;
    export let unitTextWeight: string | undefined = undefined;
    export let unitTextPaddingLeft: string | undefined = undefined;
    export let barWidth: string | undefined = undefined;
    export let barHeight: string | undefined = undefined;

    $: localOverrides = {
        valueTextSize,
        valueTextColor,
        valueTextSpacing,
        valueTextWeight,
        valueTextPaddingRight,
        unitWidth,
        unitTextSize,
        unitTextColor,
        unitTextWeight,
        unitTextPaddingLeft,
        barWidth,
        barHeight,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let valueDisconnected: boolean = false;

    // Reactive Statements
    $: valueDisconnected = value === null;

    // Click Export Function
    export let onClick: (() => void) | null = null;
</script>

<!--
    Measurement Component
    
    A real-time measurement display component with value visualization and range indicators.
    Features alarm/warning state management, visual bar representation, and comprehensive
    formatting options for industrial measurement data. Supports decimal precision control,
    unit display, and range-based visual feedback. Extends BaseDisplay for consistent
    styling and interaction patterns across the monitoring interface.
-->
<BaseDisplay
    style={baseDisplayStyle}
    {disableLabel}
    {disableClick}
    {labelText}
    alarmState={minAlarmState || maxAlarmState}
    warningState={minWarningState || maxWarningState}
    {valueDisconnected}
    {minClickTimeMs}
    {onClick}
>
    <div
        style="
            --value-text-size: {mergedStyle.valueTextSize};
            --value-text-color: {mergedStyle.valueTextColor};
            --value-text-spacing: {mergedStyle.valueTextSpacing};
            --value-text-weight: {mergedStyle.valueTextWeight};
            --value-text-padding-right: {mergedStyle.valueTextPaddingRight};
            --unit-width: {mergedStyle.unitWidth};
            --unit-text-size: {mergedStyle.unitTextSize};
            --unit-text-color: {mergedStyle.unitTextColor};
            --unit-text-weight: {mergedStyle.unitTextWeight};
            --unit-text-padding-left: {mergedStyle.unitTextPaddingLeft};
            --bar-width: {mergedStyle.barWidth};
            --bar-height: {mergedStyle.barHeight};
        "
        class="slot-content"
        slot="content"
    >
        <div class="value-div">
            {#if !valueDisconnected}
                <span class="value">{roundToDecimalPlaces(value, decimalPlaces || 0)}</span>
            {/if}
        </div>

        <span class="unit">{unitText}</span>

        {#if (minRangeValue !== undefined || maxRangeValue !== undefined) && value !== null}
            <div class="bar-value-div">
                <Bar {minRangeValue} {maxRangeValue} {minAlarmState} {maxAlarmState} {minWarningState} {maxWarningState} currentValue={value} />
            </div>
        {/if}
    </div>
</BaseDisplay>

<style>
    /* Main content container - Horizontal layout for value and unit display */
    .slot-content {
        margin: 0;
        padding: 0;
        position: relative;
        width: 100%;
        height: 100%;
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    /* Value container - Flexible area for measurement value with overflow handling */
    .value-div {
        box-sizing: border-box;
        padding: 0;
        padding-right: var(--value-text-padding-right);
        width: calc(100% - var(--unit-width));
        min-width: 0;
        line-height: 1;
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
    }

    /* Measurement value text - Styled numeric display with tabular formatting */
    .value-div .value {
        font-size: var(--value-text-size);
        color: var(--value-text-color);
        letter-spacing: var(--value-text-spacing);
        font-weight: var(--value-text-weight);
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
        line-height: 1;
        font-variant-numeric: tabular-nums;
        font-feature-settings:
            "tnum" 1,
            "lnum" 1;
    }

    /* Unit display - Fixed-width area for measurement units (kW, A, etc.) */
    .unit {
        box-sizing: border-box;
        padding: 0;
        font-size: var(--unit-text-size);
        color: var(--unit-text-color);
        font-weight: var(--unit-text-weight);
        padding-left: var(--unit-text-padding-left);
        text-align: right;
        width: var(--unit-width);
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
    }

    /* Range bar container - Absolutely positioned visual indicator at bottom */
    .bar-value-div {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: 0px;
        width: var(--bar-width);
        height: var(--bar-height);
    }
</style>
