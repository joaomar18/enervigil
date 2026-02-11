<script lang="ts">
    import SlottedAction from "../General/SlottedAction.svelte";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { MobileDeviceInfoHeaderStyle } from "$lib/style/device";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $MobileDeviceInfoHeaderStyle;

    // Props
    export let dataFetched: boolean;
    export let deviceId: number;

    // Layout / styling props
    export let mainTextColor: string | undefined = undefined;
    export let mainTextWeight: string | undefined = undefined;
    export let subTextColor: string | undefined = undefined;
    export let subTextWeight: string | undefined = undefined;
    export let imageWidth: string | undefined = undefined;
    export let imageHeight: string | undefined = undefined;
    export let arrowWidth: string | undefined = undefined;
    export let arrowHeight: string | undefined = undefined;

    $: localOverrides = {
        mainTextColor,
        mainTextWeight,
        subTextColor,
        subTextWeight,
        imageWidth,
        imageHeight,
        arrowWidth,
        arrowHeight,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);
</script>

<!-- Mobile device info header: shows device icon, name, and ID in a clickable row for mobile layouts
Uses SlottedAction for consistent button-like behavior -->
{#if dataFetched}
    <SlottedAction width="100%" onClick={() => {}}>
        <div
            style="
                    --main-text-color: {mergedStyle.mainTextColor};
                    --main-text-weight: {mergedStyle.mainTextWeight};
                    --sub-text-color: {mergedStyle.subTextColor};
                    --sub-text-weight: {mergedStyle.subTextWeight};
                    --image-width: {mergedStyle.imageWidth};
                    --image-height: {mergedStyle.imageHeight};
                    --arrow-width: {mergedStyle.arrowWidth};
                    --arrow-height: {mergedStyle.arrowHeight};
                "
            class="content"
        >
            <div class="device-context-div">
                <div class="device-label">
                    <img src="/img/current-device.svg" alt="Current device" />
                    <span>{$texts.device}</span>
                </div>
                <span class="sub-text">ID: {String(deviceId).padStart(3, "0")}</span>
            </div>
            <img class="arrow" src="/img/down-arrow.svg" alt="down-arrow" />
        </div>
    </SlottedAction>
{/if}

<style>
    /* Main content container */
    .content {
        position: relative;
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    /* Device context section: holds label and ID */
    .device-context-div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex: 1;
        min-width: 0;
        height: 100%;
        padding-left: 15px;
        padding-right: 5px;
    }

    /* Device label: icon and name, horizontally aligned */
    .device-context-div .device-label {
        min-width: 0;
        flex: 1;
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
    }

    /* Device icon sizing via CSS variables */
    .device-context-div .device-label img {
        width: var(--image-width);
        height: var(--image-height);
    }

    /* Device name styling, hidden on small screens */
    .device-context-div .device-label span {
        display: none;
        padding-left: 5px;
        padding-right: 10px;
        font-size: 16px;
        min-width: 0;
        color: var(--main-text-color);
        font-weight: var(--main-text-weight);
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Subtext for device ID */
    .sub-text {
        font-size: 14px;
        color: var(--sub-text-color);
        font-weight: var(--sub-text-weight);
        white-space: nowrap;
        flex-shrink: 0;
        transform: translateY(1px);
    }

    /* Arrow icon for navigation/expansion */
    .arrow {
        padding-right: 10px;
        width: var(--arrow-width);
        height: var(--arrow-height);
    }

    /* Show device name on larger screens */
    @media (min-width: 420px) {
        .device-context-div .device-label span {
            display: block;
        }
    }
</style>
