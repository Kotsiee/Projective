# Selected Codebase Context

> Included paths: ./apps/web/components/fields, ./apps/web/styles/components/fields, ./apps/web/hooks/fields, ./apps/web/components/wrappers, ./packages/types

## Project Tree (Selected)

```text
./apps/web/components/fields/
  fields/
  DateField.tsx
  datetime/
  Calendar.tsx
  TimeClock.tsx
  DateTimeField.tsx
  DynamicField.tsx
  file/
  FileDrop.tsx
  FileListItem.tsx
  PasswordField.tsx
  SelectField.tsx
  SliderField.tsx
  TextField.tsx
  TimeField.tsx
./apps/web/styles/components/fields/
  fields/
  DateField.css
  datetime/
  Calendar.css
  DateTimeField.css
  DropdownField.css
  FileField.css
  FormStages.css
  SelectField.css
  SliderField.css
  TextField.css
  TimeField.css
./apps/web/hooks/fields/
  fields/
  useFileDrop.ts
  useFileProcessor.ts
  useFileSelection.ts
  useSelectState.ts
  useSliderState.ts
  useTextMask.ts
./apps/web/components/wrappers/
  wrappers/
  GlobalFileDrop.tsx
./packages/types/
  types/
  DateTime.ts
  deno.json
  fields/
  form.ts
  select.ts
  slider.ts
  text.ts
  file.ts
  mod.ts
  processing.ts
```

## File Contents

### File: apps\web\components\fields\DateField.tsx

```tsx
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

```

### File: apps\web\components\fields\datetime\Calendar.tsx

```tsx
import '@styles/components/fields/datetime/Calendar.css';
import { useComputed, useSignal } from '@preact/signals';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';
import { getCalendarGrid, getWeekdayLabels } from '@projective/utils';
import { DateTime } from '@projective/types';

// Types for Value: Single Date OR [Start, End]
type DateValue = DateTime | [DateTime | null, DateTime | null];
type CalendarScope = 'days' | 'months' | 'years';

interface CalendarProps {
	value?: DateValue;
	onChange?: (date: DateValue) => void;
	min?: DateTime;
	max?: DateTime;
	startOfWeek?: 0 | 1;
	range?: boolean;
	className?: string;
}

export default function Calendar(props: CalendarProps) {
	// --- State ---
	const initialView = Array.isArray(props.value)
		? (props.value[0] || DateTime.today())
		: (props.value || DateTime.today());

	const viewDate = useSignal(initialView);
	const hoverDate = useSignal<DateTime | null>(null);
	const viewScope = useSignal<CalendarScope>('days');

	// --- Computed Helpers ---

	// Grid for Days view
	const days = useComputed(() =>
		getCalendarGrid(
			viewDate.value,
			props.value,
			hoverDate.value,
			props.min,
			props.max,
			props.startOfWeek ?? 1,
		)
	);

	const weekLabels = getWeekdayLabels(props.startOfWeek ?? 1);

	// Grid for Years view (12 years: previous 1 + current decade + next 1)
	const yearsGrid = useComputed(() => {
		const currentYear = viewDate.value.getYear();
		const startDecade = Math.floor(currentYear / 10) * 10;
		const startYear = startDecade - 1;
		return Array.from({ length: 12 }, (_, i) => startYear + i);
	});

	// Grid for Months view
	const monthsGrid = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];

	// --- Header Label Logic ---
	const headerLabel = useComputed(() => {
		if (viewScope.value === 'days') return viewDate.value.toFormat('MMMM yyyy');
		if (viewScope.value === 'months') return viewDate.value.toFormat('yyyy');
		// Years view
		const start = yearsGrid.value[1]; // First actual year of decade
		const end = yearsGrid.value[10]; // Last actual year of decade
		return `${start} - ${end}`;
	});

	// --- Handlers ---

	const handleNav = (dir: -1 | 1) => {
		if (viewScope.value === 'days') {
			viewDate.value = viewDate.value.add(dir, 'months');
		} else if (viewScope.value === 'months') {
			viewDate.value = viewDate.value.add(dir, 'years');
		} else {
			// Jump 10 years
			viewDate.value = viewDate.value.add(dir * 10, 'years');
		}
	};

	const handleHeaderClick = () => {
		if (viewScope.value === 'days') viewScope.value = 'months';
		else if (viewScope.value === 'months') viewScope.value = 'years';
		// If years, do nothing or cycle back? Usually standard is max zoom at years.
	};

	// Day Selection
	const handleDayClick = (date: DateTime) => {
		if (!props.range) {
			props.onChange?.(date);
			return;
		}

		const currentVal = props.value as [DateTime | null, DateTime | null] || [null, null];
		const [start, end] = currentVal;

		if (!start || (start && end)) {
			props.onChange?.([date, null]);
		} else {
			if (date.isBefore(start)) {
				props.onChange?.([date, start]);
			} else {
				props.onChange?.([start, date]);
			}
		}
	};

	const handleMonthSelect = (monthIndex: number) => {
		// Construct new date keeping year, setting month (1-based), keeping day (clamped)
		const current = viewDate.value;
		const d = new Date(current.getYear(), monthIndex, Math.min(current.getDate(), 28));
		viewDate.value = new DateTime(d);
		viewScope.value = 'days';
	};

	const handleYearSelect = (year: number) => {
		const current = viewDate.value;
		const d = new Date(year, current.getMonth() - 1, current.getDate()); // Month is 0-based in JS Date
		viewDate.value = new DateTime(d);
		viewScope.value = 'months';
	};

	const handleDayHover = (date: DateTime) => {
		if (props.range) hoverDate.value = date;
	};

	// --- Renderers ---

	const renderDays = () => (
		<>
			<div className='calendar__weekdays'>
				{weekLabels.map((day) => <span key={day} className='calendar__weekday'>{day}</span>)}
			</div>
			<div className='calendar__grid calendar__grid--days'>
				{days.value.map((dayItem, idx) => {
					const classes = [
						'calendar__day',
						!dayItem.isCurrentMonth ? 'calendar__day--muted' : '',
						dayItem.isToday ? 'calendar__day--today' : '',
						dayItem.isDisabled ? 'calendar__day--disabled' : '',
						dayItem.isRangeStart ? 'calendar__day--range-start' : '',
						dayItem.isRangeEnd ? 'calendar__day--range-end' : '',
						dayItem.isRangeMiddle ? 'calendar__day--range-middle' : '',
						(!props.range && dayItem.isSelected) ? 'calendar__day--selected' : '',
					].filter(Boolean).join(' ');

					return (
						<button
							key={`${idx}`}
							type='button'
							className={classes}
							disabled={dayItem.isDisabled}
							onClick={(e) => {
								e.preventDefault();
								handleDayClick(dayItem.date);
							}}
							onMouseEnter={() => handleDayHover(dayItem.date)}
						>
							{dayItem.date.getDate()}
						</button>
					);
				})}
			</div>
		</>
	);

	const renderMonths = () => (
		<div className='calendar__grid calendar__grid--months'>
			{monthsGrid.map((m, i) => {
				const isCurrentMonth = (i + 1) === DateTime.today().getMonth() &&
					viewDate.value.getYear() === DateTime.today().getYear();
				const isSelectedMonth = (i + 1) === viewDate.value.getMonth();

				return (
					<button
						key={m}
						type='button'
						className={`calendar__cell-lg ${isCurrentMonth ? 'calendar__cell-lg--today' : ''} ${
							isSelectedMonth ? 'calendar__cell-lg--selected' : ''
						}`}
						onClick={() => handleMonthSelect(i)}
					>
						{m}
					</button>
				);
			})}
		</div>
	);

	const renderYears = () => (
		<div className='calendar__grid calendar__grid--years'>
			{yearsGrid.value.map((y) => {
				const isCurrentYear = y === DateTime.today().getYear();
				const isSelectedYear = y === viewDate.value.getYear();
				const isMuted = y < yearsGrid.value[1] || y > yearsGrid.value[10];

				return (
					<button
						key={y}
						type='button'
						className={`calendar__cell-lg ${isCurrentYear ? 'calendar__cell-lg--today' : ''} ${
							isSelectedYear ? 'calendar__cell-lg--selected' : ''
						} ${isMuted ? 'calendar__cell-lg--muted' : ''}`}
						onClick={() => handleYearSelect(y)}
					>
						{y}
					</button>
				);
			})}
		</div>
	);

	return (
		<div
			className={`calendar ${props.className || ''}`}
			onMouseLeave={() => hoverDate.value = null}
		>
			<div className='calendar__header'>
				<button type='button' className='calendar__nav-btn' onClick={() => handleNav(-1)}>
					<IconChevronLeft size={20} />
				</button>

				<button
					type='button'
					className='calendar__title-btn'
					onClick={handleHeaderClick}
				>
					{headerLabel.value}
				</button>

				<button type='button' className='calendar__nav-btn' onClick={() => handleNav(1)}>
					<IconChevronRight size={20} />
				</button>
			</div>

			<div className='calendar__body'>
				{viewScope.value === 'days' && renderDays()}
				{viewScope.value === 'months' && renderMonths()}
				{viewScope.value === 'years' && renderYears()}
			</div>
		</div>
	);
}

```

### File: apps\web\components\fields\datetime\TimeClock.tsx

```tsx
import { useComputed, useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import '@styles/components/fields/TimeField.css';
import { DateTime } from '@projective/types';
import { getAngleValue, getPosition } from '@projective/utils';

interface TimeClockProps {
	value?: DateTime;
	onChange?: (date: DateTime) => void;
	// If true, just H:M (24h or 12h config)
}

type ViewMode = 'hours' | 'minutes';

export default function TimeClock(props: TimeClockProps) {
	const date = props.value || DateTime.now();

	// Internal signals for immediate UI feedback
	const mode = useSignal<ViewMode>('hours');
	const isPm = useSignal(date.getHour() >= 12);

	// 12-hour format logic
	const hours12 = date.getHour() % 12 || 12;
	const minutes = date.getMinute();

	const clockRef = useRef<HTMLDivElement>(null);
	const isDragging = useSignal(false);

	// --- Handlers ---

	const handlePointer = (e: PointerEvent, isFinish: boolean) => {
		if (!clockRef.current) return;

		const rect = clockRef.current.getBoundingClientRect();
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const x = e.clientX - rect.left - centerX;
		const y = e.clientY - rect.top - centerY;

		const steps = mode.value === 'hours' ? 12 : 60;
		let val = getAngleValue(x, y, steps);

		// Create new date based on change
		const newDate = date.clone(); // Assume clone exists or we recreate
		const currentH = newDate.getHour();

		if (mode.value === 'hours') {
			// Logic to preserve AM/PM
			// If val is 12, and isPm, it's 12. If !isPm, it's 0.
			// If val is 1-11, and isPm, val+12.
			let h24 = val;
			if (val === 12) h24 = 0;
			if (isPm.value) h24 += 12;

			// Fix: 12 PM is 12, 12 AM is 0.
			// Simplify: Just convert 1-12 visual to 0-23
			if (isPm.value && val < 12) val += 12;
			if (!isPm.value && val === 12) val = 0;

			// Update Date using delta logic or setter
			// Since DateTime is immutable in your spec, we rely on props.onChange handling the object replacement
			// But here we need to emit the *new* object.
			// We can use a raw Date constructor for the emitted value if DateTime doesn't have setters

			const d = new Date(date.getTime());
			d.setHours(val);
			props.onChange?.(new DateTime(d));

			// Auto-switch to minutes on release
			if (isFinish) mode.value = 'minutes';
		} else {
			const d = new Date(date.getTime());
			d.setMinutes(val);
			props.onChange?.(new DateTime(d));
		}
	};

	const toggleAmPm = (pm: boolean) => {
		isPm.value = pm;
		let h = date.getHour();
		if (pm && h < 12) h += 12;
		if (!pm && h >= 12) h -= 12;

		const d = new Date(date.getTime());
		d.setHours(h);
		props.onChange?.(new DateTime(d));
	};

	// --- Rendering Helpers ---

	const renderFace = () => {
		const total = mode.value === 'hours' ? 12 : 12; // Draw 12 numbers even for minutes (5, 10...)
		const numbers = [];
		const radius = 100; // px

		for (let i = 1; i <= total; i++) {
			const val = mode.value === 'hours' ? i : i * 5;
			const pos = getPosition(i, 12, radius); // 12 segments

			// Highlight check
			let isActive = false;
			if (mode.value === 'hours') isActive = hours12 === i;
			else isActive = Math.round(minutes / 5) * 5 === val || (val === 60 && minutes === 0);

			numbers.push(
				<div
					key={i}
					className={`clock__number ${isActive ? 'clock__number--active' : ''}`}
					style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
				>
					{val === 60 ? '00' : val}
				</div>,
			);
		}

		// The "Hand" line
		const currentVal = mode.value === 'hours' ? hours12 : minutes;
		const handSteps = mode.value === 'hours' ? 12 : 60;
		const handPos = getPosition(
			currentVal === 0 && mode.value === 'hours' ? 12 : currentVal,
			handSteps,
			radius,
		);

		return (
			<div
				className='clock__face'
				ref={clockRef}
				onPointerDown={(e) => {
					e.preventDefault();
					clockRef.current?.setPointerCapture(e.pointerId);
					isDragging.value = true;
					handlePointer(e, false);
				}}
				onPointerMove={(e) => {
					if (isDragging.value) handlePointer(e, false);
				}}
				onPointerUp={(e) => {
					clockRef.current?.releasePointerCapture(e.pointerId);
					isDragging.value = false;
					handlePointer(e, true);
				}}
			>
				<div className='clock__center-dot'></div>
				<div
					className='clock__hand'
					style={{
						height: `${radius}px`,
						transform: `rotate(${Math.atan2(handPos.y, handPos.x) * (180 / Math.PI) + 90}deg)`,
					}}
				>
					<div className='clock__hand-knob'></div>
				</div>
				{numbers}
			</div>
		);
	};

	return (
		<div className='time-clock'>
			{/* Header Display */}
			<div className='time-clock__header'>
				<div className='time-clock__digital'>
					<button
						type='button'
						className={`time-clock__val ${mode.value === 'hours' ? 'time-clock__val--active' : ''}`}
						onClick={() => mode.value = 'hours'}
					>
						{hours12.toString().padStart(2, '0')}
					</button>
					<span className='time-clock__sep'>:</span>
					<button
						type='button'
						className={`time-clock__val ${
							mode.value === 'minutes' ? 'time-clock__val--active' : ''
						}`}
						onClick={() => mode.value = 'minutes'}
					>
						{minutes.toString().padStart(2, '0')}
					</button>
				</div>

				<div className='time-clock__ampm'>
					<button
						type='button'
						className={`time-clock__meridiem ${!isPm.value ? 'time-clock__meridiem--active' : ''}`}
						onClick={() => toggleAmPm(false)}
					>
						AM
					</button>
					<button
						type='button'
						className={`time-clock__meridiem ${isPm.value ? 'time-clock__meridiem--active' : ''}`}
						onClick={() => toggleAmPm(true)}
					>
						PM
					</button>
				</div>
			</div>

			{/* The Dial */}
			<div className='time-clock__body'>
				{renderFace()}
			</div>
		</div>
	);
}

```

### File: apps\web\components\fields\DateTimeField.tsx

```tsx
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

```

### File: apps\web\components\fields\DynamicField.tsx

```tsx
const FIELD_REGISTRY = {
	//   text: TextField,
	//   email: TextField,
	//   select: SelectField,
	//   slider: SliderField,
};

export function DynamicField(props: FieldSchema) {
	const Component = FIELD_REGISTRY[props.type];

	if (!Component) return null;

	return <Component {...props} />;
}

```

### File: apps\web\components\fields\file\FileDrop.tsx

