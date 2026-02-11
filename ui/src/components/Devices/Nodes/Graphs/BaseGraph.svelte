<script lang="ts">
    import "uplot/dist/uPlot.min.css";
    import { onDestroy } from "svelte";
    import { BaseGraphObject, GraphType } from "$lib/logic/view/graph/base";
    import { getGraphMetricsComponent, getGraphToolTipDisplayComponent, getGraphStyle } from "$lib/logic/view/graph/helpers";
    import { FormattedTimeStep } from "$lib/types/date";
    import { LogSpanPeriod } from "$lib/types/view/nodes";
    import FullScreenBaseGraph from "./FullScreenBaseGraph.svelte";
    import Action from "../../../General/Action.svelte";
    import ToolTipText from "../../../General/ToolTipText.svelte";
    import DateRangeChecker from "../../../General/TimeDate/DateRangeChecker.svelte";
    import CircularLoader from "../../../General/CircularLoader.svelte";
    import GraphToolTip from "./Tooltips/GraphToolTip.svelte";
    import TimePeriodPicker from "../../../General/Pickers/TimePeriodPicker.svelte";
    import { MeasurementGraphObject } from "$lib/logic/view/graph/measurement";
    import { CounterGraphObject } from "$lib/logic/view/graph/counter";
    import type { BaseLogPoint, BaseMetrics, ProcessedBaseLogPoint, ProcessedCounterLogPoint, ProcessedMeasurementLogPoint } from "$lib/types/nodes/logs";

    // Texts
    import { selectedLang } from "$lib/stores/lang/definition";
    import { texts } from "$lib/stores/lang/generalTexts";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { BaseGraphStyle, GraphActionStyle, GraphMetricStyle } from "$lib/style/graph";
    import { checkLogsAreDifferent } from "$lib/logic/util/nodes";
    import type { NodeCategory } from "$lib/types/nodes/base";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    export let metricsStyle: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $BaseGraphStyle;
    $: effectiveMetricStyle = metricsStyle ?? $GraphMetricStyle;

    // Props
    export let data: Array<ProcessedBaseLogPoint> | undefined;
    export let timeStep: FormattedTimeStep | null | undefined;
    export let fullScreen: boolean = false;
    export let showFullScreen: boolean = false; // Used externally on Full Screen Graph
    export let showDateChecker: boolean = true;
    export let showDatePicker: boolean = false;
    export let goBackEnabled: boolean;
    export let graphType: GraphType;
    export let selectedTimeSpan: LogSpanPeriod;
    export let initialDate: Date;
    export let endDate: Date;
    export let dataFetched: boolean;
    export let firstFetch: boolean;
    export let globalMetrics: BaseMetrics | undefined;
    export let previousGraphCategory: NodeCategory | undefined = undefined;
    export let unit: string = "";
    export let decimalPlaces: number | null = null;
    export let useExternalGraph: boolean = false;
    export let useHeader: boolean = true;
    export let useGraphRightArea: boolean = false;
    export let externalGraph: BaseGraphObject<BaseLogPoint> | null = null;
    export let externalGraphContainer: HTMLDivElement | null = null;
    export let baseContainerWidth: number | null = null;
    export let graphLoaderTimeoutMs: number = 1000;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let minHeight: string | undefined = undefined;
    export let headerHeight: string | undefined = undefined;
    export let headerButtonsGap: string | undefined = undefined;
    export let xAxisHeight: string | undefined = undefined;
    export let yAxisWidth: string | undefined = undefined;
    export let unitDivWidth: string | undefined = undefined;
    export let unitMaxWidth: string | undefined = undefined;
    export let borderRadius: string | undefined = undefined;
    export let paddingHorizontal: string | undefined = undefined;
    export let paddingTop: string | undefined = undefined;
    export let paddingBottom: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let borderColor: string | undefined = undefined;
    export let boxShadow: string | undefined = undefined;
    export let graphHeight: string | undefined = undefined;
    export let graphPaddingTop: string | undefined = undefined;
    export let graphPaddingLeft: string | undefined = undefined;
    export let graphPaddingRight: string | undefined = undefined;
    export let graphPaddingBottom: string | undefined = undefined;
    export let graphTextColor: string | undefined = undefined;
    export let graphTextWeight: string | undefined = undefined;
    export let subTextColor: string | undefined = undefined;
    export let subTextWeight: string | undefined = undefined;
    export let scrollbarTrackColor: string | undefined = undefined;
    export let scrollbarThumbColor: string | undefined = undefined;
    export let loaderBackgroundBlur: string | undefined = undefined;

    $: localOverrides = {
        width,
        height,
        minHeight,
        headerHeight,
        headerButtonsGap,
        xAxisHeight,
        yAxisWidth,
        unitDivWidth,
        unitMaxWidth,
        borderRadius,
        paddingHorizontal,
        paddingTop,
        paddingBottom,
        backgroundColor,
        borderColor,
        boxShadow,
        graphHeight,
        graphPaddingTop,
        graphPaddingLeft,
        graphPaddingRight,
        graphPaddingBottom,
        graphTextColor,
        graphTextWeight,
        subTextColor,
        subTextWeight,
        scrollbarTrackColor,
        scrollbarThumbColor,
        loaderBackgroundBlur,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Constants
    const HIDE_FULL_WIDTH_TIME_SPAN_WIDTH = 880;

    // Variables
    let currentData: Array<ProcessedBaseLogPoint> | undefined;
    let baseContainer: HTMLDivElement;
    let baseContainerListener: boolean = false;
    let graphContainer: HTMLDivElement;
    let gridElement: HTMLDivElement | null = null;
    let graph: BaseGraphObject<BaseLogPoint> | null = null;
    let showDateRange: boolean = false;
    let loaderTimeout: ReturnType<typeof setTimeout> | null = null;
    let showLoader: boolean = false;
    let graphCreated: boolean = false;
    let graphNoData: boolean = true;
    let resizeObserver: ResizeObserver | null = null;
    let insideGraph: boolean = false;
    let logPoint: BaseLogPoint | null = null;
    let cursorPos: { x: number | undefined; y: number | undefined };

    // Reactive Statements
    $: if (!dataFetched && !showLoader) {
        if (firstFetch) {
            loaderTimeout = setTimeout(() => {
                showLoader = !dataFetched;
            }, graphLoaderTimeoutMs);
        } else {
            showLoader = true;
        }
    }
    $: if (dataFetched) {
        if (loaderTimeout) {
            clearTimeout(loaderTimeout);
            loaderTimeout = null;
        }
        showLoader = false;
    }

    $: if (baseContainer && !baseContainerListener) {
        window.addEventListener("resize", getBaseContainerWidth);
        baseContainerListener = true;
        requestAnimationFrame(() => {
            getBaseContainerWidth();
        });
    }

    $: if (!useExternalGraph && graphType && graphContainer) {
        createGraphObject();
    }

    $: if (checkLogsAreDifferent(data, currentData)) currentData = data;

    $: if (!useExternalGraph && graph && currentData && timeStep && $selectedLang) {
        updateGraphData();
    }

    $: if (
        ((!useExternalGraph && graphContainer) || (useExternalGraph && externalGraphContainer)) &&
        ((!useExternalGraph && graph) || (useExternalGraph && externalGraph))
    ) {
        if (!resizeObserver) {
            resizeObserver = new ResizeObserver(() => {
                handleResize();
            });
            if (!useExternalGraph) {
                resizeObserver.observe(graphContainer);
            } else if (externalGraphContainer) {
                resizeObserver.observe(externalGraphContainer);
            }
        }
    }

    // Export Functions
    export let getNewTimeSpan: (startTime: Date, endTime: Date) => void;
    export let getNewDefaultTimeSpan: (timeSpan: LogSpanPeriod) => void;
    export let goBack: () => void;

    // Functions
    function createGraphInstance(type: GraphType, container: HTMLDivElement, data: ProcessedBaseLogPoint[] | undefined): BaseGraphObject<any> {
        const graphMap = {
            [GraphType.Measurement]: () =>
                new MeasurementGraphObject(
                    container,
                    hoveredLogPointChange,
                    mousePositionChange,
                    gridDoubleClick,
                    data ? (data as ProcessedMeasurementLogPoint[]) : undefined,
                ),
            [GraphType.Counter]: () =>
                new CounterGraphObject(
                    container,
                    hoveredLogPointChange,
                    mousePositionChange,
                    gridDoubleClick,
                    data ? (data as ProcessedCounterLogPoint[]) : undefined,
                ),
            [GraphType.EnergyConsumption]: () => {
                throw new Error(`Energy Consumption Graph needs an external implementation.`);
            },
        };

        return graphMap[type]();
    }

    function createGraphObject(): void {
        if (graph) graph.destroy();
        requestAnimationFrame(() => {
            mergedStyle = mergeStyle(effectiveStyle, localOverrides);
            graph = createGraphInstance(graphType, graphContainer, currentData);
            Object.assign(mergedStyle, getGraphStyle(graphType));
        });
    }

    function updateGraphData(): void {
        if (graph && currentData && timeStep) {
            graph.destroy();
            graph.updatePoints(currentData, true, { decimalPlaces });
            graph.createGraph(timeStep, selectedTimeSpan, mergedStyle);
            gridElement = graph.getGridElement();
            graphCreated = true;
            graphNoData = !graph.hasData();
        }
    }

    function handleResize(): void {
        if (!useExternalGraph && graph) {
            graph.resize(mergedStyle);
        } else if (useExternalGraph && externalGraph) {
            externalGraph.resize(mergedStyle);
        }
    }

    function hoveredLogPointChange(currentLogPoint: BaseLogPoint | null): void {
        insideGraph = !!currentLogPoint;
        logPoint = currentLogPoint;
    }

    function mousePositionChange(xPos: number | undefined, yPos: number | undefined): void {
        cursorPos = { x: xPos, y: yPos };
    }

    function gridDoubleClick(startTime: Date, endTime: Date): void {
        getNewTimeSpan(startTime, endTime);
    }

    function getBaseContainerWidth(): void {
        baseContainerWidth = baseContainer.offsetWidth;
    }

    onDestroy(() => {
        if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
        }
        if (baseContainerListener) {
            window.removeEventListener("resize", getBaseContainerWidth);
        }
        if (graph) {
            graph.destroy();
        }
    });
