<script lang="ts">
    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { ToolTipTextStyle } from "$lib/style/general";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $ToolTipTextStyle;

    // Props
    export let text: string;
    export let wrapText: boolean = false;
    export let align: "left" | "center" | "right" = "center";

    //Layout / styling Props
    export let textColor: string | undefined = undefined;
    export let textWeight: string | undefined = undefined;
    export let textSize: string | undefined = undefined;
    export let textLineHeight: string | undefined = undefined;

    $: localOverrides = {
        textColor,
        textWeight,
        textSize,
        textLineHeight,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);
</script>

<!--
  ToolTipText component

  A simple text component designed for use within tooltips.
  - Displays text with customizable typography (color, weight, size).
  - Centered alignment with no-wrap to maintain tooltip layout.
-->
<span
    class:no-wrap={!wrapText}
    style="
        --text-color: {mergedStyle.textColor};
        --text-weight: {mergedStyle.textWeight};
        --text-size: {mergedStyle.textSize};
        --text-line-height: {mergedStyle.textLineHeight};
        --text-alignment: {align};
    ">{text}</span
>

<style>
    /* Text span: centered tooltip text with customizable typography and no-wrap layout */
    span {
        color: var(--text-color);
        font-weight: var(--text-weight);
        font-size: var(--text-size);
        text-align: var(--text-alignment);
        line-height: var(--text-line-height);
        padding: 0;
        margin: 0;
        display: flex;
        white-space: pre-line;
        justify-content: center;
        align-items: center;
    }

    /* Remove text wrapping */
    span.no-wrap {
        white-space: nowrap;
    }
</style>
