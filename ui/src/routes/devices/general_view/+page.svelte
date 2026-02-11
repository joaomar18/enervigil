<script lang="ts">
    import { getDeviceID, resetDashboardLoader } from "$lib/logic/view/navigation";
    import { fade } from "svelte/transition";
    import { onMount } from "svelte";
    import { APIPoller } from "$lib/logic/api/poller";
    import { NodePhase } from "$lib/types/nodes/base";
    import { getDeviceNodesStateAPI } from "$lib/logic/api/nodes";
    import { showToast } from "$lib/logic/view/toast";
    import { AlertType } from "$lib/stores/view/toast";
    import { nodePhaseSections } from "$lib/types/nodes/base";
    import { getNodesStateByCategory } from "$lib/logic/util/nodes";
    import { initialRealTimeCardCategoriesExpandState } from "$lib/types/view/device";
    import { assignRealTimeCardCategoriesStateToAllPhases } from "$lib/logic/view/device";
    import NodeDetailSheet from "../../../components/Devices/Nodes/NodeDetailSheet.svelte";
    import EnergyConsumptionCard from "../../../components/Devices/EnergyConsumptionCard.svelte";
    import { meterTypeAvailablePhases } from "$lib/types/device/energy";
    import type { NodeCategory } from "$lib/types/nodes/base";
    import type { NodeState, ProcessedNodeState } from "$lib/types/nodes/realtime";
    import type { RealTimeCardCategoriesState } from "$lib/types/view/device";
    import type { MeterType } from "$lib/types/device/base";
    import RealTimeCard from "../../../components/Devices/RealTimeCard.svelte";
    import MetricsCard from "../../../components/Devices/MetricsCard.svelte";

    // Stores
    import { loadedDone } from "$lib/stores/view/navigation";

    // Styles
    import { ToolTipTextStyle } from "$lib/style/general";

    // Variables
    let nodesState: Record<string, NodeState>;
    let processedNodesState: Array<ProcessedNodeState>;
    let nodesStateByCategory: Record<NodePhase, Record<NodeCategory, Array<ProcessedNodeState>>>;
    let availablePhases: Array<NodePhase>;
    let meterType: MeterType;
    let availableCategories: Record<NodePhase, RealTimeCardCategoriesState>;
    let realTimeExpandedState = assignRealTimeCardCategoriesStateToAllPhases(initialRealTimeCardCategoriesExpandState);
    let metricsExpandedState = {
        peakPower: true,
    } as Record<string, boolean>;
    let showDetailDiv = false;
    let detailedNodeStateName: string;
    let detailedNodeStatePhase: NodePhase;
    let detailedNodeState: ProcessedNodeState;

    // Reactive Statements
    $: if (meterType && nodesState && processedNodesState) {
        availablePhases = meterTypeAvailablePhases[meterType];
        ({ nodesStateByCategory, availableCategories } = getNodesStateByCategory(processedNodesState));
    }

    // Functions
    onMount(() => {
        resetDashboardLoader();
        let deviceId = getDeviceID();
        let nodesStatePoller: APIPoller<{
            meterType: MeterType;
            nodesState: Record<string, NodeState>;
            processedNodesState: Array<ProcessedNodeState>;
        } | null> | null;

        if (deviceId) {
            nodesStatePoller = new APIPoller(
                getDeviceNodesStateAPI(deviceId),
                (result) => {
                    if (result === null) return;
                    meterType = result.meterType;
                    nodesState = result.nodesState;
                    processedNodesState = result.processedNodesState;
                },
                5000,
            );
        } else {
            showToast("errorEditDeviceParams", AlertType.ALERT);
            loadedDone.set(true);
        }

        //Clean-up logic
        return () => {
            nodesStatePoller?.stop();
            nodesStatePoller = null;
        };
    });
</script>

<!--
    Devices general view — displays device node real-time cards, metrics and energy consumption.
    - Composes RealTimeCard, MetricsCard and EnergyConsumptionCard and manages node state polling.
    - Provides a NodeDetailSheet for drill-down details.
-->
<div
    style="
        --tool-tip-text-color: {$ToolTipTextStyle.color};
        --tool-tip-text-weight: {$ToolTipTextStyle.weight};
    "
    class="content"
    in:fade={{ duration: 300 }}
>
    {#if nodesStateByCategory && availableCategories}
        <div class="grid">
            {#each nodePhaseSections.filter((section) => availablePhases.includes(section.phase)) as section (section.key)}
                <div class="grid-col">
                    <RealTimeCard
                        {section}
                        {processedNodesState}
                        {availableCategories}
                        {nodesStateByCategory}
                        bind:expandedState={realTimeExpandedState}
                        bind:detailedNodeStateName
                        bind:detailedNodeStatePhase
                        bind:detailedNodeState
                        bind:showDetailDiv
                    />
                </div>
            {/each}
            <div class="grid-col">
                <MetricsCard {availablePhases} bind:expandedState={metricsExpandedState} />
            </div>
            <div class="grid-col span-2">
                <EnergyConsumptionCard {availablePhases} />
            </div>
        </div>
    {/if}
    <NodeDetailSheet bind:showPanel={showDetailDiv} nodeState={detailedNodeState} />
</div>

<style>
    /* Page content wrapper — sets page padding and height to keep consistent layout */
    .content {
        padding: 0;
        width: 100%;
        height: 100%;
    }

    /* Dashboard grid — 4-column responsive grid for cards; gap and max-width tuned for reasonable card sizing */
    .grid {
        margin: 0 auto;
        padding: 0;
        position: relative;
        display: grid;
        grid-template-columns: repeat(4, minmax(300px, 1fr));
        max-width: calc(4 * 400px + 1 * 20px);
        gap: 20px;
        justify-items: stretch;
        align-items: stretch;
        align-content: start;
    }

    /* Column cell — each metric/graph card sits in a grid column; size constraints for visual balance */
    .grid-col {
        margin: 0;
        padding: 0;
        width: 100%;
        height: calc(50vh - 74px - 5px);
        min-height: 350px;
        max-height: 800px;
    }

    /* Larger column variant — spans two columns for wider content (e.g., large graph) */
    .grid .grid-col.span-2 {
        grid-column: span 2;
    }

    /* Responsive breakpoint: medium screens — collapse grid from 4 -> 2 columns */
    @media (max-width: 1569px) {
        .grid {
            max-width: calc(2 * 400px + 1 * 20px);
            grid-template-columns: repeat(2, minmax(300px, 1fr));
        }
        .grid .grid-col {
            min-height: 450px;
        }
    }

    /* Responsive breakpoint: small screens / mobile — stack into a single column */
    @media (max-width: 946px) {
        .grid {
            max-width: 400px;
            grid-template-columns: repeat(1, minmax(300px, 1fr));
        }
        .grid .grid-col.span-2 {
            grid-column: auto;
            height: 708px;
        }
    }
</style>
