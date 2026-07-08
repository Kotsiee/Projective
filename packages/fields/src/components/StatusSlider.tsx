import '../styles/fields/status-slider.css';
import { JSX } from 'preact';
import { StatusSliderProps } from '../types/components/status-slider.ts';

/**
 * @function StatusSlider
 * @description Segmented, ordered status-transition control. The track fills to the current step and
 * every node up to it reads as "reached". When `onChange` is provided it is interactive — by default
 * only the adjacent steps are selectable (pass `canSelect` to widen/narrow that). Read-only without
 * `onChange`, so the same primitive renders live status on the stage board and drives transitions in
 * the stage header.
 */
export function StatusSlider(props: StatusSliderProps): JSX.Element {
	const {
		steps,
		value,
		onChange,
		disabled = false,
		canSelect,
		tone = 'primary',
		size = 'md',
		hideLabels = false,
		className,
	} = props;

	const currentIndex = Math.max(0, steps.findIndex((s) => s.value === value));
	const interactive = !!onChange && !disabled;

	// Default policy: only the immediate neighbours of the current step are selectable.
	const selectable = (idx: number): boolean => {
		if (!interactive) return false;
		if (canSelect) return canSelect(steps[idx].value);
		return Math.abs(idx - currentIndex) === 1;
	};

	const pctFilled = steps.length > 1 ? (currentIndex / (steps.length - 1)) * 100 : 0;

	return (
		<div
			class={[
				'status-slider',
				`status-slider--${tone}`,
				`status-slider--${size}`,
				interactive && 'status-slider--interactive',
				className,
			].filter(Boolean).join(' ')}
			role='group'
			aria-label='Status'
		>
			<div class='status-slider__rail' aria-hidden='true'>
				<div class='status-slider__rail-fill' style={{ width: `${pctFilled}%` }} />
			</div>
			<ol class='status-slider__steps'>
				{steps.map((step, idx) => {
					const reached = idx <= currentIndex;
					const isCurrent = idx === currentIndex;
					const canPick = selectable(idx);
					return (
						<li
							key={step.value}
							class={[
								'status-slider__step',
								reached && 'status-slider__step--reached',
								isCurrent && 'status-slider__step--current',
								canPick && 'status-slider__step--selectable',
								step.tone && `status-slider__step--tone-${step.tone}`,
							].filter(Boolean).join(' ')}
						>
							<button
								type='button'
								class='status-slider__node'
								disabled={!canPick}
								aria-current={isCurrent ? 'step' : undefined}
								aria-label={step.label}
								onClick={() => canPick && onChange?.(step.value)}
							/>
							{!hideLabels && <span class='status-slider__label'>{step.label}</span>}
						</li>
					);
				})}
			</ol>
		</div>
	);
}
