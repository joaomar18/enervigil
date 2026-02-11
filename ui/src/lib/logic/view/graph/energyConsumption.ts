import uPlot, { type AlignedData } from "uplot";
import { getRootFontFamily } from "$lib/logic/util/style";
import { getGraphSize, getGraphTimeSplits, yAxisValuesFormatter } from "./helpers";
import { BaseGraphObject, GraphType } from "./base";
import { FormattedTimeStep } from "$lib/types/date";
import { LogSpanPeriod } from "$lib/types/view/nodes";
import { timeStepFormatters } from "$lib/types/date";
import { getElegantShortStringFromDate } from "$lib/logic/util/date";
import type { EnergyConsumptionLogPoint, ProcessedEnergyConsumptionLogPoint } from "$lib/types/nodes/logs";
import { roundToDecimalPlaces } from "$lib/logic/util/generic";

/**
 * Energy consumption graph visualization with side-by-side active and reactive energy bars.
 *
 * Extends BaseGraphObject to render dual-bar chart visualization for energy data, displaying
 * active energy (left bar) and reactive energy (right bar) for each time period with hover
 * interactions, power factor tooltips, and drill-down navigation.
 *
 * Features:
 * - Side-by-side bar rendering for active/reactive energy comparison
 * - Separate data validation tracking for active and reactive energy
 * - Optional decimal rounding for energy and power factor values
 * - Hover effects with custom styling for both bar types
 * - Time period tooltips with power factor and direction indicators
 * - Responsive canvas rendering with configurable styling
 *
 * Bar Layout:
 * Each time period is divided into two equal-width bars positioned side-by-side,
 * with active energy on the left and reactive energy on the right for direct
 * visual comparison of energy consumption patterns.
 */
export class EnergyConsumptionGraphObject extends BaseGraphObject<EnergyConsumptionLogPoint> {
    protected noActiveEnergyData: boolean = true;
    protected noReactiveEnergyData: boolean = true;
    protected graphType = GraphType.EnergyConsumption;
    protected points: Array<ProcessedEnergyConsumptionLogPoint>;

    /**
     * Initializes counter graph with container, callbacks, and initial data points.
     */
    constructor(
        container: HTMLElement,
        hoveredLogPointChange: ((logPoint: EnergyConsumptionLogPoint | null) => void) | null,
        mousePositionChange: ((xPos: number | undefined, yPos: number | undefined) => void) | null,
        gridDoubleClick: ((startTime: Date, endTime: Date) => void) | null,
        points: Array<ProcessedEnergyConsumptionLogPoint> | undefined
    ) {
        super(container, hoveredLogPointChange, mousePositionChange, gridDoubleClick);
        this.points = !!points ? points : [];
    }

    /** Returns true if the graph contains valid active energy data points. */
    hasActiveEnergyData(): boolean {
        return !this.noActiveEnergyData;
    }

    /** Returns true if the graph contains valid reactive energy data points. */
    hasReactiveEnergyData(): boolean {
        return !this.noReactiveEnergyData;
    }

    /**
     * Updates graph data points with optional decimal rounding while maintaining array reference.
     */
    updatePoints(
        points: Array<ProcessedEnergyConsumptionLogPoint>,
        roundPoints: boolean = false,
        config: {
            activeEnergyDecimalPlaces?: number | undefined | null;
            reactiveEnergyDecimalPlaces?: number | undefined | null;
            powerFactorDecimalPlaces?: number | undefined | null;
        } = { activeEnergyDecimalPlaces: null, reactiveEnergyDecimalPlaces: null, powerFactorDecimalPlaces: null }
    ): void {
        if (!roundPoints) {
            this.points.length = 0;
            this.points.push(...points);
        } else {
            const roundedPoints = points.map((point) => ({
                ...point,
                active_energy: roundToDecimalPlaces(point.active_energy, config.activeEnergyDecimalPlaces || 0),
                reactive_energy: roundToDecimalPlaces(point.reactive_energy, config.reactiveEnergyDecimalPlaces || 0),
                power_factor: roundToDecimalPlaces(point.power_factor, config.powerFactorDecimalPlaces || 0),
                power_factor_direction: point.power_factor_direction,
            }));
            this.points.length = 0;
            this.points.push(...roundedPoints);
        }
    }

