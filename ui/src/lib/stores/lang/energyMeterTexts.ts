import { derived } from "svelte/store";
import { createLangStore, selectedLang } from "$lib/stores/lang/definition";
import { defaultVariables } from "../device/variables";
import { NodePhase } from "$lib/types/nodes/base";
import type { TextsObject } from "$lib/stores/lang/definition";

//////////     P R O T O C O L     T E X T S     //////////

const textsObjectsProtocols: TextsObject = {
    OPC_UA: {
        PT: "OPC UA",
        EN: "OPC UA",
    },
    MODBUS_RTU: {
        PT: "MODBUS RTU",
        EN: "MODBUS RTU",
    },
};

//////////     P H A S E     T E X T S     //////////

const textsObjectsPhases: TextsObject = {
    L1: {
        PT: "L1",
        EN: "L1",
    },
    L2: {
        PT: "L2",
        EN: "L2",
    },
    L3: {
        PT: "L3",
        EN: "L3",
    },
    Total: {
        PT: "Total",
        EN: "Total",
    },
};

//////////     D I R E C T I O N     T E X T S     //////////
const textsObjectsDirections: TextsObject = {
    Forward: {
        PT: "Direta",
        EN: "Forward",
    },
    Reverse: {
        PT: "Inversa",
        EN: "Reverse",
    },
    Total: {
        PT: "Total",
        EN: "Total",
    },
};

//////////     M E T E R     T Y P E     T E X T S     //////////

const textsObjectsMeterTypes: TextsObject = {
    SINGLE_PHASE: {
        PT: "1F",
        EN: "1F",
    },
    THREE_PHASE: {
        PT: "3F",
        EN: "3F",
    },
};

//////////     C O U N T E R     M O D E     T E X T S     //////////

const textsObjectsCounterMode: TextsObject = {
    DIRECT: {
        PT: "DIRETO",
        EN: "DIRECT",
    },
    DELTA: {
        PT: "DELTA",
        EN: "DELTA",
    },
    CUMULATIVE: {
        PT: "CUMULATIVO",
        EN: "CUMULATIVE",
    },
};

//////////     V A R I A B L E     N A M E     T E X T S     //////////

const textsObjectsVariables: TextsObject = {
    voltage: {
        PT: "Tensão",
        EN: "Voltage",
    },
    l1_l2_voltage: {
        PT: "Tensão L1-L2",
        EN: "L1-L2 Voltage",
    },
    l2_l3_voltage: {
        PT: "Tensão L2-L3",
        EN: "L2-L3 Voltage",
    },
    l3_l1_voltage: {
        PT: "Tensão L3-L1",
        EN: "L3-L1 Voltage",
    },
    current: {
        PT: "Corrente",
        EN: "Current",
    },
    active_power: {
        PT: "Potência Ativa",
        EN: "Active Power",
    },
    reactive_power: {
        PT: "Potência Reativa",
        EN: "Reactive Power",
    },
    apparent_power: {
        PT: "Potência Aparente",
        EN: "Apparent Power",
    },
    power_factor: {
        PT: "Fator de Potência",
        EN: "Power Factor",
    },
    frequency: {
        PT: "Frequência",
        EN: "Frequency",
    },
    active_energy: {
        PT: "Energia Ativa",
        EN: "Active Energy",
    },
    reactive_energy: {
        PT: "Energia Reativa",
        EN: "Reactive Energy",
    },
    forward_active_energy: {
        PT: "Energia Ativa Direta",
        EN: "Forward Active Energy",
    },
    forward_reactive_energy: {
        PT: "Energia Reativa Direta",
        EN: "Forward Reactive Energy",
    },
    reverse_active_energy: {
        PT: "Energia Ativa Inversa",
        EN: "Reverse Active Energy",
    },
    reverse_reactive_energy: {
        PT: "Energia Reativa Inversa",
        EN: "Reverse Reactive Energy",
    },
};

/**
 * Derived store mapping each phase to variable names translated for the selected language.
 * @returns Object: { phase: { variableName: translatedText } }
 */
export const variableNameTextsByPhase = derived([defaultVariables, selectedLang], ([$defaultVariables, $selectedLang]) => {
    const phaseMap: Record<string, Record<string, string>> = {};

    // Initialize all phases
    Object.values(NodePhase).forEach((phase) => {
        phaseMap[phase] = {};
    });

    $defaultVariables.forEach((variable) => {
        variable.applicablePhases.forEach((phase) => {
            const textsObj = textsObjectsVariables[variable.name];
            if (textsObj) {
                phaseMap[phase][variable.name] = textsObj[$selectedLang];
            }
        });
    });

    return phaseMap;
});

export const protocolTexts = createLangStore(textsObjectsProtocols);
export const phaseTexts = createLangStore(textsObjectsPhases);
export const directionTexts = createLangStore(textsObjectsDirections);
export const meterTypeTexts = createLangStore(textsObjectsMeterTypes);
export const counterModeTexts = createLangStore(textsObjectsCounterMode);
export const variableNameTexts = createLangStore(textsObjectsVariables);
