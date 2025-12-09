import '../styles/wrappers/label-wrapper.css';
import '../styles/components/help-tooltip.css';
import { Signal } from '@preact/signals';
import { LabelWrapperProps } from '../types/wrappers.ts';
import { HelpTooltip } from '../components/HelpTooltip.tsx';

export function LabelWrapper(props: LabelWrapperProps) {
	if (!props.label) return null;

	const isActive = props.active instanceof Signal ? props.active.value : props.active;
	const isError = props.error instanceof Signal ? props.error.value : props.error;
	const isDisabled = props.disabled instanceof Signal ? props.disabled.value : props.disabled;

	const {
		position = 'top',
		floatingRule = 'auto',
		floatingOrigin = 'top-left',
		helpPosition = 'inline',
	} = props;

	// Determine if floating styles should be applied (Absolute positioning)
	const canFloat = position === 'top' && floatingRule !== 'never';
	const isFloating = canFloat;

	// Determine if the label is currently in the "up" (active) state
	const isFloatedUp = floatingRule === 'always' || (floatingRule === 'auto' && isActive);

	const labelClasses = [
		'field-label',
		`field-label--pos-${position}`,
		isFloating && 'field-label--floating',
		isFloating && `field-label--float-from-${floatingOrigin}`,
		props.multiline && 'field-label--multiline',
		isFloatedUp && 'field-label--active',
		isError && 'field-label--error',
		isDisabled && 'field-label--disabled',
		props.className,
	]
		.filter(Boolean)
		.join(' ');

	// Render Helper
	const tooltip = props.help
		? (
			<HelpTooltip
				content={props.help}
				href={props.helpLink}
				className={helpPosition !== 'inline' ? `help-tooltip--${helpPosition}` : ''}
			/>
		)
		: null;

	return (
		<>
			<div className={labelClasses} style={props.style}>
				<label htmlFor={props.id}>
					{props.label}
					{props.required && <span className='field-label__required'>*</span>}
				</label>

				{/* Render inline if position is inline */}
				{helpPosition === 'inline' && tooltip}
			</div>

			{/* Render outside if position is corner-based (Detached from label transforms) */}
			{helpPosition !== 'inline' && tooltip}
		</>
	);
}