    /**
     * Creates and configures the uPlot counter graph with bar visualization and event handling.
     */
    createGraph(timeStep: FormattedTimeStep, logSpanPeriod: LogSpanPeriod, style: { [property: string]: string | number }): void {
        const { alignedData } = this.convertDataToGraph(timeStep, logSpanPeriod);
        let { width, height } = getGraphSize(this.container, Number(style.graphPeriodWidthPx), alignedData, style);

        let opts: uPlot.Options = {
            width: width,
            height: height,
            padding: [
                parseInt(String(style.graphPaddingTop)),
                parseInt(String(style.graphPaddingRight)),
                parseInt(String(style.graphPaddingBottom)),
                parseInt(String(style.graphPaddingLeft)),
            ],
            scales: {
                x: {
                    time: true,
                },
                y: {
                    auto: true,
                },
            },
            legend: {
                show: false,
            },
            series: [
                {}, // x-axis
                {
                    label: "Active Energy Bar",
                    stroke: "transparent",
                    width: 0,
                    points: { show: false },
                },
                {
                    label: "Reactive Energy Bar",
                    stroke: "transparent",
                    width: 0,
                    points: { show: false },
                },
            ],
            axes: [
                {
                    // x-axis (time)
                    splits: () => getGraphTimeSplits(alignedData),
                    values: () => this.labels,
                    size: parseInt(String(style.xAxisHeight)),
                    font: `13px ${getRootFontFamily()}`,
                    stroke: `${style.graphTextColor}`,
                    grid: {
                        show: true,
                        stroke: String(style.graphGridLineColor),
                        width: Number(style.graphGridWidthPx),
                    },
                },
                {
                    // Active / Reactive energy y-axis (values)
                    values: (u, splits) => (this.noData ? splits.map(() => "") : yAxisValuesFormatter()(u, splits)),
                    size: parseInt(String(style.yAxisWidth)),
                    font: `13px ${getRootFontFamily()}`,
                    stroke: `${style.graphTextColor}`,
                    space: Number(style.yAxisTickSpacingPx),
                    grid: {
                        show: true,
                        stroke: String(style.graphGridLineColor),
                        width: Number(style.graphGridWidthPx),
                    },
                },
            ],
            cursor: {
                drag: { x: false, y: false },
                points: { show: false },
                focus: { prox: 0 },
            },
            hooks: {
                setCursor: [
                    (u) => {
                        this.getCursorPosition(u);
                        this.getHoveredPeriod(u, timeStep, this.points);
                    },
                ],
                draw: [
                    (u) => {
                        this.drawCanvas(u, style);
                    },
                ],
            },
        };

        this.graph = new uPlot(opts, alignedData, this.container);
        this.gridElement = this.graph.over;
        if (this.gridDoubleClickCallback) {
            this.boundGridDoubleClickHandler = (event: MouseEvent) => {
                this.handleGridDoubleClickListener(this.points);
            };
            this.gridElement.addEventListener("click", this.boundGridDoubleClickHandler);
        }
    }

