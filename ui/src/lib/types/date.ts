import { get } from "svelte/store";
import { selectedLang } from "$lib/stores/lang/definition";
import { LogSpanPeriod } from "./view/nodes";

/**
 * Predefined time step intervals for data aggregation and chart display.
 * Used to specify the granularity of time-based data queries and visualization.
 *
 * @enum {string}
 * @property {string} _1m - 1 minute intervals for high-resolution monitoring
 * @property {string} _15m - 15 minute intervals for detailed short-term analysis  
 * @property {string} _1h - 1 hour intervals for daily trend analysis
 * @property {string} _1d - 1 day intervals for weekly/monthly overviews
 * @property {string} _1M - 1 month intervals for yearly trend analysis
 * @property {string} _1Y - 1 year intervals for long-term historical data
 */
export enum FormattedTimeStep {
    _1m = "1m", // 1 Minute
    _15m = "15m", // 15 Minutes
    _1h = "1h", // 1 Hour
    _1d = "1d", // 1 Day
    _1M = "1M", // 1 Month
    _1Y = "1Y", // 1 Year
}

/**
 * Time range categories for formatting elapsed time displays.
 * Used to determine appropriate precision and format for "time ago" strings.
 */
export enum ElapsedTime {
    lessThan1Min = "l_1m",
    lessThan1Hour = "l_1h",
    lessThan1Day = "l_1d",
    lessThan1Month = "l_1M",
    moreThan1Month = "h_1M"
}

/**
 * Represents a time interval with a start and an end date.
 * Typically used to describe the inclusive period over which data was collected or aggregated.
 */
export interface DatePeriod {
    initialDate: Date;
    endDate: Date;
}

/**
 * Represents a time interval using user-facing, formatted date/time strings.
 * These fields contain "elegant" display-ready strings (for example: "Nov 25, 2025 — 14:00")
 * intended for UI presentation instead of Date objects. Use when you need a readable
 * representation to render directly in the interface.
 */
export interface DatePeriodString {
    initialDate: string;
    endDate: string;
}

/**
 * Represents a complete date and time with string-formatted fields.
 * Used for form inputs where each component is handled as a separate string value.
 */
export interface DateTimeField {
    year: string;
    month: string;
    day: string;
    hour: string;
    minute: string;
}

/**
 * Validation result for a date-time range with detailed error breakdown.
 * Provides granular validation status for each component and overall validity.
 */
export interface DateTimeSpanValidation {
    validStartDate: boolean;
    validStartTime: boolean;
    validEndDate: boolean;
    validEndTime: boolean;
    invalidRange: boolean;
    valid: boolean;
}

/**
 * Time step formatting functions for chart axis labels and tooltips.
 * Maps each time step to a localized formatter based on granularity and context.
 */
export const timeStepFormatters: Record<FormattedTimeStep, (timestamp: number, logSpanPeriod: LogSpanPeriod) => string> = {
    [FormattedTimeStep._1m]: (timestamp: number, logSpanPeriod: LogSpanPeriod) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString(get(selectedLang).toLowerCase(), { hour: '2-digit', minute: '2-digit', hour12: false });
    },

    [FormattedTimeStep._15m]: (timestamp: number, logSpanPeriod: LogSpanPeriod) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString(get(selectedLang).toLowerCase(), { hour: '2-digit', minute: '2-digit', hour12: false });
    },

    [FormattedTimeStep._1h]: (timestamp: number, logSpanPeriod: LogSpanPeriod) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString(get(selectedLang).toLowerCase(), { hour: '2-digit', minute: '2-digit', hour12: false });
    },

    [FormattedTimeStep._1d]: (timestamp: number, logSpanPeriod: LogSpanPeriod) => {
        const date = new Date(timestamp * 1000);
        if (logSpanPeriod === LogSpanPeriod.current7Days) {
            return date.toLocaleDateString(get(selectedLang).toLowerCase(), { weekday: 'short' });
        }
        else {
            return date.getDate().toString().padStart(2, "0");
        }
    },

    [FormattedTimeStep._1M]: (timestamp: number, logSpanPeriod: LogSpanPeriod) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString(get(selectedLang).toLowerCase(), { month: 'short' });
    },

    [FormattedTimeStep._1Y]: (timestamp: number, logSpanPeriod: LogSpanPeriod) => {
        const date = new Date(timestamp * 1000);
        return date.getFullYear().toString();
    }
};