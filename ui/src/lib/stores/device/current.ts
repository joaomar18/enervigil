import { writable } from "svelte/store";

/**
 * UI-only mirror of the current device ID derived from the URL.
 *
 * IMPORTANT:
 * - This store MUST NOT be used for routing, data fetching, or validation.
 * - The URL is the only source of truth for request parameters.
 * - This store exists solely for UI state (menus, panels, enable/disable logic).
 */
export const currentDeviceID = writable<number | null>(null);