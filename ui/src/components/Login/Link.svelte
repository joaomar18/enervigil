<script lang="ts">
    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { LinkStyle } from "$lib/style/login";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $LinkStyle;

    // Props
    export let buttonText: string = "";
    export let imageURL: string = "";

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let paddingLeft: string | undefined = undefined;
    export let paddingRight: string | undefined = undefined;
    export let imageWidth: string | undefined = undefined;
    export let imageHeight: string | undefined = undefined;
    export let imageRightPosition: string | undefined = undefined;
    export let fontSize: string | undefined = undefined;
    export let fontColor: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let hoverColor: string | undefined = undefined;
    export let borderBottomColor: string | undefined = undefined;

    $: localOverrides = {
        width,
        height,
        paddingLeft,
        paddingRight,
        imageWidth,
        imageHeight,
        imageRightPosition,
        fontSize,
        fontColor,
        backgroundColor,
        hoverColor,
        borderBottomColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    export let onClick: () => void;

    // Functions
    const isPercent = (val: string) => typeof val === "string" && val.trim().endsWith("%");

    function handleClick(): void {
        if (onClick) {
            onClick();
        }
    }
</script>

<!-- 
  Link: Reusable button with optional image. Adapts layout based on width/height units.
-->
<div
    class="link-div"
    style="
        --div-width: {isPercent(String(mergedStyle.width)) ? mergedStyle.width : 'fit-content'};
        --div-height: {isPercent(String(mergedStyle.height)) ? mergedStyle.height : 'fit-content'};
        --background-color: {mergedStyle.backgroundColor};
        --hover-color: {mergedStyle.hoverColor};
    "
>
    <div class="content">
        <span
            style="
            --span-width: {!isPercent(String(mergedStyle.width)) ? mergedStyle.width : '100%'};
            --span-height: {!isPercent(String(mergedStyle.height)) ? mergedStyle.height : '100%'};
            --padding-left: {mergedStyle.paddingLeft};
            --padding-right: {mergedStyle.paddingRight};
            --border-bottom-color: {mergedStyle.borderBottomColor};
            --font-size: {mergedStyle.fontSize};
            --font-color: {mergedStyle.fontColor};
            
        ">{buttonText}</span
        >
        {#if mergedStyle.imageWidth && mergedStyle.imageHeight}
            <img
                style="
                --image-width: {mergedStyle.imageWidth};
                --image-height: {mergedStyle.imageHeight};
                --image-right: {mergedStyle.imageRightPosition};
            "
                src={imageURL}
                alt={imageURL}
            />
        {/if}
        <button on:click={handleClick} aria-label="Link Button"></button>
    </div>
</div>

<style>
    /* Outer wrapper with configurable width and height */
    .link-div {
        position: relative;
        width: var(--div-width);
        height: var(--div-height);
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
    }

    /* Internal content container */
    .content {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        -webkit-tap-highlight-color: transparent;
    }

    /* Hover effect for the span background */
    .content:hover span {
        background-color: var(--hover-color);
    }

    /* Styled span acting as the main button body */
    span {
        box-sizing: border-box;
        display: flex;
        justify-content: start;
        align-items: center;
        flex-direction: row;
        margin: 0;
        padding: 0;
        padding-left: var(--padding-left);
        padding-right: var(--padding-right);
        width: var(--span-width);
        height: var(--span-height);
        background-color: var(--background-color);
        border-bottom: 1px solid var(--border-bottom-color);
        color: var(--font-color);
        font-size: var(--font-size);
        font-weight: 400;
        outline: none;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    /* Transparent overlay button for capturing clicks */
    button {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        padding: 0;
        margin: 0;
        opacity: 0;
        cursor: pointer;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }

    /*  Optional positioned icon on the right side of the component */
    img {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: var(--image-width, 0px);
        height: var(--image-height, 0px);
        right: var(--image-right, 0px);
    }
</style>
