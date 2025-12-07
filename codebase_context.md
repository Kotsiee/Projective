# Selected Codebase Context

> Included paths: ./packages/fields

## Project Tree (Selected)

```text
./packages/fields/
  fields/
  deno.json
  mod.ts
  src/
  components/
  accordion/
  Accordion.tsx
  AccordionContent.tsx
  AccordionItem.tsx
  AccordionTrigger.tsx
  index.ts
  ComboboxField.tsx
  DateField.tsx
  datetime/
  Calendar.tsx
  TimeClock.tsx
  DateTimeField.tsx
  FileDrop.tsx
  MoneyField.tsx
  overlays/
  Popover.tsx
  SelectField.tsx
  SliderField.tsx
  TagInput.tsx
  TextField.tsx
  TimeField.tsx
  hooks/
  useCurrencyMask.ts
  useFieldState.ts
  useFileProcessor.ts
  useGlobalDrag.ts
  useInteraction.ts
  useRipple.ts
  useSelectState.ts
  useSliderState.ts
  styles/
  components/
  accordion.css
  calendar.css
  datetime-field.css
  time-clock.css
  fields/
  combobox-field.css
  date-field.css
  file-drop.css
  select-field.css
  slider-field.css
  tag-input.css
  text-field.css
  overlays/
  popover.css
  theme.css
  wrappers/
  adornment-wrapper.css
  effect-wrapper.css
  field-array-wrapper.css
  label-wrapper.css
  message-wrapper.css
  skeleton-wrapper.css
  types/
  components/
  combobox-field.ts
  date-field.ts
  datetime-field.ts
  file-drop.ts
  money-field.ts
  select-field.ts
  slider-field.ts
  tag-input.ts
  text-field.ts
  time-field.ts
  core.ts
  file.ts
  wrappers.ts
  wrappers/
  AdornmentWrapper.tsx
  EffectWrapper.tsx
  FieldArrayWrapper.tsx
  GlobalFileDrop.tsx
  LabelWrapper.tsx
  MessageWrapper.tsx
  SkeletonWrapper.tsx
```

## File Contents

### File: packages\fields\deno.json

```json
{
  "name": "@projective/fields",
  "version": "0.0.0",
  "exports": "./mod.ts",
  "tasks": {
    "check": "deno fmt --check && deno lint && deno check main.ts",
    "dev": "vite --port 3000 --open --host --mode development",
    "build": "vite build --mode production",
    "start": "deno serve -A --watch --port 3000 --env-file=../../.env main.ts",
    "update": "deno run -A -r jsr:@fresh/update ."
  },
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  }
}

```

### File: packages\fields\mod.ts

```ts
// Styles
import './src/styles/theme.css';

// Types
export * from './src/types/core.ts';
// export * from './src/types/form.ts';

// Wrappers
export * from './src/wrappers/LabelWrapper.tsx';
export * from './src/wrappers/AdornmentWrapper.tsx';
export * from './src/wrappers/SkeletonWrapper.tsx';
export * from './src/wrappers/MessageWrapper.tsx';
export * from './src/wrappers/EffectWrapper.tsx';
export * from './src/wrappers/FieldArrayWrapper.tsx';

// Hooks
export * from './src/hooks/useInteraction.ts';
export * from './src/hooks/useRipple.ts';
export * from './src/hooks/useCurrencyMask.ts';

// Components
export * from './src/components/TextField.tsx';
export * from './src/components/SelectField.tsx';
export * from './src/components/SliderField.tsx';
export * from './src/components/DateField.tsx';
export * from './src/components/TimeField.tsx';
export * from './src/components/FileDrop.tsx';
export * from './src/components/TagInput.tsx';
export * from './src/components/MoneyField.tsx';
export * from './src/components/ComboboxField.tsx';
export * from './src/components/DateTimeField.tsx';
export * from './src/components/datetime/Calendar.tsx';
export * from './src/components/datetime/TimeClock.tsx';
export * from './src/components/overlays/Popover.tsx';
export * from './src/components/accordion/index.ts';

```

### File: packages\fields\src\components\accordion\Accordion.tsx

```tsx

```

### File: packages\fields\src\components\accordion\AccordionContent.tsx

```tsx

```

### File: packages\fields\src\components\accordion\AccordionItem.tsx

```tsx

```

### File: packages\fields\src\components\accordion\AccordionTrigger.tsx

```tsx

```

### File: packages\fields\src\components\accordion\index.ts

```ts
export * from './Accordion.tsx';
export * from './AccordionItem.tsx';
export * from './AccordionTrigger.tsx';
export * from './AccordionContent.tsx';

```

### File: packages\fields\src\components\ComboboxField.tsx

```tsx
import '../styles/fields/combobox-field.css';
import { JSX } from 'preact';
import { computed, Signal, useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { ComboboxFieldProps } from '../types/components/combobox-field.ts';
import { SelectOption } from '../types/components/select-field.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { EffectWrapper } from '../wrappers/EffectWrapper.tsx';

export function ComboboxField<T = string>(props: ComboboxFieldProps<T>) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		options,
		error,
		disabled,
		placeholder,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
	} = props;

	const containerRef = useRef<HTMLDivElement>(null);
	const menuPosition = useSignal<'down' | 'up'>('down');
	const interaction = useInteraction(
		value instanceof Signal ? value.value : value,
	);
	const isOpen = useSignal(false);
	const inputValue = useSignal('');

	const isValueSignal = value instanceof Signal;
	const internalSignal = useSignal(
		isValueSignal ? value.peek() : (value ?? defaultValue),
	);

	if (!isValueSignal && value !== undefined && value !== internalSignal.peek()) {
		internalSignal.value = value;
	}

	const signalValue = isValueSignal ? value : internalSignal;
	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = error instanceof Signal ? error.value : error;

	if (signalValue.value && !inputValue.value) {
		const selected = options.find((opt) => opt.value === signalValue.value);
		if (selected) {
			inputValue.value = selected.label;
		}
	}

	const filteredOptions = computed(() => {
		const term = inputValue.value.toLowerCase();
		return options.filter((opt) => opt.label.toLowerCase().includes(term));
	});

	// --- Positioning Logic ---
	useEffect(() => {
		if (isOpen.value && containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const spaceBelow = window.innerHeight - rect.bottom;
			menuPosition.value = spaceBelow < 250 ? 'up' : 'down';
		}
	}, [isOpen.value]);

	const handleInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
		inputValue.value = e.currentTarget.value;
		isOpen.value = true;
	};

	const handleOptionClick = (option: SelectOption<T>) => {
		if (option.disabled) return;

		if (isValueSignal) {
			(value as Signal<T>).value = option.value;
		} else {
			internalSignal.value = option.value;
		}
		inputValue.value = option.label;
		onChange?.(option.value);
		isOpen.value = false;
	};

	return (
		<div
			className={`field-combobox ${className || ''} ${
				menuPosition.value === 'up' ? 'field-combobox--up' : ''
			}`}
			style={style}
			ref={containerRef}
		>
			<div
				className={[
					'field-combobox__container',
					interaction.focused.value &&
					'field-combobox__container--focused',
					errorMessage && 'field-combobox__container--error',
					isDisabled && 'field-combobox__container--disabled',
				].filter(Boolean).join(' ')}
			>
				<EffectWrapper
					focused={interaction.focused}
					disabled={isDisabled}
				/>

				<input
					id={id}
					className='field-combobox__input'
					value={inputValue.value}
					onInput={handleInput}
					onFocus={(e) => {
						interaction.handleFocus(e);
						isOpen.value = true;
					}}
					onBlur={(e) => {
						setTimeout(() => {
							isOpen.value = false;
							interaction.handleBlur(e);
						}, 200);
					}}
					disabled={!!isDisabled}
					placeholder={placeholder}
				/>

				<div
					className={`field-combobox__menu ${
						isOpen.value && filteredOptions.value.length > 0 ? 'field-combobox__menu--open' : ''
					}`}
				>
					{filteredOptions.value.map((option) => (
						<div
							key={String(option.value)}
							className={[
								'field-combobox__option',
								option.value === signalValue.value &&
								'field-combobox__option--selected',
								option.disabled &&
								'field-combobox__option--disabled',
							].filter(Boolean).join(' ')}
							onMouseDown={(e) => {
								e.preventDefault();
								handleOptionClick(option);
							}}
						>
							{option.label}
						</div>
					))}
					{filteredOptions.value.length === 0 && (
						<div
							className='field-combobox__option'
							style={{
								cursor: 'default',
								color: 'var(--field-text-disabled)',
							}}
						>
							No options found
						</div>
					)}
				</div>
			</div>

			<LabelWrapper
				id={id}
				label={label}
				active={interaction.focused.value || !!inputValue.value ||
					!!placeholder}
				error={!!errorMessage}
				disabled={isDisabled}
				required={required}
				floating={floating}
				position={position}
				floatingRule={floatingRule}
			/>

			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}

```

### File: packages\fields\src\components\DateField.tsx

```tsx
import '../styles/fields/date-field.css';
import { computed, Signal, useSignal } from '@preact/signals';
import { DateFieldProps } from '../types/components/date-field.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { useFieldState } from '../hooks/useFieldState.ts';
import { AdornmentWrapper } from '../wrappers/AdornmentWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { DateTime } from '@projective/types';
import { Popover } from './overlays/Popover.tsx';
import { Calendar } from './datetime/Calendar.tsx';
import { TextField } from './TextField.tsx';
import { IconCalendar } from '@tabler/icons-preact';

export function DateField(props: DateFieldProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		minDate,
		maxDate,
		format = 'yyyy-MM-dd',
		error,
		disabled,
		prefix,
		suffix,
		onPrefixClick,
		onSuffixClick,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
	} = props;

	const fieldState = useFieldState({
		value,
		defaultValue,
		required,
		disabled,
		error,
		onChange,
	});

	const interaction = useInteraction(fieldState.value.value);
	const isOpen = useSignal(false);

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = fieldState.error.value;

	// Computed string value for the input
	const displayValue = computed(() => {
		const val = fieldState.value.value;
		if (!val) return '';
		return val.toFormat(format);
	});

	const handleDateSelect = (date: DateTime | [DateTime | null, DateTime | null]) => {
		if (Array.isArray(date)) return; // Range not supported yet in DateField
		fieldState.setValue(date);
		isOpen.value = false;
		interaction.handleBlur();
	};

	return (
		<div className={`field-date ${className || ''}`} style={style}>
			<Popover
				isOpen={isOpen.value}
				onClose={() => {
					isOpen.value = false;
					interaction.handleBlur();
				}}
				trigger={
					<div onClick={() => !isDisabled && (isOpen.value = !isOpen.value)}>
						<TextField
							id={id}
							label={label}
							value={displayValue.value}
							placeholder={format.toUpperCase()}
							error={errorMessage}
							disabled={isDisabled}
							required={required}
							floating={floating}
							position={position}
							floatingRule={floatingRule}
							readonly
							suffix={
								<AdornmentWrapper
									position='suffix'
									onClick={(e) => {
										e.stopPropagation();
										!isDisabled && (isOpen.value = !isOpen.value);
									}}
								>
									{suffix || <IconCalendar size={18} />}
								</AdornmentWrapper>
							}
							prefix={prefix}
							onPrefixClick={onPrefixClick}
							// Pass interaction handlers to manage focus state
							onFocus={interaction.handleFocus}
							onBlur={() => {}} // Managed by Popover close
						/>
					</div>
				}
				content={
					<Calendar
						value={fieldState.value.value}
						onChange={handleDateSelect}
						min={minDate}
						max={maxDate}
					/>
				}
			/>
			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}

```

### File: packages\fields\src\components\datetime\Calendar.tsx

