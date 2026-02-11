<script lang="ts">
    import { fade } from "svelte/transition";
    import { onMount } from "svelte";
    import { closeToast } from "$lib/logic/view/toast";
    import { isDeviceViewPage } from "$lib/logic/view/navigation";
    import LeftPanel from "./LeftPanel.svelte";
    import Header from "./Header.svelte";
    import DevicesHeader from "./DevicesHeader.svelte";
    import Toast from "../General/Toast.svelte";
    import MenuButton from "../General/MenuButton.svelte";
    import Logo from "../General/Logo.svelte";
    import Action from "../General/Action.svelte";
    import CircularLoaderFullScreen from "../General/CircularLoaderFullScreen.svelte";

    // Style
    import { DashboardContainerStyle } from "$lib/style/dashboard";
    $: effectiveStyle = $DashboardContainerStyle;

    // Stores
    import { currentPage, leftPanelOpen, loadedDone, showSubLoader } from "$lib/stores/view/navigation";
    import { displayToast, toastKey, toastType, toastVariables } from "$lib/stores/view/toast";

    // Texts
    import { activeAlertTexts } from "$lib/stores/lang/alertTexts";
    import { texts } from "$lib/stores/lang/generalTexts";
    import ToolTipText from "../General/ToolTipText.svelte";

    // Variables
    let headerEl: HTMLDivElement;
    let leftHeaderEl: HTMLDivElement;
    let mobileSearchOpen: boolean;
    let clickEventListenerDefined: boolean = false;

    // Reactive Statements
    $: if (mobileSearchOpen && !clickEventListenerDefined) {
        window.addEventListener("click", handleClickOutside);
        clickEventListenerDefined = true;
    }

    $: if (!mobileSearchOpen && clickEventListenerDefined) {
        window.removeEventListener("click", handleClickOutside);
        clickEventListenerDefined = false;
    }

    // Functions
    function handleClickOutside(event: MouseEvent): void {
        if (leftHeaderEl && headerEl && !leftHeaderEl.contains(event.target as HTMLElement) && !headerEl.contains(event.target as HTMLElement)) {
            mobileSearchOpen = false;
        }
    }

    onMount(() => {
        const desktopMatch = window.matchMedia("(min-width: 880px)");
        const closeMobileSearchOnDesktop = (e: MediaQueryListEvent) => {
            if (e.matches) {
                mobileSearchOpen = false;
            }
        };
        desktopMatch.onchange = closeMobileSearchOnDesktop;

        //Clean-up logic
        return () => {
            desktopMatch.onchange = null;
            if (clickEventListenerDefined) {
                window.removeEventListener("click", handleClickOutside);
            }
        };
    });
</script>

<!-- 
  Dashboard Container:
    • Main dashboard layout with left sidebar panel and header navigation.
    • Content area includes toast notifications, loading spinner, and page content slot.
    • Responsive design with sidebar that auto-opens on desktop and collapses on mobile.
    • Handles loading states with spinner overlay until content is ready.
-->
<div
    style="
        --scrollbar-track-color: {effectiveStyle.scrollbarTrackColor};
        --scrollbar-thumb-color: {effectiveStyle.scrollbarThumbColor};
    "
    class="dashboard-container"
    in:fade={{ duration: 300 }}
