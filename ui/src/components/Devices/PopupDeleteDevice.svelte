<script lang="ts">
    import ModalWindow from "../General/ModalWindow.svelte";
    import InputField from "../General/InputField.svelte";
    import Button from "../General/Button.svelte";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Styles
    import { DangerInputFieldStyle } from "$lib/style/general";
    import { SubDangerButtonStyle } from "$lib/style/button";

    // Props
    export let deviceName: string;
    export let windowOpened: boolean;
    export let processingRequest: boolean;

    // Variables
    let deleteDeviceName: string = "";

    // Reactive Statements
    $: if (!windowOpened) {
        deleteDeviceName = "";
    }

    // Export Delete Function
    export let onDelete: () => void | Promise<void>;

    // Functions
    async function handleDelete(): Promise<void> {
        if (onDelete) {
            await onDelete();
        }
        windowOpened = false;
    }
</script>

<!-- 
  Popup Delete Device:
    • Modal confirmation dialog for permanently deleting devices from the system.
    • Features a backdrop overlay with blur effect and centered modal window.
    • Requires user to type device name exactly to confirm deletion (safety measure).
    • Uses danger styling (red) to emphasize destructive action.
    • Button remains disabled until device name is correctly entered.
-->
{#if windowOpened}
    <div class="overlay-device-div">
        <div class="overlay-device-div-content">
            <div class="window-div">
                <ModalWindow
                    title={`${$texts.deleteDevice} ${deviceName}`}
                    minWidth="300px"
                    maxWidth="550px"
                    disableCloseWindow={processingRequest}
                    closeWindow={() => {
                        windowOpened = false;
                    }}
                >
                    <div class="modal-window-div">
                        <span>{$texts.deleteDeviceInfo}</span>
                        <div class="input-field-div">
                            <InputField bind:inputValue={deleteDeviceName} infoText={$texts.confirmDeleteDevice} style={$DangerInputFieldStyle} />
                        </div>
                        <div class="button-div">
                            <Button
                                processing={processingRequest}
                                enabled={deleteDeviceName === deviceName}
                                buttonText={$texts.confirm}
                                style={$SubDangerButtonStyle}
                                onClick={handleDelete}
                            />
                        </div>
                    </div>
                </ModalWindow>
            </div>
        </div>
    </div>
{/if}

<style>
    /* Overlay for modal window */
    .overlay-device-div {
        position: absolute;
        inset: 0;
    }

    /* Overlay content container for modal */
    .overlay-device-div-content {
        margin: 0;
        padding: 0;
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        background: rgba(24, 29, 35, 0.25);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 2;
    }

    /* Modal window container styling */
    .overlay-device-div-content .window-div {
        width: 100%;
        height: fit-content;
        margin: 0;
        padding: 0;
        position: sticky;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    /* Modal window content container styling */
    .overlay-device-div-content .window-div .modal-window-div {
        position: relative;
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        gap: 20px;
    }

    /* Modal window text styling */
    .overlay-device-div-content .window-div span {
        font-size: 1rem;
        font-weight: 400;
        color: #e74c3c;
        line-height: 1.5;
        text-align: left;
        word-break: break-word;
    }

    /* Input field container inside modal window */
    .overlay-device-div-content .window-div .input-field-div {
        margin: 0;
        width: 100%;
        height: fit-content;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding: 20px;
        padding-left: 0px;
        padding-right: 0px;
    }

    /* Button container inside modal window */
    .overlay-device-div-content .window-div .button-div {
        margin: 0;
        width: 100%;
        height: fit-content;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding: 10px;
        padding-left: 0px;
        padding-right: 0px;
    }
</style>
