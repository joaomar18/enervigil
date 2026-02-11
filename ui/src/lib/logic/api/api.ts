import { get } from "svelte/store";
import { removeKeysFromRecord } from "../util/generic";
import { showToast } from "../view/toast";
import { AlertType } from "$lib/stores/view/toast";
import { loadedDone, userAuthenticated, uiSynchronized, latestAPIMessage, pageExists } from "$lib/stores/view/navigation";
import { convertDateToLocalTime } from "../util/date";
import { navigateTo } from "../view/navigation";
import type { AlertTextList } from "$lib/stores/view/toast";

/**
 * Configuration object for executing an HTTP API request.
 * Defines all parameters required to perform a backend call, including
 * request data, timeout control, cancellation support, and optional
 * multipart upload handling.
 *
 * @type CallAPIOptions
 * @property {string} endpoint - API endpoint path (e.g., "/api/device/get")
 * @property {"GET" | "POST" | "PUT" | "DELETE"} method - HTTP method used for the request
 * @property {string} [requestId] - Identifier for the request. If an explicit identifier is not provided, the endpoint is used as the request identifier.
 * @property {Record<string, any>} [params] - Request parameters (query params for GET, body otherwise)
 * @property {number} [timeout] - Optional request timeout in milliseconds
 * @property {File} [file] - Optional file for multipart/form-data uploads
 * @property {string} [fileFieldName] - Form field name for the uploaded file
 * @property {boolean} [setLoaded] - Whether to update the global loaded state on success
 * @property {AbortSignal} [signal] - Optional abort signal for request cancellation
 * @property {number} [numberOfRetries] - Number of retries for the request
 * @property {typeof fetch} [fetchFn] - Fetch implementation override (e.g., for SSR)
 */
export type CallAPIOptions = {
    endpoint: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    requestId?: string;
    params?: Record<string, any>;
    timeout?: number;
    file?: File;
    fileFieldName?: string;
    setLoaded?: boolean;
    signal?: AbortSignal;
    numberOfRetries?: number;
    fetchFn?: typeof fetch;
};

/**
 * API execution descriptor interface.
 * Represents a reusable, execution-agnostic definition of an API endpoint,
 * allowing callers to control execution behavior such as cancellation and
 * timeout without embedding policy into the API definition itself.
 *
 * @interface APIDescriptor
 * @template T - Type of the resolved response payload
 * @property {Function} call - Executes the API request with optional execution controls
 * @property {string} requestId - Optional identifier for the request. If the identifier is not provided, the endpoint is used as the request identifier.
 * @property {AbortSignal} [call.options.signal] - Optional abort signal for lifecycle cancellation
 * @property {number} [call.options.timeout] - Optional execution timeout in milliseconds
 */
export interface APIDescriptor<T> {
    call(options?: { signal?: AbortSignal; timeout?: number }, requestId?: string): Promise<T>;
}

/**
 * Reason why an API request was aborted.
 */
enum AbortReason {
    MANUAL = "MANUAL",
    TIMEOUT = "TIMEOUT",
}

/**
 * Result of an API call: sucessful response, handled error, or intentionally aborted request.
 */
type APIResult =
    | { kind: "sucess"; status: number; data: any }
    | { kind: "error"; status: number; data: Record<string, any> }
    | { kind: "aborted"; abortReason: AbortReason }
    | { kind: "disconnected"; }
    | { kind: "exception"; message: string };

/**
 * Centralized HTTP API orchestration layer.
 *
 * Serves as the single entry point for all backend HTTP requests, enforcing
 * consistent application-level behavior across the UI.
 *
 * Handles request execution, in-flight request deduplication by endpoint and
 * payload, cooperative cancellation, and optional timeout enforcement.
 * Identical in-flight requests are reused; superseded requests with different
 * payloads are aborted to avoid race conditions.
 *
 * Integrates application policy by handling authentication failures via
 * state reset and navigation redirects, normalizing API errors into
 * UI-ready messages, and dispatching toast notifications (immediately or
 * deferred until UI synchronization).
 *
 * Optionally updates global UI state (e.g. initial load completion) on
 * successful requests when requested by the caller.
 */
export class APICaller {
    static #initialized = false;
    static #paused = false;
    static #requests: Map<
        string,
        { controller: AbortController; promise: Promise<{ sucess: boolean; data: any }>; content: string; remainingAttempts: number }
    > = new Map<string, { controller: AbortController; promise: Promise<{ sucess: boolean; data: any }>; content: string; remainingAttempts: number }>();
    static #onResumeCallbacks: Set<() => void> = new Set<() => void>();

