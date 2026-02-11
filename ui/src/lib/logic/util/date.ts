import { get } from "svelte/store";
import { selectedLang } from "$lib/stores/lang/definition";
import { ElapsedTime, FormattedTimeStep, type DateTimeField } from "$lib/types/date";
import { LogSpanPeriod } from "$lib/types/view/nodes";


/**
 * Creates a new DateTimeField object with zero-padded string values from a Date object or empty strings.
 * @param date - Optional Date object to populate the fields from. If null, all fields are empty strings.
 * @returns A DateTimeField with zero-padded strings: year (4 digits), month/day/hour/minute (2 digits each), or empty strings if date is null.
 */
export function createDateTimeField(date: Date | null = null): DateTimeField {
    return {
        year: date ? String(date.getFullYear()).padStart(4, "0") : "",
        month: date ? String(date.getMonth() + 1).padStart(2, "0") : "",
        day: date ? String(date.getDate()).padStart(2, "0") : "",
        hour: date ? String(date.getHours()).padStart(2, "0") : "",
        minute: date ? String(date.getMinutes()).padStart(2, "0") : "",
    } as DateTimeField;
}


/**
 * Gets the number of days in a specific month and year (handles leap years).
 * @param year - Full year number
 * @param month - Month number (1-12)
 * @returns Number of days in the month
 */
export function getDaysInMonth(year: number, month: number): number {
    if (month < 1 || month > 12) throw new Error(`Month number is out of index: ${month}.`);
    return new Date(year, month, 0).getDate();
}


/**
 * Converts a date string to a localized date string with time, based on the selected language.
 * @param date - ISO date string or null.
 * @returns Localized date string with time (e.g., "12 de setembro de 2025, 14:30") or null if input is null.
 */
