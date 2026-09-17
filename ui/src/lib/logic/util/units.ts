export interface ScaledUnitValue {
    value: number | null | undefined;
    unit: string;
}

const prefixes = ["p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E"] as const;

/** Returns a unit's position in the prefix sequence, using the base position if unprefixed. */
export function getUnitPrefixIndex(unit: string): number {
    const index = prefixes.findIndex((prefix) => prefix !== "" && unit.startsWith(prefix) && unit.length > prefix.length);
    return index === -1 ? prefixes.indexOf("") : index;
}

/**
 * Scales default variables to a larger unit when the absolute value reaches 1,000.
 * Rounds scaled values to at most 3 decimals (e.g. 1345.45 W becomes 1.345 kW).
 * Custom variables are left unchanged.
 * An optional reference value keeps all values in a graph on the same scale.
 */
export function scaleUnitValue(
    inputValue: number | null | undefined,
    inputUnit: string | null | undefined,
    isDefaultVariable: boolean,
    referenceValue: number | null | undefined = inputValue,
): ScaledUnitValue {
    const unit = inputUnit ?? "";
    if (isDefaultVariable !== true || !unit || referenceValue == null || !Number.isFinite(referenceValue)) {
        return { value: inputValue, unit };
    }

    let prefixIndex = getUnitPrefixIndex(unit);
    const baseUnit = unit.slice(prefixes[prefixIndex].length);

    let value = inputValue;
    let magnitude = Math.abs(referenceValue);
    let scaled = false;
    while (magnitude >= 1000 && prefixIndex < prefixes.length - 1) {
        if (value != null) value /= 1000;
        magnitude /= 1000;
        prefixIndex++;
        scaled = true;
    }

    if (scaled && value != null) value = Number(value.toFixed(3));

    return { value, unit: `${prefixes[prefixIndex]}${baseUnit}` };
}
