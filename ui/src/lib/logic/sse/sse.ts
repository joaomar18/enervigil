import { get } from "svelte/store";
import { navigateTo } from "../view/navigation";
import { userAuthenticated } from "$lib/stores/view/navigation";
import type { AlertTextList } from "$lib/stores/view/toast";
import { AlertType } from "$lib/stores/view/toast";
import { uiSynchronized, latestAPIMessage } from "$lib/stores/view/navigation";
import { showToast } from "../view/toast";


/**
 * SSE event types emitted by the backend.
 *
 * These correspond to named SSE events sent by the server to signal
 * connection liveness, authentication failures, or server-side errors.
 */
enum SSEEvent {
    HEARTBEAT = "heartbeat",
    AUTH_ERROR = "auth_error",
    INTERNAL_ERROR = "internal_error",
}


/**
 * Logical SSE error categories used for UI messaging.
 *
 * These represent client-side interpretations of SSE failures and are
 * translated into UI-ready toast messages via `getSSEMessage`.
 */
enum SSEError {
    DISCONNECTED = "disconnected",
    UNAUTHORIZED = "unauthorized",
    INTERNAL = "internal",
    INVALID_JSON = "invalid_json",
}

/**
 * Centralized Server-Sent Events (SSE) connection manager.
 *
 * Provides a reusable abstraction for establishing, monitoring, and
 * recovering SSE connections across the application.
 *
 * The handler owns the entire SSE lifecycle:
 * - connection establishment
 * - heartbeat-based liveness tracking
 * - inactivity timeout detection
 * - controlled reconnection
 * - authentication failure handling
 * - internal server error reporting
 * - optional JSON payload parsing
 *
 * Incoming messages are delivered through a typed callback, allowing
 * the same handler to support multiple data streams (metrics, logs,
 * device telemetry, etc.) while keeping UI and networking concerns
 * separated.
 *
 * Error reporting is integrated with the application’s toast and
 * navigation systems, ensuring consistent UI behavior across SSE
 * consumers.
 *
 * This class intentionally uses explicit timeout-based reconnection
 * instead of relying solely on the browser’s automatic EventSource
 * retry behavior, allowing detection of silent connection stalls.
 *
 * @template T - Type of the payload received from SSE messages
 */
export class SSEHandler<T = string> {
    private url: string; // SSE endpoint URL
    private dataCallback: (data: T) => void; // Callback invoked when a data message is received
    private jsonData: boolean; // Whether incoming messages should be parsed as JSON
    private eventSource: EventSource | null = null; // Active EventSource instance
    private lastMessageTimestamp: number | null = null; // Timestamp of the last received message or heartbeat
    private timeout: number | null = null; // Inactivity timeout in milliseconds
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null; // Timeout handle used for connection monitoring

    /**
     * Creates and immediately connects to an SSE endpoint.
     *
     * @param url - SSE endpoint URL
     * @param dataCallback - Function invoked when a message is received
     * @param timeout - Optional inactivity timeout (ms) used for reconnection detection
     * @param jsonData - Whether incoming messages should be parsed as JSON
     */
    constructor(url: string, dataCallback: (data: T) => void, timeout: number | null = null, jsonData: boolean = true) {
        this.url = url;
        this.dataCallback = dataCallback;
        this.jsonData = jsonData;
        this.timeout = timeout;
        this.connect();
    }

    /**
     * Starts the inactivity monitoring loop.
     *
     * If no message or heartbeat is received within the timeout window,
     * the connection is considered stale and a reconnect is triggered.
     */
    handleConnection = (timeout: number) => {
        this.reconnectTimeout = setTimeout(() => {
            if (!this.eventSource) return;
            if (this.lastMessageTimestamp == null || (Date.now() - this.lastMessageTimestamp) > timeout) {
                this.reconnect();
            }
            else {
                this.handleConnection(timeout);
            }
        }, timeout);
    }