>
    <LeftPanel bind:leftPanelOpen={$leftPanelOpen} activeSection={$currentPage} />
    <div class="left-header-div" bind:this={leftHeaderEl} class:left-panel-open={$leftPanelOpen}>
        <div class="menu-button-div" class:close={mobileSearchOpen}>
            <MenuButton bind:menuOpen={$leftPanelOpen} />
        </div>
        <div class="close-mobile-search-div" class:open={mobileSearchOpen}>
            <Action
                imageURL="/img/previous.svg"
                enableToolTip={true}
                onClick={() => {
                    mobileSearchOpen = false;
                }}
            >
                <div slot="tooltip"><ToolTipText text={$texts.goBack} /></div>
            </Action>
        </div>
        <div
            class="logo-div"
            class:close={mobileSearchOpen}
            class:device-view-page={isDeviceViewPage($currentPage)}
            class:management-page={!isDeviceViewPage($currentPage)}
        >
            <Logo />
        </div>
    </div>
    {#if isDeviceViewPage($currentPage)}
        <DevicesHeader />
    {:else}
        <Header bind:headerEl bind:mobileSearchOpen />
    {/if}
    <main class="content" class:open={$leftPanelOpen}>
        <div class="alerts-div" class:prioritize={$displayToast} class:sidebar-open={$leftPanelOpen}>
            {#if $displayToast}
                <Toast
                    bottomPos="0px"
                    toastText={$activeAlertTexts[$toastKey]}
                    toastType={$toastType}
                    toastVariables={$toastVariables}
                    onClick={closeToast}
                />
            {/if}
        </div>
        <div class="container-div">
            <div class="content-div">
                <CircularLoaderFullScreen closeWrapper={$loadedDone} showLoader={$showSubLoader} />
                <div class="section-content-div" class:hide={!$loadedDone}>
                    <slot class="section-content-div" />
                </div>
            </div>
        </div>
    </main>
</div>

<style>
    /* Left side header (menu/logo/actions) */
    .left-header-div {
        position: fixed;
        left: 0px;
        top: 0px;
        width: fit-content;
        height: 74px;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 101;
    }

    .left-header-div.left-panel-open {
        z-index: 121;
    }

    /* Hidden logo slot until enabled */
    .left-header-div .logo-div {
        box-sizing: border-box;
        position: fixed;
        left: 56px;
        width: calc(250px - 56px);
        display: none;
        justify-content: start;
        align-items: center;
        padding-left: 25px;
    }

    .left-header-div .logo-div.close {
        display: none;
    }

    /* Menu button position */
    .left-header-div .menu-button-div {
        position: absolute;
        left: 10px;
    }

    .left-header-div .menu-button-div.close {
        display: none;
    }

    /* Close-search button slot (mobile only) */
    .left-header-div .close-mobile-search-div {
        position: absolute;
        left: 10px;
        display: none;
    }

    .left-header-div .close-mobile-search-div.open {
        display: block;
    }

    /* Main dashboard flex container */
    .dashboard-container {
        position: relative;
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100dvh;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
    }

    /* Dashboard content area with slide-in margin */
    .dashboard-container .content {
        box-sizing: border-box;
        position: relative;
        padding-left: 0px;
        width: 100%;
        height: 100%;
        transition: padding-left 0.2s ease-in-out;
        overflow-y: auto;
        overflow-x: auto;
        scrollbar-width: auto;
        scrollbar-color: var(--scrollbar-track-color) var(--scrollbar-thumb-color);
    }

    /* Fixed div for alerts display */
    .dashboard-container .content .alerts-div {
        position: fixed;
        bottom: 0px;
        width: 100%;
        left: 0;
        z-index: 99;
        transition: margin-left 0.2s ease-in-out;
    }

    /* Send alerts div to front */
    .dashboard-container .content .alerts-div.prioritize {
        z-index: 120;
    }

    /* Container: outer wrapper with padding and full height */
    .dashboard-container .content .container-div {
        box-sizing: border-box;
        margin: 0;
        padding: 20px;
        width: 100%;
        height: fit-content;
        min-width: 350px;
        min-height: calc(100dvh - 74px);
    }

    /* Content div */
    .dashboard-container .content .container-div .content-div {
        width: 100%;
        height: fit-content;
        margin: 0;
        padding: 0;
        position: relative;
    }

    /* Section Content div to nest the content of specific pages */
    .dashboard-container .container-div .content-div .section-content-div {
        width: 100%;
        height: fit-content;
        margin: 0;
        padding: 0;
        position: relative;
    }

    /* Hide Section Content div */
    .dashboard-container .container-div .content-div .section-content-div.hide {
        display: none;
    }

    /* Desktop layout: sidebar padding and alert positioning when sidebar is open */
    @media (min-width: 880px) {
        .dashboard-container .content.open {
            padding-left: 250px;
        }
        .dashboard-container .content .alerts-div.sidebar-open {
            margin-left: 250px;
            width: calc(100% - 250px);
        }
        .left-header-div .logo-div.device-view-page {
            display: flex;
        }
        .left-header-div .logo-div.device-view-page.close {
            display: none;
        }
    }

    /* Show logo slot and fixed header margin on wider screens */
    @media (min-width: 470px) {
        .left-header-div .logo-div.management-page {
            display: flex;
        }
        .left-header-div .logo-div.management-page.close {
            display: none;
        }
        .dashboard-container .content .container-div {
            padding: 30px;
        }
    }
</style>