```tsx
import '@styles/components/fields/FileField.css';
import { useRef } from 'preact/hooks';
import { IconUpload } from '@tabler/icons-preact';
import { FileFieldProps } from '@projective/types';
import { useFileSelection } from '@hooks/fields/useFileSelection.ts';
import { useFileProcessor } from '@hooks/fields/useFileProcessor.ts';
import { useFileDrop } from '@hooks/fields/useFileDrop.ts';
import { formatBytes } from '@projective/shared';
import FileListItem from './FileListItem.tsx';

interface ExtendedFileProps extends FileFieldProps {
	layout?: 'list' | 'grid';
}

export default function FileDrop(props: ExtendedFileProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const layout = props.layout || 'list';

	const { files, addFiles, removeFile, updateFile } = useFileSelection({
		multiple: props.multiple,
		maxFiles: props.maxFiles,
		maxSize: props.maxSize,
		accept: props.accept,
		onChange: props.onChange,
	});

	// --- NEW: Processor Engine ---
	useFileProcessor({
		files: files.value,
		processors: props.processors,
		updateFile,
	});

	const { isDragActive, dropProps } = useFileDrop({
		onDrop: (droppedFiles) => addFiles(droppedFiles),
		disabled: props.disabled,
	});

	const handleBrowseClick = () => {
		if (!props.disabled) inputRef.current?.click();
	};

	const handleInputChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (target.files?.length) addFiles(Array.from(target.files));
		target.value = '';
	};

	const dropClasses = [
		'file-drop',
		isDragActive.value ? 'file-drop--active' : '',
		props.disabled ? 'file-drop--disabled' : '',
		props.error ? 'file-drop--error' : '',
		props.className,
	].filter(Boolean).join(' ');

	return (
		<div className='file-field'>
			{props.label && (
				<label className='file-field__label'>
					{props.label} {props.required && <span className='file-field__req'>*</span>}
				</label>
			)}

			<div {...dropProps} className={dropClasses} onClick={handleBrowseClick}>
				<input
					ref={inputRef}
					type='file'
					className='file-drop__input'
					multiple={props.multiple}
					accept={props.accept}
					onChange={handleInputChange}
					disabled={props.disabled}
				/>
				<div className='file-drop__content'>
					<div className='file-drop__icon'>
						<IconUpload size={24} />
					</div>
					<div className='file-drop__text'>{props.dropzoneLabel || 'Click or Drag'}</div>
					<div className='file-drop__hint'>
						{props.accept} {props.maxSize && `(Max ${formatBytes(props.maxSize)})`}
					</div>
				</div>
			</div>

			{files.value.length > 0 && (
				<div className={`file-list-wrapper file-list-wrapper--${layout}`}>
					{files.value.map((item) => (
						<FileListItem key={item.id} item={item} onRemove={removeFile} layout={layout} />
					))}
				</div>
			)}

			{props.error && <div className='file-field__msg-error'>{props.error}</div>}
		</div>
	);
}

```

### File: apps\web\components\fields\file\FileListItem.tsx

```tsx
import { IconCheck, IconFile, IconLoader2, IconPhoto, IconX } from '@tabler/icons-preact';
import { formatBytes } from '@projective/shared';
import { FileWithMeta } from '@projective/types';

interface FileListItemProps {
	item: FileWithMeta;
	onRemove: (id: string) => void;
	layout?: 'list' | 'grid';
}

export default function FileListItem({ item, onRemove, layout = 'list' }: FileListItemProps) {
	const isError = item.status === 'error';
	const isProcessing = item.status === 'processing';
	const isReady = item.status === 'ready';

	const renderThumbnail = () => {
		if (isProcessing) {
			return (
				<div className='file-item__loader'>
					<IconLoader2 size={24} className='file-item__spin' />
				</div>
			);
		}
		if (item.preview) return <img src={item.preview} alt='' className='file-item__img' />;
		if (item.file.type.includes('image')) return <IconPhoto size={24} />;
		return <IconFile size={24} />;
	};

	const renderStatus = () => {
		if (isProcessing) {
			return <span className='file-item__status'>Processing {Math.round(item.progress)}%</span>;
		}
		if (isReady && item.processingMeta?.optimization) {
			return <span className='file-item__success'>{item.processingMeta.optimization}</span>;
		}
		return null;
	};

	if (layout === 'grid') {
		return (
			<div className={`file-card ${isError ? 'file-card--error' : ''}`}>
				<div className='file-card__preview'>
					{renderThumbnail()}
					<button type='button' className='file-card__remove' onClick={() => onRemove(item.id)}>
						<IconX size={14} />
					</button>
					{isProcessing && (
						<div className='file-card__progress-bar'>
							<div style={{ width: `${item.progress}%` }} />
						</div>
					)}
				</div>
				<div className='file-card__info'>
					<div className='file-card__name'>{item.file.name}</div>
					<div className='file-card__meta'>
						{isError ? item.errors[0].message : formatBytes(item.file.size)}
					</div>
					{renderStatus()}
				</div>
			</div>
		);
	}

	return (
		<div className={`file-item ${isError ? 'file-item--error' : ''}`}>
			<div className='file-item__preview'>{renderThumbnail()}</div>

			<div className='file-item__info'>
				<div className='file-item__header'>
					<span className='file-item__name'>{item.file.name}</span>
					{isReady && !item.processingMeta && <IconCheck size={14} className='file-item__check' />}
				</div>

				<div className='file-item__meta'>
					{formatBytes(item.file.size)}
					{isError && <span className='file-item__error-text'>• {item.errors[0].message}</span>}
					{renderStatus()}
				</div>

				{isProcessing && (
					<div className='file-item__progress-track'>
						<div className='file-item__progress-fill' style={{ width: `${item.progress}%` }} />
					</div>
				)}
			</div>

			<button type='button' className='file-item__remove' onClick={() => onRemove(item.id)}>
				<IconX size={16} />
			</button>
		</div>
	);
}

```

### File: apps\web\components\fields\PasswordField.tsx

```tsx
import { InputHTMLAttributes } from 'preact';
import '@styles/components/fields/TextField.css';
import { IconEye, IconEyeClosed } from '@tabler/icons-preact';
import { signal } from '@preact/signals';

const type = signal<boolean>(true);

export default function PasswordField(props: InputHTMLAttributes<HTMLInputElement>) {
	const toggleVisibility = () => {
		type.value = !type.value;
	};

	return (
		<span class='password-field'>
			<input type={type.value ? 'password' : 'text'} {...props} />
			<button
				type='button'
				onClick={toggleVisibility}
				class='password-field__toggle-visibility'
			>
				{type.value ? <IconEyeClosed /> : <IconEye />}
			</button>
		</span>
	);
}

```

### File: apps\web\components\fields\SelectField.tsx

```tsx
import '@styles/components/fields/SelectField.css';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { IconCheck, IconChevronDown, IconLoader2, IconSelector, IconX } from '@tabler/icons-preact';
import { useSelectState } from '@hooks/fields/useSelectState.ts';
import { BaseFieldProps, SelectFieldConfig, SelectOption } from '@projective/types';

interface SelectFieldProps extends BaseFieldProps, SelectFieldConfig {
	options: SelectOption[];
}

export default function SelectField(props: SelectFieldProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// FIX 1: Ref to track if the highlight change was caused by the mouse
	const preventScrollRef = useRef(false);

	const [menuPosition, setMenuPosition] = useState<'down' | 'up'>('down');

	const sortedOptions = useMemo(() => {
		return [...props.options].sort((a, b) => {
			if (!a.group && !b.group) return 0;
			if (!a.group) return -1;
			if (!b.group) return 1;
			return a.group.localeCompare(b.group);
		});
	}, [props.options]);

	const {
		isOpen,
		highlightedIndex,
		searchQuery,
		setSearchQuery,
		filteredOptions,
		selectedValues,
		toggleSelectAll,
		selectOption,
		removeValue,
		handleKeyDown,
		toggleOpen,
	} = useSelectState({
		options: sortedOptions,
		value: props.value,
		onChange: props.onChange,
		multiple: props.multiple,
		disabled: props.disabled,
	});

	const isValueSelected = (optionValue: string | number) => {
		return selectedValues.some((val) => String(val) === String(optionValue));
	};

	useEffect(() => {
		if (isOpen.value && containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const spaceBelow = globalThis.innerHeight - rect.bottom;
			setMenuPosition(spaceBelow < 250 ? 'up' : 'down');

			if (inputRef.current) inputRef.current.focus();

			// FIX 2: Only scroll if the change WAS NOT caused by mouse hover
			if (listRef.current && !preventScrollRef.current) {
				const selectedEl = listRef.current.querySelector(
					'.select-field__option--selected, .select-field__option--highlighted',
				);
				if (selectedEl) {
					// 'nearest' ensures minimal movement if already visible
					selectedEl.scrollIntoView({ block: 'nearest' });
				}
			}

			// Always reset the flag after the render cycle
			preventScrollRef.current = false;
		}
	}, [isOpen.value, highlightedIndex.value]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				toggleOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [toggleOpen]);

	const getStatusIcon = () => {
		if (props.loading) {
			return props.icons?.loading || <IconLoader2 size={18} className='select-field__spin' />;
		}
		if (props.error && props.icons?.invalid) return props.icons.invalid;
		if (props.success && props.icons?.valid) return props.icons.valid;
		if (isOpen.value) return props.icons?.arrowOpen || <IconChevronDown size={18} />;
		return props.icons?.arrow || <IconChevronDown size={18} />;
	};

	const renderChips = () => {
		return selectedValues.map((val) => {
			const opt = props.options.find((o) => String(o.value) === String(val));
			if (!opt) return null;
			return (
				<span key={val} className='select-field__chip'>
					{opt.label}
					<span
						className='select-field__chip-remove'
						onMouseDown={(e) => {
							e.preventDefault();
							e.stopPropagation();
							removeValue(val);
						}}
					>
						<IconX size={14} />
					</span>
				</span>
			);
		});
	};

	const renderSelectionContent = () => {
		if (props.displayMode === 'count' && selectedValues.length > 0) {
			return <span className='select-field__summary'>{selectedValues.length} selected</span>;
		}

		if (props.multiple && (!props.displayMode || props.displayMode === 'chips-inside')) {
			return <>{renderChips()}</>;
		}

		if (!props.multiple && selectedValues.length > 0 && searchQuery.value === '') {
			const opt = props.options.find((o) => String(o.value) === String(selectedValues[0]));
			return opt ? <div className='select-field__single-value'>{opt.label}</div> : null;
		}

		return null;
	};

	const renderDropdownContent = () => {
		if (filteredOptions.value.length === 0) {
			return <div className='select-field__no-options'>No options found</div>;
		}

		let lastGroup: string | undefined = undefined;

		return filteredOptions.value.map((option, index) => {
			const isSelected = isValueSelected(option.value);
			const isHighlighted = index === highlightedIndex.value;
			const showHeader = option.group !== lastGroup;
			lastGroup = option.group;

			return (
				<div key={option.value}>
					{showHeader && option.group && (
						<div className='select-field__group-label'>{option.group}</div>
					)}

					<div
						role='option'
						aria-selected={isSelected}
						className={`select-field__option 
                 ${isSelected ? 'select-field__option--selected' : ''} 
                 ${isHighlighted ? 'select-field__option--highlighted' : ''}
                 ${option.disabled ? 'select-field__option--disabled' : ''}
               `}
						onClick={(e) => {
							e.stopPropagation();
							selectOption(option);
							if (!props.multiple) {
								setSearchQuery('');
								toggleOpen(false);
							}
						}}
						// FIX 3: Flag that this update came from the mouse
						onMouseEnter={() => {
							if (highlightedIndex.value !== index) {
								preventScrollRef.current = true;
								highlightedIndex.value = index;
							}
						}}
						// Optional: Using onMouseMove can sometimes feel snappier
						// if the user moves pixel-by-pixel, but onMouseEnter is standard.
					>
						<div className='select-field__opt-content'>
							{option.icon && <span className='select-field__icon'>{option.icon}</span>}
							{option.avatarUrl && <img src={option.avatarUrl} className='select-field__avatar' />}
							<span>{option.label}</span>
						</div>
						{isSelected && <IconCheck size={16} className='select-field__check' />}
					</div>
				</div>
			);
		});
	};

	const containerClasses = [
		'select-field',
		props.className,
		isOpen.value ? 'select-field--open' : '',
		props.disabled ? 'select-field--disabled' : '',
		props.error ? 'select-field--error' : '',
		props.success ? 'select-field--success' : '',
		`select-field--pos-${menuPosition}`,
	].filter(Boolean).join(' ');

	const areAllEnabledSelected = (() => {
		if (!props.multiple) return false;
		const enabledOptions = filteredOptions.value.filter((o) => !o.disabled);
		if (enabledOptions.length === 0) return false;
		return enabledOptions.every((o) => isValueSelected(o.value));
	})();

	return (
		<div className={containerClasses} ref={containerRef}>
			{props.label && (
				<label className='select-field__label' htmlFor={props.id}>
					{props.label} {props.required && <span className='select-field__req'>*</span>}
				</label>
			)}

			<div
				className='select-field__wrapper'
				onMouseDown={(e) => {
					if (e.target !== inputRef.current) {
						e.preventDefault();
						inputRef.current?.focus();
						toggleOpen();
					}
				}}
			>
				<div className='select-field__content'>
					{renderSelectionContent()}

					<input
						ref={inputRef}
						id={props.id}
						className='select-field__input'
						type='text'
						value={searchQuery.value}
						placeholder={selectedValues.length === 0 ? props.placeholder : ''}
						onInput={(e) => setSearchQuery(e.currentTarget.value)}
						onKeyDown={handleKeyDown}
						onClick={(e) => {
							e.stopPropagation();
							toggleOpen(true);
						}}
						onFocus={() => toggleOpen(true)}
						disabled={props.disabled}
						readOnly={!props.searchable}
						style={{
							opacity: (!props.multiple && selectedValues.length > 0 && !searchQuery.value) ? 0 : 1,
						}}
					/>
				</div>

				<div className='select-field__indicators'>
					{!props.loading && props.clearable && selectedValues.length > 0 && (
						<button
							type='button'
							className='select-field__clear'
							onMouseDown={(e) => {
								e.stopPropagation();
								setSearchQuery('');
								props.onChange?.(props.multiple ? [] : null);
							}}
						>
							<IconX size={16} />
						</button>
					)}

					<div
						className={`select-field__arrow ${
							isOpen.value && !props.loading ? 'select-field__arrow--flip' : ''
						}`}
					>
						{getStatusIcon()}
					</div>
				</div>
			</div>

			{props.multiple && props.displayMode === 'chips-below' && selectedValues.length > 0 && (
				<div className='select-field__chips-external'>
					{renderChips()}
				</div>
			)}

			{isOpen.value && !props.disabled && (
				<div
					className='select-field__menu'
					ref={listRef}
					role='listbox'
					onMouseDown={(e) => e.preventDefault()}
				>
					{props.multiple && props.enableSelectAll && filteredOptions.value.length > 0 && (
						<div
							className='select-field__action-bar'
							onClick={(e) => {
								e.stopPropagation();
								toggleSelectAll();
							}}
						>
							<IconSelector size={16} />
							<span>
								{areAllEnabledSelected ? 'Deselect All' : 'Select All'}
							</span>
						</div>
					)}

					{renderDropdownContent()}
				</div>
			)}

			{props.error && <div className='select-field__msg-error'>{props.error}</div>}
		</div>
	);
}

```

### File: apps\web\components\fields\SliderField.tsx