    /**
     * Converts counter data points into uPlot-compatible arrays with time labels.
     */
    convertDataToGraph(timeStep: FormattedTimeStep, logSpanPeriod: LogSpanPeriod): { alignedData: AlignedData } {
        const timestampValues: Array<number> = [];
        const activeValues: Array<number | null> = [];
        const reactiveValues: Array<number | null> = [];
        this.labels = [];
        this.noActiveEnergyData = true;
        this.noReactiveEnergyData = true;
        this.noData = true;

        for (let i = 0; i < this.points.length; i++) {
            timestampValues.push(i);
            timestampValues.push(i + 1);

            if (this.points[i].active_energy !== null) {
                this.noActiveEnergyData = false;
            }
            if (this.points[i].reactive_energy !== null) {
                this.noReactiveEnergyData = false;
            }
            this.noData = this.noActiveEnergyData && this.noReactiveEnergyData;

            if (!i) {
                activeValues.push(0);
                reactiveValues.push(0);
            }

            activeValues.push(this.points[i].active_energy);
            activeValues.push(this.points[i].active_energy);
            reactiveValues.push(this.points[i].reactive_energy);
            reactiveValues.push(this.points[i].reactive_energy);

            this.labels.push(timeStepFormatters[timeStep](this.points[i].start_time, logSpanPeriod));

            if (i === this.points.length - 1) {
                timestampValues.push(i + 1);
                activeValues.push(this.points[i].active_energy);
                reactiveValues.push(this.points[i].reactive_energy);
                this.labels.push(timeStepFormatters[timeStep](this.points[i].end_time, logSpanPeriod));
            }
        }

        // Dummy data so the axis are allways properly formatted
        if (this.noActiveEnergyData) activeValues[0] = 0;
        if (this.noReactiveEnergyData) reactiveValues[0] = 0;

        return { alignedData: [timestampValues, activeValues, reactiveValues] };
    }

    /**
     * Creates formatted tooltip data for the hovered time period.
     */
    getHoveredLogPoint(index: number, timeStep: FormattedTimeStep): EnergyConsumptionLogPoint | null {
        if (!this.points || index < 0 || index >= this.points.length) return null;

        return {
            start_time: getElegantShortStringFromDate(new Date(this.points[index].start_time * 1000), timeStep),
            end_time: getElegantShortStringFromDate(new Date(this.points[index].end_time * 1000), timeStep),
            active_energy: this.points[index].active_energy,
            reactive_energy: this.points[index].reactive_energy,
            power_factor: this.points[index].power_factor,
            power_factor_direction: this.points[index].power_factor_direction,
        } as EnergyConsumptionLogPoint;
    }

    /**
     * Renders energy bars on canvas with hover effects and custom styling.
     */
    drawCanvas(u: uPlot, style: { [property: string]: string | number }): void {
        const { ctx } = u;
        ctx.save();
        this.points.forEach((point, idx) => {
            if (point.active_energy === null || point.reactive_energy === null) {
                return;
            }

            const isHover = this.currentHoverPeriod === idx;

            ctx.lineWidth = Number(style.barBorderWidthPx);
            const x1 = u.valToPos(idx, "x", true);
            const x2 = u.valToPos(idx + 1, "x", true);
            const yMinActive = u.valToPos(0, "y", true);
            const yMaxActive = u.valToPos(point.active_energy || 0, "y", true);
            const yMinReactive = u.valToPos(0, "y", true);
            const yMaxReactive = u.valToPos(point.reactive_energy || 0, "y", true);
            const width = (x2 - x1) / 2;
            const heightActive = yMinActive - yMaxActive;
            const heightReactive = yMinReactive - yMaxReactive;

            // Bars
            ctx.fillStyle = isHover ? String(style.activeEnergybarHoverColor) : String(style.activeEnergybarColor);
            ctx.strokeStyle = isHover ? String(style.activeEnergybarBorderHoverColor) : String(style.activeEnergybarBorderColor);
            ctx.fillRect(x1, yMaxActive, width, heightActive);
            ctx.strokeRect(x1, yMaxActive, width, heightActive);
            ctx.fillStyle = isHover ? String(style.reactiveEnergybarHoverColor) : String(style.reactiveEnergybarColor);
            ctx.strokeStyle = isHover ? String(style.reactiveEnergybarBorderHoverColor) : String(style.reactiveEnergybarBorderColor);
            ctx.fillRect(x1 + width, yMaxReactive, width, heightReactive);
            ctx.strokeRect(x1 + width, yMaxReactive, width, heightReactive);
        });
        ctx.restore();
    }

    /**
     * Checks if a data point at the given index has no valid data.
     */
    pointNoData(index: number): boolean {
        if (!this.points || index < 0 || index >= this.points.length) return false;
        return this.points[index].active_energy === null || this.points[index].reactive_energy === null;
    }
}
