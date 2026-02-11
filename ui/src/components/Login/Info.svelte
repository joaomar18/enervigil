<script lang="ts">
    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { InfoStyle } from "$lib/style/login";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $InfoStyle;

    // Props
    export let appImageUrl: string;

    // Layout / styling props
    export let paddingTop: string | undefined = undefined;
    export let paddingBottom: string | undefined = undefined;
    export let appImageBackgroundColor: string | undefined = undefined;
    export let appImageShadowColor: string | undefined = undefined;
    export let mainTextColor: string | undefined = undefined;
    export let subTextColor: string | undefined = undefined;
    export let mainTextWeight: string | undefined = undefined;
    export let subTextWeight: string | undefined = undefined;

    $: localOverrides = {
        paddingTop,
        paddingBottom,
        appImageBackgroundColor,
        appImageShadowColor,
        mainTextColor,
        subTextColor,
        mainTextWeight,
        subTextWeight,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);
</script>

<!-- 
  InfoSection: Displays language-based heading and subheading,
  followed by a circular background image.
-->
<div
    class="container"
    style="
        --padding-top: {mergedStyle.paddingTop};
        --padding-bottom: {mergedStyle.paddingBottom};
        --main-text-color: {mergedStyle.mainTextColor};
        --sub-text-color: {mergedStyle.subTextColor};
        --main-text-weight: {mergedStyle.mainTextWeight};
        --sub-text-weight: {mergedStyle.subTextWeight};
    "
>
    <div class="content">
        <h1>
            {$texts.infoMainMessage}
        </h1>
        <h3>
            {$texts.infoSubMessage}
        </h3>
        <div
            class="app-image"
            style="
                --background-image-url: url({appImageUrl});
                --image-background-color: {mergedStyle.appImageBackgroundColor};
                --image-shadow-color: {mergedStyle.appImageShadowColor};
            "
        ></div>
    </div>
</div>

<style>
    /* Outer wrapper with configurable vertical padding */
    .container {
        width: 100%;
        margin: 0;
        padding: 0;
        margin-top: 20px;
        padding-top: var(--padding-top, 0px);
        padding-bottom: var(--padding-bottom, 0px);
        display: flex;
        justify-content: center;
        align-items: center;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
    }

    /* Content layout (stacked, centered) */
    .content {
        width: fit-content;
        height: fit-content;
        display: flex;
        justify-content: start;
        flex-direction: column;
        align-items: center;
        -webkit-tap-highlight-color: transparent;
    }

    /* Main heading */
    h1 {
        text-align: left;
        font-size: 1.6rem;
        font-weight: var(--main-text-weight);
        white-space: pre-line;
        font-family: "Raleway", Tahoma, Geneva, Verdana, sans-serif;
        color: var(--main-text-color);
        line-height: 1.75;
        padding: 0;
        margin: 0;
        padding-bottom: 30px;
    }

    /* Sub heading */
    h3 {
        text-align: left;
        font-size: 1.15rem;
        font-weight: var(--sub-text-weight);
        font-family: "Raleway", Tahoma, Geneva, Verdana, sans-serif;
        white-space: pre-line;
        color: var(--sub-text-color);
        padding: 0;
        margin: 0;
        padding-bottom: 50px;
    }

    /* Circular image container with dynamic background image */
    .app-image {
        width: 256px;
        height: 256px;
        background-color: var(--image-background-color);
        border-radius: 50%;
        background-repeat: no-repeat;
        background-position: center;
        background-image: var(--background-image-url);
        box-shadow: 0px 6px 20px var(--image-shadow-color);
        background-size: 75%;
    }
</style>
