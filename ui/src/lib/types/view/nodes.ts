import { NodeCategory } from "$lib/types/nodes/base";

/** Column visibility configuration with optional width and visibility state */
export interface ColumnVisibilityState {
    hideWidth?: number;
    visible: boolean;
}

/** Visibility configuration for all table columns in the nodes view */
export interface ColumnVisibilityMap {
    name: ColumnVisibilityState;
    unit: ColumnVisibilityState;
    type: ColumnVisibilityState;
    custom: ColumnVisibilityState;
    publish: ColumnVisibilityState;
    virtual: ColumnVisibilityState;
    logging: ColumnVisibilityState;
    logging_period: ColumnVisibilityState;
    enable: ColumnVisibilityState;
    actions: ColumnVisibilityState;
}

/**
 * Phase filter options available for selection in the UI.
 * Used for filtering node data by phase (L1, L2, L3) or viewing aggregated totals.
 */
export enum SelectablePhaseFilter {
    L1 = "L1",
    L2 = "L2",
    L3 = "L3",
    TOTAL = "Total",
}

/**
 * Energy flow direction filter options for electrical measurement data filtering in the UI.
 * Used to filter energy data by directional flow: forward (consumed), reverse (generated),
 * or total (bidirectional aggregate). Commonly applied in energy metering systems to
 * distinguish between energy consumption and energy production/feedback to the grid.
 *
 * @enum {string}
 * @property {string} FORWARD - Forward direction (energy consumed/imported).
 * @property {string} REVERSE - Reverse direction (energy generated/exported).
 * @property {string} TOTAL - Total of both forward and reverse directions.
 */
export enum EnergyDirectionFilter {
    FORWARD = "Forward",
    REVERSE = "Reverse",
    TOTAL = "Total",
}

/**
 * Time period options for displaying node historical data and logs.
 * Used in date range selectors for filtering node data by time spans.
 */
export enum LogSpanPeriod {
    currentHour = "lastHour",
    currentDay = "lastDay",
    current7Days = "current7Days",
    currentMonth = "currentMonth",
    currentYear = "currentYear",
    customDate = "customDate",
}

/** Time span configuration for node navigation history */
export interface NodeTimeSpan {
    initial_date: Date;
    end_date: Date;
    log_span_period: LogSpanPeriod;
}

/**
 * Time span configuration with phase and direction filters for energy consumption graph navigation history.
 * Extends basic time span with electrical phase (L1/L2/L3/Total) and energy direction (Forward/Reverse/Total) filters.
 */
export interface EnergyConsumptionTimeSpan {
    initial_date: Date;
    end_date: Date;
    log_span_period: LogSpanPeriod;
    phase: SelectablePhaseFilter;
    direction: EnergyDirectionFilter;
}

/**
 * Mapping configuration for metrics display in the UI, organizing metric keys by node category
 * with their corresponding internationalization text keys and icon file references.
 *
 * Structure maps NodeCategory → metric key → display configuration:
 * - textKey: Reference to internationalization text for metric labels
 * - imageFile: icon filename for visual metric identification
 *
 * Used by getMetricsViewVariables() to transform raw metrics data into view-ready format
 * with proper labels and icons for different node types (Measurements, Counters, etc.).
 */
export const metricsTextKeyMap: Record<string, Record<string, { textKey: string; imageFile: string }>> = {
    [NodeCategory.Measurements]: {
        max_value: { textKey: "maxValue", imageFile: "max-value.svg" },
        average_value: { textKey: "averageValue", imageFile: "average-value.svg" },
        min_value: { textKey: "minValue", imageFile: "min-value.svg" },
    },
    [NodeCategory.Counters]: {
        value: { textKey: "total", imageFile: "total-value.svg" },
    },
    [NodeCategory.States]: {},
    [NodeCategory.Texts]: {},
    [NodeCategory.Other]: {},
};
