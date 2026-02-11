<script lang="ts">
    import Selector from "../General/Selector.svelte";
    import InfoLabel from "../General/InfoLabel.svelte";
    import { getDefaultNodesList } from "$lib/logic/factory/nodes";

    // Types
    import type { EditableDevice, NewDevice } from "$lib/types/device/base";
    import type { EditableNodeRecord } from "$lib/types/nodes/config";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";
    import { meterTypeTexts } from "$lib/stores/lang/energyMeterTexts";

    // Props
    export let deviceData: EditableDevice | NewDevice;
    export let nodes: Array<EditableNodeRecord>;
    export let meterOptionsValid: boolean;

    // Variables
    let validMeterType: boolean;

    $: validMeterType = Object.keys($meterTypeTexts).includes(deviceData.type);
    $: meterOptionsValid = validMeterType;
</script>

<!--
  MeterOptionsConfig: This component renders the configuration options for energy meter devices,
  including connection type, energy reading options, and various meter-specific settings.
-->
<div class="device-input-div">
    <InfoLabel labelText={$texts.connectionType} toolTipText={$texts.connectionTypeInfo} />
    <div class="input-div">
        <Selector
            options={$meterTypeTexts}
            bind:selectedOption={deviceData.type}
            inputInvalid={!validMeterType}
            enableInputInvalid={true}
            onChange={() => {
                nodes = getDefaultNodesList(deviceData);
            }}
            scrollable={true}
        />
    </div>
</div>

<style>
    /* Device input row styling */
    .device-input-div {
        position: relative;
        margin-top: 30px;
        min-height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 20px;
    }

    /* Input field container styling */
    .input-div {
        width: 250px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
