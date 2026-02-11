<script lang="ts">
    import { APICaller } from "$lib/logic/api/api";
    import { getDeviceID } from "$lib/logic/view/navigation";
    import Action from "../General/Action.svelte";
    import ContentCard from "../General/ContentCard.svelte";
    import ToolTipText from "../General/ToolTipText.svelte";
    import EnergyPickers from "../General/Pickers/EnergyPickers.svelte";
    import ExpandableSection from "../General/ExpandableSection.svelte";
    import { mapMetricsAPI } from "$lib/logic/api/nodes";
    import { getTimeSpanFromLogPeriod } from "$lib/logic/util/date";
    import { LogSpanPeriod } from "$lib/types/view/nodes";
    import { SelectablePhaseFilter } from "$lib/types/view/nodes";
    import { NodePhase } from "$lib/types/nodes/base";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Styles
    import { RealTimeCardActionStyle, RealTimeCardActionToolTipStyle, RealTimeCardButtonStyle } from "$lib/style/device";
    import { onDestroy, onMount } from "svelte";
    import PeakPowerMetrics from "./Nodes/Metrics/PeakPowerMetrics.svelte";

    // Props
    export let availablePhases: Array<NodePhase>;
    export let expandedState: Record<string, boolean>;

    // Constants
    const API_REQUEST_TIMEOUT_MS = 60 * 1000; // 1 minute

    // Variables
    let mobileView = false;
    let selectedElectricalPhase: SelectablePhaseFilter = SelectablePhaseFilter.TOTAL;
    let selectedTimeSpan: LogSpanPeriod = LogSpanPeriod.currentDay;
    let initialDate: Date;
    let endDate: Date;
    let metricsFetched: boolean = false;
    let metricsData: Record<string, any> = {};
    let metricsFirstFetch: boolean = false;
    let usePhase: boolean = false;
    let nextRequestTimeout: ReturnType<typeof setTimeout> | null = null;

    // Reactive Statements
    $: if (!metricsFirstFetch) {
        getInitialMetrics();
    }

    $: if (availablePhases) {
        usePhase = !availablePhases.includes(NodePhase.SINGLEPHASE);
    }

    // Functions
    function getInitialMetrics(): void {
        let { initial_date, end_date } = getTimeSpanFromLogPeriod(selectedTimeSpan);
        setDateSpan({ initial_date, end_date });
        loadMetrics();
    }

    function setDateSpan(dateSpan: { initial_date: Date; end_date: Date }): void {
        initialDate = dateSpan.initial_date;
        endDate = dateSpan.end_date;
    }

    function getNewTimeSpan(initial_date: Date, end_date: Date): void {
        setDateSpan({ initial_date, end_date });
        loadMetrics();
        selectedTimeSpan = LogSpanPeriod.customDate;
    }

    function getNewDefaultTimeSpan(timeSpan: LogSpanPeriod): void {
        let { initial_date, end_date } = getTimeSpanFromLogPeriod(timeSpan);
        setDateSpan({ initial_date, end_date });
        loadMetrics();
        selectedTimeSpan = timeSpan;
    }

    function getNewElectricalPhase(selectedPhase: SelectablePhaseFilter): void {
        selectedElectricalPhase = selectedPhase;
        loadMetrics();
    }

    async function loadMetrics() {
        let deviceId = getDeviceID();
        if (!deviceId) {
            return;
        }
        metricsFetched = false;
        for (const metric of Object.keys(expandedState)) {
            let result = await mapMetricsAPI(metric, deviceId, selectedElectricalPhase, initialDate, endDate);
            if (result !== null) {
                metricsData[metric] = result;
                metricsFetched = true;
            }
        }
        metricsFirstFetch = true;
        scheduleNextRequest();
    }

    function getMobileView(): void {
        mobileView = !(window.innerWidth >= 450);
    }

    function expandAll(): void {
        for (const metric of Object.keys(expandedState)) {
            expandedState[metric] = true;
        }
    }

    function collapseAll(): void {
        for (const metric of Object.keys(expandedState)) {
            expandedState[metric] = false;
        }
    }

    function scheduleNextRequest(): void {
        if (nextRequestTimeout !== null) {
            clearTimeout(nextRequestTimeout);
            nextRequestTimeout = null;
        }
        nextRequestTimeout = setTimeout(() => loadMetrics(), API_REQUEST_TIMEOUT_MS);
    }

    onMount(() => {
        APICaller.addOnResumeListener(loadMetrics);
        window.addEventListener("resize", getMobileView);
    });

    onDestroy(() => {
        APICaller.removeOnResumeListener(loadMetrics);
        window.removeEventListener("resize", getMobileView);
        if (nextRequestTimeout !== null) {
            clearTimeout(nextRequestTimeout);
            nextRequestTimeout = null;
        }
    });
