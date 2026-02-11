<script lang="ts">
    import { onDestroy } from "svelte";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { HintInfoStyle } from "$lib/style/general";

    // Props
    export let openInverted: boolean = false;
    export let enableHint: boolean = true;
    export let labelText: string = "";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $HintInfoStyle;

    // Layout / styling props
    export let hintWidth: string | undefined = undefined;
    export let hintHeight: string | undefined = undefined;
    export let textColor: string | undefined = undefined;
    export let hintBackgroundColor: string | undefined = undefined;
    export let hintBorderColor: string | undefined = undefined;
    export let hintBorderRadius: string | undefined = undefined;
    export let openBackgroundColor: string | undefined = undefined;
    export let openHoverBackgroundColor: string | undefined = undefined;
    export let openStrokeColor: string | undefined = undefined;
    export let openHoverStrokeColor: string | undefined = undefined;
    export let closeBackgroundColor: string | undefined = undefined;
    export let closeHoverBackgroundColor: string | undefined = undefined;
    export let closeStrokeColor: string | undefined = undefined;
    export let closeHoverStrokeColor: string | undefined = undefined;

    $: localOverrides = {
        hintWidth,
        hintHeight,
        textColor,
        hintBackgroundColor,
        hintBorderColor,
        hintBorderRadius,
        openBackgroundColor,
        openHoverBackgroundColor,
        openStrokeColor,
        openHoverStrokeColor,
        closeBackgroundColor,
        closeHoverBackgroundColor,
        closeStrokeColor,
        closeHoverStrokeColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let hintOpened: boolean;
    let hintDiv: Node;
    let buttonEl: Node;
    let clickEventListenerDefined: boolean = false;

    // Reactive Statements
    $: if (!hintOpened && clickEventListenerDefined) {
        window.removeEventListener("click", handleClickOutside);
        clickEventListenerDefined = false;
    }

    // Functions
    function handleClickOutside(event: MouseEvent): void {
        if (hintOpened && hintDiv && buttonEl && !hintDiv.contains(event.target as Node) && !buttonEl.contains(event.target as Node)) {
            hintOpened = false;
        }
    }

    function toogleHint(): void {
        hintOpened = !hintOpened;
        if (hintOpened) {
            window.addEventListener("click", handleClickOutside);
            clickEventListenerDefined = true;
        }
    }

    onDestroy(() => {
        if (clickEventListenerDefined) {
            window.removeEventListener("click", handleClickOutside);
        }
    });
</script>

<!-- 
  InfoHint: Interactive info component with toggleable hint box.
  - Displays a message with an icon.
  - On click, toggles between "info" and "close" icons.
  - Reveals a hint box with slotted content.
  - Fully customizable via props for size, colors, and border styles.
-->
<div class="info-div">
    <span style="--info-text-color:{mergedStyle.textColor}" class="info-text">{labelText}</span>
    {#if enableHint}
        <div
            bind:this={hintDiv}
            class="hint-div"
            style="
            --hint-width: {mergedStyle.hintWidth};
            --hint-height: {mergedStyle.hintHeight};
            --hint-background-color: {mergedStyle.hintBackgroundColor};
            --hint-border-color: {mergedStyle.hintBorderColor};
            --hint-border-radius: {mergedStyle.hintBorderRadius};
        "
            class:open={hintOpened}
            class:inverted={openInverted}
        >
            <slot />
        </div>
        <button on:click={toogleHint} bind:this={buttonEl} aria-label="Show Hint" class:hint-opened={hintOpened}>
            <div
                class="hint-button"
                style="
                --open-background-color:{mergedStyle.openBackgroundColor};
                --open-hover-background-color:{mergedStyle.openHoverBackgroundColor};
                --open-stroke-color:{mergedStyle.openStrokeColor};
                --open-hover-stroke-color: {mergedStyle.openHoverStrokeColor};

                --close-background-color:{mergedStyle.closeBackgroundColor};
                --close-hover-background-color:{mergedStyle.closeHoverBackgroundColor};
                --close-stroke-color:{mergedStyle.closeStrokeColor};
                --close-hover-stroke-color:{mergedStyle.closeHoverStrokeColor};
            "
            >
                <div class="info-button-div" class:hide={hintOpened}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <circle class="info-circle" cx="12" cy="12" r="10" stroke-width="1.5" />

                        <circle class="i-dot" cx="12" cy="8" r="0.9" />

                        <line class="i-line" x1="12" y1="11" x2="12" y2="16.5" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                </div>
                <div class="close-button-div" class:hide={!hintOpened}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <circle class="close-circle" cx="12" cy="12" r="10" stroke-width="1.5" />

                        <line class="close-line" x1="9" y1="9" x2="15" y2="15" stroke-width="1.5" stroke-linecap="round" />
                        <line class="close-line" x1="15" y1="9" x2="9" y2="15" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                </div>
            </div>
        </button>
    {/if}
</div>

<style>
    /* Container holding warning text, icon button, and hint box */
    .info-div {
        width: fit-content;
        height: fit-content;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: end;
        position: relative;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
    }

    /* Info message */
    .info-text {
        width: max-content;
        color: var(--info-text-color);
        font-size: 1rem;
        padding-right: 5px;
    }

    /* Reset and style for the icon button */
    button {
        padding: 0;
        margin: 0;
        cursor: pointer;
        background-color: transparent;
        border: none;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }

    /* Places button on front when hint is opened */
    button.hint-opened {
        z-index: 2;
    }

    button:hover {
        background-color: transparent;
    }

    /* Circle background for the "info" icon */
    .info-circle {
        fill: var(--open-background-color);
        stroke: var(--open-stroke-color);
    }

    /* Hover color adjustments for the "info" icon */
    button:hover .info-circle {
        fill: var(--open-hover-background-color, --open-background-color);
        stroke: var(--open-hover-stroke-color, --open-stroke-color);
    }

    /* Dot above the "i" inside the icon */
    .i-dot {
        fill: var(--open-stroke-color);
    }

    /* Dot color on hover */
    button:hover .i-dot {
        fill: var(--open-hover-stroke-color, --open-stroke-color);
    }

    /* Line of the "i" inside the icon */
    .i-line {
        stroke: var(--open-stroke-color);
    }

    /* Line hover color */
    button:hover .i-line {
        stroke: var(--open-hover-stroke-color, --open-stroke-color);
    }

    /* Circle background for the "close" icon */
    .close-circle {
        fill: var(--close-background-color);
        stroke: var(--close-stroke-color);
    }

    /* Hover colors for the "close" icon circle */
    button:hover .close-circle {
        fill: var(--close-hover-background-color, --close-background-color);
        stroke: var(--close-hover-stroke-color, --close-stroke-color);
    }

    /* X lines for the "close" icon */
    .close-line {
        stroke: var(--close-stroke-color, #ffffff);
    }

    /* X line color on hover */
    button:hover .close-line {
        stroke: var(--close-hover-stroke-color, --close-stroke-color);
    }

    /* Wrapper for the toggleable icons */
    .hint-button {
        height: fit-content;
        width: fit-content;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }

    /* Styles for the info icon */
    .info-button-div {
        height: 32px;
        width: 32px;
        margin: 0;
        padding: 0;
    }

    /* Styles for the close icon */
    .close-button-div {
        height: 32px;
        width: 32px;
        margin: 0;
        padding: 0;
    }

    /* Hidden hint message box */
    .hint-div {
        width: var(--hint-width);
        height: var(--hint-height);
        background-color: var(--hint-background-color);
        border: 1px solid var(--hint-border-color);
        border-radius: var(--hint-border-radius);
        position: absolute;
        top: 0px;
        max-width: 280px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        display: none;
        z-index: 1;
    }

    /* Open hint message from bottom to top (inverted) */
    .hint-div.inverted {
        top: auto;
        bottom: 0px;
    }

    /* Display hint box when open */
    .hint-div.open {
        display: flex;
    }

    /* Hide info icon when box is open */
    .info-button-div.hide {
        display: none;
    }

    /* Hide close icon when box is closed */
    .close-button-div.hide {
        display: none;
    }
</style>
