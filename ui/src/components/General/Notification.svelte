<script lang="ts">
    import ToolTip from "./ToolTip.svelte";
    import ToolTipText from "./ToolTipText.svelte";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { NotificationStyle } from "$lib/style/general";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Props
    export let notificationsOpen: boolean = false;
    export let notificationsNumber: string;
    export let enableToolTip: boolean = true;
    export let toolTipAutoPos: boolean = true;

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $NotificationStyle;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let borderRadius: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let hoverColor: string | undefined = undefined;
    export let borderColor: string | undefined = undefined;
    export let imageWidth: string | undefined = undefined;
    export let imageHeight: string | undefined = undefined;
    export let numberBackgroundColor: string | undefined = undefined;
    export let numberTextColor: string | undefined = undefined;
    export let showToolTipDelay: number | undefined = undefined;

    $: localOverrides = {
        width,
        height,
        borderRadius,
        backgroundColor,
        hoverColor,
        borderColor,
        imageWidth,
        imageHeight,
        numberBackgroundColor,
        numberTextColor,
        showToolTipDelay,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let showToolTip: boolean = false;
    let showToolTipTimeout: ReturnType<typeof setTimeout> | null = null;
    let showToolTipDelayNumber: number;

    // Reactive Statements
    $: showToolTipDelayNumber = parseInt(String(mergedStyle.showToolTipDelay));

    // Functions
    function handleClick(): void {
        notificationsOpen = !notificationsOpen;
    }

    function handleMouseEnter(): void {
        if (enableToolTip) {
            showToolTipTimeout = setTimeout(() => {
                showToolTip = true;
            }, showToolTipDelayNumber);
        }
    }

    function handleMouseLeave(): void {
        if (enableToolTip) {
            if (showToolTipTimeout) {
                clearTimeout(showToolTipTimeout);
                showToolTipTimeout = null;
            }
            showToolTip = false;
        }
    }
</script>

<!-- 
  Notifications Button: Clickable bell icon with unread count badge, and toogle notifications window
-->
<div
    class="notifications-button-div"
    style="
        --width: {mergedStyle.width};
        --height: {mergedStyle.height};
        --border-radius: {mergedStyle.borderRadius};
        --background-color: {mergedStyle.backgroundColor};
        --hover-color: {mergedStyle.hoverColor};
        --border-color: {mergedStyle.borderColor};
        --image-width: {mergedStyle.imageWidth};
        --image-height: {mergedStyle.imageHeight};
        --number-background-color: {mergedStyle.numberBackgroundColor};
        --number-text-color: {mergedStyle.numberTextColor};
    "
>
    {#if notificationsOpen}
        <img src="/img/bell-on.svg" alt="Bell Off" />
    {:else}
        <img src="/img/bell-off.svg" alt="Bell On" />
    {/if}
    {#if notificationsNumber}
        <div class="notifications-number-text-div">
            <span>{notificationsNumber}</span>
        </div>
    {/if}
    <button on:click={handleClick} on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave} aria-label="Toggle Notifications"></button>
    <ToolTip {showToolTip} autoPosition={toolTipAutoPos}>
        <ToolTipText text={$texts.notifications} />
    </ToolTip>
</div>

<style>
    /* Container: circular notification button */
    .notifications-button-div {
        box-sizing: border-box;
        background-color: var(--background-color);
        border: 1px solid var(--border-color);
        display: flex;
        justify-content: center;
        align-items: center;
        width: var(--width);
        height: var(--height);
        border-radius: var(--border-radius);
        position: relative;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
    }

    /* Hover state: provide visual feedback */
    .notifications-button-div:hover {
        background-color: var(--hover-color);
    }

    /* Badge: red circle showing unread count */
    .notifications-number-text-div {
        position: absolute;
        width: 26px;
        height: 26px;
        border-radius: 13px;
        background-color: var(--number-background-color);
        text-align: center;
        left: -12px;
        bottom: -12px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    /* Badge text: styled number inside badge */
    .notifications-number-text-div span {
        display: inline-block;
        color: var(--number-text-color);
        font-weight: 500;
        font-size: 1rem;
        line-height: 24px;
    }

    /* Invisible overlay button: captures clicks across entire area */
    button {
        background: transparent;
        cursor: pointer;
        border: none;
        position: absolute;
        width: 100%;
        height: 100%;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }

    /* Button hover: keep transparent to avoid color shift */
    button:hover {
        background: transparent;
    }

    /* Icon sizing: fixed dimensions for the bell icon */
    img {
        width: var(--image-width, 25px);
        height: var(--image-height, 25px);
    }
</style>
