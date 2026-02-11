<script lang="ts">
    import Action from "../General/Action.svelte";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { DeviceCardStyle, DeviceActionStyle, DeviceExpandedActionStyle } from "$lib/style/device";
    import ToolTipText from "../General/ToolTipText.svelte";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $DeviceCardStyle;

    //Props
    export let deviceID: number;
    export let deviceName: string;
    export let connected: boolean;
    export let alarm: boolean;
    export let warning: boolean;
    export let imageURL: string;

    // Layout / styling props
    export let stateDimColor: string | undefined = undefined;
    export let stateAlarmColor: string | undefined = undefined;
    export let stateWarningColor: string | undefined = undefined;
    export let stateConnectedColor: string | undefined = undefined;
    export let stateDisconnectedColor: string | undefined = undefined;
    export let width: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let borderRadius: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let borderColor: string | undefined = undefined;
    export let imageBackgroundColor: string | undefined = undefined;
    export let imageContainerWidth: string | undefined = undefined;
    export let imageContainerHeight: string | undefined = undefined;
    export let imageContainerBorderRadius: string | undefined = undefined;
    export let imageWidth: string | undefined = undefined;
    export let imageHeight: string | undefined = undefined;
    export let textColor: string | undefined = undefined;
    export let imageHoverBackgroundColor: string | undefined = undefined;
    export let shadowColor: string | undefined = undefined;
    export let titleColor: string | undefined = undefined;

    $: localOverrides = {
        stateDimColor,
        stateAlarmColor,
        stateWarningColor,
        stateConnectedColor,
        stateDisconnectedColor,
        width,
        height,
        borderRadius,
        backgroundColor,
        borderColor,
        imageBackgroundColor,
        imageContainerWidth,
        imageContainerHeight,
        imageContainerBorderRadius,
        imageWidth,
        imageHeight,
        textColor,
        imageHoverBackgroundColor,
        shadowColor,
        titleColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let state: "alarmState" | "warningState" | "connectedState" | "disconnectedState";
    let enterButtonSize: string;
    let hovered: boolean = false;

    // Reactive Statements
    $: resolveState(connected, alarm, warning);
    $: enterButtonSize = `${parseInt(String(mergedStyle.imageContainerWidth)) - 50}px`;

    // Export Funcions
    export let onEdit: () => void;
    export let onInfo: () => void;
    export let onEnter: () => void;

    // Functions
    function resolveState(connected: boolean, alarm: boolean, warning: boolean) {
        if (alarm) {
            state = "alarmState";
        } else if (warning) {
            state = "warningState";
        } else if (connected) {
            state = "connectedState";
        } else {
            state = "disconnectedState";
        }
    }

    function handleEdit(): void {
        if (onEdit) {
            onEdit();
        }
    }

    function handleInfo(): void {
        if (onInfo) {
            onInfo();
        }
    }

    function handleEnter(): void {
        if (onEnter) {
            onEnter();
        }
    }
</script>

<!-- Device Card: displays a device’s name, image, action buttons, ID and connection status -->
<div
    style="
        --state-dim-color: {mergedStyle.stateDimColor};
        --state-alarm-color: {mergedStyle.stateAlarmColor};
        --state-warning-color: {mergedStyle.stateWarningColor};
        --state-connected-color: {mergedStyle.stateConnectedColor};
        --state-disconnected-color: {mergedStyle.stateDisconnectedColor};
        --width: {mergedStyle.width};
        --height: {mergedStyle.height};
        --border-radius: {mergedStyle.borderRadius};
        --background-color: {mergedStyle.backgroundColor};
        --border-color: {mergedStyle.borderColor};
        --image-background-color: {mergedStyle.imageBackgroundColor};
        --image-container-width: {mergedStyle.imageContainerWidth};
        --image-container-height: {mergedStyle.imageContainerHeight};
        --image-container-border-radius: {mergedStyle.imageContainerBorderRadius};
        --image-width: {mergedStyle.imageWidth};
        --image-height: {mergedStyle.imageHeight};
        --text-color: {mergedStyle.textColor};
        --image-hover-background-color: {mergedStyle.imageHoverBackgroundColor};
        --shadow-color: {mergedStyle.shadowColor};
        --title-color: {mergedStyle.titleColor};
        --enter-button-size: {enterButtonSize};
    "
    class="container"
>
    <div class="box">
        <div
            class="content"
            role="presentation"
            on:mouseenter={() => {
                hovered = true;
            }}
            on:mouseleave={() => {
                hovered = false;
            }}
        >
            <h3>{deviceName}</h3>
            <div class="device-image-div" class:image-loaded={true}>
                <img src={imageURL} alt={imageURL} />
                <button class="device-image-mask" on:click={handleEnter} aria-label="Enter Device"></button>
            </div>
            <div class="actions-div">
                <Action
                    style={hovered ? $DeviceExpandedActionStyle : $DeviceActionStyle}
                    enableToolTip={true}
                    imageURL="/img/info.svg"
                    onClick={handleInfo}
                >
                    <div slot="tooltip"><ToolTipText text={$texts.deviceDetails} /></div>
                </Action>
                <Action
                    style={hovered ? $DeviceExpandedActionStyle : $DeviceActionStyle}
                    enableToolTip={true}
                    imageURL="/img/edit.svg"
                    onClick={handleEdit}
                >
                    <div slot="tooltip"><ToolTipText text={$texts.editConfig} /></div>
                </Action>
                <Action
                    style={hovered ? $DeviceExpandedActionStyle : $DeviceActionStyle}
                    enableToolTip={true}
                    imageURL="/img/enter.svg"
                    onClick={handleEnter}
                >
                    <div slot="tooltip"><ToolTipText text={$texts.generalView} /></div>
                </Action>
            </div>
            <span class="id-text">ID: {String(deviceID).padStart(3, "0")}</span>
            <div class="connection-state-div">
                <div class="connection-status" data-state={state}></div>
                <span class="connection-text">{$texts[state]}</span>
            </div>
        </div>
    </div>
</div>

<style>
    /* Container: card wrapper with size */
    .container {
        width: var(--width);
        height: var(--height);
        position: relative;
        overflow: visible;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
        transform-origin: center;
        -webkit-font-smoothing: antialiased;
        object-fit: cover;
    }

    /* Card Box with style and scaling behaviour */
    .box {
        width: 100%;
        height: 100%;
        border-radius: var(--border-radius, 0px);
        background-color: var(--background-color);
        border: 1px solid var(--border-color);
        transition: all 0.2s ease-in-out;
        transform-origin: center center;
        will-change: width, height;
    }

    /* Behaviour of box on hover */
    .box:hover {
        width: calc(1.0625 * var(--width));
        height: calc(1.0625 * var(--height));
        margin-left: calc((-0.03125) * var(--width));
        margin-top: calc((-0.03125) * var(--height));
        box-shadow: 0 8px 16px var(--shadow-color);
    }

    /* Content: vertical flex container, centered items */
    .content {
        padding: 0;
        margin: 0;
        width: 100%;
        height: 100%;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        -webkit-tap-highlight-color: transparent;
    }

    /* Title: centered light-weight heading, truncate if too long */
    h3 {
        margin: 0;
        padding: 20px;
        color: var(--title-color);
        width: 100%;
        text-align: center;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        box-sizing: border-box;
    }

    /* Image div: placeholder with bg image */
    .device-image-div {
        position: relative;
        padding: 0;
        margin: 0;
        margin-top: 10px;
        width: var(--image-container-width);
        height: var(--image-container-height);
        background-color: var(--image-background-color);
        border-radius: var(--image-container-border-radius);
        opacity: 0;
        transition: all 0.2s ease-in-out;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Scaling of image div on card hover */
    .box:hover .device-image-div {
        width: calc(1.0625 * var(--image-container-width));
        height: calc(1.0625 * var(--image-container-height));
    }

    /* Image loaded state: fully visible */
    .device-image-div.image-loaded {
        opacity: 1;
    }

    /* Image hover: slightly dim the device image on hover */
    .device-image-div:hover {
        opacity: 0.8;
    }

    /* Ensure hover effect works with loaded images */
    .device-image-div.image-loaded:hover {
        opacity: 0.8;
    }

    /* Image styling and sizing */
    .device-image-div img {
        width: var(--image-width);
        height: var(--image-height);
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
        transform-origin: center;
        -webkit-font-smoothing: antialiased;
        object-fit: cover;
    }

    /* Overlay mask: invisible full-circle button to capture clicks */
    .device-image-div .device-image-mask {
        padding: 0;
        margin: 0;
        border: none;
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        cursor: pointer;
        background: transparent;
        background-repeat: no-repeat;
        background-position: center;
        background-size: var(--enter-button-size) var(--enter-button-size);
        transition:
            background-color 0.2s ease-in-out,
            opacity 0.2s ease-in-out;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }

    /* Overlay hover: show enter icon and translucent gray overlay */
    .device-image-mask:hover {
        background-image: url("/img/enter.svg");
        background-color: var(--image-hover-background-color);
    }

    /* Actions: horizontal flex layout for buttons */
    .actions-div {
        margin: 0;
        padding: 0;
        padding-top: 25px;
        width: fit-content;
        gap: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    /* ID text: positioned bottom-left, subtle styling */
    .id-text {
        position: absolute;
        left: 20px;
        bottom: 10px;
        color: var(--text-color);
        font-size: 0.9rem;
        font-weight: 300;
    }

    /* Connection state container: bottom-right alignment */
    .connection-state-div {
        position: absolute;
        right: 20px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
        bottom: 10px;
    }

    /* Status dot: default disconnected color */
    .connection-state-div .connection-status {
        width: 16px;
        height: 16px;
        border-radius: 8px;
    }

    /* Dimmed state - Default/unknown device status */
    .connection-state-div .connection-status[data-state="dim"] {
        background: var(--state-dim-color);
    }

    /* Connected state - Connected operational status (green) */
    .connection-state-div .connection-status[data-state="connectedState"] {
        background: var(--state-connected-color);
    }

    /* Alarm state - Critical error condition (red) */
    .connection-state-div .connection-status[data-state="alarmState"] {
        background: var(--state-alarm-color);
    }

    /* Warning state - Non-critical issues (yellow/amber) */
    .connection-state-div .connection-status[data-state="warningState"] {
        background: var(--state-warning-color);
    }

    /* Disconnected state - Communication lost (gray) */
    .connection-state-div .connection-status[data-state="disconnectedState"] {
        background: var(--state-disconnected-color);
    }

    /* Connection text: subtle label next to dot */
    .connection-state-div .connection-text {
        color: var(--text-color);
        font-size: 0.9rem;
        font-weight: 300;
    }
</style>
