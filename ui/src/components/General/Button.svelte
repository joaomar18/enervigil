<script lang="ts">
    import { onDestroy } from "svelte";
    import ToolTip from "./ToolTip.svelte";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { DefaultButtonStyle } from "$lib/style/button";
    import { ToolTipStyle } from "$lib/style/general";

    //Props
    export let enabled: boolean = true;
    export let selected: boolean = false;
    export let processing: boolean = false;
    export let buttonText: string;
    export let subButtonText: string = "";
    export let imageURL: string = "";
    export let enableToolTip: boolean = false;
    export let toolTipAutoPos: boolean = true;
    export let minClickTimeMs: number | undefined = undefined; // Filter time for the button click

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    export let toolTipStyle: { [property: string]: string | number } = $ToolTipStyle;
    $: effectiveStyle = style ?? $DefaultButtonStyle;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let minWidth: string | undefined = undefined;
    export let maxWidth: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let borderRadius: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let disabledBackgroundColor: string | undefined = undefined;
    export let selectedBackgroundColor: string | undefined = undefined;
    export let borderColor: string | undefined = undefined;
    export let disabledBorderColor: string | undefined = undefined;
    export let selectedBorderColor: string | undefined = undefined;
    export let hoverColor: string | undefined = undefined;
    export let disabledHoverColor: string | undefined = undefined;
    export let selectedHoverColor: string | undefined = undefined;
    export let fontColor: string | undefined = undefined;
    export let disabledFontColor: string | undefined = undefined;
    export let selectedFontColor: string | undefined = undefined;
    export let fontSize: string | undefined = undefined;
    export let subFontSize: string | undefined = undefined;
    export let fontWeight: string | undefined = undefined;
    export let subFontWeight: string | undefined = undefined;
    export let imageWidth: string | undefined = undefined;
    export let imageHeight: string | undefined = undefined;
    export let imageRightPos: string | undefined = undefined;
    export let imageLeftPos: string | undefined = undefined;
    export let showToolTipDelay: string | undefined = undefined;

    $: localOverrides = {
        width,
        minWidth,
        maxWidth,
        height,
        borderRadius,
        backgroundColor,
        disabledBackgroundColor,
        selectedBackgroundColor,
        borderColor,
        disabledBorderColor,
        selectedBorderColor,
        hoverColor,
        disabledHoverColor,
        selectedHoverColor,
        fontColor,
        disabledFontColor,
        selectedFontColor,
        fontSize,
        subFontSize,
        fontWeight,
        subFontWeight,
        imageWidth,
        imageHeight,
        imageRightPos,
        imageLeftPos,
        showToolTipDelay,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let showToolTip: boolean = false;
    let showToolTipTimeout: ReturnType<typeof setTimeout> | null = null;
    let showToolTipDelayNumber: number;
    let minClickTimeout: ReturnType<typeof setTimeout> | null = null;

    // Reactive Statements
    $: showToolTipDelayNumber = parseInt(String(mergedStyle.showToolTipDelay));

    // Click Export Function
    export let onClick: () => void;

    // Functions
    function handleClick(): void {
        if (onClick && enabled && !processing && minClickTimeout === null) {
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

    function handleMouseEnter(): void {
        if (enableToolTip) {
            showToolTipTimeout = setTimeout(() => {
                showToolTip = true;
            }, showToolTipDelayNumber);
        }
    }

    function handleMouseLeave(): void {
        if (enableToolTip) {
            if (showToolTipTimeout) {
                clearTimeout(showToolTipTimeout);
                showToolTipTimeout = null;
            }
            showToolTip = false;
        }
    }

    onDestroy(() => {
        resetClickTimeout();
    });
</script>

<!--
  Reusable Button component:
  - Highly customizable via CSS variables for size, colors, border, and typography.
  - Supports optional icon (image) on the left or right, with configurable size and position.
  - Handles enabled/disabled states with separate styles and disables click when not enabled.
  - Accepts a click handler via the `onClick` prop.
  - Accessible: sets `aria-label` to button text.
  - Usage: <Button buttonText="Click me" onClick={...} ...otherProps />
-->
<button
    style="
        --width: {mergedStyle.width};
        --min-width: {mergedStyle.minWidth};
        --max-width: {mergedStyle.maxWidth};
        --height: {mergedStyle.height};
        --border-radius: {mergedStyle.borderRadius};
        --background-color: {mergedStyle.backgroundColor};
        --disabled-background-color: {mergedStyle.disabledBackgroundColor};
        --selected-background-color: {mergedStyle.selectedBackgroundColor};
        --border-color: {mergedStyle.borderColor};
        --disabled-border-color: {mergedStyle.disabledBorderColor};
        --selected-border-color: {mergedStyle.selectedBorderColor};
        --hover-color: {mergedStyle.hoverColor};
        --disabled-hover-color: {mergedStyle.disabledHoverColor};
        --selected-hover-color: {mergedStyle.selectedHoverColor};
        --font-color: {mergedStyle.fontColor};
        --disabled-font-color: {mergedStyle.disabledFontColor};
        --selected-font-color: {mergedStyle.selectedFontColor};
        --font-size: {mergedStyle.fontSize};
        --sub-font-size: {mergedStyle.subFontSize};
        --font-weight: {mergedStyle.fontWeight};
        --sub-font-weight: {mergedStyle.subFontWeight};
        --image-width: {mergedStyle.imageWidth};
        --image-height: {mergedStyle.imageHeight};
        --image-right-position: {mergedStyle.imageRightPos};
        --image-left-position: {mergedStyle.imageLeftPos};
    "
    class:align-left={mergedStyle.imageRightPos != "auto" && imageURL && !processing}
    class:align-right={mergedStyle.imageLeftPos != "auto" && imageURL && !processing}
    class:disabled={!enabled || processing}
    class:selected={enabled && selected}
    aria-label="{buttonText}{subButtonText}"
    on:click={handleClick}
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
>
    {#if !processing}
        {#if buttonText && subButtonText}
            <div class="text">
                <span class="main-text">{buttonText}</span>
                <span class="sub-text">{subButtonText}</span>
            </div>
        {:else if buttonText}
            <span class="main-text">{buttonText}</span>
        {:else if subButtonText}
            <span class="sub-text">{subButtonText}</span>
        {/if}
        {#if imageURL}
            <img class:center={!buttonText && !subButtonText} src={imageURL} alt={imageURL} />
        {/if}
    {:else}
        <svg class="loader" width={mergedStyle.imageWidth} height={mergedStyle.imageHeight} viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
            <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
        </svg>
    {/if}
    <ToolTip style={toolTipStyle} {showToolTip} autoPosition={toolTipAutoPos}>
        <slot name="tooltip" />
    </ToolTip>
</button>

<style>
    /* Main button - Flexible base with configurable dimensions, colors, border, and smooth transitions */
    button {
        margin: 0;
        padding: 0;
        position: relative;
        width: var(--width);
        min-width: var(--min-width, 0px);
        max-width: var(--max-width, --width);
        height: var(--height);
        border-radius: var(--border-radius, 0px);
        background-color: var(--background-color);
        border: 1px solid var(--border-color);
        cursor: pointer;
        transition: background-color 0.2s ease;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }

    /* Disabled state - Muted colors and cursor set to auto to indicate non-interactive state */
    button.disabled {
        background-color: var(--disabled-background-color);
        border: 1px solid var(--disabled-border-color);
        cursor: auto;
    }

    /* Selected state - Alternate background and border colors for active/selected appearance */
    button.selected {
        background-color: var(--selected-background-color);
        border: 1px solid var(--selected-border-color);
    }

    /* Left-aligned layout - Text aligned left with padding to accommodate right-positioned icon */
    button.align-left {
        text-align: left;
        padding-left: var(--image-right-position);
    }

    /* Right-aligned layout - Text aligned right with padding to accommodate left-positioned icon */
    button.align-right {
        text-align: right;
        padding-right: var(--image-left-position);
    }

    /* Hover state - Changes background color on mouse over for interactive feedback */
    button:hover {
        background-color: var(--hover-color);
    }

    /* Disabled hover state - Maintains disabled appearance on hover to reinforce non-interactive state */
    button.disabled:hover {
        background-color: var(--disabled-hover-color);
    }

    /* Selected hover state - Alternate hover color for selected buttons */
    button.selected:hover {
        background-color: var(--selected-hover-color);
    }

    /* Text container - Flex layout for main and sub text with baseline alignment */
    button .text {
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: baseline;
    }

    /* Main button text - Primary label with configurable font size, color, and weight */
    button .main-text {
        padding: 0;
        margin: 0;
        font-size: var(--font-size);
        color: var(--font-color);
        font-weight: var(--font-weight);
    }

    /* Sub button text - Secondary label with smaller font size and lighter weight */
    button .sub-text {
        padding: 0;
        margin: 0;
        font-size: var(--sub-font-size);
        color: var(--font-color);
        font-weight: var(--sub-font-weight);
    }

    /* Button icon - Absolutely positioned image with configurable size and left/right placement */
    button img {
        width: var(--image-width);
        height: var(--image-height);
        position: absolute;
        top: 50%;
        left: var(--image-left-position);
        right: var(--image-right-position);
        transform: translateY(-50%);
    }

    /* Centered icon - Centers image when no text is present for icon-only buttons */
    button img.center {
        left: 50%;
        transform: translate(-50%, -50%);
    }

    /* Loading spinner - Rotating SVG animation shown during processing state */
    .loader {
        animation: rotate 1s linear infinite;
        transform-origin: center;
    }

    /* Spinner circle path - Animated stroke with dashed appearance for loading indication */
    .path {
        stroke: white;
        stroke-linecap: butt;
        stroke-dasharray: 90, 150;
        stroke-dashoffset: 0;
    }

    /* Rotation keyframe - Continuous 360-degree rotation for loading spinner animation */
    @keyframes rotate {
        100% {
            transform: rotate(360deg);
        }
    }
</style>
