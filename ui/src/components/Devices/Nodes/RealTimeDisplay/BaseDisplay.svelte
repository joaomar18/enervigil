<script lang="ts">
    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { NodesBaseDisplayStyle } from "$lib/style/nodes";
    import { onDestroy } from "svelte";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $NodesBaseDisplayStyle;

    // Props
    export let disableLabel: boolean = false;
    export let disableClick: boolean = false;
    export let labelText: string;
    export let alarmState: boolean = false;
    export let warningState: boolean = false;
    export let valueDisconnected: boolean;
    export let minClickTimeMs: number | undefined = undefined; // Filter time for the button click

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let maxWidth: string | undefined = undefined;
    export let paddingHorizontal: string | undefined = undefined;
    export let paddingVertical: string | undefined = undefined;
    export let labelPaddingTop: string | undefined = undefined;
    export let labelPaddingBottom: string | undefined = undefined;
    export let labelPaddingRight: string | undefined = undefined;
    export let labelSize: string | undefined = undefined;
    export let labelColor: string | undefined = undefined;
    export let labelWeight: string | undefined = undefined;
    export let displayHeight: string | undefined = undefined;
    export let displayBorder: string | undefined = undefined;
    export let displayHoverBorder: string | undefined = undefined;
    export let displayDisconnectedBorder: string | undefined = undefined;
    export let displayDisconnectedHoverBorder: string | undefined = undefined;
    export let displayBackgroundColor: string | undefined = undefined;
    export let displayHoverBackgroundColor: string | undefined = undefined;
    export let displayDisconnectedBackgroundColor: string | undefined = undefined;
    export let displayDisconnectedHoverBackgroundColor: string | undefined = undefined;
    export let displayHoverShadow: string | undefined = undefined;
    export let displayDisconnectedHoverShadow: string | undefined = undefined;
    export let displayRadius: string | undefined = undefined;
    export let displayPaddingHorizontal: string | undefined = undefined;
    export let alertsDivItemGap: string | undefined = undefined;
    export let stateCircleDiameter: string | undefined = undefined;
    export let stateCircleAlarmColor: string | undefined = undefined;
    export let stateCircleAlarmHoverColor: string | undefined = undefined;
    export let stateCircleAlarmHoverShadow: string | undefined = undefined;
    export let stateCircleWarningColor: string | undefined = undefined;
    export let stateCircleWarningHoverColor: string | undefined = undefined;
    export let stateCircleWarningHoverShadow: string | undefined = undefined;
    export let disconnectedImageWidth: string | undefined = undefined;
    export let disconnectedImageHeight: string | undefined = undefined;
    export let animationDuration: string | undefined = undefined;

    $: localOverrides = {
        width,
        maxWidth,
        paddingHorizontal,
        paddingVertical,
        labelPaddingTop,
        labelPaddingBottom,
        labelPaddingRight,
        labelSize,
        labelColor,
        labelWeight,
        displayHeight,
        displayBorder,
        displayHoverBorder,
        displayDisconnectedBorder,
        displayDisconnectedHoverBorder,
        displayBackgroundColor,
        displayHoverBackgroundColor,
        displayDisconnectedBackgroundColor,
        displayDisconnectedHoverBackgroundColor,
        displayHoverShadow,
        displayDisconnectedHoverShadow,
        displayRadius,
        displayPaddingHorizontal,
        alertsDivItemGap,
        stateCircleDiameter,
        stateCircleAlarmColor,
        stateCircleAlarmHoverColor,
        stateCircleAlarmHoverShadow,
        stateCircleWarningColor,
        stateCircleWarningHoverColor,
        stateCircleWarningHoverShadow,
        disconnectedImageWidth,
        disconnectedImageHeight,
        animationDuration,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let minClickTimeout: ReturnType<typeof setTimeout> | null = null;

    // Click Export Function
    export let onClick: (() => void) | null = null;

    // Functions
    function handleClick(): void {
        if (onClick && !disableClick && minClickTimeout === null) {
            onClick();
            if (minClickTimeMs != undefined) setClickTimeout();
        }
    }

    function resetClickTimeout(): void {
        if (minClickTimeout !== null) {
            clearTimeout(minClickTimeout);
            minClickTimeout = null;
        }
    }

    function setClickTimeout(): void {
        resetClickTimeout();
        if (minClickTimeMs != undefined) minClickTimeout = setTimeout(() => resetClickTimeout(), minClickTimeMs);
    }

    onDestroy(() => {
        resetClickTimeout();
    });
</script>

<!--
    BaseDisplay Component
    
    A foundational display component that provides common infrastructure for real-time device data visualization.
    Features label management, state indicators (alarm/warning), disconnection handling, and comprehensive
    styling support. Serves as the base for specialized display components like Measurement, Counter, and Text,
    providing consistent layout patterns, interaction handling, and visual state management. Includes state
    circles for alarm/warning conditions and disconnected device visualization with proper accessibility support.
-->
<div
    style="
        --width: {mergedStyle.width};
        --max-width: {mergedStyle.maxWidth};
        --padding-horizontal: {mergedStyle.paddingHorizontal};
        --padding-vertical: {mergedStyle.paddingVertical};
        --label-padding-top: {mergedStyle.labelPaddingTop};
        --label-padding-bottom: {mergedStyle.labelPaddingBottom};
        --label-padding-right: {mergedStyle.labelPaddingRight};
        --label-size: {mergedStyle.labelSize};
        --label-color: {mergedStyle.labelColor};
        --label-weight: {mergedStyle.labelWeight};
        --display-height: {mergedStyle.displayHeight};
        --display-border: {mergedStyle.displayBorder};
        --display-hover-border: {mergedStyle.displayHoverBorder};
        --display-disconnected-border: {mergedStyle.displayDisconnectedBorder};
        --display-disconnected-hover-border: {mergedStyle.displayDisconnectedHoverBorder};
        --display-background-color: {mergedStyle.displayBackgroundColor};
        --display-hover-background-color: {mergedStyle.displayHoverBackgroundColor};
        --display-disconnected-background-color: {mergedStyle.displayDisconnectedBackgroundColor};
        --display-disconnected-hover-background-color: {mergedStyle.displayDisconnectedHoverBackgroundColor};
        --display-hover-shadow: {mergedStyle.displayHoverShadow};
        --display-disconnected-hover-shadow: {mergedStyle.displayDisconnectedHoverShadow};
        --display-radius: {mergedStyle.displayRadius};
        --display-padding-horizontal: {mergedStyle.displayPaddingHorizontal};
        --alerts-div-item-gap: {mergedStyle.alertsDivItemGap};
        --state-circle-diameter: {mergedStyle.stateCircleDiameter};
        --state-circle-alarm-color: {mergedStyle.stateCircleAlarmColor};
        --state-circle-alarm-hover-color: {mergedStyle.stateCircleAlarmHoverColor};
        --state-circle-alarm-hover-shadow: {mergedStyle.stateCircleAlarmHoverShadow};
        --state-circle-warning-color: {mergedStyle.stateCircleWarningColor};
        --state-circle-warning-hover-color: {mergedStyle.stateCircleWarningHoverColor};
        --state-circle-warning-hover-shadow: {mergedStyle.stateCircleWarningHoverShadow};
        --disconnected-image-width: {mergedStyle.disconnectedImageWidth};
        --disconnected-image-height: {mergedStyle.disconnectedImageHeight};
        --animation-duration: {mergedStyle.animationDuration};
    "
    class="container"
>
    <div class="content" class:enable-hover={!disableClick}>
        {#if !disableLabel}
            <div class="label-div">
                <span>{labelText}</span>
                {#if alarmState || warningState}
                    <div class="alerts-div" class:alarm={alarmState} class:warning={warningState && !alarmState}>
                        <div class="alert-state"></div>
                    </div>
                {/if}
            </div>
        {/if}
        <div class="display-content-wrapper">
            <div class="display-content" class:disconnected={valueDisconnected}>
                <img src="/img/disconnected.svg" alt="disconnected" />
                <slot name="content" />
            </div>
        </div>
        <button on:click={handleClick} aria-label="Open Variable Detailed Info"></button>
    </div>
</div>

<style>
    /* Main container - Outer wrapper with configurable dimensions and padding */
    .container {
        padding: 0;
        margin: 0;
        position: relative;
        width: var(--width);
        max-width: var(--max-width);
        height: fit-content;
        padding-left: var(--padding-horizontal);
        padding-right: var(--padding-horizontal);
        padding-top: var(--padding-vertical);
        padding-bottom: var(--padding-vertical);
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
    }

    /* Content wrapper - Vertical layout container for label and display areas */
    .content {
        margin: 0;
        padding: 0;
        width: 100%;
        height: fit-content;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    /* Label section - Horizontal layout for device name and status indicators */
    .content .label-div {
        margin: 0;
        padding: 0;
        padding-top: var(--label-padding-top);
        padding-bottom: var(--label-padding-bottom);
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    /* Label text - Device name with ellipsis overflow handling */
    .content .label-div span {
        margin: 0;
        padding: 0;
        flex: 1;
        min-width: 0;
        text-align: left;
        padding-left: var(--display-padding-horizontal);
        padding-right: var(--label-padding-right);
        font-size: var(--label-size);
        color: var(--label-color);
        font-weight: var(--label-weight);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Alert indicators container - Houses alarm and warning state circles */
    .content .label-div .alerts-div {
        height: fit-content;
        padding-right: var(--display-padding-horizontal);
        display: flex;
        flex-direction: row;
        gap: var(--alerts-div-item-gap);
        justify-content: space-between;
        align-items: center;
    }

    /* State circle - Circular indicator for alarm/warning conditions */
    .content .label-div .alerts-div .alert-state {
        width: var(--state-circle-diameter);
        height: var(--state-circle-diameter);
        border-radius: 50%;
        transition:
            background-color var(--animation-duration) ease-in-out,
            box-shadow var(--animation-duration) ease-in-out;
    }

    /* Alarm state styling - Red circle for critical conditions */
    .content .label-div .alerts-div.alarm .alert-state {
        background-color: var(--state-circle-alarm-color);
    }

    /* Alarm hover effects - Enhanced visibility on mouse over */
    .content.enable-hover:hover .label-div .alerts-div.alarm .alert-state {
        background-color: var(--state-circle-alarm-hover-color);
        box-shadow: var(--state-circle-alarm-hover-shadow);
    }

    /* Warning state styling - Yellow/orange circle for caution conditions */
    .content .label-div .alerts-div.warning .alert-state {
        background-color: var(--state-circle-warning-color);
    }

    /* Warning hover effects - Enhanced visibility on mouse over */
    .content.enable-hover:hover .label-div .alerts-div.warning .alert-state {
        background-color: var(--state-circle-warning-hover-color);
        box-shadow: var(--state-circle-warning-hover-shadow);
    }

    /* Display wrapper - Container for the main data display area */
    .content .display-content-wrapper {
        margin: 0;
        padding: 0;
        position: relative;
        width: 100%;
        height: var(--display-height);
        border-radius: var(--display-radius);
        background-color: var(--display-wrapper-background-color);
    }

    /* Main display area - Container for measurement/counter/text content with transitions */
    .content .display-content-wrapper .display-content {
        margin: 0;
        padding: 0;
        position: absolute;
        height: 100%;
        width: 100%;
        background-color: var(--display-background-color);
        border: var(--display-border);
        border-radius: var(--display-radius);
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 0 var(--display-padding-horizontal);
        box-sizing: border-box;
        overflow: hidden;
        transition:
            background-color var(--animation-duration) ease-in-out,
            border var(--animation-duration) ease-in-out,
            box-shadow var(--animation-duration) ease-in-out;
    }

    /* Connected state hover effects - Enhanced styling for interactive feedback */
    .content.enable-hover:hover .display-content-wrapper .display-content {
        background-color: var(--display-hover-background-color);
        border: var(--display-hover-border);
        box-shadow: var(--display-hover-shadow);
    }

    /* Disconnected state styling - Visual indication of device offline status */
    .content .display-content-wrapper .display-content.disconnected {
        background-color: var(--display-disconnected-background-color);
        border: var(--display-disconnected-border);
    }

    /* Disconnected hover effects - Distinct styling for offline device interaction */
    .content.enable-hover:hover .display-content-wrapper .display-content.disconnected {
        background-color: var(--display-disconnected-hover-background-color);
        border: var(--display-disconnected-hover-border);
        box-shadow: var(--display-disconnected-hover-shadow);
    }

    /* Disconnected indicator image - Hidden by default, shown when device is offline */
    .content .display-content-wrapper .display-content img {
        display: none;
        width: var(--disconnected-image-width);
        height: var(--disconnected-image-height);
    }

    /* Show disconnected image - Displays when device is in disconnected state */
    .content .display-content-wrapper .display-content.disconnected img {
        display: block;
    }

    /* Invisible click overlay - Transparent button for click handling without visual interference */
    .content button {
        margin: 0;
        padding: 0;
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0;
        z-index: 1;
    }

    /* Click interaction cursor - Shows pointer cursor on hover when clicks are enabled */
    .content.enable-hover button:hover {
        cursor: pointer;
    }
</style>
