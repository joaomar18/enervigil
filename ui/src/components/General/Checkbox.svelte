<script lang="ts">
    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { CheckBoxStyle } from "$lib/style/general";

    // Props
    export let disabled: boolean = false;
    export let checked: boolean;
    export let inputInvalid: boolean = false;
    export let enableInputInvalid: boolean = false;
    export let inputName: string = ""; //Name of the input
    export let disableAnimations = false; // Disable animations for the checkbox

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $CheckBoxStyle;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let checkMarkWidth: number | undefined = undefined;
    export let checkMarkHeight: number | undefined = undefined;
    export let checkMarkStroke: number | undefined = undefined;
    export let marginRight: string | undefined = undefined;
    export let disabledbackgroundColor: string | undefined = undefined;
    export let disabledBorderColor: string | undefined = undefined;
    export let enabledBackgroundColor: string | undefined = undefined;
    export let enabledBorderColor: string | undefined = undefined;
    export let badFormatBackgroundColor: string | undefined = undefined;
    export let badFormatBorderColor: string | undefined = undefined;
    export let disabledCheckMarkColor: string | undefined = undefined;
    export let enabledCheckMarkColor: string | undefined = undefined;

    $: localOverrides = {
        width,
        height,
        checkMarkWidth,
        checkMarkHeight,
        checkMarkStroke,
        marginRight,
        disabledbackgroundColor,
        disabledBorderColor,
        enabledBackgroundColor,
        enabledBorderColor,
        badFormatBackgroundColor,
        badFormatBorderColor,
        disabledCheckMarkColor,
        enabledCheckMarkColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Change Export Function
    export let onChange: (() => void) | undefined = undefined;

    function handleChange() {
        if (onChange) {
            onChange();
        }
    }
</script>

<!-- 
  Checkbox label using CSS variables for styling.
  This allows full control of spacing, colors, and theming.
-->
<label
    class="label-checkbox"
    style="
        --width: {mergedStyle.width};
        --height: {mergedStyle.height};
        --margin-right: {mergedStyle.marginRight};
        --disabled-bg-color: {mergedStyle.disabledBackgroundColor};
        --disabled-border-color: {mergedStyle.disabledBorderColor};
        --enabled-bg-color: {mergedStyle.enabledBackgroundColor};
        --enabled-border-color: {mergedStyle.enabledBorderColor};
        --bad-format-background-color: {mergedStyle.badFormatBackgroundColor};
        --bad-format-border-color: {mergedStyle.badFormatBorderColor};
        --enabled-checkmark-color: {mergedStyle.enabledCheckMarkColor};
        --disabled-checkmark-color: {mergedStyle.disabledCheckMarkColor};
    "
    class:disabled
    class:enable-anim={!disableAnimations}
>
    <input
        type="checkbox"
        name={inputName}
        bind:checked
        on:change={handleChange}
        class:bad-format={inputInvalid && enableInputInvalid && checked}
        class:bad-format-off={inputInvalid && enableInputInvalid && !checked}
        {disabled}
    />
    <span class:bad-format={inputInvalid && enableInputInvalid && checked} class:bad-format-off={inputInvalid && enableInputInvalid && !checked}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={mergedStyle.checkMarkWidth}
            height={mergedStyle.checkMarkHeight}
            fill="none"
            stroke-width={mergedStyle.checkMarkStroke}
            stroke-linecap="round"
            stroke-linejoin="round"
            class:checked
        >
            <path d="M5 13l4 4L19 7" />
        </svg>
    </span>
</label>

<style>
    /* Main container */
    .label-checkbox {
        display: flex;
        align-items: center;
        cursor: pointer;
        margin-right: var(--margin-right, 0px);
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
    }

    /* Disable cursor pointer when input is disabled */
    .label-checkbox.disabled {
        cursor: auto;
    }

    /* Hide native checkbox */
    .label-checkbox input[type="checkbox"] {
        display: none;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }

    /* Custom checkbox visual (unchecked by default) */
    .label-checkbox span {
        display: inline-block;
        width: var(--width);
        height: var(--height);
        border: 1px solid var(--disabled-border-color);
        border-radius: 4px;
        background-color: var(--disabled-bg-color);
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    /* Enable visual animations for the custom checkbox */
    .label-checkbox.enable-anim span {
        transition: all 0.2s;
    }

    /* Checkmark SVG Icon Customization */
    .label-checkbox span svg {
        stroke: var(--disabled-checkmark-color);
        transition: all 0.2s;
    }

    /* Enabled Checkmark Icon Stroke Color */
    .label-checkbox span svg.checked {
        stroke: var(--enabled-checkmark-color);
    }

    /* Checkbox appearance when checked */
    .label-checkbox input[type="checkbox"]:checked + span {
        border: 1px solid var(--enabled-border-color);
        background-color: var(--enabled-bg-color);
    }

    /* Checkbox appeareance when input is invalid and checked */
    .label-checkbox input[type="checkbox"]:checked.bad-format + span.bad-format {
        border: 1px solid var(--bad-format-border-color);
        background-color: var(--bad-format-background-color);
    }

    /* Checkbox appeareance when input is invalid and unchecked */
    .label-checkbox input[type="checkbox"].bad-format-off + span.bad-format-off {
        border: 1px solid var(--bad-format-background-color);
        background-color: var(--disabled-bg-color);
    }
</style>
