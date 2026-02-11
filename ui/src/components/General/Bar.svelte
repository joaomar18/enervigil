<script lang="ts">
    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { BarStyle } from "$lib/style/general";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $BarStyle;

    // Props
    export let minRangeValue: number | undefined = undefined;
    export let maxRangeValue: number | undefined = undefined;
    export let minAlarmState: boolean | undefined = undefined;
    export let maxAlarmState: boolean | undefined = undefined;
    export let minWarningState: boolean | undefined = undefined;
    export let maxWarningState: boolean | undefined = undefined;
    export let currentValue: number;
    export let enableMinArrow: boolean = true;
    export let enableMaxArrow: boolean = true;
    export let enableArrowDefault: boolean = false;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let border: string | undefined = undefined;
    export let borderRadius: string | undefined = undefined;
    export let fillWidth: string | undefined = undefined;
    export let fillHeight: string | undefined = undefined;
    export let fillColor: string | undefined = undefined;
    export let fillMinAlarmColor: string | undefined = undefined;
    export let fillMaxAlarmColor: string | undefined = undefined;
    export let fillMinWarningColor: string | undefined = undefined;
    export let fillMaxWarningColor: string | undefined = undefined;
    export let arrowWidth: string | undefined = undefined;
    export let arrowHeight: string | undefined = undefined;
    export let arrowColor: string | undefined = undefined;
    export let arrowMinAlarmColor: string | undefined = undefined;
    export let arrowMaxAlarmColor: string | undefined = undefined;
    export let arrowMinWarningColor: string | undefined = undefined;
    export let arrowMaxWarningColor: string | undefined = undefined;

    $: localOverrides = {
        width,
        height,
        backgroundColor,
        border,
        borderRadius,
        fillWidth,
        fillHeight,
        fillColor,
        fillMinAlarmColor,
        fillMaxAlarmColor,
        fillMinWarningColor,
        fillMaxWarningColor,
        arrowWidth,
        arrowHeight,
        arrowColor,
        arrowMinAlarmColor,
        arrowMaxAlarmColor,
        arrowMinWarningColor,
        arrowMaxWarningColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let currentValueScaled: number | null = null;
    let showArrow: boolean = false;

    // Reactive Statements
    $: showArrow =
        (enableArrowDefault && minRangeValue !== undefined && maxRangeValue !== undefined) ||
        (minAlarmState === true && enableMinArrow) ||
        (maxAlarmState === true && enableMaxArrow); // Show arrow

    // Current Value Scaled
    $: {
        if (minAlarmState) {
            currentValueScaled = 0;
        } else if (maxAlarmState) {
            currentValueScaled = 100;
        } else if (minRangeValue !== undefined && maxRangeValue !== undefined) {
            currentValueScaled = Math.round(((currentValue - minRangeValue) / (maxRangeValue - minRangeValue)) * 100);
            if (currentValueScaled < 0) {
                currentValueScaled = 0;
            }
            if (currentValueScaled > 100) {
                currentValueScaled = 100;
            }
        } else {
            currentValueScaled = null;
        }
    }
</script>

<!--
Bar

Visual bar indicator for a numeric value within a configurable range.
Displays a scaled fill percentage and an optional arrow, with support
for warning and alarm states on both minimum and maximum thresholds.
-->
<div
    style="
        --width: {mergedStyle.width};
        --height: {mergedStyle.height};
        --background-color: {mergedStyle.backgroundColor};
        --border: {mergedStyle.border};
        --border-radius: {mergedStyle.borderRadius};
        --fill-width: {mergedStyle.fillWidth};
        --fill-height: {mergedStyle.fillHeight};
        --fill-color: {mergedStyle.fillColor};
        --fill-min-alarm-color: {mergedStyle.fillMinAlarmColor};
        --fill-max-alarm-color: {mergedStyle.fillMaxAlarmColor};
        --fill-min-warning-color: {mergedStyle.fillMinWarningColor};
        --fill-max-warning-color: {mergedStyle.fillMaxWarningColor};
        --scaled-value-width: {currentValueScaled !== null ? `${currentValueScaled}%` : '0%'};
        --arrow-width: {mergedStyle.arrowWidth};
        --arrow-height: {mergedStyle.arrowHeight};
        --arrow-color: {mergedStyle.arrowColor};
        --arrow-min-alarm-color: {mergedStyle.arrowMinAlarmColor};
        --arrow-max-alarm-color: {mergedStyle.arrowMaxAlarmColor};
        --arrow-min-warning-color: {mergedStyle.arrowMinWarningColor};
        --arrow-max-warning-color: {mergedStyle.arrowMaxWarningColor};
    "
    class="bar-div"
>
    <div
        class="content"
        class:min-alarm={minAlarmState}
        class:min-warning={minWarningState}
        class:max-alarm={maxAlarmState}
        class:max-warning={maxWarningState}
    >
        <div class="fill-div">
            {#if currentValueScaled !== null}
                <div class="fill-value"></div>
            {/if}
            {#if showArrow}
                <div class="arrow"></div>
            {/if}
        </div>
    </div>
</div>

<style>
    /* Main container for the bar component */
    .bar-div {
        margin: 0;
        padding: 0;
        width: var(--width);
        height: var(--height);
        background-color: var(--background-color);
        border: var(--border);
        border-radius: var(--border-radius);
    }

    /* Content wrapper - centers the fill area */
    .content {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    /* Container for the progress fill and arrow */
    .content .fill-div {
        margin: 0;
        padding: 0;
        position: relative;
        width: var(--fill-width);
        height: var(--fill-height);
    }

    /* Progress fill - shows current value as percentage */
    .content .fill-value {
        margin: 0;
        padding: 0;
        position: absolute;
        left: 0px;
        height: 100%;
        width: var(--scaled-value-width);
        transition: width 0.2s ease-in-out; /* Smooth width changes */
        background-color: var(--fill-color);
        border-radius: var(--border-radius);
    }

    /* Alarm state colors for progress fill */
    .content.min-warning .fill-value {
        background-color: var(--fill-min-warning-color);
    }

    .content.max-warning .fill-value {
        background-color: var(--fill-max-warning-color);
    }

    .content.min-alarm .fill-value {
        background-color: var(--fill-min-alarm-color);
    }

    .content.max-alarm .fill-value {
        background-color: var(--fill-max-alarm-color);
    }

    /* Directional arrow - points to current value position */
    .content .arrow {
        top: 0px;
        transform: translateY(-100%);
        width: 0;
        height: 0;
        left: calc(var(--scaled-value-width) - var(--arrow-width));
        position: absolute;
        border-left: var(--arrow-width) solid transparent;
        border-right: var(--arrow-width) solid transparent;
        border-top: var(--arrow-height) solid transparent;
        border-top-color: var(--arrow-color);
    }

    /* Alarm state colors for arrow */
    .content.min-warning .arrow {
        border-top-color: var(--arrow-min-warning-color);
    }
    .content.max-warning .arrow {
        border-top-color: var(--arrow-max-warning-color);
    }
    .content.min-alarm .arrow {
        border-top-color: var(--arrow-min-alarm-color);
    }
    .content.max-alarm .arrow {
        border-top-color: var(--arrow-max-alarm-color);
    }
</style>
