import '../../styles/components/progress-meter.css';

/* #region Types */
export type ProgressTone = 'gold' | 'primary' | 'mint' | 'violet';

/**
 * A fixed threshold marker rendered partway along the linear bar — e.g. a profile's public
 * "go-live" point, reached before overall completion hits 100%. Structurally compatible with the
 * types package's `ProfileSetupMilestone` so callers can pass `setup.milestone` straight through.
 */
export interface ProgressMilestone {
	/** Marker position along the bar, whole-number percent (0–100). */
	percent: number;
	/** Short caption shown beneath the marker (in full-size bars). */
	label?: string;
	/** Whether the threshold has been crossed (the fill has reached the marker). */
	reached?: boolean;
}

export interface ProgressMeterProps {
	/** Completion 0–100. Clamped. */
	value: number;
	/** Linear bar or radial ring. @default 'linear' */
	variant?: 'linear' | 'radial';
	/** Radial diameter (px). @default 44 */
	size?: number;
	/** Stroke width for radial / bar height for linear (px). */
	thickness?: number;
	/** Optional caption (linear only, rendered above the bar). */
	label?: string;
	/** Render the "62%" readout. @default true */
	showValue?: boolean;
	/** Accent ramp. @default 'gold' */
	tone?: ProgressTone;
	/** Optional go-live threshold marker (linear only). */
	milestone?: ProgressMilestone;
	/** Accessible label when there is no visible `label`. */
	ariaLabel?: string;
	class?: string;
	className?: string;
}
/* #endregion */

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/**
 * @function ProgressMeter
 * @description The shared completeness indicator behind every profile-setup tracker. Renders a sleek
 * minimalist linear bar or, when space collapses (e.g. a collapsed side rail), a high-end radial ring
 * — both from the same value. The radial is pure SVG (no DOM measurement) so it is SSR-safe and
 * paints instantly; the fill animates with the luxury easing curve.
 */
export function ProgressMeter(props: ProgressMeterProps) {
	const {
		value,
		variant = 'linear',
		size = 44,
		thickness,
		label,
		showValue = true,
		tone = 'gold',
		milestone,
		ariaLabel,
		class: klass,
		className,
	} = props;

	const pct = clamp(value);
	// The milestone caption is reserved only on full-size bars (those carrying a label or readout),
	// so the compact nav-dropdown bar shows just a subtle tick with no layout reflow.
	const showMilestoneLabel = !!(milestone?.label && (label || showValue));
	const classes = [
		'progress-meter',
		`progress-meter--${variant}`,
		`progress-meter--${tone}`,
		showMilestoneLabel && 'progress-meter--has-milestone-label',
		klass,
		className,
	].filter(Boolean).join(' ');

	if (variant === 'radial') {
		const stroke = thickness ?? Math.max(3, Math.round(size * 0.1));
		const r = (size - stroke) / 2;
		const c = 2 * Math.PI * r;
		const offset = c * (1 - pct / 100);
		return (
			<div
				class={classes}
				style={{ width: `${size}px`, height: `${size}px` }}
				role='progressbar'
				aria-valuenow={pct}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label={ariaLabel ?? label ?? 'Profile setup'}
			>
				<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden='true'>
					<circle
						class='progress-meter__ring-track'
						cx={size / 2}
						cy={size / 2}
						r={r}
						fill='none'
						stroke-width={stroke}
					/>
					<circle
						class='progress-meter__ring-fill'
						cx={size / 2}
						cy={size / 2}
						r={r}
						fill='none'
						stroke-width={stroke}
						stroke-linecap='round'
						stroke-dasharray={c}
						stroke-dashoffset={offset}
						transform={`rotate(-90 ${size / 2} ${size / 2})`}
					/>
				</svg>
				{showValue && <span class='progress-meter__ring-value'>{pct}%</span>}
			</div>
		);
	}

	return (
		<div
			class={classes}
			role='progressbar'
			aria-valuenow={pct}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-label={ariaLabel ?? label ?? 'Profile setup'}
		>
			{(label || showValue) && (
				<div class='progress-meter__head'>
					{label && <span class='progress-meter__label'>{label}</span>}
					{showValue && <span class='progress-meter__value'>{pct}%</span>}
				</div>
			)}
			<div class='progress-meter__bar'>
				<div
					class='progress-meter__track'
					style={thickness ? { height: `${thickness}px` } : undefined}
				>
					<div class='progress-meter__fill' style={{ width: `${pct}%` }} />
				</div>
				{milestone && (
					<div
						class='progress-meter__milestone'
						style={{ left: `${clamp(milestone.percent)}%` }}
						data-reached={milestone.reached ? 'true' : 'false'}
						role='presentation'
					>
						<span class='progress-meter__milestone-tick' aria-hidden='true' />
						{showMilestoneLabel && (
							<span class='progress-meter__milestone-label'>{milestone.label}</span>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export default ProgressMeter;
