<script lang="ts">
    import { onDestroy } from "svelte";
    import { computePosition, flip, shift, offset, type Placement } from "@floating-ui/dom";
    import { fade } from "svelte/transition";
    import { hasMouseCapability } from "$lib/stores/view/navigation";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { ToolTipStyle } from "$lib/style/general";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $ToolTipStyle;

    // Props
    export let zIndex: number = 200; // Default z-index
    export let originalParent: HTMLElement | null = null;
    export let portalElement: HTMLElement | null = null;
    export let pushToTop: boolean = false;
    export let autoPosition: boolean = true;
    export let autoPositionContinuous: boolean = false;
    export let forceShowMobile: boolean = false;
    export let forceBottom: boolean = false;
    export let alignType: "left" | "middle" | "right" = "middle";
    export let showToolTip: boolean;

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
    export let topBorderRadius: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let paddingHorizontal: string | undefined = undefined;
    export let paddingVertical: string | undefined = undefined;
    export let animationTime: number | undefined = undefined;

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
        topBorderRadius,
        backgroundColor,
        paddingHorizontal,
        paddingVertical,
        animationTime,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let parentElement: HTMLElement;
    let tooltipElement: HTMLDivElement;
    let animationTimeNumber: number;
    let eventListenersDefined: boolean = false;
    let enableUpdatePosition: boolean = false;

    // Reactive Statements
    $: animationTimeNumber = parseInt(String(mergedStyle.animationTime));
    $: enableUpdatePosition = showToolTip && tooltipElement && parentElement && autoPosition && ($hasMouseCapability || forceShowMobile);

    $: if (tooltipElement) {
        if (portalElement) {
            portalElement.appendChild(tooltipElement);
        }
        if (originalParent) {
            parentElement = originalParent;
        } else if (tooltipElement.parentElement) {
            parentElement = tooltipElement.parentElement;
        } else {
            throw new Error("Parent element needs to be defined by prop or by dom relationship.");
        }
    }

    $: if (enableUpdatePosition) {
        updatePosition();
    }

    $: if (autoPositionContinuous && enableUpdatePosition && !eventListenersDefined) {
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition);
        eventListenersDefined = true;
    }

    $: if (!enableUpdatePosition && eventListenersDefined) {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition);
        eventListenersDefined = false;
    }

    // Functions
    async function updatePosition(): Promise<void> {
        if (!parentElement || !tooltipElement) return;

        let placement: string;
        if (pushToTop) {
            placement = alignType === "left" ? "top-start" : alignType === "right" ? "top-end" : "top";
        } else {
            placement = alignType === "left" ? "bottom-start" : alignType === "right" ? "bottom-end" : "bottom";
        }

        const { x, y } = await computePosition(parentElement, tooltipElement, {
            placement: placement as Placement,
            middleware: forceBottom
                ? [offset({ mainAxis: parseInt(String(mergedStyle.offsetPx)) }), shift({ padding: parseInt(String(mergedStyle.offsetPx)) })]
                : [offset({ mainAxis: parseInt(String(mergedStyle.offsetPx)) }), flip(), shift({ padding: parseInt(String(mergedStyle.offsetPx)) })],
        });

        Object.assign(tooltipElement.style, {
            left: `${x}px`,
            top: `${y}px`,
        });
    }

    onDestroy(() => {
        if (eventListenersDefined) {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition);
        }
    });
</script>

<!--
  ToolTip component

  A customizable tooltip that appears on hover or when triggered.
  - Automatically positions itself above or below the trigger element based on available space.
  - Supports horizontal alignment (left, center, right) to stay within viewport bounds.
  - Fade in/out animation with configurable duration.
  - Only shows on devices with mouse capability unless forceShowMobile is true.
-->
{#if showToolTip && ($hasMouseCapability || forceShowMobile)}
    <div
        bind:this={tooltipElement}
        transition:fade={{ duration: animationTimeNumber }}
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
        --top-border-radius: {mergedStyle.topBorderRadius ?? mergedStyle.borderRadius};
        --background-color: {mergedStyle.backgroundColor};
        --padding-horizontal: {mergedStyle.paddingHorizontal};
        --padding-vertical: {mergedStyle.paddingVertical};
    "
        class="tooltip-div"
    >
        <div class="content">
            <slot />
        </div>
    </div>
{/if}

<style>
    /* Main tooltip container: positioned absolutely with customizable dimensions and styling */
    .tooltip-div {
        margin: 0;
        width: var(--width);
        min-width: var(--min-width);
        max-width: var(--max-width);
        height: var(--height);
        min-height: var(--min-height);
        max-height: var(--max-height);
        border: var(--border);
        border-radius: var(--border-radius);
        border-top-left-radius: var(--top-border-radius);
        border-top-right-radius: var(--top-border-radius);
        background-color: var(--background-color);
        padding-left: var(--padding-horizontal);
        padding-right: var(--padding-horizontal);
        padding-top: var(--padding-vertical);
        padding-bottom: var(--padding-vertical);
        position: absolute;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        z-index: var(--z-index);
    }

    /* Content wrapper: fills the tooltip container */
    .content {
        position: relative;
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
    }
</style>
