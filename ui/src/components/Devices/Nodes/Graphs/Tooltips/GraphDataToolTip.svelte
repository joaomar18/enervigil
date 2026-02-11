<script lang="ts">
    import type { BaseLogPoint } from "$lib/types/nodes/logs";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { GraphDataToolTipStyle } from "$lib/style/graph";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $GraphDataToolTipStyle;

    // Props
    export let logPoint: BaseLogPoint | null;
    export let dataAvailable: boolean;

    // Layout / styling props
    export let rowGap: string | undefined = undefined;
    export let textSize: string | undefined = undefined;
    export let labelWidth: string | undefined = undefined;
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
        rowGap,
        textSize,
        labelWidth,
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
</script>

<!--
    GraphDataToolTip Component
    
    A specialized tooltip component for displaying graph data point information with formatted
    date ranges and conditional data availability states. Features a flexible slot-based layout
    for custom measurement display content, automatic no-data messaging, and comprehensive
    typography theming. Provides structured label-value pairs with overflow handling,
    responsive text sizing, and accessibility-friendly contrast controls. Handles conditional
    rendering based on log point availability and integrates with internationalization
    for date range labels and status messages.
-->
{#if logPoint}
    <div
        style="
            --row-gap: {mergedStyle.rowGap};
            --text-size: {mergedStyle.textSize};
            --label-width: {mergedStyle.labelWidth};
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
        "
        class="container"
    >
        <div class="content">
            <slot />
            {#if !dataAvailable}
                <div class="row">
                    <span class="value no-data-label center">{$texts.noDataAvailableShort}</span>
                </div>
            {/if}
            <div class="row">
                <span class="label">{$texts.fromDate}</span>
                <span class="value no-padding">{logPoint.start_time}</span>
            </div>
            <div class="row">
                <span class="label">{$texts.toDate}</span>
                <span class="value no-padding">{logPoint.end_time}</span>
            </div>
        </div>
    </div>
{/if}

<style>
    /* Content container - Vertical flexbox layout for measurement data rows */
    .content {
        margin: 0;
        padding: 0;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        gap: var(--row-gap);
    }

    /* Data row - Horizontal layout for label, value, and unit triplets */
    .row {
        width: 100%;
        height: fit-content;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    /* Measurement label - Fixed width area for abbreviated labels (Máx, Méd, Mín) */
    .label {
        text-align: left;
        width: var(--label-width);
        font-size: var(--text-size);
        color: var(--label-color);
        font-weight: var(--label-weight);
    }

    /* Measurement value - Flexible area for numeric data with ellipsis overflow */
    .value {
        min-width: 0;
        padding: 0;
        padding-right: var(--value-right-padding);
        flex: 1;
        text-align: right;
        font-size: var(--text-size);
        color: var(--value-color);
        font-weight: var(--value-weight);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* No-data state modifier - Applied when measurement values are null */
    .value.no-data-label {
        color: var(--no-data-label-color);
        font-weight: var(--no-data-label-weight);
    }

    /* Center alignment modifier - Used for special cases like time ranges */
    .value.center {
        text-align: center;
    }

    /* No padding modifier - Removes right padding for specific layouts */
    .value.no-padding {
        padding: 0;
    }
</style>
