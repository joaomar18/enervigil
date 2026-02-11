<script lang="ts">
    import { getDeviceID } from "$lib/logic/view/navigation";
    import { roundToDecimalPlaces } from "$lib/logic/util/generic";
    import RightPanelSheet from "../../General/RightPanelSheet.svelte";
    import InlineLoader from "../../General/InlineLoader.svelte";
    import BaseGraph from "./Graphs/BaseGraph.svelte";
    import ElapsedDateTime from "../../General/TimeDate/ElapsedDateTime.svelte";
    import TimePeriodPicker from "../../General/Pickers/TimePeriodPicker.svelte";
    import { LogSpanPeriod } from "$lib/types/view/nodes";
    import { getNodePhaseSection } from "$lib/logic/util/nodes";
    import { getNodeExtendedInfoAPI, getNodeLogsAPI } from "$lib/logic/api/nodes";
    import { getTimeSpanFromLogPeriod } from "$lib/logic/util/date";
    import { SlidingWindow } from "$lib/logic/util/classes/SlidingWindow";
    import type { NodeTimeSpan } from "$lib/types/view/nodes";
    import type { BaseNodeExtendedInfo, ProcessedNodeState } from "$lib/types/nodes/realtime";
    import type { ProcessedNodeLogs } from "$lib/types/nodes/logs";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";
    import { variableNameTextsByPhase } from "$lib/stores/lang/energyMeterTexts";
    import { protocolTexts } from "$lib/stores/lang/energyMeterTexts";
    import { pluginTexts } from "$lib/stores/lang/protocolPlugin";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { NodeDetailSheetStyle } from "$lib/style/nodes";
    import { NodesBaseDisplayDetailStyle } from "$lib/style/nodes";
    import type { NodeCategory } from "$lib/types/nodes/base";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $NodeDetailSheetStyle;

    // Props
    export let nodeState: ProcessedNodeState;
    export let showPanel: boolean;

    // Layout / styling props
    export let stateDimColor: string | undefined = undefined;
    export let stateAlarmColor: string | undefined = undefined;
    export let stateWarningColor: string | undefined = undefined;
    export let stateOKColor: string | undefined = undefined;
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

    $: localOverrides = {
        stateDimColor,
        stateAlarmColor,
        stateWarningColor,
        stateOKColor,
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
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let state: "alarmState" | "warningState" | "okState" | "disconnectedState";
    let nodeExtendedInfo: BaseNodeExtendedInfo;
    let nodeExtendedInfoFetched: boolean = false;
    let nodeExtendedInfoFirstFetch: boolean = false;
    let nodeExtendedInfoLoading: boolean = false;
    let nodeExtendedInfoTimeout: ReturnType<typeof setTimeout> | null = null;
    let nodeLogs: ProcessedNodeLogs | null = null;
    let nodeLogsFetched: boolean = false;
    let nodeLogsFirstFetch: boolean = false;
    let selectedHistoryTimeSpan: LogSpanPeriod = LogSpanPeriod.currentDay;
    let initialDate: Date;
    let endDate: Date;
    let currentTimeSpans: SlidingWindow<NodeTimeSpan> = new SlidingWindow(10);
    let enableGoBack: boolean = false;
    let previousGraphCategory: NodeCategory | undefined = undefined;

    // Reactive Statements
    $: if (!showPanel) {
        selectedHistoryTimeSpan = LogSpanPeriod.currentDay; // Default Period
        currentTimeSpans.clear();
        enableGoBack = currentTimeSpans.hasPrevious();
        nodeExtendedInfoFirstFetch = false;
        nodeLogsFirstFetch = false;
    }

    // Initial Node State processing
    $: if (nodeState && showPanel) {
        loadNodeAdditionalInfo();
        if (nodeState.graphType) {
            updateNodeLogs();
        }
    }

    $: if (nodeState) {
        if (nodeState.value === null) {
            state = "disconnectedState";
        } else if (nodeState.min_alarm_state || nodeState.max_alarm_state) {
            state = "alarmState";
        } else if (nodeState.min_warning_state || nodeState.max_warning_state) {
            state = "warningState";
        } else {
            state = "okState";
        }
    }

    $: if (!nodeExtendedInfoFetched && !nodeExtendedInfoLoading) {
        if (nodeExtendedInfoFirstFetch) {
            nodeExtendedInfoTimeout = setTimeout(() => {
                nodeExtendedInfoLoading = !nodeExtendedInfoFetched;
            }, 500);
        } else {
            nodeExtendedInfoLoading = true;
        }
    }
    $: if (nodeExtendedInfoFetched) {
        if (nodeExtendedInfoTimeout) {
            clearInterval(nodeExtendedInfoTimeout);
            nodeExtendedInfoTimeout = null;
        }
        nodeExtendedInfoLoading = false;
    }

    // Functions
    async function loadNodeAdditionalInfo() {
        let deviceId = getDeviceID();
        if (!deviceId || !nodeState) {
            return;
        }
        nodeExtendedInfoFetched = false;
        let result = await getNodeExtendedInfoAPI(deviceId, nodeState.name, nodeState.phase).call({ timeout: 5000 });
        if (result !== null) {
            nodeExtendedInfo = result.nodeAdditionalInfo;
            nodeExtendedInfoFetched = true;
            nodeExtendedInfoFirstFetch = true;
        }
    }

    function updateNodeLogs(): void {
        if (!nodeLogsFirstFetch) {
            let { initial_date, end_date } = loadDateSpan(selectedHistoryTimeSpan);
            setDateSpan({ initial_date, end_date });
        }
        loadNodeLogs();
        addToCurrentTimeSpans({ initial_date: initialDate, end_date: endDate, log_span_period: selectedHistoryTimeSpan } as NodeTimeSpan);
    }

    function loadDateSpan(timeSpan: LogSpanPeriod): { initial_date: Date; end_date: Date } {
        return getTimeSpanFromLogPeriod(timeSpan);
    }

    function setDateSpan(dateSpan: { initial_date: Date; end_date: Date }): void {
        initialDate = dateSpan.initial_date;
        endDate = dateSpan.end_date;
    }

    function addToCurrentTimeSpans(nodeTimeSpan: NodeTimeSpan): void {
        currentTimeSpans.add(nodeTimeSpan);
        enableGoBack = currentTimeSpans.hasPrevious();
    }

    function setDateSpanToPrevious(): void {
        let previousNodeTimeSpan = currentTimeSpans.previous();
        if (!previousNodeTimeSpan) return;
        setDateSpan({ initial_date: previousNodeTimeSpan.initial_date, end_date: previousNodeTimeSpan.end_date });
        loadNodeLogs();
        currentTimeSpans.confirmPrevious();
        enableGoBack = currentTimeSpans.hasPrevious();
        selectedHistoryTimeSpan = previousNodeTimeSpan.log_span_period;
    }

    function loadNodeLogsWithSpanPeriod(timeSpan: LogSpanPeriod): void {
        let { initial_date, end_date } = getTimeSpanFromLogPeriod(timeSpan);
        setDateSpan({ initial_date, end_date });
        loadNodeLogs();
        addToCurrentTimeSpans({ initial_date, end_date, log_span_period: timeSpan } as NodeTimeSpan);
        selectedHistoryTimeSpan = timeSpan;
    }

    function loadNodeLogsWithCustomPeriod(initial_date: Date, end_date: Date): void {
        setDateSpan({ initial_date, end_date });
        loadNodeLogs();
        addToCurrentTimeSpans({ initial_date, end_date, log_span_period: LogSpanPeriod.customDate } as NodeTimeSpan);
        selectedHistoryTimeSpan = LogSpanPeriod.customDate;
    }

    async function loadNodeLogs() {
        let deviceId = getDeviceID();
        if (!deviceId || !nodeState) {
            return;
        }
        nodeLogsFetched = false;
        let result = await getNodeLogsAPI(deviceId, nodeState.name, nodeState.phase, initialDate !== null, initialDate, endDate).call({ timeout: 5000 });
        if (result !== null) {
            nodeLogs = result.nodeLogs;
            nodeLogsFetched = true;
            nodeLogsFirstFetch = true;
        }
    }
</script>

<!--
    NodeDetailSheet Component
    
    A comprehensive right-panel component for displaying detailed node information including
    real-time state, historical data, and interactive graph visualization. Features dynamic
    content loading with sliding window navigation, multi-state visual indicators (alarm,
    warning, ok, disconnected), and integrated graph controls with period selection.
    Manages node additional info and logs fetching with loading states, provides drill-down
    navigation through time periods with back/forward functionality, and displays structured
    node metadata including phase sections, communication IDs, and protocol information.
    Supports extensive theming with configurable colors, typography, and spacing for all
    UI elements including titles, headers, content sections, and state indicators.
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
            --state-ok-color: {mergedStyle.stateOKColor};
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
        "
>
    <RightPanelSheet useMask={false} bind:showPanel>
        <header slot="title" class="title-div">
            <img src="/img/variable-details.svg" alt="Variable State" />
            <h3>{$texts.variableDetails}</h3>
        </header>

        <section slot="header" class="header-div" aria-labelledby="hdr-title">
            {#if nodeState}
                <div class="row">
                    <span class="label">{$texts.name}</span>
                    <span class="value">
                        {$variableNameTextsByPhase[nodeState.phase][nodeState.name] || nodeState.name}
                    </span>
                </div>
                <div class="row">
                    <span class="label">{$texts.section}</span>
                    <span class="value">{$texts[getNodePhaseSection(nodeState.phase).labelKey] || $texts.variables}</span>
                </div>
                <div class="row">
                    <span class="label">{$texts.state}</span>
                    <span class="value with-adornment">
                        <span class="value">{$texts[state]}</span>
                        <div class="dot-state-div">
                            <div class="dot-state" data-state={state}></div>
                        </div>
                    </span>
                </div>
            {/if}
        </section>

        <main slot="content" class="content-div">
            {#if nodeState}
                <div class="section-title"><h3>{$texts.currentState}</h3></div>
                <div class="inner-content-div">
                    <div class="row fit-height">
                        <span class="label fit-content">{$texts.value}</span>
                        <span class="value">
                            <svelte:component
                                this={nodeState.displayComponent}
                                baseDisplayStyle={$NodesBaseDisplayDetailStyle}
                                disableLabel
                                disableClick
                                labelText=""
                                nodeName={nodeState.name}
                                nodePhase={nodeState.phase}
                                minRangeValue={nodeState.min_value_range}
                                maxRangeValue={nodeState.max_value_range}
                                minAlarmState={nodeState.min_alarm_state}
                                maxAlarmState={nodeState.max_alarm_state}
                                minWarningState={nodeState.min_warning_state}
                                maxWarningState={nodeState.max_warning_state}
                                value={nodeState.value}
                                unitText={nodeState.unit}
                                decimalPlaces={nodeState.decimal_places}
                            />
                        </span>
                    </div>
                    <div class="row">
                        <span class="label">{$texts.updated}</span>
                        <InlineLoader loaded={!nodeExtendedInfoLoading}>
                            {#if nodeExtendedInfo}
                                <span class="value align-right"><ElapsedDateTime dateFetched={nodeExtendedInfoFetched} isoDateString={nodeExtendedInfo.last_update_date} /></span>
                            {/if}
                        </InlineLoader>
                    </div>
                    <div class="row">
                        <dt class="label">{$texts.restarted}</dt>
                        <InlineLoader loaded={!nodeExtendedInfoLoading}>
                            {#if nodeExtendedInfo}
                                <span class="value align-right"><ElapsedDateTime dateFetched={nodeExtendedInfoFetched} isoDateString={nodeExtendedInfo.last_reset_date} /></span>
                            {/if}
                        </InlineLoader>
                    </div>
                </div>

                {#if nodeState.min_alarm_state !== undefined || nodeState.max_alarm_state !== undefined}
                    <div class="section-title"><h3>{$texts.alarms}</h3></div>
                    <div class="inner-content-div">
                        {#if nodeState.min_alarm_state !== undefined}
                            <div class="row">
                                <span class="label">{$texts.lowerLimit}</span>
                                <InlineLoader loaded={!nodeExtendedInfoLoading && nodeExtendedInfo?.min_alarm_value !== undefined}>
                                    <span class="value with-adornment align-right">
                                        <span class="value"
                                            >{roundToDecimalPlaces(nodeExtendedInfo?.min_alarm_value, nodeState.decimal_places || 0)}
                                            {nodeState.unit}</span
                                        >
                                        <div class="dot-state-div">
                                            <div class="dot-state" data-state={nodeState.min_alarm_state ? "alarmState" : "dim"}></div>
                                        </div>
                                    </span>
                                </InlineLoader>
                            </div>
                        {/if}
                        {#if nodeState.max_alarm_state !== undefined}
                            <div class="row">
                                <span class="label">{$texts.upperLimit}</span>
                                <InlineLoader loaded={!nodeExtendedInfoLoading && nodeExtendedInfo?.max_alarm_value !== undefined}>
                                    <span class="value with-adornment align-right">
                                        <span class="value"
                                            >{roundToDecimalPlaces(nodeExtendedInfo?.max_alarm_value, nodeState.decimal_places || 0)}
                                            {nodeState.unit}</span
                                        >
                                        <div class="dot-state-div">
                                            <div class="dot-state" data-state={nodeState.max_alarm_state ? "alarmState" : "dim"}></div>
                                        </div>
                                    </span>
                                </InlineLoader>
                            </div>
                        {/if}
                    </div>
                {/if}

                {#if nodeState.min_warning_state !== undefined || nodeState.max_warning_state !== undefined}
                    <div class="section-title"><h3>{$texts.warnings}</h3></div>
                    <div class="inner-content-div">
                        {#if nodeState.min_warning_state !== undefined}
                            <div class="row">
                                <span class="label">{$texts.lowerLimit}</span>
                                <InlineLoader loaded={!nodeExtendedInfoLoading && nodeExtendedInfo?.min_warning_value !== undefined}>
                                    <span class="value with-adornment align-right">
                                        <span class="value"
                                            >{roundToDecimalPlaces(nodeExtendedInfo?.min_warning_value, nodeState.decimal_places || 0)}
                                            {nodeState.unit}</span
                                        >
                                        <div class="dot-state-div">
                                            <div class="dot-state" data-state={nodeState.min_warning_state ? "warningState" : "dim"}></div>
                                        </div>
                                    </span>
                                </InlineLoader>
                            </div>
                        {/if}
                        {#if nodeState.max_warning_state !== undefined}
                            <div class="row">
                                <span class="label">{$texts.upperLimit}</span>
                                <InlineLoader loaded={!nodeExtendedInfoLoading && nodeExtendedInfo?.max_warning_value !== undefined}>
                                    <span class="value with-adornment align-right">
                                        <span class="value"
                                            >{roundToDecimalPlaces(nodeExtendedInfo?.max_warning_value, nodeState.decimal_places || 0)}
                                            {nodeState.unit}</span
                                        >
                                        <div class="dot-state-div">
                                            <div class="dot-state" data-state={nodeState.max_warning_state ? "warningState" : "dim"}></div>
                                        </div>
                                    </span>
                                </InlineLoader>
                            </div>
                        {/if}
                    </div>
                {/if}

                {#if nodeState && nodeState.graphType}
                    <div class="section-title"><h3>{$texts.history}</h3></div>
                    <div class="inner-content-div no-horizontal-padding">
                        <div class="period-div">
                            <TimePeriodPicker
                                useToolTip={false}
                                bind:selectedTimeSpan={selectedHistoryTimeSpan}
                                bind:initialDate
                                bind:endDate
                                changeSpanPeriodCustom={(initial_date: Date, end_date: Date) => loadNodeLogsWithCustomPeriod(initial_date, end_date)}
                                changeSpanPeriod={(timeSpan: LogSpanPeriod) => loadNodeLogsWithSpanPeriod(timeSpan)}
                            />
                        </div>
                        <div class="chart-container">
                            <BaseGraph
                                data={nodeLogs?.points}
                                timeStep={nodeLogs?.time_step}
                                graphType={nodeState.graphType}
                                dataFetched={nodeLogsFetched}
                                firstFetch={nodeLogsFirstFetch}
                                globalMetrics={nodeLogs?.global_metrics}
                                unit={nodeLogs?.unit ?? ""}
                                decimalPlaces={nodeLogs?.decimal_places}
                                {initialDate}
                                {endDate}
                                bind:selectedTimeSpan={selectedHistoryTimeSpan}
                                bind:previousGraphCategory
                                getNewTimeSpan={(initial_date: Date, end_date: Date) => loadNodeLogsWithCustomPeriod(initial_date, end_date)}
                                getNewDefaultTimeSpan={(timeSpan: LogSpanPeriod) => loadNodeLogsWithSpanPeriod(timeSpan)}
                                goBackEnabled={enableGoBack}
                                goBack={() => setDateSpanToPrevious()}
                            />
                        </div>
                    </div>
                {/if}

                <div class="section-title"><h3>{$texts.technicalData}</h3></div>
                <div class="inner-content-div">
                    <div class="row">
                        <span class="label">{$texts.type}</span>
                        <InlineLoader loaded={!nodeExtendedInfoLoading && nodeExtendedInfo?.type !== undefined}>
                            <span class="value align-right">{nodeExtendedInfo?.protocol_type}</span>
                        </InlineLoader>
                    </div>
                    <div class="row">
                        <span class="label">{$texts.protocol}</span>
                        <InlineLoader loaded={!nodeExtendedInfoLoading && nodeExtendedInfo?.protocol !== undefined}>
                            <span class="value align-right">{$protocolTexts[nodeExtendedInfo?.protocol] || $pluginTexts.noProtocol}</span>
                        </InlineLoader>
                    </div>
                    <div class="row">
                        <span class="label">{$texts.logging}</span>
                        <InlineLoader loaded={!nodeExtendedInfoLoading}>
                            {#if nodeExtendedInfo?.logging_period !== undefined}
                                <span class="value align-right">{nodeExtendedInfo?.logging_period} min.</span>
                            {:else}
                                <span class="value align-right">{$texts.disabled}</span>
                            {/if}
                        </InlineLoader>
                    </div>
                </div>
            {/if}
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

    /* Dimmed state - Default/unknown node status */
    .dot-state[data-state="dim"] {
        background: var(--state-dim-color);
    }

    /* OK state - Normal operational status (green) */
    .dot-state[data-state="okState"] {
        background: var(--state-ok-color);
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

    /* Auto-height row modifier - Allows row to expand beyond fixed height */
    .row.fit-height {
        block-size: auto;
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

    /* No horizontal padding modifier - Removes left/right padding for full-width content like graphs */
    .inner-content-div.no-horizontal-padding {
        padding-left: 0;
        padding-right: 0;
    }

    /* Content data row - Information display row with fixed height and column spacing */
    .content-div .inner-content-div .row {
        gap: var(--content-col-gap);
        block-size: var(--content-row-height);
    }

    /* Auto-height content row modifier - Allows content rows to expand beyond fixed height */
    .content-div .inner-content-div .row.fit-height {
        block-size: auto;
    }

    /* Content label text - Left-aligned descriptive text with fixed width and content typography */
    .content-div .inner-content-div .label {
        inline-size: var(--content-label-width);
        min-inline-size: var(--content-label-width);
        font-size: var(--content-label-size);
        color: var(--content-label-color);
        font-weight: var(--content-label-weight);
    }

    /* Flexible content label modifier - Removes fixed width constraint for dynamic content sizing */
    .content-div .inner-content-div .label.fit-content {
        min-inline-size: 0;
        width: fit-content;
        padding-right: 30px;
    }

    /* Content value text - Right-aligned data display with content typography styling */
    .content-div .inner-content-div .value {
        font-size: var(--content-value-size);
        color: var(--content-value-color);
        font-weight: var(--content-value-weight);
    }

    /* Content state indicator container - Fixed-width wrapper for status dots in content sections */
    .content-div .dot-state-div {
        inline-size: var(--content-state-div-width);
        block-size: var(--content-row-height);
    }

    /* Graph visualization container - Full-width wrapper for chart components with top spacing */
    .chart-container {
        padding-top: 5px;
        width: 100%;
        height: fit-content;
    }

    /* Period selection container - Horizontal layout for time range controls and navigation */
    .period-div {
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
    }
</style>
