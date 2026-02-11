<script lang="ts">
    import InputField from "../General/InputField.svelte";
    import InfoLabel from "../General/InfoLabel.svelte";
    import { validateOpcUaUrl } from "$lib/logic/validation/device/opcUa";
    import { READ_PERIOD_LIM, TIMEOUT_LIM } from "$lib/types/device/base";
    import { showToast } from "$lib/logic/view/toast";
    import { AlertType } from "$lib/stores/view/toast";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Types
    import type { EditableDeviceOPCUAConfig } from "$lib/types/device/opcUa";

    // Props
    export let configuration: EditableDeviceOPCUAConfig; // OPC UA Configuration Object

    // Variables
    let validOpcUaUrl: boolean; // OPC UA Url is valid
    let validReadPeriod: boolean; // Read Period is valid
    let validTimeout: boolean; // Timeout is valid

    $: validOpcUaUrl = validateOpcUaUrl(configuration.url);
    $: validReadPeriod = parseInt(configuration.read_period) >= READ_PERIOD_LIM.MIN && parseInt(configuration.read_period) <= READ_PERIOD_LIM.MAX;
    $: validTimeout = parseInt(configuration.timeout) >= TIMEOUT_LIM.MIN && parseInt(configuration.timeout) <= TIMEOUT_LIM.MAX;
    $: configuration.valid = validOpcUaUrl && validReadPeriod && validTimeout;
</script>

<!-- 
  OPC UA Configuration:
    • Form component for configuring OPC UA protocol settings.
    • Network settings: OPC UA server URL/endpoint configuration.
    • Timing settings: Read period and communication timeout parameters.
    • Real-time validation with visual feedback and error handling.
    • Includes hint tooltips for each configuration parameter.
-->
<div class="device-input-div">
    <InfoLabel labelText={$texts.networkAddress} toolTipText={$texts.networkAddressInfo} />
    <div class="input-div">
        <InputField bind:inputValue={configuration.url} inputInvalid={!validOpcUaUrl} enableInputInvalid={true} />
    </div>
</div>
<div class="device-input-div">
    <InfoLabel labelText={$texts.readPeriod} toolTipText={$texts.readPeriodInfo} />
    <div class="input-div">
        <InputField
            bind:inputValue={configuration.read_period}
            inputInvalid={!validReadPeriod}
            enableInputInvalid={true}
            inputType="POSITIVE_INT"
            inputUnit={$texts.secondsUnit}
            minValue={READ_PERIOD_LIM.MIN}
            maxValue={READ_PERIOD_LIM.MAX}
            limitsPassed={() => {
                showToast("readPeriodError", AlertType.ALERT, {
                    minValue: READ_PERIOD_LIM.MIN,
                    maxValue: READ_PERIOD_LIM.MAX,
                });
            }}
        />
    </div>
</div>
<div class="device-input-div">
    <InfoLabel labelText={$texts.commTimeout} toolTipText={$texts.commTimeoutInfo} />
    <div class="input-div">
        <InputField
            bind:inputValue={configuration.timeout}
            inputInvalid={!validTimeout}
            enableInputInvalid={true}
            inputType="POSITIVE_INT"
            inputUnit={$texts.secondsUnit}
            minValue={TIMEOUT_LIM.MIN}
            maxValue={TIMEOUT_LIM.MAX}
            limitsPassed={() => {
                showToast("commTimeoutError", AlertType.ALERT, {
                    minValue: TIMEOUT_LIM.MIN,
                    maxValue: TIMEOUT_LIM.MAX,
                });
            }}
        />
    </div>
</div>
<div class="optional-div">
    <span class="optional-text">{$texts.authenticationOptional}</span>
    <form on:submit|preventDefault>
        <div class="device-input-div">
            <InfoLabel labelText={$texts.username} toolTipText={$texts.commUsernameInfo} />
            <div class="input-div">
                <InputField bind:inputValue={configuration.username} inputType="USERNAME" />
            </div>
        </div>
        <div class="device-input-div">
            <InfoLabel labelText={$texts.password} toolTipText={$texts.commPasswordInfo} />
            <div class="input-div">
                <InputField bind:inputValue={configuration.password} inputType="PASSWORD" />
            </div>
        </div>
    </form>
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

    /* Optional authentication section styling */
    .optional-div {
        padding-top: 50px;
    }

    /* Optional authentication label styling */
    .optional-div .optional-text {
        display: block;
        width: 100%;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        padding-bottom: 5px;
        color: rgb(170, 170, 170);
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
    }
</style>
