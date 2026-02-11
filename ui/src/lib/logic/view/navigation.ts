import { goto } from "$app/navigation";
import { replaceState } from "$app/navigation";
import { get } from "svelte/store";
import { autoLoginAPI } from "../api/auth";
import { currentDeviceID } from "$lib/stores/device/current";
import { closeToast, showToast } from "./toast";
import { AlertType } from "$lib/stores/view/toast";
import { MainSection, PageSubsections, DefaultPageSubsection } from "$lib/types/view/navigation";
import { selectedLang, defaultLang, isLanguage } from "$lib/stores/lang/definition";
import type { Language } from "$lib/stores/lang/definition";

// Splash screen store
import {
    searchQuery,
    currentPage,
    splashDone,
    loadedDone,
    showSubLoader,
    leftPanelOpen,
    subLoaderTimer,
    resetSubLoaderSubscription,
    hasMouseCapability,
    uiSynchronized,
    latestAPIMessage,
    pageExists,
} from "../../stores/view/navigation";

/**
 * Builds a navigation URL and derives route paths for comparison.
 *
 * Constructs the target URL by appending query parameters from `extraParams`
 * (excluding any existing `lang`) and then appending the provided language
 * code as the final `lang` query parameter.
 *
 * @param url - Target route path to navigate to (without query parameters).
 * @param lang - Language code to append as the `lang` query parameter.
 * @param extraParams - Additional query parameters to include (excluding `lang`).
 * @returns Full navigation URL with query parameters.
 */
function getNavigationReady(url: string, lang: string, extraParams: Record<string, string> = {}): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(extraParams)) {
        if (key !== "lang") params.append(key, value);
    }
    params.append("lang", lang);
    const target = `${url}?${params.toString()}`;
    return target;
}

/**
 * Resets the sub-loader timer and subscription to ensure a clean navigation state.
 *
 * Clears any active sub-loader timeout and unsubscribes from the loader completion event.
 * This prevents duplicate timers or subscriptions when starting a new navigation.
 */
function resetSubLoaderTrigger() {
    // Reset Sub Loader Timer
    const timer = get(subLoaderTimer);
    if (timer) {
        clearTimeout(timer);
        subLoaderTimer.set(null);
    }

    // Reset Sub Loader Subscription
    const subscription = get(resetSubLoaderSubscription);
    if (subscription) {
        subscription();
        resetSubLoaderSubscription.set(null);
    }
}

/**
 * Sets up the sub-loader logic for navigation.
 *
 * Subscribes to the `loadedDone` store to hide the sub-loader when loading completes,
 * and starts a timer to show the sub-loader if loading is not complete after the specified time.
 *
 * @param showSubLoaderTime - Time in milliseconds to wait before showing the sub-loader if not loaded.
 */
function setSubLoaderTrigger(showSubLoaderTime: number) {
    const subscription = loadedDone.subscribe((val) => {
        if (val) {
            showSubLoader.set(false);
            const currentSub = get(resetSubLoaderSubscription);
            if (currentSub) {
                currentSub();
                resetSubLoaderSubscription.set(null);
            }
        }
    });

    resetSubLoaderSubscription.set(subscription);

    const timer = setTimeout(() => {
        const loadedDoneState = get(loadedDone);
        if (!loadedDoneState) {
            showSubLoader.set(true);
        }
    }, showSubLoaderTime);

    subLoaderTimer.set(timer);
}

/**
 * Resets the dashboard loading state before starting a new operation.
 *
 * Marks the dashboard as not loaded and arms a delayed sub-loader trigger
 * if loading takes longer than the specified threshold.
 *
 * @param showSubLoaderTime - Delay (ms) before showing the sub-loader.
 */
export function resetDashboardLoader(showSubLoaderTime: number = 600): void {
    resetSubLoaderTrigger();
    loadedDone.set(false);
    setSubLoaderTrigger(showSubLoaderTime);
}

/**
 * Performs client-side navigation to a target route with optional query parameters,
 * splash screen handling, and history replacement.
 *
 * This helper wraps SvelteKit navigation to provide:
 * - URL construction with language and extra query parameters
 * - Optional splash screen with minimum display duration
 * - Optional history replacement for state transitions (e.g. login/logout),
 *   preventing invalid routes from remaining in browser history
 *
 * @param url - Target route or URL to navigate to.
 * @param extraParams - Additional query parameters to append to the URL.
 * @param splashScreen - Whether to display a splash screen during navigation.
 * @param replaceState - Whether to replace the current history entry instead of pushing a new one.
 * @param minSplashDuration - Minimum time (ms) the splash screen must remain visible.
 * @returns Promise that resolves once navigation and splash screen handling are complete.
 */
