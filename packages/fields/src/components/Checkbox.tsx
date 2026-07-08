import '../styles/fields/checkbox.css';
import { JSX } from 'preact';
import { IconCheck, IconMinus } from '@tabler/icons-preact';
import { CheckboxProps } from '../types/components/checkbox.ts';

/**
 * @function Checkbox
 * @description Controlled checkbox primitive. Renders a custom box (tick / dash) over a visually
 * hidden native input so it stays keyboard- and screen-reader-accessible. Shared across the checklist
 * and file-library surfaces so every "select" affordance looks and behaves the same.
 */
export function Checkbox(props: CheckboxProps): JSX.Element {
	const {
		checked,
		onChange,
		label,
		description,
		indeterminate = false,
		disabled = false,
		size = 'md',
		tone = 'primary',
		ariaLabel,
		name,
		className,
	} = props;

	const toggle = () => {
		if (!disabled) onChange?.(!checked);
	};

	const iconSize = size === 'sm' ? 12 : 14;

	return (
		<label
			class={[
				'checkbox',
				`checkbox--${size}`,
				`checkbox--${tone}`,
				(checked || indeterminate) && 'checkbox--on',
				disabled && 'checkbox--disabled',
				className,
			].filter(Boolean).join(' ')}
		>
			<input
				type='checkbox'
				class='checkbox__input'
				name={name}
				checked={checked}
				disabled={disabled}
				aria-label={ariaLabel ?? (label ? undefined : 'checkbox')}
				aria-checked={indeterminate ? 'mixed' : checked}
				onChange={toggle}
			/>
			<span class='checkbox__box' aria-hidden='true'>
				{indeterminate
					? <IconMinus size={iconSize} stroke={3} />
					: checked
					? <IconCheck size={iconSize} stroke={3} />
					: null}
			</span>
			{(label || description) && (
				<span class='checkbox__text'>
					{label && <span class='checkbox__label'>{label}</span>}
					{description && <span class='checkbox__description'>{description}</span>}
				</span>
			)}
		</label>
	);
}
