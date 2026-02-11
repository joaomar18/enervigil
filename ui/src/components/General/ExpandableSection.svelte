<script lang="ts">
    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { ExpandableSectionStyle } from "$lib/style/general";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $ExpandableSectionStyle;

    // Props
    export let titleText: string;
    export let contentExpanded: boolean = false;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let paddingTop: string | undefined = undefined;
    export let paddingBottom: string | undefined = undefined;
    export let headerHeight: string | undefined = undefined;
    export let headerBorderBottom: string | undefined = undefined;
    export let headerPaddingBottom: string | undefined = undefined;
    export let contentPaddingTop: string | undefined = undefined;
    export let titleSize: string | undefined = undefined;
    export let titleColor: string | undefined = undefined;
    export let titleWeight: string | undefined = undefined;
    export let titleSpacing: string | undefined = undefined;
    export let titleTextTransform: string | undefined = undefined;
    export let titleMarginLeft: string | undefined = undefined;
    export let expandButtonWidth: string | undefined = undefined;
    export let expandButtonHeight: string | undefined = undefined;
    export let expandButtonHoverColor: string | undefined = undefined;
    export let expandButtonMarginRight: string | undefined = undefined;
    export let expandButtonArrowWidth: string | undefined = undefined;
    export let expandButtonArrowHeight: string | undefined = undefined;

    $: localOverrides = {
        width,
        paddingTop,
        paddingBottom,
        headerHeight,
        headerBorderBottom,
        headerPaddingBottom,
        contentPaddingTop,
        titleSize,
        titleColor,
        titleWeight,
        titleSpacing,
        titleTextTransform,
        titleMarginLeft,
        expandButtonWidth,
        expandButtonHeight,
        expandButtonHoverColor,
        expandButtonMarginRight,
        expandButtonArrowWidth,
        expandButtonArrowHeight,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Functions
    function toogleExpand() {
        contentExpanded = !contentExpanded;
    }
</script>

<!-- Expandable section component: displays a clickable header with title and arrow that expands/collapses content below -->
<div
    style="
        --width: {mergedStyle.width};
        --padding-top: {mergedStyle.paddingTop};
        --padding-bottom: {mergedStyle.paddingBottom};
        --header-height: {mergedStyle.headerHeight};
        --header-border-bottom: {mergedStyle.headerBorderBottom};
        --header-padding-bottom: {mergedStyle.headerPaddingBottom};
        --content-padding-top: {mergedStyle.contentPaddingTop};
        --title-size: {mergedStyle.titleSize};
        --title-color: {mergedStyle.titleColor};
        --title-weight: {mergedStyle.titleWeight};
        --title-spacing: {mergedStyle.titleSpacing};
        --title-text-transform: {mergedStyle.titleTextTransform};
        --title-margin-left: {mergedStyle.titleMarginLeft};
        --expand-button-width: {mergedStyle.expandButtonWidth};
        --expand-button-height: {mergedStyle.expandButtonHeight};
        --expand-button-hover-color: {mergedStyle.expandButtonHoverColor};
        --expand-button-margin-right: {mergedStyle.expandButtonMarginRight};
        --expand-button-arrow-width: {mergedStyle.expandButtonArrowWidth};
        --expand-button-arrow-height: {mergedStyle.expandButtonArrowHeight};
    "
    class="container"
>
    <div class="content">
        <div class="header">
            <div class="header-content">
                <div class="wrapper">
                    <h3>{titleText}</h3>
                    <div class="arrow-div">
                        <img
                            class="arrow"
                            src={contentExpanded ? "/img/up-arrow.svg" : "/img/down-arrow.svg"}
                            alt={contentExpanded ? "up-arrow" : "down-arrow"}
                        />
                    </div>
                    <button on:click={toogleExpand} aria-label="Absolute header button"></button>
                </div>
            </div>
        </div>
        <div class="section-content" class:close={!contentExpanded}>
            <div class="wrapper">
                <div class="inner-wrapper">
                    <slot />
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    /* Main container: sets section width and vertical padding */
    .container {
        width: var(--width);
        height: fit-content;
        margin: 0;
        padding: 0;
        padding-top: var(--padding-top);
        padding-bottom: var(--padding-bottom);
    }

    /* Content wrapper: contains both header and expandable sections in vertical layout */
    .content {
        width: 100%;
        height: fit-content;
        position: relative;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    /* Expandable content area: uses CSS Grid for smooth expand/collapse animation */
    .section-content {
        margin: 0;
        padding: 0;
        width: 100%;
        flex: 1 1 auto;
        display: grid;
        grid-template-rows: 1fr;
        transition: grid-template-rows 0.2s ease-in-out;
        overflow: hidden;
    }

    /* Collapsed state: hides content by setting grid row height to 0 */
    .section-content.close {
        grid-template-rows: 0fr;
        flex: 0 0 auto;
        pointer-events: none;
    }

    /* Content wrapper: handles overflow during animation transitions */
    .section-content .wrapper {
        padding: 0;
        margin: 0;
        min-height: 0;
        overflow: hidden;
    }

    /* Inner wrapper: contains the slotted content inside the expandable section */
    .section-content .wrapper .inner-wrapper {
        padding: 0;
        margin: 0;
        padding-top: var(--content-padding-top);
        position: relative;
    }

    /* Header section: contains the clickable title and expand/collapse controls */
    .header {
        width: 100%;
        height: var(--header-height);
        border-bottom: var(--header-border-bottom);
    }

    /* Header content container: provides padding and full height layout */
    .header .header-content {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        padding-bottom: var(--header-padding-bottom);
    }

    /* Header wrapper: positions title and arrow icon with flex layout */
    .header .header-content .wrapper {
        margin: 0;
        padding: 0;
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    /* Header hover state: changes background color for visual feedback */
    .header .header-content .wrapper:hover {
        background-color: var(--expand-button-hover-color);
    }

    /* Section title: styled text positioned on the left side of header */
    .header .header-content .wrapper h3 {
        font-size: var(--title-size);
        color: var(--title-color);
        font-weight: var(--title-weight);
        padding: 0;
        margin: 0;
        margin-left: var(--title-margin-left);
        letter-spacing: var(--title-spacing);
        text-transform: var(--title-text-transform);
    }

    /* Arrow container: circular area that holds the expand/collapse arrow icon */
    .header .header-content .wrapper .arrow-div {
        width: var(--expand-button-width);
        height: var(--expand-button-height);
        border-radius: 50%;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: var(--expand-button-margin-right);
    }

    /* Arrow icon: sized expand/collapse indicator that changes based on state */
    .header .header-content .wrapper .arrow-div img {
        width: var(--expand-button-arrow-width);
        height: var(--expand-button-arrow-height);
    }

    /* Invisible button overlay: captures clicks across entire header area */
    .header .header-content .wrapper button {
        position: absolute;
        width: 100%;
        height: 100%;
        background: none;
        border: none;
        cursor: pointer;
    }
</style>
