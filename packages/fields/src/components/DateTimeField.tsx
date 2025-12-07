import '../styles/components/datetime-field.css';
import { Signal, useSignal } from '@preact/signals';
import { IconCalendar, IconClock } from '@tabler/icons-preact';
import { DateTime } from '@projective/types';
import { DateTimeFieldProps } from '../types/components/datetime-field.ts';
import { TextField } from './TextField.tsx';
import { Calendar } from './datetime/Calendar.tsx';
import { TimeClock } from './datetime/TimeClock.tsx';
import { Popover } from './overlays/Popover.tsx';

type TabView = 'date' | 'time';

export function DateTimeField(props: DateTimeFieldProps) {
	const {
		value,
		defaultValue,
		onChange,
		min,
		max,
		placeholder,
		...rest
	} = props;

	const isOpen = useSignal(false);
	const activeTab = useSignal<TabView>('date');
	const inputValue = useSignal('');

	// Normalize signal
	const isValueSignal = value instanceof Signal;
	const internalSignal = useSignal(
		isValueSignal ? value.peek() : (value ?? defaultValue),
	);

	if (!isValueSignal && value !== undefined && value !== internalSignal.peek()) {
		internalSignal.value = value;
	}

	const signalValue = isValueSignal ? value : internalSignal;

	// --- Format Helper ---
	const formatValue = (val?: DateTime) => {
		if (!val) return '';
		return val.toFormat('dd/MM/yyyy HH:mm');
	};

	// Sync Input (Unidirectional)
	// We watch signalValue
	const currentVal = signalValue.value;
	if (currentVal && !isOpen.value) {
		const formatted = formatValue(currentVal);
		if (inputValue.value !== formatted) inputValue.value = formatted;
	}

	// --- State Logic ---

	const updateDatePart = (newDate: DateTime) => {
		const current = signalValue.value || new DateTime();

		const d = new Date(current.getTime());
		d.setFullYear(newDate.getYear());
		d.setMonth(newDate.getMonth() - 1);
		d.setDate(newDate.getDate());

		const nextVal = new DateTime(d);

		if (isValueSignal) {
			(value as Signal<DateTime>).value = nextVal;
		} else {
			internalSignal.value = nextVal;
		}
		onChange?.(nextVal);
		inputValue.value = formatValue(nextVal);

		activeTab.value = 'time';
	};

	const updateTimePart = (newTime: DateTime) => {
		const current = signalValue.value || new DateTime();

		const d = new Date(current.getTime());
		d.setHours(newTime.getHour());
		d.setMinutes(newTime.getMinute());

		const nextVal = new DateTime(d);

		if (isValueSignal) {
			(value as Signal<DateTime>).value = nextVal;
		} else {
			internalSignal.value = nextVal;
		}
		onChange?.(nextVal);
		inputValue.value = formatValue(nextVal);
	};

	const handleInputChange = (val: string) => {
		inputValue.value = val;
		if (val === '') {
			// Handle clear
			// We can't set undefined to DateTime signal easily if strict?
			// But ValueFieldProps<DateTime> implies it might be undefined?
			// Let's assume we can set it to undefined if the type allows.
			// But signalValue is Signal<DateTime | undefined> (inferred).
			// Actually internalSignal is initialized with value ?? defaultValue.
			// If both undefined, it's Signal<undefined>.

			// If we want to support clearing:
			// if (isValueSignal) (value as Signal<DateTime | undefined>).value = undefined;
			// else internalSignal.value = undefined;
			// onChange?.(undefined);
			return;
		}
		try {
			const dt = new DateTime(val, 'dd/MM/yyyy HH:mm', true);
			// Check validity? DateTime constructor throws if invalid format?
			// Assuming it's valid if no throw.

			if (isValueSignal) {
				(value as Signal<DateTime>).value = dt;
			} else {
				internalSignal.value = dt;
			}
			onChange?.(dt);
		} catch {
			// Ignore invalid dates
		}
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
				<span className='datetime-field__tab-val'>
					{signalValue.value ? signalValue.value.toFormat('dd MMM') : '--'}
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
				<span className='datetime-field__tab-val'>
					{signalValue.value ? signalValue.value.toFormat('HH:mm') : '--:--'}
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
						{...rest}
						type='text'
						placeholder={placeholder || 'DD/MM/YYYY HH:mm'}
						value={inputValue.value}
						onInput={(e) => handleInputChange(e.currentTarget.value)}
						suffix={
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
										value={signalValue.value}
										onChange={(v) => {
											if (v instanceof DateTime) updateDatePart(v);
										}}
										min={min}
										max={max}
										className='datetime-field__calendar'
									/>
								)
								: (
									<div className='datetime-field__clock-wrapper'>
										<TimeClock
											value={signalValue.value}
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
