import { readable } from "svelte/store";
import { derived } from "svelte/store";
import { NodeType, NodePhase } from "$lib/types/nodes/base";
import { defaultFloatNodeProtocolOptions } from "$lib/types/nodes/default";
import type { DefaultNodeInfo } from "$lib/types/nodes/default";

/**
 * A readable store containing predefined variable types for energy monitoring systems.
 * Includes electrical measurements like voltage, current, power, and energy variables
 * with their default configuration settings.
 */
export const defaultVariables = readable<DefaultNodeInfo[]>([
    {
        name: "voltage",
        defaultNumberOfDecimals: 2,
        defaultUnit: "V",
        applicablePhases: [NodePhase.L1, NodePhase.L2, NodePhase.L3, NodePhase.SINGLEPHASE],
        applicableTypes: [NodeType.FLOAT, NodeType.INT],
        canBeVirtual: false,
        defaultPublished: true,
        defaultLoggingPeriod: 15,
        defaultLoggingEnabled: true,
        isNumeric: true,
        isCounter: false,
        defaultMinAlarm: 230 * 0.9,
        defaultMaxAlarm: 230 * 1.1,
        defaultMinAlarmEnabled: true,
        defaultMaxAlarmEnabled: true,
        useByDefault: true,
        defaultProtocolOptions: defaultFloatNodeProtocolOptions,
    },
    {
        name: "l1_l2_voltage",
        defaultNumberOfDecimals: 2,
        defaultUnit: "V",
        applicablePhases: [NodePhase.GENERAL],
        applicableTypes: [NodeType.FLOAT, NodeType.INT],
        canBeVirtual: false,
        defaultPublished: true,
        defaultLoggingPeriod: 15,
        defaultLoggingEnabled: true,
        isNumeric: true,
        isCounter: false,
        defaultMinAlarm: 400 * 0.9,
        defaultMaxAlarm: 400 * 1.1,
        defaultMinAlarmEnabled: true,
        defaultMaxAlarmEnabled: true,
        useByDefault: true,
        defaultProtocolOptions: defaultFloatNodeProtocolOptions,
    },
    {
        name: "l2_l3_voltage",
        defaultNumberOfDecimals: 2,
        defaultUnit: "V",
        applicablePhases: [NodePhase.GENERAL],
        applicableTypes: [NodeType.FLOAT, NodeType.INT],
        canBeVirtual: false,
        defaultPublished: true,
        defaultLoggingPeriod: 15,
        defaultLoggingEnabled: true,
        isNumeric: true,
        isCounter: false,
        defaultMinAlarm: 400 * 0.9,
        defaultMaxAlarm: 400 * 1.1,
        defaultMinAlarmEnabled: true,
        defaultMaxAlarmEnabled: true,
        useByDefault: true,
        defaultProtocolOptions: defaultFloatNodeProtocolOptions,
    },
    {
        name: "l3_l1_voltage",
        defaultNumberOfDecimals: 2,
        defaultUnit: "V",
        applicablePhases: [NodePhase.GENERAL],
        applicableTypes: [NodeType.FLOAT, NodeType.INT],
        canBeVirtual: false,
        defaultPublished: true,
        defaultLoggingPeriod: 15,
        defaultLoggingEnabled: true,
        isNumeric: true,
        isCounter: false,
        defaultMinAlarm: 400 * 0.9,
        defaultMaxAlarm: 400 * 1.1,
        defaultMinAlarmEnabled: true,
        defaultMaxAlarmEnabled: true,
        useByDefault: true,
        defaultProtocolOptions: defaultFloatNodeProtocolOptions,
    },
    {
        name: "current",
        defaultNumberOfDecimals: 3,
        defaultUnit: "A",
        availableUnits: ["mA", "A"],
        applicablePhases: [NodePhase.L1, NodePhase.L2, NodePhase.L3, NodePhase.SINGLEPHASE],
        applicableTypes: [NodeType.FLOAT, NodeType.INT],
        canBeVirtual: false,
        defaultPublished: true,
        defaultLoggingPeriod: 15,
        defaultLoggingEnabled: false,
        isNumeric: true,
        isCounter: false,
        useByDefault: true,
        defaultProtocolOptions: defaultFloatNodeProtocolOptions,
    },
    {
        name: "active_power",
        defaultUnit: "kW",
        defaultNumberOfDecimals: 3,
        availableUnits: ["W", "kW"],
        applicablePhases: [NodePhase.L1, NodePhase.L2, NodePhase.L3, NodePhase.TOTAL, NodePhase.SINGLEPHASE],
        applicableTypes: [NodeType.FLOAT, NodeType.INT],
        canBeVirtual: true,
        defaultPublished: true,
        defaultLoggingPeriod: 15,
        defaultLoggingEnabled: false,
        isNumeric: true,
        isCounter: false,
        useByDefault: true,
        defaultProtocolOptions: defaultFloatNodeProtocolOptions,
    },
    {
        name: "reactive_power",
        defaultNumberOfDecimals: 3,
        defaultUnit: "kVAr",
        availableUnits: ["VAr", "kVAr"],
        applicablePhases: [NodePhase.L1, NodePhase.L2, NodePhase.L3, NodePhase.TOTAL, NodePhase.SINGLEPHASE],
        applicableTypes: [NodeType.FLOAT, NodeType.INT],
        canBeVirtual: true,
        defaultPublished: true,
        defaultLoggingPeriod: 15,
        defaultLoggingEnabled: false,
        isNumeric: true,
        isCounter: false,
        useByDefault: true,
        defaultProtocolOptions: defaultFloatNodeProtocolOptions,
    },
    {
        name: "apparent_power",
        defaultNumberOfDecimals: 3,
        defaultUnit: "kVA",
        availableUnits: ["VA", "kVA"],
        applicablePhases: [NodePhase.L1, NodePhase.L2, NodePhase.L3, NodePhase.TOTAL, NodePhase.SINGLEPHASE],
        applicableTypes: [NodeType.FLOAT, NodeType.INT],
        canBeVirtual: true,
        defaultPublished: true,
        defaultLoggingPeriod: 15,
        defaultLoggingEnabled: false,
        isNumeric: true,
        isCounter: false,
        useByDefault: true,
        defaultProtocolOptions: defaultFloatNodeProtocolOptions,
    },
    {
        name: "power_factor",
        defaultNumberOfDecimals: 2,
        defaultUnit: "",
        applicablePhases: [NodePhase.L1, NodePhase.L2, NodePhase.L3, NodePhase.TOTAL, NodePhase.SINGLEPHASE],
        applicableTypes: [NodeType.FLOAT],
        canBeVirtual: true,
        defaultPublished: true,
        defaultLoggingPeriod: 15,
        defaultLoggingEnabled: false,
        isNumeric: true,
        isCounter: false,
        useByDefault: true,
        defaultProtocolOptions: defaultFloatNodeProtocolOptions,
    },
    {
        name: "frequency",
        defaultNumberOfDecimals: 2,
        defaultUnit: "Hz",
        applicablePhases: [NodePhase.L1, NodePhase.L2, NodePhase.L3, NodePhase.GENERAL, NodePhase.SINGLEPHASE],
        applicableTypes: [NodeType.FLOAT, NodeType.INT],
        canBeVirtual: false,
        defaultPublished: true,
        defaultLoggingPeriod: 15,
        defaultLoggingEnabled: true,
        isNumeric: true,
        isCounter: false,
        defaultMinAlarm: 50 * 0.99,
        defaultMaxAlarm: 50 * 1.01,
        defaultMinAlarmEnabled: true,
        defaultMaxAlarmEnabled: true,
        useByDefault: false,
        defaultProtocolOptions: defaultFloatNodeProtocolOptions,
    },
    {
        name: "active_energy",
        defaultUnit: "kWh",
        defaultNumberOfDecimals: 3,
        availableUnits: ["Wh", "kWh"],
        applicablePhases: [NodePhase.L1, NodePhase.L2, NodePhase.L3, NodePhase.TOTAL, NodePhase.SINGLEPHASE],
        applicableTypes: [NodeType.FLOAT, NodeType.INT],
        canBeVirtual: true,
        defaultPublished: true,
        defaultLoggingPeriod: 15,
        defaultLoggingEnabled: true,
        isNumeric: true,
        isCounter: true,
        useByDefault: true,
        defaultProtocolOptions: defaultFloatNodeProtocolOptions,
    },
    {
        name: "reactive_energy",
        defaultUnit: "kVArh",
        defaultNumberOfDecimals: 3,
        availableUnits: ["VArh", "kVArh"],
        applicablePhases: [NodePhase.L1, NodePhase.L2, NodePhase.L3, NodePhase.TOTAL, NodePhase.SINGLEPHASE],
        applicableTypes: [NodeType.FLOAT, NodeType.INT],
        canBeVirtual: true,
        defaultPublished: true,
        defaultLoggingPeriod: 15,
        defaultLoggingEnabled: true,
        isNumeric: true,
        isCounter: true,
        useByDefault: true,
        defaultProtocolOptions: defaultFloatNodeProtocolOptions,
    },
    {
        name: "forward_active_energy",
        defaultUnit: "kWh",
        defaultNumberOfDecimals: 3,
        availableUnits: ["Wh", "kWh"],
        applicablePhases: [NodePhase.L1, NodePhase.L2, NodePhase.L3, NodePhase.TOTAL, NodePhase.SINGLEPHASE],
        applicableTypes: [NodeType.FLOAT, NodeType.INT],
        canBeVirtual: false,
        defaultPublished: false,
        defaultLoggingPeriod: 15,
        defaultLoggingEnabled: false,
        isNumeric: true,
        isCounter: true,
        useByDefault: false,
        defaultProtocolOptions: defaultFloatNodeProtocolOptions,
    },
    {
        name: "forward_reactive_energy",
        defaultUnit: "kVArh",
        defaultNumberOfDecimals: 3,
        availableUnits: ["VArh", "kVArh"],
        applicablePhases: [NodePhase.L1, NodePhase.L2, NodePhase.L3, NodePhase.TOTAL, NodePhase.SINGLEPHASE],
        applicableTypes: [NodeType.FLOAT, NodeType.INT],
        canBeVirtual: false,
        defaultPublished: false,
        defaultLoggingPeriod: 15,
        defaultLoggingEnabled: false,
        isNumeric: true,
        isCounter: true,
        useByDefault: false,
        defaultProtocolOptions: defaultFloatNodeProtocolOptions,
    },
    {
        name: "reverse_active_energy",
        defaultUnit: "kWh",
        defaultNumberOfDecimals: 3,
        availableUnits: ["Wh", "kWh"],
        applicablePhases: [NodePhase.L1, NodePhase.L2, NodePhase.L3, NodePhase.TOTAL, NodePhase.SINGLEPHASE],
        applicableTypes: [NodeType.FLOAT, NodeType.INT],
        canBeVirtual: false,
        defaultPublished: false,
        defaultLoggingPeriod: 15,
        defaultLoggingEnabled: false,
        isNumeric: true,
        isCounter: true,
        useByDefault: false,
        defaultProtocolOptions: defaultFloatNodeProtocolOptions,
    },
    {
        name: "reverse_reactive_energy",
        defaultUnit: "kVArh",
        defaultNumberOfDecimals: 3,
        availableUnits: ["VArh", "kVArh"],
        applicablePhases: [NodePhase.L1, NodePhase.L2, NodePhase.L3, NodePhase.TOTAL, NodePhase.SINGLEPHASE],
        applicableTypes: [NodeType.FLOAT, NodeType.INT],
        canBeVirtual: false,
        defaultPublished: false,
        defaultLoggingPeriod: 15,
        defaultLoggingEnabled: false,
        isNumeric: true,
        isCounter: true,
        useByDefault: false,
        defaultProtocolOptions: defaultFloatNodeProtocolOptions,
    },
]);