    /**
     * Establishes the SSE connection and registers event listeners.
     */
    connect = () => {
        this.eventSource = new EventSource(this.url);
        this.eventSource.onmessage = this.onMessageReceived;
        this.eventSource.addEventListener(SSEEvent.HEARTBEAT, this.keepAlive);
        this.eventSource.addEventListener(SSEEvent.AUTH_ERROR, this.authorizationError);
        this.eventSource.addEventListener(SSEEvent.INTERNAL_ERROR, this.internalError);
        if (this.timeout && !this.reconnectTimeout) this.handleConnection(this.timeout);
        this.lastMessageTimestamp = Date.now();
    }

    /**
     * Closes the SSE connection and clears monitoring timers.
     */
    close = () => {
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
        this.eventSource?.removeEventListener(SSEEvent.HEARTBEAT, this.keepAlive);
        this.eventSource?.removeEventListener(SSEEvent.AUTH_ERROR, this.authorizationError);
        this.eventSource?.removeEventListener(SSEEvent.INTERNAL_ERROR, this.internalError);
        this.eventSource?.close();
        this.eventSource = null;
    }

    /**
     * Reconnects to the SSE endpoint after a timeout/disconnection.
     */
    reconnect = () => {
        let errorMessage = this.getSSEMessage(SSEError.DISCONNECTED);
        this.showSSEMessage(errorMessage);
        this.close();
        this.connect();
    }

    /**
     * Updates the connection liveness timestamp.
     * Triggered by heartbeat events and normal messages.
     */
    keepAlive = () => {
        this.lastMessageTimestamp = Date.now();
    }


    /**
     * Handles authentication failures reported via SSE.
     * Resets authentication state and redirects to login.
     */
    authorizationError = async () => {
        this.close();
        // Unauthorized access
        userAuthenticated.set(false);
        await navigateTo("/login", {}, true, true);
        let errorMessage = this.getSSEMessage(SSEError.UNAUTHORIZED);
        this.showSSEMessage(errorMessage);
    }

    /**
     * Handles internal server error events emitted through SSE.
     */
    internalError = () => {
        this.keepAlive();
        let errorMessage = this.getSSEMessage(SSEError.INTERNAL);
        this.showSSEMessage(errorMessage);
    }

    /**
     * Processes incoming SSE messages and invokes the data callback.
     * Optionally parses the payload as JSON.
     */
    onMessageReceived = (event: MessageEvent) => {
        this.keepAlive();
        let data: T;
        if (this.jsonData) {
            try {
                data = JSON.parse(event.data) as T;
            }
            catch (e) {
                let errorMessage = this.getSSEMessage(SSEError.INVALID_JSON);
                this.showSSEMessage(errorMessage)
                return;
            }
        }
        else {
            data = event.data as T;
        }

        this.dataCallback(data);
    }


    /**
     * Maps SSE error categories to UI-ready message descriptors.
     */
    getSSEMessage = (error: SSEError): {
        code: string;
        details: Record<string, string>;
        textList: AlertTextList;
        autoClose: boolean;
    } => {
        switch (error) {
            case SSEError.DISCONNECTED:
                return { code: "timeoutError", details: {}, textList: "general", autoClose: true };
            case SSEError.UNAUTHORIZED:
                return { code: "INVALID_TOKEN", details: {}, textList: "apiAuthorization", autoClose: false };
            case SSEError.INTERNAL:
                return { code: "unexpectedError", details: { message: "Internal Server Error." }, textList: "general", autoClose: true };
            case SSEError.INVALID_JSON:
                return { code: "INVALID_JSON", details: {}, textList: "apiGeneral", autoClose: true };
        }
    }

    /**
     * Dispatches an SSE-related message to the UI.
     *
     * Messages are shown immediately when the UI is synchronized,
     * otherwise they are queued for later display.
     */
    showSSEMessage = (message: { code: string, details: Record<string, string>, textList: AlertTextList, autoClose: boolean }) => {
        if (get(uiSynchronized)) {
            showToast(message.code, AlertType.ALERT, message.details, message.textList, message.autoClose);
        } else {
            latestAPIMessage.set(message);
        }
    }
}