</script>

<!--
    Base Graph Component
    
    A foundational interactive graph visualization component for time-series data display.
    Provides core functionality for measurement and counter data types with clean separation
    of concerns. Features interactive drill-down navigation via double-click, responsive design
    with container queries, configurable metrics display, full-screen mode, date range selection,
    and comprehensive theming support. Integrates with uPlot for high-performance rendering and
    provides tooltip overlays, loading states, and accessibility features. Designed to handle
    single-unit measurements and counter data while maintaining simplicity and performance.
    For specialized energy consumption visualizations, use EnergyConsumptionGraph component.
-->
<div
    style="
        --width: {mergedStyle.width};
        --height: {mergedStyle.height};
        --min-height: {mergedStyle.minHeight};
        --header-height: {mergedStyle.headerHeight};
        --header-buttons-gap: {mergedStyle.headerButtonsGap};
        --x-axis-height: {mergedStyle.xAxisHeight};
        --y-axis-width: {mergedStyle.yAxisWidth};
        --unit-div-width: {mergedStyle.unitDivWidth};
        --unit-max-width: {mergedStyle.unitMaxWidth};
        --border-radius: {mergedStyle.borderRadius};
        --padding-horizontal: {mergedStyle.paddingHorizontal};
        --padding-top: {mergedStyle.paddingTop};
        --padding-bottom: {mergedStyle.paddingBottom};
        --background-color: {mergedStyle.backgroundColor};
        --border-color: {mergedStyle.borderColor};
        --box-shadow: {mergedStyle.boxShadow};
        --graph-height: {mergedStyle.graphHeight};
        --graph-padding-top: {mergedStyle.graphPaddingTop};
        --graph-padding-left: {mergedStyle.graphPaddingLeft};
        --graph-padding-right: {mergedStyle.graphPaddingRight};
        --graph-padding-bottom: {mergedStyle.graphPaddingBottom};
        --scrollbar-track-color: {mergedStyle.scrollbarTrackColor};
        --scrollbar-thumb-color: {mergedStyle.scrollbarThumbColor};
        --graph-text-color: {mergedStyle.graphTextColor};
        --graph-text-weight: {mergedStyle.graphTextWeight};
        --sub-text-color: {mergedStyle.subTextColor};
        --sub-text-weight: {mergedStyle.subTextWeight};
        --loader-background-blur: {mergedStyle.loaderBackgroundBlur};
    "
    bind:this={baseContainer}
    class="graph-div-container"
