<script lang="ts">
    import ModalWindow from "../General/ModalWindow.svelte";
    import Button from "../General/Button.svelte";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Styles
    import { SubSucessButtonStyle } from "$lib/style/button";

    // Props
    export let windowOpened: boolean;
    export let processingRequest: boolean;

    // Export Add Function
    export let onAdd: () => void | Promise<void>;

    // Functions
    async function handleAdd(): Promise<void> {
        if (onAdd) {
            await onAdd();
        }
        windowOpened = false;
    }
</script>

<!-- 
  Popup Add Device:
    • Modal confirmation dialog for adding new devices to the system.
    • Features a backdrop overlay with blur effect and centered modal window.
    • Displays confirmation message and confirm button with processing state.
    • Accepts callback function for handling device addition logic.
    • Auto-closes modal after successful device addition.
-->
{#if windowOpened}
    <div class="overlay-device-div">
        <div class="overlay-device-div-content">
            <div class="window-div">
                <ModalWindow
                    title={`${$texts.addNewDevice}`}
                    minWidth="300px"
                    maxWidth="550px"
                    closeWindow={() => {
                        windowOpened = false;
                    }}
                >
                    <div class="modal-window-div">
                        <span class="add-window-text">{$texts.addNewDeviceInfo}</span>
                        <div class="button-div save-window-button">
                            <Button processing={processingRequest} buttonText={$texts.confirm} style={$SubSucessButtonStyle} onClick={handleAdd} />
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
        color: rgb(170, 170, 170);
        line-height: 1.5;
        text-align: left;
        word-break: break-word;
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
        padding-top: 20px;
        padding-left: 0px;
        padding-right: 0px;
    }
</style>