/**
 * A derived store that extracts just the variable names from the defaultVariables store.
 * Provides a simple array of all available variable identifiers (e.g., "voltage", "current").
 * Useful for generating selectors, dropdowns, or filtering operations.
 */
export const defaultVariableNames = derived(defaultVariables, ($defaultVariables) => $defaultVariables.map((type) => type.name));

/**
 * A derived store that filters variable names by their applicable phases.
 * Returns an object where each key is a phase (e.g., "L1", "L2", "L3", "Total", "")
 * and each value is an array of variable names that can be applied to that phase.
 * Useful for creating phase-specific variable selectors.
 */
export const defaultVariableNamesByPhase = derived(defaultVariables, ($defaultVariables) => {
    const phaseMap: Record<string, string[]> = {};

    // Initialize all phases
    Object.values(NodePhase).forEach((phase) => {
        phaseMap[phase] = [];
    });

    $defaultVariables.forEach((variable) => {
        variable.applicablePhases.forEach((phase) => {
            phaseMap[phase].push(variable.name);
        });
    });

    return phaseMap;
});

/**
 * A derived store mapping variable names to their available units.
 * Creates an object where each key is a variable name (e.g., "voltage", "active_power")
 * and each value is an array of available units for that variable.
 * Uses the availableUnits array if present, otherwise defaults to an array containing just the defaultUnit.
 */
export const defaultVariableUnits = derived(defaultVariables, ($defaultVariables) => {
    const unitsMap: Record<string, string[]> = {};

    $defaultVariables.forEach((variable) => {
        unitsMap[variable.name] = variable.availableUnits || [variable.defaultUnit];
    });

    return unitsMap;
});
