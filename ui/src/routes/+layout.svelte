<script lang="ts">
    import { get } from "svelte/store";
    import { onMount } from "svelte";
    import { beforeNavigate, afterNavigate } from "$app/navigation";
    import { initializeClientLayout, resolveNavigationRedirect, navigateTo } from "$lib/logic/view/navigation";
    import { isAuthenticationPage, isDashboardPage } from "$lib/logic/view/navigation";
    import { setInitialLeftPanelState } from "$lib/logic/view/navigation";
    import { syncUIState } from "$lib/logic/view/navigation";
    import SplashLoader from "../components/Dashboard/SplashLoader.svelte";
    import DashboardContainer from "../components/Dashboard/DashboardContainer.svelte";
    import { APICaller } from "$lib/logic/api/api";

    // Authorization stores
    import { currentPage, splashDone, userAuthenticated } from "$lib/stores/view/navigation";

    // On Mount Function
    onMount(async () => {
        APICaller.init();
        setInitialLeftPanelState();
        await initializeClientLayout();
    });

    beforeNavigate(({ to }) => {
        if (!to) return;
        let result = resolveNavigationRedirect(to.url, get(userAuthenticated));
        if (!result.redirectTarget) return;
        navigateTo(result.redirectTarget, {}, false, true);
    });

    afterNavigate(({ to }) => {
        if (!to) return;
        syncUIState(to.url);
    });
</script>

<!-- 
  Layout Wrapper:  
    • Shows splash screen until app initialization completes.  
    • After initialization, renders DashboardContainer (with sidebar, header, and content area) for dashboard pages.
    • On authentication pages (/login), renders only the page content directly.  
-->
{#if !$splashDone}
    <SplashLoader />
{:else if isDashboardPage($currentPage) && $userAuthenticated}
    <DashboardContainer>
        <slot />
    </DashboardContainer>
{:else if isAuthenticationPage($currentPage) && !$userAuthenticated}
    <slot />
{:else}
    <slot />
{/if}
