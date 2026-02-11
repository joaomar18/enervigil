<script lang="ts">
    import type { Readable } from "svelte/store";
    import Selector from "../../General/Selector.svelte";
    import InputField from "../../General/InputField.svelte";
    import Checkbox from "../../General/Checkbox.svelte";
    import Button from "../../General/Button.svelte";
    import ExpandableButton from "../../General/ExpandableButton.svelte";
    import { nodeNameChange, customNodeChange, virtualNodeChange, nodeTypeChange } from "$lib/logic/handlers/nodes/base";
    import { LOGGING_PERIOD_LIM } from "$lib/types/nodes/config";
    import { defaultVariableUnits } from "$lib/stores/device/variables";
    import { showToast } from "$lib/logic/view/toast";
    import { AlertType } from "$lib/stores/view/toast";

    // Types
    import type { EditableDevice, NewDevice } from "$lib/types/device/base";
    import type { EditableNodeRecord, NodeRecordEditingState } from "$lib/types/nodes/config";
    import type { ColumnVisibilityMap } from "$lib/types/view/nodes";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";
    import { variableNameTextsByPhase } from "$lib/stores/lang/energyMeterTexts";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { NodeRowStyle } from "$lib/style/nodes";
    import { SubPrimaryButtonStyle, SubDangerButtonStyle } from "$lib/style/button";
    import { NodeInputFieldStyle, NodeSelectorStyle } from "$lib/style/nodes";
    import { protocolPlugins, type ProtocolPlugin } from "$lib/stores/device/protocol";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $NodeRowStyle;

    // Props
    export let deviceData: EditableDevice | NewDevice;
    export let node: EditableNodeRecord;
    export let windowWidth: number;
    export let currentGridWidth: number;
    export let columnVisibility: ColumnVisibilityMap;

    // Layout / styling props
    export let leftStateNotValidBorder: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let notValidBackgroundColor: string | undefined = undefined;
    export let hoverColor: string | undefined = undefined;
    export let notValidHoverColor: string | undefined = undefined;
    export let disabledBackgroundColor: string | undefined = undefined;
    export let disabledHoverColor: string | undefined = undefined;
    export let svgButtonsColor: string | undefined = undefined;

    $: localOverrides = {
        leftStateNotValidBorder,
        backgroundColor,
        notValidBackgroundColor,
        hoverColor,
        notValidHoverColor,
        disabledBackgroundColor,
        disabledHoverColor,
        svgButtonsColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let nodeEditingState: NodeRecordEditingState = {
        oldVariableName: node.display_name,
        oldVariableUnit: node.config.unit,
        oldProtocolOptions: { ...node.protocol_options },
    };

    let rowHeight: string;
    let buttonSize: string;
    let buttonSvgSize: string;
    let closeExpandableButton: boolean = false;
    let protocolPlugin: ProtocolPlugin;
    let nodeTypeTexts: Readable<Record<string, string>>;
    let protocolType: string;

    // Reactive Statements
    $: protocolPlugin = $protocolPlugins[node.protocol];
    $: nodeTypeTexts = protocolPlugin.nodeTypeTexts;
    $: protocolType = protocolPlugin.getProtocolType(node.protocol_options);

    // Export Funcions
    export let onPropertyChanged: () => void;
    export let onDelete: () => void;
    export let onConfig: (nodeEditingState: NodeRecordEditingState) => void;

    // Functions
    function handleOnDelete(): void {
        if (onDelete) {
            onDelete();
        }
    }

    function handleOnConfig(): void {
        if (onConfig) {
            onConfig(nodeEditingState);
        }
    }

    $: if (windowWidth) {
        rowHeight = windowWidth <= 880 ? "40px" : "30px";
        buttonSize = windowWidth <= 880 ? "2em" : "1.5em";
        buttonSvgSize = windowWidth <= 880 ? "2em" : "1.75em";
    }
</script>

<!-- NodeRow Component: renders a table row for a device node, displaying editable fields for 
name, unit, communication ID, type, alarms, and options. Includes checkboxes for node 
properties and action buttons for configuration and deletion. -->
<tr
    style="
        --left-state-not-valid-border: {mergedStyle.leftStateNotValidBorder};
        --background-color: {mergedStyle.backgroundColor};
        --not-valid-background-color: {mergedStyle.notValidBackgroundColor};
        --hover-color: {mergedStyle.hoverColor};
        --not-valid-hover-color: {mergedStyle.notValidHoverColor};
        --disabled-background-color: {mergedStyle.disabledBackgroundColor};
        --disabled-hover-color: {mergedStyle.disabledHoverColor};
        --svg-buttons-color: {mergedStyle.svgButtonsColor};
    "
    class="edit-node"
    class:not-valid={!node.validation.isValid()}
    class:disabled={!node.config.enabled}
>
    {#if columnVisibility.name.visible}
        <td>
            <div class="cell-content">
                {#if !node.config.custom}
                    <Selector
                        style={$NodeSelectorStyle}
                        options={$variableNameTextsByPhase[node.attributes.phase]}
                        bind:selectedOption={node.display_name}
                        onChange={() => {
                            nodeNameChange(node, node.attributes.phase);
                            onPropertyChanged();
                        }}
                        inputInvalid={!node.validation.variableName}
                        enableInputInvalid={true}
                        scrollable={true}
                        height={rowHeight}
                        optionHeight={rowHeight}
                    />
                {:else}
                    <InputField
                        style={$NodeInputFieldStyle}
                        bind:inputValue={node.display_name}
                        onChange={() => {
                            nodeNameChange(node, node.attributes.phase);
                            onPropertyChanged();
                        }}
                        inputInvalid={!node.validation.variableName}
                        enableInputInvalid={true}
                        inputType="STRING"
                        height={rowHeight}
                    />
                {/if}
            </div>
        </td>
    {/if}
    {#if columnVisibility.unit.visible}
        <td>
            <div class="cell-content">
                {#if !node.config.custom}
                    <Selector
                        style={$NodeSelectorStyle}
                        options={Object.fromEntries($defaultVariableUnits[node.display_name]?.map((unit) => [unit, unit]) || [])}
                        bind:selectedOption={node.config.unit}
                        onChange={() => {
                            onPropertyChanged();
                        }}
                        disabled={!node.is_numeric}
                        inputInvalid={!node.validation.variableUnit}
                        enableInputInvalid={true}
                        scrollable={true}
                        height={rowHeight}
                        optionHeight={rowHeight}
                    />
                {:else}
                    <InputField
                        style={$NodeInputFieldStyle}
                        bind:inputValue={node.config.unit}
                        onChange={() => {
                            onPropertyChanged();
                        }}
                        disabled={!node.is_numeric}
                        inputInvalid={!node.validation.variableUnit}
                        enableInputInvalid={true}
                        inputType="STRING"
                        height={rowHeight}
                    />
                {/if}
            </div>
        </td>
    {/if}
    {#if columnVisibility.type.visible}
        <td>
            <div class="cell-content">
                <Selector
                    style={$NodeSelectorStyle}
                    options={$nodeTypeTexts}
                    bind:selectedOption={protocolType}
                    onChange={() => {
                        protocolPlugin.setProtocolType(node, protocolType, nodeEditingState);
                        onPropertyChanged();
                    }}
                    inputInvalid={!node.validation.variableType}
                    enableInputInvalid={true}
                    scrollable={true}
                    height={rowHeight}
                    optionHeight={rowHeight}
                />
            </div>
        </td>
    {/if}
    {#if columnVisibility.logging_period.visible}
        <td>
            <div class="cell-content">
                <InputField
                    style={$NodeInputFieldStyle}
                    disabled={!node.config.logging || !node.is_numeric}
                    bind:inputValue={node.config.logging_period}
                    inputInvalid={!node.validation.loggingPeriod}
                    enableInputInvalid={true}
                    onChange={() => {
                        onPropertyChanged();
                    }}
                    inputType="POSITIVE_INT"
                    minValue={LOGGING_PERIOD_LIM.MIN}
                    maxValue={LOGGING_PERIOD_LIM.MAX}
                    limitsPassed={() => {
                        showToast("loggingPeriodError", AlertType.ALERT, {
                            minValue: LOGGING_PERIOD_LIM.MIN,
                            maxValue: LOGGING_PERIOD_LIM.MAX,
                        });
                    }}
                    inputUnit="min."
                    height={rowHeight}
                />
            </div>
        </td>
    {/if}
    {#if columnVisibility.logging.visible}
        <td>
            <div class="cell-content">
                <Checkbox
                    bind:checked={node.config.logging}
                    onChange={() => {
                        onPropertyChanged();
                    }}
                    disabled={!node.is_numeric}
                    inputInvalid={!node.validation.loggingPeriod}
                    inputName="log-node"
                    width={buttonSize}
                    height={buttonSize}
                />
            </div>
        </td>
    {/if}
    {#if columnVisibility.virtual.visible}
        <td>
            <div class="cell-content">
                <Checkbox
                    bind:checked={node.config.calculated}
                    onChange={() => {
                        virtualNodeChange(node, nodeEditingState, deviceData.protocol);
                        onPropertyChanged();
                    }}
                    inputInvalid={!node.validation.calculated}
                    enableInputInvalid={true}
                    inputName="virtual-node"
                    width={buttonSize}
                    height={buttonSize}
                />
            </div>
        </td>
    {/if}
    {#if columnVisibility.publish.visible}
        <td>
            <div class="cell-content">
                <Checkbox
                    bind:checked={node.config.publish}
                    onChange={() => {
                        onPropertyChanged();
                    }}
                    inputName="publish-node"
                    width={buttonSize}
                    height={buttonSize}
                />
            </div>
        </td>
    {/if}

    {#if columnVisibility.custom.visible}
        <td>
            <div class="cell-content">
                <Checkbox
                    bind:checked={node.config.custom}
                    onChange={() => {
                        customNodeChange(node, nodeEditingState, node.attributes.phase);
                        onPropertyChanged();
                    }}
                    inputName="custom-node"
                    width={buttonSize}
                    height={buttonSize}
                />
            </div>
        </td>
    {/if}
    {#if columnVisibility.enable.visible}
        <td>
            <div class="cell-content">
                <Checkbox
                    bind:checked={node.config.enabled}
                    onChange={() => {
                        onPropertyChanged();
                    }}
                    inputName="enable-node"
                    width={buttonSize}
                    height={buttonSize}
                />
            </div>
        </td>
    {/if}
    {#if columnVisibility.actions.visible}
        <td>
            <div class="cell-content gap-items">
                {#if currentGridWidth > 325}
                    <button class="btn-delete" aria-label="Delete Node" on:click={handleOnDelete}>
                        <svg xmlns="http://www.w3.org/2000/svg" height={buttonSvgSize} viewBox="0 0 24 24" width={buttonSvgSize}
                            ><path
                                d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm2 2v6h1v-6h-1zm3 0v6h1v-6h-1zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                            /></svg
                        >
                    </button>
                    <button class="btn-more-options" aria-label="More Options" on:click={handleOnConfig}>
                        <svg xmlns="http://www.w3.org/2000/svg" height={buttonSvgSize} viewBox="0 -960 960 960" width={buttonSvgSize}
                            ><path
                                d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"
                            /></svg
                        >
                    </button>
                {:else}
                    <ExpandableButton bind:closeModal={closeExpandableButton} notValid={!node.validation.isValid()}>
                        <div class="expandable-button-div">
                            <Button
                                style={$SubPrimaryButtonStyle}
                                buttonText={$texts.configuration}
                                width="200px"
                                imageURL="/img/settings.svg"
                                imageWidth="25px"
                                imageHeight="25px"
                                imageLeftPos="20px"
                                onClick={() => {
                                    handleOnConfig();
                                    closeExpandableButton = true;
                                }}
                            />
                            <Button
                                style={$SubDangerButtonStyle}
                                buttonText={$texts.delete}
                                width="200px"
                                imageURL="/img/delete.svg"
                                imageWidth="25px"
                                imageHeight="25px"
                                imageLeftPos="20px"
                                onClick={() => {
                                    handleOnDelete();
                                    closeExpandableButton = true;
                                }}
                            />
                        </div>
                    </ExpandableButton>
                {/if}
            </div>
        </td>
    {/if}
</tr>

<style>
    /* Table row for editable node */
    tr.edit-node {
        background-color: var(--background-color);
    }

    /* Node row hover styling */
    tr.edit-node:hover {
        background-color: var(--hover-color);
    }

    /* Disabled node row styling */
    tr.edit-node.disabled {
        background-color: var(--disabled-background-color);
    }

    /* Disabled node row hover styling */
    tr.edit-node.disabled:hover {
        background-color: var(--disabled-hover-color);
    }

    /* Left bar and subtle tint background color on the node row to alert that the configuration is not valid */
    tr.edit-node.not-valid {
        border-left: var(--left-state-not-valid-border);
        background-color: var(--not-valid-background-color);
    }

    /* Hover color for not valid state */
    tr.edit-node.not-valid:hover {
        background-color: var(--not-valid-hover-color);
    }

    /* Table cell styling for node fields */
    tr td {
        height: 40px;
        padding: 5px;
        padding-left: 0px;
        padding-right: 0px;
    }

    /* Content container for each cell */
    tr td .cell-content {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 0;
    }

    /* Adds gap between action buttons */
    tr td .cell-content.gap-items {
        gap: 15px;
    }

    /* Button base styling for actions */
    button {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        cursor: pointer;
        border: none;
    }

    /* Delete button icon color */
    .btn-delete svg {
        fill: var(--svg-buttons-color);
    }

    /* Delete button icon color on hover */
    .btn-delete:hover svg {
        fill: #e74c3c;
    }

    /* More options button icon color */
    .btn-more-options svg {
        fill: var(--svg-buttons-color);
    }

    /* More options button icon color on hover */
    .btn-more-options:hover svg {
        fill: #2f80ed;
    }

    /* Expandable button div for mobile users */
    .expandable-button-div {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: left;
        gap: 10px;
        margin: 10px;
    }

    /* Responsive: reduce row height on wide screens */
    @media (min-width: 880px) {
        tr td {
            height: 30px;
        }
    }
</style>
