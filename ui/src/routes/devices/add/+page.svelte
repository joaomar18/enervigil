<script lang="ts">
    import { fade } from "svelte/transition";
    import { onMount } from "svelte";
    import { getDefaultImageAPI, addDeviceAPI } from "$lib/logic/api/device";
    import { createNewDevice, convertToDevice } from "$lib/logic/factory/device";
    import { convertToNodes, getDefaultNodesList } from "$lib/logic/factory/nodes";
    import { updateDeviceValidation, validDeviceOperation } from "$lib/logic/validation/device/base";
    import { updateNodesValidation } from "$lib/logic/validation/nodes/base";
    import { defaultDeviceOptions } from "$lib/types/device/base";
    import { protocolPlugins } from "$lib/stores/device/protocol";
    import { APIRetrier } from "$lib/logic/api/retrier";
    import { deviceProtocolChange } from "$lib/logic/handlers/device";
    import { updateNodes, updateEditingNode, updateNodesBySection } from "$lib/logic/handlers/nodes/base";
    import Selector from "../../../components/General/Selector.svelte";
    import InfoLabel from "../../../components/General/InfoLabel.svelte";
    import EditableText from "../../../components/General/EditableText.svelte";
    import UploadImage from "../../../components/General/UploadImage.svelte";
    import Button from "../../../components/General/Button.svelte";
    import NodesGrid from "../../../components/Devices/Nodes/NodesGrid.svelte";
    import NodeConfigSheet from "../../../components/Devices/Nodes/NodeConfigSheet.svelte";
    import PopupAddDevice from "../../../components/Devices/PopupAddDevice.svelte";
    import MeterOptionsConfig from "../../../components/Devices/MeterOptionsConfig.svelte";

    // Types
    import type { NewDevice } from "$lib/types/device/base";
    import type { NodePhase } from "$lib/types/nodes/base";
    import type { EditableNodeRecord, NodeRecordEditingState } from "$lib/types/nodes/config";

    // Styles
    import { SucessButtonStyle } from "$lib/style/button";

    // Navigation
    import { navigateTo, resetDashboardLoader } from "$lib/logic/view/navigation";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";
    import { protocolTexts } from "$lib/stores/lang/energyMeterTexts";

    // Stores
    import { loadedDone } from "$lib/stores/view/navigation";

    // Variables
    let showAddWindow: boolean = false; // Show Add Device Window
    let showConfigNodeWindow: boolean = false; // Show Node Full Configuration Window
    let performingAddRequest: boolean = false; // Performing Add Device Request
    let deviceData: NewDevice; // Device Data
    let nodes: Array<EditableNodeRecord>;
    let nodesBySection: Record<NodePhase, Array<EditableNodeRecord>>;
    let editingNode: EditableNodeRecord; // Current Node being edited in Configuration Window
    let editingNodeState: NodeRecordEditingState; // Current state of the Node being edited
    let nodesInit: boolean = false; // Nodes are initialized
    let contentInit: boolean = false; // Content is initialized

    // Reactive Statements

    // Content is initialized when both loaded is done and nodes are initialized
    $: contentInit = $loadedDone && nodesInit;

    // Update initial device validation
    $: if (deviceData) {
        updateDeviceValidation(deviceData, undefined);
    }

    // Get nodes from the nodes array by section
    $: if (contentInit) {
        nodesBySection = updateNodesBySection(nodes);
        updateNodesValidation(nodes, nodesBySection);
        updateDeviceValidation(deviceData, nodes);
    }

    // Mount function
    onMount(() => {
        resetDashboardLoader();
        let defaultImageRetrier: APIRetrier<string | null> | null = new APIRetrier(
            getDefaultImageAPI(),
            (result) => {
                if (!deviceData) {
                    deviceData = createNewDevice(defaultDeviceOptions.protocol, defaultDeviceOptions.type, defaultDeviceOptions.options);
                    nodes = getDefaultNodesList(deviceData);
                    setTimeout(() => {
                        nodesInit = true;
                    }, 100); // Small timeout to give a bit of time for the page to load before the nodes
                }
                if (result !== null) deviceData.current_image_url = result;
            },
            5000,
        );

        //Clean-up logic
        return () => {
            defaultImageRetrier?.stop();
            defaultImageRetrier = null;
        };
    });
</script>

