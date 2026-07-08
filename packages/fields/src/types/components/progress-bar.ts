/**
 * ProgressBar primitive props. A general 0..max linear progress indicator (distinct from
 * AllocationMeter, which counts discrete slots). Used for checklist completion, upload progress and
 * any "N of M done" surface so the progress affordance stays unified across the app.
 */
export interface ProgressBarProps {
	/** Current value. Clamped to [0, max]. */
	value: number;
	/** Maximum value. Defaults to 100. */
	max?: number;
	/** Colour tone. 'auto' shifts amber → primary → green as it fills. Defaults to 'primary'. */
	tone?: 'primary' | 'success' | 'warning' | 'danger' | 'auto';
	/** Bar thickness. Defaults to 'md'. */
	size?: 'sm' | 'md' | 'lg';
	/** Show a "42%" / "3/8" caption. Defaults to false. */
	showValue?: boolean;
	/** Render the caption as a fraction ("3/8") instead of a percentage. */
	valueFormat?: 'percent' | 'fraction';
	/** Optional leading label. */
	label?: string;
	/** Accessible label (falls back to `label` or the caption). */
	ariaLabel?: string;
	className?: string;
}
