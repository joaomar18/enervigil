<script lang="ts">
    import { EnergyConsumptionGraphObject } from "$lib/logic/view/graph/energyConsumption";
    import { BaseGraphObject } from "$lib/logic/view/graph/base";
    import { FormattedTimeStep } from "$lib/types/date";
    import { LogSpanPeriod, SelectablePhaseFilter, EnergyDirectionFilter } from "$lib/types/view/nodes";
    import { checkLogsAreDifferent } from "$lib/logic/util/nodes";
    import { GraphType } from "$lib/logic/view/graph/base";
    import { getGraphStyle } from "$lib/logic/view/graph/helpers";
    import BaseGraph from "./BaseGraph.svelte";
    import GraphToolTip from "./Tooltips/GraphToolTip.svelte";
    import EnergyConsToolTip from "./Tooltips/Data/EnergyConsToolTip.svelte";
    import EnergyConsMetrics from "./Metrics/Data/EnergyConsMetrics.svelte";
    import type { EnergyConsumptionMetrics, ProcessedEnergyConsumptionLogPoint, BaseLogPoint, EnergyConsumptionLogPoint } from "$lib/types/nodes/logs";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";
    import { selectedLang } from "$lib/stores/lang/definition";

    // Styles
    import { EnergyConsMetricStyle, DesktopEnergyConsMetricStyle } from "$lib/style/graph";
    import { EnergyConsBaseGraphStyle } from "$lib/style/graph";
    import FullScreenEnergyConsGraph from "./FullScreenEnergyConsGraph.svelte";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    export let metricsStyle: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $EnergyConsBaseGraphStyle;
    $: effectiveMetricStyle = metricsStyle ?? $EnergyConsMetricStyle;

    // Props
    export let useHeader: boolean = false;
    export let useRightPanelMetrics: boolean = true;
    export let data: Array<ProcessedEnergyConsumptionLogPoint> | undefined;
    export let timeStep: FormattedTimeStep | null | undefined;
    export let fullScreen: boolean = false;
    export let showFullScreen: boolean = false; // Used externally on Full Screen Graph
    export let showDateChecker: boolean = true;
    export let showDatePicker: boolean = false;
    export let goBackEnabled: boolean;
    export let selectedTimeSpan: LogSpanPeriod;
    export let initialDate: Date;
    export let endDate: Date;
    export let dataFetched: boolean;
    export let firstFetch: boolean;
    export let globalMetrics: EnergyConsumptionMetrics | undefined;
    export let activeEnergyUnit: string = "";
    export let reactiveEnergyUnit: string = "";
    export let activeEnergyDecimalPlaces: number | null = null;
    export let reactiveEnergyDecimalPlaces: number | null = null;
    export let powerFactorDecimalPlaces: number | null = null;
    export let selectedPhase: SelectablePhaseFilter | undefined = undefined;
    export let selectedDirection: EnergyDirectionFilter | undefined = undefined;
    export let usePhase: boolean = false;
    export let baseContainerWidth: number | null = null;

    // Merged style
    $: mergedStyle = effectiveStyle;

    // Variables
    let currentData: Array<ProcessedEnergyConsumptionLogPoint> | undefined;
    let graphContainer: HTMLDivElement;
    let gridElement: HTMLDivElement | null = null;
    let graph: EnergyConsumptionGraphObject | null = null;
    let graphCreated: boolean = false;
    let activeEnergyNoData: boolean = true;
    let reactiveEnergyNoData: boolean = true;
    let insideGraph: boolean = false;
    let logPoint: EnergyConsumptionLogPoint | null = null;
    let cursorPos: { x: number | undefined; y: number | undefined };

    // Reactive Statements
    $: if (graphContainer) {
        requestAnimationFrame(() => {
            createGraphObject();
        });
    }

    $: if (checkLogsAreDifferent(data, currentData)) currentData = data;

    $: if (graph && currentData && timeStep && $selectedLang) {
        updateGraphData();
    }

    // Functions
    function hoveredLogPointChange(currentLogPoint: EnergyConsumptionLogPoint | null): void {
        insideGraph = !!currentLogPoint;
        logPoint = currentLogPoint;
    }

    function mousePositionChange(xPos: number | undefined, yPos: number | undefined): void {
        cursorPos = { x: xPos, y: yPos };
    }

    function gridDoubleClick(startTime: Date, endTime: Date): void {
        getNewTimeSpan(startTime, endTime);
    }

    function createGraphObject(): void {
        if (graph) graph.destroy();
        requestAnimationFrame(() => {
            mergedStyle = effectiveStyle;
            graph = new EnergyConsumptionGraphObject(
                graphContainer,
                hoveredLogPointChange,
                mousePositionChange,
                gridDoubleClick,
                currentData ? (currentData as ProcessedEnergyConsumptionLogPoint[]) : undefined,
            );
            Object.assign(mergedStyle, getGraphStyle(GraphType.EnergyConsumption));
        });
    }

    function updateGraphData(): void {
        if (graph && currentData && timeStep) {
            graph.destroy();
            graph.updatePoints(currentData, true, { activeEnergyDecimalPlaces, reactiveEnergyDecimalPlaces, powerFactorDecimalPlaces });
            graph.createGraph(timeStep, selectedTimeSpan, mergedStyle);
            gridElement = graph.getGridElement();
            graphCreated = true;
            activeEnergyNoData = !graph.hasActiveEnergyData();
            reactiveEnergyNoData = !graph.hasReactiveEnergyData();
        }
    }

    // Export Functions
    export let changePhase: (selectedPhase: SelectablePhaseFilter) => void;
    export let changeEnergyDirection: (selectedDirection: EnergyDirectionFilter) => void;
    export let getNewTimeSpan: (startTime: Date, endTime: Date) => void;
    export let getNewDefaultTimeSpan: (timeSpan: LogSpanPeriod) => void;
    export let goBack: () => void;
