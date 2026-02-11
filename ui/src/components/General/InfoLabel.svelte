<script lang="ts">
    import ToolTip from "./ToolTip.svelte";
    import ToolTipText from "./ToolTipText.svelte";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { ToolTipStyle } from "$lib/style/general";
    import { ToolTipWrapTexStyle } from "$lib/style/general";
    import { InfoLabelStyle } from "$lib/style/general";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    export let toolTipStyle: { [property: string]: string | number } | null = null;
    export let toolTipTextStyle: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $InfoLabelStyle;
    $: toolTipEffectiveStyle = toolTipStyle ?? $ToolTipStyle;
    $: toolTipTextEffectiveStyle = toolTipTextStyle ?? $ToolTipWrapTexStyle;

    // Props
    export let labelText: string;
    export let toolTipText: string;
    export let useIcon: boolean = false;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let borderBottomPos: string | undefined = undefined;
    export let fontColor: string | undefined = undefined;
    export let fontWeight: string | undefined = undefined;
    export let fontSize: string | undefined = undefined;
    export let fontLineHeight: string | undefined = undefined;
    export let fontRightMargin: string | undefined = undefined;
    export let helpIconSize: string | undefined = undefined;
    export let borderBottom: string | undefined = undefined;
    export let hoverFontColor: string | undefined = undefined;
    export let hoverFontWeight: string | undefined = undefined;
    export let hoverBorderBottom: string | undefined = undefined;
    export let transitionTime: string | undefined = undefined;
    export let showToolTipDelay: number | undefined = undefined;

    $: localOverrides = {
        width,
        borderBottomPos,
        fontColor,
        fontWeight,
        fontSize,
        fontLineHeight,
        fontRightMargin,
        helpIconSize,
        borderBottom,
        hoverFontColor,
        hoverFontWeight,
        hoverBorderBottom,
        transitionTime,
        showToolTipDelay,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let showToolTip: boolean = false;
    let showToolTipTimeout: ReturnType<typeof setTimeout> | null = null;
    let showToolTipDelayNumber: number;

    // Reactive Statements
    $: showToolTipDelayNumber = parseInt(String(mergedStyle.showToolTipDelay));

    // Functions
    function handleMouseEnter() {
        showToolTipTimeout = setTimeout(() => {
            showToolTip = true;
        }, showToolTipDelayNumber);
    }

    function handleMouseLeave() {
        if (showToolTipTimeout) {
            clearTimeout(showToolTipTimeout);
            showToolTipTimeout = null;
        }
        showToolTip = false;
    }
</script>

<!--
    InfoLabel
    - Compact label with optional help icon and tooltip.
    - Props: labelText, toolTipText, useIcon and a set of style overrides (see variables below).
    - Use: wrap short inline labels; tooltip appears on hover/touch.
    - Accessibility: tooltip is shown visually; consider adding aria-busy/aria-describedby
        or other ARIA attributes at integration points if needed.
-->
<div
    style="
        --width: {mergedStyle.width};
        --border-bottom-pos: {mergedStyle.borderBottomPos};
        --font-color: {mergedStyle.fontColor};
        --font-weight: {mergedStyle.fontWeight};
        --font-size: {mergedStyle.fontSize};
        --font-line-height: {mergedStyle.fontLineHeight};
        --font-right-margin: {mergedStyle.fontRightMargin};
        --help-icon-size: {useIcon ? mergedStyle.helpIconSize : '0px'};
        --border-bottom: {mergedStyle.borderBottom};
        --hover-font-color: {mergedStyle.hoverFontColor};
        --hover-font-weight: {mergedStyle.hoverFontWeight};
        --hover-border-bottom: {mergedStyle.hoverBorderBottom};
        --transition-time: {mergedStyle.transitionTime};
    "
    class="container"
>
    <button on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave}>
        <div class="text-div">
            <span>{labelText}</span>
            {#if useIcon}
                <img src="/img/help-tooltip.svg" alt="Help" />
            {/if}
            <div class="bottom-border"></div>
        </div>
    </button>
    <ToolTip style={toolTipEffectiveStyle} {showToolTip} forceShowMobile={true} maxHeight={"auto"}>
        <ToolTipText style={toolTipTextEffectiveStyle} text={toolTipText} align="left" wrapText={true} />
    </ToolTip>
</div>

<style>
    /* Wrapper: fixed width and layout for the label + tooltip */
    .container {
        padding: 0;
        margin: 0;
        position: relative;
        width: var(--width);
        height: fit-content;
    }

    /* Button: interactive area that reveals tooltip on hover/focus */
    button {
        margin: 0;
        padding: 0;
        border: none;
        background: none;
        width: 100%;
        height: fit-content;
        display: flex;
        justify-content: start;
        align-items: center;
    }

    /* Text container: holds label text and optional icon */
    .text-div {
        width: 100%;
        height: fit-content;
        margin: 0;
        padding: 0;
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    /* Label text: sizing, color and transitions are controlled via CSS vars */
    span {
        display: inline-block;
        width: calc(var(--width) - var(--font-right-margin) - var(--help-icon-size));
        height: fit-content;
        text-align: left;
        white-space: normal;
        overflow-wrap: break-word;
        color: var(--font-color);
        font-weight: var(--font-weight);
        font-size: var(--font-size);
        border-bottom: var(--border-bottom);
        line-height: var(--font-line-height);
        transition: all var(--transition-time);
    }

    /* Icon: small help icon shown when useIcon is true */
    img {
        width: var(--help-icon-size);
        height: var(--help-icon-size);
        transition: all var(--transition-time);
        opacity: 0.8;
    }

    /* Hover/focus state: change text and icon appearance */
    button:hover span {
        color: var(--hover-font-color);
        font-weight: var(--hover-font-weight);
    }

    button:hover img {
        opacity: 1;
    }

    /* Bottom-border: underline effect positioned relative to the label */
    button .bottom-border {
        width: 100%;
        position: absolute;
        bottom: var(--border-bottom-pos);
        border-bottom: var(--border-bottom);
        transition: all var(--transition-time);
        opacity: 0;
    }

    /* Hover underline: make the bottom-border visible and apply hover style */
    button:hover .bottom-border {
        opacity: 1;
        border-bottom: var(--hover-border-bottom);
    }
</style>
