import type { NodeType } from "./base";
import type { FormattedTimeStep } from "../date";
import { GraphType } from "$lib/logic/view/graph/base";

/*****     C O N S T A N T S     *****/

/*****     E N U M S     *****/

/*****     I N T E R F A C E S     *****/

/**
 * Base interface for logged data points with time range information.
 * @property {string} start_time - ISO timestamp or custom string for display marking the beginning of the logging period
 * @property {string} end_time - ISO timestamp or custom string for display marking the end of the logging period
 */
export interface BaseLogPoint {
    start_time: string;
    end_time: string;
}

/**
 * Base processed log point with Unix timestamps for chart rendering.
 * @property {number} start_time - Unix timestamp (seconds) marking the beginning of the logging period
 * @property {number} end_time - Unix timestamp (seconds) marking the end of the logging period
 */
export interface ProcessedBaseLogPoint {
    start_time: number;
    end_time: number;
}

/**
 * Base interface for all metric types providing common structure.
 */
export interface BaseMetrics {
}

/**
 * Statistical metrics for measurement data display.
 * @property {number | null} max_value - Maximum value in the dataset
 * @property {number | null} average_value - Mean value of the dataset
 * @property {number | null} min_value - Minimum value in the dataset
 * @property {string | null} min_value_start_time - ISO 8601 timestamp of when the minimum value period started
 * @property {string | null} min_value_end_time - ISO 8601 timestamp of when the minimum value period ended
 * @property {string | null} max_value_start_time - ISO 8601 timestamp of when the maximum value period started
 * @property {string | null} max_value_end_time - ISO 8601 timestamp of when the maximum value period ended
 */
export interface MeasurementMetrics extends BaseMetrics {
    max_value: number | null;
    average_value: number | null;
    min_value: number | null;
    min_value_start_time: string | null;
    min_value_end_time: string | null;
    max_value_start_time: string | null;
    max_value_end_time: string | null;
}

/**
 * Metrics for single-value data without statistical aggregations.
 * Used for derived values, ratios, or metrics that represent a single
 * point value rather than a range with min/max/average.
 *
 * @property {number | string | null} value - The single metric value
 */
export interface SingleValueMetrics extends BaseMetrics {
    value: number | string | null;
}

/**
 * Metrics for counter/accumulator data display.
 * @property {number | null} value - Current accumulated value
 */
export interface CounterMetrics extends BaseMetrics {
    value: number | null;
}

/**
 * Metrics for energy consumption data display with electrical power analysis.
 * @property {number | null} active_energy - Active energy consumption in kWh (real power consumed)
 * @property {number | null} reactive_energy - Reactive energy consumption in kVArh (power used for magnetic fields)
 * @property {number | null} power_factor - Power factor value (ratio of active to apparent power, typically 0-1)
 * @property {string | null} power_factor_direction - Direction indicator for power factor (e.g., "leading", "lagging", "unity")
 */
export interface EnergyConsumptionMetrics extends BaseMetrics {
    active_energy: number | null;
    reactive_energy: number | null;
    power_factor: number | null;
    power_factor_direction: string | null;
}

/**
 * Raw node logs with metadata and unprocessed log points from backend API.
 * @property {string | null} unit - Measurement unit (e.g., "V", "A", "kW")
 * @property {number | null} decimal_places - Number of decimal places for value formatting
 * @property {NodeType} type - Data type of the logged values
 * @property {boolean} is_counter - Whether this node is of counter type
 * @property {Array<BaseLogPoint>} points - Array of raw log data points with ISO timestamps
 * @property {FormattedTimeStep | null} time_step - Time aggregation interval used for the log data
 * @property {BaseMetrics} global_metrics - Overall statistical metrics for the entire dataset
 */
export interface NodeLogs {
    unit: string | null;
    decimal_places: number | null;
    type: NodeType;
    is_counter: boolean;
    points: Array<BaseLogPoint>;
    time_step: FormattedTimeStep | null;
    global_metrics: BaseMetrics;
}

/**
 * Processed node logs with metadata, UI components, and chart-ready data points.
 * @property {string} unit - Measurement unit (e.g., "V", "A", "kW")
 * @property {number | null} decimal_places - Number of decimal places for value formatting
 * @property {NodeType} type - Data type of the logged values
 * @property {boolean} is_counter - Whether this node is of counter type
 * @property {Array<ProcessedBaseLogPoint>} points - Array of processed log data points with Unix timestamps
 * @property {FormattedTimeStep | null} time_step - Time aggregation interval used for the log data
 * @property {BaseMetrics} global_metrics - Overall statistical metrics for the entire dataset
 * @property {GraphType | null} graphType - Graph visualization type identifier for rendering the appropriate chart component
 */
export interface ProcessedNodeLogs {
    unit: string | null;
    decimal_places: number | null;
    type: NodeType;
    is_counter: boolean;
    points: Array<ProcessedBaseLogPoint>;
    time_step: FormattedTimeStep | null;
    global_metrics: BaseMetrics;
    graphType: GraphType | null;
}

/** Log point combining time range and measurement statistics. */
export type MeasurementLogPoint = BaseLogPoint & MeasurementMetrics;

/** Processed log point combining Unix timestamps and measurement statistics. */
export type ProcessedMeasurementLogPoint = ProcessedBaseLogPoint & MeasurementMetrics;

/** Log point combining time range and counter value. */
export type CounterLogPoint = BaseLogPoint & CounterMetrics;

/** Processed log point combining Unix timestamps and counter value. */
export type ProcessedCounterLogPoint = ProcessedBaseLogPoint & CounterMetrics;

/** Log point combining time range and single-value metric. */
export type SingleValueLogPoint = BaseLogPoint & SingleValueMetrics;

/** Log point combining time range and energy consumption metrics. */
export type EnergyConsumptionLogPoint = BaseLogPoint & EnergyConsumptionMetrics;

/** Processed log point combining Unix timestamps and energy consumption metrics. */
export type ProcessedEnergyConsumptionLogPoint = ProcessedBaseLogPoint & EnergyConsumptionMetrics;

/*****     O B J E C T S     *****/
