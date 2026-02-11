import { writable } from "svelte/store";
import type { AlertTextList } from "./toast";

export const currentPage = writable<string>(""); // Current page path
export const splashDone = writable<boolean>(false);
export const loadedDone = writable<boolean>(false);
export const showSubLoader = writable<boolean>(false);
export const leftPanelOpen = writable<boolean>(false);
export const searchQuery = writable<string>(""); // Query to filter devices
export const resetSubLoaderSubscription = writable<(() => void) | null>(null); //Subscription to reset sub loader
export const subLoaderTimer = writable<ReturnType<typeof setTimeout> | null>(null); // Timeout to set sub loader in case of delay
export const hasMouseCapability = writable<boolean>(false);
export const userAuthenticated = writable<boolean>(false); // UI-only auth hint (non-authoritative).
export const uiSynchronized = writable<boolean>(false); // UI has finished synchronizing (after navigate processed).
export const userConfigSetup = writable<boolean>(false); // User configuration needs to be setup.
export const latestAPIMessage = writable<{ code: string; details: Record<string, string>; textList: AlertTextList; autoClose: boolean } | null>(null); // Latest API message not shown due to screen change.
export const pageExists = writable<boolean>(false); // Page exists
