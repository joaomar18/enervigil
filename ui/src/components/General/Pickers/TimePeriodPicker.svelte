<script lang="ts">
    import { onDestroy } from "svelte";
    import { LogSpanPeriod } from "$lib/types/view/nodes";
    import Button from "../Button.svelte";
    import ToolTip from "../ToolTip.svelte";
    import ToolTipText from "../ToolTipText.svelte";
    import DateRangePicker from "../TimeDate/DateRangePicker.svelte";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Styles
    import { PickerToolTipStyle } from "$lib/style/general";
    import { PickerToolTipButtonStyle } from "$lib/style/general";
    import { PickerButtonStyle } from "$lib/style/general";
    import { CustomDateButtonStyle } from "$lib/style/general";
    import { SelectedCustomDateButtonStyle } from "$lib/style/general";
    import DateRangeChecker from "../TimeDate/DateRangeChecker.svelte";

    // Style object (from theme)
    export let toolTipButtonStyle: { [property: string]: string | number } | null = null;
    $: effectiveToolTipButtonStyle = toolTipButtonStyle ?? $PickerToolTipButtonStyle;

    // Props
    export let showSelected: boolean = false;
    export let useToolTip: boolean = true;
    export let selectedTimeSpan: LogSpanPeriod;
    export let initialDate: Date;
    export let endDate: Date;
    export let minClickTimeMs: number = 500; // Filter time for the button click

    // Variables
    let containerDiv: HTMLDivElement;
    let clickEventListenerDefined: boolean = false;
    let showCustomDatePicker: boolean = false;
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
    export let changeSpanPeriod: (timeSpan: LogSpanPeriod) => void;
    export let changeSpanPeriodCustom: (initial_date: Date, end_date: Date) => void;

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
    TimePeriodPicker Component
    
    A time period selection interface supporting dual presentation modes (tooltip-based 
    popup or inline display) for filtering time-series data. Provides predefined quick-select 
    periods (1H, 1D, 7D, 1M, 1Y) with internationalized labels and tooltips, plus custom 
    date range selection via integrated DateRangePicker. Features click-outside dismissal, 
    automatic event listener cleanup, reactive state synchronization, and optional display 
    of the currently selected period range above the period buttons.