```tsx
import '@styles/components/fields/SliderField.css';
import { valueToPercent, valueToPercentLog } from '@projective/utils';
import { useSliderState } from '@hooks/fields/useSliderState.ts';
import {
	SliderFieldProps,
	SliderMark,
	TooltipPosition,
	TooltipVisibility,
} from '@projective/types';

export default function SliderField(props: SliderFieldProps) {
	const min = props.min ?? 0;
	const max = props.max ?? 100;
	const step = props.step ?? 1;

	const {
		trackRef,
		internalValues,
		activeHandleIdx,
		handleStyles,
		trackFillStyle,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		handleTrackClick,
	} = useSliderState({
		value: props.value,
		onChange: props.onChange,
		min,
		max,
		step,
		range: props.range,
		disabled: props.disabled,
		marks: props.marks,
		snapToMarks: props.snapToMarks,
		vertical: props.vertical,
		scale: props.scale,
		minDistance: props.minDistance,
		passthrough: props.passthrough, // Pass to hook
	});

	// --- Tooltip Config Resolution ---
	const tooltipConfig = props.tooltip
		? {
			enabled: true,
			format: (typeof props.tooltip === 'object' && props.tooltip.format)
				? props.tooltip.format
				: (val: number) => val.toFixed(step % 1 !== 0 ? 1 : 0),
			position: (typeof props.tooltip === 'object' && props.tooltip.position)
				? props.tooltip.position
				: (props.vertical ? 'right' : 'top') as TooltipPosition,
			visibility: (typeof props.tooltip === 'object' && props.tooltip.visibility)
				? props.tooltip.visibility
				: 'hover' as TooltipVisibility,
		}
		: { enabled: false, format: (v: number) => '', position: 'top', visibility: 'hover' };

	const renderMarks = () => {
		if (!props.marks) return null;
		let points: SliderMark[] = [];
		if (Array.isArray(props.marks)) {
			points = props.marks.map((m) => typeof m === 'number' ? { value: m } : m);
		} else if (props.marks === true) {
			if (props.scale === 'logarithmic') return null;
			const count = (max - min) / step;
			if (count > 100) return null;
			for (let i = min; i <= max; i += step) points.push({ value: i });
		}

		return (
			<div className='slider-field__marks'>
				{points.map((mark, i) => {
					const pct = props.scale === 'logarithmic'
						? valueToPercentLog(mark.value, min, max)
						: valueToPercent(mark.value, min, max);
					if (pct < 0 || pct > 100) return null;

					const style = props.vertical
						? { bottom: `${pct}%`, left: '50%' }
						: { left: `${pct}%`, top: '50%' };

					return (
						<div key={i} className='slider-field__mark' style={style}>
							<div className='slider-field__mark-tick'></div>
							{mark.label && <div className='slider-field__mark-label'>{mark.label}</div>}
						</div>
					);
				})}
			</div>
		);
	};

	const containerClasses = [
		'slider-field',
		props.className,
		props.disabled ? 'slider-field--disabled' : '',
		props.range ? 'slider-field--range' : '',
		props.marks ? 'slider-field--has-marks' : '',
		props.vertical ? 'slider-field--vertical' : '',
	].filter(Boolean).join(' ');

	const wrapperStyle = props.vertical && props.height ? { height: props.height } : {};

	return (
		<div className={containerClasses}>
			{props.label && (
				<div className='slider-field__header'>
					<label className='slider-field__label' htmlFor={props.id}>
						{props.label} {props.required && <span className='slider-field__req'>*</span>}
					</label>
				</div>
			)}

			<div className='slider-field__control' style={wrapperStyle}>
				<div
					className='slider-field__track-container'
					ref={trackRef}
					onClick={(e: MouseEvent) => handleTrackClick(e as PointerEvent)}
				>
					<div className='slider-field__rail'></div>
					<div className='slider-field__track' style={trackFillStyle.value}></div>

					{renderMarks()}

					{handleStyles.value.map((style, index) => {
						const isActive = activeHandleIdx.value === index;
						const val = internalValues.value[index];

						return (
							<div
								key={index}
								className={`slider-field__handle ${isActive ? 'slider-field__handle--active' : ''}`}
								style={style}
								tabIndex={props.disabled ? -1 : 0}
								role='slider'
								aria-orientation={props.vertical ? 'vertical' : 'horizontal'}
								aria-valuemin={min}
								aria-valuemax={max}
								aria-valuenow={val}
								onPointerDown={(e) => handlePointerDown(index, e)}
								onPointerMove={handlePointerMove}
								onPointerUp={handlePointerUp}
								onContextMenu={(e) => e.preventDefault()}
							>
								<div className='slider-field__handle-knob'></div>

								{tooltipConfig.enabled && (
									<div
										className={`
                      slider-field__tooltip 
                      slider-field__tooltip--${tooltipConfig.position}
                      slider-field__tooltip--${tooltipConfig.visibility}
                    `}
									>
										{tooltipConfig.format(val)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{props.error && <div className='slider-field__msg-error'>{props.error}</div>}
			{props.hint && !props.error && <div className='slider-field__msg-hint'>{props.hint}</div>}
		</div>
	);
}

```

### File: apps\web\components\fields\TextField.tsx

```tsx
// deno-lint-ignore-file no-explicit-any
import '@styles/components/fields/TextField.css';
import { useSignal } from '@preact/signals';
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import {
	IconCreditCard,
	IconCurrencyDollar,
	IconEye,
	IconEyeOff,
	IconX,
} from '@tabler/icons-preact';
import { TextFieldProps } from '@projective/types';
import { useTextMask } from '@hooks/fields/useTextMask.ts';
import { formatCurrency, isValidCreditCard, parseNumber } from '@projective/shared';

export default function TextField(props: TextFieldProps) {
	const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
	const isFocused = useSignal(false);
	const isPasswordVisible = useSignal(false);
	const internalError = useSignal<string>('');

	// --- Variant Logic ---
	const isCurrency = props.variant === 'currency';
	const isCreditCard = props.variant === 'credit-card';

	const activeMask = isCreditCard ? (props.mask || '9999 9999 9999 9999') : props.mask;
	const activeInputMode = isCurrency ? 'decimal' : (isCreditCard ? 'numeric' : props.inputMode);
	const activeIconLeft = isCreditCard && !props.prefix && !props.iconLeft
		? <IconCreditCard size={18} />
		: (isCurrency && !props.prefix && !props.iconLeft
			? <IconCurrencyDollar size={18} />
			: props.iconLeft);

	// --- Value Management ---
	const rawValue = props.value?.toString() || '';
	const displayValue = useSignal(rawValue);

	useEffect(() => {
		if (!isFocused.value) {
			if (isCurrency && rawValue) {
				displayValue.value = formatCurrency(rawValue);
			} else {
				displayValue.value = rawValue;
			}
		}
	}, [rawValue, isCurrency]);

	// --- Hooks ---
	const { handleMaskInput } = useTextMask({
		mask: activeMask,
		value: displayValue.value,
		onChange: (val) => {
			displayValue.value = val;
			props.onChange?.(val);
		},
		ref: inputRef,
	});

	// --- Handlers ---
	const handleInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const val = target.value;

		if (activeMask && !props.multiline) {
			handleMaskInput(e);
			return;
		}

		displayValue.value = val;

		if (isCurrency) {
			props.onChange?.(parseNumber(val));
		} else {
			props.onChange?.(val);
		}

		if (props.multiline) handleAutoGrow();
	};

	const handleFocus = (e: FocusEvent) => {
		isFocused.value = true;
		if (isCurrency) displayValue.value = parseNumber(rawValue);
		props.onFocus?.(e);
	};

	const handleBlur = (e: FocusEvent) => {
		isFocused.value = false;
		if (isCurrency) displayValue.value = formatCurrency(rawValue);
		if (isCreditCard) {
			internalError.value = (rawValue.length > 0 && !isValidCreditCard(rawValue))
				? 'Invalid card number'
				: '';
		}
		props.onBlur?.(e);
	};

	const handleAutoGrow = () => {
		if (props.multiline && props.autoGrow && inputRef.current) {
			const el = inputRef.current;
			el.style.height = 'auto';
			el.style.height = `${el.scrollHeight}px`;
		}
	};

	useLayoutEffect(() => {
		if (props.multiline && props.autoGrow) handleAutoGrow();
	}, [displayValue.value, props.multiline, props.autoGrow]);

	// --- Render ---
	const currentType = props.type === 'password' && isPasswordVisible.value
		? 'text'
		: (props.type || 'text');

	const shouldFloat = isFocused.value || displayValue.value.length > 0 || !!props.placeholder;
	const activeError = internalError.value || props.error;

	const containerClasses = [
		'text-field',
		props.className,
		activeError ? 'text-field--error' : '',
		props.success ? 'text-field--success' : '',
		props.disabled ? 'text-field--disabled' : '',
		props.floatingLabel ? 'text-field--floating' : '',
		shouldFloat ? 'text-field--active' : '',
		props.multiline ? 'text-field--multiline' : '',
		props.autoGrow ? 'text-field--auto-grow' : '', // Explicit class for CSS
	].filter(Boolean).join(' ');

	return (
		<div className={containerClasses}>
			{props.label && (
				<label className='text-field__label' htmlFor={props.id}>
					{props.label} {props.required && <span className='text-field__req'>*</span>}
				</label>
			)}

			<div className='text-field__wrapper'>
				{(props.prefix || activeIconLeft) && (
					<div className='text-field__addon text-field__addon--left'>
						{props.prefix || activeIconLeft}
					</div>
				)}

				{props.multiline
					? (
						<textarea
							ref={inputRef as any}
							id={props.id}
							className='text-field__input text-field__input--textarea'
							value={displayValue.value}
							placeholder={props.floatingLabel && !isFocused.value ? '' : props.placeholder}
							disabled={props.disabled}
							readOnly={props.readonly}
							maxLength={props.maxLength}
							rows={props.rows || 3}
							onInput={handleInput}
							onFocus={handleFocus}
							onBlur={handleBlur}
							onKeyDown={props.onKeyDown}
						/>
					)
					: (
						<input
							ref={inputRef as any}
							id={props.id}
							className='text-field__input'
							type={currentType}
							inputMode={activeInputMode}
							value={displayValue.value}
							placeholder={props.floatingLabel && !isFocused.value ? '' : props.placeholder}
							disabled={props.disabled}
							readOnly={props.readonly}
							maxLength={props.maxLength}
							onInput={handleInput}
							onFocus={handleFocus}
							onBlur={handleBlur}
							onKeyDown={props.onKeyDown}
						/>
					)}

				<div className='text-field__actions'>
					{props.clearable && displayValue.value.length > 0 && !props.disabled && !props.readonly &&
						(
							<button
								type='button'
								className='text-field__action-btn'
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									props.onChange?.('');
									displayValue.value = '';
									inputRef.current?.focus();
								}}
								tabIndex={-1}
								aria-label='Clear'
							>
								<IconX size={16} />
							</button>
						)}

					{!props.multiline && props.type === 'password' && props.showPasswordToggle &&
						!props.disabled && (
						<button
							type='button'
							className='text-field__action-btn'
							onClick={() => isPasswordVisible.value = !isPasswordVisible.value}
							tabIndex={-1}
						>
							{isPasswordVisible.value ? <IconEyeOff size={18} /> : <IconEye size={18} />}
						</button>
					)}

					{(props.suffix || props.iconRight) && (
						<div className='text-field__addon text-field__addon--right'>
							{props.suffix || props.iconRight}
						</div>
					)}
				</div>
			</div>

			<div className='text-field__footer'>
				<div className='text-field__messages'>
					{activeError && <span className='text-field__msg-error'>{activeError}</span>}
					{props.hint && !activeError && <span className='text-field__msg-hint'>{props.hint}</span>}
				</div>

				{props.showCount && props.maxLength && (
					<div className='text-field__counter'>
						{displayValue.value.length} / {props.maxLength}
					</div>
				)}
			</div>
		</div>
	);
}

```

### File: apps\web\components\fields\TimeField.tsx

```tsx
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

```

### File: apps\web\styles\components\fields\DateField.css

```css
.date-field {
    width: 100%;
}

.date-field__icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--input-placeholder, #9ca3af);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    border-radius: 4px;
    transition: color 0.2s, background 0.2s;
}

.date-field__icon-btn:hover {
    color: var(--input-text, #111827);
    background-color: var(--input-bg-hover, #f3f4f6);
}

.date-field__calendar-wrapper {
    padding: 0;
    /* Calendar component handles its own padding, 
     but popover wrapper might need overflow control */
    overflow: hidden;
    background: var(--dropdown-bg);
    border-radius: var(--input-radius);
}
```

### File: apps\web\styles\components\fields\datetime\Calendar.css

```css
/* --- Base --- */
.calendar {
  display: flex;
  flex-direction: column;
  width: 320px;
  background-color: var(--dropdown-bg, #ffffff);
  border: 1px solid var(--input-border, #d1d5db);
  border-radius: var(--input-radius, 0.5rem);
  padding: 1rem;
  user-select: none;
  font-family: inherit;
}

/* --- Header --- */
.calendar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  height: 32px;
}

/* Changed from span to button for interactivity */
.calendar__title-btn {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--input-text, #111827);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.calendar__title-btn:hover {
  background-color: #f3f4f6;
}

.calendar__nav-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}

.calendar__nav-btn:hover {
  background-color: #f3f4f6;
  color: var(--input-text, #111827);
}

/* --- Body Wrapper --- */
.calendar__body {
  min-height: 240px;
  /* Prevents jumping height between views */
}

/* --- Weekdays --- */
.calendar__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 0.5rem;
  text-align: center;
}

.calendar__weekday {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
}

/* --- Grids --- */

/* Days: 7 columns */
.calendar__grid--days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

/* Months/Years: 3 columns */
.calendar__grid--months,
.calendar__grid--years {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  height: 100%;
}

/* --- Day Cell (Small) --- */
.calendar__day {
  height: 2.25rem;
  width: 100%;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: var(--input-text, #111827);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
}

.calendar__day:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.calendar__day--muted {
  color: #d1d5db;
}

.calendar__day--today {
  font-weight: 700;
  color: var(--fill-bg, #3b82f6);
}

.calendar__day--selected {
  background-color: var(--fill-bg, #3b82f6) !important;
  color: #ffffff !important;
}

.calendar__day--disabled {
  opacity: 0.3;
  cursor: not-allowed;
  text-decoration: line-through;
}

/* Range Styling */
.calendar__day--range-start {
  background-color: var(--fill-bg, #3b82f6);
  color: #ffffff;
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.calendar__day--range-end {
  background-color: var(--fill-bg, #3b82f6);
  color: #ffffff;
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.calendar__day--range-start.calendar__day--range-end {
  border-radius: 0.375rem;
}

.calendar__day--range-middle {
  background-color: rgba(59, 130, 246, 0.15);
  border-radius: 0;
}

.calendar__day--range-middle:hover {
  background-color: rgba(59, 130, 246, 0.25);
}


/* --- Large Cells (Month/Year) --- */
.calendar__cell-lg {
  height: 3.5rem;
  width: 100%;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  color: var(--input-text, #111827);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
}

.calendar__cell-lg:hover {
  background-color: #f3f4f6;
  border-color: #e5e7eb;
}

.calendar__cell-lg--today {
  font-weight: 700;
  color: var(--fill-bg, #3b82f6);
  border-color: var(--fill-bg, #3b82f6);
}

.calendar__cell-lg--selected {
  background-color: var(--fill-bg, #3b82f6) !important;
  color: #ffffff !important;
}

.calendar__cell-lg--muted {
  color: #d1d5db;
}
```

### File: apps\web\styles\components\fields\DateTimeField.css

```css
.datetime-field {
    width: 100%;
}

.datetime-field__icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--input-placeholder, #9ca3af);
    display: flex;
    align-items: center;
    padding: 2px;
    border-radius: 4px;
}

.datetime-field__icon-btn:hover {
    background-color: var(--input-bg-hover, #f3f4f6);
    color: var(--input-text);
}

/* --- Popup Structure --- */
.datetime-field__popup {
    background: var(--dropdown-bg, #ffffff);
    border-radius: var(--input-radius, 0.5rem);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    width: 320px;
    /* Consistent width for both views */
}

/* --- Tabs --- */
.datetime-field__tabs {
    display: flex;
    border-bottom: 1px solid var(--input-border, #e5e7eb);
    background-color: #f9fafb;
}

.datetime-field__tab {
    flex: 1;
    border: none;
    background: transparent;
    padding: 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
}

.datetime-field__tab:hover {
    background-color: #f3f4f6;
    color: #374151;
}

.datetime-field__tab--active {
    color: var(--fill-bg, #3b82f6);
    border-bottom-color: var(--fill-bg, #3b82f6);
    background-color: #ffffff;
}

.datetime-field__tab-val {
    font-size: 0.75rem;
    font-family: monospace;
    opacity: 0.8;
}

/* --- Body --- */
.datetime-field__body {
    position: relative;
    min-height: 320px;
    /* Prevent height jumping between views */
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-bottom: 0.5rem;
}

.datetime-field__calendar {
    border: none;
    /* Remove calendar's own border since popover handles it */
    width: 100%;
}

.datetime-field__clock-wrapper {
    padding-top: 1rem;
}
```

