<script lang="ts">
    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { SlottedActionStyle } from "$lib/style/general";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $SlottedActionStyle;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let borderRadius: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let borderColor: string | undefined = undefined;
    export let hoverColor: string | undefined = undefined;

    $: localOverrides = {
        width,
        height,
        borderRadius,
        backgroundColor,
        borderColor,
        hoverColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Click Export Funcion
    export let onClick: () => void;

    // Functions
    function handleClick(): void {
        if (onClick) {
            onClick();
        }
    }
</script>

<!--
    SlottedAction: a flexible, stylable button-like container for custom content.
    Renders a slot for any child content and overlays an invisible button for click handling.
-->
<div
    class="action-button-div"
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
        <div class="slot-div">
            <slot />
        </div>
        <button on:click={handleClick} aria-label="Action Button"></button>
    </div>
</div>

<style>
    /* Main container for the slotted action button */
    .action-button-div {
        box-sizing: border-box;
        width: var(--width);
        height: var(--height);
        margin: 0;
        padding: 0;
        background-color: var(--background-color);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        transform-origin: center;
        -webkit-font-smoothing: antialiased;
        shape-rendering: geometricPrecision;
    }

    /* Hover effect for background color */
    .action-button-div:hover {
        background-color: var(--hover-color);
    }

    /* Content wrapper for slot and button */
    .content {
        position: relative;
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

    /* Slot container for custom content */
    .content .slot-div {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    /* Invisible button overlay for click handling */
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
</style>
