<script lang="ts">
    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { LangSelectorStyle } from "$lib/style/general";
    import { setLanguage } from "$lib/logic/view/navigation";
    import { onDestroy } from "svelte";

    //Props
    export let invertOptions: boolean = false; //Invert Options div position

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $LangSelectorStyle;

    // Stores for multi-language support
    import type { Language } from "$lib/stores/lang/definition";
    import { selectedLang } from "$lib/stores/lang/definition";

    // Layout / styling props
    export let backgroundColor: string | undefined = undefined;
    export let borderColor: string | undefined = undefined;
    export let selectedColor: string | undefined = undefined;
    export let optionsBackgroundColor: string | undefined = undefined;
    export let optionsBorderColor: string | undefined = undefined;
    export let selectedOptionTextColor: string | undefined = undefined;
    export let optionsTextColor: string | undefined = undefined;
    export let optionsSelectedTextColor: string | undefined = undefined;

    $: localOverrides = {
        backgroundColor,
        borderColor,
        selectedColor,
        optionsBackgroundColor,
        optionsBorderColor,
        selectedOptionTextColor,
        optionsTextColor,
        optionsSelectedTextColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let isOpen: boolean = false;
    let langDivEl: Node;
    let clickEventListenerDefined: boolean = false;

    // Reactive Statements
    $: if (!isOpen && clickEventListenerDefined) {
        window.removeEventListener("click", handleClickOutside);
        clickEventListenerDefined = false;
    }

    // Functions
    function toggleSelector(): void {
        isOpen = !isOpen;
        if (isOpen) {
            window.addEventListener("click", handleClickOutside);
            clickEventListenerDefined = true;
        }
    }

    function changeLanguage(lang: Language): void {
        setLanguage(lang);
        isOpen = false;
    }

    function handleClickOutside(event: MouseEvent): void {
        if (langDivEl && !langDivEl.contains(event.target as Node)) {
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
  LangSelDropdown: Dropdown component for selecting the application language.
-->
<div
    bind:this={langDivEl}
    class="language-div"
    style="
        --background-color: {mergedStyle.backgroundColor};
        --border-color: {mergedStyle.borderColor};
        --selected-color: {mergedStyle.selectedColor};
        --options-background-color: {mergedStyle.optionsBackgroundColor};
        --options-border-color: {mergedStyle.optionsBorderColor};
        --selected-option-text-color: {mergedStyle.selectedOptionTextColor};
        --options-text-color: {mergedStyle.optionsTextColor};
        --options-selected-text-color: {mergedStyle.optionsSelectedTextColor};
    "
>
    <div class="content-div">
        <img class="globe" src="/img/globe.svg" alt="globe" />
        <span class="selected-lang">{$selectedLang}</span>
        <img
            class="arrow"
            src={invertOptions ? (isOpen ? "/img/down-arrow.svg" : "/img/up-arrow.svg") : isOpen ? "/img/up-arrow.svg" : "/img/down-arrow.svg"}
            alt={isOpen ? "up-arrow" : "down-arrow"}
        />
        <button class="open-selector" on:click={toggleSelector} aria-label="View options"></button>
        <div class="options {isOpen ? '' : 'disabled'} {invertOptions ? 'inverted' : 'normal'}">
            <div class="option {$selectedLang == 'PT' ? 'selected-option' : ''}">
                <span class="lang-option">PT</span>
                <button on:click={() => changeLanguage("PT")} aria-label="PT"></button>
            </div>
            <div class="option {$selectedLang == 'EN' ? 'selected-option' : ''}">
                <span class="lang-option">EN</span>
                <button on:click={() => changeLanguage("EN")} aria-label="EN"></button>
            </div>
        </div>
    </div>
</div>

<style>
    /* Wrapper for the language selector */
    .language-div {
        display: block;
        background-color: var(--background-color);
        border-radius: 5px;
        border: 1px solid var(--border-color);
        height: 40px;
        width: 150px;
        top: 50%;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
    }

    /* Inner content container */
    .content-div {
        position: relative;
        width: 100%;
        height: 100%;
        -webkit-tap-highlight-color: transparent;
    }

    /* Globe icon */
    .globe {
        height: 32px;
        width: 32px;
        position: absolute;
        top: 50%;
        left: 10px;
        transform: translateY(-50%);
    }

    /* Arrow icon (down or up) */
    .arrow {
        height: 24px;
        width: 24px;
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
    }

    /* Current selected language text */
    .selected-lang {
        color: var(--selected-option-text-color);
        font-weight: 400;
        position: absolute;
        font-size: 1.5rem;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    /* Transparent button that triggers the dropdown */
    .open-selector {
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }

    /* Dropdown options container */
    .options {
        position: absolute;
        width: 100%;
        height: fit-content;
        background-color: var(--options-background-color);
        border-radius: 5px;
        border: 1px solid var(--options-border-color);
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        z-index: 1;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
    }

    /* Dropdown options position when normal (opens to the bottom) */
    .options.normal {
        top: calc(100% + 2px);
    }

    /* Dropdown options position when normal (opens to the top) */
    .options.inverted {
        bottom: calc(100% + 2px);
    }

    /* Hide dropdown when closed */
    .options.disabled {
        display: none;
    }

    /* Individual option item */
    .option {
        position: relative;
        height: 40px;
        width: 100%;
        padding: 5px;
        box-sizing: border-box;
        text-align: center;
        font-weight: 400;
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: var(--options-text-color);
        -webkit-tap-highlight-color: transparent;
    }

    /* Clickable transparent overlay for option */
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
        color: var(--options-selected-text-color);
    }
</style>
