import '../styles/fields/progress-bar.css';
import { JSX } from 'preact';
import { ProgressBarProps } from '../types/components/progress-bar.ts';

/**
 * @function ProgressBar
 * @description Linear 0..max progress indicator. Shared by checklist completion, upload progress and
 * any "N of M" surface so progress reads consistently. When `tone` is 'auto' the colour shifts
 * amber (early) → primary (mid) → green (complete).
 */
export function ProgressBar(props: ProgressBarProps): JSX.Element {
	const {
		value,
		max = 100,
		tone = 'primary',
		size = 'md',
		showValue = false,
		valueFormat = 'percent',
		label,
		ariaLabel,
		className,
	} = props;

	const safeMax = max <= 0 ? 1 : max;
	const safeValue = Math.min(Math.max(0, value), safeMax);
	const pct = (safeValue / safeMax) * 100;

	const resolvedTone = tone === 'auto'
		? (pct >= 100 ? 'success' : pct < 34 ? 'warning' : 'primary')
		: tone;

	const caption = valueFormat === 'fraction'
		? `${Math.round(safeValue)}/${Math.round(safeMax)}`
		: `${Math.round(pct)}%`;

	return (
		<div
			class={[
				'progress-bar',
				`progress-bar--${size}`,
				`progress-bar--${resolvedTone}`,
				className,
			].filter(Boolean).join(' ')}
		>
			{label && <span class='progress-bar__label'>{label}</span>}
			<div
				class='progress-bar__track'
				role='progressbar'
				aria-valuenow={Math.round(safeValue)}
				aria-valuemin={0}
				aria-valuemax={Math.round(safeMax)}
				aria-label={ariaLabel ?? label ?? caption}
			>
				<div class='progress-bar__fill' style={{ width: `${pct}%` }} />
			</div>
			{showValue && <span class='progress-bar__value'>{caption}</span>}
		</div>
	);
}