### File: apps\web\styles\components\fields\DropdownField.css

```css
.dropdown-field__container {
  width: 100%;
  position: relative;
}

.dropdown-field__input {
  display: flex;
  align-items: center;
  gap: 1em;
  justify-content: space-between;
  width: 100%;

  border-radius: var(--border-radius);
  box-shadow: inset 0 3px 6px #0004;
  background-color: #fff;
  /* outline: 1px solid #ccc; */
  position: relative;

  .dropdown-field__input__button {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 0.25rem;

    .dropdown-field__input__button__span,
    .dropdown-field__input__button__input {
      width: 100%;
      height: 100%;
      padding: 0.4rem;
      text-align: left;
    }

    .dropdown-field__input__button__span,
    .dropdown-field__input__button__input::placeholder {
      color: var(--text-dark);
    }
  }

  &:has(.dropdown-field__input__selected) {
    .dropdown-field__input__button {
      padding: 0.25rem 0;

      .dropdown-field__input__button__span,
      .dropdown-field__input__button__input {
        padding: 0.4rem 0;
      }
    }
  }

  .dropdown-field__input__selected {
    height: 100%;
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0.25rem;

    .dropdown-field__input__selected__item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      border-radius: var(--border-radius);

      background-color: #fff;
      box-shadow: 0 2px 6px #0004;
      padding: 0.3rem 0.4rem;
      color: var(--text);

      .dropdown-field__input__selected__item__close {
        padding: 0;
        margin: 0;
        height: 1rem;
        width: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}


.dropdown-field__selected__container {
  width: 100%;
  display: flex;

  .dropdown-field__selected {
    position: relative;
    width: 100%;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
    border: 1px solid var(--card);
    border-radius: var(--border-radius);
    padding: 0.5rem;

    .dropdown-field__selected__item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      border-radius: 2rem;

      background-color: var(--primary-half);
      padding: 0.2rem 0.5rem;
      color: white;
      font-size: 0.8rem;

      .dropdown-field__selected__item__close {
        padding: 0;
        margin: 0;
        height: 1rem;
        width: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}
```

### File: apps\web\styles\components\fields\FileField.css

```css
/* --- Base --- */
.file-field {
    display: flex;
    flex-direction: column;
    width: 100%;
    font-family: inherit;
    gap: 0.5rem;
}

.file-field__label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--input-text);
}

.file-field__req {
    color: var(--input-error-text);
}

.file-field__msg-error {
    font-size: 0.75rem;
    color: var(--input-error-text);
}

/* --- Dropzone (Inherited from Phase 1) --- */
.file-drop {
    border: 2px dashed var(--input-border);
    border-radius: var(--input-radius);
    background-color: #fafafa;
    padding: 2rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
}

.file-drop:hover {
    border-color: #a1a1aa;
    background-color: #f4f4f5;
}

.file-drop--active {
    border-color: var(--fill-bg, #3b82f6);
    background-color: rgba(59, 130, 246, 0.05);
}

.file-drop--error {
    border-color: var(--input-error-text);
}

.file-drop--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
    background: #eee;
}

.file-drop__input {
    display: none;
}

.file-drop__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.file-drop__icon {
    color: #9ca3af;
    background: #fff;
    padding: 0.5rem;
    border-radius: 50%;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
}

.file-drop__text {
    font-size: 0.875rem;
    color: var(--input-text);
}

.file-drop__link {
    color: var(--fill-bg, #3b82f6);
    font-weight: 500;
}

.file-drop__hint {
    font-size: 0.75rem;
    color: #6b7280;
}

/* --- List Wrapper --- */
.file-list-wrapper {
    margin-top: 0.5rem;
}

/* LIST MODE */
.file-list-wrapper--list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.file-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border: 1px solid var(--input-border);
    border-radius: var(--input-radius);
    background: #fff;
}

.file-item--error {
    border-color: var(--input-error-text);
    background-color: #fef2f2;
}

.file-item__preview {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    background: #f3f4f6;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    color: #6b7280;
}

.file-item__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.file-item__info {
    flex: 1;
    min-width: 0;
}

.file-item__name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--input-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-item__meta {
    font-size: 0.75rem;
    color: #6b7280;
}

.file-item__error-text {
    color: var(--input-error-text);
    font-weight: 500;
}

.file-item__remove {
    background: none;
    border: none;
    cursor: pointer;
    color: #9ca3af;
    padding: 0.25rem;
    border-radius: 4px;
    display: flex;
}

.file-item__remove:hover {
    color: var(--input-error-text);
    background-color: rgba(0, 0, 0, 0.05);
}

/* GRID MODE */
.file-list-wrapper--grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
}

.file-card {
    border: 1px solid var(--input-border);
    border-radius: var(--input-radius);
    background: #fff;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
}

.file-card--error {
    border-color: var(--input-error-text);
}

.file-card__preview {
    height: 100px;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    position: relative;
}

.file-card__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.file-card__remove {
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
}

.file-card:hover .file-card__remove {
    opacity: 1;
}

.file-card__remove:hover {
    background: rgba(239, 68, 68, 0.9);
}

.file-card__info {
    padding: 0.5rem;
    font-size: 0.75rem;
}

.file-card__name {
    font-weight: 500;
    color: var(--input-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
}

.file-card__meta {
    color: #6b7280;
}

/* Animations */
.file-item__spin {
    animation: spin 1s linear infinite;
    color: var(--fill-bg, #3b82f6);
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* Progress Bar (List) */
.file-item__progress-track {
    height: 4px;
    background: #e5e7eb;
    border-radius: 2px;
    margin-top: 4px;
    overflow: hidden;
    width: 100%;
}

.file-item__progress-fill {
    height: 100%;
    background: var(--fill-bg, #3b82f6);
    transition: width 0.2s;
}

/* Progress Bar (Grid) */
.file-card__progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.5);
}

.file-card__progress-bar div {
    height: 100%;
    background: var(--fill-bg, #3b82f6);
    transition: width 0.2s;
}

/* Status Text */
.file-item__status {
    font-size: 0.75rem;
    color: #6b7280;
    margin-left: 0.5rem;
}

.file-item__success {
    font-size: 0.75rem;
    color: #10b981;
    margin-left: 0.5rem;
    font-weight: 500;
}

.file-item__check {
    color: #10b981;
    margin-left: 0.25rem;
}

.file-item__header {
    display: flex;
    align-items: center;
}
```

### File: apps\web\styles\components\fields\FormStages.css

```css
.form-stages {
  display: flex;
  align-items: center;
  gap: 1em;

  .form-stages__item {
    display: flex;
    align-items: center;
    gap: 1em;
    position: relative;

    &[data-selected="true"] {
      font-weight: bold;

      .form-stages__item__container {

        opacity: 1;
      }
    }

    .form-stages__item__container {
      display: flex;
      flex-direction: column;
      align-items: center;
      opacity: 0.5;


      .form-stages__item__circle {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 4em;
        width: 4em;
        background-color: white;
        color: var(--primary);
        font-weight: bold;
        border-radius: 4em;

        p {
          padding: 0;
          margin: 0;
          font-size: 2em;
        }
      }

      .form-stages__item__name {
        font-size: 1;
        padding-top: 0.5em;
        margin: 0;
      }
    }

    .form-stages__item__divider {
      position: relative;
      width: 5em;
      border: 0.1em dashed white;
      top: -0.75em;
      opacity: 0.3;
    }
  }
}
```

### File: apps\web\styles\components\fields\SelectField.css

```css
/* --- Base --- */
.select-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: 100%;
  position: relative;
  font-family: inherit;
  box-sizing: border-box;

  &[data-aria-multiselectable='false'] {

    input,
    .select-field__wrapper {
      cursor: pointer !important;
    }
  }
}

/* --- Wrapper --- */
.select-field__wrapper {
  display: flex;
  align-items: center;
  min-height: var(--input-height);
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--border-radius__small);
  padding: 0.25rem 0.5rem;
  cursor: text;
  transition: all 0.2s ease;
  overflow: hidden;
}

/* --- Content (Input + Chips) --- */
.select-field__content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  align-items: center;
  min-width: 0;
  position: relative;
}

.select-field__input {
  flex: 1;
  min-width: 2rem;
  border: none;
  outline: none;
  background: transparent;
  padding: 0;
  margin: 0;
  color: var(--text);
  font-size: 0.875rem;
  height: 1.5rem;
}

/* --- Indicators --- */
.select-field__indicators {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding-left: 0.5rem;
  margin-left: auto;
  flex-shrink: 0;
  color: var(--text-medium);
  height: 100%;
}

.select-field__clear {
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: var(--text-medium);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.select-field__clear:hover {
  background-color: var(--input-hover);
  color: var(--input-error-text);
}

.select-field__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  transition: transform 0.2s ease;
}

.select-field__arrow--flip {
  transform: rotate(180deg);
}

/* --- Single Value Overlay --- */
.select-field__single-value {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text);
  font-size: 0.875rem;
}

/* --- Chips --- */
.select-field__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background-color: #e5e7eb;
  border-radius: 0.25rem;
  padding: 0.125rem 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text);
  max-width: 100%;
}

.select-field__chip-remove {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #6b7280;
  border-radius: 50%;
}

.select-field__chip-remove:hover {
  color: #ef4444;
}

/* --- Menu --- */
.select-field__menu {
  position: absolute;
  left: 0;
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--input-border);
  box-shadow: var(--dropdown-shadow);
  z-index: 100;
  max-height: 250px;
  overflow-y: auto;
  border-radius: var(--border-radius__small);
}

.select-field--pos-down .select-field__menu {
  top: 100%;
  margin-top: 0.25rem;
}

.select-field--pos-up .select-field__menu {
  bottom: 100%;
  margin-bottom: 0.25rem;
}

/* --- Grouping --- */
.select-field__group-label {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: var(--input-border);
  position: sticky;
  top: 0;
  z-index: 1;
  /* Ensure it floats above scrolling content if desired, though usually just visual block */
  border-bottom: 1px solid var(--input-hover);
}

/* --- Action Bar (Select All) --- */
.select-field__action-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: var(--input-focus-border);
  cursor: pointer;
  border-bottom: 1px solid var(--input-border);
  font-weight: 500;
  background: #fff;
}

.select-field__action-bar:hover {
  background-color: var(--option-hover);
}

/* --- Options --- */
.select-field__option {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text);
}

.select-field__option--highlighted {
  background-color: var(--option-hover);
}

.select-field__option--selected {
  background-color: var(--option-selected-bg);
  color: var(--option-selected-text);
}

.select-field__option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.select-field__opt-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.select-field__avatar {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  object-fit: cover;
}

.select-field__icon {
  display: flex;
  align-items: center;
  color: #6b7280;
}

.select-field__msg-error {
  font-size: 0.75rem;
  color: var(--input-error-text);
  margin-top: 0.25rem;
}

.select-field__spin {
  animation: spin 1s linear infinite;
  color: var(--input-focus-border);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
```

### File: apps\web\styles\components\fields\SliderField.css

```css
/* --- Base --- */
.slider-field {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-family: inherit;
  margin-bottom: 0.5rem;

  /* Vars */
  --slider-size: 2rem;
  --track-thickness: 0.375rem;
  --track-bg: #e5e7eb;
  --fill-bg: #3b82f6;
  --handle-size: 1.25rem;
  --handle-bg: #ffffff;
  --handle-border: #d1d5db;
  --mark-color: #9ca3af;

  /* Tooltip Vars */
  --tooltip-bg: #111827;
  --tooltip-text: #ffffff;
  --tooltip-radius: 0.25rem;
  --tooltip-padding: 0.25rem 0.5rem;
  --tooltip-font-size: 0.75rem;
}

.slider-field--has-marks {
  margin-bottom: 1.5rem;
}

.slider-field--disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* --- Header --- */
.slider-field__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.slider-field__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--input-text);
}

/* --- Control --- */
.slider-field__control {
  position: relative;
  display: flex;
  align-items: center;
  touch-action: none;
}

/* HORIZONTAL */
.slider-field:not(.slider-field--vertical) .slider-field__control {
  height: var(--slider-size);
  width: 100%;
}

.slider-field:not(.slider-field--vertical) .slider-field__track-container {
  width: 100%;
  height: var(--slider-size);
}

.slider-field:not(.slider-field--vertical) .slider-field__rail {
  width: 100%;
  height: var(--track-thickness);
  left: 0;
}

.slider-field:not(.slider-field--vertical) .slider-field__track {
  height: var(--track-thickness);
}

/* VERTICAL */
.slider-field--vertical {
  flex-direction: row;
  align-items: flex-start;
  height: 100%;
}

.slider-field--vertical .slider-field__header {
  flex-direction: column;
  margin-right: 1rem;
  margin-bottom: 0;
}

.slider-field--vertical .slider-field__control {
  height: 200px;
  width: var(--slider-size);
  flex-direction: column;
}

.slider-field--vertical .slider-field__track-container {
  height: 100%;
  width: var(--slider-size);
  display: flex;
  justify-content: center;
}

.slider-field--vertical .slider-field__rail {
  height: 100%;
  width: var(--track-thickness);
  bottom: 0;
}

.slider-field--vertical .slider-field__track {
  width: var(--track-thickness);
}

/* --- Track Elements --- */
.slider-field__track-container {
  position: relative;
  cursor: pointer;
}

.slider-field__rail {
  position: absolute;
  background-color: var(--track-bg);
  border-radius: 99px;
}

.slider-field__track {
  position: absolute;
  background-color: var(--fill-bg);
  border-radius: 99px;
  z-index: 1;
}

/* --- Marks --- */
.slider-field__marks {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.slider-field__mark {
  position: absolute;
  display: flex;
  align-items: center;
}

/* Horizontal Marks */
.slider-field:not(.slider-field--vertical) .slider-field__mark {
  transform: translateX(-50%);
  top: 50%;
  flex-direction: column;
}

.slider-field:not(.slider-field--vertical) .slider-field__mark-tick {
  width: 2px;
  height: 0.75rem;
  background-color: var(--track-bg);
  margin-top: calc(var(--track-thickness) * 1.5);
}

.slider-field:not(.slider-field--vertical) .slider-field__mark-label {
  top: 1.5rem;
  position: absolute;
  font-size: 0.75rem;
  color: var(--mark-color);
  white-space: nowrap;
}

/* Vertical Marks */
.slider-field--vertical .slider-field__mark {
  transform: translateY(50%);
  left: 50%;
  flex-direction: row;
}

.slider-field--vertical .slider-field__mark-tick {
  height: 2px;
  width: 0.75rem;
  background-color: var(--track-bg);
  margin-left: calc(var(--track-thickness) * 1.5);
}

.slider-field--vertical .slider-field__mark-label {
  left: 1.5rem;
  position: absolute;
  font-size: 0.75rem;
  color: var(--mark-color);
  white-space: nowrap;
}

/* --- Handles --- */
.slider-field__handle {
  position: absolute;
  width: var(--handle-size);
  height: var(--handle-size);
  z-index: 3;
  cursor: grab;
  touch-action: none;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

/* Vertical Logic: bottom: pct% means center is at pct + half height. 
   We want center at pct. 
   So we translate( -50%, 50% ) ? No. bottom:0 is edge.
   Usually: left: 50% -> translate(-50%, 0)
   Vertical bottom based: bottom: Pct -> translate(0, 50%) moves it DOWN.
   If Pct=0, bottom of handle is at 0. Center is at 0.5*size. 
   We want center at 0. So we need to move DOWN by 50% of handle size.
*/
.slider-field:not(.slider-field--vertical) .slider-field__handle {
  transform: translate(-50%, -50%);
  /* Center on point X,Y */
}

.slider-field--vertical .slider-field__handle {
  /* For vertical, handle is centered via left:50% -> translateX(-50%) */
  /* Bottom: X% -> translateY(50%) moves center to the point */
  transform: translate(-50%, 50%);
}

.slider-field__handle:active {
  cursor: grabbing;
  z-index: 4;
}

.slider-field__handle-knob {
  width: 100%;
  height: 100%;
  background-color: var(--handle-bg);
  border: 1px solid var(--handle-border);
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.1s;
}

.slider-field__handle:active .slider-field__handle-knob {
  transform: scale(1.1);
  border-color: var(--fill-bg);
}

/* --- Tooltips --- */
.slider-field__tooltip {
  position: absolute;
  background-color: var(--tooltip-bg);
  color: var(--tooltip-text);
  padding: var(--tooltip-padding);
  border-radius: var(--tooltip-radius);
  font-size: var(--tooltip-font-size);
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  transition: opacity 0.2s, transform 0.2s;
  opacity: 0;
}

/* Position Variants */
.slider-field__tooltip--top {
  bottom: 100%;
  margin-bottom: 0.5rem;
  transform: translateY(4px);
}

.slider-field__tooltip--bottom {
  top: 100%;
  margin-top: 0.5rem;
  transform: translateY(-4px);
}

.slider-field__tooltip--left {
  right: 100%;
  margin-right: 0.5rem;
  transform: translateX(4px);
}

.slider-field__tooltip--right {
  left: 100%;
  margin-left: 0.5rem;
  transform: translateX(-4px);
}

/* Inside Mode */
.slider-field__tooltip--inside {
  position: relative;
  /* Inside handle flow */
  background: transparent;
  color: inherit;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0;
  margin: 0;
  opacity: 1 !important;
  /* Always show if inside, usually */
  transform: none !important;
}

/* Visibility Logic */
.slider-field__tooltip--always {
  opacity: 1;
  transform: translate(0, 0);
}

.slider-field__tooltip--hover {
  opacity: 0;
}

.slider-field__handle:hover .slider-field__tooltip--hover,
.slider-field__handle:focus-visible .slider-field__tooltip--hover {
  opacity: 1;
  transform: translate(0, 0);
}

.slider-field__tooltip--active {
  opacity: 0;
}

.slider-field__handle--active .slider-field__tooltip--active {
  opacity: 1;
  transform: translate(0, 0);
}
```

