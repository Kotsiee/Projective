/**
 * @file pipeline-render.ts
 * @description The Canvas draw routine for the Pipeline Flow scatter and the nearest-node hit
 * test used by the SVG overlay. Kept DOM-light (takes a 2D context) so the heavy per-frame work
 * stays out of Preact's reconciler — thousands of points render as pixels, not DOM nodes.
 */

import { least } from 'd3-array';
import type { PipelinePoint } from '@projective/types';
import type { PipelineCategoryStyle } from '../../types/finance.ts';
import { type PipelineScales, pipelineTrendLine } from './scales.ts';

export interface PipelineRenderOptions {
	scales: PipelineScales;
	categories: Map<string, PipelineCategoryStyle>;
	fallbackColor: string;
	gridColor: string;
	trendColor: string;
	showTrendLine: boolean;
	/** Highlighted point id (drawn with a ring), if any. */
	activeId?: string | null;
	/** device pixel ratio already applied to the context transform. */
	dpr: number;
}

/** Resolve a category's colour, falling back to the neutral tone. */
function colorFor(
	p: PipelinePoint,
	categories: Map<string, PipelineCategoryStyle>,
	fallback: string,
): string {
	return categories.get(p.category)?.color ?? fallback;
}

/**
 * Full repaint of the plot: faint grid, trend line, then every node (area ∝ value). Callers
 * clear + size the canvas; this only draws within [0,width]×[0,height] logical pixels.
 */
export function drawPipeline(
	ctx: CanvasRenderingContext2D,
	points: PipelinePoint[],
	width: number,
	height: number,
	opts: PipelineRenderOptions,
): void {
	const { scales, categories, fallbackColor, gridColor, trendColor, showTrendLine } = opts;

	ctx.clearRect(0, 0, width, height);

	// #region faint background grid (4×4)
	ctx.save();
	ctx.strokeStyle = gridColor;
	ctx.lineWidth = 1;
	ctx.globalAlpha = 0.5;
	for (let i = 1; i < 4; i++) {
		const gx = (width / 4) * i;
		ctx.beginPath();
		ctx.moveTo(gx, 0);
		ctx.lineTo(gx, height);
		ctx.stroke();
		const gy = (height / 4) * i;
		ctx.beginPath();
		ctx.moveTo(0, gy);
		ctx.lineTo(width, gy);
		ctx.stroke();
	}
	ctx.restore();
	// #endregion

	// #region trend line
	if (showTrendLine) {
		const line = pipelineTrendLine(points, scales);
		if (line) {
			ctx.save();
			ctx.strokeStyle = trendColor;
			ctx.lineWidth = 2;
			ctx.globalAlpha = 0.85;
			ctx.setLineDash([6, 5]);
			ctx.beginPath();
			ctx.moveTo(line.x1, line.y1);
			ctx.lineTo(line.x2, line.y2);
			ctx.stroke();
			ctx.restore();
		}
	}
	// #endregion

	// #region nodes
	for (const p of points) {
		const cx = scales.x(p.velocity);
		const cy = scales.y(p.roi);
		const rad = scales.r(p.value_cents);
		const fill = colorFor(p, categories, fallbackColor);

		ctx.beginPath();
		ctx.arc(cx, cy, rad, 0, Math.PI * 2);
		ctx.fillStyle = fill;
		ctx.globalAlpha = p.id === opts.activeId ? 0.95 : 0.62;
		ctx.fill();

		if (p.id === opts.activeId) {
			ctx.globalAlpha = 1;
			ctx.lineWidth = 2;
			ctx.strokeStyle = fill;
			ctx.beginPath();
			ctx.arc(cx, cy, rad + 3, 0, Math.PI * 2);
			ctx.stroke();
		}
	}
	ctx.globalAlpha = 1;
	// #endregion
}

/**
 * Nearest node to a pointer position (logical pixels), within `threshold` px. Linear scan via
 * `d3.least` — trivially fast for the hover path even at high density, and dependency-light.
 */
export function nearestPoint(
	points: PipelinePoint[],
	px: number,
	py: number,
	scales: PipelineScales,
	threshold = 26,
): { point: PipelinePoint; x: number; y: number } | null {
	const best = least(points, (p: PipelinePoint) => {
		const dx = scales.x(p.velocity) - px;
		const dy = scales.y(p.roi) - py;
		return dx * dx + dy * dy;
	});
	if (!best) return null;

	const bx = scales.x(best.velocity);
	const by = scales.y(best.roi);
	const dist = Math.hypot(bx - px, by - py);
	if (dist > threshold + scales.r(best.value_cents)) return null;

	return { point: best, x: bx, y: by };
}
