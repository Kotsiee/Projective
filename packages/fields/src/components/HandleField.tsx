import '../styles/fields/handle-field.css';
import { Signal } from '@preact/signals';
import { TextField } from './TextField.tsx';
import { sanitizeHandle } from '../utils/handle.ts';

// Re-exported so callers can pre-seed / validate a handle with the exact same
// rules the field enforces (see ../utils/handle.ts for the CSS-free source).
export { sanitizeHandle };

export interface HandleFieldProps {
	/** Two-way bound handle value (already sanitized on every keystroke). */
	value: Signal<string>;
	label?: string;
	placeholder?: string;
	error?: string;
	hint?: string;
	disabled?: boolean;
	required?: boolean;
	maxLength?: number;
	name?: string;
	nextField?: string;
	/** Fired with the sanitized handle after each change. */
	onChange?: (handle: string) => void;
}

/**
 * @function HandleField
 * @description A specialised `@handle` slug input. Renders a fixed `@` prefix and
 * live-sanitizes every keystroke down to a URL-safe handle, so the value bound to
 * `value` is always submit-ready. Built on {@link TextField} so it inherits the
 * shared label / message / focus chrome and light-dark theming.
 */
export function HandleField(props: HandleFieldProps) {
	const {
		value,
		onChange,
		label = 'Handle',
		placeholder = 'your-handle',
		error,
		hint,
		disabled,
		required,
		maxLength = 50,
		name,
		nextField,
	} = props;

	const handleChange = (raw: string) => {
		const next = sanitizeHandle(raw);
		if (value.value !== next) value.value = next;
		onChange?.(next);
	};

	return (
		<TextField
			name={name}
			className='handle-field'
			label={label}
			value={value}
			onChange={handleChange}
			placeholder={placeholder}
			error={error}
			hint={hint}
			disabled={disabled}
			required={required}
			maxLength={maxLength}
			showCount={false}
			autoComplete='off'
			nextField={nextField}
			prefix={<span class='handle-field__at' aria-hidden='true'>@</span>}
			floating={false}
		/>
	);
}
