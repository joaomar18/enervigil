<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { SSEHandler } from "$lib/logic/sse/sse";
    import type { RealTimeSystemData } from "$lib/types/analytics/system";

    // Navigation
    import { resetDashboardLoader } from "$lib/logic/view/navigation";
    import { loadedDone } from "$lib/stores/view/navigation";

    // Variables
    let realtimeStream: SSEHandler<RealTimeSystemData> | null = null;
    let cpuHistoryStream: SSEHandler<number[]> | null = null;
    let ramHistoryStream: SSEHandler<number[]> | null = null;
    let diskReadSpeedHistoryStream: SSEHandler<number[]> | null = null;
    let diskWriteSpeedHistoryStream: SSEHandler<number[]> | null = null;
    let realtimeData: RealTimeSystemData | undefined = undefined;
    let cpuHistoryData: number[] | undefined = undefined;
    let ramHistoryData: number[] | undefined = undefined;
    let diskReadSpeedData: number[] | undefined = undefined;
    let diskWriteSpeedData: number[] | undefined = undefined;

    // Reactive statements
    $: console.log(realtimeData);
    $: console.log(cpuHistoryData);
    $: console.log(ramHistoryData);
    $: console.log(diskReadSpeedData);
    $: console.log(diskWriteSpeedData);

    // Functions
    function closeAllStreams() {
        realtimeStream?.close();
        cpuHistoryStream?.close();
        ramHistoryStream?.close();
        diskReadSpeedHistoryStream?.close();
        diskWriteSpeedHistoryStream?.close();
        realtimeStream = null;
        cpuHistoryStream = null;
        ramHistoryStream = null;
        diskReadSpeedHistoryStream = null;
        diskWriteSpeedHistoryStream = null;
    }

    onMount(() => {
        resetDashboardLoader();
        window.addEventListener("beforeunload", closeAllStreams);

        realtimeStream = new SSEHandler<RealTimeSystemData>(
            "/sse/system/get_realtime_metrics",
            (data: RealTimeSystemData) => {
                realtimeData = data;
            },
            3000,
        );
        cpuHistoryStream = new SSEHandler(
            "/sse/system/get_cpu_usage_history",
            (data: number[]) => {
                cpuHistoryData = data;
            },
            3000,
        );
        ramHistoryStream = new SSEHandler(
            "/sse/system/get_ram_usage_history",
            (data: number[]) => {
                ramHistoryData = data;
            },
            3000,
        );
        diskReadSpeedHistoryStream = new SSEHandler(
            "/sse/system/get_disk_read_speed_history",
            (data: number[]) => {
                diskReadSpeedData = data;
            },
            3000,
        );
        diskWriteSpeedHistoryStream = new SSEHandler(
            "/sse/system/get_disk_write_speed_history",
            (data: number[]) => {
                diskWriteSpeedData = data;
            },
            3000,
        );
        loadedDone.set(true);
    });
    onDestroy(() => {
        window.removeEventListener("beforeunload", closeAllStreams);
        closeAllStreams();
    });
</script>

<style>
</style>
