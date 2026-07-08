/**
 * @file AreaLineChart.tsx
 * @description A premium multi-series Area/Line chart for financial volume + spending history.
 * Pure SVG (no Canvas) — `d3-shape` builds a monotone line + soft gradient area per series and the
 * whole thing re-themes for free because every colour is a CSS variable resolved at paint time. A
 * scrub overlay drives a shared crosshair + tooltip that reads every series at the hovered index.
 * SSR-safe: it stays 0-width until `useElementSize` reports the hydrated container width.
 */

import '../../styles/finance/area-line.css';
import { useMemo, useState } from 'preact/hooks';
import type { AreaLineChartProps } from '../../types/finance.ts';
import { useElementSize } from '../../hooks/useElementSize.ts';
import { areaFillPath, areaLinePath, buildAreaLineScales } from '../../core/finance/area-line.ts';
import type { PlotBox } from '../../core/finance/scales.ts';

const MARGIN = { top: 14, right: 16, bottom: 26, left: 56 };

function formatCents(cents: number, currency: string, compact = true): string {
	try {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency,
			notation: compact ? 'compact' : 'standard',
			maximumFractionDigits: compact ? 1 : 0,
		}).format(cents / 100);
	} catch {
		return `${currency} ${(cents / 100).toFixed(0)}`;
	}
}

function defaultFormatX(iso: string): string {
	const d = new Date(iso);
	if (isNaN(d.getTime())) return iso;
	// UTC-pinned so SSR and client hydration agree (seed/ledger timestamps are Zulu).
	return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

export function AreaLineChart(props: AreaLineChartProps) {
	const {
		series,
		height = 280,
		currency = 'USD',
		showArea = true,
		yTickCount = 4,
		formatX = defaultFormatX,
		idPrefix = 'aln',
		onScrub,
		className,
	} = props;

	const { ref, size } = useElementSize<HTMLDivElement>();
	const [activeIdx, setActiveIdx] = useState<number | null>(null);

	const box: PlotBox = { width: size.width, height, margin: MARGIN };
	const scales = useMemo(() => buildAreaLineScales(series, box), [series, size.width, height]);

	const baseline = height - MARGIN.bottom;
	const paths = useMemo(() => {
		if (!size.width) return series.map(() => ({ line: '', fill: '' }));
		return series.map((s) => ({
			line: areaLinePath(s.points, scales),
			fill: areaFillPath(s.points, scales, baseline),
		}));
	}, [series, scales, size.width, height]);

	const yTicks = useMemo(() => (size.width ? scales.y.ticks(yTickCount) : []), [
		scales,
		size.width,
	]);
	const xTicks = useMemo(() => {
		const n = scales.length;
		if (!n) return [] as number[];
		return [...new Set([0, Math.floor(n / 3), Math.floor((2 * n) / 3), n - 1])];
	}, [scales.length]);

	// The series with the most points owns the x timeline labels.
	const timeline = useMemo(
		() =>
			series.reduce(
				(a, b) => (b.points.length > a.points.length ? b : a),
				series[0] ?? { points: [] },
			),
		[series],
	);

	const handleMove = (e: MouseEvent) => {
		const host = (e.currentTarget as SVGElement).getBoundingClientRect();
		const px = e.clientX - host.left;
		const idx = Math.round(scales.x.invert(px));
		const clamped = Math.max(0, Math.min(scales.length - 1, idx));
		setActiveIdx(clamped);
		onScrub?.(clamped);
	};

	const leave = () => {
		setActiveIdx(null);
		onScrub?.(null);
	};

	return (
		<div
			ref={ref}
			class={`area-line${className ? ` ${className}` : ''}`}
			style={{ height: `${height}px` }}
		>
			<svg
				class='area-line__svg'
				width={size.width}
				height={height}
				onMouseMove={handleMove}
				onMouseLeave={leave}
			>
				<defs>
					{series.map((s) => (
						<linearGradient key={s.id} id={`${idPrefix}-${s.id}`} x1='0' x2='0' y1='0' y2='1'>
							<stop offset='0%' stop-color={s.color} stop-opacity='0.26' />
							<stop offset='100%' stop-color={s.color} stop-opacity='0' />
						</linearGradient>
					))}
				</defs>

				{/* y grid + labels */}
				{yTicks.map((t: number) => (
					<g key={t} class='area-line__grid'>
						<line
							x1={MARGIN.left}
							x2={size.width - MARGIN.right}
							y1={scales.y(t)}
							y2={scales.y(t)}
						/>
						<text x={MARGIN.left - 8} y={scales.y(t)} class='area-line__ytick'>
							{formatCents(t, currency)}
						</text>
					</g>
				))}

				{/* x labels */}
				{xTicks.map((i) => (
					<text key={i} x={scales.x(i)} y={height - 8} class='area-line__xtick'>
						{formatX(timeline.points[i]?.t ?? '', i)}
					</text>
				))}

				{/* area fills, then lines on top */}
				{showArea &&
					series.map((s, si) => (
						<path
							key={`fill-${s.id}`}
							class='area-line__fill'
							d={paths[si]?.fill}
							fill={`url(#${idPrefix}-${s.id})`}
						/>
					))}
				{series.map((s, si) => (
					<path key={`line-${s.id}`} class='area-line__line' d={paths[si]?.line} stroke={s.color} />
				))}

				{/* crosshair + per-series markers */}
				{activeIdx != null && size.width > 0 && (
					<g class='area-line__marker'>
						<line
							x1={scales.x(activeIdx)}
							x2={scales.x(activeIdx)}
							y1={MARGIN.top}
							y2={height - MARGIN.bottom}
						/>
						{series.map((s) => {
							const p = s.points[activeIdx];
							if (!p) return null;
							return (
								<circle
									key={s.id}
									cx={scales.x(activeIdx)}
									cy={scales.y(p.value_cents)}
									r={4}
									fill={s.color}
								/>
							);
						})}
					</g>
				)}
			</svg>

			{activeIdx != null && size.width > 0 && (
				<div
					class='area-line__tooltip'
					style={{
						left: `${Math.min(scales.x(activeIdx) + 12, size.width - 168)}px`,
						top: `${MARGIN.top}px`,
					}}
				>
					<div class='area-line__tooltip-date'>
						{formatX(timeline.points[activeIdx]?.t ?? '', activeIdx)}
					</div>
					{series.map((s) => {
						const p = s.points[activeIdx];
						if (!p) return null;
						return (
							<div key={s.id} class='area-line__tooltip-row'>
								<span class='area-line__tooltip-swatch' style={{ background: s.color }} />
								<span class='area-line__tooltip-label'>{s.label}</span>
								<span class='area-line__tooltip-value'>
									{formatCents(p.value_cents, currency, false)}
								</span>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
