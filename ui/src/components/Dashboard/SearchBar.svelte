<script lang="ts">
    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { SearchBarStyle } from "$lib/style/dashboard";
    import ToolTip from "../General/ToolTip.svelte";
    import ToolTipText from "../General/ToolTipText.svelte";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $SearchBarStyle;

    // Props
    export let searchString: string;
    export let placeholderText: string;
    export let enableToolTip: boolean = true;
    export let toolTipAutoPos: boolean = true;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let minWidth: string | undefined = undefined;
    export let maxWidth: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let borderRadius: string | undefined = undefined;
    export let searchButtonWidth: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let buttonBgColor: string | undefined = undefined;
    export let buttonHoverColor: string | undefined = undefined;
    export let borderColor: string | undefined = undefined;
    export let buttonBorderColor: string | undefined = undefined;
    export let selectedBorderColor: string | undefined = undefined;
    export let imageWidth: string | undefined = undefined;
    export let imageHeight: string | undefined = undefined;
    export let textColor: string | undefined = undefined;
    export let showToolTipDelay: number | undefined = undefined;

    $: localOverrides = {
        width,
        height,
        borderRadius,
        searchButtonWidth,
        backgroundColor,
        buttonBgColor,
        buttonHoverColor,
        borderColor,
        buttonBorderColor,
        selectedBorderColor,
        imageWidth,
        imageHeight,
        textColor,
        showToolTipDelay,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let inputValue: string;
    let currentSearchString: string;
    let inputElement: HTMLInputElement;

    let showToolTip: boolean = false;
    let showToolTipTimeout: ReturnType<typeof setTimeout> | null = null;
    let showToolTipDelayNumber: number;

    // Reactive Statements
    $: showToolTipDelayNumber = parseInt(String(mergedStyle.showToolTipDelay));

    // Sync input value when search string changes externally
    $: if (currentSearchString !== searchString) {
        currentSearchString = searchString;
        inputValue = searchString;
    }

    // Click Export Function
    export let onClick: () => void;

    // Functions
    function handleChange() {
        searchString = inputValue;
        if (onClick) {
            onClick();
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter") {
            handleChange();
        } else if (event.key === "Escape") {
            inputElement.blur();
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
  Search Bar: Container with styled input field and search button.  
-->
<div
    style="
        --width: {mergedStyle.width};
        --min-width: {minWidth};
        --max-width: {maxWidth};
        --height: {mergedStyle.height};
    "
    class="container"
>
    <div class="content">
        <div
            style="
                --border-radius: {mergedStyle.borderRadius};
                --background-color: {mergedStyle.backgroundColor};
                --border-color: {mergedStyle.borderColor};
                --selected-border-color: {mergedStyle.selectedBorderColor};
                --text-color: {mergedStyle.textColor};
            "
            class="search-bar-div"
        >
            <input
                type="text"
                placeholder={placeholderText}
                name="Search Bar"
                bind:this={inputElement}
                bind:value={inputValue}
                on:keydown={handleKeydown}
            />
        </div>
        <div
            style="
                --button-width: {mergedStyle.searchButtonWidth};
                --button-border-radius: {mergedStyle.borderRadius};
                --button-background-color: {mergedStyle.buttonBgColor};
                --button-hover-color: {mergedStyle.buttonHoverColor};
                --button-border-color: {mergedStyle.buttonBorderColor};
                --image-width: {mergedStyle.imageWidth};
                --image-height: {mergedStyle.imageHeight};
            "
            class="search-button-div"
        >
            <img src="/img/search.svg" alt="Search Loop" />
            <button aria-label="Search Button" on:click={handleChange} on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave}></button>
            <ToolTip {showToolTip} autoPosition={toolTipAutoPos}>
                <ToolTipText text={$texts.searchDevice} />
            </ToolTip>
        </div>
    </div>
</div>

<style>
    /* Container: overall fixed or flexible width & height */
    .container {
        width: var(--width);
        min-width: var(--min-width);
        max-width: var(--max-width);
        height: var(--height);
    }

    /* Content: horizontal flex layout for search and button */
    .content {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
    }

    /* Search field wrapper: styled input background & border */
    .search-bar-div {
        padding: 0;
        margin: 0;
        flex: 1;
        height: 100%;
        background-color: var(--background-color);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius, 0px);
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
    }

    /* Search focus: highlight border when typing */
    .search-bar-div:focus-within {
        border-color: var(--selected-border-color);
    }

    /* Input: full-size, transparent background, padded text */
    input {
        display: inline-block;
        line-height: 100%;
        background: transparent;
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        font-size: 1.1rem;
        padding-left: 20px;
        padding-right: 20px;
        outline: none;
        box-shadow: none;
        border: none;
        color: var(--text-color);
    }

    /* Search button wrapper: fixed width, no left border */
    .search-button-div {
        width: var(--button-width);
        position: relative;
        background-color: var(--button-background-color);
        margin: 0;
        padding: 0;
        margin-left: 0px;
        height: 100%;
        border-radius: var(--button-border-radius, 0px);
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;
        border: 1px solid var(--button-border-color);
        border-left: none;
        display: flex;
        justify-content: center;
        align-items: center;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
    }

    /* Button hover: background change on hover */
    .search-button-div:hover {
        background-color: var(--button-hover-color);
    }

    /* Icon inside button: scaled by CSS variables */
    .search-button-div img {
        width: var(--image-width);
        height: var(--image-height);
    }

    /* Invisible overlay button: captures clicks */
    .search-button-div button {
        position: absolute;
        border: none;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        cursor: pointer;
        background: transparent;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }
</style>
