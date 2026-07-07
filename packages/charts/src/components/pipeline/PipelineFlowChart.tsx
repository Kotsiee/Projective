/**
 * @file PipelineFlowChart.tsx
 * @description Pipeline Flow Analysis (Velocity vs. ROI). A high-density scatter + trend line
 * rendered to an HTML5 Canvas (via `d3-scale` math — no DOM per node), with a thin SVG/HTML
 * overlay layer that owns the interactive crosshair, nearest-node tooltip and click selection.
 * Canvas eliminates the DOM bloat that would sink thousands of points; the overlay keeps hit
 * testing crisp and event handling declarative.
 */

import '../../styles/pipeline/pipeline-flow.css';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type {
	PipelineCategoryStyle,
	PipelineFlowChartProps,
	PipelineHover,
} from '../../types/finance.ts';
import { useElementSize } from '../../hooks/useElementSize.ts';
import { buildPipelineScales, type PlotBox } from '../../core/finance/scales.ts';
import { drawPipeline, nearestPoint } from '../../core/finance/pipeline-render.ts';

const MARGIN = { top: 16, right: 18, bottom: 30, left: 46 };

/** Neutral palette used when the caller doesn't supply a category → colour map. */
const AUTO_PALETTE = [
	'var(--mint)',
	'var(--violet)',
	'var(--amber)',
	'var(--primary)',
	'var(--danger)',
	'var(--success)',
];

/** Resolve `var(--token)` against the live DOM so the Canvas gets a concrete colour string. */
function resolveCssColor(el: Element, value: string): string {
	const m = value.match(/^var\((--[^,)]+)(?:,\s*(.+))?\)$/);
	if (!m) return value;
	const resolved = getComputedStyle(el).getPropertyValue(m[1]).trim();
	return resolved || (m[2] ?? value);
}

function formatCents(cents: number, currency: string): string {
	try {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency,
			maximumFractionDigits: 0,
		}).format(cents / 100);
	} catch {
		return `${currency} ${(cents / 100).toFixed(0)}`;
	}
}

export function PipelineFlowChart(props: PipelineFlowChartProps) {
	const {
		points,
		categories,
		height = 320,
		showTrendLine = true,
		activeCategories = null,
		currency = 'GBP',
		onPointSelect,
		className,
	} = props;

	const { ref, size } = useElementSize<HTMLDivElement>();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [hover, setHover] = useState<PipelineHover | null>(null);

	// Subset filter (category toggles from the focus-modal config panel).
	const visiblePoints = useMemo(() => {
		if (!activeCategories) return points;
		const set = new Set(activeCategories);
		return points.filter((p) => set.has(p.category));
	}, [points, activeCategories]);

	// Derive a category → style map, auto-assigning palette colours to any unmapped category.
	const categoryList = useMemo<PipelineCategoryStyle[]>(() => {
		if (categories && categories.length) return categories;
		const seen = new Map<string, PipelineCategoryStyle>();
		let i = 0;
		for (const p of points) {
			if (!seen.has(p.category)) {
				seen.set(p.category, {
					category: p.category,
					label: p.category,
					color: AUTO_PALETTE[i % AUTO_PALETTE.length],
				});
				i++;
			}
		}
		return [...seen.values()];
	}, [categories, points]);

	const box: PlotBox = { width: size.width, height, margin: MARGIN };
	const scales = useMemo(
		() => buildPipelineScales(visiblePoints.length ? visiblePoints : points, box),
		[visiblePoints, points, size.width, height],
	);

	// #region Canvas repaint
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || size.width === 0) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
		canvas.width = size.width * dpr;
		canvas.height = height * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		const resolved = new Map<string, PipelineCategoryStyle>();
		for (const c of categoryList) {
			resolved.set(c.category, { ...c, color: resolveCssColor(canvas, c.color) });
		}
		const gridColor = resolveCssColor(canvas, 'var(--hairline)') || 'rgba(128,128,128,0.15)';
		const trendColor = resolveCssColor(canvas, 'var(--text-muted)') || '#888';
		const fallbackColor = resolveCssColor(canvas, 'var(--primary)') || '#3aa';

		drawPipeline(ctx, visiblePoints, size.width, height, {
			scales,
			categories: resolved,
			fallbackColor,
			gridColor,
			trendColor,
			showTrendLine,
			activeId: hover?.point.id ?? null,
			dpr,
		});
	}, [visiblePoints, categoryList, scales, size.width, height, showTrendLine, hover?.point.id]);
	// #endregion

	// #region Overlay interaction
	const handleMove = (e: MouseEvent) => {
		const host = (e.currentTarget as SVGElement).getBoundingClientRect();
		const px = e.clientX - host.left;
		const py = e.clientY - host.top;
		const hit = nearestPoint(visiblePoints, px, py, scales);
		setHover(hit ? { point: hit.point, x: hit.x, y: hit.y } : null);
	};

	const handleClick = () => onPointSelect?.(hover?.point ?? null);
	// #endregion

	const innerTop = MARGIN.top;
	const innerBottom = height - MARGIN.bottom;
	const innerLeft = MARGIN.left;
	const innerRight = size.width - MARGIN.right;

	return (
		<div
			ref={ref}
			class={`pipeline-flow${className ? ` ${className}` : ''}`}
			style={{ height: `${height}px` }}
		>
			<canvas ref={canvasRef} class='pipeline-flow__canvas' style={{ height: `${height}px` }} />

			<svg
				class='pipeline-flow__overlay'
				width={size.width}
				height={height}
				onMouseMove={handleMove}
				onMouseLeave={() => setHover(null)}
				onClick={handleClick}
			>
				{/* axis frame */}
				<line
					class='pipeline-flow__axis'
					x1={innerLeft}
					y1={innerBottom}
					x2={innerRight}
					y2={innerBottom}
				/>
				<line
					class='pipeline-flow__axis'
					x1={innerLeft}
					y1={innerTop}
					x2={innerLeft}
					y2={innerBottom}
				/>

				{hover && (
					<g class='pipeline-flow__crosshair'>
						<line x1={hover.x} y1={innerTop} x2={hover.x} y2={innerBottom} />
						<line x1={innerLeft} y1={hover.y} x2={innerRight} y2={hover.y} />
						<circle cx={hover.x} cy={hover.y} r={5} class='pipeline-flow__cursor' />
					</g>
				)}
			</svg>

			<div class='pipeline-flow__axis-label pipeline-flow__axis-label--x'>Velocity →</div>
			<div class='pipeline-flow__axis-label pipeline-flow__axis-label--y'>ROI →</div>

			{hover && (
				<div
					class='pipeline-flow__tooltip'
					style={{
						left: `${Math.min(hover.x + 14, size.width - 180)}px`,
						top: `${Math.max(hover.y - 12, 4)}px`,
					}}
				>
					<div class='pipeline-flow__tooltip-title'>{hover.point.label}</div>
					<div class='pipeline-flow__tooltip-row'>
						<span>Value</span>
						<strong>{formatCents(hover.point.value_cents, currency)}</strong>
					</div>
					<div class='pipeline-flow__tooltip-row'>
						<span>Velocity</span>
						<strong>{hover.point.velocity.toFixed(1)}</strong>
					</div>
					<div class='pipeline-flow__tooltip-row'>
						<span>ROI</span>
						<strong>{hover.point.roi.toFixed(1)}%</strong>
					</div>
					<div class='pipeline-flow__tooltip-cat'>{hover.point.category}</div>
				</div>
			)}
		</div>
	);
}
