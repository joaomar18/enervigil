<script lang="ts">
    import { navigateTo } from "$lib/logic/view/navigation";
    import { logoutUserAPI } from "$lib/logic/api/auth";
    import Action from "../General/Action.svelte";
    import SearchBar from "./SearchBar.svelte";
    import Notification from "../General/Notification.svelte";
    import Logout from "./Logout.svelte";
    import ToolTipText from "../General/ToolTipText.svelte";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Stores
    import { leftPanelOpen, searchQuery } from "$lib/stores/view/navigation";

    // Props
    export let headerEl: HTMLDivElement;
    export let mobileSearchOpen: boolean;
</script>

<!-- 
  Dashboard Header:
    • Fixed top navigation bar with menu toggle, logo, search functionality, and user actions.
    • Left section: Menu button (desktop) and logo, with mobile search close button when active.
    • Right section: Search bar, notifications, and logout button.
    • Mobile responsive: Search bar expands to full width on mobile when activated.
    • Handles click-outside events to close mobile search automatically.
-->
<div class="header-div" bind:this={headerEl}>
    <div class="main-header-div" class:collapse={mobileSearchOpen}>
        <div class="center-div" class:open={mobileSearchOpen}>
            <SearchBar
                onClick={async () => {
                    await navigateTo("/devices/dashboard", { searchQuery: $searchQuery });
                }}
                bind:searchString={$searchQuery}
                placeholderText={$texts.searchDevice}
                minWidth="250px"
                maxWidth="650px"
            />
        </div>
        <div class="right-div" class:close={mobileSearchOpen}>
            <div class="open-search-bar-div" class:close={mobileSearchOpen}>
                <Action
                    imageURL="/img/search.svg"
                    onClick={() => {
                        leftPanelOpen.set(false);
                        mobileSearchOpen = true;
                    }}
                    enableToolTip={true}
                >
                    <div slot="tooltip"><ToolTipText text={$texts.searchDevice} /></div>
                </Action>
            </div>
            <Notification notificationsNumber={"1"} />
            <Logout
                buttonText={$texts.logout}
                imageUrl="/img/logout.svg"
                enableToolTip={true}
                onClick={async () => {
                    await logoutUserAPI().call({ timeout: 5000 });
                }}
            >
                <div slot="tooltip"><ToolTipText text={$texts.logout} /></div>
            </Logout>
        </div>
    </div>
</div>

<style>
    /* Top fixed header */
    .header-div {
        position: sticky;
        top: 0;
        background-color: #181d23;
        flex-shrink: 0;
        width: 100%;
        height: 74px;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }

    /* Main header area for search & actions */
    .header-div .main-header-div {
        margin: 0;
        padding: 0;
        margin-left: 46px;
        width: 100%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        z-index: 99;
    }

    .header-div .main-header-div.collapse {
        margin-left: 0;
    }

    /* Hidden search bar on mobile, flex on desktop */
    .center-div {
        flex: 1;
        display: none;
        justify-content: center;
        align-items: center;
    }

    .center-div.open {
        padding-left: 48px;
        padding-right: 10px;
        display: flex;
    }

    /* Mobile search open icon wrapper */
    .open-search-bar-div {
        flex: 1;
        display: flex;
        justify-content: start;
        align-items: center;
        padding-left: 20px;
    }

    .open-search-bar-div.close {
        display: none;
    }

    /* Right header action icons */
    .right-div {
        padding-right: 20px;
        width: fit-content;
        height: fit-content;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        gap: 20px;
    }

    .right-div.close {
        display: none;
    }

    /* Desktop layout: show search bar and slide panel margin */
    @media (min-width: 880px) {
        .center-div {
            display: flex;
        }
        .open-search-bar-div {
            display: none;
        }
        .header-div .main-header-div {
            justify-content: space-between;
        }
    }

    /* Show fixed header margin on wider screens */
    @media (min-width: 470px) {
        .header-div .main-header-div {
            margin-left: 250px;
        }
    }
</style>
