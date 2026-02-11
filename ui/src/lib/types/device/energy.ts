import type { NodeLogs, MeasurementMetrics } from "../nodes/logs";
import { MeterType } from "./base";
import { NodePhase } from "../nodes/base";

/**
 * Enumeration of power factor direction states in electrical systems.
 * Indicates the phase relationship between voltage and current waveforms.
 *
 * @enum {string}
 * @property {string} UNKNOWN - Power factor direction cannot be determined.
 * @property {string} UNITARY - Unity power factor (voltage and current in phase, PF = 1).
 * @property {string} LEADING - Leading power factor (current leads voltage, capacitive load).
 * @property {string} LAGGING - Lagging power factor (current lags voltage, inductive load).
 */
export enum PowerFactorDirection {
    UNKNOWN = "UNKNOWN",
    UNITARY = "UNITARY",
    LEADING = "LEADING",
    LAGGING = "LAGGING",
}

/**
 * Comprehensive energy consumption data structure for electrical monitoring and analysis.
 * Aggregates active and reactive energy consumption with power quality metrics over time periods.
 *
 * @interface EnergyConsumptionType
 * @property {NodeLogs} active_energy - Historical logs of active energy consumption (real power, measured in kWh).
 * @property {NodeLogs} reactive_energy - Historical logs of reactive energy consumption (imaginary power, measured in kVArh).
 * @property {NodeLogs} power_factor - Historical logs of power factor values (ratio of active to apparent power, 0-1 range).
 * @property {NodeLogs} power_factor_direction - Historical logs of power factor direction states (leading/lagging/unitary).
 */
export interface EnergyConsumptionType {
    active_energy: NodeLogs;
    reactive_energy: NodeLogs;
    power_factor: NodeLogs;
    power_factor_direction: NodeLogs;
}

/**
 * Historical logs of peak power measurements for a measurement interval.
 * Records peak values for active (real), reactive, and apparent power.
 *
 * @interface PeakPowerType
 * @property {NodeLogs} active_power - Historical logs for peak active (real) power.
 * @property {NodeLogs} reactive_power - Historical logs for peak reactive power.
 * @property {NodeLogs} apparent_power - Historical logs for peak apparent power.
 */
export interface PeakPowerType {
    active_power: NodeLogs;
    reactive_power: NodeLogs;
    apparent_power: NodeLogs;
}

/**
 * Historical logs of per-phase measurements and computed balance values for three-phase systems.
 * Records per-phase voltage and current logs and overall computed balance/imbalance metrics.
 *
 * @interface PhaseBalanceType
 * @property {NodeLogs} l1_voltage - Historical logs for line 1 voltage measurements.
 * @property {NodeLogs} l2_voltage - Historical logs for line 2 voltage measurements.
 * @property {NodeLogs} l3_voltage - Historical logs for line 3 voltage measurements.
 * @property {NodeLogs} l1_current - Historical logs for line 1 current measurements.
 * @property {NodeLogs} l2_current - Historical logs for line 2 current measurements.
 * @property {NodeLogs} l3_current - Historical logs for line 3 current measurements.
 * @property {number|null} voltage_imbalance - Computed voltage imbalance (percent) or null if unavailable.
 * @property {number|null} current_imbalance - Computed current imbalance (percent) or null if unavailable.
 */
export interface PhaseBalanceType {
    l1_voltage: NodeLogs;
    l2_voltage: NodeLogs;
    l3_voltage: NodeLogs;
    l1_current: NodeLogs;
    l2_current: NodeLogs;
    l3_current: NodeLogs;
    voltage_imbalance: number | null;
    current_imbalance: number | null;
}

/**
 * Maps each meter type to the set of allowable electrical phases.
 * Used to validate which phases can be assigned to nodes based on
 * whether the device is single-phase or three-phase.
 */
export const meterTypeAvailablePhases = {
    [MeterType.SINGLE_PHASE]: [NodePhase.SINGLEPHASE],
    [MeterType.THREE_PHASE]: [NodePhase.L1, NodePhase.L2, NodePhase.L3, NodePhase.TOTAL, NodePhase.GENERAL],
};
