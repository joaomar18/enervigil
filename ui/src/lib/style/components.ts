import { writable, derived } from "svelte/store";

// Type of the available styles
export type Style = 'dark';

export type ComponentStyles = {
    [K in Style]: {
        [property: string]: string | number;
    };
}

export const selectedStyle = writable<Style>("dark"); //Current selected style: starts with dark


/**
 * Gets a style property value from a flattened style object.
 * @param style - The flattened style object or null
 * @param property - The CSS property name to retrieve
 * @returns The property value as a string, or empty string if not found
 */
export function getStyle(style: { [property: string]: string | number } | null, property: string): string | number {
    if (!style) {
        return "";
    }

    return style[property] ?? "";
}

export function mergeStyle<T extends Record<string, string | number>>(defaults: T, overrides: Partial<T>): T {
    const filteredOverrides: Partial<T> = Object.fromEntries(
        Object.entries(overrides).filter(([, value]) => value !== undefined)
    ) as Partial<T>;

    return { ...defaults, ...filteredOverrides } as T;
}

/**
 * Creates a derived store that exposes style configuration for the current theme.
 *
 * @param config - Mapping of style names to style definitions.
 * @returns A store that always reflects the style for the current {@link selectedStyle} value.
 */
export function createStyleStore<T>(config: Record<Style, T>) {
    return derived(selectedStyle, (s) => config[s]);
}