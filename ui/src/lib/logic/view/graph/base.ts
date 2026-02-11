import uPlot from "uplot";
import { FormattedTimeStep } from "$lib/types/date";
import { LogSpanPeriod } from "$lib/types/view/nodes";
import { getGraphSize } from "./helpers";
import type { BaseLogPoint, ProcessedBaseLogPoint } from "$lib/types/nodes/logs";

/**
 * Graph visualization types for different data representations.
 */
export enum GraphType {
    Measurement = "Measurement",
    Counter = "Counter",
    EnergyConsumption = "EnergyConsumption"
}

/**
 * Abstract base class for interactive uPlot graph components.
 * 
 * Provides core functionality for time-series data visualization including cursor tracking,
 * hover detection, double-click navigation, and event management. Child classes implement
 * specific rendering logic for different graph types (measurement, counter).
 * 
 * Features:
 * - Mouse interaction handling with position tracking
 * - Double-click drill-down navigation 
 * - Hover state management with callbacks
 * - Graph lifecycle management (creation, resizing, cleanup)
 * - Memory-safe event listener management
 * 
 * @template T The log point type extending BaseLogPoint for type-safe tooltips
 */
export abstract class BaseGraphObject<T extends BaseLogPoint> {
    protected abstract graphType: GraphType;
    protected currentHoverPeriod: number = -1;
    public hoveredLogPoint: T | null = null;
    protected container: HTMLElement;
    protected graph: uPlot | null = null;
    protected gridElement: HTMLDivElement | null = null;
    protected labels: Array<string> = []; // X Axis Labels
    protected noData: boolean = true;
    protected xPos: number | undefined = undefined;
    protected yPos: number | undefined = undefined;
    protected hoveredLogPointCallback: ((logPoint: T | null) => void) | null = null;
    protected mousePositionChangeCallback: ((xPos: number | undefined, yPos: number | undefined) => void) | null = null;
    protected gridDoubleClickCallback: ((startTime: Date, endTime: Date) => void) | null = null;
    protected boundGridDoubleClickHandler: ((event: MouseEvent) => void) | null = null;
    protected noOfClicks: number = 0;
    protected maxDurationBetweenClicks: number = 500;
    protected lastClickTimeStamp: number | null = null;
    protected lastClickPeriod: number | null = null;

    constructor(container: HTMLElement, hoveredLogPointChange: ((logPoint: T | null) => void) | null, mousePositionChange: ((xPos: number | undefined, yPos: number | undefined) => void) | null, gridDoubleClick: ((startTime: Date, endTime: Date) => void) | null) {
        this.container = container;
        this.hoveredLogPointCallback = hoveredLogPointChange;
        this.mousePositionChangeCallback = mousePositionChange;
        this.gridDoubleClickCallback = gridDoubleClick;
    }

    abstract updatePoints(points: Array<ProcessedBaseLogPoint>, roundPoints: boolean, config: {
        decimalPlaces?: number | undefined | null;
        // Energy consumption specific
        activeEnergyDecimalPlaces?: number | undefined | null;
        reactiveEnergyDecimalPlaces?: number | undefined | null;
        powerFactorDecimalPlaces?: number | undefined | null;
    }): void;
    abstract createGraph(timeStep: FormattedTimeStep, logSpanPeriod: LogSpanPeriod, style: { [property: string]: string | number },): void;
    abstract drawCanvas(u: uPlot, style: { [property: string]: string | number }): void;
    abstract pointNoData(index: number): boolean;
    abstract getHoveredLogPoint(currentHoverPeriod: number, timeStep: FormattedTimeStep): T | null

    /**
     * Returns whether the graph has valid data to display.
     */
    hasData(): boolean {
        return !this.noData;
    }

    /**
     * Gets the graph type for component identification and styling.
     */
    getGraphType(): GraphType {
        return this.graphType;
    }

    /**
     * Returns the graph's interaction overlay element for tooltip positioning.
     */
    getGridElement(): HTMLDivElement | null {
        return this.gridElement;
    }

