<script lang="ts">
    import ToolTip from "./ToolTip.svelte";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { ActionStyle } from "$lib/style/general";
    import { ToolTipStyle } from "$lib/style/general";

    // Props
    export let imageURL: string = "";
    export let disabledImageURL: string = "";
    export let enableToolTip: boolean = false;
    export let toolTipAutoPos: boolean = true;
    export let disabled: boolean = false;

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    export let toolTipStyle: { [property: string]: string | number } = $ToolTipStyle;
    $: effectiveStyle = style ?? $ActionStyle;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let borderRadius: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let borderColor: string | undefined = undefined;
    export let hoverColor: string | undefined = undefined;
    export let imageWidth: string | undefined = undefined;
    export let imageHeight: string | undefined = undefined;
    export let showToolTipDelay: number | undefined = undefined;

    $: localOverrides = {
        width,
        height,
        borderRadius,
        backgroundColor,
        borderColor,
        hoverColor,
        imageWidth,
        imageHeight,
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

    // Click Export Function
    export let onClick: () => void;

    // Functions
    function handleClick(): void {
        if (onClick && !disabled) {
            onClick();
        }
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
</script>

<!-- 
  Action Button: Reusable clickable component with optional image and tool tip
-->
<div
    class="action-button-div"
    class:enabled={!disabled}
    style="
        --width: {mergedStyle.width};
        --height: {mergedStyle.height};
        --border-radius: {mergedStyle.borderRadius};
        --background-color: {mergedStyle.backgroundColor};
        --border-color: {mergedStyle.borderColor};
        --hover-color: {mergedStyle.hoverColor};
    "
>
    <div class="content">
        {#if mergedStyle.imageWidth && mergedStyle.imageHeight}
            <img
                style="
            --image-width: {mergedStyle.imageWidth};
            --image-height: {mergedStyle.imageHeight};
        "
                src={!disabled ? imageURL : disabledImageURL}
                alt={!disabled ? imageURL : disabledImageURL}
            />
        {/if}
        <button class:disabled on:click={handleClick} on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave} aria-label="Action Button"
        ></button>
        <ToolTip style={toolTipStyle} {showToolTip} autoPosition={toolTipAutoPos}>
            <slot name="tooltip" />
        </ToolTip>
    </div>
</div>

<style>
    /* Wrapper: size, shape, and base look */
    .action-button-div {
        box-sizing: border-box;
        position: relative;
        width: var(--width);
        height: var(--height);
        margin: 0;
        padding: 0;
        background-color: var(--background-color);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        transform-origin: center;
        -webkit-font-smoothing: antialiased;
        shape-rendering: geometricPrecision;
        transition: all 0.2s;
    }

    /* Hover state: visual feedback on pointer-over */
    .action-button-div.enabled:hover {
        background-color: var(--hover-color);
    }

    /* Content container: centers icon or label */
    .content {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        -webkit-tap-highlight-color: transparent;
    }

    /* Invisible overlay button: captures clicks */
    button {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        padding: 0;
        margin: 0;
        opacity: 0;
        cursor: pointer;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }

    /* When the action is disabled the cursor is unset from pointer */
    button.disabled {
        cursor: auto;
    }

    /* Icon sizing: driven by CSS variables */
    img {
        width: var(--image-width, 0px);
        height: var(--image-height, 0px);
        transition: all 0.2s;
    }
</style>
