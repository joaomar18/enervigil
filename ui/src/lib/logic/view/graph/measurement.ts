import uPlot, { type AlignedData } from "uplot";
import { getRootFontFamily } from "$lib/logic/util/style";
import { getGraphSize, getGraphTimeSplits, yAxisValuesFormatter } from "./helpers";
import { BaseGraphObject, GraphType } from "./base";
import { FormattedTimeStep } from "$lib/types/date";
import { LogSpanPeriod } from "$lib/types/view/nodes";
import { timeStepFormatters } from "$lib/types/date";
import { getElegantShortStringFromDate } from "$lib/logic/util/date";
import type { MeasurementLogPoint, ProcessedMeasurementLogPoint } from "$lib/types/nodes/logs";
import { roundToDecimalPlaces } from "$lib/logic/util/generic";

/**
 * Graph object for visualizing measurement data with min/max bands and average lines.
 * 
 * Renders measurement data showing min-max value ranges as colored bands with average
 * value lines overlaid. Features custom canvas drawing for band visualization with
 * hover effects and comprehensive tooltip integration for measurement metrics.
 */
export class MeasurementGraphObject extends BaseGraphObject<MeasurementLogPoint> {
    protected graphType = GraphType.Measurement;
    protected points: Array<ProcessedMeasurementLogPoint>;
    public hoveredLogPoint: MeasurementLogPoint | null = null;

    /**
     * Initializes measurement graph with container, callbacks, and initial data points.
     */
    constructor(container: HTMLElement, hoveredLogPointChange: ((logPoint: MeasurementLogPoint | null) => void) | null, mousePositionChange: ((xPos: number | undefined, yPos: number | undefined) => void) | null, gridDoubleClick: ((startTime: Date, endTime: Date) => void) | null, points: Array<ProcessedMeasurementLogPoint> | undefined) {
        super(container, hoveredLogPointChange, mousePositionChange, gridDoubleClick);
        this.points = !!points ? points : [];
    }

    /**
     * Updates graph data points with optional decimal rounding while maintaining array reference.
     */
    updatePoints(points: Array<ProcessedMeasurementLogPoint>, roundPoints: boolean = false, config: {
        decimalPlaces?: number | undefined | null;
    } = { decimalPlaces: null }): void {
        if (!roundPoints) {
            this.points.length = 0;
            this.points.push(...points);
        }
        else {
            const roundedPoints = points.map(point => ({
                ...point,
                average_value: roundToDecimalPlaces(point.average_value, config.decimalPlaces || 0),
                min_value: roundToDecimalPlaces(point.min_value, config.decimalPlaces || 0),
                max_value: roundToDecimalPlaces(point.max_value, config.decimalPlaces || 0),
            }));
            this.points.length = 0;
            this.points.push(...roundedPoints);
        }
    }

    /**
     * Creates and configures the uPlot measurement graph with band visualization and event handling.
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
                    label: "Average",
                    stroke: "transparent",
                    width: 0,
                    points: { show: false },
                },
                {
                    // Min values (invisible, used for band)
                    label: "Min",
                    stroke: "transparent",
                    width: 0,
                    points: { show: false },
                },
                {
                    // Max values (invisible, used for band)
                    label: "Max",
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
     * Converts measurement data points into uPlot-compatible arrays with time labels.
     */
    convertDataToGraph(timeStep: FormattedTimeStep, logSpanPeriod: LogSpanPeriod): { alignedData: AlignedData } {
        const timestampValues: Array<number> = [];
        const minValues: Array<number | null> = [];
        const maxValues: Array<number | null> = [];
        const averageValues: Array<number | null> = [];
        this.labels = [];
        this.noData = true;

        for (let i = 0; i < this.points.length; i++) {
            timestampValues.push(i);
            timestampValues.push(i + 1);

            if (this.points[i].min_value !== null || this.points[i].max_value !== null || this.points[i].average_value !== null) {
                this.noData = false;
            }

            minValues.push(this.points[i].min_value);
            maxValues.push(this.points[i].max_value);
            averageValues.push(this.points[i].average_value);
            minValues.push(this.points[i].min_value);
            maxValues.push(this.points[i].max_value);
            averageValues.push(this.points[i].average_value);

            this.labels.push(timeStepFormatters[timeStep](this.points[i].start_time, logSpanPeriod));

            if (i === this.points.length - 1) {
                timestampValues.push(i + 1);
                minValues.push(this.points[i].min_value);
                maxValues.push(this.points[i].max_value);
                averageValues.push(this.points[i].average_value);
                this.labels.push(timeStepFormatters[timeStep](this.points[i].end_time, logSpanPeriod));
            }
        }

        // Dummy data so the axis are allways properly formatted
        if (this.noData) {
            minValues[0] = 0;
            maxValues[0] = 0;
            averageValues[0] = 0;
        }

        return { alignedData: [timestampValues, averageValues, minValues, maxValues] };
    }

