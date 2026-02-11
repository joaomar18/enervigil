import { getDaysInMonth, getDateFromField } from "../util/date";
import type { DateTimeField, DateTimeSpanValidation } from "$lib/types/date";


/**
 * Validates if date components contain valid values within acceptable ranges.
 * @param date - Object with year, month, and day (strings, numbers, or null)
 * @returns True if all non-null components are valid, false otherwise
 */
export function validDate(date: { year: string | number | null, month: string | number | null, day: string | number | null }): boolean {
    if (date.year !== null) {
        if (date.year === "") return false;
        if (Number(date.year) < 0 || Number(date.year) > 9999) return false;
    }
    if (date.month !== null) {
        if (date.month === "") return false;
        if (Number(date.month) < 1 || Number(date.month) > 12) return false;
    }
    if (date.day !== null && date.year !== null && date.month !== null) {
        if (date.day === "") return false;
        if (Number(date.day) < 1 || Number(date.day) > getDaysInMonth(Number(date.year), Number(date.month))) return false;
    }
    return true;
}


/**
 * Validates if time components contain valid values within 24-hour format ranges.
 * @param time - Object with hour, minute, and second (strings, numbers, or null)
 * @returns True if all non-null components are valid, false otherwise
 */
export function validTime(time: { hour: string | number | null, minute: string | number | null, second: string | number | null }): boolean {
    if (time.hour !== null) {
        if (time.hour === "") return false;
        if (Number(time.hour) < 0 || Number(time.hour) > 23) return false;
    }
    if (time.minute !== null) {
        if (time.minute === "") return false;
        if (Number(time.minute) < 0 || Number(time.minute) > 59) return false;
    }
    if (time.second !== null) {
        if (time.second === "") return false;
        if (Number(time.second) < 0 || Number(time.second) > 59) return false;
    }
    return true;
}

/**
 * Validates a complete date-time range and provides detailed validation results with error information.
 * @param startDateTime - Start date and time fields to validate
 * @param endDateTime - End date and time fields to validate
 * @returns Object containing detailed validation breakdown, localized error message key, and variables for message substitution
 */
export function validTimeSpan(startDateTime: DateTimeField, endDateTime: DateTimeField): { validation: DateTimeSpanValidation, messageKey: string | null, messageVariables: Record<string, string | number> } {
    let validStartDate = validDate({ year: startDateTime.year, month: startDateTime.month, day: startDateTime.day });
    let validStartTime = validTime({ hour: startDateTime.hour, minute: startDateTime.minute, second: null });
    let validEndDate = validDate({ year: endDateTime.year, month: endDateTime.month, day: endDateTime.day });
    let validEndTime = validTime({ hour: endDateTime.hour, minute: endDateTime.minute, second: null });
    let invalidRange = validStartDate && validStartTime && validEndDate && validEndTime && getDateFromField(startDateTime) >= getDateFromField(endDateTime);
    let validation = {
        validStartDate: validStartDate,
        validStartTime: validStartTime,
        validEndDate: validEndDate,
        validEndTime: validEndTime,
        invalidRange: invalidRange,
        valid: validStartDate && validStartTime && validEndDate && validEndTime && !invalidRange
    } as DateTimeSpanValidation;
    let { messageKey, messageVariables } = getValidationErrorMessage(validation);
    return { validation, messageKey, messageVariables };
}

/**
 * Determines the appropriate error message key based on validation results.
 * Returns the first validation error found in priority order.
 * @param validation - DateTimeSpanValidation object with individual validation flags
 * @returns Object with error message key and variables for localization, or null if all valid
 */
export function getValidationErrorMessage(validation: DateTimeSpanValidation): { messageKey: string | null, messageVariables: Record<string, string | number> } {
    if (!validation.validStartDate) return { messageKey: "invalidStartDate", messageVariables: {} };
    if (!validation.validStartTime) return { messageKey: "invalidStartTime", messageVariables: {} };
    if (!validation.validEndDate) return { messageKey: "invalidEndDate", messageVariables: {} };
    if (!validation.validEndTime) return { messageKey: "invalidEndTime", messageVariables: {} };
    if (validation.invalidRange) return { messageKey: "invalidPeriodRange", messageVariables: {} };
    return { messageKey: null, messageVariables: {} };
}