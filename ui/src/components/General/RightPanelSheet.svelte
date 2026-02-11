<script lang="ts">
    import { tick } from "svelte";
    import { onDestroy } from "svelte";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { RightPanelSheetStyle } from "$lib/style/general";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $RightPanelSheetStyle;

    // Props
    export let useMask: boolean = true;
    export let showPanel: boolean;

    // Layout / styling props
    export let maskBlurFilter: string | undefined = undefined;
    export let maskBackground: string | undefined = undefined;
    export let width: string | undefined = undefined;
    export let minWidth: string | undefined = undefined;
    export let maxWidth: string | undefined = undefined;
    export let paddingTop: string | undefined = undefined;
    export let paddingBottom: string | undefined = undefined;
    export let paddingHorizontal: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let borderLeft: string | undefined = undefined;
    export let shadow: string | undefined = undefined;
    export let titlePaddingLeft: string | undefined = undefined;
    export let titlePaddingRight: string | undefined = undefined;
    export let titlePaddingBottom: string | undefined = undefined;
    export let borderBottomTitle: string | undefined = undefined;
    export let headerPaddingHorizontal: string | undefined = undefined;
    export let headerPaddingTop: string | undefined = undefined;
    export let headerPaddingBottom: string | undefined = undefined;
    export let borderBottomHeader: string | undefined = undefined;
    export let closeButtonWidth: string | undefined = undefined;
    export let closeButtonHeight: string | undefined = undefined;
    export let closeButtonImageWidth: number | undefined = undefined;
    export let closeButtonImageHeight: number | undefined = undefined;
    export let closeButtonColor: string | undefined = undefined;
    export let closeButtonHoverColor: string | undefined = undefined;
    export let contentMarginTop: string | undefined = undefined;
    export let contentMarginBottom: string | undefined = undefined;
    export let contentPaddingHorizontal: string | undefined = undefined;
    export let scrollbarTrackColor: string | undefined = undefined;
    export let scrollbarThumbColor: string | undefined = undefined;

    $: localOverrides = {
        maskBlurFilter,
        maskBackground,
        width,
        minWidth,
        maxWidth,
        paddingTop,
        paddingBottom,
        paddingHorizontal,
        backgroundColor,
        borderLeft,
        shadow,
        titlePaddingLeft,
        titlePaddingRight,
        titlePaddingBottom,
        borderBottomTitle,
        headerPaddingHorizontal,
        headerPaddingTop,
        headerPaddingBottom,
        borderBottomHeader,
        closeButtonWidth,
        closeButtonHeight,
        closeButtonImageWidth,
        closeButtonImageHeight,
        closeButtonColor,
        closeButtonHoverColor,
        contentMarginTop,
        contentMarginBottom,
        contentPaddingHorizontal,
        scrollbarTrackColor,
        scrollbarThumbColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let containerEl: HTMLDivElement;
    let closePanelEventListenerDefined: boolean = false;

    // Reactive Statements
    $: if (useMask && showPanel && !closePanelEventListenerDefined) {
        requestAnimationFrame(() => {
            window.addEventListener("click", handleClickOutside);
            closePanelEventListenerDefined = true;
        });
    }

    $: if (!showPanel && closePanelEventListenerDefined) {
        window.removeEventListener("click", handleClickOutside);
        closePanelEventListenerDefined = false;
    }

    // Functions
    async function handleClickOutside(event: MouseEvent): Promise<void> {
        await tick();
        if (showPanel && containerEl && !containerEl.contains(event.target as Node)) {
            showPanel = false;
        }
    }

    function closePanel(): void {
        showPanel = false;
        if (closePanelEventListenerDefined) {
            window.removeEventListener("click", handleClickOutside);
            closePanelEventListenerDefined = false;
        }
    }

    onDestroy(() => {
        if (closePanelEventListenerDefined) {
            window.removeEventListener("click", handleClickOutside);
        }
    });
</script>

{#if useMask && showPanel}
    <div
        style="
            --mask-blur-filter: {mergedStyle.maskBlurFilter};
            --mask-background-color: {mergedStyle.maskBackground};
        "
        class="mask"
    ></div>
{/if}

<div
    style="
        --width: {mergedStyle.width};
        --min-width: {mergedStyle.minWidth};
        --max-width: {mergedStyle.maxWidth};
        --padding-top: {mergedStyle.paddingTop};
        --padding-bottom: {mergedStyle.paddingBottom};
        --padding-horizontal: {mergedStyle.paddingHorizontal};
        --background-color: {mergedStyle.backgroundColor};
        --border-left: {mergedStyle.borderLeft};
        --shadow: {mergedStyle.shadow};
        --title-padding-left: {mergedStyle.titlePaddingLeft};
        --title-padding-right: {mergedStyle.titlePaddingRight};
        --title-padding-bottom: {mergedStyle.titlePaddingBottom};
        --border-bottom-title: {mergedStyle.borderBottomTitle};
        --header-padding-horizontal: {mergedStyle.headerPaddingHorizontal};
        --header-padding-top: {mergedStyle.headerPaddingTop};
        --header-padding-bottom: {mergedStyle.headerPaddingBottom};
        --border-bottom-header: {mergedStyle.borderBottomHeader};
        --close-button-width: {mergedStyle.closeButtonWidth};
        --close-button-height: {mergedStyle.closeButtonHeight};
        --close-button-color: {mergedStyle.closeButtonColor};
        --close-button-hover-color: {mergedStyle.closeButtonHoverColor};
        --content-margin-top: {mergedStyle.contentMarginTop};
        --content-margin-bottom: {mergedStyle.contentMarginBottom};
        --content-padding-horizontal: {mergedStyle.contentPaddingHorizontal};
        --scrollbar-track-color: {mergedStyle.scrollbarTrackColor};
        --scrollbar-thumb-color: {mergedStyle.scrollbarThumbColor};
    "
    class="container"
    bind:this={containerEl}
    class:open={showPanel}
>
    <div class="content">
        <div class="top-div">
            <div class="title-div">
                <div class="title-content">
                    <slot name="title"></slot>
                </div>
                <button class="close-button" on:click={closePanel} aria-label="Close Window">
                    <svg
                        width={mergedStyle.closeButtonImageWidth}
                        height={mergedStyle.closeButtonImageHeight}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke=""
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <line x1="6" y1="6" x2="18" y2="18" />
                        <line x1="18" y1="6" x2="6" y2="18" />
                    </svg></button
                >
            </div>
            <div class="header-div">
                <slot name="header"></slot>
            </div>
        </div>
        <div class="content-div">
            <slot name="content" />
        </div>
    </div>
</div>

<style>
    .mask {
        margin: 0;
        padding: 0;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--mask-background-color);
        backdrop-filter: blur(var(--mask-blur-filter));
        -webkit-backdrop-filter: blur(var(--mask-blur-filter));
        z-index: 104;
    }

    .container {
        box-sizing: border-box;
        padding: 0;
        margin: 0;
        right: 0;
        left: auto;
        top: 0;
        bottom: 0;
        position: fixed;
        padding-top: var(--padding-top);
        padding-bottom: var(--padding-bottom);
        padding-left: var(--padding-horizontal);
        padding-right: var(--padding-horizontal);
        width: var(--width);
        min-width: var(--min-width);
        max-width: var(--max-width);
        background-color: var(--background-color);
        border-left: var(--border-left);
        box-shadow: var(--shadow);
        transform: translateX(100%);
        transition: transform 0.2s ease-in-out;
        z-index: 105;
    }

    .container.open {
        transform: translateX(0%);
    }

    .content {
        margin: 0;
        padding: 0;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        width: 100%;
        height: 100%;
    }

    .top-div {
        margin: 0;
        padding: 0;
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: start;
    }

    .close-button {
        margin: 0;
        padding: 0;
        width: var(--close-button-width);
        height: var(--close-button-height);
        background-color: transparent;
        border: none;
        cursor: pointer;
        outline: none;
        -webkit-tap-highlight-color: transparent;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    /* SVG icon for close button */
    .close-button svg {
        stroke: var(--close-button-color);
        transition: stroke 0.2s ease;
    }

    /* Close button hover effect */
    .close-button:hover svg {
        stroke: var(--close-button-hover-color);
    }

    .top-div .title-div {
        margin: 0;
        padding: 0;
        width: 100%;
        height: fit-content;
        border-bottom: var(--border-bottom-title);
        display: flex;
        justify-content: space-between;
        align-items: start;
    }

    .top-div .title-div .title-content {
        flex: 1;
        height: var(--close-button-height);
        padding-left: var(--title-padding-left);
        padding-right: var(--title-padding-right);
        padding-bottom: var(--title-padding-bottom);
        min-width: 0;
        overflow: hidden;
    }

    .top-div .header-div {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        width: 100%;
        height: fit-content;
        padding-left: var(--header-padding-horizontal);
        padding-right: var(--header-padding-horizontal);
        padding-top: var(--header-padding-top);
        padding-bottom: var(--header-padding-bottom);
        border-bottom: var(--border-bottom-header);
    }

    /* Content area: fills remaining space */
    .content-div {
        box-sizing: border-box;
        padding: 0;
        margin: 0;
        margin-top: var(--content-margin-top);
        margin-bottom: var(--content-margin-bottom);
        padding-left: var(--content-padding-horizontal);
        padding-right: var(--content-padding-horizontal);
        width: 100%;
        min-height: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: var(--scrollbar-track-color) var(--scrollbar-thumb-color);
        scrollbar-gutter: stable;
    }
</style>
