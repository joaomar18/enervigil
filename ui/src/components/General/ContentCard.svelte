<script lang="ts">
    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { ContentCardStyle } from "$lib/style/general";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $ContentCardStyle;

    // Props
    export let cardElement: HTMLDivElement | null = null;
    export let titleText: string = "";
    export let useLeftHeader: boolean = false;
    export let useScroll: boolean = true;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let minHeight: string | undefined = undefined;
    export let maxHeight: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let borderColor: string | undefined = undefined;
    export let shadow: string | undefined = undefined;
    export let borderRadius: string | undefined = undefined;
    export let leftContentPaddingRight: string | undefined = undefined;
    export let leftContentRightBorder: string | undefined = undefined;
    export let titleSize: string | undefined = undefined;
    export let titleColor: string | undefined = undefined;
    export let titleWeight: string | undefined = undefined;
    export let titlePaddingLeft: string | undefined = undefined;
    export let titlePaddingRight: string | undefined = undefined;
    export let headerWidth: string | undefined = undefined;
    export let headerHeight: string | undefined = undefined;
    export let headerBorder: string | undefined = undefined;
    export let headerPaddingTop: string | undefined = undefined;
    export let headerPaddingBottom: string | undefined = undefined;
    export let contentPaddingTop: string | undefined = undefined;
    export let contentPaddingBottom: string | undefined = undefined;
    export let contentPaddingHorizontal: string | undefined = undefined;
    export let scrollbarTrackColor: string | undefined = undefined;
    export let scrollbarThumbColor: string | undefined = undefined;

    $: localOverrides = {
        width,
        height,
        minHeight,
        maxHeight,
        backgroundColor,
        borderColor,
        shadow,
        borderRadius,
        leftContentPaddingRight,
        leftContentRightBorder,
        titleSize,
        titleColor,
        titleWeight,
        titlePaddingLeft,
        titlePaddingRight,
        headerWidth,
        headerHeight,
        headerBorder,
        headerPaddingTop,
        headerPaddingBottom,
        contentPaddingTop,
        contentPaddingBottom,
        contentPaddingHorizontal,
        scrollbarTrackColor,
        scrollbarThumbColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);
</script>

<!-- Reusable card component: displays a title header with optional slot content and scrollable body content -->
<div
    bind:this={cardElement}
    style="
        --width: {mergedStyle.width};
        --height: {mergedStyle.height};
        --min-height: {mergedStyle.minHeight};
        --max-height: {mergedStyle.maxHeight};
        --background-color: {mergedStyle.backgroundColor};
        --border-color: {mergedStyle.borderColor};
        --border-radius: {mergedStyle.borderRadius};
        --shadow: {mergedStyle.shadow};
        --left-content-padding-right: {mergedStyle.leftContentPaddingRight};
        --left-content-right-border: {mergedStyle.leftContentRightBorder};
        --title-size: {mergedStyle.titleSize};
        --title-color: {mergedStyle.titleColor};
        --title-weight: {mergedStyle.titleWeight};
        --title-padding-left: {mergedStyle.titlePaddingLeft};
        --title-padding-right: {mergedStyle.titlePaddingRight};
        --header-width: {mergedStyle.headerWidth};
        --header-height: {mergedStyle.headerHeight};
        --header-border: {mergedStyle.headerBorder};
        --header-padding-top: {mergedStyle.headerPaddingTop};
        --header-padding-bottom: {mergedStyle.headerPaddingBottom};
        --content-padding-top: {mergedStyle.contentPaddingTop};
        --content-padding-bottom: {mergedStyle.contentPaddingBottom};
        --content-padding-horizontal: {mergedStyle.contentPaddingHorizontal};
        --scrollbar-track-color: {mergedStyle.scrollbarTrackColor};
        --scrollbar-thumb-color: {mergedStyle.scrollbarThumbColor};
    "
    class="container"
>
    <div class="header">
        <div class="left-slot-content" class:use={useLeftHeader}>
            <slot name="left-header" />
        </div>
        <h3>{titleText}</h3>
        <div class="slot-content">
            <slot name="header" />
        </div>
    </div>
    <div class="content">
        <div class="wrapper" class:scroll-on={useScroll}>
            <slot name="content" />
        </div>
    </div>
</div>

<style>
    /* Main container: sets card dimensions, background, border, and layout structure */
    .container {
        margin: 0;
        padding: 0;
        position: relative;
        width: var(--width);
        height: var(--height);
        min-height: var(--min-height);
        max-height: var(--max-height);
        background-color: var(--background-color);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
    }

    /* Header section: contains title and optional slot content, positioned at top of card */
    .header {
        margin: 0;
        padding: 0;
        width: var(--header-width);
        height: var(--header-height);
        padding-top: var(--header-padding-top);
        padding-bottom: var(--header-padding-bottom);
        border-bottom: var(--header-border);
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    /* Header title: styled text element positioned on the left side of header */
    .header h3 {
        margin: 0;
        padding: 0;
        line-height: var(--header-height);
        padding-left: var(--title-padding-left);
        padding-right: var(--title-padding-right);
        text-align: left;
        color: var(--title-color);
        font-weight: var(--title-weight);
        font-size: var(--title-size);
        flex: 1;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .header .left-slot-content {
        margin: 0;
        padding: 0;
        width: fit-content;
        height: 100%;
    }

    .header .left-slot-content.use {
        border-right: var(--left-content-right-border);
        padding-right: var(--left-content-padding-right);
    }

    /* Header slot area: flexible container for additional header content */
    .header .slot-content {
        width: fit-content;
        height: 100%;
    }

    /* Content section: flexible container that fills remaining card height */
    .content {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        padding-top: var(--content-padding-top);
        padding-bottom: var(--content-padding-bottom);
        width: 100%;
        min-height: 0;
        flex: 1;
    }

    /* Content wrapper: provides scrollable area with custom scrollbar styling */
    .wrapper {
        box-sizing: border-box;
        position: relative;
        margin: 0;
        padding: 0;
        padding-left: var(--content-padding-horizontal);
        padding-right: var(--content-padding-horizontal);
        width: 100%;
        height: 100%;
        min-height: 0;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        overflow-x: hidden;
        overflow-y: hidden;
    }

    /* Enables vertical scroll on the card content */
    .wrapper.scroll-on {
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--scrollbar-thumb-color) var(--scrollbar-track-color);
        scrollbar-gutter: stable both-edges;
    }
</style>