```tsx
import '../../styles/components/calendar.css';
import { useComputed, useSignal } from '@preact/signals';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';
import { getCalendarGrid, getWeekdayLabels } from '@projective/utils';
import { DateTime } from '@projective/types';

// Types for Value: Single Date OR [Start, End]
export type DateValue = DateTime | [DateTime | null, DateTime | null];
export type CalendarScope = 'days' | 'months' | 'years';

export interface CalendarProps {
	value?: DateValue;
	onChange?: (date: DateValue) => void;
	min?: DateTime;
	max?: DateTime;
	startOfWeek?: 0 | 1;
	range?: boolean;
	className?: string;
}

export function Calendar(props: CalendarProps) {
	// --- State ---
	const initialView = Array.isArray(props.value)
		? (props.value[0] || new DateTime())
		: (props.value || new DateTime());

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
				const isCurrentMonth = (i + 1) === new DateTime().getMonth() &&
					viewDate.value.getYear() === new DateTime().getYear();
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
				const isCurrentYear = y === new DateTime().getYear();
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

### File: packages\fields\src\components\datetime\TimeClock.tsx

```tsx
import '../../styles/components/time-clock.css';
import { useSignal } from '@preact/signals';
import { useRef } from 'preact/hooks';
import { DateTime } from '@projective/types';
import { getAngleValue, getPosition } from '@projective/utils';

interface TimeClockProps {
	value?: DateTime;
	onChange?: (date: DateTime) => void;
	// If true, just H:M (24h or 12h config)
}

type ViewMode = 'hours' | 'minutes';

