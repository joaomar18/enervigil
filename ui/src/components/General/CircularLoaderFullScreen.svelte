<script lang="ts">
    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { CircularLoaderFullScreenStyle } from "$lib/style/general";

    // Props
    export let closeWrapper: boolean;
    export let showLoader: boolean;

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $CircularLoaderFullScreenStyle;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let border: string | undefined = undefined;
    export let loaderColor: string | undefined = undefined;

    $: localOverrides = {
        width,
        height,
        border,
        loaderColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);
</script>

<!--
    Circular Loader Full Screen: fullscreen or container-based loading spinner overlay.
    Shows a centered animated spinner, with optional fade/close and color customization.
    Used to indicate loading states for pages or components.
-->
<div
    style="
        --width: {mergedStyle.width};
        --height: {mergedStyle.height};
        --border: {mergedStyle.border};
        --loader-color: {mergedStyle.loaderColor};
    "
    class="loader-div"
>
    <div class="loader-div-wrapper" class:close={closeWrapper}>
        <div class="spinner" class:show={showLoader}></div>
    </div>
</div>

<style>
    /* Loader overlay container */
    .loader-div {
        position: absolute;
        inset: 0;
        margin: 0;
        padding: 0;
        top: -94px;
        box-sizing: border-box;
        width: 100%;
        height: 100vh;
    }

    /* Wrapper for centering spinner and background */
    .loader-div .loader-div-wrapper {
        margin: 0;
        padding: 0;
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #181d23;
        z-index: 98;
    }

    /* Hide/fade loader when closed */
    .loader-div .loader-div-wrapper.close {
        opacity: 0;
        z-index: 0;
        pointer-events: none;
    }

    /* Spinner animation and style */
    .loader-div .loader-div-wrapper .spinner {
        width: var(--width);
        height: var(--height);
        border: var(--border);
        border-top-color: var(--loader-color);
        border-radius: 50%;
        animation: content-spin 1s linear infinite;
        opacity: 0;
    }

    /* Show spinner when loading */
    .loader-div .loader-div-wrapper .spinner.show {
        opacity: 1;
    }

    /* Spin animation: full rotation */
    @keyframes content-spin {
        to {
            transform: rotate(360deg);
        }
    }

    /* Fix top position on container */
    @media (min-width: 470px) {
        .loader-div {
            top: -104px;
        }
    }
</style>
