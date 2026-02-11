<script lang="ts">
    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { InlineLoaderStyle } from "$lib/style/general";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $InlineLoaderStyle;

    // Props
    export let loaded: boolean;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let border: string | undefined = undefined;
    export let shadow: string | undefined = undefined;
    export let waveBackground: string | undefined = undefined;
    export let waveAnimationTime: string | undefined = undefined;

    $: localOverrides = {
        width,
        height,
        backgroundColor,
        border,
        shadow,
        waveBackground,
        waveAnimationTime,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);
</script>

<!--
    InlineLoader
    - Small inline shimmer / skeleton placeholder used for narrow UI fragments.
    - Shows an animated "wave" overlay while content is loading and reveals the default
        slot when `loaded` is true.
    Props: loaded, width, height, backgroundColor, border, shadow,
                 waveBackground, waveAnimationTime (style object merging is supported).
    Accessibility: consider toggling aria-busy on the loader and aria-hidden on content
    when integrating this component into interactive or screen-reader sensitive flows.
-->
<div
    style="
        --width: {mergedStyle.width};
        --height: {mergedStyle.height};
        --background-color: {mergedStyle.backgroundColor};
        --border: {mergedStyle.border};
        --shadow: {mergedStyle.shadow};
        --wave-background: {mergedStyle.waveBackground};
        --wave-animation-time: {mergedStyle.waveAnimationTime};
    "
    class="inline-loader-div"
    class:loaded
>
    <div class="content">
        <slot />
    </div>
    <div class="wave"></div>
</div>

<style>
    /* Container: placeholder wrapper (sizing + visuals) */
    .inline-loader-div {
        position: relative;
        overflow: hidden;
        width: var(--width);
        height: var(--height);
        background-color: var(--background-color);
        border: var(--border);
        box-shadow: var(--shadow);
        transition: all 0.2s;
    }

    /* Content: slot wrapper (hidden while loading) */
    .inline-loader-div .content {
        margin: 0;
        padding: 0;
        position: relative;
        width: 100%;
        height: 100%;
        opacity: 0;
    }

    .inline-loader-div.loaded .content {
        opacity: 1;
    }

    /* Wave: shimmering overlay (animated) */
    .inline-loader-div .wave {
        position: absolute;
        top: 0;
        left: -150%;
        width: 50%;
        height: 100%;
        background: var(--wave-background);
        animation: wave var(--wave-animation-time) ease-in-out infinite;
    }

    /* @keyframes wave: left -> right movement */
    @keyframes wave {
        0% {
            left: -150%;
        }
        100% {
            left: 150%;
        }
    }

    /* Loaded state: clear placeholder visuals and stop animation */
    .inline-loader-div.loaded {
        background-color: transparent;
        border: none;
        box-shadow: none;
    }

    /* Hides the loader wave when loaded is signaled */
    .inline-loader-div.loaded .wave {
        animation: none;
        opacity: 0;
    }
</style>
