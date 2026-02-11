<script lang="ts">
    import RightPanelSheet from "../General/RightPanelSheet.svelte";
    import InlineLoader from "../General/InlineLoader.svelte";
    import ElapsedDateTime from "../General/TimeDate/ElapsedDateTime.svelte";
    import { getDeviceExtendedInfoAPI } from "$lib/logic/api/device";
    import type { DeviceStatus, ExtendedDeviceInfo } from "$lib/types/device/base";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";
    import { meterTypeTexts } from "$lib/stores/lang/energyMeterTexts";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { DeviceDetailSheetStyle } from "$lib/style/device";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $DeviceDetailSheetStyle;

    // Props
    export let deviceImage: string;
    export let deviceStatus: DeviceStatus;
    export let showPanel: boolean;

    // Layout / styling props
    export let stateDimColor: string | undefined = undefined;
    export let stateAlarmColor: string | undefined = undefined;
    export let stateWarningColor: string | undefined = undefined;
    export let stateConnectedColor: string | undefined = undefined;
    export let stateDisconnectedColor: string | undefined = undefined;
    export let titleSize: string | undefined = undefined;
    export let titleColor: string | undefined = undefined;
    export let titleWeight: string | undefined = undefined;
    export let titleItemGap: string | undefined = undefined;
    export let titleImageWidth: string | undefined = undefined;
    export let titleImageHeight: string | undefined = undefined;
    export let headerRowHeigth: string | undefined = undefined;
    export let headerStateDivWidth: string | undefined = undefined;
    export let headerRowGap: string | undefined = undefined;
    export let headerColGap: string | undefined = undefined;
    export let headerLabelWidth: string | undefined = undefined;
    export let headerLabelSize: string | undefined = undefined;
    export let headerLabelColor: string | undefined = undefined;
    export let headerLabelWeight: string | undefined = undefined;
    export let headerValueSize: string | undefined = undefined;
    export let headerValueColor: string | undefined = undefined;
    export let headerValueWeight: string | undefined = undefined;
    export let headerSubValueSize: string | undefined = undefined;
    export let headerSubValueColor: string | undefined = undefined;
    export let headerSubValueWeight: string | undefined = undefined;
    export let contentTitleSize: string | undefined = undefined;
    export let contentTitleColor: string | undefined = undefined;
    export let contentTitleWeight: string | undefined = undefined;
    export let contentTitlePaddingLeft: string | undefined = undefined;
    export let contentTitlePaddingBottom: string | undefined = undefined;
    export let contentTitleBorderBottom: string | undefined = undefined;
    export let contentTitleSpacing: string | undefined = undefined;
    export let contentTitleTransform: string | undefined = undefined;
    export let contentInnerPaddingTop: string | undefined = undefined;
    export let contentInnerPaddingBottom: string | undefined = undefined;
    export let contentInnerPaddingHorizontal: string | undefined = undefined;
    export let contentRowHeight: string | undefined = undefined;
    export let contentStateDivWidth: string | undefined = undefined;
    export let contentRowGap: string | undefined = undefined;
    export let contentColGap: string | undefined = undefined;
    export let contentLabelWidth: string | undefined = undefined;
    export let contentLabelSize: string | undefined = undefined;
    export let contentLabelColor: string | undefined = undefined;
    export let contentLabelWeight: string | undefined = undefined;
    export let contentValueSize: string | undefined = undefined;
    export let contentValueColor: string | undefined = undefined;
    export let contentValueWeight: string | undefined = undefined;
    export let imageBackgroundColor: string | undefined = undefined;
    export let imageContainerWidth: string | undefined = undefined;
    export let imageContainerHeight: string | undefined = undefined;
    export let imageContainerBorderRadius: string | undefined = undefined;
    export let imageWidth: string | undefined = undefined;
    export let imageHeight: string | undefined = undefined;

    $: localOverrides = {
        stateDimColor,
        stateAlarmColor,
        stateWarningColor,
        stateConnectedColor,
        stateDisconnectedColor,
        titleSize,
        titleColor,
        titleWeight,
        titleItemGap,
        titleImageWidth,
        titleImageHeight,
        headerRowHeigth,
        headerStateDivWidth,
        headerRowGap,
        headerColGap,
        headerLabelWidth,
        headerLabelSize,
        headerLabelColor,
        headerLabelWeight,
        headerValueSize,
        headerValueColor,
        headerValueWeight,
        headerSubValueSize,
        headerSubValueColor,
        headerSubValueWeight,
        contentTitleSize,
        contentTitleColor,
        contentTitleWeight,
        contentTitlePaddingLeft,
        contentTitlePaddingBottom,
        contentTitleBorderBottom,
        contentTitleSpacing,
        contentTitleTransform,
        contentInnerPaddingTop,
        contentInnerPaddingBottom,
        contentInnerPaddingHorizontal,
        contentRowHeight,
        contentStateDivWidth,
        contentRowGap,
        contentColGap,
        contentLabelWidth,
        contentLabelSize,
        contentLabelColor,
        contentLabelWeight,
        contentValueSize,
        contentValueColor,
        contentValueWeight,
        imageBackgroundColor,
        imageContainerWidth,
        imageContainerHeight,
        imageContainerBorderRadius,
        imageWidth,
        imageHeight,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let state: "alarmState" | "warningState" | "connectedState" | "disconnectedState";
    let nodesNumberState: "alarmState" | "warningState" | "connectedState" | "disconnectedState";
    let deviceExtendedInfo: ExtendedDeviceInfo;
    let deviceExtendedInfoFetched: boolean = false;
    let deviceExtendedInfoFirstFetch: boolean = false;
    let deviceExtendedInfoLoading: boolean = false;
    let deviceExtendedInfoTimeout: ReturnType<typeof setTimeout> | null = null;

    // Reactive Statements
    $: if (!showPanel) {
        deviceExtendedInfoFirstFetch = false;
    }

    // Initial Node State processing
    $: if (deviceStatus && showPanel) {
        resolveState(deviceStatus);
        loadDeviceExtendedInfo();
    }

    $: if (!deviceExtendedInfoFetched && !deviceExtendedInfoLoading) {
        if (deviceExtendedInfoFirstFetch) {
            deviceExtendedInfoTimeout = setTimeout(() => {
                deviceExtendedInfoLoading = !deviceExtendedInfoFetched;
            }, 500);
        } else {
            deviceExtendedInfoLoading = true;
        }
    }
    $: if (deviceExtendedInfoFetched) {
        if (deviceExtendedInfoTimeout) {
            clearInterval(deviceExtendedInfoTimeout);
            deviceExtendedInfoTimeout = null;
        }
        deviceExtendedInfoLoading = false;
    }

    // Functions
    async function loadDeviceExtendedInfo() {
        if (!deviceStatus) {
            return;
        }
        deviceExtendedInfoFetched = false;
        let result = await getDeviceExtendedInfoAPI(deviceStatus.id).call({ timeout: 5000 });
        if (result !== null) {
            deviceExtendedInfo = result.deviceInfo;
            resolveNodesNumberState(deviceExtendedInfo);
            deviceExtendedInfoFetched = true;
            deviceExtendedInfoFirstFetch = true;
        }
    }

    function resolveState(status: DeviceStatus) {
        if (status.alarm) {
            state = "alarmState";
        } else if (status.warning) {
            state = "warningState";
        } else if (status.connected) {
            state = "connectedState";
        } else {
            state = "disconnectedState";
        }
    }

    function resolveNodesNumberState(info: ExtendedDeviceInfo) {
        if (!info.connected) {
            nodesNumberState = "disconnectedState";
        } else if (info.ok_nodes == 0 && info.enabled_nodes > 0) {
            nodesNumberState = "alarmState";
        } else if (info.ok_nodes != info.enabled_nodes) {
            nodesNumberState = "warningState";
        } else nodesNumberState = "connectedState";
    }
</script>

<!--
    DeviceDetailSheet Component

    A right-panel sheet component for presenting detailed device-level information,
    combining configuration, connectivity, and operational state in a compact and
    non-redundant layout. The component fetches and displays extended device metadata
    on demand, including protocol and type information, lifecycle timestamps, derived
    connection state, last-seen activity, node health aggregation, and read period.

    It derives visual state indicators (connected, warning, alarm, disconnected) from
    aggregated device and node status, and provides clear separation between static
    configuration data and dynamic connectivity information. The component manages
    asynchronous data loading with inline loaders and delayed loading indicators to
    ensure a smooth user experience.

    Supports extensive theming and layout customization through configurable style
    properties, allowing full control over typography, spacing, colors, and visual
    state indicators to ensure visual consistency across different deployments.
-->
<div
    class="variable-panel"
    style="
            --title-size: {mergedStyle.titleSize};
            --title-color: {mergedStyle.titleColor};
            --title-weight: {mergedStyle.titleWeight};
            --title-item-gap: {mergedStyle.titleItemGap};
            --title-image-width: {mergedStyle.titleImageWidth};
            --title-image-height: {mergedStyle.titleImageHeight};
            --state-dim-color: {mergedStyle.stateDimColor};
            --state-alarm-color: {mergedStyle.stateAlarmColor};
            --state-warning-color: {mergedStyle.stateWarningColor};
            --state-connected-color: {mergedStyle.stateConnectedColor};
            --state-disconnected-color: {mergedStyle.stateDisconnectedColor};
            --header-row-height: {mergedStyle.headerRowHeigth};
            --header-state-div-width: {mergedStyle.headerStateDivWidth};
            --header-row-gap: {mergedStyle.headerRowGap};
            --header-col-gap: {mergedStyle.headerColGap};
            --header-label-width: {mergedStyle.headerLabelWidth};
            --header-label-size: {mergedStyle.headerLabelSize};
            --header-label-color: {mergedStyle.headerLabelColor};
            --header-label-weight: {mergedStyle.headerLabelWeight};
            --header-value-size: {mergedStyle.headerValueSize};
            --header-value-color: {mergedStyle.headerValueColor};
            --header-value-weight: {mergedStyle.headerValueWeight};
            --header-sub-value-size: {mergedStyle.headerSubValueSize};
            --header-sub-value-color: {mergedStyle.headerSubValueColor};
            --header-sub-value-weight: {mergedStyle.headerSubValueWeight};
            --content-state-div-width: {mergedStyle.contentStateDivWidth};
            --content-title-size: {mergedStyle.contentTitleSize};
            --content-title-color: {mergedStyle.contentTitleColor};
            --content-title-weight: {mergedStyle.contentTitleWeight};
            --content-title-padding-left: {mergedStyle.contentTitlePaddingLeft};
            --content-title-padding-bottom: {mergedStyle.contentTitlePaddingBottom};
            --content-title-border-bottom: {mergedStyle.contentTitleBorderBottom};
            --content-title-spacing: {mergedStyle.contentTitleSpacing};
            --content-title-transform: {mergedStyle.contentTitleTransform};
            --content-inner-padding-top: {mergedStyle.contentInnerPaddingTop};
            --content-inner-padding-bottom: {mergedStyle.contentInnerPaddingBottom};
            --content-inner-padding-horizontal: {mergedStyle.contentInnerPaddingHorizontal};
            --content-row-height: {mergedStyle.contentRowHeight};
            --content-row-gap: {mergedStyle.contentRowGap};
            --content-col-gap: {mergedStyle.contentColGap};
            --content-label-width: {mergedStyle.contentLabelWidth};
            --content-label-size: {mergedStyle.contentLabelSize};
            --content-label-color: {mergedStyle.contentLabelColor};
            --content-label-weight: {mergedStyle.contentLabelWeight};
            --content-value-size: {mergedStyle.contentValueSize};
            --content-value-color: {mergedStyle.contentValueColor};
            --content-value-weight: {mergedStyle.contentValueWeight};
            --image-background-color: {mergedStyle.imageBackgroundColor};
            --image-container-width: {mergedStyle.imageContainerWidth};
            --image-container-height: {mergedStyle.imageContainerHeight};
            --image-container-border-radius: {mergedStyle.imageContainerBorderRadius};
            --image-width: {mergedStyle.imageWidth};
            --image-height: {mergedStyle.imageHeight};
        "
>
    <RightPanelSheet useMask={false} bind:showPanel>
        <header slot="title" class="title-div">
            <img src="/img/device-details.svg" alt="Device State" />
            <h3>{$texts.deviceDetails}</h3>
        </header>

        <section slot="header" class="header-div" aria-labelledby="hdr-title">
            {#if deviceStatus && deviceImage}
                <div class="device-identification-div">
                    <span class="device-name-text">{deviceStatus.name}</span>
                    <span class="device-id-text">ID: {String(deviceStatus.id).padStart(3, "0")}</span>
                    <div class="device-image-div" class:image-loaded={true}>
                        <img src={deviceImage} alt={deviceImage} />
                    </div>
                </div>
                <div class="row">
                    <span class="label">{$texts.state}</span>
                    <span class="value with-adornment align-right">
                        <span class="value">{$texts[state]}</span>
                        <div class="dot-state-div">
                            <div class="dot-state" data-state={state}></div>
                        </div>
                    </span>
                </div>
            {/if}
        </section>
        <main slot="content" class="content-div">
            <div class="section-title"><h3>{$texts.configuration}</h3></div>
            <div class="inner-content-div">
                <div class="row">
                    <span class="label">{$texts.protocol}</span>
                    <InlineLoader loaded={!deviceExtendedInfoLoading}>
                        {#if deviceExtendedInfo}
                            <span class="value align-right">{deviceExtendedInfo.protocol}</span>
                        {/if}
                    </InlineLoader>
                </div>
                <div class="row">
                    <span class="label">{$texts.type}</span>
                    <InlineLoader loaded={!deviceExtendedInfoLoading}>
                        {#if deviceExtendedInfo}
                            <span class="value align-right">{$meterTypeTexts[deviceExtendedInfo.type]}</span>
                        {/if}
                    </InlineLoader>
                </div>
                <div class="row">
                    <span class="label">{$texts.created}</span>
                    <InlineLoader loaded={!deviceExtendedInfoLoading}>
                        {#if deviceExtendedInfo}
                            <span class="value align-right">
                                <ElapsedDateTime dateFetched={deviceExtendedInfoFetched} isoDateString={deviceExtendedInfo.created_at} />
                            </span>
                        {/if}
                    </InlineLoader>
                </div>
                <div class="row">
                    <span class="label">{$texts.updated}</span>
                    <InlineLoader loaded={!deviceExtendedInfoLoading}>
                        {#if deviceExtendedInfo}
                            <span class="value align-right">
                                <ElapsedDateTime dateFetched={deviceExtendedInfoFetched} isoDateString={deviceExtendedInfo.updated_at} />
                            </span>
                        {/if}
                    </InlineLoader>
                </div>
            </div>
            <div class="section-title"><h3>{$texts.connectivity}</h3></div>
            <div class="inner-content-div">
                <div class="row">
                    <span class="label">{$texts.lastSeen}</span>
                    <InlineLoader loaded={!deviceExtendedInfoLoading}>
                        {#if deviceExtendedInfo}
                            <span class="value align-right">
                                {#if !deviceExtendedInfo.connected}
                                    <ElapsedDateTime dateFetched={deviceExtendedInfoFetched} isoDateString={deviceExtendedInfo.last_seen} />
                                {:else}
                                    {$texts.now}
                                {/if}
                            </span>
                        {/if}
                    </InlineLoader>
                </div>
                <div class="row">
                    <span class="label">{$texts.okNodes}</span>
                    <InlineLoader loaded={!deviceExtendedInfoLoading}>
                        {#if deviceExtendedInfo}
                            <span class="value align-right">
                                <span class="state-text" data-state={nodesNumberState}>{deviceExtendedInfo.ok_nodes}</span><span>/</span><span
                                    >{deviceExtendedInfo.enabled_nodes}</span
                                >
                            </span>
                        {/if}
                    </InlineLoader>
                </div>
                <InlineLoader loaded={!deviceExtendedInfoLoading}>
                    {#if !deviceExtendedInfoLoading || deviceExtendedInfo?.read_period != undefined}
                        <div class="row">
                            <span class="label">{$texts.readPeriod}</span>
                            <span class="value align-right">{deviceExtendedInfo?.read_period} s</span>
                        </div>
                    {/if}
                </InlineLoader>
            </div>
        </main>
    </RightPanelSheet>
</div>

<style>
    /* State indicator - Circular dot showing node operational status */
    .dot-state {
        inline-size: 16px;
        block-size: 16px;
        border-radius: 50%;
        background: var(--state-dim-color);
    }

    /* Dimmed state - Default/unknown device status */
    .dot-state[data-state="dim"] {
        background: var(--state-dim-color);
    }

    /* Connected state - Connected operational status (green) */
    .dot-state[data-state="connectedState"] {
        background: var(--state-connected-color);
    }

    /* Alarm state - Critical error condition (red) */
    .dot-state[data-state="alarmState"] {
        background: var(--state-alarm-color);
    }

    /* Warning state - Non-critical issues (yellow/amber) */
    .dot-state[data-state="warningState"] {
        background: var(--state-warning-color);
    }

    /* Disconnected state - Communication lost (gray) */
    .dot-state[data-state="disconnectedState"] {
        background: var(--state-disconnected-color);
    }

    /* State indicator container - Right-aligned wrapper for status dots */
    .dot-state-div {
        display: flex;
        justify-content: end;
        align-items: center;
    }

    /* State text - Default/unknown node status */
    span.state-text[data-state="dim"] {
        color: var(--state-dim-color);
    }

    /* State text - Connected operational status (green) */
    span.state-text[data-state="connectedState"] {
        color: var(--state-connected-color);
    }

    /* State text - Critical error condition (red) */
    span.state-text[data-state="alarmState"] {
        color: var(--state-alarm-color);
    }

    /* State text - Non-critical issues (yellow/amber) */
    span.state-text[data-state="warningState"] {
        color: var(--state-warning-color);
    }

    /* State text - Communication lost (gray) */
    span.state-text[data-state="disconnectedState"] {
        color: var(--state-disconnected-color);
    }

    /* Panel title section - Header area with node icon, name, and metadata */
    .title-div {
        display: flex;
        flex-direction: row;
        justify-content: start;
        gap: var(--title-item-gap);
        align-items: center;
        inline-size: 100%;
        block-size: 100%;
        margin: 0;
        padding: 0;
    }

    /* Panel title icon - Node status/type indicator image with configurable dimensions */
    .title-div img {
        inline-size: var(--title-image-width);
        block-size: var(--title-image-height);
    }

    /* Node title text - Primary heading with node name and flexible width */
    .title-div h3 {
        flex: 1;
        min-inline-size: 0;
        margin: 0;
        padding: 0;
        font-size: var(--title-size);
        color: var(--title-color);
        font-weight: var(--title-weight);
        line-height: var(--title-image-height);
    }

    /* Data row - Horizontal layout for label-value pairs with state indicators */
    .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        inline-size: 100%;
        margin: 0;
        padding: 0;
    }

    /* Row label - Left-aligned descriptive text with fixed width */
    .label {
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        line-height: 1;
        block-size: 100%;
    }

    /* Row value - Right-aligned data display with flexible width and adornment support */
    .value {
        flex: 1;
        text-align: right;
        display: inline-flex;
        justify-content: end;
        align-items: center;
        white-space: nowrap;
        line-height: 1;
        block-size: 100%;
        gap: var(--value-adornment-gap, 0.5rem);
    }

    /* Right-aligned value modifier - Forces value text to float right */
    .value.align-right {
        float: right;
    }

    /* Value with adornment modifier - Flex layout for values with trailing elements like indicators */
    .value.with-adornment {
        display: inline-flex;
        justify-content: end;
        align-items: center;
    }

    /* Header information section - Node metadata display area with structured rows */
    .header-div {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--header-row-gap);
        inline-size: 100%;
        margin: 0;
        padding: 0;
    }

    /* Header data row - Metadata display row with fixed height and column spacing */
    .header-div .row {
        gap: var(--header-col-gap);
        block-size: var(--header-row-height);
    }

    /* Header label text - Left-aligned descriptive text with fixed width and header typography */
    .header-div .label {
        inline-size: var(--header-label-width);
        min-inline-size: var(--header-label-width);
        font-size: var(--header-label-size);
        color: var(--header-label-color);
        font-weight: var(--header-label-weight);
    }

    /* Header value text - Right-aligned data display with header typography styling */
    .header-div .value {
        font-size: var(--header-value-size);
        color: var(--header-value-color);
        font-weight: var(--header-value-weight);
    }

    /* Header state indicator container - Fixed-width wrapper for status dots in header */
    .header-div .dot-state-div {
        inline-size: var(--header-state-div-width);
        block-size: var(--header-row-height);
    }

    /* Main content area - Container for graph and additional information sections */
    .content-div {
        inline-size: 100%;
        margin: 0;
        padding: 0;
    }

    /* Section title container - Header for content sections with bottom border */
    .content-div .section-title {
        margin: 0;
        padding: 0;
        border-bottom: var(--content-title-border-bottom);
    }

    /* Section title text - Uppercase heading with spacing and border treatment */
    .content-div .section-title h3 {
        margin: 0;
        padding: 0 var(--content-title-padding-left) var(--content-title-padding-bottom) var(--content-title-padding-left);
        font-size: var(--content-title-size);
        color: var(--content-title-color);
        font-weight: var(--content-title-weight);
        text-transform: var(--content-title-transform);
        letter-spacing: var(--content-title-spacing);
    }

    /* Section content container - Padded vertical layout for section data rows */
    .inner-content-div {
        box-sizing: border-box;
        position: relative;
        inline-size: 100%;
        margin: 0;
        padding: var(--content-inner-padding-top) var(--content-inner-padding-horizontal) var(--content-inner-padding-bottom);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--content-row-gap);
    }

    /* Content data row - Information display row with fixed height and column spacing */
    .content-div .inner-content-div .row {
        gap: var(--content-col-gap);
        block-size: var(--content-row-height);
    }

    /* Content label text - Left-aligned descriptive text with fixed width and content typography */
    .content-div .inner-content-div .label {
        inline-size: var(--content-label-width);
        min-inline-size: var(--content-label-width);
        font-size: var(--content-label-size);
        color: var(--content-label-color);
        font-weight: var(--content-label-weight);
    }

    /* Content value text - Right-aligned data display with content typography styling */
    .content-div .inner-content-div .value {
        font-size: var(--content-value-size);
        color: var(--content-value-color);
        font-weight: var(--content-value-weight);
    }

    /* Device identification div with device name, id and image */
    .device-identification-div {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        width: 100%;
        height: fit-content;
        padding-bottom: 10px;
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

    /* Image loaded state: fully visible */
    .device-image-div.image-loaded {
        opacity: 1;
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

    /* Device name text */
    .device-name-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;
        width: 100%;
        font-size: var(--header-value-size);
        color: var(--header-value-color);
        font-weight: var(--header-value-weight);
    }

    /* Devie id text */
    .device-id-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;
        width: 100%;
        font-size: var(--header-sub-value-size);
        color: var(--header-sub-value-color);
        font-weight: var(--header-sub-value-weight);
    }
</style>
