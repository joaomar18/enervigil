<script lang="ts">
    import { onDestroy } from "svelte";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { FullScreenPanelStyle } from "$lib/style/dashboard";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $FullScreenPanelStyle;

    // Props
    export let show: boolean;

    // Layout / styling props
    export let blurFilter: string | undefined = undefined;
    export let background: string | undefined = undefined;
    export let paddingHorizontal: string | undefined = undefined;
    export let paddingTop: string | undefined = undefined;
    export let paddingBottom: string | undefined = undefined;

    $: localOverrides = {
        blurFilter,
        background,
        paddingHorizontal,
        paddingTop,
        paddingBottom,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let fullscreenContainer: HTMLDivElement;
    let contentContainer: HTMLDivElement;
    let loaded: boolean = false;

    // Reactive Statements
    $: if (!loaded && fullscreenContainer) {
        requestAnimationFrame(() => {
            document.body.appendChild(fullscreenContainer);
            window.addEventListener("click", handleClick);
            loaded = true;
        });
    }

    // Functions
    function handleClick(event: MouseEvent): void {
        if (fullscreenContainer && contentContainer && !contentContainer.contains(event.target as Node)) {
            show = false;
        }
    }

    onDestroy(() => {
        if (loaded) {
            document.body.removeChild(fullscreenContainer);
            window.removeEventListener("click", handleClick);
            loaded = false;
        }
    });
</script>

<!--
    FullScreenPanel Component
    
    A modal overlay component that creates a full-viewport panel with DOM portaling capabilities.
    Features click-outside detection for dismissal, backdrop blur effects, and responsive padding.
    Uses DOM manipulation to mount directly to document.body for proper z-index layering above
    all other content. Provides smooth loading transitions and automatic cleanup on component
    destruction. Supports theming with configurable blur filters and background colors.
    Handles event management for user interaction and accessibility patterns.
-->
<div
    bind:this={fullscreenContainer}
    style="
        --blur-filter: {mergedStyle.blurFilter};
        --background: {mergedStyle.background};
        --padding-horizontal: {mergedStyle.paddingHorizontal};
        --padding-top: {mergedStyle.paddingTop};
        --padding-bottom: {mergedStyle.paddingBottom};
    "
    class="fullscreen-div"
    class:loaded
>
    <div bind:this={contentContainer} class="content"><slot /></div>
</div>

<style>
    /* Fullscreen overlay container - Fixed position viewport overlay with portal rendering */
    .fullscreen-div {
        position: fixed;
        display: none;
        margin: 0;
        padding: 0;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 1000;
        backdrop-filter: blur(var(--blur-filter));
        -webkit-backdrop-filter: blur(var(--blur-filter));
        background: var(--background);
    }

    /* Loaded state - Displays overlay after DOM portal mount to prevent flash */
    .fullscreen-div.loaded {
        display: block;
    }

    /* Content wrapper - Full viewport container for slotted content with relative positioning */
    .content {
        width: 100%;
        height: 100%;
        position: relative;
        margin: 0;
        padding: 0;
    }

    /* Responsive padding - Applies content padding only on larger screens for better mobile UX */
    @media (min-width: 880px) {
        .fullscreen-div {
            padding-top: var(--padding-top);
            padding-bottom: var(--padding-bottom);
            padding-left: var(--padding-horizontal);
            padding-right: var(--padding-horizontal);
        }
    }
</style>
