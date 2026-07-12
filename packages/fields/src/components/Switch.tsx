import '../styles/fields/switch.css';
import { JSX } from 'preact';
import { SwitchProps } from '../types/components/switch.ts';

/**
 * @function Switch
 * @description Controlled toggle primitive. Renders a track + sliding thumb over a visually hidden
 * native checkbox (`role="switch"`) so it stays keyboard- and screen-reader-accessible. The binary
 * counterpart to {@link Checkbox}: use Switch for immediate on/off state (settings, visibility),
 * Checkbox for selection within a set. Thumb travel + track tint animate on `--motion-micro` (the
 * 250ms spring); the focus ring is the signature `--focus-glow`.
 */
export function Switch(props: SwitchProps): JSX.Element {
	const {
		checked,
		onChange,
		label,
		description,
		disabled = false,
		size = 'md',
		tone = 'primary',
		shape = 'pill',
		ariaLabel,
		name,
		className,
	} = props;

	const toggle = () => {
		if (!disabled) onChange?.(!checked);
	};

	return (
		<label
			class={[
				'switch',
				`switch--${size}`,
				`switch--${tone}`,
				`switch--${shape}`,
				checked && 'switch--on',
				disabled && 'switch--disabled',
				className,
			].filter(Boolean).join(' ')}
		>
			<input
				type='checkbox'
				role='switch'
				class='switch__input'
				name={name}
				checked={checked}
				disabled={disabled}
				aria-label={ariaLabel ?? (label ? undefined : 'toggle')}
				aria-checked={checked}
				onChange={toggle}
			/>
			<span class='switch__track' aria-hidden='true'>
				<span class='switch__thumb' />
			</span>
			{(label || description) && (
				<span class='switch__text'>
					{label && <span class='switch__label'>{label}</span>}
					{description && <span class='switch__description'>{description}</span>}
				</span>
			)}
		</label>
	);
}
