import { useSignal } from '@preact/signals';
import { IconClock } from '@tabler/icons-preact';
import TextField from '../fields/TextField.tsx';
import TimeClock from './datetime/TimeClock.tsx';
import Popover from '../../components/overlays/Popover.tsx';
import '@styles/components/fields/TimeField.css';
import { DateTime } from '@projective/types';

interface TimeFieldProps {
	label?: string;
	value?: DateTime;
	onChange?: (date: DateTime) => void;
	disabled?: boolean;
	required?: boolean;
	error?: string;
	hint?: string;
	placeholder?: string;
}

export default function TimeField(props: TimeFieldProps) {
	const isOpen = useSignal(false);
	const inputValue = useSignal('');

	const formatValue = (d?: DateTime) => d ? d.toFormat('hh:mm tt') : '';

	// Sync Input on Mount/External Change
	if (props.value && !isOpen.value && inputValue.value === '') {
		inputValue.value = formatValue(props.value);
	}

	const handleClockChange = (date: DateTime) => {
		props.onChange?.(date);
		inputValue.value = formatValue(date);
		// Don't auto-close immediately on time change because user might want to tweak minutes
	};

	const handleInputChange = (val: string) => {
		inputValue.value = val;
		// Basic parse attempt (hh:mm am/pm)
		// Using simple regex or DateTime parser if it supports lenient time
		try {
			// Assuming DateTime has robust parsing or we use a regex for now
			// Simulating parse:
			const dt = new DateTime(val, 'hh:mm tt'); // Needs strict 'hh:mm tt' support in DateTime
			if (dt.isValid()) props.onChange?.(dt);
		} catch (e) {}
	};

	return (
		<div className='time-field'>
			<Popover
				isOpen={isOpen.value}
				onClose={() => isOpen.value = false}
				trigger={
					<TextField
						name='time-field'
						{...props}
						type='text'
						mask='99:99 aa' // Using mask from Phase 3 text fields (a = letter)
						placeholder={props.placeholder || '12:00 PM'}
						value={inputValue.value}
						onChange={(v) => handleInputChange(v as string)}
						iconRight={
							<button
								type='button'
								className='time-field__icon-btn'
								onClick={(e) => {
									e.preventDefault();
									isOpen.value = !isOpen.value;
								}}
								tabIndex={-1}
							>
								<IconClock size={18} />
							</button>
						}
						onFocus={() => isOpen.value = true}
					/>
				}
				content={
					<div className='time-field__clock-wrapper'>
						<TimeClock
							value={props.value}
							onChange={handleClockChange}
						/>
					</div>
				}
			/>
		</div>
	);
}