<!-- Add Device Page: allows the user to create a new device by entering its details and configuration options, including editable fields for device name, image, communication settings, and meter options.
Shows input forms for protocol-specific parameters and organizes device nodes for initial setup. Includes action buttons for saving or canceling the new device. -->
<div class="content" in:fade={{ duration: 300 }}>
    {#if deviceData}
        <div class="add-device-div">
            <div class="device-identification-div">
                <EditableText
                    bind:text={deviceData.name}
                    placeHolder={$texts.deviceName}
                    allwaysEnabled={true}
                    enableTextInvalid={true}
                    textInvalid={!deviceData.validation.deviceName}
                    minWidth="250px"
                    maxWidth="500px"
                />
                <div class="device-image-div">
                    <UploadImage bind:imageFile={deviceData.device_image} imageUrl={deviceData.current_image_url ?? ""} />
                </div>
            </div>
            <div class="device-section-div">
                <div class="title">
                    <h3>{$texts.deviceCommunication}</h3>
                    <span>{$texts.deviceCommunicationSub}</span>
                </div>

                <div class="device-input-div">
                    <InfoLabel labelText={$texts.communicationProtocol} toolTipText={$texts.communicationProtocolInfo} />
                    <div class="input-div">
                        <Selector
                            options={$protocolTexts}
                            bind:selectedOption={deviceData.protocol}
                            inputInvalid={!deviceData.validation.deviceProtocol}
                            enableInputInvalid={true}
                            onChange={() => {
                                deviceProtocolChange(deviceData, nodes);
                            }}
                            scrollable={true}
                        />
                    </div>
                </div>
                <svelte:component this={$protocolPlugins[deviceData.protocol].ConfigComponent} bind:configuration={deviceData.communication_options} />
            </div>
            <div class="device-section-div">
                <div class="title">
                    <h3>{$texts.deviceOptions}</h3>
                    <span>{$texts.deviceOptionsSub}</span>
                </div>
                <MeterOptionsConfig bind:deviceData bind:nodes bind:meterOptionsValid={deviceData.validation.meterOptions} />
            </div>
            <div class="device-section-div">
                <div class="title">
                    <h3>{$texts.deviceNodes}</h3>
                    <span>{$texts.deviceNodesSub}</span>
                </div>
                <div class="nodes-grid-div">
                    <NodesGrid
                        minHeight="200px"
                        {deviceData}
                        {nodesInit}
                        bind:nodes
                        bind:nodesBySection
                        onPropertyChanged={(node: EditableNodeRecord) => {
                            nodes = updateNodes(node, nodes);
                            editingNode = updateEditingNode(node, editingNode, nodes);
                        }}
                        onShowConfigPopup={(node: EditableNodeRecord, nodeEditingState: NodeRecordEditingState) => {
                            editingNode = node;
                            editingNodeState = nodeEditingState;
                            showConfigNodeWindow = true;
                        }}
                    />
                </div>
            </div>
            <!----------     A C T I O N     B U T T O N S     ---------->
            <div class="action-buttons-div">
                <Button
                    buttonText={$texts.cancel}
                    imageURL="/img/previous.svg"
                    onClick={async () => {
                        await navigateTo("/devices/dashboard");
                    }}
                />
                <Button
                    enabled={contentInit}
                    buttonText={$texts.add}
                    style={$SucessButtonStyle}
                    imageURL="/img/plus.svg"
                    onClick={() => {
                        if (validDeviceOperation(deviceData)) {
                            showAddWindow = true;
                        }
                    }}
                />
            </div>
        </div>
        <!----------     P O P U P     W I N D O W S     ---------->
        <PopupAddDevice
            bind:windowOpened={showAddWindow}
            processingRequest={performingAddRequest}
            onAdd={async () => {
                if (contentInit) {
                    performingAddRequest = true;
                    await addDeviceAPI(convertToDevice(deviceData), deviceData.device_image, convertToNodes(nodes)).call({ timeout: 5000 });
                    performingAddRequest = false;
                }
            }}
        />
        <!----------     N O D E     C O N F I G U R A T I O N     S H E E T     ---------->
        <NodeConfigSheet
            bind:showPanel={showConfigNodeWindow}
            onPropertyChanged={() => {
                nodes = updateNodes(editingNode, nodes);
                editingNode = updateEditingNode(editingNode, editingNode, nodes);
            }}
            {deviceData}
            node={editingNode}
            bind:nodeEditingState={editingNodeState}
        />
    {/if}
</div>

<style>
    /* Main content container for the edit device page */
    .content {
        display: flex;
        justify-content: flex-start;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100%;
    }

    /* Container for all add device sections */
    .add-device-div {
        height: 100%;
        width: 100%;
        min-width: 250px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
    }

    /* Device identification section: name, ID, image */
    .device-identification-div {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        margin: 0;
        padding: 0;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    /* Device image container styling */
    .device-identification-div .device-image-div {
        padding-top: 10px;
    }

    /* Section for device configuration options */
    .device-section-div {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        margin: 0;
        padding: 0;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    /* Title area for each device section */
    .device-section-div .title {
        display: flex;
        flex-direction: column;
        align-self: flex-start;
        gap: 10px;
        padding: 20px;
        padding-left: 0px;
        padding-right: 0px;
        width: 100%;
    }

    /* Section title text styling */
    .device-section-div h3 {
        color: #f5f5f5;
        font-size: 1rem;
        font-weight: 500;
        margin: 0;
        padding: 0;
    }

    /* Section subtitle text styling */
    .device-section-div span {
        color: rgb(170, 170, 170);
        font-weight: 400;
        margin: 0;
        padding: 0;
        line-height: 1.5;
    }

    /* Nodes grid container styling */
    .device-section-div .nodes-grid-div {
        width: 100%;
        height: fit-content;
        padding: 10px;
        padding-left: 0px;
        padding-right: 0px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
    }

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
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        margin: 0;
        padding: 0;
        width: 250px;
        height: 100%;
    }

    /* Action buttons container (save, cancel, delete) */
    .action-buttons-div {
        margin: 0;
        padding: 0;
        padding-top: 50px;
        padding-bottom: 50px;
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-columns: repeat(2, 250px);
        gap: 30px;
        justify-content: center;
        justify-items: center;
    }

    /* Responsive: stack action buttons vertically on small screens */
    @media (max-width: 1200px) {
        .action-buttons-div {
            grid-template-columns: 1fr;
        }
    }

    /* Responsive: limit add device container width on large screens */
    @media (min-width: 880px) {
        .add-device-div {
            width: 80%;
        }
    }
</style>
