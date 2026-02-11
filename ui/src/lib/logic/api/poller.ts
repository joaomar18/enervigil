import { APICaller } from "./api";
import type { APIDescriptor } from "./api";

/**
 * A polling utility that repeatedly executes an API at specified intervals.
 *
 * Features:
 * - Prevents overlapping executions with in-flight tracking
 * - Supports abort signals for cancelling long-running operations
 * - Handles errors gracefully with console logging
 * - Allows dynamic interval adjustment
 * - Proper resource cleanup and destruction
 */
export class APIPoller<T> {
    #api: APIDescriptor<T> | null = null;
    #callback: (result: T) => void;
    #resumeListener: () => void;
    #interval: number;
    #requestId?: string;
    #inFlight: boolean;
    #destroyed: boolean;
    #timer: ReturnType<typeof setTimeout> | null;
    #controller: AbortController | null = null;

    constructor(api: APIDescriptor<T>, callback: (result: T) => void, interval: number, requestId?: string, immediate: boolean = true) {
        this.#api = api;
        this.#callback = callback;
        this.#interval = interval;
        this.#requestId = requestId;
        this.#resumeListener = () => {
            this.start();
        };
        APICaller.addOnResumeListener(this.#resumeListener);
        this.#inFlight = false;
        this.#destroyed = false;
        this.#timer = null;
        this.#controller = null;
        this.start(immediate);
    }

    /**
     * Starts or restarts the polling operation.
     * @param immediate - Whether to run the method immediately or wait for the first interval.
     */
    start(immediate: boolean = true) {
        if (this.#destroyed) {
            throw new Error("API Poller is destroyed");
        }
        this.stop(false); // Clear previous timers without destroying
        immediate ? this.#run() : this.#schedule();
    }

    /**
     * Stops the polling operation and optionally destroys the poller.
     * @param destroy - Whether to permanently destroy the poller instance.
     */
    stop(destroy: boolean = true) {
        if (this.#timer) {
            clearTimeout(this.#timer);
        }
        this.#timer = null;
        this.#controller?.abort();
        this.#controller = null;

        if (destroy) {
            this.#destroyed = true;
            this.#api = null;
            APICaller.removeOnResumeListener(this.#resumeListener);
        }
    }

    /**
     * Executes the polling method with error handling and abort support.
     * Prevents overlapping executions and reschedules the next run.
     */
    async #run() {
        if (this.#destroyed || !this.#api || this.#inFlight) {
            return;
        }

        this.#inFlight = true;
        this.#controller = new AbortController();

        try {
            let result = await this.#api.call({ timeout: this.#interval, signal: this.#controller.signal }, this.#requestId);
            this.#callback(result);
        } catch (e) {
            if ((e as any)?.name !== "AbortError") {
                console.error("Error in API Poller: ", e);
            }
        } finally {
            this.#controller = null;
            this.#inFlight = false;
            this.#schedule();
        }
    }

    /**
     * Schedules the next execution of the polling method after the specified interval.
     */
    #schedule() {
        if (this.#destroyed) {
            return;
        }
        this.#timer = setTimeout(() => this.#run(), this.#interval);
    }

    /**
     * Updates the polling interval and reschedules if currently running.
     * @param ms - New interval time in milliseconds.
     */
    setInterval(ms: number) {
        if (this.#destroyed) {
            throw new Error("API Poller is destroyed");
        }
        this.#interval = ms;
        if (this.#timer) {
            clearTimeout(this.#timer);
            this.#schedule();
        }
    }
}
