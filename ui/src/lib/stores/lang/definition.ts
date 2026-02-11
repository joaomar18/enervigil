import { writable, derived } from "svelte/store";

// Type for the available languages
export type Language = "PT" | "EN";

// Default language
export const defaultLang: Language = "EN";

// Type of the Texts Object
export interface TextsObject {
    [key: string]: {
        PT: string;
        EN: string;
    };
}

export const selectedLang = writable<Language>(defaultLang);

/**
 * Checks if the provided language is valid.
 *
 * @param lang - Language to check.
 * @returns True if the language is valid, false otherwise.
 */
export function isLanguage(lang: Language): boolean {
    return lang === "PT" || lang === "EN";
}

/**
 * Creates a derived store that exposes texts in the current selected language.
 *
 * @param texts - Mapping of texts in the various available languages.
 * @returns A store with the texts for the current {@link selectedLang} value.
 */
export function createLangStore<T extends TextsObject>(texts: T) {
    return derived(selectedLang, (lang) => {
        const result: Record<string, string> = {};
        for (const key in texts) {
            result[key] = texts[key][lang];
        }
        return result;
    });
}