export function convertDateToLocalDate(date: string | null): string | null {
    if (date === null) return null;
    let newDate = new Date(date);
    const localDate = newDate.toLocaleDateString(get(selectedLang) === "PT" ? "pt-PT" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
    return localDate;
}

/**
 * Converts a date string to a localized time string based on the selected language.
 * @param date - ISO date string.
 * @returns Localized time string (e.g., "14:30").
 */
export function convertDateToLocalTime(date: string): string {
    let newDate = new Date(date);
    const localTime = newDate.toLocaleTimeString(get(selectedLang) === "PT" ? "pt-PT" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
    return localTime;
}

/**
 * Safely converts an ISO date string to a Date object with null handling.
 * @param isoString - ISO date string or null to convert
 * @returns Date object if conversion succeeds, null if input is null or invalid
 */
export function convertISOToDate(isoString: string | null): Date | null {
    if (!isoString) return null;
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? null : date;
}

/**
 * Converts a Date object to an ISO string representation with local timezone offset.
 *
 * Unlike the native Date.toISOString() which always returns UTC time (ending with 'Z'),
 * this function returns the date in the local timezone with the appropriate offset
 * (e.g., '+01:00', '-05:00').
 *
 * @param date - The Date object to convert
 * @returns ISO string with local timezone offset (e.g., "2025-10-08T14:30:00.000+01:00")
 * @throws TypeError if the input is not a Date object
 */
export function toISOStringLocal(date: Date): string {
    if (!(date instanceof Date)) throw new TypeError("Expected a Date object");

    const pad = (n: number, z: number = 2) => ("00" + n).slice(-z);
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
    const offsetMinutes = pad(Math.abs(offset) % 60);

    return (
        date.getFullYear() +
        "-" +
        pad(date.getMonth() + 1) +
        "-" +
        pad(date.getDate()) +
        "T" +
        pad(date.getHours()) +
        ":" +
        pad(date.getMinutes()) +
        ":" +
        pad(date.getSeconds()) +
        "." +
        pad(date.getMilliseconds(), 3) +
        sign +
        offsetHours +
        ":" +
        offsetMinutes
    );
}

/**
 * Converts a log period enum to complete date ranges for full periods.
 * @param period - The time span period to convert
 * @returns Object with initial_date (period start) and end_date (next period start)
 */
export function getTimeSpanFromLogPeriod(period: LogSpanPeriod): { initial_date: Date; end_date: Date } {
    let initial_date = new Date();
    let end_date: Date;

    switch (period) {
        case LogSpanPeriod.currentHour:
            initial_date.setMinutes(0, 0, 0);
            end_date = new Date(initial_date);
            end_date.setHours(end_date.getHours() + 1);
            return { initial_date, end_date };

        case LogSpanPeriod.currentDay:
            initial_date.setHours(0, 0, 0, 0);
            end_date = new Date(initial_date);
            end_date.setDate(end_date.getDate() + 1);
            return { initial_date, end_date };

        case LogSpanPeriod.current7Days:
            initial_date.setHours(0, 0, 0, 0);
            while (initial_date.getDay() != 1) {
                initial_date.setDate(initial_date.getDate() - 1);
            }
            end_date = new Date(initial_date);
            end_date.setDate(end_date.getDate() + 7);
            return { initial_date, end_date };

        case LogSpanPeriod.currentMonth:
            initial_date.setHours(0, 0, 0, 0);
            initial_date.setDate(1);
            end_date = new Date(initial_date);
            end_date.setMonth(end_date.getMonth() + 1);
            return { initial_date, end_date };

        case LogSpanPeriod.currentYear:
            initial_date.setHours(0, 0, 0, 0);
            initial_date.setMonth(0, 1);
            end_date = new Date(initial_date);
            end_date.setFullYear(end_date.getFullYear() + 1);
            return { initial_date, end_date };

        default:
            throw new Error(`Invalid Log Span Period: ${period}`);
    }
}

/**
 * Converts a DateTimeField object to a JavaScript Date object.
 * @param dateTimeField - Object containing year, month, day, hour, and minute as strings
 * @returns Date object constructed from the field values (month is adjusted from 1-12 to 0-11)
 */
export function getDateFromField(dateTimeField: DateTimeField): Date {
    return new Date(Number(dateTimeField.year), Number(dateTimeField.month) - 1, Number(dateTimeField.day), Number(dateTimeField.hour), Number(dateTimeField.minute));
}

/**
 * Converts a 2-digit year to a 4-digit year by choosing the century closest to the current year.
 * @param yy - Two-digit year (0-99)
 * @returns Four-digit year in the century closest to the current date
 */
export function interpretYY(yy: string): string {

    const currentYear = new Date().getFullYear();
    const currentCentury = Math.floor(currentYear / 100) * 100;
    const yearCurrCentury = currentCentury + Number(yy);
    const yearPrevCentury = (currentCentury - 100) + Number(yy);
    const yearNextCentury = currentCentury + 100 + Number(yy);

    const candidates = [yearCurrCentury, yearPrevCentury, yearNextCentury];
    return String(candidates.reduce((closest, candidate) => {
        const diffCurrent = Math.abs(currentYear - candidate);
        const diffClosest = Math.abs(currentYear - closest);
        return diffCurrent < diffClosest ? candidate : closest;
    }));
}

/**
 * Extracts the last two digits of a year string to get the short year format.
 * @param yyyy - Full year string (e.g., "2025")
 * @returns Two-digit year string (e.g., "25")
 */
export function getShortYear(yyyy: string): string {
    return yyyy.slice(-2);
}

/**
 * Converts an ISO date string to Unix timestamp in milliseconds.
 * @param date - ISO date string to convert
 * @returns Unix timestamp in milliseconds since epoch
 */
export function convertISOToTimestamp(date: string): number {
    return new Date(date).getTime();
}

/**
 * Formats a date into an elegant string with localized day of week and month names.
 * @param date - Date object to format
 * @returns Formatted string: "seg. 21 dez. 2025, 14:30" (PT) or "mon. 21 Dec 2025, 14:30" (EN)
 */
export function getElegantStringFromDate(date: Date): string {

    const dayOfWeek = date.toLocaleDateString(get(selectedLang), { weekday: "short" });
    const dayOfMonth = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleDateString(get(selectedLang), { month: "short" });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString(get(selectedLang), {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });

    return `${dayOfWeek} ${dayOfMonth} ${month} ${year}, ${time}`;
}

/**
 * Formats a date into a compact string appropriate for different time steps in tooltips.
 * @param date - Date object to format
 * @param timeStep - The time granularity to determine format detail level
 * @returns Compact formatted string optimized for tooltip display
 */
export function getElegantShortStringFromDate(date: Date, timeStep: FormattedTimeStep): string {
    const lang = get(selectedLang);

    switch (timeStep) {
        case FormattedTimeStep._1m:
        case FormattedTimeStep._15m:
        case FormattedTimeStep._1h:
            return date.toLocaleTimeString(lang, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            });

        case FormattedTimeStep._1d:
            const dayOfWeek = date.toLocaleDateString(lang, { weekday: "short" });
            const day = String(date.getDate()).padStart(2, "0");
            return `${dayOfWeek} ${day} `;

        case FormattedTimeStep._1M:
            const month = date.toLocaleDateString(lang, { month: "short" });
            const year = date.getFullYear();
            return `${month} ${year} `;

        case FormattedTimeStep._1Y:
            return date.getFullYear().toString();
    }
}

/**
 * Categorizes elapsed time between two dates using calendar-aware calculations.
 * Uses proper date arithmetic to handle DST changes, varying month lengths, and leap years.
 * @param date - The past date to calculate elapsed time from
 * @param now - The current date to compare against  
 * @returns ElapsedTime category for determining appropriate display format
 * @throws Error if date is later than current date
 */
export function getElapsedTime(date: Date, now: Date): ElapsedTime {
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) throw new Error(`Date is later than current date`);

    const oneMinuteAgo = new Date(now);
    oneMinuteAgo.setMinutes(now.getMinutes() - 1);

    const oneHourAgo = new Date(now);
    oneHourAgo.setHours(now.getHours() - 1);

    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(now.getDate() - 1);

    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);

    if (date > oneMinuteAgo) {
        return ElapsedTime.lessThan1Min;
    }
    else if (date > oneHourAgo) {
        return ElapsedTime.lessThan1Hour;
    }
    else if (date > oneDayAgo) {
        return ElapsedTime.lessThan1Day;
    }
    else if (date > oneMonthAgo) {
        return ElapsedTime.lessThan1Month;
    }

    return ElapsedTime.moreThan1Month;
}

