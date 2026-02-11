<script lang="ts">
    import { slide } from "svelte/transition";
    import HintInfo from "../General/HintInfo.svelte";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { LoginFieldStyle } from "$lib/style/login";
    import { LoginHintInfoStyle } from "$lib/style/login";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $LoginFieldStyle;

    // Props
    export let id;
    export let hintText: string;
    export let incorrect: boolean;
    export let incorrectText: string;
    export let pushIncorrectTextBottom: boolean = false;
    export let type: string = "text"; // Input type (default is text)
    export let value: string = "";
    export let fieldText: string; //Visible text of the field
    export let imageUrl: string;

    // Layout / styling props
    export let paddingTop: string | undefined = undefined;
    export let paddingBottom: string | undefined = undefined;
    export let imageWidth: string | undefined = undefined;
    export let imageHeight: string | undefined = undefined;
    export let labelTextColor: string | undefined = undefined;

    $: localOverrides = {
        paddingTop,
        paddingBottom,
        imageWidth,
        imageHeight,
        labelTextColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let inputElement: HTMLInputElement;
    let showPassword: boolean = false;

    // Click Export Function
    export let onSubmit: () => void;

    // Functions
    function togglePassword(): void {
        showPassword = !showPassword;
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter") {
            event.preventDefault();
            if (onSubmit) {
                onSubmit();
            }
        } else if (event.key === "Escape") {
            inputElement.blur();
        }
    }
</script>

<!-- 
  InputField: Reusable form field with icon, error handling, and optional show/hide password logic.
-->
<div
    class="field"
    style="
        --padding-top: {mergedStyle.paddingTop};
        --padding-bottom: {mergedStyle.paddingBottom};
        --label-text-color: {mergedStyle.labelTextColor};
    "
>
    <span class="field-name">{fieldText}</span>
    <div class="input-div">
        <img
            class="field-image"
            style="
                --image-width:{mergedStyle.imageWidth}; 
                --image-height:{mergedStyle.imageHeight};
            "
            src={imageUrl}
            alt={fieldText}
        />
        {#if type === "password"}
            {#if !showPassword}
                <input
                    bind:this={inputElement}
                    type="password"
                    {id}
                    autocomplete="current-password"
                    style="padding-right:50px; {incorrect ? 'border: 2px solid #D72638' : ''}"
                    bind:value
                    on:keydown={handleKeydown}
                />
            {:else}
                <input
                    bind:this={inputElement}
                    type="text"
                    {id}
                    autocomplete="current-password"
                    style="padding-right:50px; {incorrect ? 'border: 2px solid #D72638' : ''}"
                    bind:value
                    on:keydown={handleKeydown}
                />
            {/if}
        {:else}
            <input
                bind:this={inputElement}
                type="text"
                {id}
                autocomplete="username"
                bind:value
                style={incorrect ? "border: 2px solid #D72638" : ""}
                on:keydown={handleKeydown}
            />
        {/if}
        {#if type === "password"}
            <div class="show-hide-div" style="width:{mergedStyle.imageWidth}; height:{mergedStyle.imageHeight};">
                <div class="show-hide-content">
                    <img
                        class="show-hide-img"
                        src={showPassword ? "./img/show.svg" : "./img/hide.svg"}
                        alt={showPassword ? "show" : "hide"}
                        style="width:{mergedStyle.imageWidth}; heigh:{mergedStyle.imageHeight};"
                    />
                    <button class="show-hide-btn" on:click={togglePassword} aria-label="Show Password" tabindex="-1"></button>
                </div>
            </div>
        {/if}
        {#if incorrect}
            {#if !pushIncorrectTextBottom}
                <div class="warning-div">
                    <HintInfo labelText={incorrectText} style={$LoginHintInfoStyle}>
                        <span class="warning-text">{hintText}</span>
                    </HintInfo>
                </div>
            {:else}
                <div class="warning-div">
                    <HintInfo labelText={""} style={$LoginHintInfoStyle}>
                        <span class="warning-text">{hintText}</span>
                    </HintInfo>
                </div>
            {/if}
        {/if}
    </div>
    {#if incorrect && pushIncorrectTextBottom}
        <div in:slide={{ duration: 300 }} out:slide={{ duration: 300 }} class="incorrect-text-bottom">
            <HintInfo enableHint={false} labelText={incorrectText} style={$LoginHintInfoStyle} />
        </div>
    {/if}
</div>

<style>
    /* Wrapper container for the field */
    .field {
        width: 90%;
        padding-top: var(--padding-top, "0px");
        padding-bottom: var(--padding-bottom, "0px");
        display: flex;
        justify-content: start;
        align-items: center;
        flex-direction: column;
        box-sizing: border-box;
    }

    /* Label text above input */
    .field-name {
        font-size: 1.25rem;
        font-weight: 300;
        color: var(--label-text-color);
        width: 100%;
        padding-bottom: 10px;
    }

    /* Container for input and icons */
    .input-div {
        width: 100%;
        position: relative;
        height: fit-content;
    }

    /* Input icon on the left */
    .field-image {
        margin: 0;
        padding: 0;
        width: var(--image-width);
        height: var(--image-height);
        top: 50%;
        left: calc((50px - var(--image-width)) / 2);
        transform: translateY(-50%);
        position: absolute;
    }

    /* Password toggle (eye icon) wrapper */
    .show-hide-div {
        margin: 0;
        padding: 0;
        top: 50%;
        right: calc((50px - 32px) / 2);
        transform: translateY(-50%);
        position: absolute;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
    }

    /* Wrapper for the show/hide toggle button */
    .show-hide-content {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        position: relative;
        -webkit-tap-highlight-color: transparent;
    }

    /* Toggle eye icon */
    .show-hide-img {
        padding: 0;
        margin: 0;
    }

    /* Transparent button for toggling password visibility */
    .show-hide-btn {
        left: 0;
        top: 0;
        margin: 0;
        padding: 0;
        position: absolute;
        opacity: 0;
        width: 100%;
        height: 100%;
        cursor: pointer;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }

    /* Styled input field */
    input {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 40px;
        font-size: 1.25rem;
        padding-left: 50px;
        outline: none;
        box-shadow: none;
    }

    /* Error container styling */
    .warning-div {
        position: absolute;
        width: max-content;
        top: -10px;
        right: 0px;
        transform: translateY(-100%);
    }

    /* Container to show error text on bottom of field */
    .incorrect-text-bottom {
        width: 100%;
        padding-top: 10px;
    }

    /* Error container text styling */
    .warning-text {
        padding: 10px;
        padding-right: 40px;
        font-size: 1rem;
        font-weight: 300;
        line-height: 1.5;
        color: white;
    }

    /* Responsive padding and width for larger screens */
    @media (min-width: 520px) {
        .field {
            padding-left: 50px;
            padding-right: 50px;
            width: 100%;
        }
    }
</style>
