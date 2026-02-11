<script lang="ts">
    import { NodePhase } from "$lib/types/nodes/base";
    import { NodeCategory } from "$lib/types/nodes/base";
    import Action from "../General/Action.svelte";
    import ContentCard from "../General/ContentCard.svelte";
    import ToolTipText from "../General/ToolTipText.svelte";
    import ExpandableSection from "../General/ExpandableSection.svelte";
    import type { RealTimeCardCategoriesState } from "$lib/types/view/device";
    import type { NodePhaseSection } from "$lib/types/nodes/base";
    import type { ProcessedNodeState } from "$lib/types/nodes/realtime";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";
    import { variableNameTexts } from "$lib/stores/lang/energyMeterTexts";

    // Styles
    import { RealTimeCardActionStyle } from "$lib/style/device";
    import { RealTimeCardActionToolTipStyle } from "$lib/style/device";

    // Props
    export let section: NodePhaseSection;
    export let processedNodesState: Array<ProcessedNodeState>;
    export let availableCategories: Record<NodePhase, RealTimeCardCategoriesState>;
    export let nodesStateByCategory: Record<NodePhase, Record<NodeCategory, Array<ProcessedNodeState>>>;
    export let expandedState: Record<NodePhase, RealTimeCardCategoriesState>;
    export let detailedNodeState: ProcessedNodeState;
    export let detailedNodeStateName: string;
    export let detailedNodeStatePhase: NodePhase;
    export let showDetailDiv: boolean;

    // Reactive Statements
    // Nodes are updated
    $: if (processedNodesState) {
        handleNodesChange();
    }

    // Functions
    function expandAllOnPhaseCard(phase: NodePhase): void {
        for (const state of Object.keys(expandedState[phase]) as (keyof RealTimeCardCategoriesState)[]) {
            expandedState[phase][state] = false;
        }
    }

    function collapseAllOnPhaseCard(phase: NodePhase): void {
        for (const state of Object.keys(expandedState[phase]) as (keyof RealTimeCardCategoriesState)[]) {
            expandedState[phase][state] = true;
        }
    }

    function getNodeState(name: string, phase: NodePhase): ProcessedNodeState | undefined {
        return processedNodesState.find((node) => node.name === name && node.phase === phase);
    }

    function openDetailDiv(nodeState: ProcessedNodeState): void {
        let newNodeState = getNodeState(nodeState.name, nodeState.phase);
        if (newNodeState) {
            detailedNodeStateName = nodeState.name;
            detailedNodeStatePhase = nodeState.phase;
            detailedNodeState = newNodeState;
            showDetailDiv = true;
        }
    }

    function handleNodesChange(): void {
        if (!detailedNodeStateName || !detailedNodeStatePhase) return;
        let newNodeState = getNodeState(detailedNodeStateName, detailedNodeStatePhase);
        if (newNodeState) {
            detailedNodeState = newNodeState;
        } else {
            showDetailDiv = false;
        }
    }
</script>

<!--
    RealTimeCard Component
    
    A comprehensive real-time device monitoring card that displays electrical node data
    organized by phase sections and categorized by node types (Measurements, Counters, States,
    Texts, Other). Features expandable/collapsible sections for each node category with
    bulk expand/collapse controls in the header. Displays live node state data including
    values, units, alarm/warning states, and range information using dynamic display
    components based on node type.
    
    Provides interactive drill-down functionality where clicking individual nodes opens
    detailed views with historical data and comprehensive node information. Supports
    multi-phase electrical systems (L1, L2, L3) and single-phase configurations with
    proper phase-based organization and internationalized labels.
    
    The component integrates with the ContentCard layout system and uses ExpandableSection
    components for organized data presentation. Features action buttons for bulk section
    management (expand all/collapse all) with tooltip guidance and maintains reactive
    state synchronization for section visibility and expansion states.
-->
<ContentCard titleText={section.phase !== NodePhase.SINGLEPHASE ? $texts[section.labelKey] : $texts.variables}>
    <div class="slot-div header" slot="header">
        <div class="actions-div">
            <Action
                style={$RealTimeCardActionStyle}
                toolTipStyle={$RealTimeCardActionToolTipStyle}
                imageWidth="24px"
                imageHeight="24px"
                imageURL="/img/collapse-all.svg"
                onClick={() => expandAllOnPhaseCard(section.phase)}
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
                onClick={() => collapseAllOnPhaseCard(section.phase)}
                enableToolTip={true}
            >
                <div slot="tooltip"><ToolTipText text={$texts.expandAll} /></div>
            </Action>
        </div>
    </div>
    <div class="slot-div content" slot="content">
        {#each Object.entries(availableCategories[section.phase]) as [subsection, isActive] (subsection)}
            {#if isActive}
                <ExpandableSection
                    titleText={$texts[subsection.toLowerCase()]}
                    bind:contentExpanded={expandedState[section.phase][subsection as keyof RealTimeCardCategoriesState]}
                >
                    <div class="phase-subsection-div">
                        {#each nodesStateByCategory[section.phase][subsection as keyof RealTimeCardCategoriesState] as nodeState (nodeState.name)}
                            <svelte:component
                                this={nodeState.displayComponent}
                                nodeName={nodeState.name}
                                nodePhase={nodeState.phase}
                                labelText={$variableNameTexts[nodeState.name] || nodeState.name}
                                minRangeValue={nodeState.min_value_range}
                                maxRangeValue={nodeState.max_value_range}
                                minAlarmState={nodeState.min_alarm_state}
                                maxAlarmState={nodeState.max_alarm_state}
                                minWarningState={nodeState.min_warning_state}
                                maxWarningState={nodeState.max_warning_state}
                                value={nodeState.value}
                                unitText={nodeState.unit}
                                decimalPlaces={nodeState.decimal_places}
                                onClick={() => openDetailDiv(nodeState)}
                                minClickTimeMs={500}
                            />
                        {/each}
                    </div>
                </ExpandableSection>
            {/if}
        {/each}
    </div>
</ContentCard>

<style>
    /* Content container and phase subsection - Vertical layout for node category sections and individual node displays */
    .slot-div.content,
    .slot-div.content .phase-subsection-div {
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

    /* Header slot container - Full-width wrapper for card header with action buttons */
    .slot-div.header {
        padding: 0;
        margin: 0;
        width: 100%;
        height: 100%;
    }

    /* Actions container - Right-aligned horizontal layout for expand/collapse control buttons */
    .slot-div.header .actions-div {
        display: flex;
        height: 100%;
        justify-content: end;
        align-items: center;
        gap: 10px;
    }
</style>
