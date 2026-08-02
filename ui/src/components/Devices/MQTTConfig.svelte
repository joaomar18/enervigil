<script lang="ts">
    import InputField from "../General/InputField.svelte";
    import Selector from "../General/Selector.svelte";
    import Checkbox from "../General/Checkbox.svelte";
    import InfoLabel from "../General/InfoLabel.svelte";
    import { validateMqttHostname } from "$lib/logic/validation/device/mqtt";
    import { MQTTBrokerMode, STALE_AFTER_LIM } from "$lib/types/device/mqtt";
    import { showToast } from "$lib/logic/view/toast";
    import { AlertType } from "$lib/stores/view/toast";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";
    import { mqttBrokerModeTexts } from "$lib/stores/lang/mqttTexts";

    // Types
    import type { EditableDeviceMQTTConfig } from "$lib/types/device/mqtt";

    // Props
    export let configuration: EditableDeviceMQTTConfig; // MQTT Configuration Object

    // Variables
    let isExternal: boolean; // Whether the external broker fields should be shown
    let validBrokerMode: boolean; // Broker mode is valid
    let validStaleAfter: boolean; // Stale After threshold is valid
    let validHostname: boolean; // External broker hostname is valid
    let validPort: boolean; // External broker port is valid
    let validUsername: boolean; // Authentication username is valid
    let validPassword: boolean; // Authentication password is valid

    $: isExternal = configuration.broker_mode === MQTTBrokerMode.EXTERNAL;
    $: validBrokerMode = Object.keys($mqttBrokerModeTexts).includes(configuration.broker_mode);
    $: validStaleAfter =
        parseInt(configuration.stale_after) >= STALE_AFTER_LIM.MIN && parseInt(configuration.stale_after) <= STALE_AFTER_LIM.MAX;
    $: validHostname = !isExternal || validateMqttHostname(configuration.hostname);
    $: validPort = !isExternal || (parseInt(configuration.port) >= 1 && parseInt(configuration.port) <= 65535);
    $: validUsername = !isExternal || !configuration.authentication || configuration.username.trim().length > 0;
    $: validPassword = !isExternal || !configuration.authentication || configuration.password.trim().length > 0;

    $: configuration.valid = validBrokerMode && validStaleAfter && validHostname && validPort && validUsername && validPassword;
</script>

<!--
  MQTT Configuration:
    • Form component for configuring MQTT protocol settings.
    • Broker settings: reuse of the internal broker or connection details for an external broker.
    • Timing settings: staleness threshold used to detect meters that stopped publishing.
    • Real-time validation with visual feedback and error handling.
    • Includes hint tooltips for each configuration parameter.
-->
<div class="device-input-div">
    <InfoLabel labelText={$texts.brokerMode} toolTipText={$texts.brokerModeInfo} />
    <div class="input-div">
        <Selector
            options={$mqttBrokerModeTexts}
            bind:selectedOption={configuration.broker_mode}
            inputInvalid={!validBrokerMode}
            enableInputInvalid={true}
            scrollable={true}
        />
    </div>
</div>
<div class="device-input-div">
    <InfoLabel labelText={$texts.staleAfter} toolTipText={$texts.staleAfterInfo} />
    <div class="input-div">
        <InputField
            bind:inputValue={configuration.stale_after}
            inputInvalid={!validStaleAfter}
            enableInputInvalid={true}
            inputType="POSITIVE_INT"
            inputUnit={$texts.secondsUnit}
            minValue={STALE_AFTER_LIM.MIN}
            maxValue={STALE_AFTER_LIM.MAX}
            limitsPassed={() => {
                showToast("staleAfterError", AlertType.ALERT, {
                    minValue: STALE_AFTER_LIM.MIN,
                    maxValue: STALE_AFTER_LIM.MAX,
                });
            }}
        />
    </div>
</div>
{#if isExternal}
    <div class="device-input-div">
        <InfoLabel labelText={$texts.networkAddress} toolTipText={$texts.networkAddressInfo} />
        <div class="input-div">
            <InputField bind:inputValue={configuration.hostname} inputInvalid={!validHostname} enableInputInvalid={true} />
        </div>
    </div>
    <div class="device-input-div">
        <InfoLabel labelText={$texts.communicationPort} toolTipText={$texts.communicationPortInfo} />
        <div class="input-div">
            <InputField
                bind:inputValue={configuration.port}
                inputInvalid={!validPort}
                enableInputInvalid={true}
                inputType="POSITIVE_INT"
                minValue={1}
                maxValue={65535}
                limitsPassed={() => {
                    showToast("portError", AlertType.ALERT, { minValue: 1, maxValue: 65535 });
                }}
            />
        </div>
    </div>
    <div class="device-input-div">
        <InfoLabel labelText={$texts.useTls} toolTipText={$texts.useTlsInfo} />
        <div class="input-div">
            <Checkbox bind:checked={configuration.use_tls} />
        </div>
    </div>
    <div class="device-input-div">
        <InfoLabel labelText={$texts.enableAuthentication} toolTipText={$texts.enableAuthenticationInfo} />
        <div class="input-div">
            <Checkbox bind:checked={configuration.authentication} />
        </div>
    </div>
    {#if configuration.authentication}
        <div class="device-input-div">
            <InfoLabel labelText={$texts.username} toolTipText={$texts.commUsernameInfo} />
            <div class="input-div">
                <InputField
                    bind:inputValue={configuration.username}
                    inputInvalid={!validUsername}
                    enableInputInvalid={true}
                    inputType="USERNAME"
                />
            </div>
        </div>
        <div class="device-input-div">
            <InfoLabel labelText={$texts.password} toolTipText={$texts.commPasswordInfo} />
            <div class="input-div">
                <InputField
                    bind:inputValue={configuration.password}
                    inputInvalid={!validPassword}
                    enableInputInvalid={true}
                    inputType="PASSWORD"
                />
            </div>
        </div>
    {/if}
{/if}

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