-->
<div style="--selected-border-bottom: {$PickerToolTipStyle.border};" class="container" bind:this={containerDiv}>
    {#if useToolTip}
        <ToolTip
            style={$PickerToolTipStyle}
            maxWidth="auto"
            zIndex={198}
            forceShowMobile={true}
            showToolTip={showSelectionToolTip}
            autoPositionContinuous={true}
            alignType="right"
        >
            {#if showSelected}
                <div class="selected-period-div">
                    <DateRangeChecker {initialDate} {endDate} useToolTip={false} />
                </div>
            {/if}
            <div class="period-selection-div" class:using-selected={showSelected}>
                <Button
                    enableToolTip={true}
                    style={$PickerButtonStyle}
                    selected={selectedTimeSpan === LogSpanPeriod.currentHour}
                    buttonText={$texts._1h}
                    onClick={() => changeSpanPeriod(LogSpanPeriod.currentHour)}
                    {minClickTimeMs}
                >
                    <div slot="tooltip"><ToolTipText text={$texts.currentHour} /></div>
                </Button>
                <Button
                    enableToolTip={true}
                    style={$PickerButtonStyle}
                    selected={selectedTimeSpan === LogSpanPeriod.currentDay}
                    buttonText={$texts._1d}
                    onClick={() => changeSpanPeriod(LogSpanPeriod.currentDay)}
                    {minClickTimeMs}
                >
                    <div slot="tooltip"><ToolTipText text={$texts.currentDay} /></div>
                </Button>
                <Button
                    enableToolTip={true}
                    style={$PickerButtonStyle}
                    selected={selectedTimeSpan === LogSpanPeriod.current7Days}
                    buttonText={$texts._7d}
                    onClick={() => changeSpanPeriod(LogSpanPeriod.current7Days)}
                    {minClickTimeMs}
                >
                    <div slot="tooltip"><ToolTipText text={$texts.currentWeek} /></div>
                </Button>
                <Button
                    enableToolTip={true}
                    style={$PickerButtonStyle}
                    selected={selectedTimeSpan === LogSpanPeriod.currentMonth}
                    buttonText={$texts._1M}
                    onClick={() => changeSpanPeriod(LogSpanPeriod.currentMonth)}
                    {minClickTimeMs}
                >
                    <div slot="tooltip"><ToolTipText text={$texts.currentMonth} /></div>
                </Button>
                <Button
                    enableToolTip={true}
                    style={$PickerButtonStyle}
                    selected={selectedTimeSpan === LogSpanPeriod.currentYear}
                    buttonText={$texts._1Y}
                    onClick={() => changeSpanPeriod(LogSpanPeriod.currentYear)}
                    {minClickTimeMs}
                >
                    <div slot="tooltip"><ToolTipText text={$texts.currentYear} /></div>
                </Button>
                <div class="custom-date-div">
                    <Button
                        enableToolTip={true}
                        selected={showCustomDatePicker}
                        style={selectedTimeSpan === LogSpanPeriod.customDate ? $SelectedCustomDateButtonStyle : $CustomDateButtonStyle}
                        buttonText=""
                        imageURL="/img/custom-date.svg"
                        onClick={() => {
                            showCustomDatePicker = !showCustomDatePicker;
                        }}
                    >
                        <div slot="tooltip"><ToolTipText text={$texts.customPeriod} /></div>
                    </Button>
                    <DateRangePicker
                        bind:initialDate
                        bind:endDate
                        bind:showToolTip={showCustomDatePicker}
                        requestCustomPeriod={(initial_date: Date, end_date: Date) => changeSpanPeriodCustom(initial_date, end_date)}
                        {minClickTimeMs}
                    />
                </div>
            </div>
        </ToolTip>

        <Button
            style={effectiveToolTipButtonStyle}
            selected={showSelectionToolTip}
            buttonText=""
            imageURL={"/img/custom-date.svg"}
            enableToolTip={true}
            onClick={() => {
                showSelectionToolTip = !showSelectionToolTip;
            }}
        >
            <div slot="tooltip"><ToolTipText text={$texts.periodSelection} /></div>
        </Button>
    {:else}
        {#if showSelected}
            <div class="selected-period-div">
                <DateRangeChecker {initialDate} {endDate} useToolTip={false} />
            </div>
        {/if}
        <div class="period-selection-div" class:using-selected={showSelected}>
            <Button
                enableToolTip={true}
                style={$PickerButtonStyle}
                selected={selectedTimeSpan === LogSpanPeriod.currentHour}
                buttonText={$texts._1h}
                onClick={() => changeSpanPeriod(LogSpanPeriod.currentHour)}
                {minClickTimeMs}
            >
                <div slot="tooltip"><ToolTipText text={$texts.currentHour} /></div>
            </Button>
            <Button
                enableToolTip={true}
                style={$PickerButtonStyle}
                selected={selectedTimeSpan === LogSpanPeriod.currentDay}
                buttonText={$texts._1d}
                onClick={() => changeSpanPeriod(LogSpanPeriod.currentDay)}
                {minClickTimeMs}
            >
                <div slot="tooltip"><ToolTipText text={$texts.currentDay} /></div>
            </Button>
            <Button
                enableToolTip={true}
                style={$PickerButtonStyle}
                selected={selectedTimeSpan === LogSpanPeriod.current7Days}
                buttonText={$texts._7d}
                onClick={() => changeSpanPeriod(LogSpanPeriod.current7Days)}
                {minClickTimeMs}
            >
                <div slot="tooltip"><ToolTipText text={$texts.currentWeek} /></div>
            </Button>
            <Button
                enableToolTip={true}
                style={$PickerButtonStyle}
                selected={selectedTimeSpan === LogSpanPeriod.currentMonth}
                buttonText={$texts._1M}
                onClick={() => changeSpanPeriod(LogSpanPeriod.currentMonth)}
                {minClickTimeMs}
            >
                <div slot="tooltip"><ToolTipText text={$texts.currentMonth} /></div>
            </Button>
            <Button
                enableToolTip={true}
                style={$PickerButtonStyle}
                selected={selectedTimeSpan === LogSpanPeriod.currentYear}
                buttonText={$texts._1Y}
                onClick={() => changeSpanPeriod(LogSpanPeriod.currentYear)}
                {minClickTimeMs}
            >
                <div slot="tooltip"><ToolTipText text={$texts.currentYear} /></div>
            </Button>
            <div class="custom-date-div">
                <Button
                    enableToolTip={true}
                    selected={showCustomDatePicker}
                    style={selectedTimeSpan === LogSpanPeriod.customDate ? $SelectedCustomDateButtonStyle : $CustomDateButtonStyle}
                    buttonText=""
                    imageURL="/img/custom-date.svg"
                    onClick={() => {
                        showCustomDatePicker = !showCustomDatePicker;
                    }}
                >
                    <div slot="tooltip"><ToolTipText text={$texts.customPeriod} /></div>
                </Button>
                <DateRangePicker
                    bind:initialDate
                    bind:endDate
                    bind:showToolTip={showCustomDatePicker}
                    requestCustomPeriod={(initial_date: Date, end_date: Date) => changeSpanPeriodCustom(initial_date, end_date)}
                    {minClickTimeMs}
                />
            </div>
        </div>
    {/if}
</div>

<style>
    /* Root container - Flex column for stacking optional selected period header and period buttons */
    .container {
        margin: 0;
        padding: 0;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
    }

    /* Selected period header - Displays current date range above period buttons with divider */
    .selected-period-div {
        box-sizing: border-box;
        width: 100%;
        height: fit-content;
        padding-top: 5px;
        padding-left: 5px;
        padding-right: 5px;
        padding-bottom: 10px;
        border-bottom: var(--selected-border-bottom);
    }

    /* Period selection container - Horizontal layout for time period buttons and custom date picker */
    .period-selection-div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        width: fit-content;
        height: fit-content;
    }

    /* Period selection with header - Adds top spacing when selected period header is present */
    .period-selection-div.using-selected {
        padding-top: 10px;
    }

    /* Custom date section - Wrapper for custom date button and integrated DateRangePicker component */
    .custom-date-div {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
