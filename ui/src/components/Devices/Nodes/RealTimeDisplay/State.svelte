<script lang="ts">
    import BaseDisplay from "./BaseDisplay.svelte";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { StateDisplayStyle, NodesBaseDisplayStyle } from "$lib/style/nodes";

    // Props
    export let disableLabel: boolean = false;
    export let disableClick: boolean = false;
    export let labelText: string;
    export let value: boolean | null;
    export let minClickTimeMs: number | undefined = undefined; // Filter time for the button click

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    export let baseDisplayStyle: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $StateDisplayStyle;
    $: baseDisplayStyle = baseDisplayStyle ?? $NodesBaseDisplayStyle;

    // Layout / styling props
    export let valueTextSize: string | undefined = undefined;
    export let falseValueTextColor: string | undefined = undefined;
    export let trueValueTextColor: string | undefined = undefined;
    export let valueTextSpacing: string | undefined = undefined;
    export let valueTextWeight: string | undefined = undefined;

    $: localOverrides = {
        valueTextSize,
        falseValueTextColor,
        trueValueTextColor,
        valueTextSpacing,
        valueTextWeight,
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
    State Component

    A real-time boolean state display component for binary device signals and flags.
    Designed for neutral, context-agnostic state visualization where TRUE/FALSE does
    not inherently imply success or failure. The component emphasizes presence and
    inactivity through subtle visual hierarchy rather than semantic color coding.

    Supports disconnection handling, configurable typography, and theme-based styling.
    Intended for use with digital inputs, status flags, protection states, and other
    boolean process signals. Extends BaseDisplay to ensure consistent layout, interaction,
    and state handling across the monitoring interface.
-->
<BaseDisplay style={baseDisplayStyle} {disableLabel} {disableClick} {labelText} {valueDisconnected} {minClickTimeMs} {onClick}>
    <div
        style="
            --value-text-size: {mergedStyle.valueTextSize};
            --false-value-text-color: {mergedStyle.falseValueTextColor};
            --true-value-text-color: {mergedStyle.trueValueTextColor};
            --value-text-spacing: {mergedStyle.valueTextSpacing};
            --value-text-weight: {mergedStyle.valueTextWeight};
        "
        class="slot-content"
        slot="content"
    >
        <div class="value-div">
            {#if !valueDisconnected}
                <span class="value" class:true={!!value}>{value ? "TRUE" : "FALSE"}</span>
            {/if}
        </div>
    </div>
</BaseDisplay>

<style>
    /* Main content container - Horizontal layout for centered state indication */
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

    /* State value container - Full-width area with centered alignment */
    .value-div {
        box-sizing: border-box;
        padding: 0;
        width: 100%;
        min-width: 0;
        line-height: 1;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    /* State value text - Neutral boolean representation (FALSE by default) */
    .value-div .value {
        font-size: var(--value-text-size);
        color: var(--false-value-text-color);
        letter-spacing: var(--value-text-spacing);
        font-weight: var(--value-text-weight);
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
        line-height: 1;
    }

    /* TRUE state modifier - Slightly higher visual presence without semantic coloring */
    .value-div .value.true {
        color: var(--true-value-text-color);
    }
</style>
