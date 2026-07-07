/**
 * @file scales.ts
 * @description Pure D3 layout math shared by the Canvas pipeline renderer and the SVG runway.
 * No DOM, no Preact — just data → pixel mapping, so it is SSR-safe and unit-testable. Built on
 * `d3-array` (extents) and `d3-scale` (linear/time scales).
 */

import { extent, max as d3max, min as d3min } from 'd3-array';
import { scaleLinear, scaleSqrt } from 'd3-scale';
import type { ScaleLinear, ScalePower } from 'd3-scale';
import type { ForecastingDataPoint, PipelinePoint } from '@projective/types';
import type { ChartMargin } from '../../types/finance.ts';

export interface PlotBox {
	width: number;
	height: number;
	margin: ChartMargin;
}

/** Inner drawable dimensions after margins. */
export function innerSize(box: PlotBox): { iw: number; ih: number } {
	return {
		iw: Math.max(0, box.width - box.margin.left - box.margin.right),
		ih: Math.max(0, box.height - box.margin.top - box.margin.bottom),
	};
}

export interface PipelineScales {
	x: ScaleLinear<number, number>;
	y: ScaleLinear<number, number>;
	/** Node radius scale, sqrt so area (not radius) encodes deal value. */
	r: ScalePower<number, number>;
}

/**
 * Build velocity→x, roi→y and value→radius scales, padded so nodes never clip the edges.
 * Ranges are already in device-independent pixels within the inner plot.
 */
export function buildPipelineScales(points: PipelinePoint[], box: PlotBox): PipelineScales {
	const { iw, ih } = innerSize(box);

	const vx = extent(points, (p: PipelinePoint) => p.velocity) as [number, number];
	const vy = extent(points, (p: PipelinePoint) => p.roi) as [number, number];
	const maxVal = d3max(points, (p: PipelinePoint) => p.value_cents) ?? 1;

	const padX = ((vx[1] ?? 1) - (vx[0] ?? 0)) * 0.08 || 1;
	const padY = ((vy[1] ?? 1) - (vy[0] ?? 0)) * 0.08 || 1;

	const x = scaleLinear()
		.domain([(vx[0] ?? 0) - padX, (vx[1] ?? 1) + padX])
		.range([box.margin.left, box.margin.left + iw]);

	// y inverted: higher ROI sits toward the top.
	const y = scaleLinear()
		.domain([(vy[0] ?? 0) - padY, (vy[1] ?? 1) + padY])
		.range([box.margin.top + ih, box.margin.top]);

	const r = scaleSqrt().domain([0, maxVal]).range([2.5, 22]);

	return { x, y, r };
}

/**
 * Least-squares trend line over the scatter, returned as two endpoints in pixel space so the
 * Canvas renderer can stroke it directly. Returns null when the data is degenerate.
 */
export function pipelineTrendLine(
	points: PipelinePoint[],
	scales: PipelineScales,
): { x1: number; y1: number; x2: number; y2: number } | null {
	if (points.length < 2) return null;

	const n = points.length;
	let sx = 0, sy = 0, sxy = 0, sxx = 0;
	for (const p of points) {
		sx += p.velocity;
		sy += p.roi;
		sxy += p.velocity * p.roi;
		sxx += p.velocity * p.velocity;
	}
	const denom = n * sxx - sx * sx;
	if (denom === 0) return null;

	const slope = (n * sxy - sx * sy) / denom;
	const intercept = (sy - slope * sx) / n;

	const dx = extent(points, (p: PipelinePoint) => p.velocity) as [number, number];
	const x1 = dx[0];
	const x2 = dx[1];

	return {
		x1: scales.x(x1),
		y1: scales.y(slope * x1 + intercept),
		x2: scales.x(x2),
		y2: scales.y(slope * x2 + intercept),
	};
}

export interface RunwayScales {
	x: ScaleLinear<number, number>;
	y: ScaleLinear<number, number>;
}

/**
 * Build index→x and cents→y scales for the forecast runway. x is index-based (evenly spaced
 * timeline) so 1-day and 1-year horizons render with identical spacing; the axis labels carry
 * the real dates. y spans the full confidence band with headroom.
 */
export function buildRunwayScales(series: ForecastingDataPoint[], box: PlotBox): RunwayScales {
	const { iw, ih } = innerSize(box);

	const lo = d3min(series, (d: ForecastingDataPoint) => d.lower_cents) ?? 0;
	const hi = d3max(series, (d: ForecastingDataPoint) => d.upper_cents) ?? 1;
	const pad = (hi - lo) * 0.12 || 1;

	const x = scaleLinear()
		.domain([0, Math.max(1, series.length - 1)])
		.range([box.margin.left, box.margin.left + iw]);

	const y = scaleLinear()
		.domain([Math.max(0, lo - pad), hi + pad])
		.range([box.margin.top + ih, box.margin.top])
		.nice();

	return { x, y };
}
