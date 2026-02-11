<script lang="ts">
    import Action from "../General/Action.svelte";
    import ToolTipText from "../General/ToolTipText.svelte";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { DeviceInfoHeaderStyle } from "$lib/style/device";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $DeviceInfoHeaderStyle;

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Props
    export let dataFetched: boolean;
    export let deviceId: number;
    export let deviceName: string;
    export let deviceImageUrl: string;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let maxWidth: string | undefined = undefined;
    export let mainTextWidth: string | undefined = undefined;
    export let mainTextColor: string | undefined = undefined;
    export let mainTextWeight: string | undefined = undefined;
    export let subTextColor: string | undefined = undefined;
    export let subTextWeight: string | undefined = undefined;
    export let imageWidth: string | undefined = undefined;
    export let imageHeight: string | undefined = undefined;
    export let imageBackgroundColor: string | undefined = undefined;
    export let imageBorderRadius: string | undefined = undefined;

    $: localOverrides = {
        width,
        maxWidth,
        mainTextWidth,
        mainTextColor,
        mainTextWeight,
        subTextColor,
        subTextWeight,
        imageWidth,
        imageHeight,
        imageBackgroundColor,
        imageBorderRadius,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);
</script>

<!--
    Device info header: displays the main device information at the top of the device view page.
    Includes the device image, device name, and device ID, all styled in a horizontal row.
-->
{#if dataFetched}
    <div
        class="info-div"
        style="
            --width: {mergedStyle.width};
            --max-width: {mergedStyle.maxWidth};
            --main-text-width: {mergedStyle.mainTextWidth};
            --main-text-color: {mergedStyle.mainTextColor};
            --main-text-weight: {mergedStyle.mainTextWeight};
            --sub-text-color: {mergedStyle.subTextColor};
            --sub-text-weight: {mergedStyle.subTextWeight};
            --image-width: {mergedStyle.imageWidth};
            --image-height: {mergedStyle.imageHeight};
            --image-background-color: {mergedStyle.imageBackgroundColor};
            --image-border-radius: {mergedStyle.imageBorderRadius};
        "
    >
        <div class="section">
            <div style="background-image: {`url('${deviceImageUrl}')`};" class="device-image-div" class:image-loaded={Boolean(deviceImageUrl)}></div>
            <div class="inner-section device-identification">
                <span class="device-name">{deviceName}</span>
                <span class="sub-text">ID: {String(deviceId).padStart(3, "0")}</span>
            </div>
        </div>
        <div class="expand-more-div">
            <Action imageURL="/img/expand-down.svg" enableToolTip={true} onClick={() => {}}>
                <div slot="tooltip"><ToolTipText text={$texts.devicesList} /></div>
            </Action>
        </div>
    </div>
{/if}

<style>
    /* Main container for device info header */
    .info-div {
        margin: 0;
        padding: 0;
        width: var(--width);
        min-width: 0;
        max-width: var(--max-width, auto);
        height: fit-content;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    /* Section with image and device identification */
    .section {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        flex-grow: 1;
        height: fit-content;
        min-width: 0;
    }

    /* Device name and ID */
    .section .inner-section {
        margin: 0;
        padding: 0;
        padding-left: 10px;
        gap: 10px;
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-grow: 1;
        justify-content: space-between;
        min-width: 0;
    }

    /* Device name styling */
    .device-identification .device-name {
        font-size: 16px;
        min-width: 0;
        color: var(--main-text-color);
        font-weight: var(--main-text-weight);
        flex-grow: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Expand more button container */
    .expand-more-div {
        margin: 0;
        padding: 0;
        padding-left: 10px;
        width: fit-content;
        height: fit-content;
    }

    /* Subtext for device ID */
    .sub-text {
        font-size: 14px;
        transform: translateY(1px);
        color: var(--sub-text-color);
        font-weight: var(--sub-text-weight);
        white-space: nowrap;
        flex-shrink: 0;
    }

    /* Device image styling */
    .device-image-div {
        display: none;
        position: relative;
        padding: 0;
        margin: 0;
        width: var(--image-width);
        min-width: var(--image-width);
        height: var(--image-height);
        background-color: var(--image-background-color);
        background-repeat: no-repeat;
        background-position: center;
        background-size: auto 100%;
        border-radius: var(--image-border-radius);
        -webkit-tap-highlight-color: transparent;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
        transform-origin: center;
        -webkit-font-smoothing: antialiased;
        object-fit: cover;
    }

    /* Show image when loaded */
    .device-image-div.image-loaded {
        opacity: 1;
    }

    /* Show image on larger screens */
    @media (min-width: 720px) {
        .device-image-div {
            display: block;
        }
    }
</style>
