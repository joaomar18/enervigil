<script lang="ts">
    import Button from "../../General/Button.svelte";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { AddNodeStyle } from "$lib/style/nodes";
    import { AddNodeButtonStyle } from "$lib/style/nodes";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $AddNodeStyle;

    // Props
    export let windowWidth: number;

    // Layout / styling props
    export let backgroundColor: string | undefined = undefined;

    $: localOverrides = {
        backgroundColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Export Funcions
    export let onAddNode: () => void;

    // Variables
    $: buttonHeight = windowWidth <= 880 ? "40px" : "32px";
</script>

<tr
    style="
        --background-color: {mergedStyle.backgroundColor};
    "
    class="add-node"
>
    <td colspan="20">
        <Button buttonText={$texts.addNode} style={$AddNodeButtonStyle} height={buttonHeight} onClick={onAddNode} />
    </td>
</tr>

<style>
    tr.add-node {
        background-color: var(--background-color);
    }

    tr td {
        height: fit-content;
        padding: 5px;
        padding-left: 0px;
        padding-right: 0px;
    }
</style>