</script>

<!--
    MetricsCard.svelte

    Container card for device metrics. Provides controls for expanding/collapsing all metrics,
    time / phase selection via `EnergyPickers`, and exposes metric sections such as Peak Power.
    - Designed to host metric components (e.g., PeakPowerMetrics) inside `ExpandableSection` slots.
    - Reacts to resize for a compact `mobileView` layout and fetches metrics via `mapMetricAPI`.
-->
<ContentCard titleText={mobileView ? $texts.metricsShort : $texts.metrics}>
    <div class="slot-div header" slot="header">
        <div class="actions-div">
            <Action
                style={$RealTimeCardActionStyle}
                toolTipStyle={$RealTimeCardActionToolTipStyle}
                imageWidth="24px"
                imageHeight="24px"
                imageURL="/img/collapse-all.svg"
                onClick={collapseAll}
                enableToolTip={true}
            >
                <div slot="tooltip"><ToolTipText text={$texts.collapseAll} /></div>
            </Action>
            <Action
                style={$RealTimeCardActionStyle}
                toolTipStyle={$RealTimeCardActionToolTipStyle}
                imageWidth="24px"
                imageHeight="24px"
                imageURL="/img/expand-all.svg"
                onClick={expandAll}
                enableToolTip={true}
            >
                <div slot="tooltip"><ToolTipText text={$texts.expandAll} /></div>
            </Action>
            <div class="picker-div">
                <EnergyPickers
                    toolTipButtonStyle={$RealTimeCardButtonStyle}
                    bind:selectedPhase={selectedElectricalPhase}
                    bind:selectedTimeSpan
                    bind:initialDate
                    bind:endDate
                    {usePhase}
                    useDirection={false}
                    changePhase={(selectedPhase: SelectablePhaseFilter) => getNewElectricalPhase(selectedPhase)}
                    changeSpanPeriodCustom={(initial_date: Date, end_date: Date) => getNewTimeSpan(initial_date, end_date)}
                    changeSpanPeriod={(timeSpan: LogSpanPeriod) => getNewDefaultTimeSpan(timeSpan)}
                />
            </div>
        </div>
    </div>
    <div class="slot-div content" slot="content">
        {#if "peakPower" in expandedState}
            <ExpandableSection titleText={$texts.peakPower} bind:contentExpanded={expandedState.peakPower}>
                <PeakPowerMetrics metrics={metricsData.peakPower} dataFetched={metricsFetched} firstFetch={metricsFirstFetch} />
            </ExpandableSection>
        {/if}
    </div>
</ContentCard>

<style>
    /* Header slot — contains actions and pickers aligned to the right */
    .slot-div.header {
        padding: 0;
        margin: 0;
        width: 100%;
        height: 100%;
    }

    /* Action container inside header — action buttons and pickers */
    .slot-div.header .actions-div {
        display: flex;
        height: 100%;
        justify-content: end;
        align-items: center;
        gap: 10px;
    }

    /* Picker wrapper — positions the `EnergyPickers` control */
    .picker-div {
        margin: 0;
        padding: 0;
        position: relative;
    }

    /* Content slot — holds the expandable metric sections (e.g. PeakPower) */
    .slot-div.content {
        position: relative;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        min-height: 0;
    }
</style>
