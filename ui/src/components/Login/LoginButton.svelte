<script lang="ts">
    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { LoginButtonStyle } from "$lib/style/login";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $LoginButtonStyle;

    // Props
    export let processing: boolean; //Login is being processed

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let paddingTop: string | undefined = undefined;
    export let paddingBottom: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let processingBackgroundColor: string | undefined = undefined;
    export let hoverColor: string | undefined = undefined;
    export let textColor: string | undefined = undefined;
    export let loaderWidth: string | undefined = undefined;
    export let loaderHeight: string | undefined = undefined;
    export let loaderColor: string | undefined = undefined;

    $: localOverrides = {
        width,
        height,
        paddingTop,
        paddingBottom,
        backgroundColor,
        processingBackgroundColor,
        hoverColor,
        textColor,
        loaderWidth,
        loaderHeight,
        loaderColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Click Export Funcion
    export let onClick: () => void;

    // Functions
    function handleClick(): void {
        if (!processing && onClick) {
            onClick();
        }
    }
</script>

<!-- 
  LoginButton: Displays a customizable login button with dynamic size and colors.
  Emits a "click" event when clicked.
-->
<div
    style="
        --padding-top:{mergedStyle.paddingTop};
        --padding-bottom:{mergedStyle.paddingBottom};
    "
>
    <button
        style="
            --width:{mergedStyle.width}; 
            --height:{mergedStyle.height};
            --background-color:{mergedStyle.backgroundColor};
            --processing-background-color:{mergedStyle.processingBackgroundColor};
            --hover-color:{mergedStyle.hoverColor};
            --text-color:{mergedStyle.textColor};
            --loader-color:{mergedStyle.loaderColor};
        "
        on:click={handleClick}
        class:processing
    >
        {#if !processing}
            {$texts.login}
        {:else}
            <svg class="loader" width={mergedStyle.loaderWidth} height={mergedStyle.loaderHeight} viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
            </svg>
        {/if}
    </button>
</div>

<style>
    /* Wrapper with configurable vertical spacing */
    div {
        padding-top: var(--padding-top);
        padding-bottom: var(--padding-bottom);
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
    }

    /* Button appearance and color (default) */
    button {
        box-sizing: content-box;
        color: var(--text-color);
        background-color: var(--background-color);
        width: var(--width, "fit-content");
        height: var(--height, "fit-content");
        border: none;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0;
        padding: 0;
        font-weight: 500;
        font-size: 1.25rem;
        cursor: pointer;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }

    /* Button color when login is processing */
    button.processing {
        background-color: var(--processing-background-color);
        cursor: auto;
    }

    /* Button background color on hover */
    button:hover {
        background-color: var(--hover-color);
    }

    /* Disable hover background color when processing */
    button.processing:hover {
        background-color: var(--processing-background-color);
    }

    .loader {
        animation: rotate 1s linear infinite;
        transform-origin: center;
    }

    .path {
        stroke: var(--loader-color);
        stroke-linecap: butt;
        stroke-dasharray: 90, 150;
        stroke-dashoffset: 0;
    }

    @keyframes rotate {
        100% {
            transform: rotate(360deg);
        }
    }
</style>
