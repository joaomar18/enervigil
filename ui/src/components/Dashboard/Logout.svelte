<script lang="ts">
    import { isDeviceViewPage } from "$lib/logic/view/navigation";
    import ToolTip from "../General/ToolTip.svelte";

    // Stores
    import { currentPage } from "$lib/stores/view/navigation";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { LogoutStyle } from "$lib/style/dashboard";
    import { ToolTipStyle } from "$lib/style/general";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    export let toolTipStyle: { [property: string]: string | number } = $ToolTipStyle;
    $: effectiveStyle = style ?? $LogoutStyle;

    // Props
    export let buttonText: string;
    export let imageUrl: string | undefined = undefined;
    export let enableToolTip: boolean = false;
    export let toolTipAutoPos: boolean = true;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let borderRadius: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let hoverColor: string | undefined = undefined;
    export let borderColor: string | undefined = undefined;
    export let fontSize: string | undefined = undefined;
    export let paddingLeft: string | undefined = undefined;
    export let paddingRight: string | undefined = undefined;
    export let paddingLeftText: string | undefined = undefined;
    export let imageWidth: string | undefined = undefined;
    export let imageHeight: string | undefined = undefined;
    export let textColor: string | undefined = undefined;
    export let textWeight: string | undefined = undefined;
    export let showToolTipDelay: number | undefined = undefined;

    $: localOverrides = {
        width,
        height,
        borderRadius,
        backgroundColor,
        hoverColor,
        borderColor,
        fontSize,
        paddingLeft,
        paddingRight,
        paddingLeftText,
        imageWidth,
        imageHeight,
        textColor,
        textWeight,
        showToolTipDelay,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let deviceViewPage: boolean = false;
    let managementPage: boolean = false;
    let showToolTip: boolean = false;
    let showToolTipTimeout: ReturnType<typeof setTimeout> | null = null;
    let showToolTipDelayNumber: number;

    // Reactive Statements
    $: deviceViewPage = isDeviceViewPage($currentPage);
    $: managementPage = !deviceViewPage;
    $: showToolTipDelayNumber = parseInt(String(mergedStyle.showToolTipDelay));

    // Click Export Funcion
    export let onClick: () => void | Promise<void>;

    // Functions
    async function handleClick(): Promise<void> {
        if (onClick) {
            await onClick();
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
    Logout button: stylable button for logging out, with optional icon and text.
    Adapts layout for management and device view pages, hiding text on small screens.
    Handles click via invisible button overlay for accessibility and custom styling.
-->
<div
    style="
        --width: {mergedStyle.width};
        --height: {mergedStyle.height};
        --border-radius: {mergedStyle.borderRadius};
        --background-color: {mergedStyle.backgroundColor};
        --hover-color: {mergedStyle.hoverColor};
        --border-color: {mergedStyle.borderColor};
    "
    class="container"
    class:management-page={managementPage}
    class:device-view-page={deviceViewPage}
>
    <div
        style="
        --padding-left: {mergedStyle.paddingLeft}; 
        --padding-right: {mergedStyle.paddingRight};
    "
        class="content"
        class:management-page={managementPage}
        class:device-view-page={deviceViewPage}
    >
        {#if imageUrl}
            <img
                style="
            --image-width: {mergedStyle.imageWidth};
            --image-height: {mergedStyle.imageHeight};
        "
                src={imageUrl}
                alt={imageUrl}
            />
        {/if}
        <div class="text-div">
            <span
                style="
                --font-size: {mergedStyle.fontSize};
                --padding-left-text: {mergedStyle.paddingLeftText};
                --text-color: {mergedStyle.textColor};
                --text-weight: {mergedStyle.textWeight};
            ">{buttonText}</span
            >
        </div>
        <button on:click={handleClick} on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave} aria-label="Action Button"></button>
        <div class="tooltip-div">
            <ToolTip style={toolTipStyle} {showToolTip} autoPosition={toolTipAutoPos}>
                <slot name="tooltip" />
            </ToolTip>
        </div>
    </div>
</div>

<style>
    /* Main container for logout button */
    .container {
        background-color: var(--background-color);
        border: 1px solid var(--border-color);
        width: var(--width);
        height: var(--height);
        border-radius: var(--border-radius, 0px);
        right: 20px;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
    }

    /* Hover effect for background color */
    .container:hover {
        background-color: var(--hover-color);
    }

    /* Content wrapper for icon and text */
    .content {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding-left: var(--padding-left, 0px);
        padding-right: var(--padding-right, 0px);
        justify-content: flex-start;
        -webkit-tap-highlight-color: transparent;
    }

    /* Text container for logout label */
    .text-div {
        height: 100%;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Logout text styling */
    span {
        box-sizing: border-box;
        display: inline-block;
        line-height: 100%;
        justify-content: start;
        align-items: center;
        flex-direction: row;
        width: max-content;
        margin: 0;
        padding-left: var(--padding-left-text, 0px);
        color: var(--text-color);
        font-size: var(--font-size, 1rem);
        font-weight: var(--text-weight);
        outline: none;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    /* Logout icon styling */
    img {
        width: var(--image-width);
        height: var(--image-height);
    }

    /* Invisible button overlay for click handling */
    button {
        position: absolute;
        width: 100%;
        height: 100%;
        border: none;
        left: 0;
        top: 0;
        padding: 0;
        margin: 0;
        opacity: 0;
        cursor: pointer;
        outline: none;
        -webkit-tap-highlight-color: transparent;
        z-index: 1;
    }

    /* Tooltip container - hidden by default, shows only when text is hidden on small screens */
    .tooltip-div {
        position: absolute;
        inset: 0;
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        display: none;
        justify-content: center;
        align-items: center;
    }

    /* Responsive: hide text on small screens for management page */
    @media (max-width: 559px) {
        .container.management-page {
            width: var(--height);
        }

        .content.management-page {
            justify-content: center;
            padding: 0;
        }

        .content.management-page .text-div {
            display: none;
        }
        .content.management-page .tooltip-div {
            display: flex;
        }
    }

    /* Responsive: hide text on small screens for device view page */
    @media (max-width: 624px) {
        .container.device-view-page {
            width: var(--height);
        }

        .content.device-view-page {
            justify-content: center;
            padding: 0;
        }

        .content.device-view-page .text-div {
            display: none;
        }
        .content.device-view-page .tooltip-div {
            display: flex;
        }
    }
</style>
