<script lang="ts">
    import { browser } from "$app/environment";
    import { onMount, onDestroy } from "svelte";
    import Logo from "../General/Logo.svelte";
    import Link from "./Link.svelte";
    import MenuButton from "../General/MenuButton.svelte";
    import LangSelector from "../General/LangSelector.svelte";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { HeaderStyle, MobileLinkStyle } from "$lib/style/login";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $HeaderStyle;

    // Layout / styling props
    export let backgroundColor: string | undefined = undefined;
    export let dropdownBackgroundColor: string | undefined = undefined;
    export let dropdownBorderBottomColor: string | undefined = undefined;
    export let textColor: string | undefined = undefined;

    $: localOverrides = {
        backgroundColor,
        dropdownBackgroundColor,
        dropdownBorderBottomColor,
        textColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let dropdownOpen: boolean;
    let headerElement: Node;

    // Functions
    function aboutUs(): void {}
    function help(): void {}
    function contacts(): void {}

    function handleClickOutsideHeader(event: MouseEvent): void {
        if (dropdownOpen && headerElement && !headerElement.contains(event.target as Node)) {
            dropdownOpen = false;
        }
    }

    function handleScreenResize(): void {
        if (browser && window.innerWidth >= 1024) {
            dropdownOpen = false;
        }
    }

    onMount(() => {
        if (browser) {
            window.addEventListener("click", handleClickOutsideHeader);
            window.addEventListener("resize", handleScreenResize);
            handleScreenResize();
        }
    });

    onDestroy(() => {
        if (browser) {
            window.removeEventListener("click", handleClickOutsideHeader);
            window.removeEventListener("resize", handleScreenResize);
        }
    });
</script>

<!-- 
  Header: Responsive navigation header with logo, top navigation links, language selector,
  and a collapsible menu for smaller screens.
-->
<div
    class="header-div"
    bind:this={headerElement}
    style="
        --background-color: {mergedStyle.backgroundColor};
        --dropdown-background-color: {mergedStyle.dropdownBackgroundColor};
        --dropdown-border-bottom-color: {mergedStyle.dropdownBorderBottomColor};
        --text-color: {mergedStyle.textColor};
    "
>
    <div class="content-div">
        <div class="logo-div">
            <Logo />
        </div>
        <div class="links-header-div">
            <Link buttonText={$texts.aboutUs} imageURL="/img/about-us.svg" onClick={aboutUs} />
            <Link buttonText={$texts.help} imageURL="/img/help.svg" onClick={help} />
            <Link buttonText={$texts.contacts} imageURL="/img/contacts.svg" onClick={contacts} />
        </div>
        <div class="language-selector-header-div">
            <LangSelector />
        </div>
        <div class="menu-button-div">
            <MenuButton backgroundColor="#252b33" bind:menuOpen={dropdownOpen} />
        </div>
    </div>
    <div class="dropdown-menu" class:open={dropdownOpen}>
        <Link style={$MobileLinkStyle} buttonText={$texts.aboutUs} imageURL="/img/about-us.svg" onClick={aboutUs} />
        <Link style={$MobileLinkStyle} buttonText={$texts.help} imageURL="/img/help.svg" onClick={help} />
        <Link style={$MobileLinkStyle} buttonText={$texts.contacts} imageURL="/img/contacts.svg" onClick={contacts} />
        <div class="language-selector-dropdown-div">
            <span class="language-text">{$texts.language}</span>
            <LangSelector />
        </div>
    </div>
</div>

<style>
    /* Main header container fixed at the top */
    .header-div {
        position: sticky;
        width: 100%;
        min-width: 320px;
        height: 74px;
        top: 0px;
        left: 0px;
        background-color: var(--background-color);
        z-index: 3;
    }

    /* Content wrapper with centered layout */
    .content-div {
        min-width: 320px;
        width: 100%;
        height: 100%;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    /* Logo container positioned top-left */
    .logo-div {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 20px;
    }

    /* Link buttons visible in desktop layout */
    .links-header-div {
        height: fit-content;
        width: 610px;
        top: 20px;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        align-items: center;
    }

    /* Dropdown menu shown only in mobile layout */
    .dropdown-menu {
        position: absolute;
        z-index: 3;
        height: fit-content;
        min-width: 320px;
        top: 74px;
        background-color: var(--dropdown-background-color);
        border-bottom: 1px solid var(--dropdown-border-bottom-color);
        width: 100%;
        display: none;
        justify-content: start;
        align-items: center;
        flex-direction: column;
    }

    /* Language selector container for header */
    .language-selector-header-div {
        position: absolute;
        right: 20px;
    }

    /* Language selector for dropdown menu */
    .language-selector-dropdown-div {
        display: flex;
        justify-content: start;
        align-items: center;
        flex-direction: column;
        padding: 30px;
    }

    /* Language label text styling */
    .language-text {
        color: var(--text-color);
        font-weight: 300;
        font-size: 18px;
        padding-bottom: 10px;
    }

    /* Mobile menu toggle button */
    .menu-button-div {
        display: none;
        position: absolute;
        right: 20px;
    }

    /* Responsive rules for small screens */
    @media (max-width: 1023px) {
        .links-header-div {
            display: none;
        }

        .language-selector-header-div {
            display: none;
        }

        .dropdown-menu.open {
            display: flex;
        }
        .menu-button-div {
            display: block;
        }
    }
</style>
