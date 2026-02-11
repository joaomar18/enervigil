<script lang="ts">
    import { loginUserAPI } from "$lib/logic/api/auth";
    import { validateUsername, validatePassword } from "$lib/logic/validation/auth";
    import FormAlert from "../General/FormAlert.svelte";
    import LoginField from "./LoginField.svelte";
    import LoginButton from "./LoginButton.svelte";
    import Checkbox from "../General/Checkbox.svelte";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";
    import { activeAlertTexts } from "$lib/stores/lang/alertTexts";

    // Toast
    import { displayToast, toastKey, toastType, toastVariables } from "$lib/stores/view/toast";
    import { closeToast } from "$lib/logic/view/toast";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { LoginFormStyle, LoginFormAlertStyle } from "$lib/style/login";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $LoginFormStyle;

    // Layout / styling props
    export let backgroundColor: string | undefined = undefined;
    export let titleColor: string | undefined = undefined;
    export let textColor: string | undefined = undefined;
    export let titleWeight: string | undefined = undefined;
    export let textWeight: string | undefined = undefined;

    $: localOverrides = {
        backgroundColor,
        titleColor,
        textColor,
        titleWeight,
        textWeight,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Form State
    let username: string = "";
    let password: string = "";
    let autoLogin: boolean = false;

    // Login Flow Control
    let loginAttempt: boolean = false;
    let loginProcessing: boolean = false;

    // Validation Flags
    $: usernameIncorrect = !validateUsername(username) && loginAttempt;
    $: passwordIncorrect = !validatePassword(password) && loginAttempt;

    $: usernameErrorText = usernameIncorrect ? $texts.userInvalid : "";
    $: passwordErrorText = passwordIncorrect ? $texts.passwordInvalid : "";

    // Login Logic
    async function login(): Promise<void> {
        loginAttempt = true;
        loginProcessing = true;
        await loginUserAPI(username, password, autoLogin).call({ timeout: 5000 });
        loginProcessing = false;
    }
</script>

<!-- 
  LoginModal: Main login form component with username and password fields,
  error handling, persistent session checkbox, and action buttons.
-->
<div
    class="login-modal"
    style="
        --background-color: {mergedStyle.backgroundColor};
        --title-color: {mergedStyle.titleColor};
        --text-color: {mergedStyle.textColor};
        --title-weight: {mergedStyle.titleWeight};
        --text-weight: {mergedStyle.textWeight};
    "
>
    <h3>{$texts.title}</h3>
    {#if $displayToast}
        <div class="form-alert-div">
            <FormAlert
                style={$LoginFormAlertStyle}
                enableCloseButton={true}
                animation={"slide"}
                width="100%"
                alertText={$activeAlertTexts[$toastKey]}
                alertType={$toastType}
                alertVariables={$toastVariables}
                closeButtonClick={() => closeToast()}
            />
        </div>
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
            onSubmit={login}
        />
        <LoginField
            id="password"
            paddingTop="30px"
            imageUrl="/img/password.svg"
            fieldText={$texts.password}
            type="password"
            bind:value={password}
            incorrect={passwordIncorrect}
            incorrectText={passwordErrorText}
            hintText={$texts.passwordInfo}
            onSubmit={login}
        />
    </form>
    <div class="checkbox-div">
        <Checkbox bind:checked={autoLogin} inputName="auto-login" enabledBackgroundColor="#4caf7f" marginRight="10px" />
        <span class="keep-logged-in-text">{$texts.keepSessionLogged}</span>
    </div>
    <LoginButton processing={loginProcessing} paddingTop="30px" onClick={login} />
</div>

<style>
    /* Main container for the login modal */
    .login-modal {
        position: relative;
        box-sizing: content-box;
        margin: 0;
        padding: 0;
        width: 100%;
        height: 475px;
        background-color: var(--background-color);
        min-width: 260px;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        margin-left: 0%;
        z-index: 1;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
    }

    /* Login title */
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

    /* Wrapper for the form alert */
    .form-alert-div {
        position: absolute;
        top: 10px;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        width: 90%;
        height: fit-content;
        display: flex;
        justify-content: center;
        align-items: center;
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

    /* Wrapper for the "Keep me logged in" checkbox and label */
    .checkbox-div {
        width: 90%;
        margin: 0;
        padding-top: 30px;
        padding-bottom: 0px;
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
    }

    /* Label text for the checkbox */
    .keep-logged-in-text {
        font-size: 1.25rem;
        font-weight: var(--text-weight);
        color: var(--text-color);
    }

    /* Responsive layout for tablets */
    @media (min-width: 520px) {
        .login-modal {
            width: 90%;
            max-width: 32.5rem;
            border-radius: 20px;
        }
        .form-alert-div {
            width: 100%;
            padding-left: 50px;
            padding-right: 50px;
        }
        .checkbox-div {
            width: 100%;
            padding-left: 50px;
            padding-right: 50px;
        }
    }

    /* Full-width modal on large screens */
    @media (min-width: 1024px) {
        .login-modal {
            width: 32.5rem;
        }
    }
</style>
