import type { Language } from "$lib/stores/lang/definition";

/** Formats system metrics without treating missing readings as zero. */
export function formatSystemNumber(value: number | null | undefined, language: Language): string | null {
    if (value == null || !Number.isFinite(value)) return null;
    return value.toLocaleString(language === "PT" ? "pt-PT" : "en-US", { maximumFractionDigits: 1 });
}

/** Uses binary units for byte counts and disk throughput. */
export function formatSystemBytes(value: number | null | undefined, language: Language): string | null {
    if (value == null || !Number.isFinite(value) || value < 0) return null;
    const units = ["B", "KiB", "MiB", "GiB", "TiB"];
    const index = value === 0 ? 0 : Math.max(0, Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1));
    return `${formatSystemNumber(value / 1024 ** index, language)} ${units[index]}`;
}