export async function navigateTo(
    url: string,
    extraParams: Record<string, string> = {},
    splashScreen: boolean = false,
    replaceState: boolean = false,
    minSplashDuration: number = 300,
): Promise<void> {
    let target = getNavigationReady(url, get(selectedLang), extraParams);

    // Already in Intended URL
    if (new URL(target, location.origin).href === location.href) {
        return;
    }
    let gotoPromise = goto(target, { replaceState: replaceState });
    let timerPromise = Promise.resolve();
    if (splashScreen) {
        splashDone.set(false);
        timerPromise = new Promise((res) => setTimeout(res, minSplashDuration));
    }

    await Promise.all([gotoPromise, timerPromise]);

    if (splashScreen) {
        splashDone.set(true);
    }
}

/**
 * Checks if the provided URL path exists in the application's navigation structure.
 * @param url - The URL to check.
 * @returns True if the URL path exists, false otherwise.
 */
export function checkPageExists(url: URL): boolean {
    if (url.pathname === "/") return true;
    const segments = url.pathname.split("/").filter(Boolean);
    const base = segments[0];
    const subpage = segments[1] ?? null;

    for (let section of Object.values(MainSection)) {
        if (base === section) {
            if (subpage === null) return true;

            for (let subsection of Object.values(PageSubsections[section])) {
                if (subpage === subsection) return true;
            }
        }
    }
    return false;
}

/**
 * Redirects to the default subpage of the provided base section.
 *
 * @param base - The base section to check.
 * @param subpage - The subpage to check.
 * @returns String representing the default subpage of the base section.
 */
export function redirectToDefaultSubPage(base: string | null, subpage: string | null): string {
    if (!base) return "";
    for (let section of Object.values(MainSection)) {
        if (base === section) {
            if (subpage === null && DefaultPageSubsection[section]) return `/${base}/${DefaultPageSubsection[section]}`;
            break;
        }
    }
    return "";
}

/**
 * Resolves client-side navigation rules and determines whether the given URL
 * should be redirected to a canonical application route.
 *
 * This function is the authoritative navigation policy for the client UI.
 * It enforces authentication flow and route invariants entirely on the
 * client, without relying on server-side guards or redirects.
 *
 * No navigation is performed here; callers are responsible for applying
 * the returned redirect decision.
 *
 * @param url - URL being evaluated for client-side navigation.
 * @param authenticated - Current client-known authentication state.
 * @returns An object indicating the redirect target.
 */
export function resolveNavigationRedirect(url: URL, authenticated: boolean): { redirectTarget: string } {
    const DEVICE_SCOPED_PAGES = new Set([PageSubsections[MainSection.DEVICES].GENERAL_VIEW, PageSubsections[MainSection.DEVICES].EDIT]);
    const segments = url.pathname.split("/").filter(Boolean);
    const base = segments[0] ?? null;
    const subpage = segments[1] ?? null;

    if (!checkPageExists(url)) {
        return { redirectTarget: "/404" };
    }

    if (!authenticated && url.pathname !== "/login") {
        return { redirectTarget: "/login" };
    }

    if (authenticated && (url.pathname === "/login" || url.pathname === "/")) {
        return { redirectTarget: "/devices/dashboard" };
    }

    if (subpage === null) return { redirectTarget: redirectToDefaultSubPage(base, subpage) };

    // Enforce required device context for device-scoped subpages
    if (base === MainSection.DEVICES && subpage && DEVICE_SCOPED_PAGES.has(subpage)) {
        const deviceId = url.searchParams.get("deviceId");

        if (!deviceId) {
            return { redirectTarget: "/devices/dashboard" };
        }
    }

    return { redirectTarget: "" };
}

/**
 * Synchronizes client-side UI state with the current router URL.
 *
 * Re-applies pending API messages after navigation, updates page-level
 * stores (current page, device context, and search query), and ensures
 * UI state remains consistent with the active client-side route.
 *
 * Intended to be called after navigation has completed. This function
 * performs no routing or access control logic.
 *
 * @param url - The current URL active in the client router.
 */
export async function syncUIState(url: URL): Promise<void> {
    uiSynchronized.set(false);

    const message = get(latestAPIMessage);
    if (message !== null) {
        showToast(message.code, AlertType.ALERT, message.details, message.textList, message.autoClose);
    } else {
        closeToast();
    }

    latestAPIMessage.set(null);
    currentDeviceID.set(getDeviceID());
    updateSearchQuery(url);
    currentPage.set(url.pathname);
    pageExists.set(checkPageExists(url));
    selectedLang.set(getUrlLanguage());
    uiSynchronized.set(true);
}

/**
 * Checks if the current page is an authentication page.
 * @param currentPage - The current page path to check.
 * @returns True if the current pathname starts with "/login".
 */
