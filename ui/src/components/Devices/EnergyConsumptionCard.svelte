<script lang="ts">
    import { APICaller } from "$lib/logic/api/api";
    import { getDeviceID } from "$lib/logic/view/navigation";
    import { onMount, onDestroy } from "svelte";
    import { SlidingWindow } from "$lib/logic/util/classes/SlidingWindow";
    import { NodePhase } from "$lib/types/nodes/base";
    import { EnergyDirectionFilter, LogSpanPeriod, SelectablePhaseFilter, type EnergyConsumptionTimeSpan } from "$lib/types/view/nodes";
    import { getTimeSpanFromLogPeriod } from "$lib/logic/util/date";
    import { getEnergyConsumptionAPI } from "$lib/logic/api/nodes";
    import Action from "../General/Action.svelte";
    import ContentCard from "../General/ContentCard.svelte";
    import EnergyConsGraph from "./Nodes/Graphs/EnergyConsGraph.svelte";
    import ToolTipText from "../General/ToolTipText.svelte";
    import EnergyPickers from "../General/Pickers/EnergyPickers.svelte";
    import type { EnergyConsumptionType } from "$lib/types/device/energy";
    import type { EnergyConsumptionMetrics, ProcessedEnergyConsumptionLogPoint } from "$lib/types/nodes/logs";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Styles
    import { RealTimeCardButtonStyle, RealTimeCardActionStyle } from "$lib/style/device";

    // Props
    export let availablePhases: Array<NodePhase>;

    // Constants
    const EXPAND_HEIGHT_MAX_WIDTH = 946;
    const API_REQUEST_TIMEOUT_MS = 60 * 1000; // 1 minute

    // Variables
    let energyLogs: EnergyConsumptionType | null = null;
    let mergedPoints: Array<ProcessedEnergyConsumptionLogPoint>;
    let mergedGlobalMetrics: EnergyConsumptionMetrics;
    let mobileView = false;
    let selectedEnergyDirection: EnergyDirectionFilter = EnergyDirectionFilter.TOTAL;
    let selectedElectricalPhase: SelectablePhaseFilter = SelectablePhaseFilter.TOTAL;
    let selectedTimeSpan: LogSpanPeriod = LogSpanPeriod.currentDay;
    let initialDate: Date;
    let endDate: Date;
    let energyConsumptionFetched: boolean = false;
    let energyConsumptionFirstFetch: boolean = false;
    let showGraphFullScreen: boolean = false;
    let usePhase: boolean = false;
    let currentTimeSpans: SlidingWindow<EnergyConsumptionTimeSpan> = new SlidingWindow(10);
    let goBackEnabled: boolean = false;
    let nextRequestTimeout: ReturnType<typeof setTimeout> | null = null;

    // Reactive Statements
    $: if (!energyConsumptionFirstFetch) {
        getInitialEnergyConsumption();
    }
    $: if (availablePhases) {
        usePhase = !availablePhases.includes(NodePhase.SINGLEPHASE);
    }

    // Functions
    function getInitialEnergyConsumption(): void {
        let { initial_date, end_date } = getTimeSpanFromLogPeriod(selectedTimeSpan);
        setDateSpan({ initial_date, end_date });
        loadEnergyConsumption();
        addToCurrentTimeSpans({
            initial_date: initialDate,
            end_date: endDate,
            log_span_period: selectedTimeSpan,
            phase: selectedElectricalPhase,
            direction: selectedEnergyDirection,
        } as EnergyConsumptionTimeSpan);
    }

    function setDateSpan(dateSpan: { initial_date: Date; end_date: Date }): void {
        initialDate = dateSpan.initial_date;
        endDate = dateSpan.end_date;
    }

    function getNewTimeSpan(initial_date: Date, end_date: Date): void {
        setDateSpan({ initial_date, end_date });
        loadEnergyConsumption();
        addToCurrentTimeSpans({
            initial_date: initialDate,
            end_date: endDate,
            log_span_period: LogSpanPeriod.customDate,
            phase: selectedElectricalPhase,
            direction: selectedEnergyDirection,
        } as EnergyConsumptionTimeSpan);
        selectedTimeSpan = LogSpanPeriod.customDate;
    }

    function getNewDefaultTimeSpan(timeSpan: LogSpanPeriod): void {
        let { initial_date, end_date } = getTimeSpanFromLogPeriod(timeSpan);
        setDateSpan({ initial_date, end_date });
        loadEnergyConsumption();
        addToCurrentTimeSpans({
            initial_date: initialDate,
            end_date: endDate,
            log_span_period: timeSpan,
            phase: selectedElectricalPhase,
            direction: selectedEnergyDirection,
        } as EnergyConsumptionTimeSpan);
        selectedTimeSpan = timeSpan;
    }

    function getNewElectricalPhase(selectedPhase: SelectablePhaseFilter): void {
        selectedElectricalPhase = selectedPhase;
        loadEnergyConsumption();
        addToCurrentTimeSpans({
            initial_date: initialDate,
            end_date: endDate,
            log_span_period: selectedTimeSpan,
            phase: selectedPhase,
            direction: selectedEnergyDirection,
        } as EnergyConsumptionTimeSpan);
    }

    function getNewEnergyDirection(selectedDirection: EnergyDirectionFilter): void {
        selectedEnergyDirection = selectedDirection;
        loadEnergyConsumption();
        addToCurrentTimeSpans({
            initial_date: initialDate,
            end_date: endDate,
            log_span_period: selectedTimeSpan,
            phase: selectedElectricalPhase,
            direction: selectedDirection,
        } as EnergyConsumptionTimeSpan);
    }

    async function loadEnergyConsumption() {
        let deviceId = getDeviceID();
        if (!deviceId) {
            return;
        }
        energyConsumptionFetched = false;
        let result = await getEnergyConsumptionAPI(
            deviceId,
            selectedElectricalPhase,
            selectedEnergyDirection,
            initialDate !== null,
            initialDate,
            endDate,
        ).call({ timeout: API_REQUEST_TIMEOUT_MS });
        if (result !== null) {
            energyLogs = result.energyLogs;
            mergedPoints = result.mergedPoints;
            mergedGlobalMetrics = result.mergedGlobalMetrics;
            energyConsumptionFetched = true;
        }
        energyConsumptionFirstFetch = true;
        scheduleNextRequest();
    }

    function addToCurrentTimeSpans(timeSpan: EnergyConsumptionTimeSpan): void {
        currentTimeSpans.add(timeSpan);
        goBackEnabled = currentTimeSpans.hasPrevious();
    }

    function setTimeSpanToPrevious(): void {
        let previousNodeTimeSpan = currentTimeSpans.previous();
        if (!previousNodeTimeSpan) return;
        setDateSpan({ initial_date: previousNodeTimeSpan.initial_date, end_date: previousNodeTimeSpan.end_date });
        selectedTimeSpan = previousNodeTimeSpan.log_span_period;
        selectedElectricalPhase = previousNodeTimeSpan.phase;
        selectedEnergyDirection = previousNodeTimeSpan.direction;
        loadEnergyConsumption();
        currentTimeSpans.confirmPrevious();
        goBackEnabled = currentTimeSpans.hasPrevious();
    }

    function handleWindowResize(): void {
        mobileView = window.innerWidth <= EXPAND_HEIGHT_MAX_WIDTH;
    }

    function scheduleNextRequest(): void {
        if (nextRequestTimeout !== null) {
            clearTimeout(nextRequestTimeout);
            nextRequestTimeout = null;
        }
        nextRequestTimeout = setTimeout(() => loadEnergyConsumption(), API_REQUEST_TIMEOUT_MS);
    }

    onMount(() => {
        APICaller.addOnResumeListener(loadEnergyConsumption);
        window.addEventListener("resize", handleWindowResize);
        handleWindowResize();
    });

    onDestroy(() => {
        APICaller.removeOnResumeListener(loadEnergyConsumption);
        window.removeEventListener("resize", handleWindowResize);
        if (nextRequestTimeout !== null) {
            clearTimeout(nextRequestTimeout);
            nextRequestTimeout = null;
        }
    });
