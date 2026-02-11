<script lang="ts">
    import { GraphType } from "$lib/logic/view/graph/base";
    import type { BaseMetrics, ProcessedBaseLogPoint } from "$lib/types/nodes/logs";
    import { FormattedTimeStep } from "$lib/types/date";
    import { LogSpanPeriod } from "$lib/types/view/nodes";
    import FullScreenPanel from "../../../Dashboard/FullScreenPanel.svelte";
    import BaseGraph from "./BaseGraph.svelte";
    import type { NodeCategory } from "$lib/types/nodes/base";

    // Styles
    import { FullScreenBaseGraphStyle, FullScreenGraphMetricStyle } from "$lib/style/graph";

    // Props
    export let data: Array<ProcessedBaseLogPoint> | undefined;
    export let timeStep: FormattedTimeStep | null | undefined;
    export let show: boolean;
    export let goBackEnabled: boolean = true;
    export let graphType: GraphType;
    export let initialDate: Date;
    export let endDate: Date;
    export let dataFetched: boolean;
    export let firstFetch: boolean;
    export let globalMetrics: BaseMetrics | undefined;
    export let previousGraphCategory: NodeCategory | undefined;
    export let unit: string = "";
    export let decimalPlaces: number | null = null;
    export let selectedTimeSpan: LogSpanPeriod;

    // Export Functions
    export let getNewTimeSpan: (startTime: Date, endTime: Date) => void;
    export let getNewDefaultTimeSpan: (timeSpan: LogSpanPeriod) => void;
    export let goBack: () => void;
</script>

<!--
    FullScreen Base Graph Component
    
    A full-screen wrapper for the BaseGraph component that provides an immersive data visualization
    experience. Combines the FullScreenPanel overlay with a BaseGraph instance configured for
    full-screen display, featuring enhanced styling, date picker controls, and modal interaction
    patterns. Inherits all base graph functionality including interactive drill-down navigation,
    real-time data updates, and comprehensive theming while providing a distraction-free
    viewing mode for detailed data analysis. Handles state synchronization between the modal
    overlay and the embedded base graph component. Designed for measurement and counter data
    visualization in full-screen mode.
-->
<FullScreenPanel bind:show>
    <BaseGraph
        style={$FullScreenBaseGraphStyle}
        metricsStyle={$FullScreenGraphMetricStyle}
        {data}
        {timeStep}
        fullScreen={true}
        showDatePicker={true}
        bind:showFullScreen={show}
        {graphType}
        bind:initialDate
        bind:endDate
        {dataFetched}
        {firstFetch}
        {globalMetrics}
        {unit}
        {decimalPlaces}
        bind:selectedTimeSpan
        bind:previousGraphCategory
        {goBackEnabled}
        {goBack}
        {getNewTimeSpan}
        {getNewDefaultTimeSpan}
    />
</FullScreenPanel>
