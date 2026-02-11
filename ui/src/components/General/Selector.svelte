<script lang="ts">
    import { onDestroy } from "svelte";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { SelectorStyle } from "$lib/style/general";

    //Props
    export let disabled: boolean = false; // Selector is disabled
    export let inputInvalid: boolean = false; // Input is invalid
    export let enableInputInvalid: boolean = false; // Enable Input is Invalid property
    export let options: Record<string, any>; //Record with options for the selector
    export let selectedOption: any; //Selected option
    export let setSelectedOption: ((value: string) => void) | undefined = undefined; //Function to set the selected option, if not provided, the selectedOption will be updated directly
    export let invertOptions: boolean = false; //Invert Options div position
    export let scrollable: boolean = false; //makes the content scrollable
    export let maxOptions: number = 5; //if the content is scrollable assigns the maximum number of visible options

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $SelectorStyle;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let borderRadius: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let borderColor: string | undefined = undefined;
    export let disabledBackgroundColor: string | undefined = undefined;
    export let disabledBorderColor: string | undefined = undefined;
    export let selectedColor: string | undefined = undefined;
    export let badFormatBackgroundColor: string | undefined = undefined;
    export let badFormatBorderColor: string | undefined = undefined;
    export let optionsBackgroundColor: string | undefined = undefined;
    export let optionsBorderColor: string | undefined = undefined;
    export let optionsInnerBorderColor: string | undefined = undefined;
    export let optionHeight: string | undefined = undefined;
    export let fontSize: string | undefined = undefined;
    export let letterSpacing: string | undefined = undefined;
    export let wordSpacing: string | undefined = undefined;
    export let arrowWidth: string | undefined = undefined;
    export let arrowHeight: string | undefined = undefined;
    export let arrowRightPos: string | undefined = undefined;

    $: localOverrides = {
        width,
        height,
        borderRadius,
        backgroundColor,
        borderColor,
        disabledBackgroundColor,
        disabledBorderColor,
        selectedColor,
        badFormatBackgroundColor,
        badFormatBorderColor,
        optionsBackgroundColor,
        optionsBorderColor,
        optionsInnerBorderColor,
        optionHeight,
        fontSize,
        letterSpacing,
        wordSpacing,
        arrowWidth,
        arrowHeight,
        arrowRightPos,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let isOpen: boolean = false;
    let validOptions: [string, any][];
    let optionsHeight: string = "fit-content";
    let selDivEl: Node;
    let clickEventListenerDefined: boolean = false;

    $: {
        if (disabled) {
            validOptions = Object.entries({});
        } else {
            validOptions = Object.entries(options || {}).filter(([_, value]) => value !== "");
        }
    }
    $: optionsLength = validOptions.length;
    $: selectedKey = Object.entries(options).find(([key, _]) => key === selectedOption)?.[0];
    $: shiftTextLeft = String(parseFloat(String(mergedStyle.arrowRightPos)) + parseFloat(String(mergedStyle.arrowWidth))) + "px";
    $: {
        if (scrollable && optionsLength > maxOptions) {
            optionsHeight = String(parseFloat(String(mergedStyle.height)) * maxOptions) + "px";
        } else {
            optionsHeight = "fit-content";
        }
    }
    $: {
        if (optionsLength == 0 || disabled) {
            isOpen = false;
        }
    }
    $: if (!isOpen && clickEventListenerDefined) {
        window.removeEventListener("click", handleClickOutside);
        clickEventListenerDefined = false;
    }

    // Change Export Function
    export let onChange: (() => void) | undefined = undefined;

    // Functions
    function getDisplayText(key: string): string {
        return options[key];
    }

    function toggleSelector(): void {
        isOpen = !isOpen;
        if (isOpen) {
            window.addEventListener("click", handleClickOutside);
            clickEventListenerDefined = true;
        }
    }

    //Change Option Function
    function changeOption(optionKey: string): void {
        if (setSelectedOption) {
            setSelectedOption(optionKey);
        } else {
            selectedOption = optionKey;
        }
        if (onChange) {
            onChange();
        }
        isOpen = false;
    }

    //Handle Click Outside Function
    function handleClickOutside(event: MouseEvent): void {
        if (selDivEl && !selDivEl.contains(event.target as Node)) {
            isOpen = false;
        }
    }

    onDestroy(() => {
        if (clickEventListenerDefined) {
            window.removeEventListener("click", handleClickOutside);
        }
    });
</script>

<!-- 
  Custom dropdown selector component.
  Dynamically styled using CSS variables.
  Displays a list of options, highlights the selected one, 
  and toggles visibility on button click.
-->
<div
    bind:this={selDivEl}
    class="selector-div"
    style="
        --width: {mergedStyle.width};
        --height: {mergedStyle.height};
        --border-radius: {mergedStyle.borderRadius};
        --background-color: {mergedStyle.backgroundColor};
        --border-color: {mergedStyle.borderColor};
        --disabled-background-color: {mergedStyle.disabledBackgroundColor};
        --disabled-border-color: {mergedStyle.disabledBorderColor};
        --selected-color: {mergedStyle.selectedColor};
        --bad-format-background-color: {mergedStyle.badFormatBackgroundColor};
        --bad-format-border-color: {mergedStyle.badFormatBorderColor};
        --options-background-color: {mergedStyle.optionsBackgroundColor};
        --options-border-color: {mergedStyle.optionsBorderColor};
        --options-inner-border-color: {mergedStyle.optionsInnerBorderColor};
        --option-height: {mergedStyle.optionHeight};
        --font-size: {mergedStyle.fontSize};
        --letter-spacing: {mergedStyle.letterSpacing};
        --word-spacing: {mergedStyle.wordSpacing};
        --arrow-width: {mergedStyle.arrowWidth};
        --arrow-height: {mergedStyle.arrowHeight};
        --arrow-right-position: {mergedStyle.arrowRightPos};
        --selected-option-shift-left: {shiftTextLeft};
        --options-height: {optionsHeight};
    "
    class:disabled={optionsLength == 0 || disabled}
    class:bad-format={inputInvalid && enableInputInvalid && !disabled}
>
    <div class="content-div">
        <span class="selected-option">{getDisplayText(selectedKey || "")}</span>
        <img
            class="arrow"
            src={invertOptions ? (isOpen ? "/img/down-arrow.svg" : "/img/up-arrow.svg") : isOpen ? "/img/up-arrow.svg" : "/img/down-arrow.svg"}
            alt={isOpen ? "up-arrow" : "down-arrow"}
        />
        <button
            class="open-selector"
            on:click={toggleSelector}
            aria-label="View options"
            disabled={optionsLength == 0 || disabled}
            class:disabled={optionsLength == 0 || disabled}
        ></button>
        <div class="options {isOpen ? '' : 'disabled'} {invertOptions ? 'inverted' : 'normal'} {scrollable ? 'scrollable' : ''}">
            {#each Object.entries(options) as [key, _] (key)}
                <div class="option {selectedOption == key ? 'selected-option' : ''}">
                    <span class="option-name">{getDisplayText(key)}</span>
                    <button on:click={() => changeOption(key)} aria-label={key}></button>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    /* Wrapper for the custom selector */
    .selector-div {
        box-sizing: border-box;
        display: block;
        width: var(--width);
        height: var(--height);
        background-color: var(--background-color);
        border-radius: var(--border-radius);
        border: 1px solid var(--border-color);
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
    }

    /* Selector is disabled */
    .selector-div.disabled {
        background-color: var(--disabled-background-color);
        border: 1px solid var(--disabled-border-color);
    }

    /* Selector has bad format */
    .selector-div.bad-format {
        background-color: var(--bad-format-background-color);
        border: 1px solid var(--bad-format-border-color);
    }

    /* Inner content container with centered layout */
    .content-div {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        -webkit-tap-highlight-color: transparent;
    }

    /* Arrow icon (dropdown indicator) */
    .arrow {
        position: absolute;
        width: var(--arrow-width);
        height: var(--arrow-height);
        right: var(--arrow-right-position);
        top: 50%;
        transform: translateY(-50%);
    }

    /* Currently selected option text */
    .selected-option {
        width: 100%;
        height: 100%;
        display: flex;
        margin: 0;
        padding: 0;
        align-items: center;
        justify-content: center;
        color: #eeeeee;
        font-weight: 400;
        font-size: var(--font-size);
        letter-spacing: var(--letter-spacing);
        word-spacing: var(--word-spacing);
        padding-right: var(--selected-option-shift-left);
        line-height: normal;
    }

    /* Invisible button to trigger dropdown */
    .open-selector {
        position: absolute;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        cursor: pointer;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }

    /* Buton to trigger dropdown is disabled */
    .open-selector.disabled {
        cursor: auto;
    }

    /* Dropdown container for options */
    .options {
        position: absolute;
        width: 100%;
        height: var(--options-height);
        background-color: var(--options-background-color);
        border-radius: var(--border-radius);
        border: 1px solid var(--options-border-color);
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        z-index: 1;
        overflow-y: hidden;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
        scrollbar-width: thin;
        scrollbar-color: #323a45 #1e242b;
    }

    /* Dropdown opens below selector */
    .options.normal {
        top: calc(100% + 2px);
    }

    /* Dropdown opens above selector */
    .options.inverted {
        bottom: calc(100% + 2px);
    }

    /* Hides the dropdown when closed */
    .options.disabled {
        display: none;
    }

    /* options are scrollable */
    .options.scrollable {
        overflow-y: auto;
    }

    /* Individual option style */
    .option {
        position: relative;
        width: 100%;
        min-height: var(--option-height);
        max-height: var(--option-height);
        padding: 0 5px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-weight: 400;
        font-size: var(--font-size);
        letter-spacing: var(--letter-spacing);
        word-spacing: var(--word-spacing);
        border-bottom: 1px solid var(--options-inner-border-color);
        color: #b0bec5;
        -webkit-tap-highlight-color: transparent;
        line-height: normal;
    }

    /* Individual option style border color */

    .option:last-child {
        border: 1px solid transparent;
    }

    /* Transparent overlay to make the option fully clickable */
    .option button {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        opacity: 0;
        cursor: pointer;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }

    /* Styling for the currently selected option */
    .option.selected-option {
        background-color: var(--selected-color);
        color: #ffffff;
    }
</style>