### File: apps\web\styles\components\fields\TextField.css

```css
/* --- Base --- */
.text-field {
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  font-family: inherit;
  margin-bottom: 0.5rem;
}

/* --- Wrapper --- */
.text-field__wrapper {
  display: flex;
  align-items: center;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--input-radius);
  min-height: var(--input-height);
  padding: 0 0.75rem;
  /* Standard padding */
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
}

/* Multiline Wrapper Alignment Fix */
.text-field--multiline .text-field__wrapper {
  align-items: flex-start;
  padding-top: 0.5rem;
  padding-bottom: 0;
  /* REMOVE bottom padding from wrapper to let handle sit at bottom */
  height: auto;
}

.text-field__wrapper:focus-within {
  border-color: var(--input-focus-border);
  box-shadow: 0 0 0 3px var(--input-focus-ring);
}

.text-field--error .text-field__wrapper {
  border-color: var(--input-error-text);
}

.text-field--success .text-field__wrapper {
  border-color: var(--input-success);
}

.text-field--disabled .text-field__wrapper {
  background-color: var(--input-disabled-bg);
  cursor: not-allowed;
  opacity: 0.8;
}

/* --- Input & Textarea --- */
.text-field__input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: var(--input-text);
  width: 100%;
  height: 100%;
  line-height: 1.5;
}

.text-field__input::placeholder {
  color: var(--input-placeholder);
  opacity: 1;
}

/* Textarea Specifics */
.text-field__input--textarea {
  min-height: 3rem;
  margin: 0;
  display: block;
  /* Add bottom padding here instead of wrapper */
  padding-bottom: 0.5rem;
}

/* Case 1: Manual Resize (Default) */
.text-field--multiline:not(.text-field--auto-grow) .text-field__input--textarea {
  resize: vertical;
  overflow: auto;
}

/* Case 2: Auto Grow (Hidden resize/overflow) */
.text-field--auto-grow .text-field__input--textarea {
  resize: none;
  overflow: hidden;
  /* Prevent scrollbar flickering */
}

/* --- Labels --- */
.text-field__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--input-text);
  margin-bottom: 0.375rem;
  display: block;
}

.text-field__req {
  color: var(--input-error-text);
}

/* --- Floating Label Logic --- */
.text-field--floating .text-field__label {
  position: absolute;
  left: 0.75rem;
  top: 0.75rem;
  margin: 0;
  padding: 0 0.25rem;
  background-color: var(--input-bg);
  color: var(--input-placeholder);
  transition: all 0.2s ease-out;
  pointer-events: none;
  z-index: 2;
  transform-origin: left top;
}

.text-field--floating.text-field--active .text-field__label {
  top: -0.6rem;
  left: 0.5rem;
  font-size: 0.75rem;
  color: var(--input-text);
  font-weight: 600;
}

.text-field--floating .text-field__wrapper {
  background: var(--input-bg);
}

/* --- Addons (Prefix/Suffix) --- */
.text-field__addon {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 0.875rem;
  white-space: nowrap;
}

.text-field--multiline .text-field__addon {
  margin-top: 0.125rem;
}

.text-field__addon--left {
  margin-right: 0.5rem;
}

.text-field__addon--right {
  margin-left: 0.5rem;
}

/* --- Actions (Clear / Password) --- */
.text-field__actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
  height: 100%;
}

.text-field--multiline .text-field__actions {
  align-items: flex-start;
  margin-top: 0.125rem;
}

.text-field__action-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  border-radius: 50%;
  transition: color 0.2s;
}

.text-field__action-btn:hover {
  color: var(--input-text);
  background-color: #f3f4f6;
}

/* --- Footer --- */
.text-field__footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 0.25rem;
  min-height: 1rem;
}

.text-field__msg-error {
  font-size: 0.75rem;
  color: var(--input-error-text);
}

.text-field__msg-hint {
  font-size: 0.75rem;
  color: #6b7280;
}

.text-field__counter {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-left: auto;
  padding-left: 0.5rem;
}
```

### File: apps\web\styles\components\fields\TimeField.css

```css
/* --- Field --- */
.time-field {
    width: 100%;
}

.time-field__icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--input-placeholder, #9ca3af);
    display: flex;
    align-items: center;
    padding: 2px;
}

.time-field__clock-wrapper {
    background: var(--dropdown-bg);
    border-radius: var(--input-radius);
    overflow: hidden;
    width: 280px;
}

/* --- Clock Header --- */
.time-clock__header {
    background-color: var(--fill-bg, #3b82f6);
    color: white;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.time-clock__digital {
    font-size: 2rem;
    display: flex;
    align-items: baseline;
}

.time-clock__sep {
    margin: 0 0.25rem;
    opacity: 0.7;
}

.time-clock__val {
    background: none;
    border: none;
    font-size: inherit;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    padding: 0;
}

.time-clock__val--active {
    color: white;
}

.time-clock__ampm {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.time-clock__meridiem {
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
    padding: 0.1rem 0.3rem;
    cursor: pointer;
}

.time-clock__meridiem--active {
    background: white;
    color: var(--fill-bg, #3b82f6);
    font-weight: bold;
}

/* --- Clock Body --- */
.time-clock__body {
    padding: 1.5rem;
    display: flex;
    justify-content: center;
}

.clock__face {
    width: 230px;
    height: 230px;
    background: #f3f4f6;
    border-radius: 50%;
    position: relative;
    touch-action: none;
    /* Crucial for drag */
}

.clock__center-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    background: var(--fill-bg, #3b82f6);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 5;
}

.clock__number {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 32px;
    height: 32px;
    margin-top: -16px;
    margin-left: -16px;
    /* Center pivot */
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 0.9rem;
    color: #111827;
    pointer-events: none;
    /* Let clicks pass to face */
    z-index: 2;
}

.clock__number--active {
    color: white;
}

.clock__hand {
    position: absolute;
    left: 50%;
    bottom: 50%;
    /* Pivot at bottom center (center of clock) */
    width: 2px;
    background: var(--fill-bg, #3b82f6);
    transform-origin: bottom center;
    pointer-events: none;
    z-index: 1;
}

.clock__hand-knob {
    position: absolute;
    top: -16px;
    left: 50%;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--fill-bg, #3b82f6);
    transform: translateX(-50%);
}
```

### File: apps\web\hooks\fields\useFileDrop.ts

```ts
import { useSignal } from '@preact/signals';
import { useCallback, useRef } from 'preact/hooks';

interface UseFileDropProps {
	onDrop: (files: File[]) => void;
	disabled?: boolean;
}

export function useFileDrop({ onDrop, disabled }: UseFileDropProps) {
	const isDragActive = useSignal(false);
	const dragCounter = useRef(0);

	const handleDragEnter = useCallback((e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (disabled) return;

		dragCounter.current += 1;
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
		isDragActive.value = true;
	}, [disabled]);

	const handleDragLeave = useCallback((e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (disabled) return;

		dragCounter.current -= 1;
		if (dragCounter.current === 0) {
			isDragActive.value = false;
		}
	}, [disabled]);

	const handleDragOver = useCallback((e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (disabled) return;
		// Necessary to allow dropping
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
	}, [disabled]);

	const handleDrop = useCallback((e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();

		dragCounter.current = 0;
		isDragActive.value = false;

		if (disabled) return;
		if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const fileList = Array.from(e.dataTransfer.files);
			onDrop(fileList);
		}
	}, [onDrop, disabled]);

	return {
		isDragActive,
		dropProps: {
			onDragEnter: handleDragEnter,
			onDragLeave: handleDragLeave,
			onDragOver: handleDragOver,
			onDrop: handleDrop,
		},
	};
}

```

### File: apps\web\hooks\fields\useFileProcessor.ts

```ts
import { useEffect } from 'preact/hooks';
import { FileProcessor, FileWithMeta } from '@projective/types';

interface UseFileProcessorProps {
	files: FileWithMeta[];
	processors?: FileProcessor[];
	updateFile: (id: string, updates: Partial<FileWithMeta>) => void;
}

export function useFileProcessor({ files, processors, updateFile }: UseFileProcessorProps) {
	useEffect(() => {
		if (!processors || processors.length === 0) {
			// No processors? Mark all pending as ready immediately.
			files.forEach((f) => {
				if (f.status === 'pending' && f.errors.length === 0) {
					updateFile(f.id, { status: 'ready', progress: 100 });
				}
			});
			return;
		}

		// Find pending files
		files.forEach(async (fileWrapper) => {
			if (fileWrapper.status !== 'pending' || fileWrapper.errors.length > 0) return;

			// Find matching processor
			const processor = processors.find((p) => p.match(fileWrapper.file));

			if (!processor) {
				// No processor needed, mark ready
				updateFile(fileWrapper.id, { status: 'ready', progress: 100 });
				return;
			}

			// Start Processing
			updateFile(fileWrapper.id, { status: 'processing', progress: 0 });

			try {
				const result = await processor.process(fileWrapper.file, (pct) => {
					updateFile(fileWrapper.id, { progress: pct });
				});

				// Success
				updateFile(fileWrapper.id, {
					file: result.file, // Replace raw with optimized
					processingMeta: result.metadata,
					status: 'ready',
					progress: 100,
				});
			} catch (err) {
				console.error('Processing failed', err);
				updateFile(fileWrapper.id, {
					status: 'error',
					errors: [...fileWrapper.errors, {
						code: 'processing-failed',
						message: 'Optimization failed',
					}],
				});
			}
		});
	}, [files, processors]); // Re-run when files change
}

```

### File: apps\web\hooks\fields\useFileSelection.ts

```ts
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { FileWithMeta } from '@projective/types';
import { validateFile } from '@projective/shared';

interface UseFileSelectionProps {
	multiple?: boolean;
	maxFiles?: number;
	accept?: string;
	maxSize?: number;
	onChange?: (files: File[]) => void;
}

export function useFileSelection({
	multiple,
	maxFiles = 0,
	accept,
	maxSize,
	onChange,
}: UseFileSelectionProps) {
	const files = useSignal<FileWithMeta[]>([]);

	const revokePreviews = (items: FileWithMeta[]) => {
		items.forEach((item) => {
			if (item.preview) URL.revokeObjectURL(item.preview);
		});
	};

	useEffect(() => {
		return () => revokePreviews(files.value);
	}, []);

	const addFiles = (newFiles: File[]) => {
		let currentFiles = multiple ? [...files.value] : [];

		if (multiple && maxFiles > 0) {
			const remainingSlots = maxFiles - currentFiles.length;
			if (remainingSlots <= 0) return;
			if (newFiles.length > remainingSlots) newFiles = newFiles.slice(0, remainingSlots);
		} else if (!multiple) {
			revokePreviews(currentFiles);
			currentFiles = [];
			newFiles = [newFiles[0]];
		}

		const mappedFiles: FileWithMeta[] = newFiles.map((file) => {
			let preview: string | undefined;
			if (file.type.startsWith('image/')) preview = URL.createObjectURL(file);

			// Initial validation
			const errors = validateFile(file, accept, maxSize);

			return {
				file,
				id: crypto.randomUUID(),
				preview,
				status: errors.length > 0 ? 'error' : 'pending', // Start as pending!
				progress: 0,
				errors,
			};
		});

		files.value = [...currentFiles, ...mappedFiles];
		emitChange();
	};

	const removeFile = (id: string) => {
		const fileToRemove = files.value.find((f) => f.id === id);
		if (fileToRemove) revokePreviews([fileToRemove]);
		files.value = files.value.filter((f) => f.id !== id);
		emitChange();
	};

	// --- NEW: Update single file state ---
	const updateFile = (id: string, updates: Partial<FileWithMeta>) => {
		files.value = files.value.map((f) => {
			if (f.id !== id) return f;

			// If file blob changed (e.g. compression), update preview
			if (updates.file && updates.file !== f.file) {
				if (f.preview) URL.revokeObjectURL(f.preview);
				if (updates.file.type.startsWith('image/')) {
					updates.preview = URL.createObjectURL(updates.file);
				}
			}
			return { ...f, ...updates };
		});

		// Only emit if status changed to ready or file list changed
		if (updates.status === 'ready' || updates.file) {
			emitChange();
		}
	};

	const emitChange = () => {
		// Only expose files that are Ready (processed) and valid
		const validRawFiles = files.value
			.filter((f) => f.status === 'ready' && f.errors.length === 0)
			.map((f) => f.file);
		onChange?.(validRawFiles);
	};

	return { files, addFiles, removeFile, updateFile };
}

```

### File: apps\web\hooks\fields\useSelectState.ts

