<script lang="ts">
    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { GraphToolTipStyle } from "$lib/style/graph";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $GraphToolTipStyle;

    // Props
    export let zIndex: number = 197; // Default z-index
    export let gridElement: HTMLDivElement;
    export let cursorPos: { x: number | undefined; y: number | undefined };
    export let insideGraph: boolean;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let minWidth: string | undefined = undefined;
    export let maxWidth: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let minHeight: string | undefined = undefined;
    export let maxHeight: string | undefined = undefined;
    export let offsetPx: string | undefined = undefined;
    export let border: string | undefined = undefined;
    export let borderRadius: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let paddingHorizontal: string | undefined = undefined;
    export let paddingVertical: string | undefined = undefined;

    $: localOverrides = {
        width,
        minWidth,
        maxWidth,
        height,
        minHeight,
        maxHeight,
        offsetPx,
        border,
        borderRadius,
        backgroundColor,
        paddingHorizontal,
        paddingVertical,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let parentElement: HTMLElement;
    let tooltipElement: HTMLDivElement;
    let firstPosUpdate: boolean = false;

    // Reactive Statements
    $: if (tooltipElement && gridElement) {
        if (tooltipElement.parentElement !== gridElement) {
            gridElement.appendChild(tooltipElement);
        }
        parentElement = gridElement;
    }
    $: if (tooltipElement && cursorPos && cursorPos.x !== undefined && cursorPos.y !== undefined) {
        updatePosition();
    }
    $: if (!insideGraph) {
        firstPosUpdate = false;
    }

    // Functions
    function updatePosition(): void {
        if (!parentElement || !tooltipElement || cursorPos.x === undefined || cursorPos.y === undefined) return;
        const padding = parseInt(String(mergedStyle.offsetPx));
        const parentWidth = parentElement.clientWidth;
        const parentHeight = parentElement.clientHeight;
        const tooltipWidth = tooltipElement.offsetWidth;
        const tooltipHeight = tooltipElement.offsetHeight;

        let left = cursorPos.x + padding;
        let top = cursorPos.y + padding;
        if (left + tooltipWidth + padding > parentWidth) {
            left = cursorPos.x - tooltipWidth - padding;
        }

        // Clamp to parent bounds with padding
        left = Math.max(padding, Math.min(left, parentWidth - tooltipWidth - padding));
        top = Math.max(padding, Math.min(top, parentHeight - tooltipHeight - padding));

        Object.assign(tooltipElement.style, {
            left: `${left}px`,
            top: `${top}px`,
        });

        firstPosUpdate = true;
    }
</script>

<!--
    GraphToolTip Component
    
    A specialized tooltip component designed for graph overlays with manual positioning.
    Features DOM portaling into uPlot's u-over element, boundary-aware positioning with
    configurable offsets, and real-time cursor tracking. Handles coordinate system integration
    with graph libraries and provides padding-aware positioning to prevent tooltip overflow.
    Supports comprehensive theming and conditional rendering based on graph interaction state.
-->
{#if insideGraph}
    <div
        bind:this={tooltipElement}
        style="
            --z-index: {zIndex};
            --width: {mergedStyle.width};
            --min-width: {mergedStyle.minWidth};
            --max-width: {mergedStyle.maxWidth};
            --height: {mergedStyle.height};
            --min-height: {mergedStyle.minHeight};
            --max-height: {mergedStyle.maxHeight};
            --offset: {mergedStyle.offsetPx};
            --border: {mergedStyle.border};
            --border-radius: {mergedStyle.borderRadius};
            --background-color: {mergedStyle.backgroundColor};
            --padding-horizontal: {mergedStyle.paddingHorizontal};
            --padding-vertical: {mergedStyle.paddingVertical};
        "
        class="tooltip-div"
        class:show={firstPosUpdate}
    >
        <div class="content">
            <slot />
        </div>
    </div>
{/if}

<style>
    /* Main tooltip container - Absolutely positioned overlay with manual coordinate tracking */
    .tooltip-div {
        margin: 0;
        position: absolute;
        width: var(--width);
        min-width: var(--min-width);
        max-width: var(--max-width);
        height: var(--height);
        min-height: var(--min-height);
        max-height: var(--max-height);
        border: var(--border);
        border-radius: var(--border-radius);
        background-color: var(--background-color);
        padding-left: var(--padding-horizontal);
        padding-right: var(--padding-horizontal);
        padding-top: var(--padding-vertical);
        padding-bottom: var(--padding-vertical);
        pointer-events: none;
        opacity: 0;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        z-index: var(--z-index);
    }

    /* Visible state - Applied when tooltip should be displayed to user */
    .tooltip-div.show {
        opacity: 1;
    }

    /* Content wrapper - Container for tooltip children with full dimensions */
    .content {
        position: relative;
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
    }
</style>
