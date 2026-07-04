import '../styles/fields/allocation-meter.css';
import { JSX } from 'preact';
import { AllocationMeterProps } from '../types/components/allocation-meter.ts';

/**
 * @function AllocationMeter
 * @description Visualises filled vs. available slots (e.g. "3/5 seats").
 * Renders either a row of dots or a progress bar, plus an optional caption.
 * When `tone` is 'auto' the colour shifts green → amber → red as slots fill.
 */
export function AllocationMeter(props: AllocationMeterProps): JSX.Element {
	const {
		filled,
		total,
		variant = 'dots',
		label,
		showCaption = true,
		size = 'md',
		tone = 'auto',
		className,
	} = props;

	const safeTotal = Math.max(0, Math.floor(total));
	const safeFilled = Math.min(Math.max(0, Math.floor(filled)), safeTotal);
	const available = safeTotal - safeFilled;
	const isFull = available <= 0 && safeTotal > 0;

	const resolvedTone = tone === 'auto'
		? (isFull ? 'danger' : available === 1 ? 'warning' : 'primary')
		: tone;

	const pct = safeTotal > 0 ? (safeFilled / safeTotal) * 100 : 0;

	const caption = isFull
		? `${label ?? 'slots'} full`
		: `${available}/${safeTotal} ${label ?? 'slots'} available`;

	return (
		<div
			class={[
				'allocation-meter',
				`allocation-meter--${variant}`,
				`allocation-meter--${size}`,
				`allocation-meter--${resolvedTone}`,
				className,
			].filter(Boolean).join(' ')}
		>
			{variant === 'dots'
				? (
					<div class='allocation-meter__dots' role='img' aria-label={caption}>
						{Array.from({ length: safeTotal }, (_, i) => (
							<span
								key={i}
								class={[
									'allocation-meter__dot',
									i < safeFilled && 'allocation-meter__dot--filled',
								].filter(Boolean).join(' ')}
							/>
						))}
					</div>
				)
				: (
					<div
						class='allocation-meter__track'
						role='progressbar'
						aria-valuenow={safeFilled}
						aria-valuemin={0}
						aria-valuemax={safeTotal}
						aria-label={caption}
					>
						<div
							class='allocation-meter__fill'
							style={{ width: `${pct}%` }}
						/>
					</div>
				)}

			{showCaption && <span class='allocation-meter__caption'>{caption}</span>}
		</div>
	);
}
