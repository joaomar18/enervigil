<script lang="ts">
    import "uplot/dist/uPlot.min.css";
    import uPlot from "uplot";
    import { onMount } from "svelte";
    import ContentCard from "../General/ContentCard.svelte";
    import { BaseGraphStyle } from "$lib/style/graph";
    import { selectedLang, type Language } from "$lib/stores/lang/definition";
    import { texts } from "$lib/stores/lang/systemTexts";
    import { formatSystemBytes, formatSystemNumber } from "$lib/logic/util/system";
    import { getRootFontFamily } from "$lib/logic/util/style";

    // Props
    export let title: string;
    export let data: number[] | undefined;
    export let percentage = false;
    export let stale = false;

    // The backend sends newest-first windows at 1 s intervals; plot oldest to newest.
    const WINDOW_SIZE = 60;
    let container: HTMLDivElement;
    let graph: uPlot | null = null;
    let mounted = false;

    $: points = (data ?? []).slice(0, WINDOW_SIZE).reverse().map((value) => Number.isFinite(value) ? value : null);
    $: alignedData = [points.map((_, index) => index - points.length + 1), points] as uPlot.AlignedData;
    $: latestValue = points.length ? points[points.length - 1] : null;
    $: latestText = formatValue(latestValue, percentage, $selectedLang, $texts.unavailable);
    $: hasData = points.some((value) => value !== null);
    $: if (mounted) createGraph(title, percentage, $BaseGraphStyle, $selectedLang, $texts);
    $: if (graph) graph.setData(alignedData);

    function formatValue(value: number | null | undefined, percent: boolean, language: Language, unavailable: string): string {
        const formatted = percent ? formatSystemNumber(value, language) : formatSystemBytes(value, language);
        return formatted === null ? unavailable : `${formatted}${percent ? " %" : "/s"}`;
    }

    function createGraph(label: string, percent: boolean, style: Record<string, string | number>, language: Language, labels: Record<string, string>): void {
        graph?.destroy();
        const stroke = String(style.graphTextColor);
        const grid = { stroke: String(style.graphGridLineColor) };
        const font = `12px ${getRootFontFamily()}`;
        graph = new uPlot({
            width: Math.max(1, container.clientWidth),
            height: 220,
            padding: [12, 16, 0, 0],
            legend: { show: false },
            cursor: { drag: { x: false, y: false } },
            scales: {
                x: { time: false, range: [-59, 0] },
                y: { range: (_plot, _min, max) => [0, percent ? 100 : Math.max(1, max * 1.1)] },
            },
            axes: [
                { stroke, font, grid, size: 35, splits: (plot) => plot.width < 400 ? [-45, -30, -15, 0] : [-50, -40, -30, -20, -10, 0],
                    values: (_plot, values) => values.map((value) => `${Math.abs(value)} s`) },
                { stroke, font, grid, size: percent ? 48 : 82,
                    values: (_plot, values) => values.map((value) => formatValue(value, percent, language, labels.unavailable)) },
            ],
            series: [{}, {
                label,
                stroke: "#559dff",
                fill: "rgba(85, 157, 255, 0.12)",
                width: 2,
                points: { show: (plot) => plot.data[0].length === 1, size: 5 },
            }],
        }, alignedData, container);
    }

    onMount(() => {
        mounted = true;
        const observer = new ResizeObserver(() => {
            graph?.setSize({ width: Math.max(1, container.clientWidth), height: 220 });
        });
        observer.observe(container);
        return () => {
            observer.disconnect();
            graph?.destroy();
        };
    });
</script>

<ContentCard titleText={title} useScroll={false} height="auto" contentPaddingBottom="15px">
    <div slot="content" class="history" style="--text-color: {$BaseGraphStyle.graphTextColor}; --sub-text-color: {$BaseGraphStyle.subTextColor};">
        <div class="summary">
            <strong>{data === undefined ? $texts.loading : latestText}</strong>
            <span>{stale ? $texts.stale : $texts.history}</span>
        </div>
        <div class="chart" class:empty={!hasData} role="img" aria-label={`${title}: ${latestText}. ${$texts.secondsAgo}`}>
            <div bind:this={container}></div>
            {#if !hasData}
                <div class="empty-state">{stale ? $texts.stale : data === undefined ? $texts.loading : $texts.unavailable}</div>
            {/if}
        </div>
        <div class="axis-label">{$texts.secondsAgo}</div>
    </div>
</ContentCard>

<style>
    .history {
        width: 100%;
        min-width: 0;
        color: var(--text-color);
    }

    .summary {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px 16px;
        padding: 5px 10px 15px;
    }

    strong {
        font-size: 1.4rem;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
    }

    span, .axis-label {
        color: var(--sub-text-color);
        font-size: 0.8rem;
    }

    .axis-label {
        text-align: center;
        padding-top: 5px;
    }

    .chart {
        position: relative;
        width: 100%;
        min-width: 0;
        height: 220px;
    }

    .empty :global(.uplot) {
        visibility: hidden;
    }

    .empty-state {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: var(--sub-text-color);
    }
</style>
