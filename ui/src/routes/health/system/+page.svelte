<script lang="ts">
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { SSEHandler } from "$lib/logic/sse/sse";
    import type { RealTimeSystemData } from "$lib/types/analytics/system";
    import ContentCard from "../../../components/General/ContentCard.svelte";
    import SystemHistoryGraph from "../../../components/Health/SystemHistoryGraph.svelte";
    import { BaseGraphStyle } from "$lib/style/graph";
    import { texts } from "$lib/stores/lang/systemTexts";
    import { selectedLang, type Language } from "$lib/stores/lang/definition";
    import { formatSystemBytes, formatSystemNumber } from "$lib/logic/util/system";
    import { convertDateToLocalDate } from "$lib/logic/util/date";

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
    const STALE_AFTER_MS = 5000;
    let now = Date.now();
    let startedAt = now;
    let receivedAt = { realtime: 0, cpu: 0, ram: 0, read: 0, write: 0 };

    // Reactive statements
    // Unsupported disk metrics can have empty histories (the SSE endpoint sends only heartbeats).
    $: activeUpdates = [
        receivedAt.realtime,
        receivedAt.cpu,
        receivedAt.ram,
        ...(realtimeData?.disk_read === null ? [] : [receivedAt.read]),
        ...(realtimeData?.disk_write === null ? [] : [receivedAt.write]),
    ];
    $: stale = activeUpdates.some((time) => now - (time || startedAt) > STALE_AFTER_MS);
    $: waiting = activeUpdates.some((time) => time === 0);
    $: status = stale ? $texts.stale : waiting ? $texts.loading : $texts.live;
    $: diskPercent =
        realtimeData?.disk_usage != null && realtimeData.disk_total != null && realtimeData.disk_total > 0
            ? (realtimeData.disk_usage / realtimeData.disk_total) * 100
            : null;
    $: bootTime = realtimeData?.boot_date ? Date.parse(realtimeData.boot_date) : NaN;
    $: uptimeMinutes = Number.isFinite(bootTime) ? Math.floor(Math.max(0, now - bootTime) / 60000) : null;
    $: bootDate = $selectedLang && Number.isFinite(bootTime) ? convertDateToLocalDate(realtimeData?.boot_date ?? null) : null;
    $: metrics = [
        {
            label: $texts.cpu,
            value: formatMetric(realtimeData?.cpu_use_perc, " %", $selectedLang, $texts.unavailable),
            detail: "",
            percent: realtimeData?.cpu_use_perc,
        },
        {
            label: $texts.ram,
            value: formatMetric(realtimeData?.ram_use_perc, " %", $selectedLang, $texts.unavailable),
            detail: formatCapacity(realtimeData?.ram_usage, realtimeData?.total_ram, $selectedLang, $texts.used),
            percent: realtimeData?.ram_use_perc,
        },
        {
            label: $texts.disk,
            value: formatMetric(diskPercent, " %", $selectedLang, $texts.unavailable),
            detail: formatCapacity(realtimeData?.disk_usage, realtimeData?.disk_total, $selectedLang, $texts.used),
            percent: diskPercent,
        },
        {
            label: $texts.temperature,
            value: formatMetric(realtimeData?.cpu_temperature, " °C", $selectedLang, $texts.unavailable),
            detail: "",
            percent: null,
        },
        {
            label: $texts.uptime,
            value:
                uptimeMinutes === null
                    ? $texts.unavailable
                    : `${Math.floor(uptimeMinutes / 1440)} d ${Math.floor(uptimeMinutes / 60) % 24} h ${uptimeMinutes % 60} min`,
            detail: bootDate ? `${$texts.boot}: ${bootDate}` : "",
            percent: null,
        },
    ];

    // Functions
    function formatMetric(value: number | null | undefined, unit: string, language: Language, unavailable: string): string {
        const formatted = formatSystemNumber(value, language);
        return formatted === null ? unavailable : `${formatted}${unit}`;
    }

    function formatCapacity(used: number | null | undefined, total: number | null | undefined, language: Language, label: string): string {
        const usedText = formatSystemBytes(used, language);
        const totalText = formatSystemBytes(total, language);
        return usedText && totalText ? `${usedText} / ${totalText} ${label}` : "";
    }

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
        startedAt = Date.now();
        const timer = setInterval(() => {
            now = Date.now();
        }, 1000);
        window.addEventListener("beforeunload", closeAllStreams);

        realtimeStream = new SSEHandler<RealTimeSystemData>(
            "/sse/system/get_realtime_metrics",
            (data: RealTimeSystemData) => {
                realtimeData = data;
                receivedAt.realtime = Date.now();
            },
            3000,
        );
        cpuHistoryStream = new SSEHandler(
            "/sse/system/get_cpu_usage_history",
            (data: number[]) => {
                cpuHistoryData = data;
                receivedAt.cpu = Date.now();
            },
            3000,
        );
        ramHistoryStream = new SSEHandler(
            "/sse/system/get_ram_usage_history",
            (data: number[]) => {
                ramHistoryData = data;
                receivedAt.ram = Date.now();
            },
            3000,
        );
        diskReadSpeedHistoryStream = new SSEHandler(
            "/sse/system/get_disk_read_speed_history",
            (data: number[]) => {
                diskReadSpeedData = data;
                receivedAt.read = Date.now();
            },
            3000,
        );
        diskWriteSpeedHistoryStream = new SSEHandler(
            "/sse/system/get_disk_write_speed_history",
            (data: number[]) => {
                diskWriteSpeedData = data;
                receivedAt.write = Date.now();
            },
            3000,
        );
        loadedDone.set(true);
        return () => {
            clearInterval(timer);
            window.removeEventListener("beforeunload", closeAllStreams);
            closeAllStreams();
        };
    });
