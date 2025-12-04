import { useSignal } from '@preact/signals';
import { IconCalendar, IconClock } from '@tabler/icons-preact';
import TextField from '../fields/TextField.tsx';
import Calendar from './datetime/Calendar.tsx';
import TimeClock from './datetime/TimeClock.tsx';
import Popover from '../../components/overlays/Popover.tsx';
import '@styles/components/fields/DateTimeField.css';
import { DateTime } from '@projective/types';

interface DateTimeFieldProps {
	label?: string;
	value?: DateTime;
	onChange?: (date: DateTime | undefined) => void;
	min?: DateTime;
	max?: DateTime;
	disabled?: boolean;
	required?: boolean;
	error?: string;
	hint?: string;
	placeholder?: string;
	clearable?: boolean;
}

type TabView = 'date' | 'time';

export default function DateTimeField(props: DateTimeFieldProps) {
	const isOpen = useSignal(false);
	const activeTab = useSignal<TabView>('date');
	const inputValue = useSignal('');

	// --- Format Helper ---
	// e.g. "25/12/2025 14:30"
	const formatValue = (val?: DateTime) => {
		if (!val) return '';
		return val.toFormat('dd/MM/yyyy HH:mm');
	};

	// Sync Input (Unidirectional)
	if (props.value && !isOpen.value) {
		const formatted = formatValue(props.value);
		if (inputValue.value !== formatted) inputValue.value = formatted;
	}

	// --- State Logic ---

	const updateDatePart = (newDate: DateTime) => {
		// Preserve existing time if we have a value, otherwise start of day
		const current = props.value || DateTime.today(); // Default to today 00:00 if null

		// Construct new native date using Y/M/D from newDate and H/M from current
		const d = new Date(current.getTime());
		d.setFullYear(newDate.getYear());
		d.setMonth(newDate.getMonth() - 1); // Month is 1-based in DateTime wrapper? Check wrapper.
		// Checking DateTime.ts: getMonth() returns date.getMonth() + 1. So we subtract 1.
		d.setDate(newDate.getDate());

		// Create new immutable DateTime
		const nextVal = new DateTime(d);
		props.onChange?.(nextVal);
		inputValue.value = formatValue(nextVal);

		// Auto-switch to time view for better UX
		activeTab.value = 'time';
	};

	const updateTimePart = (newTime: DateTime) => {
		// Preserve existing date if we have a value, otherwise today
		const current = props.value || DateTime.today();

		const d = new Date(current.getTime());
		d.setHours(newTime.getHour());
		d.setMinutes(newTime.getMinute());

		const nextVal = new DateTime(d);
		props.onChange?.(nextVal);
		inputValue.value = formatValue(nextVal);
	};

	const handleInputChange = (val: string) => {
		inputValue.value = val;
		if (val === '') {
			props.onChange?.(undefined);
			return;
		}
		// Attempt strict parse
		try {
			const dt = new DateTime(val, 'dd/MM/yyyy HH:mm', true); // Needs this format in DateTime
			if (dt.isValid()) props.onChange?.(dt);
		} catch (e) {}
	};

	// Tabs Header
	const renderTabs = () => (
		<div className='datetime-field__tabs'>
			<button
				type='button'
				className={`datetime-field__tab ${
					activeTab.value === 'date' ? 'datetime-field__tab--active' : ''
				}`}
				onClick={() => activeTab.value = 'date'}
			>
				<IconCalendar size={16} />
				<span>Date</span>
				{/* Preview Date Part */}
				<span className='datetime-field__tab-val'>
					{props.value ? props.value.toFormat('dd MMM') : '--'}
				</span>
			</button>

			<button
				type='button'
				className={`datetime-field__tab ${
					activeTab.value === 'time' ? 'datetime-field__tab--active' : ''
				}`}
				onClick={() => activeTab.value = 'time'}
			>
				<IconClock size={16} />
				<span>Time</span>
				{/* Preview Time Part */}
				<span className='datetime-field__tab-val'>
					{props.value ? props.value.toFormat('HH:mm') : '--:--'}
				</span>
			</button>
		</div>
	);

	return (
		<div className='datetime-field'>
			<Popover
				isOpen={isOpen.value}
				onClose={() => isOpen.value = false}
				trigger={
					<TextField
						name='datetime-field'
						{...props}
						type='text'
						mask='99/99/9999 99:99' // Combined mask
						placeholder={props.placeholder || 'DD/MM/YYYY HH:mm'}
						value={inputValue.value}
						onChange={(v) => handleInputChange(v as string)}
						iconRight={
							<button
								type='button'
								className='datetime-field__icon-btn'
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
					<div className='datetime-field__popup'>
						{renderTabs()}

						<div className='datetime-field__body'>
							{activeTab.value === 'date'
								? (
									<Calendar
										value={props.value}
										onChange={(v) => updateDatePart(v as DateTime)} // Handles switch to 'time' internally
										min={props.min}
										max={props.max}
										className='datetime-field__calendar'
									/>
								)
								: (
									<div className='datetime-field__clock-wrapper'>
										<TimeClock
											value={props.value}
											onChange={updateTimePart}
										/>
									</div>
								)}
						</div>
					</div>
				}
			/>
		</div>
	);
}
