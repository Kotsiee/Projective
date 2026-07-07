/**
 * @file runway.ts
 * @description SVG path builders for the Predictive Runway forecast — a confidence-interval area
 * band and the central projection line — using `d3-shape` generators with a smooth Catmull-Rom
 * curve. Returns plain path `d` strings so Preact can render (and CSS-transition) them directly.
 */

import { area, curveCatmullRom, line } from 'd3-shape';
import type { ForecastingDataPoint } from '@projective/types';
import type { RunwayScales } from './scales.ts';

/** The `d` attribute for the filled upper/lower confidence band. */
export function runwayBandPath(series: ForecastingDataPoint[], scales: RunwayScales): string {
	const gen = area<ForecastingDataPoint>()
		.x((_d: ForecastingDataPoint, i: number) => scales.x(i))
		.y0((d: ForecastingDataPoint) => scales.y(d.lower_cents))
		.y1((d: ForecastingDataPoint) => scales.y(d.upper_cents))
		.curve(curveCatmullRom.alpha(0.5));
	return gen(series) ?? '';
}

/** The `d` attribute for the central projection line. */
export function runwayLinePath(series: ForecastingDataPoint[], scales: RunwayScales): string {
	const gen = line<ForecastingDataPoint>()
		.x((_d: ForecastingDataPoint, i: number) => scales.x(i))
		.y((d: ForecastingDataPoint) => scales.y(d.value_cents))
		.curve(curveCatmullRom.alpha(0.5));
	return gen(series) ?? '';
}

/**
 * Closed area from the projection line down to the baseline — a soft gradient fill under the
 * line that reinforces "runway" without competing with the CI band.
 */
export function runwayFillPath(
	series: ForecastingDataPoint[],
	scales: RunwayScales,
	baseline: number,
): string {
	const gen = area<ForecastingDataPoint>()
		.x((_d: ForecastingDataPoint, i: number) => scales.x(i))
		.y0(baseline)
		.y1((d: ForecastingDataPoint) => scales.y(d.value_cents))
		.curve(curveCatmullRom.alpha(0.5));
	return gen(series) ?? '';
}
