/**
 * @file ToggleSwitch.tsx
 * @description A small, accessible on/off switch. The design system ships toggle *buttons* but no
 * boolean switch control, and the creation modals need several (NDA required, deadline bonus,
 * files-required). Purely presentational — state is owned by the caller.
 */

import '../../styles/components/new/toggle-switch.css';
import { JSX } from 'preact';

export interface ToggleSwitchProps {
	/** Current on/off state. */
	checked: boolean;
	/** Fired with the next state when toggled. */
	onChange: (next: boolean) => void;
	/** Primary label rendered beside the switch. */
	label?: JSX.Element | string;
	/** Secondary helper line beneath the label. */
	description?: JSX.Element | string;
	/** Accessible label when no visible `label` is provided. */
	'aria-label'?: string;
	disabled?: boolean;
	className?: string;
}

export function ToggleSwitch(
	{ checked, onChange, label, description, disabled, className, ...rest }: ToggleSwitchProps,
) {
	return (
		<label class={`toggle-switch ${disabled ? 'toggle-switch--disabled' : ''} ${className ?? ''}`}>
			{(label || description) && (
				<span class='toggle-switch__text'>
					{label && <span class='toggle-switch__label'>{label}</span>}
					{description && <span class='toggle-switch__desc'>{description}</span>}
				</span>
			)}
			<button
				type='button'
				role='switch'
				aria-checked={checked}
				aria-label={rest['aria-label']}
				disabled={disabled}
				class={`toggle-switch__track ${checked ? 'toggle-switch__track--on' : ''}`}
				onClick={() =>
					!disabled && onChange(!checked)}
			>
				<span class='toggle-switch__thumb' />
			</button>
		</label>
	);
}
