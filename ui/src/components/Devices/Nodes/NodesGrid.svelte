<script lang="ts">
    import NodeRow from "./NodeRow.svelte";
    import AddNode from "./AddNode.svelte";
    import { onMount, onDestroy } from "svelte";
    import { addNode } from "$lib/logic/factory/nodes";
    import { deleteNodeFromArray } from "$lib/logic/handlers/nodes/base";
    import { nodePhaseSections } from "$lib/types/nodes/base";

    // Stores for variable definitions
    import { MeterType } from "$lib/types/device/base";
    import { NodePhase } from "$lib/types/nodes/base";

    // Types
    import type { EditableDevice, NewDevice } from "$lib/types/device/base";
    import type { EditableNodeRecord, NodeRecordEditingState } from "$lib/types/nodes/config";
    import type { ColumnVisibilityMap } from "$lib/types/view/nodes";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { NodesGridStyle } from "$lib/style/nodes";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $NodesGridStyle;

    // Props
    export let deviceData: EditableDevice | NewDevice;
    export let nodes: Array<EditableNodeRecord> = []; // Nodes Configuration (Formatted)
    export let nodesBySection: Record<NodePhase, Array<EditableNodeRecord>>; // Nodes Configuration by Section
    export let nodesInit: boolean; // Nodes are initialized

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let maxWidth: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let minHeight: string | undefined = undefined;
    export let borderRadius: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let containerBorder: string | undefined = undefined;
    export let headerBorder: string | undefined = undefined;
    export let headerHeight: string | undefined = undefined;
    export let headerBackgroundColor: string | undefined = undefined;
    export let headerTextColor: string | undefined = undefined;
    export let subSectionBackgroundColor: string | undefined = undefined;
    export let subSectionTextColor: string | undefined = undefined;
    export let subSectionBorder: string | undefined = undefined;

    $: localOverrides = {
        width,
        maxWidth,
        height,
        borderRadius,
        backgroundColor,
        containerBorder,
        headerBorder,
        headerHeight,
        headerBackgroundColor,
        headerTextColor,
        subSectionBackgroundColor,
        subSectionTextColor,
        subSectionBorder,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let containerElement: HTMLDivElement;
    let currentWidth: number;
    let windowWidth: number;

    let columnVisibility: ColumnVisibilityMap = {
        name: { hideWidth: undefined, visible: true },
        actions: { hideWidth: undefined, visible: true },
        enable: { hideWidth: 455, visible: true },
        unit: { hideWidth: 540, visible: true },
        custom: { hideWidth: 625, visible: true },
        virtual: { hideWidth: 710, visible: true },
        type: { hideWidth: 885, visible: true },
        logging: { hideWidth: 970, visible: true },
        publish: { hideWidth: 1055, visible: true },
        logging_period: { hideWidth: 1230, visible: true },
    };

    // Reactive Statements
    $: if (currentWidth) {
        for (let key of Object.keys(columnVisibility) as (keyof ColumnVisibilityMap)[]) {
            columnVisibility[key].visible = columnVisibility[key].hideWidth === undefined || currentWidth >= columnVisibility[key].hideWidth;
        }
    }

    // Export Functions
    export let onPropertyChanged: (node: EditableNodeRecord) => void;
    export let onShowConfigPopup: (node: EditableNodeRecord, nodeEditingState: NodeRecordEditingState) => void;

    // Functions
    function handleResize() {
        if (containerElement) {
            currentWidth = containerElement.clientWidth;
        }
        windowWidth = window.innerWidth;
    }

    onMount(() => {
        handleResize();
        let resizeObserver: ResizeObserver | undefined;
        if (containerElement) {
            resizeObserver = new ResizeObserver(() => {
                handleResize();
            });
            resizeObserver.observe(containerElement);
        }
        (window as any)._nodesGridResizeObserver = resizeObserver;
    });

    onDestroy(() => {
        const resizeObserver = (window as any)._nodesGridResizeObserver as ResizeObserver | undefined;
        if (resizeObserver) {
            resizeObserver.disconnect();
            (window as any)._nodesGridResizeObserver = undefined;
        }
    });
</script>

<!-- NodesGrid Component: displays a responsive table of device nodes, grouped by section for three-phase meters. 
Supports dynamic column visibility, node editing, configuration popups, and node addition/removal. 
Includes multi-language headers and adapts layout to container size. -->
<div
    bind:this={containerElement}
    style="
        --width: {mergedStyle.width};
        --max-width: {mergedStyle.maxWidth};
        --height: {mergedStyle.height};
        --min-height: {minHeight};
        --border-radius: {mergedStyle.borderRadius};
        --background-color: {mergedStyle.backgroundColor};
        --container-border: {mergedStyle.containerBorder};
        --header-border: {mergedStyle.headerBorder};
        --header-height: {mergedStyle.headerHeight};
        --header-background-color: {mergedStyle.headerBackgroundColor};
        --header-text-color: {mergedStyle.headerTextColor};
        --sub-section-background-color: {mergedStyle.subSectionBackgroundColor};
        --sub-section-text-color: {mergedStyle.subSectionTextColor};
        --sub-section-border: {mergedStyle.subSectionBorder};
    "
    class="container"
>
    <div class="content">
        <div class="loader-overlay" class:close={nodesInit}>
            <div class="spinner"></div>
        </div>
        <table>
            <thead>
                <tr class="header">
                    {#if columnVisibility.name.visible}
                        <th class="max-width"><span>{$texts.variable}</span></th>
                    {/if}
                    {#if columnVisibility.unit.visible}
                        <th class="min-width"><span>{$texts.unit}</span></th>
                    {/if}
                    {#if columnVisibility.type.visible}
                        <th class="mid-width"><span>{$texts.type}</span></th>
                    {/if}
                    {#if columnVisibility.logging_period.visible}
                        <th class="mid-width"><span>{$texts.loggingPeriod}</span></th>
                    {/if}
                    {#if columnVisibility.logging.visible}
                        <th class="min-width"><span>{$texts.logging}</span></th>
                    {/if}
                    {#if columnVisibility.virtual.visible}
                        <th class="min-width"><span>{$texts.virtual}</span></th>
                    {/if}
                    {#if columnVisibility.publish.visible}
                        <th class="min-width"><span>{$texts.publish}</span></th>
                    {/if}
                    {#if columnVisibility.custom.visible}
                        <th class="min-width"><span>{$texts.custom}</span></th>
                    {/if}
                    {#if columnVisibility.enable.visible}
                        <th class="min-width"><span>{$texts.enabled}</span></th>
                    {/if}
                    {#if columnVisibility.actions.visible}
                        {#if currentWidth > 325}
                            <th class="min-width"><span class="no-border">{$texts.actions}</span></th>
                        {:else}
                            <th class="super-min-width"><img src="/img/more.svg" style="width:24px; height: 24px;" alt="More" /></th>
                        {/if}
                    {/if}
                </tr>
            </thead>
            <tbody>
                {#if nodesBySection}
                    <!-- Render each node section -->
                    {#each nodePhaseSections.filter((section) => {
                        if (deviceData.type === MeterType.SINGLE_PHASE) return section.phase === NodePhase.SINGLEPHASE;
                        if (deviceData.type === MeterType.THREE_PHASE) return section.phase !== NodePhase.SINGLEPHASE;
                        return false;
                    }) as section (section.key)}
                        {#if section.phase !== NodePhase.SINGLEPHASE}
                            <tr class="sub-section">
                                <td colspan="20">{$texts[section.labelKey]}</td>
                            </tr>
                        {/if}
                        {#each nodesBySection[section.key] as node, i (i)}
                            <NodeRow
                                {node}
                                currentGridWidth={currentWidth}
                                {columnVisibility}
                                {windowWidth}
                                onDelete={() => {
                                    nodes = deleteNodeFromArray(node, nodes);
                                }}
                                onConfig={(nodeEditingState: NodeRecordEditingState) => {
                                    onShowConfigPopup(node, nodeEditingState);
                                }}
                                {deviceData}
                                onPropertyChanged={() => {
                                    onPropertyChanged(node);
                                }}
                            />
                        {/each}
                        <AddNode
                            {windowWidth}
                            onAddNode={() => {
                                nodes = [...nodes, addNode(section.phase, section.prefix, deviceData)];
                            }}
                        />
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
</div>

<style>
    /* Main container for the nodes grid table */
    .container {
        width: var(--width);
        max-width: var(--max-width);
        height: var(--height);
        border-radius: var(--border-radius);
        background-color: var(--background-color);
        border: var(--container-border);
    }

    /* Content wrapper for table and sections */
    .content {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: var(--min-height, min-content);
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: start;
    }

    /* Overlay when nodes are not yet initialized */
    .content .loader-overlay {
        margin: 0;
        padding: 0;
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        background: rgba(24, 29, 35, 0.25);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 2;
    }

    /* Close overlay and loader when content is initialized */
    .content .loader-overlay.close {
        display: none;
    }

    /* Spinner for loading visualization of nodes grid */
    .content .loader-overlay .spinner {
        width: 128px;
        height: 128px;
        border: 4px solid rgba(255, 255, 255, 0.2);
        border-top-color: #fff;
        border-radius: 50%;
        animation: content-spin 1s linear infinite;
    }

    /* Spin animation: full rotation */
    @keyframes content-spin {
        to {
            transform: rotate(360deg);
        }
    }

    /* Table layout for nodes grid */
    table {
        width: 100%;
        border-collapse: collapse;
        text-align: center;
    }

    /* Sticky table header for scrolling */
    table thead {
        position: sticky;
        top: 0px;
        z-index: 1;
    }

    /* Header row styling */
    table thead .header {
        background-color: var(--header-background-color);
        height: 40px;
        color: var(--header-text-color);
    }

    /* Header cell styling */
    table thead th {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
    }

    /* Rounded corners for first and last header cells */
    table thead .header th:first-child {
        border-top-left-radius: var(--border-radius);
    }
    table thead .header th:last-child {
        border-top-right-radius: var(--border-radius);
    }

    /* Text element inside column headers */
    table thead .header th span {
        display: inline-block;
        inline-size: 100%;
        line-height: var(--header-height);
        padding: 0;
        margin: 0;
        text-align: center;
        border-right: var(--header-border);
        color: var(--header-text-color);
        font-weight: 500;
        font-size: 1rem;
        white-space: nowrap;
    }

    /* Remove border from header cell */
    table thead .header th span.no-border {
        border-right: none;
    }

    /* Table cell height for node rows */
    table tr td {
        height: 40px;
    }

    /* Column width classes for header cells */
    table th.max-width {
        width: max-content;
        min-width: 200px;
    }

    table th.mid-width {
        width: 175px;
        min-width: 175px;
        max-width: 175px;
    }

    table th.min-width {
        width: 85px;
        min-width: 85px;
        max-width: 85px;
    }

    table th.super-min-width {
        padding: 0;
        margin: 0;
        width: 50px;
        min-width: 50px;
        max-width: 50px;
    }

    /* Sub-section row styling for grouped nodes */
    table .sub-section {
        width: 100%;
        margin: 0;
        padding: 0;
        background-color: var(--sub-section-background-color);
        color: var(--sub-section-text-color);
        border: var(--sub-section-border);
        font-size: 0.9rem;
        border-left: none;
        border-right: none;
    }

    /* Sub-section cell height */
    table .sub-section td {
        height: 35px;
    }

    /* Responsive: reduce row and header height on wide screens */
    @media (min-width: 880px) {
        tr td {
            height: 30px;
        }

        tr th {
            height: 30px;
        }

        table .sub-section td {
            height: 25px;
        }
    }
</style>
