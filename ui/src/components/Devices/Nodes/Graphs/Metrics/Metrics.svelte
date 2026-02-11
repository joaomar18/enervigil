<script lang="ts">
    import InlineLoader from "../../../../General/InlineLoader.svelte";
    import type { NodeCategory } from "$lib/types/nodes/base";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { GraphMetricStyle } from "$lib/style/graph";
    import { onDestroy, onMount } from "svelte";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $GraphMetricStyle;

    // Props
    export let metricsVariables: Record<string, { textKey: string; imageFile: string; value: any }>;
    export let unit: string = "";
    export let dataFetched: boolean;
    export let firstFetch: boolean;
    export let metricsCategory: NodeCategory;
    export let previousCategory: NodeCategory | undefined;
    export let metricsTimeoutMs: number = 1000;

    // Layout / styling props
    export let iconSize: string | undefined = undefined;
    export let textSize: string | undefined = undefined;
    export let rowWidth: string | undefined = undefined;
    export let rowPaddingLeft: string | undefined = undefined;
    export let rowPaddingRight: string | undefined = undefined;
    export let rowBorderRight: string | undefined = undefined;
    export let labelWidth: string | undefined = undefined;
    export let labelPaddingLeft: string | undefined = undefined;
    export let labelColor: string | undefined = undefined;
    export let labelWeight: string | undefined = undefined;
    export let valueRightPadding: string | undefined = undefined;
    export let valueColor: string | undefined = undefined;
    export let valueWeight: string | undefined = undefined;
    export let unitMaxWidth: string | undefined = undefined;
    export let unitColor: string | undefined = undefined;
    export let unitWeight: string | undefined = undefined;
    export let noDataLabelColor: string | undefined = undefined;
    export let noDataLabelWeight: string | undefined = undefined;

    $: localOverrides = {
        iconSize,
        textSize,
        rowWidth,
        rowPaddingLeft,
        rowPaddingRight,
        rowBorderRight,
        labelWidth,
        labelPaddingLeft,
        labelColor,
        labelWeight,
        valueRightPadding,
        valueColor,
        valueWeight,
        unitMaxWidth,
        unitColor,
        unitWeight,
        noDataLabelColor,
        noDataLabelWeight,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let showLoader = false;
    let colStackWidthReached = false;
    let forceColStack = false;
    let colStack = false;
    let loaderTimeout: number | null = null;
    let numberOfVariables: number;
    let containerEl: HTMLDivElement;

    // Reactive Statements
    $: forceColStack = String(mergedStyle.forceCollapse) === "TRUE";
    $: colStack = forceColStack || colStackWidthReached;
    $: numberOfVariables = Object.keys(metricsVariables).length;
    $: if (!dataFetched && !showLoader) {
        if (firstFetch && previousCategory === metricsCategory) {
            loaderTimeout = setTimeout(() => {
                showLoader = !dataFetched;
            }, metricsTimeoutMs);
        } else {
            showLoader = true;
        }
    }
    $: if (dataFetched) {
        if (loaderTimeout) {
            clearInterval(loaderTimeout);
            loaderTimeout = null;
        }
        showLoader = false;
        previousCategory = metricsCategory;
    }
    $: if (containerEl) {
        requestAnimationFrame(() => handleColumnStack());
    }

    // Functions
    function handleColumnStack(): void {
        if (containerEl && numberOfVariables) {
            colStackWidthReached = containerEl.offsetWidth < parseInt(String(mergedStyle.rowWidth)) * numberOfVariables;
        }
    }

    onMount(() => {
        window.addEventListener("resize", handleColumnStack);
    });

    onDestroy(() => {
        window.removeEventListener("resize", handleColumnStack);
    });
</script>

<!--
    Metrics Component
    
    A flexible metrics display component that renders node measurement data with internationalized
    labels, icons, and loading states. Features dynamic metric rendering based on node category
    using metricsVariables mapping, responsive layout with container queries, and comprehensive
    theming support. Handles loading states with delayed loaders for improved UX, provides
    null value handling with fallback messaging, and supports both horizontal and forced
    vertical stacking layouts. Integrates with InlineLoader for smooth loading transitions
    and maintains consistent typography and spacing across different metric types.
-->
<div
    style="
        --icon-size: {mergedStyle.iconSize};
        --text-size: {mergedStyle.textSize};
        --row-width: {mergedStyle.rowWidth};
        --row-padding-left: {mergedStyle.rowPaddingLeft};
        --row-padding-right: {mergedStyle.rowPaddingRight};
        --row-border-right: {mergedStyle.rowBorderRight};
        --label-width: {mergedStyle.labelWidth};
        --label-padding-left: {mergedStyle.labelPaddingLeft};
        --label-color: {mergedStyle.labelColor};
        --label-weight: {mergedStyle.labelWeight};
        --value-right-padding: {mergedStyle.valueRightPadding};
        --value-color: {mergedStyle.valueColor};
        --value-weight: {mergedStyle.valueWeight};
        --unit-max-width: {mergedStyle.unitMaxWidth};
        --unit-color: {mergedStyle.unitColor};
        --unit-weight: {mergedStyle.unitWeight};
        --no-data-label-color: {mergedStyle.noDataLabelColor};
        --no-data-label-weight: {mergedStyle.noDataLabelWeight};
        --number-variables: {numberOfVariables};
    "
    bind:this={containerEl}
    class="container"
    class:col-stack={colStack}
>
    <div class="content">
        {#each Object.entries(metricsVariables) as [key, metricVar] (metricVar.textKey)}
            <div class="row">
                <img class="icon" src={"/img/" + metricVar.imageFile} alt={metricVar.textKey} />
                <span class="label">{$texts[metricVar.textKey]}:</span>
                <div class="request-content">
                    <InlineLoader loaded={!showLoader}>
                        <div class="loader-div">
                            {#if key in metricsVariables}
                                {#if metricVar.value !== null}
                                    <span class="value">{metricVar.value}</span>
                                    <span class="unit">{unit}</span>
                                {:else}
                                    <span class="no-data-label">{$texts.noDataAvailableShort}</span>
                                {/if}
                            {/if}
                        </div>
                    </InlineLoader>
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    /* Display metrics on a column stack */
    .container.col-stack {
        .content {
            flex-direction: column;
            gap: 15px;
            align-items: start;
        }
        .row {
            width: 100%;
            padding: 0;
            border-right: none;
        }
    }

    /* Content wrapper - Flex container for metric rows with responsive direction */
    .content {
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
    }

    /* Metric row - Individual stat display with icon, label, value, and unit */
    .row {
        box-sizing: border-box;
        margin: 0;
        width: var(--row-width);
        padding-left: var(--row-padding-left);
        padding-right: var(--row-padding-right);
        border-right: var(--row-border-right);
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    /* Remove left padding from the first row child */
    .row:first-child {
        padding-left: 0;
    }

    /* Remove border and padding right from last row - Prevents trailing divider */
    .row:last-child {
        padding-right: 0;
        border-right: none;
    }

    /* Metric icon - Visual indicator for metric type (varies by node category) */
    .row .icon {
        width: var(--icon-size);
        height: var(--icon-size);
    }

    /* Metric label - Descriptive text with consistent spacing and typography */
    .row .label {
        text-align: left;
        padding-left: var(--label-padding-left);
        line-height: var(--icon-size);
        font-size: var(--text-size);
        width: var(--label-width);
        color: var(--label-color);
        font-weight: var(--label-weight);
    }

    /* Request content wrapper - Container for value/unit with loading state support */
    .row .request-content {
        min-width: 0;
        flex: 1;
        height: 100%;
    }

    /* Loader content layout - Flex container for value and unit with space distribution */
    .row .request-content .loader-div {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    /* Metric value - Numerical data with flexible width and ellipsis overflow */
    .row .request-content .loader-div .value {
        text-align: right;
        font-size: var(--text-size);
        padding-right: var(--value-right-padding);
        line-height: var(--icon-size);
        min-width: 0;
        flex: 1;
        color: var(--value-color);
        font-weight: var(--value-weight);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Metric unit - Measurement unit display (kWh, VArh, A, etc.) with constrained width */
    .row .request-content .loader-div .unit {
        text-align: right;
        font-size: var(--text-size);
        line-height: var(--icon-size);
        min-width: 0;
        width: fit-content;
        max-width: var(--unit-max-width);
        color: var(--unit-color);
        font-weight: var(--unit-weight);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* No-data indicator - Fallback text displayed when metric values are null */
    .row .request-content .loader-div .no-data-label {
        text-align: right;
        font-size: var(--text-size);
        line-height: var(--icon-size);
        width: fit-content;
        color: var(--no-data-label-color);
        font-weight: var(--no-data-label-weight);
        width: 100%;
    }
</style>