</script>

<div
    class="content"
    in:fade={{ duration: 300 }}
    style="--text-color: {$BaseGraphStyle.graphTextColor}; --sub-text-color: {$BaseGraphStyle.subTextColor}; --border-color: {$BaseGraphStyle.borderColor};"
>
    <ContentCard titleText={$texts.overview} height="auto" useScroll={false}>
        <span slot="header" class="status" role="status">{status}</span>
        <div slot="content" class="metrics">
            {#each metrics as metric}
                <div class="metric">
                    <span class="label">{metric.label}</span>
                    <strong>{realtimeData === undefined ? $texts.loading : metric.value}</strong>
                    {#if metric.percent != null && Number.isFinite(metric.percent)}
                        <progress max="100" value={Math.max(0, Math.min(100, metric.percent))} aria-label={metric.label}></progress>
                    {/if}
                    {#if metric.detail}<span class="detail">{metric.detail}</span>{/if}
                </div>
            {/each}
        </div>
    </ContentCard>
    <div class="graphs">
        <SystemHistoryGraph title={$texts.cpu} data={cpuHistoryData} percentage={true} stale={now - (receivedAt.cpu || startedAt) > STALE_AFTER_MS} />
        <SystemHistoryGraph title={$texts.ram} data={ramHistoryData} percentage={true} stale={now - (receivedAt.ram || startedAt) > STALE_AFTER_MS} />
        <SystemHistoryGraph
            title={$texts.diskRead}
            data={realtimeData?.disk_read === null ? [] : diskReadSpeedData}
            stale={realtimeData?.disk_read !== null && now - (receivedAt.read || startedAt) > STALE_AFTER_MS}
        />
        <SystemHistoryGraph
            title={$texts.diskWrite}
            data={realtimeData?.disk_write === null ? [] : diskWriteSpeedData}
            stale={realtimeData?.disk_write !== null && now - (receivedAt.write || startedAt) > STALE_AFTER_MS}
        />
    </div>
</div>

<style>
    .content {
        width: 100%;
        max-width: 1620px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
        color: var(--text-color);
    }

    .status {
        display: flex;
        align-items: center;
        height: 100%;
        font-size: 0.8rem;
        color: var(--sub-text-color);
    }

    .metrics {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 24px;
        padding-top: 10px;
    }

    .metric {
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: start;
        gap: 10px;
        padding: 0 10px;
    }

    .label,
    .detail {
        color: var(--sub-text-color);
        font-size: 0.85rem;
    }

    .detail {
        line-height: 1.5;
        overflow-wrap: anywhere;
    }

    strong {
        font-size: 1.5rem;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
        overflow-wrap: anywhere;
    }

    progress {
        appearance: none;
        width: 100%;
        height: 5px;
        border: 0;
        border-radius: 4px;
        overflow: hidden;
        background: var(--border-color);
    }

    progress::-webkit-progress-bar {
        background: var(--border-color);
    }

    progress::-webkit-progress-value {
        background: #559dff;
        border-radius: 4px;
    }

    progress::-moz-progress-bar {
        background: #559dff;
        border-radius: 4px;
    }

    .graphs {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px;
    }

    @media (max-width: 946px) {
        .graphs {
            grid-template-columns: minmax(0, 1fr);
        }
    }
</style>
