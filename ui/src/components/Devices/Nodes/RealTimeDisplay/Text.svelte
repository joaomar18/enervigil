<script lang="ts">
    import BaseDisplay from "./BaseDisplay.svelte";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { TextDisplayStyle, NodesBaseDisplayStyle } from "$lib/style/nodes";

    // Props
    export let disableLabel: boolean = false;
    export let disableClick: boolean = false;
    export let labelText: string;
    export let value: string | null;
    export let minClickTimeMs: number | undefined = undefined; // Filter time for the button click

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    export let baseDisplayStyle: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $TextDisplayStyle;
    $: baseDisplayStyle = baseDisplayStyle ?? $NodesBaseDisplayStyle;

    // Layout / styling props
    export let valueTextSize: string | undefined = undefined;
    export let valueTextColor: string | undefined = undefined;
    export let valueTextSpacing: string | undefined = undefined;
    export let valueTextWeight: string | undefined = undefined;
    export let valueTextPaddingRight: string | undefined = undefined;

    $: localOverrides = {
        valueTextSize,
        valueTextColor,
        valueTextSpacing,
        valueTextWeight,
        valueTextPaddingRight,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let valueDisconnected: boolean = false;

    // Reactive Statements
    $: valueDisconnected = value === null;

    // Click Export Function
    export let onClick: (() => void) | null = null;
</script>

<!--
    Text Component
    
    A real-time text display component for string-based device information and status values.
    Features text formatting, disconnection state handling, and overflow management for
    industrial text data such as device status, operating modes, alarm messages, and
    configuration strings. Extends BaseDisplay for consistent styling and interaction
    patterns while providing text-specific formatting and visualization.
-->
<BaseDisplay style={baseDisplayStyle} {disableLabel} {disableClick} {labelText} {valueDisconnected} {minClickTimeMs} {onClick}>
    <div
        style="
            --value-text-size: {mergedStyle.valueTextSize};
            --value-text-color: {mergedStyle.valueTextColor};
            --value-text-spacing: {mergedStyle.valueTextSpacing};
            --value-text-weight: {mergedStyle.valueTextWeight};
            --value-text-padding-right: {mergedStyle.valueTextPaddingRight};
        "
        class="slot-content"
        slot="content"
    >
        <div class="value-div">
            {#if !valueDisconnected}
                <span class="value">{value}</span>
            {/if}
        </div>
    </div>
</BaseDisplay>

<style>
    /* Main content container - Horizontal layout for text value display */
    .slot-content {
        margin: 0;
        padding: 0;
        position: relative;
        width: 100%;
        height: 100%;
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    /* Text value container - Fixed-width area for string content with overflow handling */
    .value-div {
        box-sizing: border-box;
        padding: 0;
        padding-right: var(--value-text-padding-right);
        width: 70%;
        min-width: 0;
        line-height: 1;
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
    }

    /* Text value display - Styled string content with ellipsis truncation for long text */
    .value-div .value {
        font-size: var(--value-text-size);
        color: var(--value-text-color);
        letter-spacing: var(--value-text-spacing);
        font-weight: var(--value-text-weight);
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
        line-height: 1;
    }
</style>
