<script lang="ts">
    import { fade, slide } from "svelte/transition";
    import { AlertType } from "$lib/stores/view/toast";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { ToastStyle } from "$lib/style/general";

    // Props
    export let pushTop: boolean = false; //push alert to top
    export let pushBottom: boolean = false; //push alert to bottom
    export let toastText: string;
    export let toastType: AlertType;
    export let toastVariables: Record<string, string | number> | undefined = undefined;
    export let topPos: string = "";
    export let bottomPos: string = "";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $ToastStyle;

    // Layout / styling props
    export let topBorderRadius: string | undefined = undefined;
    export let bottomBorderRadius: string | undefined = undefined;
    export let innerBackgroundColor: string | undefined = undefined;
    export let alertBackgroundColor: string | undefined = undefined;
    export let alertBorderColor: string | undefined = undefined;
    export let warningBackgroundColor: string | undefined = undefined;
    export let warningBorderColor: string | undefined = undefined;
    export let infoBackgroundColor: string | undefined = undefined;
    export let infoBorderColor: string | undefined = undefined;
    export let neutralBackgroundColor: string | undefined = undefined;
    export let neutralBorderColor: string | undefined = undefined;
    export let textColor: string | undefined = undefined;

    $: localOverrides = {
        topBorderRadius,
        bottomBorderRadius,
        innerBackgroundColor,
        alertBackgroundColor,
        alertBorderColor,
        warningBackgroundColor,
        warningBorderColor,
        infoBackgroundColor,
        infoBorderColor,
        neutralBackgroundColor,
        neutralBorderColor,
        textColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Color Picking
    const colorMap = {
        [AlertType.ALERT]: {
            background: () => String(mergedStyle.alertBackgroundColor),
            border: () => String(mergedStyle.alertBorderColor),
        },
        [AlertType.WARNING]: {
            background: () => String(mergedStyle.warningBackgroundColor),
            border: () => String(mergedStyle.warningBorderColor),
        },
        [AlertType.INFO]: {
            background: () => String(mergedStyle.infoBackgroundColor),
            border: () => String(mergedStyle.infoBorderColor),
        },
        [AlertType.NEUTRAL]: {
            background: () => String(mergedStyle.neutralBackgroundColor),
            border: () => String(mergedStyle.neutralBorderColor),
        },
    };

    // Variables
    let message: string = "";
    let transformY: string;
    let backgroundColor: string;
    let borderColor: string;

    // Reactive Statements
    $: {
        message = toastText;
        if (toastVariables) {
            Object.entries(toastVariables).forEach(([key, value]) => {
                message = message.replace(`{${key}}`, String(value));
            });
        }
    }
    $: transformY = pushTop ? "-100%" : pushBottom ? "100%" : "0%";
    $: {
        const typeColors = colorMap[toastType] ?? colorMap[AlertType.ALERT];
        backgroundColor = typeColors.background();
        borderColor = typeColors.border();
    }

    // Click Export Funcion
    export let onClick: () => void;

    // Functions
    function handleClick(): void {
        if (onClick) {
            onClick();
        }
    }
</script>

<!-- 
    Toast wrapper with customizable top/bottom positioning, colors and slide direction.
    Triggered via pushTop / pushBottom or directly with style bindings.
-->
<div
    class="container"
    style="
        --top-position: {topPos};
        --bottom-position: {bottomPos};
        --top-border-radius: {mergedStyle.topBorderRadius};
        --bottom-border-radius: {mergedStyle.bottomBorderRadius};
        --inner-background-color: {mergedStyle.innerBackgroundColor};
        --background-color: {backgroundColor};
        --border-color:{borderColor};
        --transform-y: {transformY};
    "
    in:slide={{ duration: 150 }}
    out:fade={{ duration: 300 }}
>
    <div class="toast-div">
        <div class="content">
            <span class="toast-text" style="--text-color:{mergedStyle.textColor};">{message}</span>
            <button class="close-button" on:click={handleClick} aria-label="Close Button">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <line class="close-button-line" x1="6" y1="6" x2="18" y2="18" stroke-width="1" stroke-linecap="round" />
                    <line class="close-button-line" x1="18" y1="6" x2="6" y2="18" stroke-width="1" stroke-linecap="round" />
                </svg>
            </button>
        </div>
    </div>
</div>

<style>
    /* Root container */
    .container {
        position: absolute;
        top: var(--top-position, auto);
        left: 50%;
        bottom: var(--bottom-position, auto);
        transform: translate(-50%, var(--transform-y));
        border-top-left-radius: var(--top-border-radius);
        border-top-right-radius: var(--top-border-radius);
        border-bottom-left-radius: var(--bottom-border-radius);
        border-bottom-right-radius: var(--bottom-border-radius);
        width: 90%;
        max-width: 500px;
        height: fit-content;
        min-height: 50px;
        background-color: var(--inner-background-color);
        z-index: 102;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
    }

    /* Toast container */
    .toast-div {
        border-top-left-radius: var(--top-border-radius);
        border-top-right-radius: var(--top-border-radius);
        border-bottom-left-radius: var(--bottom-border-radius);
        border-bottom-right-radius: var(--bottom-border-radius);
        width: 100%;
        height: fit-content;
        min-height: 50px;
        background-color: var(--background-color);
        border: 1px solid var(--border-color);
    }

    /* Flex container for toast text and close button */
    .content {
        width: 100%;
        padding: 0;
        margin: 0;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
        -webkit-tap-highlight-color: transparent;
    }

    /* Main toast message */
    .toast-text {
        font-size: 1.1rem;
        color: var(--text-color);
        font-weight: 400;
        line-height: 1.5;
        padding: 10px;
        flex: 1;
        text-align: left;
        word-break: break-word;
    }

    /* Close button styling */
    .close-button {
        background-color: transparent;
        cursor: pointer;
        border: none;
        margin: 0;
        margin-top: 10px;
        margin-right: 10px;
        padding: 0;
        position: static;
        transform: none;
        display: flex;
        justify-content: center;
        align-items: center;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }

    .close-button:hover {
        background-color: transparent;
    }

    /* Cross ("X") line styling */
    .close-button-line {
        stroke: #f5f5f5;
    }

    /* Hover effect for the close icon */
    .close-button:hover .close-button-line {
        stroke: #bfbfbf;
    }
</style>
