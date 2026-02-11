<script lang="ts">
    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { ExpandableButtonStyle } from "$lib/style/general";

    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";

    // Props
    export let closeModal: boolean = false;
    export let openInverted: boolean = false;
    export let notValid: boolean = false;

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $ExpandableButtonStyle;

    // Layout / styling props
    export let modalWidth: string | undefined = undefined;
    export let modalHeight: string | undefined = undefined;
    export let modalBackgroundColor: string | undefined = undefined;
    export let modalBorderColor: string | undefined = undefined;
    export let modalBorderRadius: string | undefined = undefined;
    export let openBackgroundColor: string | undefined = undefined;
    export let openHoverBackgroundColor: string | undefined = undefined;
    export let openStrokeColor: string | undefined = undefined;
    export let openHoverStrokeColor: string | undefined = undefined;
    export let closeBackgroundColor: string | undefined = undefined;
    export let closeHoverBackgroundColor: string | undefined = undefined;
    export let closeStrokeColor: string | undefined = undefined;
    export let closeHoverStrokeColor: string | undefined = undefined;
    export let badFormatBackgroundColor: string | undefined = undefined;
    export let badFormatHoverBackgroundColor: string | undefined = undefined;
    export let badFormatStrokeColor: string | undefined = undefined;
    export let badFormatHoverStrokeColor: string | undefined = undefined;

    $: localOverrides = {
        modalWidth,
        modalHeight,
        modalBackgroundColor,
        modalBorderColor,
        modalBorderRadius,
        openBackgroundColor,
        openHoverBackgroundColor,
        openStrokeColor,
        openHoverStrokeColor,
        closeBackgroundColor,
        closeHoverBackgroundColor,
        closeStrokeColor,
        closeHoverStrokeColor,
        badFormatBackgroundColor,
        badFormatHoverBackgroundColor,
        badFormatStrokeColor,
        badFormatHoverStrokeColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let modalOpened: boolean;
    let modalDiv: Node;
    let buttonEl: Node;

    // Functions
    $: if (closeModal) {
        modalOpened = false;
        closeModal = false;
    }

    function handleClickOutside(event: MouseEvent): void {
        if (modalOpened && modalDiv && buttonEl && !modalDiv.contains(event.target as Node) && !buttonEl.contains(event.target as Node)) {
            modalOpened = false;
        }
    }

    function toogleHint(): void {
        modalOpened = !modalOpened;
    }

    onMount(() => {
        if (browser) {
            window.addEventListener("click", handleClickOutside);
        }
    });

    onDestroy(() => {
        if (browser) {
            window.removeEventListener("click", handleClickOutside);
        }
    });
</script>

<!-- 
  ExpandableButton: Interactive expandable button component with toggleable modal.
  - Displays a three-dot icon that toggles to a close (X) icon when clicked.
  - On click, reveals/hides an expandable modal with slotted content.
  - Supports validation states with different color schemes.
  - Fully customizable via props for size, colors, border styles, and positioning.
  - Includes click-outside-to-close functionality.
-->
<div class="button-div">
    <div
        bind:this={modalDiv}
        class="modal-div"
        style="
            --modal-width: {mergedStyle.modalWidth};
            --modal-height: {mergedStyle.modalHeight};
            --modal-background-color: {mergedStyle.modalBackgroundColor};
            --modal-border-color: {mergedStyle.modalBorderColor};
            --modal-border-radius: {mergedStyle.modalBorderRadius};
        "
        class:open={modalOpened}
        class:inverted={openInverted}
    >
        <slot />
    </div>
    <button on:click={toogleHint} bind:this={buttonEl} aria-label="Show Modal" class:modal-opened={modalOpened}>
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

                --bad-format-background-color:{mergedStyle.badFormatBackgroundColor};
                --bad-format-hover-background-color: {mergedStyle.badFormatHoverBackgroundColor};
                --bad-format-stroke-color: {mergedStyle.badFormatStrokeColor};
                --bad-format-hover-stroke-color: {mergedStyle.badFormatHoverStrokeColor};
            "
        >
            <div class="open-button-div" class:hide={modalOpened} class:not-valid={notValid}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle class="open-circle" class:not-valid={notValid} cx="12" cy="12" r="10" stroke-width="1.5" />
                    <circle class="dot" class:not-valid={notValid} cx="7" cy="12" r="1.5" />
                    <circle class="dot" class:not-valid={notValid} cx="12" cy="12" r="1.5" />
                    <circle class="dot" class:not-valid={notValid} cx="17" cy="12" r="1.5" />
                </svg>
            </div>
            <div class="close-button-div" class:hide={!modalOpened}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle class="close-circle" class:not-valid={notValid} cx="12" cy="12" r="10" stroke-width="1.5" />
                    <line class="close-line" class:not-valid={notValid} x1="9" y1="9" x2="15" y2="15" stroke-width="1.5" stroke-linecap="round" />
                    <line class="close-line" class:not-valid={notValid} x1="15" y1="9" x2="9" y2="15" stroke-width="1.5" stroke-linecap="round" />
                </svg>
            </div>
        </div>
    </button>
</div>

<style>
    /* Container for expandable button and modal - flexbox layout with relative positioning for modal placement */
    .button-div {
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

    /* Places button on front when modal is opened */
    button.modal-opened {
        z-index: 1;
    }

    button:hover {
        background-color: transparent;
    }

    /* Circle background for the open icon */
    .open-circle {
        fill: var(--open-background-color);
        stroke: var(--open-stroke-color);
    }

    /* Color adjustments for the open icon when not valid */
    .open-circle.not-valid {
        fill: var(--bad-format-background-color);
        stroke: var(--bad-format-stroke-color);
    }

    /* Hover color adjustments for the open icon */
    button:hover .open-circle {
        fill: var(--open-hover-background-color, --open-background-color);
        stroke: var(--open-hover-stroke-color, --open-stroke-color);
    }

    /* Hover color adjustments for the open icon when not valid */
    button:hover .open-circle.not-valid {
        fill: var(--bad-format-hover-background-color);
        stroke: var(--bad-format-hover-stroke-color);
    }

    /* Dot inside the icon */
    .dot {
        fill: var(--open-stroke-color);
    }

    /* Dot inside the icon not valid */
    .dot.not-valid {
        fill: var(--bad-format-stroke-color);
    }

    /* Dot color on hover */
    button:hover .dot {
        fill: var(--open-hover-stroke-color, --open-stroke-color);
    }

    /* Dot cover on hover not valid */
    button:hover .dot.not-valid {
        fill: var(--bad-format-hover-stroke-color);
    }

    /* Circle background for the "close" icon */
    .close-circle {
        fill: var(--close-background-color);
        stroke: var(--close-stroke-color);
    }

    /* Circle background fdor the "close" icon not valid */
    .close-circle.not-valid {
        fill: var(--bad-format-background-color);
        stroke: var(--bad-format-stroke-color);
    }

    /* Hover colors for the "close" icon circle */
    button:hover .close-circle {
        fill: var(--close-hover-background-color, --close-background-color);
        stroke: var(--close-hover-stroke-color, --close-stroke-color);
    }

    /* Hover colors for the "close" icon circle not valid */
    button:hover .close-circle.not-valid {
        fill: var(--bad-format-hover-background-color);
        stroke: var(--bad-format-hover-stroke-color);
    }

    /* X lines for the "close" icon */
    .close-line {
        stroke: var(--close-stroke-color);
    }

    /* X line color on not valid */
    .close-line.not-valid {
        stroke: var(--bad-format-stroke-color);
    }

    /* X line color on hover */
    button:hover .close-line {
        stroke: var(--close-hover-stroke-color, --close-stroke-color);
    }

    /* X line color on hover not valid */
    button:hover .close-line.not-valid {
        stroke: var(--bad-format-hover-stroke-color);
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
    .open-button-div {
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
    .modal-div {
        width: var(--modal-width);
        height: var(--modal-height);
        background-color: var(--modal-background-color);
        border: 1px solid var(--modal-border-color);
        border-radius: var(--modal-border-radius);
        position: absolute;
        top: 0px;
        max-width: 280px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        display: none;
        z-index: 1;
    }

    /* Open hint message from bottom to top (inverted) */
    .modal-div.inverted {
        top: auto;
        bottom: 0px;
    }

    /* Display hint box when open */
    .modal-div.open {
        display: flex;
    }

    /* Hide info icon when box is open */
    .open-button-div.hide {
        display: none;
    }

    /* Hide close icon when box is closed */
    .close-button-div.hide {
        display: none;
    }
</style>