>
    <div class="graph-div-wrapper" class:scroll-on={fullScreen}>
        <div class="graph-div-content">
            {#if !fullScreen && showFullScreen}
                {#if !useExternalGraph}
                    <FullScreenBaseGraph
                        {data}
                        {timeStep}
                        bind:show={showFullScreen}
                        {graphType}
                        {dataFetched}
                        {firstFetch}
                        {globalMetrics}
                        {unit}
                        {decimalPlaces}
                        bind:initialDate
                        bind:endDate
                        bind:selectedTimeSpan
                        bind:previousGraphCategory
                        {goBackEnabled}
                        {goBack}
                        {getNewTimeSpan}
                        {getNewDefaultTimeSpan}
                    />
                {:else}
                    <slot name="full-screen" />
                {/if}
            {/if}
            <div class="header">
                {#if useHeader}
                    <div class="header-content">
                        <div class="left-actions-div">
                            <Action
                                style={$GraphActionStyle}
                                imageURL="/img/previous.svg"
                                disabledImageURL="/img/previous-disabled.svg"
                                onClick={() => goBack()}
                                enableToolTip={true}
                                disabled={!goBackEnabled}
                            >
                                <div slot="tooltip"><ToolTipText text={$texts.goBack} /></div>
                            </Action>
                        </div>
                        <div class="right-header-div">
                            <div
                                class="full-screen-data-range"
                                class:show={baseContainerWidth !== null && baseContainerWidth >= HIDE_FULL_WIDTH_TIME_SPAN_WIDTH}
                            >
                                <DateRangeChecker fullWidth={true} {initialDate} {endDate} />
                            </div>
                            <div class="actions-div">
                                {#if showDateChecker}
                                    <div
                                        class="date-checker-div"
                                        class:hide={baseContainerWidth !== null && baseContainerWidth >= HIDE_FULL_WIDTH_TIME_SPAN_WIDTH}
                                    >
                                        <Action
                                            style={$GraphActionStyle}
                                            imageURL="/img/calendar-check.svg"
                                            onClick={() => {
                                                showDateRange = !showDateRange;
                                            }}
                                            enableToolTip={true}
                                        >
                                            <div slot="tooltip"><ToolTipText text={$texts.selectedPeriod} /></div>
                                        </Action>
                                        <DateRangeChecker bind:showToolTip={showDateRange} {initialDate} {endDate} />
                                    </div>
                                {/if}
                                {#if showDatePicker}
                                    <div class="date-picker-div">
                                        <TimePeriodPicker
                                            bind:selectedTimeSpan
                                            bind:initialDate
                                            bind:endDate
                                            changeSpanPeriodCustom={(initial_date: Date, end_date: Date) => getNewTimeSpan(initial_date, end_date)}
                                            changeSpanPeriod={(timeSpan: LogSpanPeriod) => getNewDefaultTimeSpan(timeSpan)}
                                        />
                                    </div>
                                {:else}
                                    <slot name="custom-date-picker" />
                                {/if}
                                <Action
                                    style={$GraphActionStyle}
                                    imageURL="/img/fullscreen.svg"
                                    onClick={() => {
                                        showFullScreen = !showFullScreen;
                                    }}
                                    enableToolTip={true}
                                >
                                    <div slot="tooltip"><ToolTipText text={$texts.fullscreen} /></div>
                                </Action>
                            </div>
                        </div>
                    </div>
                {/if}
                {#if !useExternalGraph}
                    <div class="metrics-section">
                        {#if globalMetrics}
                            <svelte:component
                                this={getGraphMetricsComponent(graphType)}
                                style={effectiveMetricStyle}
                                metrics={globalMetrics}
                                bind:previousCategory={previousGraphCategory}
                                {unit}
                                {decimalPlaces}
                                {dataFetched}
                                {firstFetch}
                                roundMetrics={true}
                            />
                        {/if}
                    </div>
                {:else}
                    <slot name="metrics" />
                {/if}
            </div>
            <div class="main">
                <div class="loader" class:close={!showLoader}>
                    <CircularLoader wrapperTopLeftRadius="0px" wrapperTopRightRadius="0px" wrapperBottomLeftRadius="0px" wrapperBottomRightRadius="0px" />
                </div>
                {#if !useExternalGraph}
                    <div class="graph-main">
                        <div class="unit-div">
                            <div class="unit-content">
                                <div class="unit-wrapper">
                                    {#if graphCreated && !graphNoData}
                                        <span class="unit-label">{unit}</span>
                                    {/if}
                                </div>
                            </div>
                        </div>
                        <div class="graph-div" bind:this={graphContainer}>
                            <div class="y-axis-inner-div">
                                <div class="y-axis-inner-content">
                                    {#if graphCreated && graphNoData}
                                        <span class="no-data-label">{$texts.noDataAvailable}</span>
                                    {/if}
                                </div>
                            </div>
                            {#if graphType && gridElement}
                                <GraphToolTip {gridElement} {insideGraph} {cursorPos}>
                                    <svelte:component this={getGraphToolTipDisplayComponent(graphType)} {unit} {logPoint} />
                                </GraphToolTip>
                            {/if}
                        </div>
                    </div>
                {:else}
                    <slot name="graph" />
                {/if}
                {#if useGraphRightArea}
                    <slot name="graph-right-area" />
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    /* Root container - Main graph component wrapper with theming and container query support */
    .graph-div-container {
        box-sizing: border-box;
        padding-top: var(--padding-top);
        padding-bottom: var(--padding-bottom);
        margin: 0;
        width: var(--width);
        height: var(--height);
        border-radius: var(--border-radius);
        background: var(--background-color);
        border: 1px solid var(--border-color);
        box-shadow: var(--box-shadow);
        container-type: inline-size;
    }

    /* Main graph container - Card-style wrapper with theming and vertical layout */
    .graph-div-wrapper {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        padding-left: var(--padding-horizontal);
        padding-right: var(--padding-horizontal);
        width: 100%;
        height: 100%;
        overflow-x: hidden;
        overflow-y: hidden;
    }

    /* Enable vertical scrolling for fullscreen graphs */
    .graph-div-wrapper.scroll-on {
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--scrollbar-track-color) var(--scrollbar-thumb-color);
        scrollbar-gutter: stable both-edges;
    }

    /* Content wrapper - Flex container organizing header, metrics, and graph sections */
    .graph-div-content {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        min-height: var(--min-height);
    }

    /* Graph header - Container for action buttons and controls */
    .header {
        margin: 0;
        padding: 0;
        padding-bottom: var(--padding-top);
        position: relative;
        width: 100%;
        height: var(--header-height);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    /* Header content wrapper - Flexible layout for header elements */
    .header-content {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
    }
    /* Right header section - Container for date range display and action buttons */
    .header-content .right-header-div {
        width: fit-content;
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    /* Full-screen date range - Date display shown only in wide layouts via container query */
    .right-header-div .full-screen-data-range {
        display: none;
        width: fit-content;
        height: 100%;
    }

    /* Show Full-screen date range */
    .right-header-div .full-screen-data-range.show {
        display: block;
    }

    /* Action buttons container - Right-aligned controls with configurable spacing */
    .right-header-div .actions-div {
        width: fit-content;
        height: 100%;
        display: flex;
        justify-content: end;
        align-items: center;
        gap: var(--header-buttons-gap);
    }

    /* Left action buttons container - Left-aligned controls (e.g., back/previous button) */
    .header-content .left-actions-div {
        width: fit-content;
        height: 100%;
        display: flex;
        justify-content: start;
        align-items: center;
        gap: var(--header-buttons-gap);
    }

    /* Date picker container - Houses the time date picker tooltip */
    .actions-div .date-picker-div {
        margin: 0;
        padding: 0;
        position: relative;
        width: fit-content;
        height: 100%;
    }

    /* Date checker container - Houses the date range display tooltip */
    .actions-div .date-checker-div {
        margin: 0;
        padding: 0;
        position: relative;
        width: fit-content;
        height: 100%;
    }

    /* Hide Date checker container tooltip */
    .actions-div .date-checker-div.hide {
        display: none;
    }

    /* Metrics section - Container for graph metric displays below header actions */
    .metrics-section {
        margin: 0;
        padding: 0;
        width: 100%;
        height: fit-content;
        padding-top: var(--padding-top);
    }

    /* Main content area - Horizontal scrollable container for unit label and graph */
    .main {
        margin: 0;
        padding: 0;
        position: relative;
        width: 100%;
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    /* Graph main content - Horizontal flex container with styled scrollbar for graph overflow */
    .main .graph-main {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        overflow-x: scroll;
        overflow-y: hidden;
        scrollbar-width: thin;
        scrollbar-color: var(--scrollbar-track-color) var(--scrollbar-thumb-color);
        scrollbar-gutter: stable;
    }

    /* Loader overlay - Blurred loading state indicating data unavailability */
    .loader {
        position: absolute;
        inset: 0;
        backdrop-filter: var(--loader-background-blur);
        -webkit-backdrop-filter: var(--loader-background-blur);
        transition: opacity 0.3s ease-in-out;
        z-index: 1;
    }

    /* Close Loader - Fades out and moves to background layer */
    .loader.close {
        opacity: 0;
        z-index: -1;
    }

    /* Unit label section - Left sidebar for measurement unit display */
    .unit-div {
        width: var(--unit-div-width);
        height: var(--graph-height);
    }

    /* Unit content container - Sized to match graph plotting area */
    .unit-content {
        width: 100%;
        height: calc(100% - var(--graph-padding-top) - var(--graph-padding-bottom) - var(--x-axis-height));
        padding-top: var(--graph-padding-top);
        padding-bottom: calc(var(--x-axis-height) + var(--graph-padding-bottom));
    }

    /* Unit wrapper - Relative container for absolutely positioned unit label */
    .unit-wrapper {
        padding: 0;
        margin: 0;
        position: relative;
        width: 100%;
        height: 100%;
    }

    /* Unit label text - Vertically rotated measurement unit (e.g., "kW", "A") */
    .unit-label {
        position: absolute;
        top: 50%;
        left: 50%;
        color: var(--sub-text-color);
        font-weight: var(--sub-text-weight);
        font-size: 13px;
        letter-spacing: 0.5px;
        text-align: center;
        pointer-events: none;
        user-select: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
        max-width: var(--unit-max-width);
        transform: translate(-50%, -50%) rotate(-90deg);
    }

    /* Graph container - Main plotting area where uPlot charts are rendered */
    .graph-div {
        padding: 0;
        margin: 0;
        position: relative;
        width: calc(100% - var(--unit-div-width));
        height: var(--graph-height);
    }

    /* Y-axis overlay area - Positioned over uPlot's y-axis for custom content */
    .y-axis-inner-div {
        position: absolute;
        left: 0;
        top: 0;
        width: var(--y-axis-width);
        height: calc(var(--graph-height) - var(--graph-padding-top) - var(--graph-padding-bottom) - var(--x-axis-height));
        padding-top: var(--graph-padding-top);
        padding-bottom: calc(var(--x-axis-height) + var(--graph-padding-bottom));
    }

    /* Y-axis content wrapper - Container for y-axis overlay elements */
    .y-axis-inner-content {
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        position: relative;
    }

    /* No-data indicator - Rotated text displayed when graph has no data */
    .no-data-label {
        position: absolute;
        top: 50%;
        left: 50%;
        color: var(--sub-text-color);
        font-weight: var(--sub-text-weight);
        font-size: 13px;
        letter-spacing: 0.5px;
        word-spacing: 0.15em;
        opacity: 0.7;
        text-align: center;
        pointer-events: none;
        user-select: none;
        white-space: nowrap;
        transform: translate(-50%, -50%) rotate(-90deg);
    }
</style>
