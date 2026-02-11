<script lang="ts">
    import { onMount } from "svelte";

    // Navigation
    import { resetDashboardLoader } from "$lib/logic/view/navigation";


    onMount(() => {
        resetDashboardLoader();
    })
</script>

<style>
</style>
