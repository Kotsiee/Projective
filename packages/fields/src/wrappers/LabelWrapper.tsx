import { Signal } from '@preact/signals';
import '../styles/wrappers/label-wrapper.css';
import { LabelWrapperProps } from '../types/wrappers.ts';

export function LabelWrapper(props: LabelWrapperProps) {
	if (!props.label) return null;

	const isActive = props.active instanceof Signal ? props.active.value : props.active;
	const isError = props.error instanceof Signal ? props.error.value : props.error;
	const isDisabled = props.disabled instanceof Signal ? props.disabled.value : props.disabled;

	const { position = 'top', floatingRule = 'auto', floatingOrigin = 'top-left' } = props;

	// Determine if floating styles should be applied (Absolute positioning)
	// If rule is 'auto' (default) or 'always', we need the floating base class.
	// We only skip this if position isn't top or rule is explicitly 'never'.
	const canFloat = position === 'top' && floatingRule !== 'never';
	const isFloating = canFloat;

	// Determine if the label is currently in the "up" (active) state
	const isFloatedUp = floatingRule === 'always' || (floatingRule === 'auto' && isActive);

	const classes = [
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

	return (
		<label htmlFor={props.id} className={classes} style={props.style}>
			{props.label}
			{props.required && <span className='field-label__required'>*</span>}
		</label>
	);
}
