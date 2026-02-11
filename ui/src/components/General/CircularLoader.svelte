<script lang="ts">
    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { CircularLoaderStyle } from "$lib/style/general";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $CircularLoaderStyle;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let loaderTopPos: string | undefined = undefined;
    export let wrapperTopPos: string | undefined = undefined;
    export let wrapperBackgroundColor: string | undefined = undefined;
    export let wrapperOpacity: string | undefined = undefined;
    export let wrapperTopLeftRadius: string | undefined = undefined;
    export let wrapperTopRightRadius: string | undefined = undefined;
    export let wrapperBottomLeftRadius: string | undefined = undefined;
    export let wrapperBottomRightRadius: string | undefined = undefined;
    export let border: string | undefined = undefined;
    export let loaderColor: string | undefined = undefined;

    $: localOverrides = {
        width,
        height,
        loaderTopPos,
        wrapperTopPos,
        wrapperBackgroundColor,
        wrapperOpacity,
        wrapperTopLeftRadius,
        wrapperTopRightRadius,
        wrapperBottomLeftRadius,
        wrapperBottomRightRadius,
        border,
        loaderColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);
</script>

<div
    style="
        --width: {mergedStyle.width};
        --height: {mergedStyle.height};
        --loader-top-position: {mergedStyle.loaderTopPos};
        --wrapper-top-position: {mergedStyle.wrapperTopPos};
        --wrapper-background-color: {mergedStyle.wrapperBackgroundColor};
        --wrapper-opacity: {mergedStyle.wrapperOpacity};
        --wrapper-top-left-radius: {mergedStyle.wrapperTopLeftRadius};
        --wrapper-top-right-radius: {mergedStyle.wrapperTopRightRadius};
        --wrapper-bottom-left-radius: {mergedStyle.wrapperBottomLeftRadius};
        --wrapper-bottom-right-radius: {mergedStyle.wrapperBottomRightRadius};
        --border: {mergedStyle.border};
        --loader-color: {mergedStyle.loaderColor};
    "
    class="loader-div"
>
    <div class="loader-div-wrapper">
        <div class="spinner"></div>
    </div>
</div>

<style>
    /* Loader overlay container */
    .loader-div {
        position: absolute;
        inset: 0;
        margin: 0;
        padding: 0;
        transform: translateY(var(--wrapper-top-position));
        box-sizing: border-box;
    }

    .loader-div .loader-div-wrapper {
        margin: 0;
        margin-top: var(--loader-top-position);
        padding: 0;
        width: 100%;
        height: 100%;
        background-color: var(--wrapper-background-color);
        opacity: var(--wrapper-opacity);
        border-top-left-radius: var(--wrapper-top-left-radius);
        border-top-right-radius: var(--wrapper-top-right-radius);
        border-bottom-left-radius: var(--wrapper-bottom-left-radius);
        border-bottom-right-radius: var(--wrapper-bottom-right-radius);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    /* Spinner animation and style */
    .loader-div .loader-div-wrapper .spinner {
        width: var(--width);
        height: var(--height);
        border: var(--border);
        border-top-color: var(--loader-color);
        border-radius: 50%;
        animation: content-spin 1s linear infinite;
    }

    /* Spin animation: full rotation */
    @keyframes content-spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