```ts
import { useComputed, useSignal } from '@preact/signals';
import { useCallback } from 'preact/hooks';
import { SelectOption } from '../../types/fields/select.ts';

interface UseSelectStateProps {
	options: SelectOption[];
	value?: string | string[] | number | number[];
	// deno-lint-ignore no-explicit-any
	onChange?: (val: any) => void;
	multiple?: boolean;
	disabled?: boolean;
}

export function useSelectState({
	options,
	value,
	onChange,
	multiple,
	disabled,
}: UseSelectStateProps) {
	const isOpen = useSignal(false);
	const highlightedIndex = useSignal(-1);
	const searchQuery = useSignal('');

	const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

	const filteredOptions = useComputed(() =>
		options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.value.toLowerCase()))
	);

	const toggleOpen = (forceState?: boolean) => {
		if (disabled) return;
		const newState = forceState !== undefined ? forceState : !isOpen.value;
		isOpen.value = newState;

		if (newState) {
			const firstSelected = filteredOptions.value.findIndex((o) =>
				selectedValues.includes(o.value)
			);
			highlightedIndex.value = firstSelected >= 0 ? firstSelected : 0;
		} else {
			setSearchQuery('');
			highlightedIndex.value = -1;
		}
	};

	const setSearchQuery = (q: string) => {
		searchQuery.value = q;
		if (isOpen.value) highlightedIndex.value = 0;
	};

	const selectOption = useCallback((option: SelectOption) => {
		if (option.disabled) return;

		let newValue;
		if (multiple) {
			const exists = selectedValues.includes(option.value);
			if (exists) {
				newValue = selectedValues.filter((v) => v !== option.value);
			} else {
				newValue = [...selectedValues, option.value];
			}
			setSearchQuery('');
		} else {
			newValue = option.value;
			toggleOpen(false);
		}

		onChange?.(newValue);
	}, [multiple, selectedValues, onChange]);

	const removeValue = (val: string | number) => {
		if (!multiple) {
			onChange?.(null);
			return;
		}
		onChange?.(selectedValues.filter((v) => v !== val));
	};

	// --- FIX: Exclude disabled items from "Select All" ---
	const toggleSelectAll = () => {
		if (!multiple) return;

		// 1. Get only the enabled options currently visible
		const enabledOptions = filteredOptions.value.filter((o) => !o.disabled);
		const enabledValues = enabledOptions.map((o) => o.value);

		// 2. Check if all *enabled* options are currently selected
		const areAllSelected = enabledValues.every((v) => selectedValues.includes(v));

		if (areAllSelected) {
			// Deselect: Remove only the visible enabled values
			const remaining = selectedValues.filter((v) => !enabledValues.includes(v));
			onChange?.(remaining);
		} else {
			// Select: Add missing enabled values
			const uniqueValues = Array.from(new Set([...selectedValues, ...enabledValues]));
			onChange?.(uniqueValues);
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (disabled) return;

		if (!isOpen.value && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
			e.preventDefault();
			toggleOpen(true);
			return;
		}

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				highlightedIndex.value = highlightedIndex.value < filteredOptions.value.length - 1
					? highlightedIndex.value + 1
					: highlightedIndex.value;
				break;
			case 'ArrowUp':
				e.preventDefault();
				highlightedIndex.value = highlightedIndex.value > 0 ? highlightedIndex.value - 1 : 0;
				break;
			case 'Enter':
				e.preventDefault();
				if (isOpen.value && highlightedIndex.value >= 0) {
					selectOption(filteredOptions.value[highlightedIndex.value]);
				}
				break;
			case 'Escape':
				e.preventDefault();
				toggleOpen(false);
				break;
			case 'Backspace':
				if (searchQuery.value === '' && multiple && selectedValues.length > 0) {
					removeValue(selectedValues[selectedValues.length - 1]);
				}
				break;
			case 'Tab':
				if (isOpen.value) toggleOpen(false);
				break;
		}
	};

	return {
		isOpen,
		highlightedIndex,
		searchQuery,
		setSearchQuery,
		filteredOptions,
		selectedValues,
		toggleOpen,
		selectOption,
		removeValue,
		toggleSelectAll,
		handleKeyDown,
	};
}

```

### File: apps\web\hooks\fields\useSliderState.ts

```ts
import { useComputed, useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import {
	clamp,
	percentToValue,
	percentToValueLog,
	roundToStep,
	snapToClosest,
	valueToPercent,
	valueToPercentLog,
} from '@projective/utils';
import { SliderMark } from '../../types/fields/slider.ts';

interface UseSliderStateProps {
	value?: number | number[];
	onChange?: (val: number | number[]) => void;
	min: number;
	max: number;
	step: number;
	range?: boolean;
	disabled?: boolean;
	marks?: boolean | number[] | SliderMark[];
	snapToMarks?: boolean;
	vertical?: boolean;
	scale?: 'linear' | 'logarithmic';
	minDistance?: number;
	passthrough?: boolean; // New Prop
}

export function useSliderState({
	value,
	onChange,
	min,
	max,
	step,
	range,
	disabled,
	marks,
	snapToMarks,
	vertical,
	scale = 'linear',
	minDistance = 0,
	passthrough = false,
}: UseSliderStateProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const activeHandleIdx = useSignal<number | null>(null);
	const internalValues = useSignal<number[]>([]);

	const isLog = scale === 'logarithmic';

	useEffect(() => {
		if (activeHandleIdx.value !== null) return;
		if (range) {
			if (Array.isArray(value)) internalValues.value = value;
			else internalValues.value = [min, max];
		} else {
			if (typeof value === 'number') internalValues.value = [value];
			else internalValues.value = [min];
		}
	}, [value, range, min, max, activeHandleIdx.value]);

	const snapPoints = useComputed(() => {
		if (!snapToMarks || !marks) return null;
		if (Array.isArray(marks)) {
			return marks.map((m) => (typeof m === 'number' ? m : m.value));
		}
		return null;
	});

	const calcValueFromPointer = (e: { clientX: number; clientY: number }) => {
		if (!trackRef.current) return min;
		const rect = trackRef.current.getBoundingClientRect();

		let percent = 0;
		if (vertical) {
			percent = ((rect.bottom - e.clientY) / rect.height) * 100;
		} else {
			percent = ((e.clientX - rect.left) / rect.width) * 100;
		}

		const rawValue = isLog
			? percentToValueLog(percent, min, max)
			: percentToValue(percent, min, max);

		if (snapToMarks && snapPoints.value) {
			return snapToClosest(rawValue, snapPoints.value);
		}
		return roundToStep(rawValue, step);
	};

	const handlePointerDown = (index: number, e: PointerEvent) => {
		if (disabled) return;
		e.preventDefault();
		e.stopPropagation();

		const target = e.target as HTMLElement;
		target.setPointerCapture(e.pointerId);
		activeHandleIdx.value = index;
		target.focus();
	};

	const handleTrackClick = (e: PointerEvent) => {
		if (disabled || activeHandleIdx.value !== null) return;

		const val = calcValueFromPointer(e);
		const current = internalValues.value;

		let closestIdx = 0;
		let minDiff = Infinity;

		current.forEach((v, i) => {
			const diff = Math.abs(v - val);
			if (diff < minDiff) {
				minDiff = diff;
				closestIdx = i;
			}
		});

		updateValue(closestIdx, val);
	};

	const handlePointerMove = (e: PointerEvent) => {
		if (activeHandleIdx.value === null || disabled) return;
		const newVal = calcValueFromPointer(e);
		updateValue(activeHandleIdx.value, newVal);
	};

	const handlePointerUp = (e: PointerEvent) => {
		if (activeHandleIdx.value !== null) {
			const target = e.target as HTMLElement;
			target.releasePointerCapture(e.pointerId);
			activeHandleIdx.value = null;
		}
	};

	const updateValue = (index: number, rawNewValue: number) => {
		const current = [...internalValues.value];
		let newValue = clamp(rawNewValue, min, max);

		// Collision / Passthrough Logic
		if (!passthrough) {
			const dist = minDistance;

			// Check Previous
			if (index > 0) {
				const prevVal = current[index - 1];
				if (newValue < prevVal + dist) newValue = prevVal + dist;
			}

			// Check Next
			if (index < current.length - 1) {
				const nextVal = current[index + 1];
				if (newValue > nextVal - dist) newValue = nextVal - dist;
			}
		}

		newValue = clamp(newValue, min, max);

		if (current[index] !== newValue) {
			current[index] = newValue;
			internalValues.value = current;
			if (range) onChange?.(current);
			else onChange?.(current[0]);
		}
	};

	const handleStyles = useComputed(() => {
		return internalValues.value.map((v) => {
			const pct = isLog ? valueToPercentLog(v, min, max) : valueToPercent(v, min, max);

			return vertical ? { bottom: `${pct}%`, left: '50%' } : { left: `${pct}%`, top: '50%' };
		});
	});

	const trackFillStyle = useComputed(() => {
		const count = internalValues.value.length;
		if (count === 0) return {};

		// For Track Fill, we always want min to max visually,
		// regardless of which handle is which (if passthrough is on).
		const values = [...internalValues.value].sort((a, b) => a - b);
		const firstVal = values[0];
		const lastVal = values[count - 1];

		const startPct = range
			? (isLog ? valueToPercentLog(firstVal, min, max) : valueToPercent(firstVal, min, max))
			: 0;

		const endPct = isLog ? valueToPercentLog(lastVal, min, max) : valueToPercent(lastVal, min, max);

		const size = Math.abs(endPct - startPct);
		const startPos = Math.min(startPct, endPct);

		return vertical
			? { bottom: `${startPos}%`, height: `${size}%`, left: 0, width: '100%' }
			: { left: `${startPos}%`, width: `${size}%`, top: 0, height: '100%' };
	});

	return {
		trackRef,
		internalValues,
		activeHandleIdx,
		handleStyles,
		trackFillStyle,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		handleTrackClick,
	};
}

```

### File: apps\web\hooks\fields\useTextMask.ts

```ts
import { useLayoutEffect, useRef } from 'preact/hooks';

interface UseTextMaskProps {
	mask?: string;
	value: string;
	onChange?: (val: string) => void;
	ref: any; // HTMLInputElement ref
}

// Mask Definitions
// 9: Numeric (0-9)
// a: Alphabet (a-z, A-Z)
// *: Alphanumeric (0-9, a-z, A-Z)
const DIGIT = /[0-9]/;
const ALPHA = /[a-zA-Z]/;
const ALPHANUM = /[0-9a-zA-Z]/;

export function useTextMask({ mask, value, onChange, ref }: UseTextMaskProps) {
	// We track the cursor position manually to restore it after formatting
	const cursorRef = useRef<number | null>(null);

	// 1. Core Formatting Logic
	const formatValue = (rawValue: string) => {
		if (!mask) return rawValue;

		let formatted = '';
		let rawIndex = 0;
		let maskIndex = 0;

		while (maskIndex < mask.length && rawIndex < rawValue.length) {
			const maskChar = mask[maskIndex];
			const valueChar = rawValue[rawIndex];

			// Defs
			if (maskChar === '9') {
				if (DIGIT.test(valueChar)) {
					formatted += valueChar;
					maskIndex++;
					rawIndex++;
				} else {
					// Invalid char for this slot, skip raw char
					rawIndex++;
				}
			} else if (maskChar === 'a') {
				if (ALPHA.test(valueChar)) {
					formatted += valueChar;
					maskIndex++;
					rawIndex++;
				} else {
					rawIndex++;
				}
			} else if (maskChar === '*') {
				if (ALPHANUM.test(valueChar)) {
					formatted += valueChar;
					maskIndex++;
					rawIndex++;
				} else {
					rawIndex++;
				}
			} else {
				// Fixed char (separator like / - ( ))
				formatted += maskChar;
				maskIndex++;
				// If user typed the separator explicitly, consume it
				if (valueChar === maskChar) {
					rawIndex++;
				}
			}
		}

		return formatted;
	};

	// 2. Input Handler interceptor
	const handleMaskInput = (e: Event) => {
		if (!mask || !onChange) return;

		const target = e.target as HTMLInputElement;
		const prevValue = value || '';
		let newValue = target.value;

		// Detect deletion (Backspacing)
		// If user backspaces a separator, we might need to handle specific logic,
		// but usually simply re-running formatValue on the stripped string works well enough
		// for standard HTML inputs.

		// Strip existing separators from input to get "raw" chars relative to mask
		// This is a naive strip; for complex masks we might need a more robust unmasker.
		// For now, we rely on the loop in formatValue to pick valid chars.

		const nextFormatted = formatValue(newValue);

		// Capture cursor before React/Preact re-renders
		const selectionStart = target.selectionStart || 0;

		// Heuristic: If we added characters (separators), bump cursor
		// If we removed, keep it.
		// This is the "Hard Part" of masking.
		// A simple approach:
		// Calculate how many "valid data" characters are before the cursor in the NEW value
		// and map that to the formatted string.

		cursorRef.current = selectionStart;

		// Optimization: Only update if changed
		if (nextFormatted !== prevValue) {
			onChange(nextFormatted);
		} else {
			// If formatting stripped the char (invalid input), force update ref to revert view
			target.value = prevValue;
			// Restore cursor
			target.setSelectionRange(selectionStart - 1, selectionStart - 1);
		}
	};

	// 3. Restore Cursor Effect
	useLayoutEffect(() => {
		if (mask && ref.current && cursorRef.current !== null) {
			const input = ref.current;
			// This simple restore works for end-of-typing.
			// For middle-of-string editing, you need more math (counting non-mask chars).
			// We'll stick to basic native behavior restoration for now.

			// If the value length grew by more than 1 char (separator added),
			// check if we need to jump the cursor forward.
			// (Simplified for this snippet)

			input.setSelectionRange(cursorRef.current, cursorRef.current);
			cursorRef.current = null;
		}
	}, [value, mask]);

	return {
		handleMaskInput,
		// expose formatter if needed externally
		formatValue,
	};
}

```

### File: apps\web\components\wrappers\GlobalFileDrop.tsx

```tsx
import { ComponentChildren } from 'preact';
import { useGlobalDrag } from '../../hooks/useGlobalDrag.ts';
import { FileFieldProps } from 'packages/types/file.ts';
import FileDrop from '../fields/file/FileDrop.tsx';

interface GlobalFileDropProps extends FileFieldProps {
	children: ComponentChildren;
	overlayText?: string;
}

export default function GlobalFileDrop(props: GlobalFileDropProps) {
	const isDragging = useGlobalDrag();

	// If dragging, we hijack the drop event in the overlay
	// The FileDrop component already handles onDrop -> addFiles -> onChange

	return (
		<div className='global-drop-wrapper' style={{ position: 'relative', height: '100%' }}>
			{/* 1. The Normal UI (Chat) */}
			<div className='global-drop-content'>
				{props.children}
			</div>

			{/* 2. The Overlay (Only visible when dragging) */}
			{isDragging.value && (
				<div
					className='global-drop-overlay'
					style={{
						position: 'absolute',
						inset: 0,
						zIndex: 100,
						background: 'rgba(255, 255, 255, 0.95)',
						backdropFilter: 'blur(4px)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '2rem',
					}}
				>
					{/* We reuse FileDrop logic but style it as a big drop target */}
					<FileDrop
						{...props}
						className='file-drop--global' // Custom class for override styles
						dropzoneLabel={props.overlayText || 'Drop files to attach'}
						// We force active state visually since we are already dragging
						layout='list'
					/>
				</div>
			)}
		</div>
	);
}

```

### File: packages\types\DateTime.ts

