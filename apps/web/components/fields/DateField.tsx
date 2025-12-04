// deno-lint-ignore-file no-explicit-any
import '@styles/components/fields/DateField.css';
import { useSignal } from '@preact/signals';
import { IconCalendar } from '@tabler/icons-preact';
import TextField from '../fields/TextField.tsx';
import Calendar from './datetime/Calendar.tsx';
import Popover from '../../components/overlays/Popover.tsx';
import { BaseFieldProps, DateTime } from '@projective/types';

type DateValue = DateTime | [DateTime | null, DateTime | null];

interface DateFieldProps extends BaseFieldProps<DateTime> {
	label?: string;
	onChange?: (date: any) => void; // Typed loosely to allow undefined/null
	min?: DateTime;
	max?: DateTime;
	range?: boolean;
	disabled?: boolean;
	required?: boolean;
	error?: string;
	hint?: string;
	placeholder?: string;
	clearable?: boolean;
}

export default function DateField(props: DateFieldProps) {
	const isOpen = useSignal(false);
	const inputValue = useSignal('');

	// --- Helpers ---
	const formatValue = (val?: DateValue) => {
		if (!val) return '';
		if (Array.isArray(val)) {
			const [s, e] = val;
			if (!s) return '';
			if (!e) return s.toFormat('dd/MM/yyyy');
			return `${s.toFormat('dd/MM/yyyy')} - ${e.toFormat('dd/MM/yyyy')}`;
		}
		return val.toFormat('dd/MM/yyyy');
	};

	// Sync Input on Mount/Update (Unidirectional flow mainly)
	if (props.value && !isOpen.value) {
		const formatted = formatValue(props.value);
		if (inputValue.value !== formatted) inputValue.value = formatted;
	}

	// --- Handlers ---

	const handleCalendarSelect = (val: DateValue) => {
		props.onChange?.(val);

		// Close logic
		if (props.range) {
			// Only close if both start and end are selected
			if (Array.isArray(val) && val[0] && val[1]) {
				isOpen.value = false;
			}
		} else {
			isOpen.value = false;
		}
	};

	const handleInputChange = (val: string | number) => {
		const strVal = val.toString();
		inputValue.value = strVal;

		// FIX: Handle Clear
		if (strVal === '') {
			props.onChange?.(undefined);
			return;
		}

		// Attempt parse (Simple for Single, Complex for Range)
		// For Phase 2 MVP, we only support parsing Single Date strings typing.
		// Range typing is complex (split by dash, parse two dates).
		if (!props.range) {
			try {
				const dt = new DateTime(strVal, 'dd/MM/yyyy', true);
				if (dt.isValid()) props.onChange?.(dt);
			} catch (_) { /* invalid */ }
		}
	};

	return (
		<div className='date-field'>
			<Popover
				isOpen={isOpen.value}
				onClose={() => isOpen.value = false}
				trigger={
					<TextField
						{...props}
						name={`date-field_${props.name}`}
						// Passes clearable, label, error, etc.
						type='text'
						// Use mask only for single mode for now
						mask={props.range ? undefined : '99/99/9999'}
						placeholder={props.placeholder || (props.range ? 'Start - End' : 'DD/MM/YYYY')}
						value={inputValue.value}
						onChange={handleInputChange}
						iconRight={
							<button
								type='button'
								className='date-field__icon-btn'
								onClick={(e) => {
									e.preventDefault();
									isOpen.value = !isOpen.value;
								}}
								tabIndex={-1}
							>
								<IconCalendar size={18} />
							</button>
						}
						onFocus={() => isOpen.value = true}
					/>
				}
				content={
					<div className='date-field__calendar-wrapper'>
						<Calendar
							value={props.value}
							onChange={handleCalendarSelect}
							min={props.min}
							max={props.max}
							range={props.range}
						/>
					</div>
				}
			/>
		</div>
	);
}
