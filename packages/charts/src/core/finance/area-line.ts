/**
 * @file area-line.ts
 * @description Pure D3 layout math + SVG path builders for the premium Area/Line chart (financial
 * volume + spending history). No DOM, no Preact — SSR-safe and unit-testable. x is index-based (an
 * evenly-spaced timeline, matching the runway chart) so any horizon renders with identical spacing;
 * the axis labels carry the real dates. A monotone curve keeps money lines smooth without the
 * overshoot a Catmull-Rom spline can introduce on sharp financial swings.
 */

import { scaleLinear } from 'd3-scale';
import type { ScaleLinear } from 'd3-scale';
import { area, curveMonotoneX, line } from 'd3-shape';
import type { AreaLinePoint, AreaLineSeries } from '../../types/finance.ts';
import { innerSize, type PlotBox } from './scales.ts';

export interface AreaLineScales {
	x: ScaleLinear<number, number>;
	y: ScaleLinear<number, number>;
	/** Longest series length — the shared timeline resolution. */
	length: number;
}

/**
 * Build index→x and cents→y scales spanning every series. The y domain is pinned to a zero
 * baseline (financial volume reads against 0) unless the data dips negative, then it extends down.
 */
export function buildAreaLineScales(series: AreaLineSeries[], box: PlotBox): AreaLineScales {
	const { iw, ih } = innerSize(box);

	let length = 0;
	let lo = 0;
	let hi = 1;
	for (const s of series) {
		if (s.points.length > length) length = s.points.length;
		for (const p of s.points) {
			if (p.value_cents > hi) hi = p.value_cents;
			if (p.value_cents < lo) lo = p.value_cents;
		}
	}

	const pad = (hi - lo) * 0.12 || 1;

	const x = scaleLinear()
		.domain([0, Math.max(1, length - 1)])
		.range([box.margin.left, box.margin.left + iw]);

	const y = scaleLinear()
		.domain([Math.min(0, lo), hi + pad])
		.range([box.margin.top + ih, box.margin.top])
		.nice();

	return { x, y, length };
}

/** The `d` attribute for a series' central line. */
export function areaLinePath(points: AreaLinePoint[], scales: AreaLineScales): string {
	const gen = line<AreaLinePoint>()
		.x((_d: AreaLinePoint, i: number) => scales.x(i))
		.y((d: AreaLinePoint) => scales.y(d.value_cents))
		.curve(curveMonotoneX);
	return gen(points) ?? '';
}

/** Closed area from a series' line down to the baseline — the soft gradient fill. */
export function areaFillPath(
	points: AreaLinePoint[],
	scales: AreaLineScales,
	baseline: number,
): string {
	const gen = area<AreaLinePoint>()
		.x((_d: AreaLinePoint, i: number) => scales.x(i))
		.y0(baseline)
		.y1((d: AreaLinePoint) => scales.y(d.value_cents))
		.curve(curveMonotoneX);
	return gen(points) ?? '';
}