</script>

<!--
    EnergyConsumptionCard - Device energy consumption data card component
    
    Displays energy consumption graphs with integrated filter controls (phase/direction/period)
    and navigation history via sliding window back button. Fetches and manages active/reactive
    energy data with automatic responsive layout switching and full-screen mode support.
-->
<ContentCard
    contentPaddingHorizontal="0px"
    contentPaddingTop="0px"
    contentPaddingBottom="0px"
    titleText={mobileView ? $texts.energyConsumptionShort : $texts.energyConsumption}
    useLeftHeader={true}
    useScroll={false}
>
    <div class="slot-div left-header" slot="left-header">
        <Action
            style={$RealTimeCardActionStyle}
            imageURL="/img/previous.svg"
            disabledImageURL="/img/previous-disabled.svg"
            onClick={setTimeSpanToPrevious}
            enableToolTip={true}
            disabled={!goBackEnabled}
        >
            <div slot="tooltip"><ToolTipText text={$texts.goBack} /></div>
        </Action>
    </div>

    <div class="slot-div header" slot="header">
        <div class="actions-div">
            <div class="picker-div">
                <EnergyPickers
                    toolTipButtonStyle={$RealTimeCardButtonStyle}
                    bind:selectedPhase={selectedElectricalPhase}
                    bind:selectedDirection={selectedEnergyDirection}
                    bind:selectedTimeSpan
                    bind:initialDate
                    bind:endDate
                    {usePhase}
                    changePhase={(selectedPhase: SelectablePhaseFilter) => getNewElectricalPhase(selectedPhase)}
                    changeEnergyDirection={(selectedDirection: EnergyDirectionFilter) => getNewEnergyDirection(selectedDirection)}
                    changeSpanPeriodCustom={(initial_date: Date, end_date: Date) => getNewTimeSpan(initial_date, end_date)}
                    changeSpanPeriod={(timeSpan: LogSpanPeriod) => getNewDefaultTimeSpan(timeSpan)}
                />
            </div>
            <Action
                style={$RealTimeCardActionStyle}
                imageURL="/img/fullscreen.svg"
                onClick={() => {
                    showGraphFullScreen = !showGraphFullScreen;
                }}
                enableToolTip={true}
            >
                <div slot="tooltip"><ToolTipText text={$texts.fullscreen} /></div>
            </Action>
        </div>
    </div>
    <div class="slot-div content" slot="content">
        <div class="graph-div">
            <EnergyConsGraph
                data={mergedPoints}
                timeStep={energyLogs?.active_energy.time_step}
                bind:selectedTimeSpan
                bind:selectedPhase={selectedElectricalPhase}
                bind:selectedDirection={selectedEnergyDirection}
                bind:initialDate
                bind:endDate
                bind:showFullScreen={showGraphFullScreen}
                {usePhase}
                dataFetched={energyConsumptionFetched}
                firstFetch={energyConsumptionFirstFetch}
                globalMetrics={mergedGlobalMetrics}
                activeEnergyUnit={energyLogs?.active_energy.unit ?? ""}
                reactiveEnergyUnit={energyLogs?.reactive_energy.unit ?? ""}
                activeEnergyDecimalPlaces={energyLogs?.active_energy.decimal_places}
                reactiveEnergyDecimalPlaces={energyLogs?.reactive_energy.decimal_places}
                powerFactorDecimalPlaces={energyLogs?.power_factor.decimal_places}
                getNewTimeSpan={(initial_date: Date, end_date: Date) => getNewTimeSpan(initial_date, end_date)}
                getNewDefaultTimeSpan={(timeSpan: LogSpanPeriod) => getNewDefaultTimeSpan(timeSpan)}
                changePhase={(selectedPhase: SelectablePhaseFilter) => getNewElectricalPhase(selectedPhase)}
                changeEnergyDirection={(selectedDirection: EnergyDirectionFilter) => getNewEnergyDirection(selectedDirection)}
                {goBackEnabled}
                goBack={setTimeSpanToPrevious}
            />
        </div>
    </div>
</ContentCard>

<style>
    /* Header slot container - Full-width wrapper for filter controls and action buttons */
    .slot-div.header {
        padding: 0;
        margin: 0;
        width: 100%;
        height: 100%;
    }

    /* Actions container - Right-aligned flex layout for header buttons with consistent spacing */
    .slot-div.header .actions-div {
        display: flex;
        height: 100%;
        justify-content: end;
        align-items: center;
        gap: 10px;
    }

    /* Picker wrapper - Relative positioning container for energy filters tooltip */
    .picker-div {
        margin: 0;
        padding: 0;
        position: relative;
    }

    /* Content slot container - Full-size flex wrapper for graph component with overflow handling */
    .slot-div.content {
        position: relative;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
        min-height: 0;
    }

    /* Graph container - Full-size wrapper for EnergyConsGraph component */
    .graph-div {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
    }
</style>