```ts
/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Supported units for date/time differences and ranges.
 */
type DiffUnit =
    | 'milliseconds'
    | 'seconds'
    | 'minutes'
    | 'hours'
    | 'days'
    | 'weeks'
    | 'months'
    | 'years';

/**
 * Human-readable labels per diff unit used when building duration text.
 */
const UNIT_LABELS: Record<DiffUnit, { singular: string; plural: string }> = {
    milliseconds: { singular: 'millisecond', plural: 'milliseconds' },
    seconds: { singular: 'second', plural: 'seconds' },
    minutes: { singular: 'minute', plural: 'minutes' },
    hours: { singular: 'hour', plural: 'hours' },
    days: { singular: 'day', plural: 'days' },
    weeks: { singular: 'week', plural: 'weeks' },
    months: { singular: 'month', plural: 'months' },
    years: { singular: 'year', plural: 'years' },
};

// #region DateTime core

/**
 * Lightweight date/time helper that wraps the native Date for parsing, formatting, math and comparisons.
 *
 * @remarks
 * Accepts native Date, ISO-like strings, a custom parse format, or Excel serial numbers.
 * Instances are immutable from the caller's perspective whenever methods return a new DateTime.
 */
export class DateTime {
    private date: Date;
    private timezone: string | null = null;

    /**
     * Creates a new DateTime from various input types.
     *
     * @param input Native Date, parseable string, Excel serial number, or undefined for "now".
     * @param format Optional custom format string to parse non-ISO input.
     * @param strictWeekday When true, rejects dates whose weekday text does not match the parsed calendar date.
     */
    constructor(input?: Date | string | number, format?: string, strictWeekday: boolean = false) {
        if (input instanceof Date) {
            this.date = new Date(input);
        } else if (typeof input === 'string') {
            this.date = format
                ? this.parseCustomFormat(input, format, strictWeekday)
                : this.parseFromString(input);
        } else if (typeof input === 'number') {
            this.date = this.parseFromExcel(input);
        } else {
            this.date = new Date();
        }
    }

    /**
     * Parses a string using the browser's native Date parser.
     *
     * @remarks
     * Behaviour depends on the runtime environment and may differ across browsers.
     */
    private parseFromString(input: string): Date {
        return new Date(input);
    }

    /**
     * Converts an Excel serial date into a JavaScript Date.
     *
     * @remarks
     * Uses the 1900 date system (epoch 1899-12-30) and ignores Excel's leap-year bug for 1900.
     */
    private parseFromExcel(serial: number): Date {
        const excelEpoch = new Date(1899, 11, 30);
        return new Date(excelEpoch.getTime() + serial * 86400000);
    }

    /**
     * Parses a date string against a custom tokenised format.
     *
     * @remarks
     * Supports basic day/month/year/time and timezone offset tokens similar to moment.js-style formats.
     * Throws when the input does not match the pattern or when strict weekday validation fails.
     *
     * @throws Error If the input cannot be matched to the given format or weekday does not align when strict.
     */
    private parseCustomFormat(input: string, format: string, strictWeekday: boolean = false): Date {
        const monthsShort = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        const monthsLong = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
        const weekdaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekdaysLong = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ];

        const tokenMap: Record<string, string> = {
            d: '(\\d{1,2})',
            dd: '(\\d{2})',
            ddd: `(${weekdaysShort.join('|')})`,
            dddd: `(${weekdaysLong.join('|')})`,
            M: '(\\d{1,2})',
            MM: '(\\d{2})',
            MMM: `(${monthsShort.join('|')})`,
            MMMM: `(${monthsLong.join('|')})`,
            y: '(\\d{2})',
            yy: '(\\d{2})',
            yyy: '(\\d{4})',
            yyyy: '(\\d{4})',
            h: '(\\d{1,2})',
            hh: '(\\d{2})',
            m: '(\\d{1,2})',
            mm: '(\\d{2})',
            s: '(\\d{1,2})',
            ss: '(\\d{2})',
            Z: '([+-]\\d{2}:?\\d{2})',
            ZZ: '([+-]\\d{4})',
        };

        const tokens: string[] = [];
        let pattern = '';
        for (let i = 0; i < format.length; ) {
            let matched = false;
            for (const token of Object.keys(tokenMap).sort((a, b) => b.length - a.length)) {
                if (format.startsWith(token, i)) {
                    pattern += tokenMap[token];
                    tokens.push(token);
                    i += token.length;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                pattern += format[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                i++;
            }
        }

        const regex = new RegExp(`^${pattern}$`);
        const match = input.match(regex);
        if (!match) throw new Error(`Input "${input}" does not match format "${format}"`);

        let year = 1970,
            month = 1,
            day = 1,
            hour = 0,
            minute = 0,
            second = 0;
        let weekdayExpected: string | null = null;

        let j = 1;
        for (const token of tokens) {
            const raw = match[j++];
            switch (token) {
                case 'd':
                case 'dd':
                    day = parseInt(raw, 10);
                    break;
                case 'ddd':
                case 'dddd':
                    weekdayExpected = raw;
                    break;
                case 'M':
                case 'MM':
                    month = parseInt(raw, 10);
                    break;
                case 'MMM':
                    month = monthsShort.indexOf(raw) + 1;
                    break;
                case 'MMMM':
                    month = monthsLong.indexOf(raw) + 1;
                    break;
                case 'y':
                case 'yy':
                    year = 2000 + parseInt(raw, 10);
                    break;
                case 'yyy':
                case 'yyyy':
                    year = parseInt(raw, 10);
                    break;
                case 'h':
                case 'hh':
                    hour = parseInt(raw, 10);
                    break;
                case 'm':
                case 'mm':
                    minute = parseInt(raw, 10);
                    break;
                case 's':
                case 'ss':
                    second = parseInt(raw, 10);
                    break;
                case 'Z':
                case 'ZZ': {
                    const parts = raw.match(/([+-])(\d{2}):?(\d{2})/);
                    if (parts) {
                        const sign = parts[1] === '+' ? 1 : -1;
                        const hh = parseInt(parts[2], 10);
                        const mm = parseInt(parts[3], 10);
                        const offsetMinutes = sign * (hh * 60 + mm);

                        return new Date(
                            Date.UTC(year, month - 1, day, hour, minute - offsetMinutes, second),
                        );
                    }
                    break;
                }
            }
        }

        const parsed = new Date(year, month - 1, day, hour, minute, second);

        if (strictWeekday && weekdayExpected) {
            const actual = parsed.toLocaleDateString('en-US', {
                weekday: weekdayExpected.length === 3 ? 'short' : 'long',
            });
            if (weekdayExpected !== actual) {
                throw new Error(
                    `Weekday mismatch: expected "${weekdayExpected}", but got "${actual}"`,
                );
            }
        }

        return parsed;
    }

    /**
     * Pads a numeric value with leading zeroes for formatting.
     */
    private pad(num: number, length: number = 2): string {
        return num.toString().padStart(length, '0');
    }

    /**
     * Returns the ordinal suffix for a given day in month.
     *
     * @example
     * getOrdinal(1) === 'st', getOrdinal(22) === 'nd'
     */
    private getOrdinal(day: number): string {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1:
                return 'st';
            case 2:
                return 'nd';
            case 3:
                return 'rd';
            default:
                return 'th';
        }
    }

    /**
     * Map of custom format tokens to formatting functions.
     *
     * @remarks
     * Used by {@link toFormat} to expand tokens to locale-aware date/time pieces.
     */
    private formatTokens: Record<string, (d: Date) => string> = {
        d: d => d.getDate().toString(),
        dd: d => this.pad(d.getDate()),
        ddd: d => d.toLocaleDateString('en-GB', { weekday: 'short' }),
        dddd: d => d.toLocaleDateString('en-GB', { weekday: 'long' }),
        D: d =>
            `${d.toLocaleDateString('en-GB', {
                weekday: 'short',
            })} ${d.getDate()}`,
        DD: d =>
            `${d.toLocaleDateString('en-GB', {
                weekday: 'long',
            })} ${d.getDate()}`,
        o: d => this.getOrdinal(d.getDate()),
        M: d => (d.getMonth() + 1).toString(),
        MM: d => this.pad(d.getMonth() + 1),
        MMM: d => d.toLocaleDateString('en-GB', { month: 'short' }),
        MMMM: d => d.toLocaleDateString('en-GB', { month: 'long' }),
        y: d => d.getFullYear().toString().slice(-2),
        yy: d => d.getFullYear().toString().slice(-2),
        yyy: d => d.getFullYear().toString(),
        yyyy: d => d.getFullYear().toString(),
        h: d => (d.getHours() % 12 || 12).toString(),
        hh: d => this.pad(d.getHours() % 12 || 12),
        H: d => d.getHours().toString(),
        HH: d => this.pad(d.getHours()),
        m: d => d.getMinutes().toString(),
        mm: d => this.pad(d.getMinutes()),
        s: d => d.getSeconds().toString(),
        ss: d => this.pad(d.getSeconds()),
        t: d => (d.getHours() < 12 ? 'AM' : 'PM'),
        tt: d => (d.getHours() < 12 ? 'am' : 'pm'),
        Z: _d => this.formatOffset(true),
        ZZ: _d => this.formatOffset(false),
        z: d =>
            Intl.DateTimeFormat('en-GB', {
                timeZone: this.timezone || 'UTC',
                timeZoneName: 'short',
            })
                .format(d)
                .split(' ')
                .pop() || '',
        zzzz: d =>
            Intl.DateTimeFormat('en-GB', {
                timeZone: this.timezone || 'UTC',
                timeZoneName: 'long',
            })
                .format(d)
                .split(' ')
                .pop() || '',
    };

    /**
     * Returns the local timezone offset in minutes, positive east of UTC.
     */
    private getOffsetMinutes(): number {
        return -this.date.getTimezoneOffset();
    }

    /**
     * Formats the current timezone offset as a string.
     *
     * @param colon When true, uses `+HH:MM`, otherwise `+HHMM`.
     */
    private formatOffset(colon: boolean = true): string {
        const offset = this.getOffsetMinutes();
        const sign = offset >= 0 ? '+' : '-';
        const abs = Math.abs(offset);
        const hh = Math.floor(abs / 60)
            .toString()
            .padStart(2, '0');
        const mm = (abs % 60).toString().padStart(2, '0');
        return colon ? `${sign}${hh}:${mm}` : `${sign}${hh}${mm}`;
    }

    /**
     * Returns the native `Date.toString()` representation.
     */
    toString(): string {
        return this.date.toString();
    }

    /**
     * Returns the ISO 8601 string representation in UTC.
     */
    toISO(): string {
        return this.date.toISOString();
    }

    /**
     * Formats the date according to the custom token format.
     *
     * @remarks
     * Uses the internal token map, including locale-aware weekday/month text and timezone information.
     */
    toFormat(format: string): string {
        const tokens = Object.keys(this.formatTokens).sort((a, b) => b.length - a.length);
        let result = '';
        for (let i = 0; i < format.length; ) {
            let matched = false;
            for (const token of tokens) {
                if (format.startsWith(token, i)) {
                    result += this.formatTokens[token](this.date);
                    i += token.length;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                result += format[i];
                i++;
            }
        }
        return result;
    }

    /**
     * Returns the underlying epoch time in milliseconds.
     */
    getTime(): number {
        return this.date.getTime();
    }
    getDate(): number {
        return this.date.getDate();
    }
    getDay(): number {
        return this.date.getDay();
    }
    getMonth(): number {
        return this.date.getMonth() + 1;
    }
    getYear(): number {
        return this.date.getFullYear();
    }
    getHour(): number {
        return this.date.getHours();
    }
    getMinute(): number {
        return this.date.getMinutes();
    }
    getSecond(): number {
        return this.date.getSeconds();
    }

    /**
     * Adds another DateTime or a scalar amount in a specific unit and returns a new instance.
     *
     * @remarks
     * When passing a DateTime, millisecond timestamps are summed; when passing a number, the unit string is used.
     *
     * @throws Error If an unsupported unit string is provided.
     */
    add(value: DateTime): DateTime;
    add(value: number, type: string): DateTime;
    add(value: any, type?: string): DateTime {
        const newDate = new Date(this.date);
        if (value instanceof DateTime) {
            newDate.setTime(newDate.getTime() + value.getTime());
        } else if (typeof value === 'number' && type) {
            switch (type.toLowerCase()) {
                case 'milliseconds':
                    newDate.setMilliseconds(newDate.getMilliseconds() + value);
                    break;
                case 'seconds':
                    newDate.setSeconds(newDate.getSeconds() + value);
                    break;
                case 'minutes':
                    newDate.setMinutes(newDate.getMinutes() + value);
                    break;
                case 'hours':
                    newDate.setHours(newDate.getHours() + value);
                    break;
                case 'days':
                    newDate.setDate(newDate.getDate() + value);
                    break;
                case 'weeks':
                    newDate.setDate(newDate.getDate() + value * 7);
                    break;
                case 'months':
                    newDate.setMonth(newDate.getMonth() + value);
                    break;
                case 'years':
                    newDate.setFullYear(newDate.getFullYear() + value);
                    break;
                default:
                    throw new Error(`Unsupported add type: ${type}`);
            }
        }
        return new DateTime(newDate);
    }

    /**
     * Subtracts another DateTime or a scalar amount in a specific unit and returns a new instance.
     *
     * @remarks
     * When passing a DateTime, returns a duration whose epoch time is the millisecond difference
     * (this.getTime() - other.getTime()).
     * When passing a number, delegates to {@link add} with a negated value.
     */
    minus(value: DateTime): DateTime;
    minus(value: number, type: string): DateTime;
    minus(value: any, type?: string): DateTime {
        if (value instanceof DateTime) {
            // IMPORTANT: build a Date from the millisecond diff, not via the numeric (Excel) constructor.
            const diffMs = this.getTime() - value.getTime();
            return new DateTime(new Date(diffMs));
        } else {
            return this.add(-value, type!);
        }
    }

    /**
     * Attaches a display timezone identifier for formatting tokens that depend on it.
     *
     * @remarks
     * This does not shift the underlying instant, only how timezone-aware tokens (e.g. `z`, `zzzz`) are formatted.
     */
    addTimezone(timezone: string): DateTime {
        this.timezone = timezone;
        return this;
    }

    /**
     * Returns the ISO week number of the year (1–53).
     *
     * @remarks
     * Week calculation follows ISO-8601 rules: weeks start on Monday and week 1 is the week with the first Thursday.
     */
    getWeek(): number {
        const temp = new Date(this.date);
        temp.setHours(0, 0, 0, 0);
        temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
        const week1 = new Date(temp.getFullYear(), 0, 4);
        return (
            1 +
            Math.round(
                ((temp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) /
                    7,
            )
        );
    }

    /**
     * Returns the full weekday name in `en-GB` locale.
     */
    getDayOfWeek(): string {
        return this.date.toLocaleDateString('en-GB', { weekday: 'long' });
    }

    /**
     * Returns a new DateTime instance that shares the same underlying instant.
     */
    clone(): DateTime {
        return new DateTime(new Date(this.date));
    }

    /**
     * Checks if this instance occurs strictly before another.
     */
    isBefore(other: DateTime): boolean {
        return this.getTime() < other.getTime();
    }

    /**
     * Checks if this instance occurs strictly after another.
     */
    isAfter(other: DateTime): boolean {
        return this.getTime() > other.getTime();
    }

    /**
     * Checks if this instance represents the exact same millisecond as another.
     */
    isSame(other: DateTime): boolean {
        return this.getTime() === other.getTime();
    }

    /**
     * Checks whether this time falls between two other times with configurable inclusivity.
     *
     * @param start Lower bound.
     * @param end Upper bound.
     * @param inclusive One of `"()"`, `"[)"`, `"(]"`, `"[]"` to control boundary inclusion.
     *
     * @throws Error If an invalid inclusive flag is provided.
     */
    isBetween(start: DateTime, end: DateTime, inclusive: string = '()'): boolean {
        const t = this.getTime();
        const s = start.getTime();
        const e = end.getTime();

        switch (inclusive) {
            case '()':
                return t > s && t < e;
            case '[)':
                return t >= s && t < e;
            case '(]':
                return t > s && t <= e;
            case '[]':
                return t >= s && t <= e;
            default:
                throw new Error(`Invalid inclusive flag: ${inclusive}`);
        }
    }

    /**
     * Checks if this DateTime shares the same calendar day as another (year, month, day).
     */
    isSameDay(other: DateTime): boolean {
        return (
            this.getYear() === other.getYear() &&
            this.getMonth() === other.getMonth() &&
            this.getDate() === other.getDate()
        );
    }

    /**
     * Checks if this DateTime falls in the same calendar month as another.
     */
    isSameMonth(other: DateTime): boolean {
        return this.getYear() === other.getYear() && this.getMonth() === other.getMonth();
    }

    /**
     * Checks if this DateTime falls in the same calendar year as another.
     */
    isSameYear(other: DateTime): boolean {
        return this.getYear() === other.getYear();
    }

    /**
     * Returns a new DateTime snapped to the start of the given unit.
     *
     * @param unit One of `year`, `month`, `week`, `day`, `hour`, `minute`, `second` (case-insensitive).
     *
     * @throws Error If an unsupported unit is provided.
     */
    startOf(unit: string): DateTime {
        const d = new Date(this.date);
        switch (unit.toLowerCase()) {
            case 'year':
                d.setMonth(0, 1);
                d.setHours(0, 0, 0, 0);
                break;
            case 'month':
                d.setDate(1);
                d.setHours(0, 0, 0, 0);
                break;
            case 'week': {
                const day = d.getDay();
                d.setDate(d.getDate() - day);
                d.setHours(0, 0, 0, 0);
                break;
            }
            case 'day':
                d.setHours(0, 0, 0, 0);
                break;
            case 'hour':
                d.setMinutes(0, 0, 0);
                break;
            case 'minute':
                d.setSeconds(0, 0);
                break;
            case 'second':
                d.setMilliseconds(0);
                break;
            default:
                throw new Error(`Unsupported unit for startOf: ${unit}`);
        }
        return new DateTime(d);
    }

    /**
     * Returns a new DateTime snapped to the end of the given unit.
     *
     * @param unit One of `year`, `month`, `week`, `day`, `hour`, `minute`, `second` (case-insensitive).
     *
     * @throws Error If an unsupported unit is provided.
     */
    endOf(unit: string): DateTime {
        const d = new Date(this.date);
        switch (unit.toLowerCase()) {
            case 'year':
                d.setMonth(11, 31);
                d.setHours(23, 59, 59, 999);
                break;
            case 'month':
                d.setMonth(d.getMonth() + 1, 0);
                d.setHours(23, 59, 59, 999);
                break;
            case 'week': {
                const day = d.getDay();
                d.setDate(d.getDate() + (6 - day));
                d.setHours(23, 59, 59, 999);
                break;
            }
            case 'day':
                d.setHours(23, 59, 59, 999);
                break;
            case 'hour':
                d.setMinutes(59, 59, 999);
                break;
            case 'minute':
                d.setSeconds(59, 999);
                break;
            case 'second':
                d.setMilliseconds(999);
                break;
            default:
                throw new Error(`Unsupported unit for endOf: ${unit}`);
        }
        return new DateTime(d);
    }

    /**
     * Returns the raw numeric difference between this instance and another in the specified unit.
     *
     * @param other DateTime to compare against.
     * @param unit Unit to express the difference in; uses the same labels as {@link DiffUnit} but accepts any casing.
     *
     * @throws Error If an unsupported unit is requested.
     */
    diff(other: DateTime, unit: string = 'milliseconds'): number {
        const ms = this.getTime() - other.getTime();
        switch (unit.toLowerCase()) {
            case 'milliseconds':
                return ms;
            case 'seconds':
                return ms / 1000;
            case 'minutes':
                return ms / (1000 * 60);
            case 'hours':
                return ms / (1000 * 60 * 60);
            case 'days':
                return ms / (1000 * 60 * 60 * 24);
            case 'weeks':
                return ms / (1000 * 60 * 60 * 24 * 7);
            case 'months':
                return (
                    (this.getYear() - other.getYear()) * 12 + (this.getMonth() - other.getMonth())
                );
            case 'years':
                return this.getYear() - other.getYear();
            default:
                throw new Error(`Unsupported diff unit: ${unit}`);
        }
    }

    /**
     * Computes a human-friendly time difference between this instance and another.
     *
     * @param other DateTime to compare with.
     * @param opts Optional tuning for units and rounding.
     * @returns A descriptor including numeric value, chosen unit, label text and singular/plural metadata.
     *
     * @remarks
     * Picks the "largest" unit within the allowed range whose absolute value is at least 1.
     * Months and years are calculated using calendar arithmetic; other units are derived from milliseconds.
     *
     * @throws Error If `minUnit` or `maxUnit` are invalid or inconsistent with the allowed unit order.
     */
    diffAuto(
        other: DateTime,
        opts?: {
            minUnit?: DiffUnit;
            maxUnit?: DiffUnit;
            rounding?: 'round' | 'floor' | 'ceil';
            absolute?: boolean;
        },
    ): { value: number; unit: DiffUnit; unitSingular: string; unitPlural: string; label: string } {
        const {
            minUnit = 'seconds',
            maxUnit = 'years',
            rounding = 'round',
            absolute = true,
        } = opts || {};

        const order: DiffUnit[] = [
            'milliseconds',
            'seconds',
            'minutes',
            'hours',
            'days',
            'weeks',
            'months',
            'years',
        ];

        const clampRange = (units: DiffUnit[], lo: DiffUnit, hi: DiffUnit) => {
            const start = units.indexOf(lo);
            const end = units.indexOf(hi);
            if (start === -1 || end === -1) throw new Error('Invalid minUnit/maxUnit');
            return units.slice(Math.min(start, end), Math.max(start, end) + 1);
        };

        const candidates = clampRange(order, minUnit, maxUnit);

        if (this.getTime() === other.getTime()) {
            const chosenZero = candidates[0] || 'milliseconds';
            const { singular, plural } = UNIT_LABELS[chosenZero];
            return {
                value: 0,
                unit: chosenZero,
                unitSingular: singular,
                unitPlural: plural,
                label: `0 ${plural}`,
            };
        }

        const ms = this.diff(other, 'milliseconds');
        const s = ms / 1000;
        const m = s / 60;
        const h = m / 60;
        const d = h / 24;
        const w = d / 7;

        const months = this.diff(other, 'months');
        const years = this.diff(other, 'years');

        const byUnit: Record<DiffUnit, number> = {
            years,
            months,
            weeks: w,
            days: d,
            hours: h,
            minutes: m,
            seconds: s,
            milliseconds: ms,
        };

        const descending = [...candidates].sort((a, b) => order.indexOf(b) - order.indexOf(a));

        let chosen: DiffUnit | null = null;
        for (const u of descending) {
            if (Math.abs(byUnit[u]) >= 1) {
                chosen = u;
                break;
            }
        }
        if (!chosen) chosen = candidates[0];

        let value = byUnit[chosen];

        if (absolute) value = Math.abs(value);

        switch (rounding) {
            case 'floor':
                value = Math.floor(value);
                break;
            case 'ceil':
                value = Math.ceil(value);
                break;
            case 'round':
            default:
                value = Math.round(value);
                break;
        }

        const { singular, plural } = UNIT_LABELS[chosen];
        const label = `${value} ${Math.abs(value) === 1 ? singular : plural}`;

        return {
            value,
            unit: chosen,
            unitSingular: singular,
            unitPlural: plural,
            label,
        };
    }

    /**
     * Indicates whether the underlying Date represents a valid point in time.
     */
    isValid(): boolean {
        return !isNaN(this.date.getTime());
    }

    /**
     * Returns a clone of the given DateTime with a different display timezone.
     *
     * @remarks
     * The instant is preserved; only timezone-aware formatting changes.
     */
    static toNewTimezone(value: DateTime, timezone: string): DateTime {
        const iso = value.toISO();
        const dt = new DateTime(new Date(iso));
        dt.addTimezone(timezone);
        return dt;
    }

    /**
     * Builds an array of dates between two points in time using a given step unit.
     *
     * @param start Inclusive start DateTime.
     * @param end Inclusive end DateTime.
     * @param format Optional format string; when truthy, items are formatted strings, otherwise DateTime instances.
     * @param returnType Unit to step by (e.g. `days`, `hours`), case-insensitive.
     *
     * @throws Error If an unsupported `returnType` is provided.
     */
    static datesBetween(
        start: DateTime,
        end: DateTime,
        format: string,
        returnType: string,
    ): (DateTime | string)[] {
        const results: (DateTime | string)[] = [];
        let current = start.clone();
        const unit = returnType.toLowerCase();

        while (current.isBefore(end) || current.isSame(end)) {
            results.push(format ? current.toFormat(format) : current.clone());

            switch (unit) {
                case 'milliseconds':
                    current = current.add(1, 'milliseconds');
                    break;
                case 'seconds':
                    current = current.add(1, 'seconds');
                    break;
                case 'minutes':
                    current = current.add(1, 'minutes');
                    break;
                case 'hours':
                    current = current.add(1, 'hours');
                    break;
                case 'days':
                    current = current.add(1, 'days');
                    break;
                case 'weeks':
                    current = current.add(1, 'weeks');
                    break;
                case 'months':
                    current = current.add(1, 'months');
                    break;
                case 'years':
                    current = current.add(1, 'years');
                    break;
                default:
                    throw new Error(`Unsupported returnType: ${returnType}`);
            }
        }
        return results;
    }

    /**
     * Convenience wrapper to build a DateTime range with a specific unit step.
     *
     * @param start Inclusive start.
     * @param end Inclusive end.
     * @param unit Unit to step by, defaults to `days`.
     */
    static range(start: DateTime, end: DateTime, unit: string = 'days'): DateTime[] {
        return DateTime.datesBetween(start, end, '', unit) as DateTime[];
    }

    /**
     * Returns a DateTime representing the current instant.
     */
    static now(): DateTime {
        return new DateTime(new Date());
    }

    /**
     * Returns a DateTime for today at local midnight.
     */
    static today(): DateTime {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return new DateTime(d);
    }

    /**
     * Returns a DateTime for tomorrow at local midnight.
     */
    static tomorrow(): DateTime {
        return DateTime.today().add(1, 'days');
    }

    /**
     * Returns a DateTime for yesterday at local midnight.
     */
    static yesterday(): DateTime {
        return DateTime.today().minus(1, 'days');
    }

    /**
     * Creates a DateTime from an ISO 8601 string.
     */
    static fromISO(iso: string): DateTime {
        return new DateTime(new Date(iso));
    }

    /**
     * Creates a DateTime from an Excel serial date number.
     *
     * @remarks
     * Uses the same conversion rules as the instance-level Excel parser.
     */
    static fromExcel(serial: number): DateTime {
        return new DateTime(serial);
    }
}

// #endregion DateTime core

```

