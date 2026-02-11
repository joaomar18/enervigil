<script lang="ts">
    import InputField from "../General/InputField.svelte";
    import Selector from "../General/Selector.svelte";
    import InfoLabel from "../General/InfoLabel.svelte";
    import { validateModbusRtuPort } from "$lib/logic/validation/device/modbusRtu";
    import { READ_PERIOD_LIM, TIMEOUT_LIM } from "$lib/types/device/base";
    import { SLAVE_ID_LIM, RETRIES_NUMBER_LIM } from "$lib/types/device/modbusRtu";
    import { showToast } from "$lib/logic/view/toast";
    import { AlertType } from "$lib/stores/view/toast";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";
    import { baudrateTexts, parityTexts, bytesizeTexts, stopbitsTexts } from "$lib/stores/lang/modbusRtuTexts";

    // Types
    import type { EditableDeviceModbusRTUConfig } from "$lib/types/device/modbusRtu";

    // Props
    export let configuration: EditableDeviceModbusRTUConfig; // Modbus RTU Configuration Object

    // Variables
    let validModbusRtuPort: boolean; // Modbus RTU Port is valid
    let validModbusSlaveID: boolean; // Modbus Slave ID is valid
    let validBaudrate: boolean; // Modbus Baudrate is valid
    let validParity: boolean; // Modbus Parity is valid
    let validByteSize: boolean; // Modbus Byte Size is valid
    let validStopBits: boolean; // Modbus Stop Bits is valid
    let validReadPeriod: boolean; // Read Period is valid
    let validTimeout: boolean; // Timeout is valid
    let validRetriesNumber: boolean; // Number of retries is valid

    $: validModbusRtuPort = validateModbusRtuPort(configuration.port);
    $: validModbusSlaveID = parseInt(configuration.slave_id) >= SLAVE_ID_LIM.MIN && parseInt(configuration.slave_id) <= SLAVE_ID_LIM.MAX;
    $: validBaudrate = Object.keys($baudrateTexts).includes(configuration.baudrate);
    $: validParity = Object.keys($parityTexts).includes(configuration.parity);
    $: validByteSize = Object.keys($bytesizeTexts).includes(configuration.bytesize);
    $: validStopBits = Object.keys($stopbitsTexts).includes(configuration.stopbits);
    $: validReadPeriod = parseInt(configuration.read_period) >= READ_PERIOD_LIM.MIN && parseInt(configuration.read_period) <= READ_PERIOD_LIM.MAX;
    $: validTimeout = parseInt(configuration.timeout) >= TIMEOUT_LIM.MIN && parseInt(configuration.timeout) <= TIMEOUT_LIM.MAX;
    $: validRetriesNumber = parseInt(configuration.retries) >= RETRIES_NUMBER_LIM.MIN && parseInt(configuration.retries) <= RETRIES_NUMBER_LIM.MAX;

    $: configuration.valid =
        validModbusRtuPort &&
        validModbusSlaveID &&
        validBaudrate &&
        validParity &&
        validByteSize &&
        validStopBits &&
        validReadPeriod &&
        validTimeout &&
        validRetriesNumber;
</script>

<!-- 
  Modbus RTU Configuration:
    • Form component for configuring Modbus RTU protocol settings.
    • Input fields: Communication port, slave ID, baudrate, parity, byte size, stop bits.
    • Timing settings: Read period, timeout, and retry attempts configuration.
    • Real-time validation with visual feedback and error handling.
    • Includes hint tooltips for each configuration parameter.
-->
<div class="device-input-div">
    <InfoLabel labelText={$texts.communicationPort} toolTipText={$texts.communicationPortInfo} />
    <div class="input-div">
        <InputField bind:inputValue={configuration.port} inputInvalid={!validModbusRtuPort} enableInputInvalid={true} />
    </div>
</div>

<div class="device-input-div">
    <InfoLabel labelText={$texts.slaveID} toolTipText={$texts.slaveIDInfo} />
    <div class="input-div">
        <InputField
            bind:inputValue={configuration.slave_id}
            inputInvalid={!validModbusSlaveID}
            enableInputInvalid={true}
            inputType="POSITIVE_INT"
            minValue={SLAVE_ID_LIM.MIN}
            maxValue={SLAVE_ID_LIM.MAX}
            limitsPassed={() => {
                showToast("slaveIDError", AlertType.ALERT, {
                    minValue: SLAVE_ID_LIM.MIN,
                    maxValue: SLAVE_ID_LIM.MAX,
                });
            }}
        />
    </div>
</div>

<div class="device-input-div">
    <InfoLabel labelText={$texts.baudrate} toolTipText={$texts.baudrateInfo} />
    <div class="input-div">
        <Selector
            options={$baudrateTexts}
            bind:selectedOption={configuration.baudrate}
            inputInvalid={!validBaudrate}
            enableInputInvalid={true}
            scrollable={true}
        />
    </div>
</div>

<div class="device-input-div">
    <InfoLabel labelText={$texts.parity} toolTipText={$texts.parityInfo} />
    <div class="input-div">
        <Selector
            options={$parityTexts}
            bind:selectedOption={configuration.parity}
            inputInvalid={!validParity}
            enableInputInvalid={true}
            scrollable={true}
        />
    </div>
</div>

<div class="device-input-div">
    <InfoLabel labelText={$texts.bytesize} toolTipText={$texts.bytesizeInfo} />
    <div class="input-div">
        <Selector
            options={$bytesizeTexts}
            bind:selectedOption={configuration.bytesize}
            inputInvalid={!validByteSize}
            enableInputInvalid={true}
            scrollable={true}
        />
    </div>
</div>

<div class="device-input-div">
    <InfoLabel labelText={$texts.stopbits} toolTipText={$texts.stopbitsInfo} />
    <div class="input-div">
        <Selector
            options={$stopbitsTexts}
            bind:selectedOption={configuration.stopbits}
            inputInvalid={!validStopBits}
            enableInputInvalid={true}
            scrollable={true}
        />
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
<div class="device-input-div">
    <InfoLabel labelText={$texts.retries} toolTipText={$texts.retriesInfo} />
    <div class="input-div">
        <InputField
            bind:inputValue={configuration.retries}
            inputType="POSITIVE_INT"
            inputInvalid={!validRetriesNumber}
            enableInputInvalid={true}
            minValue={RETRIES_NUMBER_LIM.MIN}
            maxValue={RETRIES_NUMBER_LIM.MAX}
            limitsPassed={() => {
                showToast("retriesError", AlertType.ALERT, {
                    minValue: RETRIES_NUMBER_LIM.MIN,
                    maxValue: RETRIES_NUMBER_LIM.MAX,
                });
            }}
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