    /**
     * Initializes application lifecycle handling for API request coordination.
     *
     * Registers a single visibility change listener to detect application
     * pause/resume transitions and dispatch corresponding lifecycle hooks.
     * This method is idempotent and must be called once during application startup.
     */
    static init() {
        if (APICaller.#initialized) return;
        APICaller.#initialized = true;
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") APICaller.onPause();
            if (document.visibilityState === "visible") APICaller.onResume();
        });
    }

    /**
     * Registers a callback to be invoked when the application resumes.
     *
     * Resume callbacks are intended to re-establish application intent
     * (e.g. restart polling or refresh critical state) after suspension.
     *
     * @param callback - Function invoked on application resume
     */
    static addOnResumeListener(callback: () => void) {
        APICaller.#onResumeCallbacks.add(callback);
    }

    /**
     * Unregisters a previously registered application resume callback.
     *
     * @param callback - Callback function to remove
     */
    static removeOnResumeListener(callback: () => void) {
        APICaller.#onResumeCallbacks.delete(callback);
    }

    /**
     * Handles application pause by aborting all in-flight API requests and
     * clearing internal request state.
     *
     * Invoked when the document becomes hidden (e.g. tab backgrounded,
     * window minimized, or app suspended).
     */
    private static onPause() {
        for (const request of APICaller.#requests.values()) {
            request.controller.abort();
        }
        APICaller.#requests.clear();
        APICaller.#paused = true;
    }

    /**
     * Handles application resume by clearing the paused state and notifying
     * registered listeners to re-establish required application intent
     * (e.g. restart polling or refresh critical data).
     *
     * Invoked when the document becomes visible again.
     */
    private static onResume() {
        APICaller.#paused = false;
        for (const callback of APICaller.#onResumeCallbacks) {
            callback();
        }
    }

    /**
     * Returns true if the response indicates that the backend server is unreachable
     * while the proxy/front-end layer is still responding.
     *
     * Covers standard upstream failure codes:
     * 502 (Bad Gateway), 503 (Service Unavailable), 504 (Gateway Timeout).
     */
    private static serverDisconnected(response: Response): boolean {
        if (response.status === 502 || response.status === 503 || response.status === 504) {
            return true;
        }
        return false;
    }

    /**
     * Low-level HTTP utility for performing API requests with unified timeout
     * and cancellation control.
     *
     * Builds and executes a fetch request using query parameters, JSON bodies,
     * or multipart form data depending on the HTTP method and inputs.
     *
     * The request lifecycle is controlled via an internally owned AbortController.
     * All requests must provide an external AbortSignal, which represents manual
     * cancellation (e.g. component lifecycle, request replacement). Requests may
     * also be aborted automatically due to a timeout; the abort reason is tracked
     * explicitly.
     *
     * An injectable fetch implementation is supported to allow use in different
     * runtimes (e.g. SSR or testing).
     *
     * @param endpoint - API endpoint path (e.g. "/api/resource")
     * @param method - HTTP method ("GET", "POST", "PUT", "DELETE")
     * @param params - Request parameters (query params for GET, body otherwise)
     * @param externalSignal - AbortSignal used for manual cancellation (required)
     * @param timeout - Optional timeout in milliseconds
     * @param file - Optional file for multipart/form-data uploads
     * @param fileFieldName - Form field name for the uploaded file
     * @param fetchFn - Fetch implementation to use (defaults to global fetch)
     *
     * @returns APIResult indicating success, handled error, or aborted request
     * (including the abort reason).
     */
    private static async makeAPIRequest(
        endpoint: string,
        method: string,
        params: Record<string, any> = {},
        externalSignal: AbortSignal,
        timeout?: number,
        file?: File,
        fileFieldName: string = "file",
        fetchFn: typeof fetch = fetch,
    ): Promise<APIResult> {
        const controller = new AbortController();
        const { signal } = controller;
        let abortReason: AbortReason = AbortReason.MANUAL;

        if (externalSignal.aborted) {
            controller.abort();
        } else {
            externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
        }

        // Automatically abort the request after `timeout` milliseconds if a timeout is given.
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        if (timeout !== undefined) {
            timeoutId = setTimeout(() => {
                abortReason = AbortReason.TIMEOUT;
                controller.abort();
            }, timeout);
        }
        try {
            if (method !== "GET" && method !== "POST" && method !== "PUT" && method !== "DELETE") {
                throw new Error("Unsupported HTTP method");
            }

            let url = endpoint;
            let options: RequestInit = {
                method: method,
                signal,
            };

            // Handle GET requests by appending params to URL (Form Data)
            if (method === "GET" && Object.keys(params).length > 0) {
                const queryParams = Object.entries(params)
                    .map(([key, value]) => {
                        if (value !== undefined && value !== null) {
                            return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
                        }
                        return null;
                    })
                    .filter((param) => param !== null)
                    .join("&");

                url = queryParams ? `${endpoint}?${queryParams}` : endpoint;
            }
            // For non-GET requests, add params to the body (as JSON)
            else if (method !== "GET") {
                if (file) {
                    const formData = new FormData();
                    formData.append(fileFieldName, file);

                    Object.entries(params).forEach(([key, value]) => {
                        formData.append(key, JSON.stringify(value));
                    });

                    options.body = formData;
                } else if (Object.keys(params).length > 0) {
                    options.headers = {
                        "Content-Type": "application/json",
                    };
                    options.body = JSON.stringify(params);
                }
            }

            let data: any | null = null;
            const response = await fetchFn(url, options);
            if (APICaller.serverDisconnected(response)) return { kind: "disconnected" };
            try {
                data = await response.json();
            } catch (error) {
                // Only error result needs to have content, in an order to be able to get the error section and code
                if (!response.ok) throw new Error("Invalid response from the server.");
            }
            if (timeoutId != null) {
                clearTimeout(timeoutId); // cancel timeout if response arrives in time
                timeoutId = null;
            }
            return { kind: response.status === 200 ? "sucess" : "error", status: response.status, data: data };
        } catch (error) {
            if (timeoutId != null) {
                clearTimeout(timeoutId); // cancel timeout if error occurs
                timeoutId = null;
            }
            if ((error as any)?.name === "AbortError") return { kind: "aborted", abortReason };
            const message = error instanceof Error ? error.message : String(error);
            return { kind: "exception", message };
        }
    }

    /**
     * Executes a backend API request with centralized UI-side handling and
     * in-flight request deduplication.
     *
     * Requests are coordinated per endpoint using an internal in-flight map.
     * The current request payload is serialized and passed to the in-flight
     * coordinator. If an equivalent request is already in progress for the same
     * endpoint, this method awaits and returns the existing promise (no new network
     * call is issued). Otherwise, it creates a new AbortController, starts a new
     * request via `processAPIRequest`, stores the controller/promise/payload as the
     * current in-flight entry for the endpoint, and returns the new result.
     *
     * The underlying request processing applies consistent application behavior:
     * authentication redirect handling, error normalization, toast notification
     * dispatch (immediate or deferred until UI synchronization), and optional global
     * loading-state updates.
     *
     * @param options - API call configuration
     * @param options.endpoint - Backend API endpoint path
     * @param options.method - HTTP method ("GET", "POST", "PUT", "DELETE")
     * @param options.requestId - Identifier for the request. If an explicit identifier is not provided, the endpoint is used as the request identifier.
     * @param options.params - Request parameters (query params for GET, body otherwise)
     * @param options.timeout - Optional request timeout in milliseconds
     * @param options.file - Optional file for multipart/form-data uploads
     * @param options.fileFieldName - Form field name for file uploads
     * @param options.setLoaded - Whether to mark the global loaded state on success
     * @param options.signal - Optional AbortSignal for lifecycle cancellation
     * @param options.fetchFn - Fetch implementation override (defaults to global fetch)
     *
     * @returns Promise resolving to `{ sucess: true, data }` on HTTP success, or
     *          `{ sucess: false, data: null }` when the request fails, is handled
     *          as an application-level error, or is intentionally skipped due to
     *          in-flight deduplication.
     */
    static async callAPI({
        endpoint,
        method,
        requestId,
        params = {},
        timeout,
        file,
        fileFieldName = "file",
        setLoaded = false,
        signal,
        numberOfRetries = 0,
        fetchFn = fetch,
    }: CallAPIOptions): Promise<{ sucess: boolean; data: any }> {
        if (APICaller.#paused) return { sucess: false, data: null };
        const payload = JSON.stringify(params);
        const requestData = APICaller.handleInFlightRequests(requestId ?? endpoint, payload, signal);
        if (!requestData.promise) {
            // Make a new api request
            const requestPromise = this.processAPIRequest(
                { requestId, endpoint, method, params, timeout, file, fileFieldName, setLoaded, signal, fetchFn },
                requestData.controller,
            );
            APICaller.#requests.set(requestId ?? endpoint, {
                controller: requestData.controller,
                promise: requestPromise,
                content: payload,
                remainingAttempts: numberOfRetries,
            });
            return await requestPromise;
        } else {
            // Wait for the on going api request
            return await requestData.promise;
        }
    }

    /**
     * Executes a prepared API request and applies centralized result handling.
     *
     * Invokes the low-level HTTP request using the provided AbortController,
     * then normalizes the result into application-level behavior, including
     * authentication redirects, error mapping, toast notification dispatch,
     * and optional global loading-state updates.
     *
     * Ensures in-flight request tracking is cleaned up when execution completes,
     * regardless of success, failure, or cancellation.
     *
     * @param apiOptions - Fully resolved API call configuration
     * @param abortController - AbortController governing the request lifecycle
     * @returns Promise resolving to a success flag and response payload, or null data on failure
     */
    private static async processAPIRequest(apiOptions: CallAPIOptions, abortController: AbortController): Promise<{ sucess: boolean; data: any }> {
        try {
            const apiResult = await APICaller.makeAPIRequest(
                apiOptions.endpoint,
                apiOptions.method,
                apiOptions.params,
                abortController.signal,
                apiOptions.timeout,
                apiOptions.file,
                apiOptions.fileFieldName,
                apiOptions.fetchFn,
            );
            if (apiResult.kind === "sucess") {
                if (apiOptions.setLoaded && !get(loadedDone)) loadedDone.set(true); // Set loaded done
                return { sucess: true, data: apiResult.data };
            } else {
                const redirectedToLogin = await APICaller.redirectToLogin(apiResult);
                const stopRequestEarly = APICaller.returnEarly(apiResult, apiOptions.endpoint, redirectedToLogin);
                if (stopRequestEarly) return { sucess: false, data: apiResult.kind == "error" ? apiResult.data : null };
                let remainingAttempts = APICaller.#requests.has(apiOptions.requestId ?? apiOptions.endpoint)
                    ? APICaller.#requests.get(apiOptions.requestId ?? apiOptions.endpoint)?.remainingAttempts
                    : 0;
                if (remainingAttempts && !redirectedToLogin && apiResult.kind !== "aborted") {
                    APICaller.#requests.get(apiOptions.requestId ?? apiOptions.endpoint)!.remainingAttempts -= 1;
                    return await APICaller.processAPIRequest(apiOptions, abortController);
                }
                let errorMessage = APICaller.getAPIMessage(apiResult);
                APICaller.showAPIMessage(errorMessage);
                return { sucess: false, data: apiResult.kind == "error" ? apiResult.data : null };
            }
        } catch (e) {
            console.error(`Error calling API ${apiOptions.endpoint} in request ${apiOptions.requestId}: ${e}`);
            return { sucess: false, data: null };
        } finally {
            const current = APICaller.#requests.get(apiOptions.requestId ?? apiOptions.endpoint);
            if (current?.controller === abortController) APICaller.#requests.delete(apiOptions.requestId ?? apiOptions.endpoint);
        }
    }

    /**
     * Coordinates and deduplicates in-flight API requests per endpoint.
     *
     * Compares the serialized request payload against any existing in-flight
     * request for the same endpoint. If the payload is identical, the existing
     * AbortController and promise are reused and no new request should be issued.
     * If the payload differs, the previous request is aborted and a new controller
     * is created for the incoming request.
     *
     * Optionally chains an external AbortSignal so caller-initiated cancellation
     * propagates to the managed request lifecycle.
     *
     * @param requestId - API request identifier used as the request identity key
     * @param content - Serialized request payload used to detect equivalent requests
     * @param signal - Optional external AbortSignal for lifecycle cancellation
     * @returns Object containing the AbortController and optional reused promise.
     */
    private static handleInFlightRequests(
        requestId: string,
        content: string,
        signal?: AbortSignal,
    ): { controller: AbortController; promise?: Promise<{ sucess: boolean; data: any }> } {
        const prevRequest = APICaller.#requests.get(requestId);
        if (prevRequest) {
            if (prevRequest.content === content) {
                // return the previous request data without changes
                return { controller: prevRequest.controller, promise: prevRequest.promise };
            } else {
                // abort previous request if the new payload (content) is different
                prevRequest.controller.abort();
                const controller = new AbortController();
                signal?.addEventListener("abort", () => controller.abort());
                // return new abort controller without promise since the previous promise is cancelled
                return { controller: controller, promise: undefined };
            }
        } else {
            const controller = new AbortController();
            signal?.addEventListener("abort", () => controller.abort());
            // return new abort controller without promise since there is no previous request
            return { controller: controller, promise: undefined };
        }
    }

    /**
     * Handles authentication-related API failures by resetting authentication
     * state and redirecting the user to the login page.
     *
     * Inspects an APIResult and determines whether it represents an authentication
     * or access-related error, such as unauthorized access (401), rate limiting
     * (429), or a missing user configuration error. When such a condition is
     * detected, the authenticated state is cleared and the user is redirected
     * to the login view.
     *
     * @param apiResult - Result returned by an API request
     * @returns True if an authentication error was detected and a redirect to the
     *          login page was performed; false otherwise.
     */
    private static async redirectToLogin(apiResult: APIResult): Promise<boolean> {
        let authenticationError =
            apiResult.kind === "error" && (apiResult.status === 401 || apiResult.status === 429 || apiResult.data?.error_code === "USER_CONFIG_NOT_FOUND");
        if (authenticationError && get(pageExists)) {
            // Unauthorized acess
            userAuthenticated.set(false);
            await navigateTo("/login", {}, true, true);
            return true;
        }
        return false;
    }

    /**
     * Determines whether API result handling should stop early.
     *
     * Returns true when further processing is unnecessary or undesirable, such as
     * when a redirect to the login page has already occurred for auto-login requests,
     * or when a request was intentionally aborted due to manual cancellation.
     *
     * @param apiResult - Result returned by an API request
     * @param endpoint - API endpoint associated with the request
     * @param redirectedToLogin - Whether a login redirect has already been performed
     * @returns True if the caller should return early, false otherwise
     */
    private static returnEarly(apiResult: APIResult, endpoint: string, redirectedToLogin: boolean): boolean {
        if (redirectedToLogin && endpoint === "/api/auth/auto_login") return true;
        if (apiResult.kind === "aborted" && apiResult.abortReason === AbortReason.MANUAL) return true;
        return false;
    }

    /**
     * Translates an APIResult into a UI-ready error message configuration.
     *
     * Normalizes API error responses, maps backend error codes and sections to
     * localized alert groups, enriches error details where required, and determines
     * whether the resulting alert should auto-close.
     *
     * Aborted and exception results are handled explicitly and converted into
     * generic, user-facing error messages.
     *
     * @param apiResult - Result returned by an API request
     * @returns Structured error message data for toast/alert display
     */
    private static getAPIMessage(apiResult: APIResult): {
        code: string;
        details: Record<string, string>;
        textList: AlertTextList;
        autoClose: boolean;
    } {
        if (apiResult.kind === "disconnected") return { code: "disconnectedError", details: {}, textList: "general", autoClose: true };
        if (apiResult.kind === "aborted") return { code: "timeoutError", details: {}, textList: "general", autoClose: true };
        if (apiResult.kind === "exception")
            return { code: "unexpectedError", details: { message: apiResult.message }, textList: "general", autoClose: true };
        let errorCode: string | undefined = apiResult.data?.error_code;
        let errorSection: string | undefined = apiResult.data?.error_section;
        let details = removeKeysFromRecord(apiResult.data, ["error_code", "error_section"]);
        if (!errorCode) return { code: "unexpectedError", details: { message: "Got an undefined error code." }, textList: "general", autoClose: true };
        if (details?.unlocked_date != undefined) {
            details.unlocked_date = convertDateToLocalTime(details?.unlocked_date);
            if (details?.remaining_attempts != undefined && details?.remaining_attempts == "0") {
                errorCode = "BLOCKED_CLIENT"; // Set error code to blocked client in ui to show the user it is already blocked
            }
        }
        let textList: AlertTextList;
        switch (errorSection) {
            case "GLOBAL":
                textList = "apiGeneral";
                break;
            case "AUTH":
                textList = "apiAuthorization";
                break;
            case "DEVICE":
                textList = "apiDevice";
                break;
            case "NODES":
                textList = "apiNodes";
                break;
            default:
                return { code: "unexpectedError", details: { message: "Got an unknown error section." }, textList: "general", autoClose: true };
        }
        let autoClose = apiResult.status !== 401 && apiResult.status !== 429;
        return { code: errorCode, details, textList, autoClose };
    }

    private static showAPIMessage(message: { code: string, details: Record<string, string>, textList: AlertTextList, autoClose: boolean }): void {
        if (get(uiSynchronized)) {
            showToast(message.code, AlertType.ALERT, message.details, message.textList, message.autoClose);
        } else {
            latestAPIMessage.set(message);
        }
    }
}