/**
 * Calculates elapsed time from an ISO date string and returns localization key with variables.
 * Provides structured data for internationalized time formatting with proper pluralization.
 * @param isoString - ISO date string or null to calculate elapsed time from
 * @returns Object with translation key and variables for template substitution
 */
export function getElegantElapsedTimeFromIsoDate(isoString: string | null): { key: string, variables: Record<string, string | number> } {

    const lang = get(selectedLang);
    const now = new Date();
    const date = convertISOToDate(isoString);
    let key = "";
    let variables: Record<string, string | number> = {};

    if (date === null) return { key: "never", variables };
    let elapsedTime = getElapsedTime(date, now);

    const diffMs = now.getTime() - date.getTime();
    const totalSeconds = Math.max(1, Math.floor(diffMs / 1000));
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const days = Math.floor(totalHours / 24);

    switch (elapsedTime) {
        case ElapsedTime.lessThan1Min:
            key = "elapsedSeconds";
            variables["seconds"] = seconds;
            variables["plural"] = variables["seconds"] > 1 ? "s" : "";
            break;

        case ElapsedTime.lessThan1Hour:
            key = "elapsedMinutes";
            variables["minutes"] = minutes;
            variables["plural"] = variables["minutes"] > 1 ? "s" : "";
            break;

        case ElapsedTime.lessThan1Day:
            key = "elapsedHours";
            variables["hours"] = hours;
            variables["minutes"] = minutes;
            variables["hours_plural"] = variables["hours"] > 1 ? "s" : "";
            variables["minutes_plural"] = variables["minutes"] > 1 ? "s" : "";
            break;

        case ElapsedTime.lessThan1Month:
            key = "elapsedDays";
            variables["days"] = days;
            variables["hours"] = hours;
            variables["days_plural"] = variables["days"] > 1 ? "s" : "";
            variables["hours_plural"] = variables["hours"] > 1 ? "s" : "";
            break;

        case ElapsedTime.moreThan1Month:
            key = "elapsedFullDate";
            const month = date.toLocaleDateString(lang, { month: "short" });
            const year = date.getFullYear();
            variables["date"] = `${String(date.getDate()).padStart(2, "0")} ${month} ${year}`;
            variables["time"] = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
            break;
    }

    return { key, variables };
}