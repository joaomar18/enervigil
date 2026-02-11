<script lang="ts">
    import { closeToast } from "$lib/logic/view/toast";
    import { validateUsername, validatePassword, passwordMatch } from "$lib/logic/validation/auth";
    import { createUserConfigAPI } from "$lib/logic/api/auth";
    import FormAlert from "../General/FormAlert.svelte";
    import LoginField from "./LoginField.svelte";
    import Button from "../General/Button.svelte";

    // Texts
    import { activeAlertTexts } from "$lib/stores/lang/alertTexts";
    import { texts } from "$lib/stores/lang/generalTexts";

    // Alerts
    import { displayToast, toastKey, toastType, toastVariables } from "$lib/stores/view/toast";

    // Props
    export let windowOpened: boolean;

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { LoginFormAlertStyle, PopupUserConfigStyle, InitialSetupButtonStyle } from "$lib/style/login";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $PopupUserConfigStyle;

    // Layout / styling props
    export let backgroundColor: string | undefined = undefined;
    export let border: string | undefined = undefined;
    export let shadow: string | undefined = undefined;
    export let borderRadius: string | undefined = undefined;
    export let titleColor: string | undefined = undefined;
    export let titleWeight: string | undefined = undefined;

    $: localOverrides = {
        backgroundColor,
        border,
        shadow,
        borderRadius,
        titleColor,
        titleWeight,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Form State
    let username: string = "";
    let password: string = "";
    let confirmPassword: string = "";

    // Creation Flow Control
    let creationAttempt: boolean = false;
    let creationProcessing: boolean = false;

    // Validation Flags
    $: usernameIncorrect = !validateUsername(username) && creationAttempt;
    $: passwordIncorrect = !validatePassword(password) && creationAttempt;
    $: passwordNoMatch = !passwordMatch(password, confirmPassword) && creationAttempt;

    $: usernameErrorText = usernameIncorrect ? $texts.userInvalid : "";
    $: passwordErrorText = passwordIncorrect ? $texts.passwordInvalid : "";
    $: passwordNoMatchText = passwordNoMatch ? $texts.passwordNoMatch : "";

    // Export Function

    // Functions
    async function createUserConfig(): Promise<void> {
        creationAttempt = true;
        creationProcessing = true;
        await createUserConfigAPI(username, password, confirmPassword).call({ timeout: 5000 });
        creationProcessing = false;
    }
</script>

<!--
PopupUserConfig

Initial setup modal for creating the first user.
Handles username/password input, validation, and submission,
with inline errors and toast-based feedback.
-->
{#if windowOpened}
    <div
        style="
            --background-color: {mergedStyle.backgroundColor};
            --border: {mergedStyle.border};
            --shadow: {mergedStyle.shadow};
            --border-radius: {mergedStyle.borderRadius};
            --title-color: {mergedStyle.titleColor};
            --title-weight: {mergedStyle.titleWeight};
        "
        class="overlay-config-div"
    >
        <div class="overlay-config-div-content">
            <div class="window-div">
                <div class="modal-window-div">
                    <h3>{$texts.initialSetup}</h3>
                    {#if $displayToast}
                        <FormAlert
                            style={$LoginFormAlertStyle}
                            asToast={true}
                            animation={"slide"}
                            width="90%"
                            topPos="20px"
                            alertText={$activeAlertTexts[$toastKey]}
                            alertType={$toastType}
                            alertVariables={$toastVariables}
                            closeButtonClick={() => closeToast()}
                        />
                    {/if}
                    <form on:submit|preventDefault>
                        <LoginField
                            id="username"
                            paddingTop="30px"
                            imageUrl="/img/user.svg"
                            fieldText={$texts.username}
                            type="text"
                            bind:value={username}
                            incorrect={usernameIncorrect}
                            incorrectText={usernameErrorText}
                            hintText={$texts.userInfo}
                            onSubmit={createUserConfig}
                            pushIncorrectTextBottom={true}
                        />
                        <LoginField
                            id="new-password"
                            paddingTop="30px"
                            imageUrl="/img/password.svg"
                            fieldText={$texts.password}
                            type="password"
                            bind:value={password}
                            incorrect={passwordIncorrect}
                            incorrectText={passwordErrorText}
                            hintText={$texts.passwordInfo}
                            onSubmit={createUserConfig}
                            pushIncorrectTextBottom={true}
                        />
                        <LoginField
                            id="new-confirm-password"
                            paddingTop="30px"
                            imageUrl="/img/password.svg"
                            fieldText={$texts.confirmPassword}
                            type="password"
                            bind:value={confirmPassword}
                            incorrect={passwordNoMatch}
                            incorrectText={passwordNoMatchText}
                            hintText={$texts.passwordConfirmInfo}
                            onSubmit={createUserConfig}
                            pushIncorrectTextBottom={true}
                        />
                    </form>
                    <div class="confirm-button-div">
                        <Button style={$InitialSetupButtonStyle} processing={creationProcessing} buttonText={$texts.confirm} onClick={createUserConfig} />
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    /* Overlay for modal window */
    .overlay-config-div {
        position: absolute;
        inset: 0;
    }

    /* Overlay content container for modal */
    .overlay-config-div-content {
        margin: 0;
        padding: 0;
        position: relative;
        width: 100%;
        min-height: 100%;
        height: fit-content;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        background: rgba(24, 29, 35, 0.25);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 2;
    }

    /* Modal window container styling */
    .window-div {
        margin: 0;
        padding: 0px;
        position: relative;
        width: 100%;
        min-height: 100%;
        height: fit-content;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    /* Modal window content container styling */
    .modal-window-div {
        position: relative;
        margin: 0;
        padding: 0;
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        border: none;
        border-top: var(--border);
        border-bottom: var(--border);
        border-radius: 0px;
        gap: 20px;
        background-color: var(--background-color);
        box-shadow: var(--shadow);
    }

    /* Title style */
    h3 {
        margin: 0;
        padding: 0;
        padding-top: 30px;
        padding-bottom: 30px;
        height: 24px;
        color: var(--title-color);
        font-weight: var(--title-weight);
        font-size: 1.5rem;
    }

    /* Login fields form */
    form {
        margin: 0;
        padding: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: fit-content;
    }

    /* Button container style */
    .confirm-button-div {
        margin: 0;
        padding: 0;
        padding-top: 20px;
        padding-bottom: 30px;
        width: 100%;
        height: fit-content;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    /* Responsive layout for screens wider then tablets */
    @media (min-width: 520px) {
        .modal-window-div {
            width: 90%;
            max-width: 600px;
            border: var(--border);
            border-radius: var(--border-radius);
        }
    }
</style>
