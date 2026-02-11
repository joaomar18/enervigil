import { get } from "svelte/store";
import { PowerFactorDirection } from "$lib/types/device/energy";
import { EnergyDirectionFilter, SelectablePhaseFilter } from "$lib/types/view/nodes";
import { texts } from "$lib/stores/lang/generalTexts";

/**
 * Converts power factor direction enum to a short display string for UI presentation.
 * Returns "c" for capacitive/leading power factor, "i" for inductive/lagging power factor,
 * or empty string for unknown/unitary cases.
 *
 * @param pfDirection - The power factor direction as a string enum value
 * @returns Single character string ("c", "i") or empty string
 */
export function getPowerFactorDirectionString(pfDirection: string): string {
    let pfDirEnum = pfDirection as PowerFactorDirection;
    switch (pfDirEnum) {
        case PowerFactorDirection.UNKNOWN:
            return "";
        case PowerFactorDirection.UNITARY:
            return "";
        case PowerFactorDirection.LEADING:
            return "c";
        case PowerFactorDirection.LAGGING:
            return "i";
    }
}

/**
 * Converts electrical phase enum to a short display string for UI presentation.
 * Returns single-digit phase identifiers (1, 2, 3) or "T" for total/aggregate phase.
 * Used in phase selectors, charts, and metric displays.
 *
 * @param phase - The electrical phase filter enum value
 * @returns Single character string ("1", "2", "3", "T")
 */
export function getElectricalPhaseString(phase: SelectablePhaseFilter): string {
    switch (phase) {
        case SelectablePhaseFilter.L1:
            return "1";
        case SelectablePhaseFilter.L2:
            return "2";
        case SelectablePhaseFilter.L3:
            return "3";
        case SelectablePhaseFilter.TOTAL:
            return "T";
    }
}

/**
 * Converts energy direction enum to localized main and sub text for UI display.
 * Returns i18n-aware short labels for forward, reverse, or total energy direction.
 * Used in energy direction pickers and button labels with main/sub text layout.
 *
 * @param energyDirection - The energy direction filter enum value
 * @returns Object with mainText and subText properties containing localized short labels
 */
export function getEnergyDirectionString(energyDirection: EnergyDirectionFilter): { mainText: string; subText: string } {
    switch (energyDirection) {
        case EnergyDirectionFilter.FORWARD:
            return { mainText: get(texts).forwardEnergyShort, subText: get(texts).subForwardEnergyShort };
        case EnergyDirectionFilter.REVERSE:
            return { mainText: get(texts).reverseEnergyShort, subText: get(texts).subReverseEnergyShort };
        case EnergyDirectionFilter.TOTAL:
            return { mainText: get(texts).totalEnergyShort, subText: get(texts).subTotalEnergyShort };
    }
}
