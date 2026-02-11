<script lang="ts">
    import type { EnergyConsumptionMetrics, ProcessedEnergyConsumptionLogPoint } from "$lib/types/nodes/logs";
    import { FormattedTimeStep } from "$lib/types/date";
    import { LogSpanPeriod, SelectablePhaseFilter, EnergyDirectionFilter } from "$lib/types/view/nodes";
    import FullScreenPanel from "../../../Dashboard/FullScreenPanel.svelte";
    import EnergyConsGraph from "./EnergyConsGraph.svelte";
    import EnergyPickers from "../../../General/Pickers/EnergyPickers.svelte";

    // Styles
    import { FullScreenBaseGraphStyle, FullScreenEnergyConsMetricStyle, GraphButtonStyle } from "$lib/style/graph";

    // Props
    export let data: Array<ProcessedEnergyConsumptionLogPoint> | undefined;
    export let timeStep: FormattedTimeStep | null | undefined;
    export let show: boolean;
    export let goBackEnabled: boolean = true;
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
    export let selectedTimeSpan: LogSpanPeriod;
    export let selectedPhase: SelectablePhaseFilter | undefined = undefined;
    export let selectedDirection: EnergyDirectionFilter | undefined = undefined;
    export let usePhase: boolean = false;

    // Constants
    const HIDE_CURRENT_TIME_SPAN_MIN_WIDTH = 880;

    // Variables
    let showCurrentTimeSpan: boolean = false;
    let baseContainerWidth: number | null;

    // Reactive Statements
    $: showCurrentTimeSpan = baseContainerWidth !== null && !(baseContainerWidth >= HIDE_CURRENT_TIME_SPAN_MIN_WIDTH);

    // Export Functions
    export let changePhase: (selectedPhase: SelectablePhaseFilter) => void;
    export let changeEnergyDirection: (selectedDirection: EnergyDirectionFilter) => void;
    export let getNewTimeSpan: (startTime: Date, endTime: Date) => void;
    export let getNewDefaultTimeSpan: (timeSpan: LogSpanPeriod) => void;
    export let goBack: () => void;
</script>

<!--
    FullScreenEnergyConsGraph - Full-screen energy consumption graph view
    
    Displays energy consumption data (active/reactive energy, power factor) in an 
    immersive full-screen modal with integrated filter controls and metrics display.
    Includes responsive layout adjustments and back navigation support.
-->
<FullScreenPanel bind:show>
    <EnergyConsGraph
        style={$FullScreenBaseGraphStyle}
        metricsStyle={$FullScreenEnergyConsMetricStyle}
        useHeader={true}
        useRightPanelMetrics={false}
        {data}
        {timeStep}
        fullScreen={true}
        showDateChecker={false}
        showDatePicker={false}
        {usePhase}
        bind:showFullScreen={show}
        bind:selectedPhase
        bind:selectedDirection
        bind:selectedTimeSpan
        bind:initialDate
        bind:endDate
        bind:baseContainerWidth
        {dataFetched}
        {firstFetch}
        {globalMetrics}
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
    >
        <div slot="custom-date-picker">
            <EnergyPickers
                toolTipButtonStyle={$GraphButtonStyle}
                bind:selectedPhase
                bind:selectedDirection
                bind:selectedTimeSpan
                bind:initialDate
                bind:endDate
                {usePhase}
                {showCurrentTimeSpan}
                changePhase={(selectedPhase: SelectablePhaseFilter) => changePhase(selectedPhase)}
                changeEnergyDirection={(selectedDirection: EnergyDirectionFilter) => changeEnergyDirection(selectedDirection)}
                changeSpanPeriodCustom={(initial_date: Date, end_date: Date) => getNewTimeSpan(initial_date, end_date)}
                changeSpanPeriod={(timeSpan: LogSpanPeriod) => getNewDefaultTimeSpan(timeSpan)}
            />
        </div>
    </EnergyConsGraph>
</FullScreenPanel>
