import '../../styles/gauge/workload-capacity-gauge.css';
import type { WorkloadCapacityGaugeProps, WorkloadGaugeTone } from '../../types/gauge.ts';

/** Trim a trailing `.0` so "3.00" reads as "3" but "1.5" stays "1.5". */
function fmt(n: number): string {
	if (!Number.isFinite(n)) return '—';
	return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
}

/** Classify current/max into the colour band. Over-cap wins even a fractional overshoot. */
function toneFor(ratio: number, warnThreshold: number): WorkloadGaugeTone {
	if (ratio >= 1) return 'over';
	if (ratio >= warnThreshold) return 'warn';
	return 'ok';
}

/**
 * Workload Capacity Gauge (E4). Visualizes a freelancer's live Workload Intensity (W_i) against
 * their concurrency cap. The fill ramps from a green→blue gradient (healthy) to amber (approaching
 * the cap) to red (at/over the cap) so staffers and the freelancer read remaining bandwidth at a
 * glance. Pure SVG/CSS — no canvas, no external deps — safe to import anywhere in the workspace.
 */
export function WorkloadCapacityGauge({
	current,
	max,
	label = 'Workload',
	unit = 'Wi',
	variant = 'dial',
	size,
	warnThreshold = 0.75,
	showValue = true,
	caption,
	className,
}: WorkloadCapacityGaugeProps) {
	const safeMax = max > 0 ? max : 0;
	const rawRatio = safeMax > 0 ? current / safeMax : 0;
	const ratio = Math.max(rawRatio, 0);
	const filled = Math.min(ratio, 1); // arc/bar never overdraws past the track
	const tone = toneFor(ratio, warnThreshold);
	const pct = Math.round(ratio * 100);

	const root = `workload-gauge workload-gauge--${variant} workload-gauge--${tone}${
		className ? ` ${className}` : ''
	}`;

	if (variant === 'bar') {
		return (
			<div
				class={root}
				role='meter'
				aria-valuenow={current}
				aria-valuemin={0}
				aria-valuemax={safeMax}
				aria-label={`${label}: ${fmt(current)} of ${fmt(safeMax)} ${unit}`}
			>
				<div class='workload-gauge__bar-head'>
					<span class='workload-gauge__label'>{label}</span>
					{showValue && (
						<span class='workload-gauge__bar-value'>
							{fmt(current)}
							<span class='workload-gauge__bar-cap'>/{fmt(safeMax)} {unit}</span>
						</span>
					)}
				</div>
				<div class='workload-gauge__track' style={{ height: size ? `${size}px` : undefined }}>
					<div class='workload-gauge__fill' style={{ width: `${filled * 100}%` }} />
				</div>
				{caption && <span class='workload-gauge__caption'>{caption}</span>}
			</div>
		);
	}

	// Dial: a 270° arc with the gap centered at the bottom. The value arc sweeps clockwise from the
	// lower-left. Geometry is computed so the component scales cleanly with `size`.
	const dim = size ?? 132;
	const stroke = Math.max(8, Math.round(dim * 0.092));
	const r = (dim - stroke) / 2 - 1;
	const c = 2 * Math.PI * r;
	const sweep = 0.75; // 270° of the full circle is the usable track
	const trackLen = sweep * c;
	const valueLen = filled * trackLen;
	const center = dim / 2;

	return (
		<div
			class={root}
			role='meter'
			aria-valuenow={current}
			aria-valuemin={0}
			aria-valuemax={safeMax}
			aria-label={`${label}: ${fmt(current)} of ${fmt(safeMax)} ${unit}`}
		>
			<div class='workload-gauge__dial' style={{ width: `${dim}px`, height: `${dim}px` }}>
				<svg viewBox={`0 0 ${dim} ${dim}`} class='workload-gauge__svg' aria-hidden='true'>
					<defs>
						<linearGradient id='workloadGaugeOk' x1='0' y1='1' x2='1' y2='0'>
							<stop offset='0%' stop-color='var(--mint)' />
							<stop offset='100%' stop-color='var(--primary)' />
						</linearGradient>
					</defs>
					{/* Track (unfilled remainder) */}
					<circle
						class='workload-gauge__arc-track'
						cx={center}
						cy={center}
						r={r}
						fill='none'
						stroke-width={stroke}
						stroke-linecap='round'
						stroke-dasharray={`${trackLen} ${c - trackLen}`}
						transform={`rotate(135 ${center} ${center})`}
					/>
					{/* Value arc */}
					<circle
						class='workload-gauge__arc-value'
						cx={center}
						cy={center}
						r={r}
						fill='none'
						stroke-width={stroke}
						stroke-linecap='round'
						stroke-dasharray={`${valueLen} ${c}`}
						transform={`rotate(135 ${center} ${center})`}
					/>
				</svg>
				<div class='workload-gauge__readout'>
					{showValue && (
						<span class='workload-gauge__value'>
							{fmt(current)}
							<span class='workload-gauge__cap'>/{fmt(safeMax)}</span>
						</span>
					)}
					<span class='workload-gauge__label'>{label}</span>
					<span class='workload-gauge__pct'>{pct}%</span>
				</div>
			</div>
			{caption && <span class='workload-gauge__caption'>{caption}</span>}
		</div>
	);
}
