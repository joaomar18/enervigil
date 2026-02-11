<script lang="ts">
    import { onDestroy } from "svelte";
    import { EnergyDirectionFilter, SelectablePhaseFilter, LogSpanPeriod } from "$lib/types/view/nodes";
    import Button from "../Button.svelte";
    import ToolTip from "../ToolTip.svelte";
    import ToolTipText from "../ToolTipText.svelte";
    import Selector from "../Selector.svelte";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";
    import { phaseTexts } from "$lib/stores/lang/energyMeterTexts";
    import { directionTexts } from "$lib/stores/lang/energyMeterTexts";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { EnergyPickersStyle } from "$lib/style/general";
    import { PickerToolTipStyle } from "$lib/style/general";
    import { PickerToolTipButtonStyle } from "$lib/style/general";
    import { PickerSelectorStyle } from "$lib/style/general";
    import TimePeriodPicker from "./TimePeriodPicker.svelte";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    export let toolTipButtonStyle: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $EnergyPickersStyle;
    $: effectiveToolTipButtonStyle = toolTipButtonStyle ?? $PickerToolTipButtonStyle;

    // Props
    export let selectedPhase: SelectablePhaseFilter | undefined = undefined;
    export let selectedDirection: EnergyDirectionFilter | undefined = undefined;
    export let selectedTimeSpan: LogSpanPeriod | undefined = undefined;
    export let initialDate: Date | undefined = undefined;
    export let endDate: Date | undefined = undefined;
    export let usePhase: boolean = true;
    export let useDirection: boolean = true;
    export let useTimeSpan: boolean = true;
    export let showCurrentTimeSpan: boolean = true;
    export let minClickTimeMs: number = 500; // Filter time for the button click

    // Layout / styling props
    export let labelSize: string | undefined = undefined;
    export let labelWeight: string | undefined = undefined;
    export let labelColor: string | undefined = undefined;
    export let labelHeight: string | undefined = undefined;

    $: localOverrides = {
        labelSize,
        labelWeight,
        labelColor,
        labelHeight,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let containerDiv: HTMLDivElement;
    let clickEventListenerDefined: boolean = false;
    let showSelectionToolTip: boolean = false;

    // Reactive Statements
    $: if (!showSelectionToolTip && clickEventListenerDefined) {
        window.removeEventListener("click", handleClickOutside);
        clickEventListenerDefined = false;
    }
    $: if (showSelectionToolTip && !clickEventListenerDefined) {
        requestAnimationFrame(() => {
            window.addEventListener("click", handleClickOutside);
            clickEventListenerDefined = true;
        });
    }

    // Export Functions
    export let changePhase: ((selectedPhase: SelectablePhaseFilter) => void) | null = null;
    export let changeEnergyDirection: ((selectedDirection: EnergyDirectionFilter) => void) | null = null;
    export let changeSpanPeriod: ((timeSpan: LogSpanPeriod) => void) | null = null;
    export let changeSpanPeriodCustom: ((initial_date: Date, end_date: Date) => void) | null = null;

    // Functions
    function handleClickOutside(event: MouseEvent): void {
        if (showSelectionToolTip && containerDiv && !containerDiv.contains(event.target as Node)) {
            showSelectionToolTip = false;
        }
    }

    onDestroy(() => {
        if (clickEventListenerDefined) {
            window.removeEventListener("click", handleClickOutside);
        }
    });
</script>

<!--
    EnergyPickers - Consolidated filter panel for energy consumption graphs
    
    Displays a tooltip with multiple filter controls: electrical phase (L1/L2/L3/Total),
    energy direction (Forward/Reverse/Total), and time period picker (1H/1D/7D/1M/1A/custom).
    Triggers via a single filter button, reducing header clutter while grouping related settings.
-->
<div
    style="
        --label-size: {mergedStyle.labelSize};
        --label-weight: {mergedStyle.labelWeight};
        --label-color: {mergedStyle.labelColor};
        --label-height: {mergedStyle.labelHeight};
    "
    bind:this={containerDiv}
>
    <ToolTip
        style={$PickerToolTipStyle}
        maxHeight="auto"
        maxWidth="auto"
        zIndex={198}
        forceShowMobile={true}
        showToolTip={showSelectionToolTip}
        autoPositionContinuous={true}
        alignType="right"
    >
        <div class="content">
            {#if usePhase}
                <div class="phase-selection-div">
                    <h3>{$texts.phase}</h3>
                    <Selector
                        style={$PickerSelectorStyle}
                        options={$phaseTexts}
                        bind:selectedOption={selectedPhase}
                        onChange={() => {
                            if (selectedPhase && changePhase) changePhase(selectedPhase);
                        }}
                        scrollable={true}
                    />
                </div>
            {/if}
            {#if useDirection}
                <div class="direction-selection-div">
                    <h3>{$texts.energyDirectionShort}</h3>
                    <Selector
                        style={$PickerSelectorStyle}
                        options={$directionTexts}
                        bind:selectedOption={selectedDirection}
                        onChange={() => {
                            if (selectedDirection && changeEnergyDirection) changeEnergyDirection(selectedDirection);
                        }}
                        scrollable={true}
                    />
                </div>
            {/if}
            {#if useTimeSpan && selectedTimeSpan && initialDate && endDate && changeSpanPeriod && changeSpanPeriodCustom}
                <div class="time-period-picker-div">
                    <h3 class="extend">{$texts.timePeriod}</h3>
                    <TimePeriodPicker
                        showSelected={showCurrentTimeSpan}
                        useToolTip={false}
                        bind:selectedTimeSpan
                        bind:initialDate
                        bind:endDate
                        changeSpanPeriod={(timeSpan: LogSpanPeriod) => changeSpanPeriod(timeSpan)}
                        changeSpanPeriodCustom={(initial_date: Date, end_date: Date) => changeSpanPeriodCustom(initial_date, end_date)}
                        {minClickTimeMs}
                    />
                </div>
            {/if}
        </div>
    </ToolTip>
    <Button
        style={effectiveToolTipButtonStyle}
        imageURL="/img/filter.svg"
        buttonText=""
        selected={showSelectionToolTip}
        enableToolTip={true}
        onClick={() => {
            showSelectionToolTip = !showSelectionToolTip;
        }}
    >
        <div slot="tooltip"><ToolTipText text={$texts.filters} /></div>
    </Button>
</div>

<style>
    /* Main container for all filter controls - vertical layout with spacing */
    .content {
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: fit-content;
        height: fit-content;
        gap: 10px;
    }

    /* Label styling for filter section headers (Phase, Direction, Period) */
    h3 {
        padding: 0;
        margin: 0;
        width: 100px;
        line-height: var(--label-height);
        font-size: var(--label-size);
        font-weight: var(--label-weight);
        color: var(--label-color);
    }

    /* Extended label variant with full width and bottom border for time period section */
    h3.extend {
        width: 100%;
        text-align: left;
        border-bottom: var(--border);
    }

    /* Container for phase selector with horizontal layout (label + dropdown) */
    .phase-selection-div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        width: 100%;
        height: fit-content;
    }

    /* Container for direction selector with horizontal layout (label + dropdown) */
    .direction-selection-div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        width: 100%;
        height: fit-content;
    }

    /* Container for time period picker with vertical layout (label above picker buttons) */
    .time-period-picker-div {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        gap: 10px;
        height: fit-content;
    }
</style>
