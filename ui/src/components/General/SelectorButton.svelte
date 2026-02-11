<script lang="ts">
    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { SelectorButtonStyle } from "$lib/style/general";

    //Props
    export let checked: boolean;

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $SelectorButtonStyle;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let knobWidth: string | undefined = undefined;
    export let knobHeight: string | undefined = undefined;
    export let borderRadius: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let selectedBackgroundColor: string | undefined = undefined;
    export let knobBackgroundColor: string | undefined = undefined;
    export let knobSelectedBackgroundColor: string | undefined = undefined;

    $: localOverrides = {
        width,
        height,
        knobWidth,
        knobHeight,
        borderRadius,
        backgroundColor,
        selectedBackgroundColor,
        knobBackgroundColor,
        knobSelectedBackgroundColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    //Functions
    function getNumber(value: string): number {
        return parseFloat(value);
    }

    function toggle() {
        checked = !checked;
    }

    $: widthNumber = getNumber(String(mergedStyle.width));
    $: knobWidthNumber = getNumber(String(mergedStyle.knobWidth));
    $: heightNumber = getNumber(String(mergedStyle.height));
    $: knobHeightNumber = getNumber(String(mergedStyle.knobHeight));
</script>

<!-- 
  Custom toggle (selector) button component.
  Uses a <button> element styled with CSS variables for flexibility.
  Switches between two states (checked/unchecked) on click.
  The knob slides horizontally, and styles change based on the 'checked' state.
-->
<button
    class={checked ? "checked" : ""}
    on:click={toggle}
    aria-label="Selector Button"
    style="
        --width: {mergedStyle.width};
        --height: {mergedStyle.height};
        --knob-width: {mergedStyle.knobWidth};
        --knob-height: {mergedStyle.knobHeight};
        --knob-top-push: {`${(heightNumber - knobHeightNumber) / 2}px`};
        --knob-right-push: {`${widthNumber - knobWidthNumber}px`};
        --border-radius: {mergedStyle.borderRadius};
        --background-color: {mergedStyle.backgroundColor};
        --selected-background-color: {mergedStyle.selectedBackgroundColor};
        --knob-background-color: {mergedStyle.knobBackgroundColor};
        --knob-selected-background-color: {mergedStyle.knobSelectedBackgroundColor};
    "
>
    <div class="knob {checked ? 'checked' : ''}"></div>
</button>

<style>
    /* Toggle button container */
    button {
        margin: 0;
        padding: 0;
        width: var(--width);
        height: var(--height);
        background-color: var(--background-color);
        border-radius: var(--border-radius);
        position: relative;
        cursor: pointer;
        border: none;
        transition: background-color 0.2s ease;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }

    /* Optional hover state (Removes button effects when hovered) */
    button:hover {
        background-color: var(--background-color);
    }

    /* Active state for the toggle button */
    button.checked {
        background-color: var(--selected-background-color);
    }

    /* Knob element inside the toggle */
    .knob {
        position: absolute;
        width: var(--knob-width);
        height: var(--knob-height);
        border-radius: 50%;
        top: var(--knob-top-push);
        left: 0px;
        background-color: var(--knob-background-color);
        transition: transform 0.2s ease;
    }

    /* Knob appearance and position when toggle is checked */
    .knob.checked {
        background-color: var(--knob-selected-background-color);
        transform: translateX(var(--knob-right-push));
    }
</style>
