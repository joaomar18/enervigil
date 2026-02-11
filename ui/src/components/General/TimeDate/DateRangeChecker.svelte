<script lang="ts">
    import { onDestroy } from "svelte";
    import { getElegantStringFromDate } from "$lib/logic/util/date";
    import ToolTip from "../ToolTip.svelte";

    // Texts
    import { selectedLang } from "$lib/stores/lang/definition";
    import { texts } from "$lib/stores/lang/generalTexts";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { DateRangeCheckerStyle, ToolTipDateCheckerStyle } from "$lib/style/general";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    export let toolTipStyle: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $DateRangeCheckerStyle;
    $: effectiveToolTipStyle = toolTipStyle ?? $ToolTipDateCheckerStyle;

    // Props
    export let fullWidth: boolean = false;
    export let showToolTip: boolean = true;
    export let useToolTip: boolean = true;
    export let initialDate: Date;
    export let endDate: Date;

    // Layout / styling props
    export let paddingHorizontal: string | undefined = undefined;
    export let paddingTop: string | undefined = undefined;
    export let paddingBottom: string | undefined = undefined;
    export let fsTextSize: string | undefined = undefined;
    export let textSize: string | undefined = undefined;
    export let labelWidth: string | undefined = undefined;
    export let fsLabelWidth: string | undefined = undefined;
    export let labelColor: string | undefined = undefined;
    export let labelWeight: string | undefined = undefined;
    export let valueColor: string | undefined = undefined;
    export let valueWeight: string | undefined = undefined;
    export let rowGap: string | undefined = undefined;
    export let fsRowPaddingHorizontal: string | undefined = undefined;
    export let fsBorderRight: string | undefined = undefined;

    $: localOverrides = {
        paddingHorizontal,
        paddingTop,
        paddingBottom,
        fsTextSize,
        textSize,
        labelWidth,
        fsLabelWidth,
        labelColor,
        labelWeight,
        valueColor,
        valueWeight,
        rowGap,
        fsRowPaddingHorizontal,
        fsBorderRight,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let containerDiv: HTMLDivElement;
    let clickEventListenerDefined: boolean = false;
    let initialDateString: string;
    let endDateString: string;

    // Reactive Statements
    $: if ($selectedLang) initialDateString = getElegantStringFromDate(initialDate);
    $: if ($selectedLang) endDateString = getElegantStringFromDate(endDate);

    $: if (!showToolTip && clickEventListenerDefined) {
        window.removeEventListener("click", handleClickOutside);
        clickEventListenerDefined = false;
    }
    $: if (showToolTip && !clickEventListenerDefined) {
        requestAnimationFrame(() => {
            window.addEventListener("click", handleClickOutside);
            clickEventListenerDefined = true;
        });
    }

    // Functions
    function handleClickOutside(event: MouseEvent): void {
        if (showToolTip && containerDiv && !containerDiv.contains(event.target as Node)) {
            showToolTip = false;
        }
    }

    onDestroy(() => {
        if (clickEventListenerDefined) {
            window.removeEventListener("click", handleClickOutside);
        }
    });
</script>

<!--
    DateRangeChecker Component
    
    Displays a formatted date range (start and end dates) with flexible layout modes: 
    tooltip popup, inline display, or full-width horizontal layout. Formats dates via 
    getElegantStringFromDate utility and supports i18n labels ("From"/"To"). Features 
    click-outside dismissal for tooltip mode, automatic event listener cleanup, and 
    extensive theming support via CSS variables. Used in time period pickers and graph 
    headers to show the currently selected or active date range.
-->
{#if fullWidth}
    <div
        style="
            --fs-text-size: {mergedStyle.fsTextSize};
            --fs-label-width: {mergedStyle.fsLabelWidth};
            --label-color: {mergedStyle.labelColor};
            --label-weight: {mergedStyle.labelWeight};
            --value-color: {mergedStyle.valueColor};
            --value-weight: {mergedStyle.valueWeight};
            --fs-row-padding-horizontal: {mergedStyle.fsRowPaddingHorizontal};
            --fs-border-right: {mergedStyle.fsBorderRight};
        "
        class="content"
        class:full-width={fullWidth}
    >
        <div class="row">
            <div class="label-div">
                <span class="label">{$texts.fromDate}</span>
            </div>
            <div class="value-div">
                <span class="value">{initialDateString}</span>
            </div>
        </div>
        <div class="row">
            <div class="label-div">
                <span class="label">{$texts.toDate}</span>
            </div>
            <div class="value-div">
                <span class="value">{endDateString}</span>
            </div>
        </div>
    </div>
{:else if useToolTip}
    <ToolTip style={effectiveToolTipStyle} autoPositionContinuous={true} zIndex={198} {showToolTip} forceShowMobile={true}>
        <div
            style="
                    --padding-horizontal: {mergedStyle.paddingHorizontal};
                    --padding-top: {mergedStyle.paddingTop};
                    --padding-bottom: {mergedStyle.paddingBottom};
                    --text-size: {mergedStyle.textSize};
                    --label-width: {mergedStyle.labelWidth};
                    --label-color: {mergedStyle.labelColor};
                    --label-weight: {mergedStyle.labelWeight};
                    --value-color: {mergedStyle.valueColor};
                    --value-weight: {mergedStyle.valueWeight};
                    --row-gap: {mergedStyle.rowGap};
                "
            bind:this={containerDiv}
            class="date-checker-div"
        >
            <div class="content" class:full-width={fullWidth}>
                <div class="row">
                    <div class="label-div">
                        <span class="label">{$texts.fromDate}</span>
                    </div>
                    <div class="value-div">
                        <span class="value">{initialDateString}</span>
                    </div>
                </div>
                <div class="row">
                    <div class="label-div">
                        <span class="label">{$texts.toDate}</span>
                    </div>
                    <div class="value-div">
                        <span class="value">{endDateString}</span>
                    </div>
                </div>
            </div>
        </div>
    </ToolTip>
{:else}
    <div
        style="
                    --text-size: {mergedStyle.textSize};
                    --label-width: {mergedStyle.labelWidth};
                    --label-color: {mergedStyle.labelColor};
                    --label-weight: {mergedStyle.labelWeight};
                    --value-color: {mergedStyle.valueColor};
                    --value-weight: {mergedStyle.valueWeight};
                    --row-gap: {mergedStyle.rowGap};
                "
        bind:this={containerDiv}
        class="date-checker-div"
        class:no-padding={!useToolTip}
    >
        <div class="content" class:full-width={fullWidth}>
            <div class="row">
                <div class="label-div">
                    <span class="label">{$texts.fromDate}</span>
                </div>
                <div class="value-div">
                    <span class="value">{initialDateString}</span>
                </div>
            </div>
            <div class="row">
                <div class="label-div">
                    <span class="label">{$texts.toDate}</span>
                </div>
                <div class="value-div">
                    <span class="value">{endDateString}</span>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    /* Main container - Wrapper for tooltip content with configurable padding and container queries */
    .date-checker-div {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding-top: var(--padding-top);
        padding-bottom: var(--padding-bottom);
        padding-left: var(--padding-horizontal);
        padding-right: var(--padding-horizontal);
        container-type: inline-size;
    }

    /* Container without padding - Used when displayed inline without tooltip wrapper */
    .date-checker-div.no-padding {
        padding: 0;
    }

    /* Content wrapper - Flexbox container for date range rows with vertical or horizontal layout */
    .content {
        margin: 0;
        padding: 0;
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        gap: var(--row-gap);
    }

    /* Full-width content layout - Switches to horizontal row arrangement for wide displays */
    .content.full-width {
        flex-direction: row;
        gap: 0px;
    }

    /* Individual date row - Horizontal layout for label and value pairs */
    .content .row {
        display: flex;
        flex-direction: row;
        width: 100%;
        justify-content: space-between;
        align-items: center;
    }

    /* Full-width row styling - Adds horizontal padding and dividers between date range elements */
    .content.full-width .row {
        padding-left: var(--fs-row-padding-horizontal);
        padding-right: var(--fs-row-padding-horizontal);
        border-right: var(--fs-border-right);
        height: 100%;
    }

    /* First row in full-width - Removes left padding to align with container edge */
    .content.full-width .row:first-child {
        padding-left: 0;
    }

    /* Last row in full-width - Removes right border to prevent trailing divider */
    .content.full-width .row:last-child {
        border-right: none;
    }

    /* Label container - Fixed width area for "From/To" labels */
    .content .row .label-div {
        width: var(--label-width);
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
    }

    /* Full-width label container - Uses alternate width variable for wide layouts */
    .content.full-width .row .label-div {
        width: var(--fs-label-width);
    }

    /* Date label text - Styled "From Date" and "To Date" labels */
    .content .row .label-div .label {
        font-size: var(--text-size);
        font-weight: var(--label-weight);
        color: var(--label-color);
    }

    /* Full-width label text - Uses alternate font size for wide layouts */
    .content.full-width .row .label-div .label {
        font-size: var(--fs-text-size);
    }

    /* Value container - Flexible area for formatted date values with right alignment */
    .value-div {
        flex: 1;
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: end;
        align-items: center;
    }

    /* Date value text - Styled formatted date strings with ellipsis overflow handling */
    .content .row .value-div .value {
        font-size: var(--text-size);
        font-weight: var(--value-weight);
        color: var(--value-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Full-width value text - Uses alternate font size for wide layouts */
    .content.full-width .row .value-div .value {
        font-size: var(--fs-text-size);
    }
</style>
