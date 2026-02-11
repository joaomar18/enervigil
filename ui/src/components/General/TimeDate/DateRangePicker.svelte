<script lang="ts">
    import { onDestroy } from "svelte";
    import { createDateTimeField, getDateFromField } from "$lib/logic/util/date";
    import { validTimeSpan } from "$lib/logic/validation/date";
    import ToolTip from "../ToolTip.svelte";
    import Button from "../Button.svelte";
    import TimeField from "./TimeField.svelte";
    import DateField from "./DateField.svelte";
    import FormAlert from "../FormAlert.svelte";
    import type { DateTimeSpanValidation } from "$lib/types/date";

    // Stores
    import { AlertType } from "$lib/stores/view/toast";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";
    import { generalAlertTexts } from "$lib/stores/lang/alertTexts";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { DateRangePickerStyle, ToolTipDatePickerStyle } from "$lib/style/general";
    import { SubPrimaryButtonStyle, SubDefaultButtonStyle } from "$lib/style/button";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $DateRangePickerStyle;

    // Props
    export let showToolTip: boolean;
    export let enableSpanChange: boolean = true;
    export let initialDate: Date | null;
    export let endDate: Date | null;
    export let minClickTimeMs: number | undefined = undefined; // Filter time for the button click

    // Layout / styling props
    export let paddingHorizontal: string | undefined = undefined;
    export let paddingTop: string | undefined = undefined;
    export let paddingBottom: string | undefined = undefined;
    export let labelSize: string | undefined = undefined;
    export let labelColor: string | undefined = undefined;
    export let labelWeight: string | undefined = undefined;
    export let labelPaddingLeft: string | undefined = undefined;
    export let contentGap: string | undefined = undefined;
    export let fieldGap: string | undefined = undefined;
    export let rowGap: string | undefined = undefined;
    export let buttonsPaddingTop: string | undefined = undefined;
    export let buttonsGap: string | undefined = undefined;

    $: localOverrides = {
        paddingHorizontal,
        paddingTop,
        paddingBottom,
        labelSize,
        labelColor,
        labelWeight,
        labelPaddingLeft,
        contentGap,
        fieldGap,
        rowGap,
        buttonsPaddingTop,
        buttonsGap,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let containerDiv: HTMLDivElement;
    let clickEventListenerDefined: boolean = false;
    let startDateTime = createDateTimeField();
    let endDateTime = createDateTimeField();
    let validation: DateTimeSpanValidation;
    let messageKey: string | null = null;
    let messageVariables: Record<string, string | number>;
    let firstRequestDone: boolean = false;
    let processingRequest: boolean = false;
    let minClickTimeout: ReturnType<typeof setTimeout> | null = null;

    // Reactive Statements
    $: if (!showToolTip && clickEventListenerDefined) {
        window.removeEventListener("click", handleClickOutside);
        clickEventListenerDefined = false;
    }
    $: if (showToolTip && !clickEventListenerDefined) {
        requestAnimationFrame(() => {
            window.addEventListener("click", handleClickOutside);
            clickEventListenerDefined = true;
        });
    }
    $: if (enableSpanChange) startDateTime = createDateTimeField(initialDate);
    $: if (enableSpanChange) endDateTime = createDateTimeField(endDate);

    $: ({ validation, messageKey, messageVariables } = validTimeSpan(startDateTime, endDateTime));

    // Export Functions
    export let requestCustomPeriod: (initial_date: Date, end_date: Date) => void;

    // Functions
    function handleClickOutside(event: MouseEvent): void {
        if (showToolTip && containerDiv && !containerDiv.contains(event.target as Node)) {
            showToolTip = false;
        }
    }

    function handleConfirm(): void {
        firstRequestDone = true;
        if (!validation || !validation.valid || minClickTimeout !== null) {
            return;
        }
        processingRequest = true;
        requestCustomPeriod(getDateFromField(startDateTime), getDateFromField(endDateTime));
        processingRequest = false;
        if (minClickTimeMs != undefined) setClickTimeout();
        showToolTip = false;
    }

    function resetClickTimeout(): void {
        if (minClickTimeout !== null) {
            clearTimeout(minClickTimeout);
            minClickTimeout = null;
        }
    }

    function setClickTimeout(): void {
        resetClickTimeout();
        if (minClickTimeMs != undefined) minClickTimeout = setTimeout(() => resetClickTimeout(), minClickTimeMs);
    }

    onDestroy(() => {
        if (clickEventListenerDefined) {
            window.removeEventListener("click", handleClickOutside);
        }
        resetClickTimeout();
    });
</script>

<!--
    DateRangePicker Component
    
    A comprehensive date range picker with time selection capabilities and validation.
    Features separate date and time field inputs for start and end periods, built-in
    validation for time span logic, and form submission handling. Supports click-outside
    detection, custom period requests, and comprehensive theming through CSS custom properties.
    Integrates FormAlert for user feedback and provides seamless date-time field management.
-->

<ToolTip style={$ToolTipDatePickerStyle} autoPositionContinuous={true} zIndex={198} {showToolTip} forceShowMobile={true} alignType="right">
    <div
        style="
            --padding-horizontal: {mergedStyle.paddingHorizontal};
            --padding-top: {mergedStyle.paddingTop};
            --padding-bottom: {mergedStyle.paddingBottom};
            --label-size: {mergedStyle.labelSize};
            --label-color: {mergedStyle.labelColor};
            --label-weight: {mergedStyle.labelWeight};
            --label-padding-left: {mergedStyle.labelPaddingLeft};
            --content-gap: {mergedStyle.contentGap};
            --field-gap: {mergedStyle.fieldGap};
            --row-gap: {mergedStyle.rowGap};
            --buttons-padding-top: {mergedStyle.buttonsPaddingTop};
            --buttons-gap: {mergedStyle.buttonsGap};
        "
        bind:this={containerDiv}
        class="date-picker-div"
    >
        <div class="content">
            {#if firstRequestDone && !validation?.valid}
                <FormAlert alertText={$generalAlertTexts[messageKey || "noKeyError"]} alertType={AlertType.ALERT} alertVariables={messageVariables} />
            {/if}

            <div class="field">
                <span>{$texts.fromDate}</span>
                <div class="row">
                    <div class="extend">
                        <DateField
                            bind:yearValue={startDateTime.year}
                            bind:monthValue={startDateTime.month}
                            bind:dayValue={startDateTime.day}
                            invalidInput={!validation?.validStartDate || validation?.invalidRange}
                            enableInvalidInput={firstRequestDone}
                            submit={handleConfirm}
                        />
                    </div>
                    <TimeField
                        bind:hourValue={startDateTime.hour}
                        bind:minuteValue={startDateTime.minute}
                        useSecond={false}
                        width="35%"
                        invalidInput={!validation?.validStartTime || validation?.invalidRange}
                        enableInvalidInput={firstRequestDone}
                        submit={handleConfirm}
                    />
                </div>
            </div>
            <div class="field">
                <span>{$texts.toDate}</span>
                <div class="row">
                    <div class="extend">
                        <DateField
                            bind:yearValue={endDateTime.year}
                            bind:monthValue={endDateTime.month}
                            bind:dayValue={endDateTime.day}
                            invalidInput={!validation?.validEndDate || validation?.invalidRange}
                            enableInvalidInput={firstRequestDone}
                            submit={handleConfirm}
                        />
                    </div>
                    <TimeField
                        bind:hourValue={endDateTime.hour}
                        bind:minuteValue={endDateTime.minute}
                        useSecond={false}
                        width="35%"
                        invalidInput={!validation?.validEndTime || validation?.invalidRange}
                        enableInvalidInput={firstRequestDone}
                        submit={handleConfirm}
                    />
                </div>
            </div>
            <div class="action-buttons-div">
                <Button processing={processingRequest} buttonText={$texts.confirm} style={$SubPrimaryButtonStyle} onClick={handleConfirm} />
                <Button
                    buttonText={$texts.cancel}
                    style={$SubDefaultButtonStyle}
                    onClick={() => {
                        showToolTip = false;
                    }}
                />
            </div>
        </div>
    </div>
</ToolTip>

<style>
    /* Main container - Full date picker tooltip content area with configurable padding */
    .date-picker-div {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding-top: var(--padding-top);
        padding-bottom: var(--padding-bottom);
        padding-left: var(--padding-horizontal);
        padding-right: var(--padding-horizontal);
        container-type: inline-size;
    }

    /* Content wrapper - Vertical flexbox container for all picker elements */
    .content {
        margin: 0;
        padding: 0;
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        gap: var(--content-gap);
    }

    /* Field container - Groups label and input controls for each date/time section */
    .content .field {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: start;
        gap: var(--field-gap);
    }

    /* Field label text - Styled labels for "Start Date", "End Date", etc. */
    .content .field span {
        font-size: var(--label-size);
        color: var(--label-color);
        font-weight: var(--label-weight);
        padding: 0;
        padding-left: var(--label-padding-left);
    }

    /* Input row - Horizontal layout for date and time field pairs */
    .content .field .row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
        height: fit-content;
        align-items: center;
        gap: var(--row-gap);
    }

    /* Flexible input container - Expandable area for date/time input components */
    .content .field .row .extend {
        flex: 1;
        min-width: 0;
        height: fit-content;
    }

    /* Action buttons container - Horizontal layout for Cancel/Apply buttons */
    .content .action-buttons-div {
        padding-top: var(--buttons-padding-top);
        display: flex;
        flex-direction: row;
        gap: var(--buttons-gap);
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
    }
</style>