export function isAuthenticationPage(currentPage: string): boolean {
    return currentPage.startsWith("/login");
}

/**
 * Checks if the current page is a dashboard page.
 * @param currentPage - The current page path to check.
 * @returns True if the current page is not an authentication page.
 */
export function isDashboardPage(currentPage: string): boolean {
    return !isAuthenticationPage(currentPage) && currentPage !== "/404";
}

/**
 * Checks if the current page is a device sub-page (any route under /devices/).
 *
 * @param currentPage - The current page path to check.
 * @returns True if the path starts with "/devices/".
 */
export function isDeviceSubPage(currentPage: string): boolean {
    return currentPage.startsWith("/devices/");
}

/**
 * Checks if the current page is a device view page (a specific device, not add or edit).
 *
 * @param currentPage - The current page path to check.
 * @returns True if the path starts with "/devices/" and is general_view page.
 */
export function isDeviceViewPage(currentPage: string): boolean {
    return currentPage.startsWith("/devices/") && currentPage.includes("general_view");
}

/**
 * Extracts the `lang` query parameter from a URL.
 * Falls back to the default language if missing or invalid.
 */
export function getUrlLanguage(): Language {
    const params = new URLSearchParams(window.location.search);
    let lang = (params.get("lang") || defaultLang) as Language;
    if (!isLanguage(lang)) {
        lang = defaultLang;
    }
    return lang;
}

/**
 * Updates the application language and syncs it to the URL
 * without triggering a page reload.
 */
export function setLanguage(lang: Language): void {
    selectedLang.set(lang);
    const params = new URLSearchParams(window.location.search);
    params.set("lang", lang);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    replaceState(newUrl, {});
}

/**
 * Sets initial left panel state based on screen width.
 * Opens panel on desktop (≥880px), closes on mobile.
 */
export function setInitialLeftPanelState() {
    leftPanelOpen.set(window.matchMedia("(min-width: 880px)").matches);
}

/**
 * Reads the current device ID from the URL query parameters.
 *
 * The URL is treated as the sole source of truth. This function should be used
 * whenever a device identifier is required on the client side.
 *
 * @returns The numeric device ID if present and valid, or `null` otherwise.
 */
export function getDeviceID() {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const deviceIdURL = params.get("deviceId");
    let deviceId: number | null = Number(deviceIdURL);
    if (isNaN(deviceId) || !deviceId) deviceId = null;
    return deviceId;
}

/**
 * Synchronizes the UI search state with the provided URL.
 *
 * Reads the `searchQuery` parameter from the given URL and updates the
 * `searchQuery` store for UI purposes only. The store is cleared when the
 * current route is not `/devices`. The URL remains the sole source of truth.
 *
 * @param url - The current URL used as the source of truth for the search state.
 */
export function updateSearchQuery(url: URL) {
    const path = url.pathname;
    const params = url.searchParams;
    const searchString = params.get("searchQuery") ?? "";
    if (path !== "/devices") {
        searchQuery.set("");
    } else {
        searchQuery.set(searchString);
    }
}

/**
 * Detects and sets client mouse capability based on hover and pointer precision.
 * Updates hasMouseCapability store to determine if tooltips should be enabled.
 */
export function checkClientHasMouse() {
    const canHover = window.matchMedia("(hover: hover)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    hasMouseCapability.set(canHover && hasFinePointer);
}

/**
 * Initializes client-side application layout and resolves initial navigation state.
 *
 * Performs UI bootstrap tasks such as input capability detection, splash screen
 * timing, dashboard loader initialization, and an initial backend session check.
 *
 * After initialization, client-side navigation rules are evaluated and a
 * canonical route is enforced if required.
 *
 * This function is responsible only for UI initialization and initial client-side
 * navigation normalization; backend APIs remain authoritative for access control.
 *
 * @param minSplashDuration - Minimum time (ms) the splash screen should remain visible.
 * @param showSubLoaderTime - Delay (ms) before showing the sub-loader if initialization is slow.
 */
export async function initializeClientLayout(minSplashDuration: number = 300, showSubLoaderTime: number = 600) {
    checkClientHasMouse();
    const checkAutoLoginPromise = autoLoginAPI().call({ timeout: 5000 });
    const minTimePromise = new Promise((res) => setTimeout(res, minSplashDuration));
    resetDashboardLoader(showSubLoaderTime);
    const [authResult] = await Promise.all([checkAutoLoginPromise, minTimePromise]);
    const url = new URL(window.location.href);
    let result = resolveNavigationRedirect(url, authResult.sucess);
    if (result.redirectTarget) {
        await navigateTo(result.redirectTarget, {}, false, true);
    }
    splashDone.set(true);
}