### File: packages\types\deno.json

```json
{
  "name": "@projective/types",
  "version": "0.0.0",
  "exports": "./mod.ts"
}

```

### File: packages\types\fields\form.ts

```ts
import { VNode } from 'preact';

// deno-lint-ignore no-explicit-any
export interface BaseFieldProps<T = any> {
	// Core Binding
	name: string;
	value?: T;
	onChange?: (value: T) => void;

	// Identifiers
	id?: string;
	label?: string;

	// State
	disabled?: boolean;
	required?: boolean;
	readonly?: boolean;

	// Validation
	error?: string;
	success?: boolean;

	// Visuals
	placeholder?: string;
	hint?: string; // Bottom helper text (neutral)
	helperText?: string; // Bottom helper text (can be semantic)
	className?: string;

	// Layout
	floatingLabel?: boolean;

	// Slots (Generic icons for consistency)
	iconLeft?: VNode;
	iconRight?: VNode;
}

```

### File: packages\types\fields\select.ts

```ts
import { VNode } from 'preact';

export interface SelectOption {
	label: string;
	value: string | number;
	icon?: VNode;
	avatarUrl?: string;
	group?: string;
	disabled?: boolean;
}

export interface SelectIcons {
	arrow?: VNode;
	arrowOpen?: VNode;
	clear?: VNode;
	loading?: VNode;
	valid?: VNode;
	invalid?: VNode;
}

export interface SelectFieldConfig {
	multiple?: boolean;
	clearable?: boolean;
	searchable?: boolean;
	placeholder?: string;
	loading?: boolean; // Async loading state

	// UX Features
	enableSelectAll?: boolean;
	displayMode?: 'chips-inside' | 'chips-below' | 'count' | 'comma';

	// Customization
	icons?: SelectIcons;

	// Optional Renderers
	renderOption?: (option: SelectOption) => VNode;
	renderSelection?: (selected: SelectOption[]) => VNode;
}

```

### File: packages\types\fields\slider.ts

```ts
import { BaseFieldProps } from './form.ts';

export interface SliderMark {
	value: number;
	label?: string;
}

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'inside';
export type TooltipVisibility = 'hover' | 'always' | 'active';

export interface SliderFieldProps extends BaseFieldProps<number | number[]> {
	min?: number;
	max?: number;
	step?: number;
	range?: boolean;

	// --- Physics ---
	// Allow handles to cross each other.
	// If true, value can be [80, 20] instead of strictly [20, 80].
	passthrough?: boolean;
	minDistance?: number;
	scale?: 'linear' | 'logarithmic';

	// --- Visuals ---
	marks?: boolean | number[] | SliderMark[];
	snapToMarks?: boolean;
	vertical?: boolean;
	height?: string;

	// --- Tooltips / Labels ---
	// If true, uses defaults. Or pass config object.
	tooltip?: boolean | {
		format?: (val: number) => string;
		position?: TooltipPosition;
		visibility?: TooltipVisibility;
	};

	jumpOnClick?: boolean;
}

```

### File: packages\types\fields\text.ts

```ts
import { VNode } from 'preact';
import { BaseFieldProps } from './form.ts';

export type InputType =
	| 'text'
	| 'password'
	| 'email'
	| 'number'
	| 'search'
	| 'tel'
	| 'url';

export type InputMode =
	| 'text'
	| 'decimal'
	| 'numeric'
	| 'tel'
	| 'search'
	| 'email'
	| 'url';

export interface TextFieldProps extends BaseFieldProps<string | number> {
	type?: InputType;
	inputMode?: InputMode;

	// --- Variants & Presets ---
	// "default" is standard.
	// "currency" adds onBlur formatting.
	// "credit-card" adds masking + luhn validation.
	variant?: 'default' | 'currency' | 'credit-card' | 'percentage';

	// --- Masking ---
	mask?: string;

	multiline?: boolean;
	rows?: number;
	autoGrow?: boolean;

	maxLength?: number;
	showCount?: boolean;

	clearable?: boolean;
	showPasswordToggle?: boolean;

	prefix?: string | VNode;
	suffix?: string | VNode;

	onFocus?: (e: FocusEvent) => void;
	onBlur?: (e: FocusEvent) => void;
	onKeyDown?: (e: KeyboardEvent) => void;
}

```

### File: packages\types\file.ts

```ts
import { BaseFieldProps } from "./fields/form.ts";

export type FileStatus = "pending" | "processing" | "ready" | "error";

export interface FileError {
	code: string;
	message: string;
}

export interface FileWithMeta {
	file: File; // The CURRENT file (may change after processing!)
	originalFile?: File; // Keep reference to original if needed
	id: string;
	preview?: string;
	status: FileStatus;
	progress: number; // 0-100
	errors: FileError[];
	processingMeta?: Record<string, any>; // Store WASM results here
}

export interface FileFieldProps extends BaseFieldProps<File[]> {
	accept?: string;
	maxSize?: number;
	maxFiles?: number;
	multiple?: boolean;
	layout?: "list" | "grid";
	dropzoneLabel?: string;

	// New: Inject processors
	processors?: import("./processing.ts").FileProcessor[];

	onDrop?: (acceptedFiles: File[], rejectedFiles: FileWithMeta[]) => void;
}

```

### File: packages\types\mod.ts

```ts
export * from './fields/form.ts';
export * from './fields/select.ts';
export * from './fields/slider.ts';
export * from './fields/text.ts';
export * from './processing.ts';
export * from './file.ts';
export * from './DateTime.ts';

```

### File: packages\types\processing.ts

```ts
export interface ProcessorResult {
	file: File; // The new, processed file (e.g. image.webp)
	metadata?: Record<string, any>; // Extra info (e.g. { compressionRatio: '40%' })
}

export interface FileProcessor {
	id: string;
	name: string; // e.g. "Image Optimizer"
	match: (file: File) => boolean; // Does this processor handle this file?
	process: (file: File, onProgress?: (pct: number) => void) => Promise<ProcessorResult>;
}

```