export function TimeClock(props: TimeClockProps) {
	const date = props.value || new DateTime();

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
		// const newDate = date.clone(); // Assume clone exists or we recreate
		// const currentH = newDate.getHour();

		if (mode.value === 'hours') {
			// Logic to preserve AM/PM
			// If val is 12, and isPm, it's 12. If !isPm, it's 0.
			// If val is 1-11, and isPm, val+12.
			// let h24 = val;
			// if (val === 12) h24 = 0;
			// if (isPm.value) h24 += 12;

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

### File: packages\fields\src\components\DateTimeField.tsx

```tsx
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

```

### File: packages\fields\src\components\FileDrop.tsx

```tsx
import '../styles/fields/file-drop.css';
import { JSX } from 'preact';
import { Signal, useSignal } from '@preact/signals';
import { FileFieldProps, FileWithMeta } from '../types/file.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { useFileProcessor } from '../hooks/useFileProcessor.ts';

export function FileDrop(props: FileFieldProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		accept,
		multiple,
		maxSize,
		maxFiles,
		disabled,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		processors,
		onDrop,
		error,
		hint,
		warning,
		info,
		dropzoneLabel,
	} = props;

	// Internal state for files if not controlled
	const internalFiles = useSignal<FileWithMeta[]>([]);

	// Determine if controlled
	const isControlled = value !== undefined;
	const currentFiles = isControlled ? (value || []) : internalFiles.value;

	const handleFilesChange = (newFiles: FileWithMeta[]) => {
		if (!isControlled) {
			internalFiles.value = newFiles;
		}
		onChange?.(newFiles);
	};

	const { addFiles, removeFile } = useFileProcessor(
		currentFiles,
		processors,
		handleFilesChange,
	);

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const inputRef = useSignal<HTMLInputElement | null>(null);
	const isDragging = useSignal(false);

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		if (isDisabled) return;
		isDragging.value = true;
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		isDragging.value = false;
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		isDragging.value = false;
		if (isDisabled) return;

		if (e.dataTransfer?.files) {
			const dropped = Array.from(e.dataTransfer.files);
			// TODO: Validate maxSize/maxFiles here before adding
			addFiles(dropped);
			onDrop?.(dropped, []); // TODO: Separate rejected
		}
	};

	const handleFileInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
		if (e.currentTarget.files) {
			const selected = Array.from(e.currentTarget.files);
			addFiles(selected);
		}
	};

	const handleClick = () => {
		if (!isDisabled && inputRef.value) {
			inputRef.value.click();
		}
	};

	return (
		<div className={`field-file ${className || ''}`} style={style}>
			{
				/* <LabelWrapper
				id={id}
				label={label}
				disabled={isDisabled}
				position={position}
				// FIX: Default to 'never' so label is static
				floatingRule={floatingRule ?? 'never'}
				required={required}
				floating={floating}
			/> */
			}

			<div
				className={[
					'field-file__dropzone',
					isDragging.value && 'field-file__dropzone--dragging',
					isDisabled && 'field-file__dropzone--disabled',
				].filter(Boolean).join(' ')}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={handleClick}
			>
				<input
					id={id}
					ref={(el) => {
						inputRef.value = el;
					}}
					type='file'
					className='field-file__input'
					onChange={handleFileInput}
					accept={accept}
					multiple={multiple}
					disabled={!!isDisabled}
				/>

				<div className='field-file__content'>
					<div className='field-file__text'>
						{dropzoneLabel || 'Drag & drop files or click to upload'}
					</div>
				</div>
			</div>

			{/* File List */}
			{currentFiles.length > 0 && (
				<div className='field-file__list'>
					{currentFiles.map((file) => (
						<div key={file.id} className='field-file__item'>
							<div className='field-file__item-info'>
								<span className='field-file__item-name'>{file.file.name}</span>
								<span className='field-file__item-size'>
									{(file.file.size / 1024).toFixed(1)} KB
								</span>
							</div>

							{file.status === 'processing' && (
								<div className='field-file__progress'>
									<div
										className='field-file__progress-bar'
										style={{ width: `${file.progress}%` }}
									/>
								</div>
							)}

							{file.status === 'error' && (
								<div className='field-file__error'>
									{file.errors[0]?.message}
								</div>
							)}

							<button
								type='button'
								className='field-file__remove'
								onClick={() => removeFile(file.id)}
								disabled={!!isDisabled}
							>
								×
							</button>
						</div>
					))}
				</div>
			)}

			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}

```

### File: packages\fields\src\components\MoneyField.tsx

```tsx
import { JSX } from 'preact';
import { Signal, useSignal } from '@preact/signals';
import { MoneyFieldProps } from '../types/components/money-field.ts';
import { TextField } from './TextField.tsx';
import { useCurrencyMask } from '../hooks/useCurrencyMask.ts';

export function MoneyField(props: MoneyFieldProps) {
	const {
		value,
		defaultValue,
		onChange,
		currency = 'USD',
		locale = 'en-US',
		...rest
	} = props;

	// Normalize signal
	const isValueSignal = value instanceof Signal;
	const internalSignal = useSignal(
		isValueSignal ? value.peek() : (value ?? defaultValue),
	);

	if (!isValueSignal && value !== undefined && value !== internalSignal.peek()) {
		internalSignal.value = value;
	}

	const signalValue = isValueSignal ? value : internalSignal;

	const { displayValue, handleBlur, handleFocus, handleChange } = useCurrencyMask(
		signalValue as Signal<number | undefined>,
		currency,
		locale,
	);

	return (
		<TextField
			{...rest}
			value={displayValue}
			onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => {
				handleChange(e.currentTarget.value);
				const val = signalValue.peek();
				if (val !== undefined) {
					onChange?.(val);
				}
			}}
			onBlur={() => {
				handleBlur();
			}}
			onFocus={() => {
				handleFocus();
			}}
			prefix={
				<span style={{ fontSize: '0.9em', fontWeight: 'bold' }}>
					{new Intl.NumberFormat(locale, {
						style: 'currency',
						currency,
					}).formatToParts(0).find((p) => p.type === 'currency')
						?.value}
				</span>
			}
		/>
	);
}

```

### File: packages\fields\src\components\overlays\Popover.tsx

```tsx
import { useEffect, useRef } from 'preact/hooks';
import { ComponentChildren } from 'preact';
import '../../styles/overlays/popover.css';

interface PopoverProps {
	isOpen: boolean;
	onClose: () => void;
	trigger: ComponentChildren;
	content: ComponentChildren;
	className?: string;
	position?: 'bottom-left' | 'bottom-right'; // Expandable later
}

export function Popover({
	isOpen,
	onClose,
	trigger,
	content,
	className,
	position = 'bottom-left',
}: PopoverProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	// Click Outside to Close
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				isOpen &&
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		}

		// Escape Key to Close
		function handleKeyDown(event: KeyboardEvent) {
			if (isOpen && event.key === 'Escape') {
				onClose();
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen, onClose]);

	return (
		<div className={`popover-wrapper ${className || ''}`} ref={containerRef}>
			{/* The Input/Button that toggles it */}
			<div className='popover-trigger'>
				{trigger}
			</div>

			{/* The Floating Content */}
			{isOpen && (
				<div className={`popover-content popover-content--${position}`}>
					{content}
				</div>
			)}
		</div>
	);
}

```

### File: packages\fields\src\components\SelectField.tsx

```tsx
import '../styles/fields/select-field.css';
import { computed, Signal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { IconCheck, IconChevronDown, IconLoader2, IconSelector, IconX } from '@tabler/icons-preact';
import { SelectFieldProps, SelectOption } from '../types/components/select-field.ts';
import { useSelectState } from '../hooks/useSelectState.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { EffectWrapper, useRipple } from '../wrappers/EffectWrapper.tsx';

export function SelectField<T = string>(props: SelectFieldProps<T>) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		options,
		error,
		disabled,
		placeholder,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
		multiple,
		searchable,
		clearable,
		loading,
		displayMode = 'chips-inside',
		enableSelectAll,
		icons,
	} = props;

	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	const interaction = useInteraction(
		value instanceof Signal ? value.value : value,
	);
	const { ripples, addRipple } = useRipple();

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = error instanceof Signal ? error.value : error;

	// Use our new comprehensive hook
	const {
		isOpen,
		highlightedIndex,
		searchQuery,
		filteredOptions,
		selectedValues,
		toggleOpen,
		selectOption,
		removeValue,
		toggleSelectAll,
		handleKeyDown,
	} = useSelectState({
		options,
		value,
		onChange,
		multiple,
		disabled: !!isDisabled,
	});

	// --- Positioning Logic ---
	useEffect(() => {
		if (isOpen.value && containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const spaceBelow = window.innerHeight - rect.bottom;
			if (containerRef.current.classList.contains('field-select--up')) {
				if (spaceBelow > 250) containerRef.current.classList.remove('field-select--up');
			} else {
				if (spaceBelow < 250) containerRef.current.classList.add('field-select--up');
			}

			// Focus search input if searchable
			if (searchable && inputRef.current) {
				inputRef.current.focus();
			}

			// Scroll highlight into view
			if (listRef.current && highlightedIndex.value >= 0) {
				const highlightedEl = listRef.current.children[highlightedIndex.value] as HTMLElement;
				if (highlightedEl) {
					highlightedEl.scrollIntoView({ block: 'nearest' });
				}
			}
		}
	}, [isOpen.value, highlightedIndex.value]);

	// Close on click outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				toggleOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// --- Render Helpers ---

	const isValueSelected = (val: T) => selectedValues.value.includes(val);

	const renderStatusIcon = () => {
		if (loading) return icons?.loading || <IconLoader2 className='field-select__spin' size={18} />;
		if (errorMessage) return icons?.invalid; // Optional: <IconAlertCircle />
		if (isOpen.value) return icons?.arrowOpen || <IconChevronDown size={18} />;
		return icons?.arrow || <IconChevronDown size={18} />;
	};

	const renderChips = () => {
		return selectedValues.value.map((val) => {
			const opt = options.find((o) => o.value === val);
			if (!opt) return null;
			return (
				<span key={String(val)} className='field-select__chip'>
					{opt.icon && <span className='field-select__chip-icon'>{opt.icon}</span>}
					{opt.label}
					<span
						className='field-select__chip-remove'
						onMouseDown={(e) => {
							e.preventDefault();
							e.stopPropagation();
							removeValue(val);
						}}
					>
						{icons?.remove || <IconX size={14} />}
					</span>
				</span>
			);
		});
	};

	const renderValue = () => {
		if (displayMode === 'count' && selectedValues.value.length > 0) {
			return <span className='field-select__summary'>{selectedValues.value.length} selected</span>;
		}

		if (multiple && displayMode === 'chips-inside') {
			return renderChips();
		}

		if (!multiple && selectedValues.value.length > 0) {
			// Single value
			const val = selectedValues.value[0];
			const opt = options.find((o) => o.value === val);
			if (opt) {
				// Hide label if searching to avoid overlap
				if (searchable && searchQuery.value) return null;
				return (
					<div className='field-select__single'>
						{opt.icon && <span className='field-select__icon'>{opt.icon}</span>}
						{opt.avatarUrl && <img src={opt.avatarUrl} className='field-select__avatar' />}
						{opt.label}
					</div>
				);
			}
		}

		return null;
	};

	const handleContainerClick = (e: MouseEvent) => {
		if (isDisabled) return;
		// If clicking input, don't toggle if already open
		if (searchable && isOpen.value && e.target === inputRef.current) return;

		addRipple(e);
		toggleOpen();
		if (!isOpen.value) interaction.handleFocus(e);
	};

	// Grouping Logic
	let lastGroup: string | undefined = undefined;

	return (
		<div
			className={`field-select ${className || ''}`}
			style={style}
			ref={containerRef}
		>
			<LabelWrapper
				id={id}
				label={label}
				active={isOpen.value || selectedValues.value.length > 0 || !!placeholder ||
					!!searchQuery.value}
				error={!!errorMessage}
				disabled={isDisabled}
				required={required}
				floating={floating}
				position={position}
				floatingRule={floatingRule}
			/>

			<div
				className={[
					'field-select__container',
					isOpen.value && 'field-select__container--open',
					interaction.focused.value && 'field-select__container--focused',
					errorMessage && 'field-select__container--error',
					isDisabled && 'field-select__container--disabled',
				].filter(Boolean).join(' ')}
				onClick={handleContainerClick}
				onMouseDown={(e) => {
					// Prevent blur if clicking container
					if (e.target !== inputRef.current) e.preventDefault();
				}}
			>
				<EffectWrapper
					focused={interaction.focused}
					disabled={isDisabled}
				/>

				<div
					className='field-ripple-container'
					style={{
						position: 'absolute',
						inset: 0,
						overflow: 'hidden',
						pointerEvents: 'none',
						borderRadius: 'inherit',
					}}
				>
					{ripples.value.map((r) => (
						<span key={r.id} className='field-ripple' style={{ left: r.x, top: r.y }} />
					))}
				</div>

				<div className='field-select__content'>
					{renderValue()}

					{(searchable || (selectedValues.value.length === 0 && placeholder)) && (
						<input
							ref={inputRef}
							className='field-select__input'
							value={searchQuery.value}
							placeholder={selectedValues.value.length === 0
								? (placeholder || (floating ? '' : 'Select...'))
								: ''}
							onInput={(e) => searchQuery.value = e.currentTarget.value}
							onKeyDown={handleKeyDown}
							onFocus={interaction.handleFocus}
							onBlur={() => {
								setTimeout(() => interaction.handleBlur(), 100);
							}}
							disabled={!!isDisabled}
							readOnly={!searchable}
						/>
					)}
				</div>

				{clearable && !loading && selectedValues.value.length > 0 && (
					<div
						className='field-select__clear'
						onClick={(e) => {
							e.stopPropagation();
							if (multiple) {
								if (value instanceof Signal) value.value = [];
								onChange?.([]);
							} else {
								if (value instanceof Signal) value.value = undefined as any;
								onChange?.(undefined as any);
							}
						}}
					>
						<IconX size={16} />
					</div>
				)}

				<div className={`field-select__arrow ${isOpen.value ? 'field-select__arrow--flip' : ''}`}>
					{renderStatusIcon()}
				</div>

				{/* Dropdown Menu */}
				<div
					className={`field-select__menu ${isOpen.value ? 'field-select__menu--open' : ''}`}
					ref={listRef}
				>
					{multiple && enableSelectAll && filteredOptions.value.length > 0 && (
						<div
							className='field-select__action-bar'
							onClick={(e) => {
								e.stopPropagation();
								toggleSelectAll();
							}}
						>
							<IconSelector size={16} />
							<span>Select All</span>
						</div>
					)}

					{filteredOptions.value.length === 0
						? <div className='field-select__no-options'>No options found</div>
						: (
							filteredOptions.value.map((option, index) => {
								const isSelected = isValueSelected(option.value);
								const isHighlighted = index === highlightedIndex.value;
								const showHeader = option.group !== lastGroup;
								lastGroup = option.group;

								return (
									<div key={String(option.value)}>
										{showHeader && option.group && (
											<div className='field-select__group'>{option.group}</div>
										)}
										<div
											className={[
												'field-select__option',
												isSelected && 'field-select__option--selected',
												isHighlighted && 'field-select__option--highlighted',
												option.disabled && 'field-select__option--disabled',
											].filter(Boolean).join(' ')}
											onClick={(e) => {
												e.stopPropagation();
												selectOption(option);
											}}
											onMouseEnter={() => highlightedIndex.value = index}
										>
											{/* Icon / Avatar */}
											{option.icon && (
												<span className='field-select__option-icon'>{option.icon}</span>
											)}
											{option.avatarUrl && (
												<img src={option.avatarUrl} className='field-select__avatar' />
											)}

											<span className='field-select__option-label'>{option.label}</span>

											{isSelected && (
												<span className='field-select__check'>
													{icons?.check || <IconCheck size={16} />}
												</span>
											)}
										</div>
									</div>
								);
							})
						)}
				</div>
			</div>

			{/* Chips Below Mode */}
			{multiple && displayMode === 'chips-below' && selectedValues.value.length > 0 && (
				<div className='field-select__chips-external'>
					{renderChips()}
				</div>
			)}

			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}

```

### File: packages\fields\src\components\SliderField.tsx

```tsx
import '../styles/fields/slider-field.css';
import { Signal } from '@preact/signals';
import { SliderFieldProps, SliderMark } from '../types/components/slider-field.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { useSliderState } from '../hooks/useSliderState.ts';
import { valueToPercent, valueToPercentLog } from '@projective/utils';

export function SliderField(props: SliderFieldProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		min = 0,
		max = 100,
		step = 1,
		disabled,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
		error,
		range,
		marks,
		snapToMarks,
		vertical,
		scale,
		minDistance,
		passthrough,
	} = props;

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = error instanceof Signal ? error.value : error;

	// Unwrap signal value if present, or use raw value
	const rawValue = value instanceof Signal ? value.value : (value ?? defaultValue);

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
		value: rawValue,
		onChange: (val) => {
			if (value instanceof Signal) {
				(value as Signal<number | number[]>).value = val;
			}
			onChange?.(val);
		},
		min,
		max,
		step,
		range,
		disabled: !!isDisabled,
		marks,
		snapToMarks,
		vertical,
		scale,
		minDistance,
		passthrough,
	});

	const renderMarks = () => {
		if (!marks) return null;
		let points: SliderMark[] = [];
		if (Array.isArray(marks)) {
			points = marks.map((m) => (typeof m === 'number' ? { value: m } : m));
		} else if (marks === true) {
			if (scale === 'logarithmic') return null;
			const count = (max - min) / step;
			if (count > 100) return null;
			for (let i = min; i <= max; i += step) points.push({ value: i });
		}

		return (
			<div className='field-slider__marks'>
				{points.map((mark, i) => {
					const pct = scale === 'logarithmic'
						? valueToPercentLog(mark.value, min, max)
						: valueToPercent(mark.value, min, max);
					if (pct < 0 || pct > 100) return null;

					const style = vertical
						? { bottom: `${pct}%`, left: '50%' }
						: { left: `${pct}%`, top: '50%' };

					return (
						<div key={i} className='field-slider__mark' style={style}>
							<div className='field-slider__mark-tick'></div>
							{mark.label && <div className='field-slider__mark-label'>{mark.label}</div>}
						</div>
					);
				})}
			</div>
		);
	};

	const containerClasses = [
		'field-slider',
		className,
		isDisabled ? 'field-slider--disabled' : '',
		range ? 'field-slider--range' : '',
		marks ? 'field-slider--has-marks' : '',
		vertical ? 'field-slider--vertical' : '',
	].filter(Boolean).join(' ');

	const wrapperStyle = vertical && props.height ? { height: props.height } : {};

	return (
		<div className={containerClasses} style={style}>
			<LabelWrapper
				id={id}
				label={label}
				disabled={isDisabled}
				position={position}
				// FIX: Default to 'never' for sliders so label is static above
				floatingRule={floatingRule ?? 'never'}
				required={required}
				floating={floating}
			/>

			{/* Control Wrapper */}
			<div className='field-slider__control' style={wrapperStyle}>
				<div
					className='field-slider__container'
					onClick={(e: MouseEvent) => handleTrackClick(e as PointerEvent)}
				>
					<div className='field-slider__track' ref={trackRef}>
						{/* Fill */}
						<div className='field-slider__fill' style={trackFillStyle.value}></div>

						{/* Marks */}
						{renderMarks()}

						{/* Handles */}
						{handleStyles.value.map((style, index) => {
							const isActive = activeHandleIdx.value === index;
							const val = internalValues.value[index];

							return (
								<div
									key={index}
									className={`field-slider__thumb ${isActive ? 'field-slider__thumb--active' : ''}`}
									style={style}
									tabIndex={isDisabled ? -1 : 0}
									role='slider'
									aria-orientation={vertical ? 'vertical' : 'horizontal'}
									aria-valuemin={min}
									aria-valuemax={max}
									aria-valuenow={val}
									onPointerDown={(e) => handlePointerDown(index, e)}
									onPointerMove={handlePointerMove}
									onPointerUp={handlePointerUp}
									onContextMenu={(e) => e.preventDefault()}
								>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			<MessageWrapper error={errorMessage} hint={hint} warning={warning} info={info} />
		</div>
	);
}

```

### File: packages\fields\src\components\TagInput.tsx

```tsx
import '../styles/fields/tag-input.css';
import { Signal, useSignal } from '@preact/signals';
import { TagInputProps } from '../types/components/tag-input.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { EffectWrapper } from '../wrappers/EffectWrapper.tsx';

export function TagInput(props: TagInputProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		error,
		disabled,
		placeholder,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
	} = props;

	const interaction = useInteraction(
		value instanceof Signal ? value.value : value,
	);
	const inputValue = useSignal('');

	const isValueSignal = value instanceof Signal;
	const internalSignal = useSignal(
		isValueSignal ? value.peek() : (value ?? defaultValue ?? []),
	);

	if (!isValueSignal && value !== undefined && value !== internalSignal.peek()) {
		internalSignal.value = value;
	}

	const signalValue = isValueSignal ? value : internalSignal;
	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = error instanceof Signal ? error.value : error;

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			const val = inputValue.value.trim();
			if (val) {
				const currentTags = signalValue.value || [];
				if (!currentTags.includes(val)) {
					const newTags = [...currentTags, val];
					if (isValueSignal) {
						(value as Signal<string[]>).value = newTags;
					} else {
						internalSignal.value = newTags;
					}
					onChange?.(newTags);
				}
				inputValue.value = '';
			}
		} else if (
			e.key === 'Backspace' && !inputValue.value &&
			signalValue.value?.length
		) {
			const newTags = signalValue.value.slice(0, -1);
			if (isValueSignal) {
				(value as Signal<string[]>).value = newTags;
			} else {
				internalSignal.value = newTags;
			}
			onChange?.(newTags);
		}
	};

	const removeTag = (tagToRemove: string) => {
		const currentTags = signalValue.value || [];
		const newTags = currentTags.filter((tag) => tag !== tagToRemove);
		if (isValueSignal) {
			(value as Signal<string[]>).value = newTags;
		} else {
			internalSignal.value = newTags;
		}
		onChange?.(newTags);
	};

	const handleContainerClick = (e: MouseEvent) => {
		if (isDisabled) return;
		const input = (e.currentTarget as HTMLElement).querySelector('input');
		input?.focus();
	};

	return (
		<div className={`field-tag ${className || ''}`} style={style}>
			<div
				className={[
					'field-tag__container',
					interaction.focused.value &&
					'field-tag__container--focused',
					errorMessage && 'field-tag__container--error',
					isDisabled && 'field-tag__container--disabled',
				].filter(Boolean).join(' ')}
				onClick={handleContainerClick}
			>
				<EffectWrapper
					focused={interaction.focused}
					disabled={isDisabled}
				/>

				{signalValue.value?.map((tag) => (
					<div key={tag} className='field-tag__chip'>
						<span>{tag}</span>
						<span
							className='field-tag__chip-remove'
							onClick={(e) => {
								e.stopPropagation();
								removeTag(tag);
							}}
						>
							&times;
						</span>
					</div>
				))}

				<input
					id={id}
					className='field-tag__input'
					value={inputValue.value}
					onInput={(e) => inputValue.value = e.currentTarget.value}
					onKeyDown={handleKeyDown}
					onFocus={interaction.handleFocus}
					onBlur={interaction.handleBlur}
					disabled={!!isDisabled}
					placeholder={signalValue.value?.length ? '' : placeholder}
				/>
			</div>

			{/* FIX: LabelWrapper moved to end */}
			<LabelWrapper
				id={id}
				label={label}
				active={interaction.focused.value ||
					(signalValue.value && signalValue.value.length > 0) ||
					!!placeholder}
				error={!!errorMessage}
				disabled={isDisabled}
				required={required}
				floating={floating}
				position={position}
				floatingRule={floatingRule}
			/>

			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}

```

### File: packages\fields\src\components\TextField.tsx

```tsx
import '../styles/fields/text-field.css';
import { JSX } from 'preact';
import { computed, Signal, useSignal } from '@preact/signals';
import { TextFieldProps } from '../types/components/text-field.ts';
import { useFieldState } from '../hooks/useFieldState.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { EffectWrapper } from '../wrappers/EffectWrapper.tsx';
import { AdornmentWrapper } from '../wrappers/AdornmentWrapper.tsx';

export function TextField(props: TextFieldProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		error,
		disabled,
		placeholder,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
		type = 'text',
		multiline,
		rows = 3,
		maxRows,
		autoComplete,
		pattern,
		minLength,
		maxLength,
		showCount,
		prefix,
		suffix,
		onPrefixClick,
		onSuffixClick,
		onInput,
		onFocus,
		onBlur,
	} = props;

	// 1. State Management
	const fieldState = useFieldState({
		value,
		defaultValue: defaultValue ?? '',
		required,
		disabled,
		error,
		onChange,
	});

	const interaction = useInteraction(fieldState.value.value);

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = fieldState.error.value;
	const val = fieldState.value.value || '';

	// 2. Computed
	const length = computed(() => val.length);
	const isOverLimit = computed(() => maxLength ? length.value > maxLength : false);

	// 3. Handlers
	const handleContainerClick = (e: MouseEvent) => {
		if (isDisabled) return;
		const input = (e.currentTarget as HTMLElement).querySelector<
			HTMLInputElement | HTMLTextAreaElement
		>('.field-text__input');
		input?.focus();
	};

	const handleInput = (e: JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const newValue = e.currentTarget.value;
		fieldState.setValue(newValue);
		interaction.handleChange(newValue);
		onInput?.(e);
	};

	// 4. Render Helpers
	const renderInput = () => {
		const commonProps = {
			id,
			className: 'field-text__input',
			value: val,
			onInput: handleInput,
			onFocus: (e: any) => {
				interaction.handleFocus(e);
				onFocus?.(e);
			},
			onBlur: (e: any) => {
				interaction.handleBlur(e);
				fieldState.validate();
				onBlur?.(e);
			},
			disabled: !!isDisabled,
			placeholder: placeholder,
			autoComplete,
			maxLength,
			minLength,
		};

		if (multiline) {
			return (
				<textarea
					{...commonProps}
					rows={rows}
					style={maxRows ? { maxHeight: `${maxRows * 1.5}em` } : undefined}
				/>
			);
		}

		return (
			<input
				{...commonProps}
				type={type}
				pattern={pattern}
			/>
		);
	};

	return (
		<div className={`field-text ${className || ''}`} style={style}>
			<div
				className={[
					'field-text__container',
					interaction.focused.value && 'field-text__container--focused',
					errorMessage && 'field-text__container--error',
					isDisabled && 'field-text__container--disabled',
				].filter(Boolean).join(' ')}
				onClick={handleContainerClick}
			>
				<EffectWrapper
					focused={interaction.focused}
					disabled={isDisabled}
				/>

				<AdornmentWrapper
					position='prefix'
					onClick={onPrefixClick}
				>
					{prefix}
				</AdornmentWrapper>

				{/* Label Moved Inside Container for Correct Relative Positioning */}
				<LabelWrapper
					id={id}
					label={label}
					active={interaction.focused.value || !!val || !!placeholder}
					error={!!errorMessage}
					disabled={isDisabled}
					required={required}
					floating={floating}
					position={position}
					floatingRule={floatingRule}
					multiline={multiline}
				/>

				{renderInput()}

				<AdornmentWrapper
					position='suffix'
					onClick={onSuffixClick}
				>
					{suffix}
				</AdornmentWrapper>
			</div>

			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<div style={{ flex: 1 }}>
					<MessageWrapper
						error={fieldState.error}
						hint={hint}
						warning={warning}
						info={info}
					/>
				</div>

				{showCount && maxLength && (
					<div
						className={`field-text__count ${isOverLimit.value ? 'field-text__count--limit' : ''}`}
					>
						{length}/{maxLength}
					</div>
				)}
			</div>
		</div>
	);
}

```

### File: packages\fields\src\components\TimeField.tsx

```tsx
import '../styles/fields/date-field.css';
import { computed, Signal, useSignal } from '@preact/signals';
import { TimeFieldProps } from '../types/components/time-field.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { useFieldState } from '../hooks/useFieldState.ts';
import { AdornmentWrapper } from '../wrappers/AdornmentWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { DateTime } from '@projective/types';
import { Popover } from './overlays/Popover.tsx';
import { TimeClock } from './datetime/TimeClock.tsx';
import { TextField } from './TextField.tsx';
import { IconClock } from '@tabler/icons-preact';

export function TimeField(props: TimeFieldProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		error,
		disabled,
		placeholder,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
	} = props;

	const fieldState = useFieldState({
		value,
		defaultValue,
		required,
		disabled,
		error,
		onChange,
	});

	const interaction = useInteraction(fieldState.value.value);
	const isOpen = useSignal(false);

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = fieldState.error.value;

	// Computed string value for the input
	const displayValue = computed(() => {
		const val = fieldState.value.value;
		if (!val) return '';
		return val.toFormat('HH:mm');
	});

	const handleTimeSelect = (date: DateTime) => {
		fieldState.setValue(date);
		// Don't close immediately to allow minute selection?
		// TimeClock handles switching modes. Maybe close on minute selection finish?
		// For now, let user click outside or we can add a "Done" button if needed.
		// Or check if minute selection is done in TimeClock (it has internal state).
	};

	return (
		<div className={`field-date ${className || ''}`} style={style}>
			<Popover
				isOpen={isOpen.value}
				onClose={() => {
					isOpen.value = false;
					interaction.handleBlur();
				}}
				trigger={
					<div onClick={() => !isDisabled && (isOpen.value = !isOpen.value)}>
						<TextField
							id={id}
							label={label}
							value={displayValue.value}
							placeholder={placeholder || 'HH:MM'}
							error={errorMessage}
							disabled={isDisabled}
							required={required}
							floating={floating}
							position={position}
							floatingRule={floatingRule}
							readonly
							suffix={
								<AdornmentWrapper
									position='suffix'
									onClick={(e) => {
										e.stopPropagation();
										!isDisabled && (isOpen.value = !isOpen.value);
									}}
								>
									<IconClock size={18} />
								</AdornmentWrapper>
							}
							onFocus={interaction.handleFocus}
							onBlur={() => {}}
						/>
					</div>
				}
				content={
					<TimeClock
						value={fieldState.value.value}
						onChange={handleTimeSelect}
					/>
				}
			/>
			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}

```

### File: packages\fields\src\hooks\useCurrencyMask.ts

```ts
import { Signal, useSignal } from "@preact/signals";

export function useCurrencyMask(
    value: Signal<number | undefined>,
    currency = "USD",
    locale = "en-US",
) {
    const displayValue = useSignal("");

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency: currency,
        }).format(val);
    };

    const parseCurrency = (val: string): number => {
        // Remove non-numeric characters except decimal point
        const clean = val.replace(/[^0-9.-]+/g, "");
        return parseFloat(clean);
    };

    const handleBlur = () => {
        if (value.value !== undefined && !isNaN(value.value)) {
            displayValue.value = formatCurrency(value.value);
        } else {
            displayValue.value = "";
        }
    };

    const handleFocus = () => {
        if (value.value !== undefined && !isNaN(value.value)) {
            displayValue.value = value.value.toString();
        } else {
            displayValue.value = "";
        }
    };

    const handleChange = (val: string) => {
        displayValue.value = val;
        const parsed = parseCurrency(val);
        if (!isNaN(parsed)) {
            value.value = parsed;
        } else {
            value.value = undefined;
        }
    };

    // Initialize display value
    if (value.value !== undefined && !displayValue.value) {
        displayValue.value = formatCurrency(value.value);
    }

    return {
        displayValue,
        handleBlur,
        handleFocus,
        handleChange,
    };
}

```

### File: packages\fields\src\hooks\useFieldState.ts

```ts
import { Signal, useSignal } from '@preact/signals';

export interface FieldStateProps<T> {
	value?: T | Signal<T>;
	defaultValue?: T;
	required?: boolean;
	disabled?: boolean | Signal<boolean>;
	error?: string | Signal<string | undefined>;
	onChange?: (value: T) => void;
}

export interface FieldState<T> {
	value: Signal<T>;
	error: Signal<string | undefined>;
	dirty: Signal<boolean>;
	touched: Signal<boolean>;
	setValue: (newValue: T) => void;
	validate: () => boolean;
}

export function useFieldState<T>(props: FieldStateProps<T>): FieldState<T> {
	// Normalize value signal
	const isValueSignal = props.value instanceof Signal;
	const internalValue = useSignal<T>(
		isValueSignal ? (props.value as Signal<T>).peek() : (props.value ?? props.defaultValue) as T,
	);

	// Sync if prop changes and is not a signal
	if (!isValueSignal && props.value !== undefined && props.value !== internalValue.peek()) {
		internalValue.value = props.value as T;
	}

	const valueSignal = isValueSignal ? (props.value as Signal<T>) : internalValue;

	const errorSignal = useSignal<string | undefined>(
		props.error instanceof Signal ? props.error.peek() : props.error,
	);

	// Sync error prop
	if (
		props.error !== undefined && !(props.error instanceof Signal) &&
		props.error !== errorSignal.peek()
	) {
		errorSignal.value = props.error;
	}

	const dirty = useSignal(false);
	const touched = useSignal(false);

	const validate = () => {
		if (props.required) {
			const val = valueSignal.value;
			const isEmpty = val === undefined || val === null || val === '' ||
				(Array.isArray(val) && val.length === 0);
			if (isEmpty) {
				errorSignal.value = 'This field is required';
				return false;
			}
		}
		// Clear error if it was "This field is required" but now has value
		if (errorSignal.value === 'This field is required') {
			errorSignal.value = undefined;
		}
		return true;
	};

	const setValue = (newValue: T) => {
		valueSignal.value = newValue;
		dirty.value = true;
		props.onChange?.(newValue);
		if (touched.value) {
			validate();
		}
	};

	return {
		value: valueSignal,
		error: errorSignal,
		dirty,
		touched,
		setValue,
		validate,
	};
}

```

### File: packages\fields\src\hooks\useFileProcessor.ts

```ts
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { FileProcessor, FileWithMeta } from '../types/file.ts';

// Simple ID generator if uuid not available
const generateId = () => Math.random().toString(36).substring(2, 15);

export function useFileProcessor(
	files: FileWithMeta[],
	processors: FileProcessor[] = [],
	onChange: (files: FileWithMeta[]) => void,
) {
	const processingQueue = useSignal<string[]>([]);

	useEffect(() => {
		const pendingFiles = files.filter(
			(f) => f.status === 'pending' && !processingQueue.value.includes(f.id),
		);

		if (pendingFiles.length === 0) return;

		pendingFiles.forEach((fileMeta) => {
			processFile(fileMeta);
		});
	}, [files]);

	const processFile = async (fileMeta: FileWithMeta) => {
		// Add to queue
		processingQueue.value = [...processingQueue.value, fileMeta.id];

		// Update status to processing
		updateFile(fileMeta.id, { status: 'processing', progress: 0 });

		// Find matching processor
		const processor = processors.find((p) => p.match(fileMeta.file));

		if (!processor) {
			// No processor found, mark as ready (or error if strict?)
			// For now, just ready
			updateFile(fileMeta.id, { status: 'ready', progress: 100 });
			removeFromQueue(fileMeta.id);
			return;
		}

		try {
			const result = await processor.process(fileMeta.file, (pct) => {
				updateFile(fileMeta.id, { progress: pct });
			});

			updateFile(fileMeta.id, {
				file: result.file,
				processingMeta: result.metadata,
				status: 'ready',
				progress: 100,
			});
		} catch (err: any) {
			updateFile(fileMeta.id, {
				status: 'error',
				errors: [{ code: 'PROCESSING_ERROR', message: err.message || 'Unknown error' }],
			});
		} finally {
			removeFromQueue(fileMeta.id);
		}
	};

	const updateFile = (id: string, updates: Partial<FileWithMeta>) => {
		const newFiles = files.map((f) => (f.id === id ? { ...f, ...updates } : f));
		onChange(newFiles);
	};

	const removeFromQueue = (id: string) => {
		processingQueue.value = processingQueue.value.filter((pid) => pid !== id);
	};

	const addFiles = (newFiles: File[]) => {
		const newFileMetas: FileWithMeta[] = newFiles.map((f) => ({
			file: f,
			originalFile: f,
			id: generateId(),
			status: 'pending',
			progress: 0,
			errors: [],
		}));

		onChange([...files, ...newFileMetas]);
	};

	const removeFile = (id: string) => {
		onChange(files.filter((f) => f.id !== id));
	};

	return {
		addFiles,
		removeFile,
	};
}

```

### File: packages\fields\src\hooks\useGlobalDrag.ts

```ts
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';

export function useGlobalDrag() {
	const isDragging = useSignal(false);

	useEffect(() => {
		let dragCounter = 0;

		const handleDragEnter = (e: DragEvent) => {
			e.preventDefault();
			dragCounter++;
			if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
				isDragging.value = true;
			}
		};

		const handleDragLeave = (e: DragEvent) => {
			e.preventDefault();
			dragCounter--;
			if (dragCounter === 0) {
				isDragging.value = false;
			}
		};

		const handleDragOver = (e: DragEvent) => {
			e.preventDefault();
		};

		const handleDrop = (e: DragEvent) => {
			e.preventDefault();
			dragCounter = 0;
			isDragging.value = false;
		};

		globalThis.addEventListener('dragenter', handleDragEnter);
		globalThis.addEventListener('dragleave', handleDragLeave);
		globalThis.addEventListener('dragover', handleDragOver);
		globalThis.addEventListener('drop', handleDrop);

		return () => {
			globalThis.removeEventListener('dragenter', handleDragEnter);
			globalThis.removeEventListener('dragleave', handleDragLeave);
			globalThis.removeEventListener('dragover', handleDragOver);
			globalThis.removeEventListener('drop', handleDrop);
		};
	}, []);

	return isDragging;
}

```

### File: packages\fields\src\hooks\useInteraction.ts

```ts
import { Signal, useSignal } from '@preact/signals';

export interface InteractionState {
	focused: Signal<boolean>;
	hovered: Signal<boolean>;
	active: Signal<boolean>;
	dirty: Signal<boolean>;
	touched: Signal<boolean>;
	handleFocus: (e?: FocusEvent | MouseEvent) => void;
	handleBlur: (e?: FocusEvent | MouseEvent) => void;
	handleMouseEnter: (e: MouseEvent) => void;
	handleMouseLeave: (e: MouseEvent) => void;
	handleMouseDown: (e: MouseEvent) => void;
	handleMouseUp: (e: MouseEvent) => void;
	handleChange: (value: unknown) => void;
}

export function useInteraction(initialValue?: unknown): InteractionState {
	const focused = useSignal(false);
	const hovered = useSignal(false);
	const active = useSignal(false);
	const dirty = useSignal(false);
	const touched = useSignal(false);

	// Track initial value to determine dirty state
	const _initialValue = initialValue;

	const handleFocus = (_e?: FocusEvent | MouseEvent) => {
		focused.value = true;
		touched.value = true;
	};

	const handleBlur = (_e?: FocusEvent | MouseEvent) => {
		focused.value = false;
	};

	const handleMouseEnter = (_e: MouseEvent) => {
		hovered.value = true;
	};

	const handleMouseLeave = (_e: MouseEvent) => {
		hovered.value = false;
		active.value = false; // Ensure active is cleared
	};

	const handleMouseDown = (_e: MouseEvent) => {
		active.value = true;
	};

	const handleMouseUp = (_e: MouseEvent) => {
		active.value = false;
	};

	const handleChange = (value: unknown) => {
		dirty.value = value !== _initialValue;
	};

	return {
		focused,
		hovered,
		active,
		dirty,
		touched,
		handleFocus,
		handleBlur,
		handleMouseEnter,
		handleMouseLeave,
		handleMouseDown,
		handleMouseUp,
		handleChange,
	};
}

```

### File: packages\fields\src\hooks\useRipple.ts

```ts
import { signal, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

export interface Ripple {
    x: number;
    y: number;
    id: number;
}

export function useRipple() {
    const ripples = useSignal<Ripple[]>([]);

    const addRipple = (e: MouseEvent | TouchEvent) => {
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        let clientX, clientY;
        if (e instanceof MouseEvent) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const id = Date.now();

        ripples.value = [...ripples.value, { x, y, id }];

        // Clean up ripple after animation
        setTimeout(() => {
            ripples.value = ripples.value.filter((r) => r.id !== id);
        }, 600);
    };

    return { ripples, addRipple };
}

```

### File: packages\fields\src\hooks\useSelectState.ts

```ts
import { computed, Signal, useSignal } from '@preact/signals';
import { SelectOption } from '../types/components/select-field.ts';

interface UseSelectStateProps<T> {
	options: SelectOption<T>[];
	value?: T | T[] | Signal<T | T[]>;
	onChange?: (val: T | T[]) => void;
	multiple?: boolean;
	disabled?: boolean;
}

export function useSelectState<T>({
	options,
	value,
	onChange,
	multiple,
	disabled,
}: UseSelectStateProps<T>) {
	const isOpen = useSignal(false);
	const highlightedIndex = useSignal(-1);
	const searchQuery = useSignal('');

	// Normalize value to array of values for internal logic
	const rawValue = value instanceof Signal ? value.value : value;

	const selectedValues = computed(() => {
		const val = value instanceof Signal ? value.value : (value ?? []);
		return Array.isArray(val) ? val : (val ? [val] : []);
	});

	const filteredOptions = computed(() => {
		const query = searchQuery.value.toLowerCase();
		if (!query) return options;
		return options.filter((opt) => opt.label.toLowerCase().includes(query));
	});

	const toggleOpen = (forceState?: boolean) => {
		if (disabled) return;
		const newState = forceState !== undefined ? forceState : !isOpen.value;
		isOpen.value = newState;

		if (newState) {
			// Find first selected index to highlight
			const firstSelected = filteredOptions.value.findIndex((o) =>
				selectedValues.value.includes(o.value)
			);
			highlightedIndex.value = firstSelected >= 0 ? firstSelected : 0;
		} else {
			searchQuery.value = '';
			highlightedIndex.value = -1;
		}
	};

	const selectOption = (option: SelectOption<T>) => {
		if (option.disabled) return;

		let newValue: T | T[];

		if (multiple) {
			const current = selectedValues.value as T[];
			const exists = current.includes(option.value);

			if (exists) {
				newValue = current.filter((v) => v !== option.value);
			} else {
				newValue = [...current, option.value];
			}
			searchQuery.value = ''; // Reset search on select in multi mode usually

			// Update signal if provided
			if (value instanceof Signal) {
				value.value = newValue;
			}
		} else {
			newValue = option.value;
			if (value instanceof Signal) {
				value.value = newValue;
			}
			toggleOpen(false);
		}

		onChange?.(newValue);
	};

	const removeValue = (valToRemove: T) => {
		if (!multiple) {
			if (value instanceof Signal) value.value = undefined as any;
			onChange?.(undefined as any);
			return;
		}

		const current = selectedValues.value as T[];
		const newValue = current.filter((v) => v !== valToRemove);

		if (value instanceof Signal) {
			value.value = newValue;
		}
		onChange?.(newValue);
	};

	const toggleSelectAll = () => {
		if (!multiple) return;

		const enabledVisible = filteredOptions.value.filter((o) => !o.disabled);
		const enabledValues = enabledVisible.map((o) => o.value);
		const current = selectedValues.value as T[];

		// Check if all visible are selected
		const allSelected = enabledValues.every((v) => current.includes(v));

		let newValue: T[];
		if (allSelected) {
			// Deselect visible
			newValue = current.filter((v) => !enabledValues.includes(v));
		} else {
			// Select all visible (union)
			const toAdd = enabledValues.filter((v) => !current.includes(v));
			newValue = [...current, ...toAdd];
		}

		if (value instanceof Signal) {
			value.value = newValue;
		}
		onChange?.(newValue);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (disabled) return;

		// Open on specific keys
		if (!isOpen.value && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
			e.preventDefault();
			toggleOpen(true);
			return;
		}

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				if (highlightedIndex.value < filteredOptions.value.length - 1) {
					highlightedIndex.value++;
				}
				break;
			case 'ArrowUp':
				e.preventDefault();
				if (highlightedIndex.value > 0) {
					highlightedIndex.value--;
				}
				break;
			case 'Enter':
				e.preventDefault();
				if (isOpen.value && highlightedIndex.value >= 0) {
					const opt = filteredOptions.value[highlightedIndex.value];
					if (opt) selectOption(opt);
				}
				break;
			case 'Escape':
				e.preventDefault();
				toggleOpen(false);
				break;
			case 'Backspace':
				if (searchQuery.value === '' && multiple && selectedValues.value.length > 0) {
					// Remove last tag
					const last = selectedValues.value[selectedValues.value.length - 1];
					removeValue(last);
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

### File: packages\fields\src\hooks\useSliderState.ts

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
import { SliderMark } from '../types/components/slider-field.ts';

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
	passthrough?: boolean;
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

### File: packages\fields\src\styles\components\accordion.css

```css

```

### File: packages\fields\src\styles\components\calendar.css

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

### File: packages\fields\src\styles\components\datetime-field.css

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
}

.datetime-field__popup {
    display: flex;
    flex-direction: column;
    width: 320px;
    /* Match calendar width */
}

.datetime-field__tabs {
    display: flex;
    border-bottom: 1px solid var(--input-border, #d1d5db);
}

.datetime-field__tab {
    flex: 1;
    background: none;
    border: none;
    padding: 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--input-text-secondary, #6b7280);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
}

.datetime-field__tab:hover {
    background-color: #f9fafb;
    color: var(--input-text, #111827);
}

.datetime-field__tab--active {
    color: var(--fill-bg, #3b82f6);
    border-bottom-color: var(--fill-bg, #3b82f6);
}

.datetime-field__tab-val {
    font-size: 0.75rem;
    background-color: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
    color: #374151;
}

.datetime-field__body {
    padding: 0;
}

.datetime-field__calendar {
    border: none;
    /* Remove border as popover has it */
    width: 100%;
}

.datetime-field__clock-wrapper {
    padding: 1rem;
    display: flex;
    justify-content: center;
}

```

### File: packages\fields\src\styles\components\time-clock.css

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

### File: packages\fields\src\styles\fields\combobox-field.css

```css
/* ComboboxField Styles */

.field-combobox {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.field-combobox__container {
  display: flex;
  align-items: center;
  position: relative;
  background-color: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
  transition: all var(--field-transition);
  min-height: var(--field-height);
  cursor: text;
}

.field-combobox__container:hover {
  background-color: var(--field-bg-hover);
  border-color: var(--field-border-hover);
}

.field-combobox__container--focused {
  border-color: var(--field-border-focus);
  background-color: var(--field-bg-active);
}

.field-combobox__container--error {
  border-color: var(--field-border-error);
}

.field-combobox__container--disabled {
  background-color: var(--field-bg-disabled);
  border-color: var(--field-border-disabled);
  cursor: not-allowed;
  opacity: 0.8;
}

.field-combobox__input {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  padding: 0 var(--field-padding-x);
  font-family: var(--field-font-family);
  font-size: var(--field-font-size);
  color: var(--field-text);
  outline: none;
}

.field-combobox__menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 250px;
  overflow-y: auto;
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
  transition: all var(--field-transition);
}

.field-combobox__menu--open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

/* --- Upward Direction --- */
.field-combobox--up .field-combobox__menu {
  top: auto;
  bottom: calc(100% + 4px);
  transform: translateY(10px);
  /* Start from slightly lower */
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
}

.field-combobox--up .field-combobox__menu--open {
  transform: translateY(0);
}

.field-combobox__option {
  padding: 8px var(--field-padding-x);
  cursor: pointer;
  color: var(--field-text);
  transition: background-color var(--field-transition);
}

.field-combobox__option:hover {
  background-color: var(--field-bg-hover);
}

.field-combobox__option--selected {
  background-color: var(--primary-50);
  color: var(--primary-700);
}
```

### File: packages\fields\src\styles\fields\date-field.css

```css
/* DateField & TimeField Styles */

.field-date {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}

/* Reusing text container styles via composition or duplication if needed. 
   Since we are using BEM, we can just use the same classes or duplicate for independence.
   Let's duplicate for independence but keep it consistent.
*/

.field-date__container {
  display: flex;
  align-items: center;
  position: relative;
  background-color: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
  transition: all var(--field-transition);
  min-height: var(--field-height);
  cursor: text;
}

.field-date__container:hover {
  background-color: var(--field-bg-hover);
  border-color: var(--field-border-hover);
}

.field-date__container--focused {
  border-color: var(--field-border-focus);
  background-color: var(--field-bg-active);
}

.field-date__container--error {
  border-color: var(--field-border-error);
}

.field-date__container--disabled {
  background-color: var(--field-bg-disabled);
  border-color: var(--field-border-disabled);
  cursor: not-allowed;
  opacity: 0.8;
}

.field-date__input {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  padding: 0 var(--field-padding-x);
  font-family: var(--field-font-family);
  font-size: var(--field-font-size);
  color: var(--field-text);
  outline: none;
}

/* Calendar Popover */
.field-date__popover {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  background-color: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
  padding: 16px;
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
  transition: all var(--field-transition);
}

.field-date__popover--open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

/* Simple Calendar Grid for demo purposes */
.field-date__calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  text-align: center;
}

.field-date__day {
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
}

.field-date__day:hover {
  background-color: var(--field-bg-hover);
}

.field-date__day--selected {
  background-color: var(--primary-500);
  color: white;
}

```

### File: packages\fields\src\styles\fields\file-drop.css

```css
/* FileDrop Styles */

.field-file {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.field-file__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  border: 2px dashed var(--field-border);
  border-radius: var(--field-radius);
  background-color: var(--field-bg);
  transition: all var(--field-transition);
  cursor: pointer;
  text-align: center;
}

.field-file__dropzone:hover {
  background-color: var(--field-bg-hover);
  border-color: var(--field-border-hover);
}

.field-file__dropzone--dragover {
  background-color: var(--primary-50);
  border-color: var(--primary-500);
}

.field-file__dropzone--disabled {
  background-color: var(--field-bg-disabled);
  border-color: var(--field-border-disabled);
  cursor: not-allowed;
  opacity: 0.8;
}

.field-file__icon {
  color: var(--field-text-placeholder);
  margin-bottom: 8px;
}

.field-file__text {
  font-size: var(--field-font-size);
  color: var(--field-text);
}

.field-file__subtext {
  font-size: 0.875em;
  color: var(--field-text-placeholder);
  margin-top: 4px;
}

.field-file__input {
  display: none;
}

/* File List */
.field-file__list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-file__item {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
}

.field-file__item-name {
  flex: 1;
  font-size: 0.875em;
  color: var(--field-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.field-file__item-remove {
  color: var(--field-text-placeholder);
  cursor: pointer;
  padding: 4px;
}

.field-file__item-remove:hover {
  color: var(--error-500);
}
```

### File: packages\fields\src\styles\fields\select-field.css

```css
/* SelectField Styles */

.field-select {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.field-select__container {
  display: flex;
  align-items: center;
  position: relative;
  background-color: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
  transition: all var(--field-transition);
  min-height: var(--field-height);
  cursor: pointer;
  padding-right: 8px;
  /* Space for arrows */
}

.field-select__container:hover {
  background-color: var(--field-bg-hover);
  border-color: var(--field-border-hover);
}

.field-select__container--focused {
  border-color: var(--field-border-focus);
  background-color: var(--field-bg-active);
}

.field-select__container--error {
  border-color: var(--field-border-error);
}

.field-select__container--disabled {
  background-color: var(--field-bg-disabled);
  border-color: var(--field-border-disabled);
  cursor: not-allowed;
  opacity: 0.8;
}

/* Content Area (Input + Chips) */
.field-select__content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 4px var(--field-padding-x);
  min-height: var(--field-height);
}

.field-select__input {
  border: none;
  background: transparent;
  font-family: var(--field-font-family);
  font-size: var(--field-font-size);
  color: var(--field-text);
  outline: none;
  padding: 0;
  margin: 0;
  min-width: 60px;
  flex: 1;
}

/* Single Value Display */
.field-select__single {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--field-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Icons & Avatars */
.field-select__icon,
.field-select__option-icon {
  display: flex;
  align-items: center;
  color: var(--field-text-placeholder);
}

.field-select__avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

/* Chips */
.field-select__chip {
  display: flex;
  align-items: center;
  background-color: var(--gray-100);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.85em;
  gap: 4px;
  color: var(--field-text);
}

.field-select__chip-remove {
  cursor: pointer;
  opacity: 0.5;
  display: flex;
  align-items: center;
}

.field-select__chip-remove:hover {
  opacity: 1;
}

/* Arrows & Clear */
.field-select__arrow {
  color: var(--field-text-placeholder);
  transition: transform 0.2s;
  display: flex;
}

.field-select__arrow--flip {
  transform: rotate(180deg);
}

.field-select__clear {
  color: var(--field-text-placeholder);
  cursor: pointer;
  margin-right: 4px;
  display: flex;
}

.field-select__clear:hover {
  color: var(--field-text-error);
}

.field-select__spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

/* Dropdown Menu */
.field-select__menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;
  max-height: 250px;
  overflow-y: auto;
  opacity: 0;
  transform: translateY(-5px);
  pointer-events: none;
  transition: all 0.1s;
  display: flex;
  flex-direction: column;
}

.field-select__menu--open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

/* Grouping */
.field-select__group {
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--field-text-placeholder);
  text-transform: uppercase;
  margin-top: 4px;
}

/* Options */
.field-select__option {
  padding: 8px 12px;
  cursor: pointer;
  color: var(--field-text);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.1s;
}

.field-select__option:hover,
.field-select__option--highlighted {
  background-color: var(--field-bg-hover);
}

.field-select__option--selected {
  background-color: var(--primary-50);
  color: var(--primary-700);
}

.field-select__option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.field-select__check {
  margin-left: auto;
  color: currentColor;
}

.field-select__option-label {
  flex: 1;
}

.field-select__no-options {
  padding: 12px;
  color: var(--field-text-placeholder);
  text-align: center;
}

.field-select__action-bar {
  padding: 8px 12px;
  border-bottom: 1px solid var(--field-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-600);
  font-weight: 500;
  font-size: 0.9em;
}

.field-select__action-bar:hover {
  background-color: var(--gray-50);
}

/* Upward Flip */
.field-select--up .field-select__menu {
  top: auto;
  bottom: calc(100% + 4px);
}

/* Chips Below */
.field-select__chips-external {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}
```

### File: packages\fields\src\styles\fields\slider-field.css

```css
/* SliderField Styles */

.field-slider {
  display: flex;
  flex-direction: column;
  position: relative;
  /* Added to contain absolute elements */
  width: 100%;
}

.field-slider__container {
  display: flex;
  align-items: center;
  height: var(--field-height);
  padding: 0 8px;
}

.field-slider__track {
  position: relative;
  width: 100%;
  height: 4px;
  background-color: var(--field-bg-disabled);
  border-radius: 2px;
  cursor: pointer;
}

.field-slider__fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: var(--primary-500);
  border-radius: 2px;
}

.field-slider__thumb {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  background-color: var(--gray-0);
  border: 2px solid var(--primary-500);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  transition: transform 0.1s, box-shadow 0.1s;
  z-index: 2;
}

.field-slider__thumb:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.field-slider__thumb:active {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow: 0 0 0 4px var(--field-ring-color);
}

.field-slider__input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 3;
}
```

### File: packages\fields\src\styles\fields\tag-input.css

```css
/* TagInput Styles */

.field-tag {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.field-tag__container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  position: relative;
  background-color: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
  transition: all var(--field-transition);
  min-height: var(--field-height);
  padding: 4px var(--field-padding-x);
  cursor: text;
}

.field-tag__container:hover {
  background-color: var(--field-bg-hover);
  border-color: var(--field-border-hover);
}

.field-tag__container--focused {
  border-color: var(--field-border-focus);
  background-color: var(--field-bg-active);
}

.field-tag__container--error {
  border-color: var(--field-border-error);
}

.field-tag__container--disabled {
  background-color: var(--field-bg-disabled);
  border-color: var(--field-border-disabled);
  cursor: not-allowed;
  opacity: 0.8;
}

.field-tag__chip {
  display: flex;
  align-items: center;
  background-color: var(--primary-100);
  color: var(--primary-700);
  border-radius: 16px;
  padding: 2px 8px;
  font-size: 0.875em;
}

.field-tag__chip-remove {
  margin-left: 4px;
  cursor: pointer;
  opacity: 0.6;
}

.field-tag__chip-remove:hover {
  opacity: 1;
}

.field-tag__input {
  flex: 1;
  min-width: 60px;
  border: none;
  background: transparent;
  font-family: var(--field-font-family);
  font-size: var(--field-font-size);
  color: var(--field-text);
  outline: none;
  padding: 4px 0;
}

.field-tag__input::placeholder {
  color: var(--field-text-placeholder);
}

```

### File: packages\fields\src\styles\overlays\popover.css

```css
.popover-wrapper {
    position: relative;
    width: 100%;
    display: inline-block;
}

.popover-content {
    position: absolute;
    top: 100%;
    z-index: 50;
    margin-top: 0.5rem;
    background: var(--dropdown-bg, #ffffff);
    border: 1px solid var(--input-border, #d1d5db);
    border-radius: var(--input-radius, 0.5rem);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    animation: popoverFadeIn 0.1s ease-out;
    min-width: 320px;
    /* Fit calendar */
}

.popover-content--bottom-left {
    left: 0;
}

.popover-content--bottom-right {
    right: 0;
}

@keyframes popoverFadeIn {
    from {
        opacity: 0;
        transform: translateY(-4px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

```

### File: packages\fields\src\styles\theme.css

```css
/* 
  Theme System - 3 Tiers 
  1. Primitives (Raw Palette)
  2. Semantics (Functional Variables)
  3. Component (Component Specific)
*/

:root {
  /* --- Tier 1: Primitives --- */
  /* Grays */
  --gray-0: #ffffff;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  --gray-950: #030712;

  /* Brand Colors */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;

  /* Status Colors */
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-600: #dc2626;

  --warning-50: #fffbeb;
  --warning-500: #f59e0b;

  --success-50: #f0fdf4;
  --success-500: #22c55e;

  /* --- Tier 2: Semantics (Light Mode Default) --- */

  /* Backgrounds */
  --field-bg: var(--gray-0);
  --field-bg-hover: var(--gray-50);
  --field-bg-disabled: var(--gray-100);
  --field-bg-active: var(--gray-0);

  /* Borders */
  --field-border: var(--gray-300);
  --field-border-hover: var(--gray-400);
  --field-border-focus: var(--primary-500);
  --field-border-error: var(--error-500);
  --field-border-disabled: var(--gray-200);

  /* Text */
  --field-text: var(--gray-900);
  --field-text-placeholder: var(--gray-400);
  --field-text-label: var(--gray-600);
  --field-text-disabled: var(--gray-400);
  --field-text-error: var(--error-600);

  /* Rings & Effects */
  --field-ring-color: var(--primary-100);
  --field-ring-width: 3px;
  --field-ripple-color: rgba(0, 0, 0, 0.1);

  /* Dimensions & Spacing */
  --field-height: 40px;
  --field-radius: 6px;
  --field-padding-x: 12px;
  --field-gap: 8px;
  --field-icon-size: 20px;

  /* Typography */
  --field-font-family: inherit;
  --field-font-size: 14px;
  --field-line-height: 20px;

  /* Transitions */
  --field-transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark Mode Overrides */
[data-theme="dark"] {
  /* Backgrounds */
  --field-bg: #222222;
  --field-bg-hover: var(--gray-800);
  --field-bg-disabled: var(--gray-900);

  /* Borders */
  --field-border: var(--gray-700);
  --field-border-hover: var(--gray-600);
  --field-border-focus: var(--primary-500);
  --field-border-disabled: var(--gray-800);

  /* Text */
  --field-text: var(--gray-100);
  --field-text-placeholder: var(--gray-500);
  --field-text-label: var(--gray-400);
  --field-text-disabled: var(--gray-600);

  /* Rings */
  --field-ring-color: rgba(59, 130, 246, 0.2);
  /* primary-500 with opacity */
  --field-ripple-color: rgba(255, 255, 255, 0.1);
}
```

### File: packages\fields\src\styles\wrappers\adornment-wrapper.css

```css
/* --- Adornment Wrapper --- */
.field-adornment {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--field-text-placeholder);
  min-width: var(--field-icon-size);
}

.field-adornment--prefix {
  margin-right: var(--field-gap);
}

.field-adornment--suffix {
  margin-left: var(--field-gap);
}

.field-adornment--interactive {
  cursor: pointer;
  pointer-events: auto;
  transition: color var(--field-transition);
}

.field-adornment--interactive:hover {
  color: var(--field-text);
}

```

### File: packages\fields\src\styles\wrappers\effect-wrapper.css

```css
/* --- Effect Wrapper (Ripple & Focus Ring) --- */
.field-focus-ring {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--field-radius);
  pointer-events: none;
  box-shadow: 0 0 0 0 transparent;
  transition: box-shadow var(--field-transition);
}

.field-focus-ring--active {
  box-shadow: 0 0 0 var(--field-ring-width) var(--field-ring-color);
}

.field-ripple {
  position: absolute;
  border-radius: 50%;
  transform: scale(0);
  animation: ripple 600ms linear;
  background-color: var(--field-ripple-color);
  pointer-events: none;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

```

### File: packages\fields\src\styles\wrappers\field-array-wrapper.css

```css
/* --- Field Array Wrapper --- */
.field-array {
  display: flex;
  flex-direction: column;
  gap: var(--field-gap);
}

.field-array__item {
  display: flex;
  align-items: flex-start;
  gap: var(--field-gap);
}

.field-array__action {
  margin-top: 4px; /* Align with input */
}

```

### File: packages\fields\src\styles\wrappers\label-wrapper.css

```css
/* --- Label Wrapper --- */
.field-label {
  display: block;
  font-family: var(--field-font-family);
  font-size: var(--field-font-size);
  color: var(--field-text-label);
  margin-bottom: 4px;
  transition: all var(--field-transition);
  pointer-events: none;
  transform-origin: top left;
  line-height: 1.5;

  /* Order -1: Ensures that if it's static (not floating), it renders before the input.
	   Since TextField is row-flex, this places it to the left of input if static.
	*/
  order: -1;
}

/* Positioning Modifiers */
.field-label--pos-left {
  margin-bottom: 0;
  margin-right: 8px;
  align-self: center;
  order: initial;
}

.field-label--pos-right {
  margin-bottom: 0;
  margin-left: 8px;
  align-self: center;
  order: 1;
}

.field-label--pos-bottom {
  margin-bottom: 0;
  margin-top: 4px;
  order: 1;
}

/* --- Floating Logic --- */

.field-label--floating {
  position: absolute;
  z-index: 1;
  background-color: transparent;
  padding: 0 4px;
  /* Tiny padding for "cutout" effect readability */
  margin-bottom: 0;

  /* X-AXIS: Aligned with the input text padding */
  left: var(--field-padding-x);

  /* Y-AXIS (Single Line): Center vertically relative to the container */
  top: 50%;
  transform: translateY(-50%);
}

/* MULTILINE OVERRIDE:
   For textareas, we align to the top padding (usually 8px-12px) 
   instead of centering.
*/
.field-label--multiline.field-label--floating {
  top: 8px;
  /* Matches textarea padding-top */
  transform: none;
}

/* INACTIVE STATE: Placeholder look */
.field-label--floating:not(.field-label--active) {
  color: var(--field-text-placeholder);
}

/* ACTIVE STATE: Floats up to the border */
.field-label--active {
  /* Move to top border */
  top: 0 !important;
  transform: translateY(-50%) scale(0.85) !important;

  /* Pull left slightly to account for the scale shrinkage */
  left: calc(var(--field-padding-x) - 2px);

  color: var(--field-border-focus);
  background-color: var(--field-bg);
}

/* Error State */
.field-label--error {
  color: var(--field-text-error);
}

/* Disabled State */
.field-label--disabled {
  color: var(--field-text-disabled);
}
```

### File: packages\fields\src\styles\wrappers\message-wrapper.css

```css
/* --- Message Wrapper --- */
.field-message {
  font-family: var(--field-font-family);
  font-size: 0.75rem; /* 12px */
  line-height: 1.2;
  margin-top: 4px;
  min-height: 0;
  transition: all var(--field-transition);
  opacity: 1;
}

.field-message--hidden {
  opacity: 0;
  margin-top: 0;
  height: 0;
  overflow: hidden;
}

.field-message--error {
  color: var(--field-text-error);
}

.field-message--warning {
  color: var(--warning-500);
}

.field-message--info {
  color: var(--field-text-placeholder);
}

```

### File: packages\fields\src\styles\wrappers\skeleton-wrapper.css

```css
/* --- Skeleton Wrapper --- */
.field-skeleton {
  background-color: var(--field-bg-disabled);
  border-radius: var(--field-radius);
  overflow: hidden;
  position: relative;
}

.field-skeleton--pulse::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.2) 20%,
    rgba(255, 255, 255, 0.5) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.field-skeleton--rect {
  height: var(--field-height);
  width: 100%;
}

.field-skeleton--circle {
  width: var(--field-height);
  height: var(--field-height);
  border-radius: 50%;
}

.field-skeleton--pill {
  height: 24px;
  width: 60px;
  border-radius: 12px;
}

```

### File: packages\fields\src\types\components\combobox-field.ts

```ts
import { SelectFieldProps } from './select-field.ts';

/**
 * ComboboxField specific props.
 */
export interface ComboboxFieldProps<T = string> extends SelectFieldProps<T> {
	// Combobox specific props
}

```

### File: packages\fields\src\types\components\date-field.ts

```ts
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';
import { DateTime } from '@projective/types';

/**
 * DateField specific props.
 */
export interface DateFieldProps
	extends
		ValueFieldProps<DateTime>,
		AdornmentProps,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	minDate?: DateTime;
	maxDate?: DateTime;
	format?: string;
}

```

### File: packages\fields\src\types\components\datetime-field.ts

```ts
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';
import { DateTime } from '@projective/types';

/**
 * DateTimeField specific props.
 */
export interface DateTimeFieldProps
	extends
		ValueFieldProps<DateTime>,
		AdornmentProps,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	min?: DateTime;
	max?: DateTime;
	clearable?: boolean;
}

```

### File: packages\fields\src\types\components\file-drop.ts

```ts
import { BaseFieldProps, ValueFieldProps } from '../core.ts';
import { Signal } from '@preact/signals';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * FileDrop specific props.
 */
export interface FileDropProps
	extends
		ValueFieldProps<File[]>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	accept?: string;
	multiple?: boolean;
	maxSize?: number;
	maxFiles?: number;
}

```

### File: packages\fields\src\types\components\money-field.ts

```ts
import { ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * MoneyField specific props.
 */
export interface MoneyFieldProps
	extends
		ValueFieldProps<number>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	currency?: string;
	locale?: string;
}

```

### File: packages\fields\src\types\components\select-field.ts

```ts
import { JSX } from 'preact';
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * Select option interface.
 */
export interface SelectOption<T = string> {
	label: string;
	value: T;
	disabled?: boolean;
	icon?: JSX.Element;
	avatarUrl?: string;
	group?: string;
}

export type SelectDisplayMode = 'chips-inside' | 'chips-below' | 'count' | 'text';

/**
 * SelectField specific props.
 */
export interface SelectFieldProps<T = string> extends
	// We allow T | T[] for value
	Omit<ValueFieldProps<T | T[]>, 'value' | 'onChange'>,
	AdornmentProps,
	Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
	Omit<MessageWrapperProps, 'error' | 'hint'> {
	// Value & Change override for generics
	value?: T | T[] | any; // 'any' used to allow Signal<T> passing easily in strict mode
	onChange?: (value: T | T[]) => void;

	options: SelectOption<T>[];
	multiple?: boolean;
	searchable?: boolean;
	clearable?: boolean;
	loading?: boolean;

	// Multi-select config
	displayMode?: SelectDisplayMode;
	enableSelectAll?: boolean;

	// Custom Icons
	icons?: {
		arrow?: JSX.Element;
		arrowOpen?: JSX.Element;
		check?: JSX.Element;
		remove?: JSX.Element;
		loading?: JSX.Element;
		invalid?: JSX.Element;
		valid?: JSX.Element;
	};
}

```

### File: packages\fields\src\types\components\slider-field.ts

```ts
import { ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * SliderField specific props.
 */
export interface SliderMark {
	value: number;
	label?: string;
}

/**
 * SliderField specific props.
 */
export interface SliderFieldProps
	extends
		ValueFieldProps<number | number[]>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	min?: number;
	max?: number;
	step?: number;
	marks?: boolean | number[] | SliderMark[];
	range?: boolean;
	vertical?: boolean;
	scale?: 'linear' | 'logarithmic';
	minDistance?: number;
	snapToMarks?: boolean;
	height?: string;
	passthrough?: boolean;
}

```

### File: packages\fields\src\types\components\tag-input.ts

```ts
import { ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * TagInput specific props.
 */
export interface TagInputProps
	extends
		ValueFieldProps<string[]>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	// Tag specific props can be added here
}

```

### File: packages\fields\src\types\components\text-field.ts

```ts
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * TextField specific props.
 * Extends BaseFieldProps (via ValueFieldProps) and Wrapper Props.
 */
export interface TextFieldProps
	extends
		ValueFieldProps<string>,
		AdornmentProps,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
	multiline?: boolean;
	rows?: number;
	maxRows?: number;
	autoComplete?: string;
	pattern?: string;
	minLength?: number;
	maxLength?: number;
	showCount?: boolean;
	onInput?: (e: any) => void;
	onBlur?: (e: any) => void;
	onFocus?: (e: any) => void;
}

```

### File: packages\fields\src\types\components\time-field.ts

```ts
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';
import { DateTime } from '@projective/types';

/**
 * TimeField specific props.
 */
export interface TimeFieldProps
	extends
		ValueFieldProps<DateTime>,
		AdornmentProps,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	// Time specific props
}

```

### File: packages\fields\src\types\core.ts

```ts
import { Signal } from '@preact/signals';
import { CSSProperties, JSX } from 'preact';

/**
 * Base properties shared by all form fields.
 */
export interface BaseFieldProps {
	id?: string;
	name?: string;
	label?: string;
	placeholder?: string;
	disabled?: boolean | Signal<boolean>;
	readonly?: boolean | Signal<boolean>;
	loading?: boolean | Signal<boolean>;
	required?: boolean;
	floating?: boolean;
	className?: string;
	style?: CSSProperties;
}

/**
 * Visual variants for fields.
 */
export type FieldVariant = 'outlined' | 'filled' | 'standard';

/**
 * Density/Size variants.
 */
export type FieldDensity = 'compact' | 'normal' | 'comfortable';

/**
 * Validation status.
 */
export type ValidationStatus =
	| 'success'
	| 'warning'
	| 'error'
	| 'info'
	| 'neutral';

/**
 * Generic interface for fields that hold a value.
 */
export interface ValueFieldProps<T> extends BaseFieldProps {
	value?: T | Signal<T>;
	defaultValue?: T;
	onChange?: (value: T) => void;
	error?: string | Signal<string | undefined>;
	hint?: string;
}

/**
 * Interface for fields that support adornments (icons/text).
 */
export interface AdornmentProps {
	prefix?: JSX.Element | string;
	suffix?: JSX.Element | string;
	onPrefixClick?: (e: MouseEvent) => void;
	onSuffixClick?: (e: MouseEvent) => void;
}

```

### File: packages\fields\src\types\file.ts

```ts
import { ValueFieldProps } from './core.ts';
import { LabelWrapperProps, MessageWrapperProps } from './wrappers.ts';

export type FileStatus = 'pending' | 'processing' | 'ready' | 'error';

export interface FileError {
	code: string;
	message: string;
}

export interface FileWithMeta {
	file: File;
	originalFile?: File;
	id: string;
	preview?: string;
	status: FileStatus;
	progress: number;
	errors: FileError[];
	processingMeta?: Record<string, any>;
}

export interface FileProcessor {
	id: string;
	name: string;
	match: (file: File) => boolean;
	process: (
		file: File,
		onProgress?: (pct: number) => void,
	) => Promise<{ file: File; metadata?: any }>;
}

export interface FileFieldProps
	extends
		ValueFieldProps<FileWithMeta[]>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	accept?: string;
	maxSize?: number;
	maxFiles?: number;
	multiple?: boolean;
	layout?: 'list' | 'grid';
	dropzoneLabel?: string;
	processors?: FileProcessor[];
	onDrop?: (acceptedFiles: File[], rejectedFiles: FileWithMeta[]) => void;
	value?: FileWithMeta[]; // Override base value to use FileWithMeta
	onChange?: (files: FileWithMeta[]) => void;
}

```

### File: packages\fields\src\types\wrappers.ts

```ts
import { Signal } from '@preact/signals';
import { JSX } from 'preact';

/**
 * Props for the LabelWrapper component.
 */
export interface LabelWrapperProps {
	id?: string;
	label?: string;
	required?: boolean;
	floating?: boolean;
	active?: boolean | Signal<boolean>;
	error?: boolean | Signal<boolean>;
	disabled?: boolean | Signal<boolean>;
	className?: string;
	/** Inline styles for precise control */
	style?: JSX.CSSProperties;
	/**
	 * Position of the label relative to the field.
	 * @default "top"
	 */
	position?: 'top' | 'left' | 'right' | 'bottom';
	/**
	 * Floating behavior rules.
	 * - auto: Floats when focused or has value (default)
	 * - always: Always floating (static top)
	 * - never: Never floats (placeholder style)
	 */
	floatingRule?: 'auto' | 'always' | 'never';
	/**
	 * Origin point for floating animation.
	 * - top-left: Standard Material (default)
	 * - center: Starts as placeholder, moves up
	 */
	floatingOrigin?: 'top-left' | 'center';
	/**
	 * If true, adjusts start position for textareas (top aligned vs center aligned)
	 */
	multiline?: boolean;
}

/**
 * Props for the AdornmentWrapper component.
 */
export interface AdornmentWrapperProps {
	children?: JSX.Element | string;
	position?: 'prefix' | 'suffix';
	onClick?: (e: MouseEvent) => void;
	className?: string;
}

/**
 * Props for the MessageWrapper component.
 */
export interface MessageWrapperProps {
	error?: string | Signal<string | undefined>;
	warning?: string | Signal<string | undefined>;
	info?: string | Signal<string | undefined>;
	hint?: string;
}

/**
 * Props for the SkeletonWrapper component.
 */
export interface SkeletonWrapperProps {
	loading?: boolean | Signal<boolean>;
	variant?: 'rect' | 'circle' | 'pill';
	width?: string | number;
	height?: string | number;
	className?: string;
}

/**
 * Props for the EffectWrapper component.
 */
export interface EffectWrapperProps {
	focused?: boolean | Signal<boolean>;
	disabled?: boolean | Signal<boolean>;
	children?: JSX.Element | JSX.Element[];
}

/**
 * Props for the FieldArrayWrapper component.
 */
export interface FieldArrayWrapperProps<T> {
	items: T[] | Signal<T[]>;
	onAdd?: () => void;
	onRemove?: (index: number) => void;
	renderItem: (item: T, index: number) => JSX.Element;
	renderAddButton?: (onClick: () => void) => JSX.Element;
	renderRemoveButton?: (onClick: () => void) => JSX.Element;
	className?: string;
	maxItems?: number;
}

```

### File: packages\fields\src\wrappers\AdornmentWrapper.tsx

```tsx
import { JSX } from 'preact';
import '../styles/wrappers/adornment-wrapper.css';

interface AdornmentWrapperProps {
	children?: JSX.Element | string;
	position: 'prefix' | 'suffix';
	onClick?: (e: MouseEvent) => void;
	className?: string;
}

export function AdornmentWrapper(props: AdornmentWrapperProps) {
	if (!props.children) return null;

	const classes = [
		'field-adornment',
		`field-adornment--${props.position}`,
		props.onClick && 'field-adornment--interactive',
		props.className,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={classes} onClick={props.onClick}>
			{props.children}
		</div>
	);
}

```

### File: packages\fields\src\wrappers\EffectWrapper.tsx

```tsx
import { JSX } from 'preact';
import { Signal } from '@preact/signals';
import { useRipple } from '../hooks/useRipple.ts';
import '../styles/wrappers/effect-wrapper.css';

interface EffectWrapperProps {
	focused?: boolean | Signal<boolean>;
	disabled?: boolean | Signal<boolean>;
	children?: JSX.Element | JSX.Element[]; // To allow wrapping content if needed, though usually it's an overlay
}

export function EffectWrapper(props: EffectWrapperProps) {
	const isFocused = props.focused instanceof Signal ? props.focused.value : props.focused;
	const isDisabled = props.disabled instanceof Signal ? props.disabled.value : props.disabled;

	const { ripples } = useRipple();

	if (isDisabled) return null;

	// We attach the click listener to the parent in the Field component usually,
	// but here we just render the visual effects.
	// The consumer of EffectWrapper should call addRipple.
	// Actually, to make it self-contained, we might need to attach to parent,
	// but for now let's expose the ripple mechanism or assume the parent handles the click
	// and we just render the ripples.

	// Wait, the requirement says "Handle Ripple effects".
	// Usually this is an overlay that captures clicks or is absolutely positioned.
	// Let's make it an overlay that passes through clicks but registers ripples.

	return (
		<>
			<div
				className={`field-focus-ring ${isFocused ? 'field-focus-ring--active' : ''}`}
			/>
			<div
				className='field-ripple-container'
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					overflow: 'hidden',
					pointerEvents: 'none',
					borderRadius: 'inherit',
				}}
			>
				{ripples.value.map((r) => (
					<span
						key={r.id}
						className='field-ripple'
						style={{ left: r.x, top: r.y }}
					/>
				))}
			</div>
		</>
	);
}

// We also need to export the hook so components can use it if they want manual control
export { useRipple };

```

### File: packages\fields\src\wrappers\FieldArrayWrapper.tsx

```tsx
import { JSX } from 'preact';
import { Signal } from '@preact/signals';
import '../styles/wrappers/field-array-wrapper.css';

interface FieldArrayWrapperProps<T> {
	items: T[] | Signal<T[]>;
	onAdd?: () => void;
	onRemove?: (index: number) => void;
	renderItem: (item: T, index: number) => JSX.Element;
	renderAddButton?: (onClick: () => void) => JSX.Element;
	renderRemoveButton?: (onClick: () => void) => JSX.Element;
	className?: string;
	maxItems?: number;
}

export function FieldArrayWrapper<T>(props: FieldArrayWrapperProps<T>) {
	const items = props.items instanceof Signal ? props.items.value : props.items;

	return (
		<div className={`field-array ${props.className || ''}`}>
			{items.map((item, index) => (
				<div key={index} className='field-array__item'>
					<div style={{ flex: 1 }}>
						{props.renderItem(item, index)}
					</div>
					{props.onRemove && (
						<div className='field-array__action'>
							{props.renderRemoveButton
								? (
									props.renderRemoveButton(() => props.onRemove!(index))
								)
								: (
									<button
										type='button'
										onClick={() => props.onRemove!(index)}
										className='field-array__remove-btn'
										aria-label='Remove item'
									>
										&times;
									</button>
								)}
						</div>
					)}
				</div>
			))}

			{props.onAdd &&
				(!props.maxItems || items.length < props.maxItems) && (
				<div className='field-array__add'>
					{props.renderAddButton
						? (
							props.renderAddButton(props.onAdd)
						)
						: (
							<button
								type='button'
								onClick={props.onAdd}
								className='field-array__add-btn'
							>
								+ Add Item
							</button>
						)}
				</div>
			)}
		</div>
	);
}

```

### File: packages\fields\src\wrappers\GlobalFileDrop.tsx

```tsx
import { ComponentChildren } from 'preact';
import { useGlobalDrag } from '../hooks/useGlobalDrag.ts';
import { FileFieldProps } from '../types/file.ts';
import { FileDrop } from '../components/FileDrop.tsx';

interface GlobalFileDropProps extends FileFieldProps {
	children: ComponentChildren;
	overlayText?: string;
}

export default function GlobalFileDrop(props: GlobalFileDropProps) {
	const isDragging = useGlobalDrag();
	const { children, overlayText, ...fileDropProps } = props;

	return (
		<div
			className='global-drop-wrapper'
			style={{ position: 'relative', height: '100%', minHeight: '100vh' }}
		>
			{/* 1. Main Content */}
			<div className='global-drop-content'>
				{children}
			</div>

			{/* 2. Overlay (Visible on Drag) */}
			{isDragging.value && (
				<div
					className='global-drop-overlay'
					style={{
						position: 'fixed',
						inset: 0,
						zIndex: 9999,
						background: 'rgba(255, 255, 255, 0.9)',
						backdropFilter: 'blur(4px)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '3rem',
					}}
				>
					{
						/* We reuse FileDrop but apply specific styles to make it fill the modal
            and hide the default list, acting purely as a target.
          */
					}
					<div style={{ width: '100%', height: '100%', maxWidth: '800px', maxHeight: '600px' }}>
						<FileDrop
							{...fileDropProps}
							className='file-drop--global-active'
							dropzoneLabel={overlayText || 'Drop files anywhere to upload'}
							layout='list'
						/>
					</div>
				</div>
			)}
		</div>
	);
}

```

### File: packages\fields\src\wrappers\LabelWrapper.tsx

```tsx
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

```

### File: packages\fields\src\wrappers\MessageWrapper.tsx

```tsx
import { Signal } from '@preact/signals';
import '../styles/wrappers/message-wrapper.css';

interface MessageWrapperProps {
	error?: string | Signal<string | undefined>;
	warning?: string | Signal<string | undefined>;
	info?: string | Signal<string | undefined>;
	hint?: string;
}

export function MessageWrapper(props: MessageWrapperProps) {
	const error = props.error instanceof Signal ? props.error.value : props.error;
	const warning = props.warning instanceof Signal ? props.warning.value : props.warning;
	const info = props.info instanceof Signal ? props.info.value : props.info;

	// Priority: Error > Warning > Info > Hint
	const message = error || warning || info || props.hint;
	const type = error ? 'error' : warning ? 'warning' : info ? 'info' : 'hint';

	if (!message) {
		return (
			<div
				className='field-message field-message--hidden'
				aria-hidden='true'
			/>
		);
	}

	const classes = [
		'field-message',
		`field-message--${type}`,
	].join(' ');

	return (
		<div className={classes} role={type === 'error' ? 'alert' : 'status'}>
			{message}
		</div>
	);
}

```

### File: packages\fields\src\wrappers\SkeletonWrapper.tsx

```tsx
import { Signal } from '@preact/signals';
import '../styles/wrappers/skeleton-wrapper.css';

interface SkeletonWrapperProps {
	loading?: boolean | Signal<boolean>;
	variant?: 'rect' | 'circle' | 'pill';
	width?: string | number;
	height?: string | number;
	className?: string;
}

export function SkeletonWrapper(props: SkeletonWrapperProps) {
	const isLoading = props.loading instanceof Signal ? props.loading.value : props.loading;

	if (!isLoading) return null;

	const classes = [
		'field-skeleton',
		'field-skeleton--pulse',
		`field-skeleton--${props.variant || 'rect'}`,
		props.className,
	]
		.filter(Boolean)
		.join(' ');

	const style = {
		width: props.width,
		height: props.height,
	};

	return <div className={classes} style={style} aria-hidden='true' />;
}

```