    /**
     * Creates formatted tooltip data for the hovered time period.
     */
    getHoveredLogPoint(index: number, timeStep: FormattedTimeStep): MeasurementLogPoint | null {
        if (!this.points || index < 0 || index >= this.points.length) return null;

        return {
            start_time: getElegantShortStringFromDate(new Date(this.points[index].start_time * 1000), timeStep),
            end_time: getElegantShortStringFromDate(new Date(this.points[index].end_time * 1000), timeStep),
            min_value: this.points[index].min_value,
            max_value: this.points[index].max_value,
            average_value: this.points[index].average_value,
        } as MeasurementLogPoint;
    }

    /**
     * Creates a Path2D object for drawing average lines across measurement periods.
     */
    getAverageLine(xStart: number, xEnd: number, y: number): Path2D {
        if (!this.graph) {
            throw new Error(`Graph is not instantiated`);
        }
        const line = new Path2D();
        line.moveTo(xStart, y);
        line.lineTo(xEnd, y);

        return line;
    }

    /**
     * Renders measurement bands and average lines on canvas with hover effects.
     */
    drawCanvas(u: uPlot, style: { [property: string]: string | number }): void {
        const { ctx } = u;
        ctx.save();
        this.points.forEach((point, idx) => {
            if (point.min_value === null || point.max_value === null || point.average_value === null) {
                return;
            }
            const isHover = this.currentHoverPeriod === idx;

            ctx.lineWidth = Number(style.bandBorderWidthPx);
            const x1 = u.valToPos(idx, "x", true);
            const x2 = u.valToPos(idx + 1, "x", true);
            const yAverage = u.valToPos(point.average_value, "y", true);
            const yMin = u.valToPos(point.min_value, "y", true);
            const yMax = u.valToPos(point.max_value, "y", true);
            const width = x2 - x1;
            const height = yMin - yMax;

            // Min - Max Band
            ctx.fillStyle = isHover ? String(style.bandHoverColor) : String(style.bandColor);
            ctx.strokeStyle = isHover ? String(style.bandBorderHoverColor) : String(style.bandBorderColor);
            ctx.fillRect(x1, yMax, width, height);
            ctx.strokeRect(x1, yMax, width, height);

            // Average Line
            ctx.lineWidth = Number(style.lineWidthPx);
            ctx.strokeStyle = isHover ? String(style.lineHoverColor) : String(style.lineColor);
            const segmentLine = this.getAverageLine(x1, x2, yAverage);
            ctx.stroke(segmentLine);

        });
        ctx.restore();
    }

    /**
     * Checks if a data point at the given index has no valid measurement data.
     */
    pointNoData(index: number): boolean {
        if (!this.points || index < 0 || index >= this.points.length) return false;
        return this.points[index].average_value === null || this.points[index].min_value === null || this.points[index].max_value === null;
    }
}