</script>

<!--
    EnergyConsGraph - Energy consumption data visualization component
    
    Renders stacked bar charts for active/reactive energy consumption with integrated
    metrics display. Supports both desktop (right-panel) and mobile layouts, full-screen
    mode, drill-down interactions, and customizable styling via theme overrides.
-->
<BaseGraph
    style={effectiveStyle}
    metricsStyle={effectiveMetricStyle}
    data={undefined}
    {timeStep}
    bind:baseContainerWidth
    bind:showFullScreen
    {showDateChecker}
    {showDatePicker}
    graphType={GraphType.EnergyConsumption}
    bind:initialDate
    bind:endDate
    {dataFetched}
    {firstFetch}
    {globalMetrics}
    bind:selectedTimeSpan
    {goBackEnabled}
    {goBack}
    {getNewTimeSpan}
    {getNewDefaultTimeSpan}
    useExternalGraph={true}
    {useHeader}
    useGraphRightArea={true}
    externalGraph={graph as BaseGraphObject<BaseLogPoint>}
    externalGraphContainer={graphContainer}
>
    <div slot="full-screen">
        {#if !fullScreen && showFullScreen}
            <FullScreenEnergyConsGraph
                {data}
                {timeStep}
                bind:show={showFullScreen}
                {dataFetched}
                {firstFetch}
                {globalMetrics}
                bind:initialDate
                bind:endDate
                bind:selectedPhase
                bind:selectedDirection
                bind:selectedTimeSpan
                {usePhase}
                {activeEnergyUnit}
                {reactiveEnergyUnit}
                {activeEnergyDecimalPlaces}
                {reactiveEnergyDecimalPlaces}
                {powerFactorDecimalPlaces}
                {goBackEnabled}
                {goBack}
                {changePhase}
                {changeEnergyDirection}
                {getNewTimeSpan}
                {getNewDefaultTimeSpan}
            />
        {/if}
    </div>
    <div class="mobile-metrics-div" class:allways-show={!useRightPanelMetrics} slot="metrics">
        <EnergyConsMetrics
            style={effectiveMetricStyle}
            metrics={globalMetrics}
            roundMetrics={true}
            {activeEnergyUnit}
            {reactiveEnergyUnit}
            {activeEnergyDecimalPlaces}
            {reactiveEnergyDecimalPlaces}
            {powerFactorDecimalPlaces}
            {dataFetched}
            {firstFetch}
        />
    </div>
    <div slot="custom-date-picker">
        <slot name="custom-date-picker" />
    </div>
    <div slot="graph" class="graph-main">
        <div class="unit-div">
            <div class="unit-content">
                <div class="unit-wrapper">
                    {#if graphCreated && !activeEnergyNoData}
                        <span class="unit-label">{activeEnergyUnit} | {reactiveEnergyUnit}</span>
                    {/if}
                </div>
            </div>
        </div>
        <div class="graph-div" bind:this={graphContainer}>
            <div class="y-axis-inner-div">
                <div class="y-axis-inner-content">
                    {#if graphCreated && activeEnergyNoData}
                        <span class="no-data-label">{$texts.noDataAvailable}</span>
                    {/if}
                </div>
            </div>
            {#if gridElement}
                <GraphToolTip zIndex={103} {gridElement} {insideGraph} {cursorPos}>
                    <EnergyConsToolTip {logPoint} {activeEnergyUnit} {reactiveEnergyUnit} />
                </GraphToolTip>
            {/if}
        </div>
    </div>
    <div class="desktop-right-panel" class:hide={!useRightPanelMetrics} slot="graph-right-area">
        {#if useRightPanelMetrics}
            <div class="desktop-right-panel-content">
                <EnergyConsMetrics
                    style={$DesktopEnergyConsMetricStyle}
                    metrics={globalMetrics}
                    roundMetrics={true}
                    {activeEnergyUnit}
                    {reactiveEnergyUnit}
                    {activeEnergyDecimalPlaces}
                    {reactiveEnergyDecimalPlaces}
                    {powerFactorDecimalPlaces}
                    {dataFetched}
                    {firstFetch}
                />
            </div>
        {/if}
    </div>
</BaseGraph>

<style>
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

    /* Graph main content - Horizontal flex container with styled scrollbar for graph overflow */
    .graph-main {
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

    /* Mobile metrics container - Metrics display shown below graph on smaller screens */
    .mobile-metrics-div {
        padding-top: var(--graph-padding-top);
        width: 100%;
        display: none;
    }

    /* Desktop right panel - Fixed-width sidebar for metrics on larger screens */
    .desktop-right-panel {
        box-sizing: border-box;
        width: 225px;
        height: 100%;
        padding-top: 10px;
        padding-left: 10px;
    }

    /* Hidden state for desktop right panel */
    .desktop-right-panel.hide {
        display: none;
    }

    /* Desktop right panel content wrapper - Container for metrics components */
    .desktop-right-panel-content {
        width: 100%;
        height: 100%;
        position: relative;
        margin: 0;
        padding: 0;
    }

    /* Responsive breakpoint - Switch to mobile layout below 946px width */
    @media (max-width: 946px) {
        .desktop-right-panel {
            display: none;
        }
        .mobile-metrics-div {
            display: flex;
        }
    }

    /* Force-show mobile metrics - Override responsive behavior when needed */
    .mobile-metrics-div.allways-show {
        display: flex;
    }
</style>
