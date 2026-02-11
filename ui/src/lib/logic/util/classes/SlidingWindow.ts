import { isEqual } from "../generic";

/**
 * Fixed-size sliding window that maintains the most recent items in LIFO order.
 */
export class SlidingWindow<T> {
    private items: T[] = [];
    private maxSize: number;

    constructor(maxSize: number) {
        if (maxSize <= 0) {
            throw new Error("maxSize must be greater than 0");
        }
        this.maxSize = maxSize;
    }

    /** Adds item to front if not duplicate, removing oldest if at capacity. */
    add(item: T): void {
        if (this.items.length > 0 && isEqual(item, this.items[0])) return;
        this.items.unshift(item);
        if (this.items.length > this.maxSize) {
            this.items.length = this.maxSize;
        }
    }

    /** Returns the previous item without committing to the navigation. */
    previous(): T | null {
        if (this.items.length > 1) {
            return this.items[1];
        }
        return null;
    }

    /** Confirms the previous navigation by removing the current item from history. */
    confirmPrevious(): void {
        if (this.items.length > 1) {
            this.items.shift();
        }
    }

    /** Returns the current (most recent) item without removing it. */
    current(): T | null {
        return this.items[0] ?? null;
    }

    /** Returns true if there are items to go back to. */
    hasPrevious(): boolean {
        return this.items.length > 1;
    }

    /** Removes all items from the window. */
    clear(): void {
        this.items = [];
    }

    /** Returns the current number of items in the window. */
    size(): number {
        return this.items.length;
    }
}