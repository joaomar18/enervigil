import { browser } from "$app/environment";

/**
 * Gets the computed font-family from the document body.
 * @returns The font-family CSS property value
 * @throws Error if called on server-side
 */
export function getRootFontFamily(): string {
    if (!browser) {
        throw new Error(`Method can only be called from the client side.`);
    }
    const root = document.querySelector("body") as HTMLBodyElement;
    return getComputedStyle(root).fontFamily;
}