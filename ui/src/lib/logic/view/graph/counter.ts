import uPlot, { type AlignedData } from "uplot";
import { getRootFontFamily } from "$lib/logic/util/style";
import { getGraphSize, getGraphTimeSplits, yAxisValuesFormatter } from "./helpers";
import { BaseGraphObject, GraphType } from "./base";
import { FormattedTimeStep } from "$lib/types/date";
import { LogSpanPeriod } from "$lib/types/view/nodes";
import { timeStepFormatters } from "$lib/types/date";
import { getElegantShortStringFromDate } from "$lib/logic/util/date";
import type { CounterLogPoint, ProcessedCounterLogPoint } from "$lib/types/nodes/logs";
import { roundToDecimalPlaces } from "$lib/logic/util/generic";

/**
 * Graph object for visualizing counter/cumulative data with step-based bar rendering.
 * 
 * Renders counter data as horizontal bars showing cumulative values over time periods.
 * Features custom canvas drawing for step-based visualization with hover effects and
 * interactive tooltips for counter metrics.
 */
export class CounterGraphObject extends BaseGraphObject<CounterLogPoint> {
    protected graphType = GraphType.Counter;
    protected points: Array<ProcessedCounterLogPoint>;

    /**
     * Initializes counter graph with container, callbacks, and initial data points.
     */
    constructor(container: HTMLElement, hoveredLogPointChange: ((logPoint: CounterLogPoint | null) => void) | null, mousePositionChange: ((xPos: number | undefined, yPos: number | undefined) => void) | null, gridDoubleClick: ((startTime: Date, endTime: Date) => void) | null, points: Array<ProcessedCounterLogPoint> | undefined) {
        super(container, hoveredLogPointChange, mousePositionChange, gridDoubleClick);
        this.points = !!points ? points : [];
    }

    /**
     * Updates graph data points with optional decimal rounding while maintaining array reference.
     */
    updatePoints(points: Array<ProcessedCounterLogPoint>, roundPoints: boolean = false, config: {
        decimalPlaces?: number | undefined | null;
    } = { decimalPlaces: null }): void {

        if (!roundPoints) {
            this.points.length = 0;
            this.points.push(...points);
        }
        else {
            const roundedPoints = points.map(point => ({
                ...point,
                value: roundToDecimalPlaces(point.value, config.decimalPlaces || 0)
            }));

            this.points.length = 0;
            this.points.push(...roundedPoints);
        }
    }

    /**
     * Creates and configures the uPlot counter graph with bar visualization and event handling.
     */
    createGraph(timeStep: FormattedTimeStep, logSpanPeriod: LogSpanPeriod, style: { [property: string]: string | number },): void {
        const { alignedData } = this.convertDataToGraph(timeStep, logSpanPeriod);
        let { width, height } = getGraphSize(this.container, Number(style.graphPeriodWidthPx), alignedData, style);

        let opts: uPlot.Options = {
            width: width,
            height: height,
            padding: [parseInt(String(style.graphPaddingTop)), parseInt(String(style.graphPaddingRight)), parseInt(String(style.graphPaddingBottom)), parseInt(String(style.graphPaddingLeft))],
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
                    label: "Total Bar",
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
                    // y-axis (values)
                    values: (u, splits) => this.noData ? splits.map(() => "") : yAxisValuesFormatter()(u, splits),
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
        const values: Array<number | null> = [];
        this.labels = [];
        this.noData = true;

        for (let i = 0; i < this.points.length; i++) {
            timestampValues.push(i);
            timestampValues.push(i + 1);

            if (this.points[i].value !== null) {
                this.noData = false;
            }

            if (!i) values.push(0); // adjust scale
            values.push(this.points[i].value);
            values.push(this.points[i].value)

            this.labels.push(timeStepFormatters[timeStep](this.points[i].start_time, logSpanPeriod));

            if (i === this.points.length - 1) {
                timestampValues.push(i + 1);
                values.push(this.points[i].value);
                this.labels.push(timeStepFormatters[timeStep](this.points[i].end_time, logSpanPeriod));
            }
        }

        // Dummy data so the axis are allways properly formatted
        if (this.noData) {
            values[0] = 0;
        }

        return { alignedData: [timestampValues, values] };
    }

    /**
     * Creates formatted tooltip data for the hovered time period.
     */
    getHoveredLogPoint(index: number, timeStep: FormattedTimeStep): CounterLogPoint | null {
        if (!this.points || index < 0 || index >= this.points.length) return null;

        return {
            start_time: getElegantShortStringFromDate(new Date(this.points[index].start_time * 1000), timeStep),
            end_time: getElegantShortStringFromDate(new Date(this.points[index].end_time * 1000), timeStep),
            value: this.points[index].value,
        } as CounterLogPoint;
    }

    /**
     * Renders counter bars on canvas with hover effects and custom styling.
     */
    drawCanvas(u: uPlot, style: { [property: string]: string | number }): void {
        const { ctx } = u;
        ctx.save();
        this.points.forEach((point, idx) => {
            if (point.value === null) {
                return;
            }
            const isHover = this.currentHoverPeriod === idx;

            ctx.lineWidth = Number(style.barBorderWidthPx);
            const x1 = u.valToPos(idx, "x", true);
            const x2 = u.valToPos(idx + 1, "x", true);
            const yMin = u.valToPos(0, "y", true);
            const yMax = u.valToPos(point.value, "y", true);
            const width = x2 - x1;
            const height = yMin - yMax;

            // Bar 
            ctx.fillStyle = isHover ? String(style.barHoverColor) : String(style.barColor);
            ctx.strokeStyle = isHover ? String(style.barBorderHoverColor) : String(style.barBorderColor);
            ctx.fillRect(x1, yMax, width, height);
            ctx.strokeRect(x1, yMax, width, height);
        });
        ctx.restore();
    }

    /**
     * Checks if a data point at the given index has no valid data.
     */
    pointNoData(index: number): boolean {
        if (!this.points || index < 0 || index >= this.points.length) return false;
        return this.points[index].value === null
    }
}