    /**
     * Tracks cursor position and triggers position callbacks for tooltip handling.
     */
    getCursorPosition(u: uPlot): void {
        this.xPos = u.cursor.left;
        this.yPos = u.cursor.top;
        if (this.mousePositionChangeCallback) {
            this.mousePositionChangeCallback(this.xPos, this.yPos);
        }
    }

    /**
     * Detects double-click events by tracking click timestamps and triggers drill-down navigation.
     */
    handleGridDoubleClickListener(points: Array<ProcessedBaseLogPoint>): void {
        const currentMs = Date.now();
        if (this.lastClickTimeStamp === null) {
            this.lastClickTimeStamp = currentMs;
            this.noOfClicks = 1;
            this.lastClickPeriod = this.currentHoverPeriod != -1 ? this.currentHoverPeriod : null;
        }
        else {
            if (currentMs - this.lastClickTimeStamp <= this.maxDurationBetweenClicks) {
                this.noOfClicks = 2;
            }
            else {
                this.lastClickTimeStamp = currentMs;
                this.noOfClicks = 1;
                this.lastClickPeriod = this.currentHoverPeriod != -1 ? this.currentHoverPeriod : null;
            }
        }
        if (this.noOfClicks == 2 && this.currentHoverPeriod == this.lastClickPeriod) {
            this.noOfClicks = 0;
            this.lastClickTimeStamp = null;
            this.lastClickPeriod = null;
            this.processGridDoubleClick(points);
        }
    }

    /**
     * Handles double-click events for drill-down navigation to specific time periods.
     */
    processGridDoubleClick(points: Array<ProcessedBaseLogPoint>): void {
        if (!points || this.currentHoverPeriod < 0 || this.currentHoverPeriod >= points.length) return;

        const index = this.currentHoverPeriod;
        const noData = this.pointNoData(index);
        if (noData) return;

        if (this.gridDoubleClickCallback) {
            const startTime = new Date(points[index].start_time * 1000);
            const endTime = new Date(points[index].end_time * 1000);
            this.gridDoubleClickCallback(startTime, endTime);
        }
    }

    /**
     * Determines hovered time period and triggers tooltip updates with hover callbacks.
     */
    getHoveredPeriod(u: uPlot, timeStep: FormattedTimeStep, points: Array<ProcessedBaseLogPoint>): void {
        if (this.xPos !== undefined && this.xPos >= 0) { // Valid Cursor position
            const xVal = u.posToVal(this.xPos, "x");
            const hoverPeriod = Math.floor(xVal);

            if (hoverPeriod >= 0 && hoverPeriod < points.length) {
                if (this.currentHoverPeriod !== hoverPeriod) {
                    this.currentHoverPeriod = hoverPeriod;
                    this.hoveredLogPoint = this.getHoveredLogPoint(this.currentHoverPeriod, timeStep);
                    if (this.hoveredLogPointCallback) {
                        this.hoveredLogPointCallback(this.hoveredLogPoint);
                    }
                    u.redraw();
                }
            }
        } else { // Cursor outside Graph
            if (this.currentHoverPeriod !== -1) {
                this.currentHoverPeriod = -1;
                this.hoveredLogPoint = this.getHoveredLogPoint(this.currentHoverPeriod, timeStep);
                if (this.hoveredLogPointCallback) {
                    this.hoveredLogPointCallback(this.hoveredLogPoint);
                }
                u.redraw();
            }
        }
    }

    /**
     * Resizes the graph to fit container dimensions without recreating the chart.
     */
    resize(style: { [property: string]: string | number }): void {
        if (this.graph && this.container) {
            let { width, height } = getGraphSize(this.container, Number(style.graphPeriodWidthPx), this.graph.data, style);
            this.graph.setSize({ width, height });
        }
    }

    destroy(): void {
        if (this.graph) {
            if (this.gridElement && this.boundGridDoubleClickHandler) {
                this.gridElement.removeEventListener("click", this.boundGridDoubleClickHandler);
            }
            this.graph.destroy()
            this.graph = null;
            this.gridElement = null;
            this.boundGridDoubleClickHandler = null;
        }
    }
}

