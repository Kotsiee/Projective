/**
 * @file ForecastRunwayChart.tsx
 * @description The Predictive Runway (potential revenue). Lower data density but high
 * interactivity, so this is pure SVG (not Canvas): `d3-shape` builds the confidence-interval
 * band + the smooth projection line, and CSS transitions on the path `d`/opacity give fluid
 * timeline-horizon changes. A scrub overlay reports the focused point back to the caller.
 */

import '../../styles/forecast/forecast-runway.css';
import { useMemo, useState } from 'preact/hooks';
import type { ForecastRunwayChartProps } from '../../types/finance.ts';
import { useElementSize } from '../../hooks/useElementSize.ts';
import { buildRunwayScales, type PlotBox } from '../../core/finance/scales.ts';
import { runwayBandPath, runwayFillPath, runwayLinePath } from '../../core/finance/runway.ts';

const MARGIN = { top: 14, right: 16, bottom: 26, left: 52 };

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

function formatDate(iso: string): string {
	const d = new Date(iso);
	if (isNaN(d.getTime())) return iso;
	// UTC-pinned so SSR and client hydration agree (seed timestamps are Zulu).
	return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

export function ForecastRunwayChart(props: ForecastRunwayChartProps) {
	const {
		series,
		height = 300,
		showBand = true,
		currency = 'GBP',
		accent = 'var(--mint)',
		onScrubPoint,
		className,
	} = props;

	const { ref, size } = useElementSize<HTMLDivElement>();
	const [activeIdx, setActiveIdx] = useState<number | null>(null);

	const box: PlotBox = { width: size.width, height, margin: MARGIN };
	const scales = useMemo(() => buildRunwayScales(series, box), [series, size.width, height]);

	const paths = useMemo(() => {
		if (!size.width) return { band: '', line: '', fill: '' };
		return {
			band: runwayBandPath(series, scales),
			line: runwayLinePath(series, scales),
			fill: runwayFillPath(series, scales, height - MARGIN.bottom),
		};
	}, [series, scales, size.width, height]);

	const yTicks = useMemo(() => (size.width ? scales.y.ticks(4) : []), [scales, size.width]);
	const xTicks = useMemo(() => {
		if (!series.length) return [] as number[];
		const n = series.length;
		return [...new Set([0, Math.floor(n / 3), Math.floor((2 * n) / 3), n - 1])];
	}, [series]);

	const handleMove = (e: MouseEvent) => {
		const host = (e.currentTarget as SVGElement).getBoundingClientRect();
		const px = e.clientX - host.left;
		const idx = Math.round(scales.x.invert(px));
		const clamped = Math.max(0, Math.min(series.length - 1, idx));
		setActiveIdx(clamped);
		onScrubPoint?.(series[clamped] ?? null);
	};

	const leave = () => {
		setActiveIdx(null);
		onScrubPoint?.(null);
	};

	const active = activeIdx != null ? series[activeIdx] : null;
	const gradId = 'runway-fill';

	return (
		<div
			ref={ref}
			class={`forecast-runway${className ? ` ${className}` : ''}`}
			style={{ height: `${height}px` }}
		>
			<svg
				class='forecast-runway__svg'
				width={size.width}
				height={height}
				onMouseMove={handleMove}
				onMouseLeave={leave}
			>
				<defs>
					<linearGradient id={gradId} x1='0' x2='0' y1='0' y2='1'>
						<stop offset='0%' stop-color={accent} stop-opacity='0.28' />
						<stop offset='100%' stop-color={accent} stop-opacity='0' />
					</linearGradient>
				</defs>

				{/* y grid + labels */}
				{yTicks.map((t: number) => (
					<g key={t} class='forecast-runway__grid'>
						<line
							x1={MARGIN.left}
							x2={size.width - MARGIN.right}
							y1={scales.y(t)}
							y2={scales.y(t)}
						/>
						<text x={MARGIN.left - 8} y={scales.y(t)} class='forecast-runway__ytick'>
							{formatCents(t, currency)}
						</text>
					</g>
				))}

				{/* x labels */}
				{xTicks.map((i) => (
					<text key={i} x={scales.x(i)} y={height - 8} class='forecast-runway__xtick'>
						{formatDate(series[i]?.t ?? '')}
					</text>
				))}

				{showBand && <path class='forecast-runway__band' d={paths.band} fill={accent} />}
				<path class='forecast-runway__fill' d={paths.fill} fill={`url(#${gradId})`} />
				<path class='forecast-runway__line' d={paths.line} stroke={accent} />

				{active && activeIdx != null && (
					<g class='forecast-runway__marker'>
						<line
							x1={scales.x(activeIdx)}
							x2={scales.x(activeIdx)}
							y1={MARGIN.top}
							y2={height - MARGIN.bottom}
						/>
						<circle
							cx={scales.x(activeIdx)}
							cy={scales.y(active.value_cents)}
							r={5}
							fill={accent}
						/>
					</g>
				)}
			</svg>

			{active && activeIdx != null && (
				<div
					class='forecast-runway__tooltip'
					style={{
						left: `${Math.min(scales.x(activeIdx) + 12, size.width - 160)}px`,
						top: `${MARGIN.top}px`,
					}}
				>
					<div class='forecast-runway__tooltip-date'>{formatDate(active.t)}</div>
					<div class='forecast-runway__tooltip-value'>
						{formatCents(active.value_cents, currency, false)}
					</div>
					<div class='forecast-runway__tooltip-band'>
						{formatCents(active.lower_cents, currency)} –{' '}
						{formatCents(active.upper_cents, currency)}
					</div>
				</div>
			)}
		</div>
	);
}
