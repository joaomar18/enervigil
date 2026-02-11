import { APICaller } from "./api";
import type { APIDescriptor } from "./api";

/**
 * A retry utility that executes an API with exponential backoff until success or maximum interval reached.
 *
 * Key features:
 * - Exponential backoff with configurable factor and maximum interval
 * - Prevents overlapping executions using in-flight protection
 * - AbortSignal support for graceful cancellation
 * - Automatic retry on failure with increasing delays
 * - Resource cleanup and lifecycle management
 * - Dynamic interval adjustment during runtime
 */
export class APIRetrier<T> {
    #api: APIDescriptor<T> | null = null;
    #callback: (result: T) => void;
    #resumeListener: () => void;
    #interval: number;
    #requestId?: string;
    #backoffFactor: number;
    #maxIntervalMs: number;
    #currentInterval: number;
    #inFlight: boolean;
    #destroyed: boolean;
    #timer: ReturnType<typeof setTimeout> | null;
    #controller: AbortController | null = null;

    constructor(
        api: APIDescriptor<T>,
        callback: (result: T) => void,
        interval: number,
        requestId?: string,
        backoffFactor: number = 1.3,
        maxIntervalMs: number = 30000,
        immediate: boolean = true,
    ) {
        this.#api = api;
        this.#callback = callback;
        this.#interval = interval;
        this.#requestId = requestId;
        this.#resumeListener = () => {
            this.start();
        };
        APICaller.addOnResumeListener(this.#resumeListener);
        this.#backoffFactor = backoffFactor;
        this.#maxIntervalMs = maxIntervalMs;
        this.#currentInterval = 0;
        this.#inFlight = false;
        this.#destroyed = false;
        this.#timer = null;
        this.#controller = null;
        this.start(immediate);
    }

    /**
     * Starts or restarts the retry loop.
     *
     * @param immediate - Whether to execute immediately or wait for the next interval (default: true)
     * @throws {Error} When the retrier has been destroyed
     */
    start(immediate: boolean = true) {
        if (this.#destroyed) {
            throw new Error("API Retrier is destroyed");
        }
        this.stop(false); // Clear previous timers without destroying
        immediate ? this.#run() : this.#schedule();
    }

    /**
     * Stops the retry loop and optionally destroys the retrier.
     *
     * @param destroy - Whether to permanently destroy the retrier (default: true)
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
     * Executes the method with abort signal support and handles success/failure logic.
     */
    async #run() {
        let sucess = false;

        if (this.#destroyed || !this.#api || this.#inFlight) {
            return;
        }

        this.#inFlight = true;
        this.#controller = new AbortController();
        if (!this.#currentInterval) this.#currentInterval = this.#interval;

        try {
            let result = await this.#api.call({ timeout: this.#currentInterval, signal: this.#controller.signal }, this.#requestId);
            this.#callback(result);
            sucess = result !== null;
        } catch (e) {
            if ((e as any)?.name !== "AbortError") {
                console.error("Error in API Retrier: ", e);
            }
        } finally {
            this.#controller = null;
            this.#inFlight = false;
            sucess ? this.stop() : this.#schedule();
        }
    }

    /**
     * Schedules the next retry attempt with exponential backoff.
     */
    #schedule() {
        if (this.#destroyed) {
            return;
        }
        if (this.#currentInterval == this.#maxIntervalMs) {
            this.stop();
            return;
        }
        this.#currentInterval *= this.#backoffFactor;
        if (this.#currentInterval == 0) {
            this.#currentInterval = this.#interval;
        }
        if (this.#currentInterval > this.#maxIntervalMs) {
            this.#currentInterval = this.#maxIntervalMs;
        }
        this.#timer = setTimeout(() => this.#run(), this.#currentInterval);
    }

    /**
     * Updates the retry interval and resets the backoff progression.
     *
     * @param ms - New interval in milliseconds
     * @throws {Error} When the retrier has been destroyed
     */
    setInterval(ms: number) {
        if (this.#destroyed) {
            throw new Error("API Retrier is destroyed");
        }
        this.#interval = ms;
        this.#currentInterval = 0;
        if (this.#timer) {
            clearTimeout(this.#timer);
            this.#schedule();
        }
    }
}
