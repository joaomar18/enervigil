<script lang="ts">
    import { browser } from "$app/environment";
    import { onMount, onDestroy } from "svelte";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { ModalWindowStyle } from "$lib/style/general";

    // Props
    export let customTitle: boolean = false;
    export let disableHeader: boolean = false;
    export let disableCloseWindow: boolean = false;
    export let title: string = "";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $ModalWindowStyle;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let minWidth: string | undefined = undefined;
    export let maxWidth: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let maxHeight: string | undefined = undefined;
    export let borderRadius: string | undefined = undefined;
    export let contentPadding: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let borderColor: string | undefined = undefined;
    export let titleSize: string | undefined = undefined;
    export let titleColor: string | undefined = undefined;
    export let titleWeight: string | undefined = undefined;

    $: localOverrides = {
        width,
        height,
        borderRadius,
        contentPadding,
        backgroundColor,
        borderColor,
        titleSize,
        titleColor,
        titleWeight,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Constants
    const smallScreenHeightTolerance: number = 225;
    const screenHeightTolerance: number = 175;
    const smallScreenTreshold: number = 420;

    // Variables
    let containerEl: HTMLElement;
    let procMaxHeight: string;

    // Close Window Export Funcion
    export let closeWindow: () => void;

    // Functions
    function handleClickOutside(event: MouseEvent): void {
        if (!disableCloseWindow && containerEl && !containerEl.contains(event.target as HTMLElement)) {
            if (closeWindow) {
                closeWindow();
            }
        }
    }

    function updateWindowHeight() {
        let maxWindowHeight: number;
        if (window.innerHeight > screenHeightTolerance) {
            let screenHeightTol = window.innerWidth > smallScreenTreshold ? screenHeightTolerance : smallScreenHeightTolerance;
            maxWindowHeight = window.innerHeight - screenHeightTol;
        } else {
            maxWindowHeight = 0;
        }
        if (maxHeight) {
            if (parseInt(maxHeight) > maxWindowHeight) {
                procMaxHeight = `${maxWindowHeight}px`;
            } else {
                procMaxHeight = maxHeight;
            }
        } else {
            procMaxHeight = `${maxWindowHeight}px`;
        }
    }

    onMount(() => {
        if (browser) {
            requestAnimationFrame(() => {
                window.addEventListener("click", handleClickOutside);
            });
            updateWindowHeight();
            window.addEventListener("resize", updateWindowHeight);
        }
    });

    onDestroy(() => {
        if (browser) {
            window.removeEventListener("click", handleClickOutside);
            window.removeEventListener("resize", updateWindowHeight);
        }
    });
</script>

<!--
  ModalWindow component

  A customizable modal window with a title, close button, and slot for content.
-->
<div
    style="
        --width: {mergedStyle.width};
        --min-width: {minWidth};
        --max-width: {maxWidth};
        --height: {mergedStyle.height};
        --max-height: {procMaxHeight};
        --border-radius: {mergedStyle.borderRadius};
        --content-padding: {mergedStyle.contentPadding};
        --background-color: {mergedStyle.backgroundColor};
        --border-color: {mergedStyle.borderColor};
        --title-size: {mergedStyle.titleSize};
        --title-color: {mergedStyle.titleColor};
        --title-weight: {mergedStyle.titleWeight};
    "
    class="container"
    bind:this={containerEl}
>
    <div class="content">
        {#if !disableHeader}
            <div class="header-div">
                {#if customTitle}
                    <slot name="header"></slot>
                {:else}
                    <h3 class="not-custom">{title}</h3>
                {/if}
                <button
                    class="close-button"
                    on:click={() => {
                        if (!disableCloseWindow) closeWindow();
                    }}
                    aria-label="Close Window"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="6" y1="6" x2="18" y2="18" />
                        <line x1="18" y1="6" x2="6" y2="18" />
                    </svg></button
                >
            </div>
        {/if}
        <div class="content-div">
            <slot />
        </div>
    </div>
</div>

<style>
    /* Container: modal window box */
    .container {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: var(--width);
        min-width: var(--min-width, min-content);
        max-width: var(--max-width, max-content);
        height: var(--height);
        border-radius: var(--border-radius);
        background-color: var(--background-color);
        border: 1px solid var(--border-color);
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
    }

    /* Content: flex column layout for header and content */
    .content {
        padding: 0;
        margin: 0;
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        -webkit-tap-highlight-color: transparent;
    }

    /* Header: title and close button row */
    .header-div {
        margin: 0;
        padding: 0;
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--border-color);
    }

    /* Not custom title style */
    .header-div h3.not-custom {
        margin: 0;
        padding: 15px;
        padding-right: 50px;
        line-height: 1.5;
        text-wrap: wrap;
        font-size: var(--title-size);
        color: var(--title-color);
        font-weight: var(--title-weight);
    }

    /* Close button styles */
    .header-div .close-button {
        margin: 0;
        padding: 0;
        padding-right: 15px;
        width: 40px;
        height: 40px;
        background-color: transparent;
        border: none;
        color: var(--title-color);
        cursor: pointer;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }

    /* SVG icon for close button */
    .header-div .close-button svg {
        stroke: #888;
        transition: stroke 0.2s ease;
    }

    /* Close button hover effect */
    .header-div .close-button:hover svg {
        stroke: var(--title-color);
    }

    /* Content area: fills remaining space */
    .content-div {
        width: 100%;
        box-sizing: border-box;
        flex: 1 1 auto;
        padding: var(--content-padding);
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        overflow-y: auto;
        overflow-x: hidden;
        max-height: var(--max-height, max-content);
        scrollbar-width: thin;
        scrollbar-color: #323a45 #1e242b;
    }
</style>
