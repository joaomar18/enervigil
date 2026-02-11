<script lang="ts">
    import { interpretYY, getShortYear } from "$lib/logic/util/date";
    import { getDaysInMonth } from "$lib/logic/util/date";
    import InputField from "../InputField.svelte";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { InputDateTimeFieldStyle, TimeDateFieldStyle } from "$lib/style/general";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $TimeDateFieldStyle;

    // Props
    export let yearValue: string = "";
    export let monthValue: string = "";
    export let dayValue: string = "";
    export let useYear: boolean = true;
    export let useMonth: boolean = true;
    export let useDay: boolean = true;
    export let invalidInput: boolean = false;
    export let enableInvalidInput: boolean = true;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let borderRadius: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let selectedBackgroundColor: string | undefined = undefined;
    export let badFormatBackgroundColor: string | undefined = undefined;
    export let border: string | undefined = undefined;
    export let selectedBorder: string | undefined = undefined;
    export let badFormatBorder: string | undefined = undefined;
    export let textSize: string | undefined = undefined;
    export let textColor: string | undefined = undefined;
    export let textWeight: string | undefined = undefined;

    $: localOverrides = {
        width,
        height,
        borderRadius,
        backgroundColor,
        selectedBackgroundColor,
        badFormatBackgroundColor,
        border,
        selectedBorder,
        badFormatBorder,
        textSize,
        textColor,
        textWeight,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let yearsId: string = "YY";
    let monthsId: string = "MM";
    let daysId: string = "DD";
    let formatterSep: string = "-";
    let selected: boolean = false;
    let shortYear: string = "";
    let daysInMonth: number;

    // Reactive Statements
    $: shortYear = getShortYear(yearValue);
    $: if (Number(monthValue) >= 1 && Number(monthValue) <= 12) {
        daysInMonth = getDaysInMonth(Number(yearValue), Number(monthValue));
    }

    // Export Functions
    export let submit: (() => void) | undefined = undefined;

    // Functions
    function handleEnter(): void {
        if (submit) {
            submit();
        }
    }
</script>

<!--
    DateField Component
    
    A flexible date input component that allows selective display of year, month, and day fields.
    Features smart 2-digit year conversion, dynamic day validation based on month/year, and 
    comprehensive styling support. Handles focus states, validation errors, and provides
    seamless integration with form validation systems. Each field can be individually
    enabled/disabled and supports theming through CSS custom properties.
-->
<div
    style="
        --width: {mergedStyle.width};
        --height: {mergedStyle.height};
        --border-radius: {mergedStyle.borderRadius};
        --background-color: {mergedStyle.backgroundColor};
        --selected-background-color: {mergedStyle.selectedBackgroundColor};
        --bad-format-background-color: {mergedStyle.badFormatBackgroundColor};
        --border: {mergedStyle.border};
        --selected-border: {mergedStyle.selectedBorder};
        --bad-format-border: {mergedStyle.badFormatBorder};
        --text-size: {mergedStyle.textSize};
        --text-color: {mergedStyle.textColor};
        --text-weight: {mergedStyle.textWeight};
    "
    class="input-time-div"
    class:bad-format={invalidInput && enableInvalidInput}
    class:selected
>
    <div class="content">
        {#if useYear}
            <InputField
                style={$InputDateTimeFieldStyle}
                bind:inputValue={shortYear}
                inputType="POSITIVE_INT"
                placeHolderText={yearsId}
                zeroPaddingDigits={2}
                disableHints={true}
                minValue={0}
                maxValue={99}
                onSelected={() => {
                    selected = true;
                }}
                onBlur={() => {
                    selected = false;
                }}
                onChange={() => {
                    yearValue = interpretYY(shortYear);
                }}
                onEnterKey={handleEnter}
            />
            {#if useMonth}
                <span class="separator">{formatterSep}</span>
            {/if}
        {/if}
        {#if useMonth}
            <InputField
                style={$InputDateTimeFieldStyle}
                bind:inputValue={monthValue}
                inputType="POSITIVE_INT"
                placeHolderText={monthsId}
                zeroPaddingDigits={2}
                disableHints={true}
                minValue={1}
                maxValue={12}
                onSelected={() => {
                    selected = true;
                }}
                onBlur={() => {
                    selected = false;
                }}
                onEnterKey={handleEnter}
            />
            {#if useDay}
                <span class="separator">{formatterSep}</span>
            {/if}
        {/if}
        {#if useDay}
            <InputField
                style={$InputDateTimeFieldStyle}
                bind:inputValue={dayValue}
                inputType="POSITIVE_INT"
                placeHolderText={daysId}
                zeroPaddingDigits={2}
                disableHints={true}
                minValue={0}
                maxValue={daysInMonth}
                onSelected={() => {
                    selected = true;
                }}
                onBlur={() => {
                    selected = false;
                }}
                onEnterKey={handleEnter}
            />
        {/if}
    </div>
</div>

<style>
    /* Main container styling - uses CSS custom properties for theming */
    .input-time-div {
        width: var(--width);
        height: var(--height);
        border-radius: var(--border-radius);
        background-color: var(--background-color);
        border: var(--border);
    }

    /* Focus state styling - applied when any input field is focused */
    .input-time-div.selected {
        background-color: var(--selected-background-color);
        border: var(--selected-border);
    }

    /* Error state styling - applied when input validation fails */
    .input-time-div.bad-format {
        background-color: var(--bad-format-background-color);
        border: var(--bad-format-border);
    }

    /* Content container - arranges input fields horizontally */
    .content {
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    /* Separator styling characters between date fields */
    .separator {
        font-size: var(--text-size);
        color: var(--text-color);
        font-weight: var(--text-weight);
    }
</style>
