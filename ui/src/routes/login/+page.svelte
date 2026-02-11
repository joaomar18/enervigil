<script lang="ts">
    import { fade } from "svelte/transition";
    import { onMount } from "svelte";
    import Header from "../../components/Login/Header.svelte";
    import Info from "../../components/Login/Info.svelte";
    import LoginForm from "../../components/Login/LoginForm.svelte";

    // Stores
    import { loadedDone, userConfigSetup } from "$lib/stores/view/navigation";
    import PopupUserConfig from "../../components/Login/PopupUserConfig.svelte";

    // Mount function
    onMount(() => {
        loadedDone.set(true);
    });
</script>

<!-- 
  LoginPage: Entry route for login.
  Displays a header, login form, and optional info section on large screens.
-->
<div class="container" in:fade={{ duration: 300 }}>
    <Header />
    <div class="content">
        <div class="column" id="first-col">
            <LoginForm />
        </div>
        <div class="column" id="second-col">
            <Info appImageUrl="/img/smart-meter.png" />
        </div>
        <PopupUserConfig windowOpened={$userConfigSetup} />
    </div>
</div>

<style>
    /* Main container uses grid layout */
    .container {
        position: relative;
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100vh;
        min-width: 350px;
        min-height: 600px;
    }

    .content {
        position: relative;
        margin: 0;
        padding: 0;
        width: 100%;
        height: calc(100% - 74px);
        display: grid;
        grid-template-columns: 1fr;
        align-items: center;
        justify-items: center;
    }

    /* Shared styling for both columns */
    .column {
        position: relative;
        padding: 0;
        margin: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
    }

    /* Left column - login form */
    #first-col {
        background-color: #181d23;
    }

    /* Right column - info (hidden by default) */
    #second-col {
        background: #202731;
        display: none;
    }

    /* On desktop: show both columns */
    @media (min-width: 1280px) {
        .column {
            width: 100%;
        }
        .content {
            grid-template-columns: 1fr 1fr;
        }
        #second-col {
            display: flex;
        }
    }
</style>
