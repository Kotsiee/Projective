# Selected Codebase Context

> Included paths: ./apps/web/routes/api/v1/public/profile, ./packages/fields

## Project Tree (Selected)

```text
./apps/web/routes/api/v1/public/profile/
  profile/
  [handle]/
  index.ts
  [tab].ts
./packages/fields/
  fields/
  deno.json
  mod.ts
  src/
  components/
  ComboboxField.tsx
  DateField.tsx
  datetime/
  Calendar.tsx
  TimeClock.tsx
  DateTimeField.tsx
  FileDrop.tsx
  HelpTooltip.tsx
  MoneyField.tsx
  RichTextField.tsx
  SelectField.tsx
  SliderField.tsx
  TagInput.tsx
  TextField.tsx
  TimeField.tsx
  core/
  hooks/
  useCurrencyMask.ts
  useFieldState.ts
  useFileProcessor.ts
  useFocusNext.ts
  useGlobalDrag.ts
  useInteraction.ts
  useSelectState.ts
  useSliderState.ts
  styles/
  components/
  calendar.css
  datetime-field.css
  help-tooltip.css
  time-clock.css
  fields/
  combobox-field.css
  date-field.css
  file-drop.css
  rich-text-field.css
  select-field.css
  slider-field.css
  tag-input.css
  text-field.css
  overlays/
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
  rich-text-field.ts
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

### File: apps\web\routes\api\v1\public\profile\[handle]\index.ts

```ts
/**
 * @file index.ts
 * @description API Route Handler for fetching core profile data.
 * GET /api/v1/public/profile/:handle
 */

import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { ProfileBackendService } from '@features/public/profile/services/ProfileServiceBackend.ts';

export const handler = define.handlers({
	async GET(ctx) {
		const handle = ctx.params.handle;
		console.log(`[API] Fetching profile for handle: ${handle}`);

		if (!handle) {
			return new Response(JSON.stringify({ error: { message: 'Profile handle is required' } }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		try {
			// Dependency injection for testability and RLS propagation
			const getClient = () =>
				// deno-lint-ignore no-explicit-any
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await ProfileBackendService.getProfileCore(handle, { getClient });

			if (!res.ok) {
				return new Response(JSON.stringify({ error: res.error }), {
					status: res.error?.status ?? 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify(res.data), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
				},
			});
		} catch (e: unknown) {
			console.error('[API] /profile/[handle] Error:', e);
			return new Response(JSON.stringify({ error: { message: 'Internal Server Error' } }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
});

```

### File: apps\web\routes\api\v1\public\profile\[handle]\[tab].ts

```ts
/**
 * @file [tab].ts
 * @description API Route Handler for fetching paginated tab content for a profile.
 * GET /api/v1/public/profile/:handle/:tab
 */

import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { ProfileBackendService } from '@features/public/profile/services/ProfileServiceBackend.ts';
import { ProfileTab } from '@features/public/profile/contracts/Profile.ts';

export const handler = define.handlers({
	async GET(ctx) {
		const handle = ctx.params.handle;
		const tab = ctx.params.tab as ProfileTab;
		const url = new URL(ctx.req.url);

		if (!handle || !tab) {
			return new Response(JSON.stringify({ error: { message: 'Handle and Tab are required' } }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const params = {
			limit: parseInt(url.searchParams.get('limit') || '20', 10),
			offset: parseInt(url.searchParams.get('offset') || '0', 10),
			filter: url.searchParams.get('filter') || undefined,
		};

		try {
			const getClient = () =>
				// deno-lint-ignore no-explicit-any
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await ProfileBackendService.getProfileTab(handle, tab, params, { getClient });

			if (!res.ok) {
				return new Response(JSON.stringify({ error: res.error }), {
					status: res.error?.status ?? 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify(res.data), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (e: unknown) {
			console.error(`[API] /profile/[handle]/${tab} Error:`, e);
			return new Response(JSON.stringify({ error: { message: 'Internal Server Error' } }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
});

```

### File: packages\fields\deno.json

```json
{
  "name": "@projective/fields",
  "version": "0.0.0",
  "exports": "./mod.ts",
  "tasks": {
    "check": "deno fmt --check && deno lint && deno check mod.ts"
  },
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  }
}

```

### File: packages\fields\mod.ts

```ts
// Types
export * from './src/types/core.ts';
export * from './src/types/components/select-field.ts';

// Wrappers
export * from './src/wrappers/LabelWrapper.tsx';
export * from './src/wrappers/AdornmentWrapper.tsx';
export * from './src/wrappers/SkeletonWrapper.tsx';
export * from './src/wrappers/MessageWrapper.tsx';
export * from './src/wrappers/EffectWrapper.tsx';
export * from './src/wrappers/FieldArrayWrapper.tsx';

// Hooks
export * from './src/hooks/useInteraction.ts';
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
export * from './src/components/RichTextField.tsx';
export * from './src/components/datetime/Calendar.tsx';
export * from './src/components/datetime/TimeClock.tsx';

export * from './src/components/HelpTooltip.tsx';

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
			const spaceBelow = globalThis.innerHeight - rect.bottom;
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
import { DateFieldProps, DateValue } from '../types/components/date-field.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { useFieldState } from '../hooks/useFieldState.ts';
import { AdornmentWrapper } from '../wrappers/AdornmentWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { DateTime } from '@projective/types';
import { Popover } from '@projective/ui';
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
		variant = 'popup', // Default to existing behavior
		selectionMode = 'single',
		modifiers,
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

	// Computed string value for the input display
	const displayValue = computed(() => {
		const val = fieldState.value.value;
		if (!val) return '';

		if (Array.isArray(val)) {
			// Range
			if (selectionMode === 'range' && val.length === 2) {
				const start = val[0] ? val[0].toFormat(format) : '...';
				const end = val[1] ? val[1].toFormat(format) : '...';
				return `${start} - ${end}`;
			}
			// Multiple
			if (selectionMode === 'multiple') {
				return `${val.length} dates selected`;
			}
		}
		// Single
		if (val instanceof DateTime) return val.toFormat(format);

		return '';
	});

	const handleDateSelect = (date: DateValue) => {
		fieldState.setValue(date);

		// Auto-close popover rules:
		// Single: Close on select
		// Range: Close if both start/end selected? Maybe keep open for adjustments.
		// Multiple: Keep open.
		if (selectionMode === 'single') {
			isOpen.value = false;
			interaction.handleBlur();
		}
	};

	// --- Render Logic Based on Variant ---

	if (variant === 'inline') {
		return (
			<div
				className={`field-date field-date--inline ${className || ''}`}
				style={style}
			>
				<Calendar
					value={fieldState.value.value}
					onChange={handleDateSelect}
					min={minDate}
					max={maxDate}
					selectionMode={selectionMode}
					modifiers={modifiers}
					className='field-date__calendar--inline'
				/>
				<MessageWrapper
					error={error}
					hint={hint}
					warning={warning}
					info={info}
				/>
			</div>
		);
	}

	// Default: Popup Mode
	return (
		<div className={`field-date ${className || ''}`} style={style}>
			<Popover
				isOpen={isOpen.value}
				onClose={() => {
					isOpen.value = false;
					interaction.handleBlur();
				}}
				// Forward position prop if we want manual control, otherwise let Popover auto-flip
				trigger={
					<div
						onClick={() => !isDisabled && (isOpen.value = !isOpen.value)}
					>
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
							readonly // Prevent manual typing for complex modes for now
							suffix={
								<AdornmentWrapper
									position='suffix'
									onClick={(e) => {
										e.stopPropagation();
										!isDisabled &&
											(isOpen.value = !isOpen.value);
									}}
								>
									{suffix || <IconCalendar size={18} />}
								</AdornmentWrapper>
							}
							prefix={prefix}
							onPrefixClick={onPrefixClick}
							onFocus={interaction.handleFocus}
							onBlur={() => {}}
						/>
					</div>
				}
				content={
					<Calendar
						value={fieldState.value.value}
						onChange={handleDateSelect}
						min={minDate}
						max={maxDate}
						selectionMode={selectionMode}
						modifiers={modifiers}
					/>
				}
			/>
			<MessageWrapper
				error={error}
				hint={hint}
				warning={warning}
				info={info}
			/>
		</div>
	);
}

```

### File: packages\fields\src\components\datetime\Calendar.tsx

```tsx
/* #region Imports */
import '../../styles/components/calendar.css';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';
import { DateTime } from '@projective/types';
import { DateModifiers, DateSelectionMode, DateValue } from '../../types/components/date-field.ts';
/* #endregion */

export interface CalendarProps {
	value?: DateValue;
	onChange?: (date: any) => void;
	min?: DateTime;
	max?: DateTime;
	startOfWeek?: 0 | 1;
	selectionMode?: DateSelectionMode;
	modifiers?: DateModifiers;
	className?: string;
}

type CalendarScope = 'day' | 'month' | 'year';

export function Calendar(props: CalendarProps) {
	const {
		value,
		onChange,
		min,
		max,
		startOfWeek = 1,
		selectionMode = 'single',
		modifiers = {},
		className,
	} = props;

	// #region State
	const viewDate = useSignal(new DateTime());
	const scope = useSignal<CalendarScope>('day');

	// Sync internal viewDate with the selected value on mount
	useEffect(() => {
		if (value) {
			if (value instanceof DateTime) {
				viewDate.value = value;
			} else if (Array.isArray(value) && value.length > 0) {
				const start = value[0];
				if (start) viewDate.value = start;
			}
		}
	}, []);
	// #endregion

	// #region Logic Helpers
	const isDateDisabled = (date: DateTime) => {
		if (min && date.isBefore(min.startOf('day'))) return true;
		if (max && date.isAfter(max.endOf('day'))) return true;
		return modifiers.disabled?.(date) ?? false;
	};

	// Helper to set date parts (since DateTime is immutable)
	const setDatePart = (base: DateTime, unit: 'month' | 'year', val: number) => {
		const d = new Date(base.getTime());
		if (unit === 'month') d.setMonth(val);
		if (unit === 'year') d.setFullYear(val);
		return new DateTime(d);
	};

	// --- Grid Generators ---
	const getCalendarGrid = (currentDate: DateTime, weekStart: 0 | 1) => {
		const startOfMonth = currentDate.startOf('month');
		const startDay = startOfMonth.getDay();

		let lead = startDay - weekStart;
		if (lead < 0) lead += 7;

		const startDate = startOfMonth.minus(lead, 'days');
		const grid = [];

		for (let i = 0; i < 42; i++) {
			const d = startDate.add(i, 'days');
			grid.push({
				date: d,
				isCurrentMonth: d.getMonth() === currentDate.getMonth(),
				isToday: d.isSameDay(DateTime.today()),
			});
		}
		return grid;
	};

	const getWeekLabels = (weekStart: 0 | 1) => {
		const base = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		if (weekStart === 1) {
			const sun = base.shift();
			base.push(sun!);
		}
		return base;
	};
	// #endregion

	// #region Handlers
	const handlePrev = (e: Event) => {
		e.stopPropagation();
		// FIX: Use plural units ('months', 'years') to match DateTime.ts
		if (scope.value === 'day') viewDate.value = viewDate.value.minus(1, 'months');
		else if (scope.value === 'month') viewDate.value = viewDate.value.minus(1, 'years');
		else if (scope.value === 'year') viewDate.value = viewDate.value.minus(10, 'years');
	};

	const handleNext = (e: Event) => {
		e.stopPropagation();
		// FIX: Use plural units ('months', 'years') to match DateTime.ts
		if (scope.value === 'day') viewDate.value = viewDate.value.add(1, 'months');
		else if (scope.value === 'month') viewDate.value = viewDate.value.add(1, 'years');
		else if (scope.value === 'year') viewDate.value = viewDate.value.add(10, 'years');
	};

	const handleTitleClick = (e: Event) => {
		e.stopPropagation();
		if (scope.value === 'day') scope.value = 'month';
		else if (scope.value === 'month') scope.value = 'year';
	};

	const handleDaySelect = (date: DateTime) => {
		if (selectionMode === 'single') {
			onChange?.(date);
		}
	};

	const handleMonthSelect = (monthIndex: number) => {
		viewDate.value = setDatePart(viewDate.value, 'month', monthIndex);
		scope.value = 'day';
	};

	const handleYearSelect = (year: number) => {
		viewDate.value = setDatePart(viewDate.value, 'year', year);
		scope.value = 'month';
	};
	// #endregion

	// #region Renderers
	const renderHeader = () => {
		let title = '';
		if (scope.value === 'day') title = viewDate.value.toFormat('MMMM yyyy');
		else if (scope.value === 'month') title = viewDate.value.toFormat('yyyy');
		else {
			const startYear = Math.floor(viewDate.value.getYear() / 10) * 10;
			title = `${startYear} - ${startYear + 9}`;
		}

		return (
			<div className='calendar__header'>
				<button type='button' className='calendar__nav-btn' onClick={handlePrev}>
					<IconChevronLeft size={18} />
				</button>
				<button type='button' className='calendar__title' onClick={handleTitleClick}>
					{title}
				</button>
				<button type='button' className='calendar__nav-btn' onClick={handleNext}>
					<IconChevronRight size={18} />
				</button>
			</div>
		);
	};

	const renderDays = () => {
		const grid = getCalendarGrid(viewDate.value, startOfWeek);
		const weekLabels = getWeekLabels(startOfWeek);

		return (
			<>
				<div className='calendar__weekdays'>
					{weekLabels.map((day) => <div key={day} className='calendar__weekday'>{day}</div>)}
				</div>
				<div className='calendar__grid calendar__grid--days'>
					{grid.map((dayItem, idx) => {
						const isDisabled = isDateDisabled(dayItem.date);
						let isSelected = false;
						if (value instanceof DateTime) isSelected = value.isSameDay(dayItem.date);

						const classes = [
							'calendar__day',
							isDisabled ? 'calendar__day--disabled' : '',
							!dayItem.isCurrentMonth ? 'calendar__day--muted' : '',
							dayItem.isToday ? 'calendar__day--today' : '',
							isSelected ? 'calendar__day--selected' : '',
						].filter(Boolean).join(' ');

						return (
							<button
								key={idx}
								type='button'
								className={classes}
								disabled={isDisabled}
								onClick={(e) => {
									e.stopPropagation();
									handleDaySelect(dayItem.date);
								}}
							>
								{dayItem.date.getDate()}
							</button>
						);
					})}
				</div>
			</>
		);
	};

	const renderMonths = () => {
		const months = Array.from({ length: 12 }, (_, i) => {
			const d = new DateTime(new Date(2000, i, 1));
			return d.toFormat('MMM');
		});

		const currentMonth = viewDate.value.getMonth() - 1;

		return (
			<div className='calendar__grid calendar__grid--months'>
				{months.map((m, idx) => (
					<button
						key={m}
						type='button'
						className={`calendar__cell-lg ${
							idx === currentMonth ? 'calendar__cell-lg--selected' : ''
						}`}
						onClick={(e) => {
							e.stopPropagation();
							handleMonthSelect(idx);
						}}
					>
						{m}
					</button>
				))}
			</div>
		);
	};

	const renderYears = () => {
		const currentYear = viewDate.value.getYear();
		const startYear = Math.floor(currentYear / 10) * 10;
		const years = Array.from({ length: 12 }, (_, i) => startYear - 1 + i);

		return (
			<div className='calendar__grid calendar__grid--years'>
				{years.map((y) => (
					<button
						key={y}
						type='button'
						className={`calendar__cell-lg ${
							y === currentYear ? 'calendar__cell-lg--selected' : ''
						} ${y < startYear || y > startYear + 9 ? 'calendar__day--muted' : ''}`}
						onClick={(e) => {
							e.stopPropagation();
							handleYearSelect(y);
						}}
					>
						{y}
					</button>
				))}
			</div>
		);
	};
	// #endregion

	return (
		<div className={`calendar ${className || ''}`}>
			{renderHeader()}
			<div className='calendar__body'>
				{scope.value === 'day' && renderDays()}
				{scope.value === 'month' && renderMonths()}
				{scope.value === 'year' && renderYears()}
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

export type TimeSelectionMode = 'single' | 'multiple';

interface TimeClockProps {
	value?: DateTime | DateTime[];
	onChange?: (date: any) => void;
	selectionMode?: TimeSelectionMode;
}

type ViewMode = 'hours' | 'minutes';

export function TimeClock(props: TimeClockProps) {
	const { value, onChange, selectionMode = 'single' } = props;

	// Helper to get the primary "view" date (for header display)
	const getPrimaryDate = () => {
		if (Array.isArray(value)) {
			return value.length > 0 ? value[value.length - 1] : new DateTime();
		}
		return value || new DateTime();
	};

	const displayDate = getPrimaryDate();

	// State
	const mode = useSignal<ViewMode>('hours');
	const isPm = useSignal(displayDate.getHour() >= 12);
	const isDragging = useSignal(false);
	const clockRef = useRef<HTMLDivElement>(null);

	// Display values
	const hours12 = displayDate.getHour() % 12 || 12;
	const minutes = displayDate.getMinute();

	// --- Handlers ---

	const updateValue = (newDate: DateTime, isFinish: boolean) => {
		let result: any;

		if (selectionMode === 'single') {
			result = newDate;
		} else {
			// Multi-select logic
			const current = (Array.isArray(value) ? value : (value ? [value] : [])) as DateTime[];

			// Check if we are toggling an existing time
			// We compare based on the current mode (Hour match or Minute match)
			// Simplification: For multi-time, we usually just add the new timestamp.
			// However, UX for multi-time on a clock is tricky.
			// We will assume "Add/Update" logic.

			// For this implementation, we replace the last entry if dragging,
			// or add new if clicking fresh?
			// To keep it simple: Multi-mode on a clock usually implies picking slots.
			// We will append if it doesn't exist, remove if it does (Toggle).

			// Check for exact hour/minute match in current array
			const existsIndex = current.findIndex((d) =>
				d.getHour() === newDate.getHour() && d.getMinute() === newDate.getMinute()
			);

			if (existsIndex >= 0) {
				if (isFinish) {
					// Toggle off on release
					result = current.filter((_, i) => i !== existsIndex);
				} else {
					result = current; // Don't toggle while dragging
				}
			} else {
				result = [...current, newDate];
			}
		}

		onChange?.(result);

		// Auto-switch to minutes only in single mode
		if (isFinish && mode.value === 'hours' && selectionMode === 'single') {
			mode.value = 'minutes';
		}
	};

	const handlePointer = (e: PointerEvent, isFinish: boolean) => {
		if (!clockRef.current) return;

		const rect = clockRef.current.getBoundingClientRect();
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const x = e.clientX - rect.left - centerX;
		const y = e.clientY - rect.top - centerY;

		const steps = mode.value === 'hours' ? 12 : 60;
		let val = getAngleValue(x, y, steps);

		// Calculate new date based on primary
		const d = new Date(displayDate.getTime());

		if (mode.value === 'hours') {
			if (isPm.value && val < 12) val += 12;
			if (!isPm.value && val === 12) val = 0;
			d.setHours(val);
		} else {
			d.setMinutes(val);
		}

		const newDateTime = new DateTime(d);
		updateValue(newDateTime, isFinish);
	};

	const toggleAmPm = (pm: boolean) => {
		isPm.value = pm;
		// Update ALL selected dates or just display?
		// Usually AM/PM toggles the context for future clicks.
		// For single value, we update immediately.
		if (selectionMode === 'single') {
			let h = displayDate.getHour();
			if (pm && h < 12) h += 12;
			if (!pm && h >= 12) h -= 12;

			const d = new Date(displayDate.getTime());
			d.setHours(h);
			onChange?.(new DateTime(d));
		}
	};

	// --- Rendering ---

	const renderFace = () => {
		const total = mode.value === 'hours' ? 12 : 12; // 12 visual segments
		const numbers = [];
		const radius = 100;

		// Determine highlighted values
		const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

		for (let i = 1; i <= total; i++) {
			const numVal = mode.value === 'hours' ? i : i * 5;
			const pos = getPosition(i, 12, radius);

			// Check if this number is selected
			let isActive = false;
			let isMulti = false;

			if (mode.value === 'hours') {
				// Match hour (considering AM/PM context of the toggle)
				// We highlight if ANY selected date matches this hour in current AM/PM context
				const checkHour = isPm.value ? (i === 12 ? 12 : i + 12) : (i === 12 ? 0 : i);

				isActive = selectedValues.some((d) => d.getHour() === checkHour);
			} else {
				// Match minute (rough match for 5-min intervals)
				const checkMin = numVal === 60 ? 0 : numVal;
				isActive = selectedValues.some((d) => Math.round(d.getMinute() / 5) * 5 === checkMin);
			}

			// Style distinction for primary vs multi
			if (isActive) {
				const isPrimary = mode.value === 'hours'
					? (displayDate.getHour() % 12 || 12) === i
					: Math.round(displayDate.getMinute() / 5) * 5 === numVal;
				if (!isPrimary && selectionMode === 'multiple') isMulti = true;
			}

			numbers.push(
				<div
					key={i}
					className={`clock__number ${isActive ? 'clock__number--active' : ''} ${
						isMulti ? 'clock__number--multi' : ''
					}`}
					style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
				>
					{numVal === 60 ? '00' : numVal}
				</div>,
			);
		}

		// Hand logic (only points to primary display value)
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
import { Popover } from '@projective/ui';

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

	if (
		!isValueSignal && value !== undefined && value !== internalSignal.peek()
	) {
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
											if (v instanceof DateTime) {
												updateDatePart(v);
											}
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
/* #region Imports */
import '../styles/fields/file-drop.css';
import { JSX } from 'preact';
import { useSignal } from '@preact/signals';
import {
	IconBooks,
	IconCloudUpload,
	IconFile,
	IconFilePlus,
	IconLoader2,
	IconPhoto,
	IconRefresh,
	IconTrash,
} from '@tabler/icons-preact';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { FileWithMeta, getFileCategory } from '@projective/types';
import { FileFieldProps } from '../types/file.ts';
import { TargetedEvent } from 'preact';
import { toast } from '@projective/ui'; // Required for notifications
/* #endregion */

export function FileDrop(props: FileFieldProps) {
	const {
		id,
		label,
		value,
		onChange,
		accept,
		multiple,
		disabled,
		className,
		style,
		error,
		required,
		variant = 'split',
		listPosition = 'below',
		onLibraryClick,
		maxSize = 10 * 1024 * 1024,
		maxFiles = 10,
		floatingRule = 'never',
		actionPosition = 'below',
	} = props;

	const isDragging = useSignal(false);
	const inputRef = useSignal<HTMLInputElement | null>(null);

	const files = value?.value || [];

	// #region Helpers
	const processFiles = (incomingFiles: File[]) => {
		if (disabled) return;

		let validFiles = incomingFiles;

		// 1. Validate File Type (Accept) - CRITICAL FOR DRAG & DROP
		if (accept) {
			const acceptedTypes = accept.split(',').map((t) => t.trim().toLowerCase());

			validFiles = validFiles.filter((f) => {
				const fType = f.type.toLowerCase();
				const fName = f.name.toLowerCase();

				const isValid = acceptedTypes.some((type) => {
					// Check extension (e.g., .png)
					if (type.startsWith('.')) return fName.endsWith(type);
					// Check mime type (e.g., image/*)
					if (type.endsWith('/*')) return fType.startsWith(type.replace('/*', ''));
					// Check exact mime type (e.g., image/png)
					return fType === type;
				});

				if (!isValid) {
					toast.error(`File "${f.name}" format is not supported.`);
					return false;
				}
				return true;
			});
		}

		// 2. Validate Max Files
		if (!multiple && validFiles.length > 1) {
			// If single mode, just take the last one dropped
			validFiles = [validFiles[validFiles.length - 1]];
		} else if (multiple && (files.length + validFiles.length) > maxFiles) {
			const slotsRemaining = maxFiles - files.length;
			if (slotsRemaining <= 0) {
				toast.error(`Maximum file limit (${maxFiles}) reached.`);
				return;
			}

			toast.warning(`Limit exceeded. Only adding ${slotsRemaining} file(s).`);
			validFiles = validFiles.slice(0, slotsRemaining);
		}

		// 3. Validate Size
		validFiles = validFiles.filter((f) => {
			if (f.size > maxSize) {
				const sizeMb = Math.round(maxSize / 1024 / 1024);
				toast.error(`"${f.name}" is too large (Max ${sizeMb}MB).`);
				return false;
			}
			return true;
		});

		if (validFiles.length === 0) return;

		// 4. Create FileWithMeta
		const processed: FileWithMeta[] = validFiles.map((f) => ({
			file: f,
			id: crypto.randomUUID(),
			status: 'pending',
			progress: 0,
			errors: [],
			type: getFileCategory(f),
			meta: {
				uploadedAt: new Date().toISOString(),
			},
		}));

		if (onChange) {
			if (multiple) {
				onChange([...files, ...processed]);
			} else {
				// Replace in single mode
				onChange([processed[processed.length - 1]]);
			}
		}
	};

	const handleRemove = (fileId: string, e?: Event) => {
		e?.stopPropagation();
		if (onChange) {
			onChange(files.filter((f) => f.id !== fileId));
		}
	};
	// #endregion

	// #region Event Handlers
	const handleDragEnter = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!disabled) isDragging.value = true;
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();

		// Fix: Only disable dragging if we actually left the container
		// (prevents flickering when dragging over child elements like icons)
		const container = e.currentTarget as HTMLElement;
		const enteringElement = e.relatedTarget as HTMLElement;

		if (!container.contains(enteringElement)) {
			isDragging.value = false;
		}
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		isDragging.value = false;

		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			processFiles(Array.from(e.dataTransfer.files));
			e.dataTransfer.clearData();
		}
	};

	const handleFileInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
		if (e.currentTarget.files) {
			processFiles(Array.from(e.currentTarget.files));
			e.currentTarget.value = '';
		}
	};

	const triggerUpload = () => inputRef.value?.click();
	// #endregion

	// #region Renderers
	const renderIcon = (file: FileWithMeta) => {
		if (file.status === 'processing') {
			return <IconLoader2 size={24} className='file-drop__spinner' />;
		}
		if (file.type === 'Image') return <IconPhoto size={24} />;
		return <IconFile size={24} />;
	};

	const renderFileList = () => (
		<div className='file-drop__list'>
			{files.map((file) => (
				<div key={file.id} className='file-drop__item'>
					{file.status === 'processing' && (
						<div className='file-drop__progress-bg' style={{ width: `${file.progress}%` }} />
					)}

					<div className='file-drop__item-info'>
						{file.type === 'Image'
							? (
								<img
									src={URL.createObjectURL(file.file)}
									className='file-drop__preview-thumb'
									alt={file.file.name}
								/>
							)
							: (
								<div style={{ color: 'var(--text-secondary)' }}>
									{renderIcon(file)}
								</div>
							)}

						<div className='file-drop__meta'>
							<span className='file-drop__filename'>{file.file.name}</span>
							<span className='file-drop__filesize'>
								{(file.file.size / 1024 / 1024).toFixed(2)} MB
								{file.status === 'processing' && ` • ${Math.round(file.progress)}%`}
								{file.status === 'error' && (
									<span style={{ color: 'var(--error-500)' }}>• Failed</span>
								)}
							</span>
						</div>
					</div>

					<button
						type='button'
						className='file-drop__remove'
						onClick={(e) => handleRemove(file.id!, e)}
						title='Remove file'
					>
						<IconTrash size={18} />
					</button>
				</div>
			))}
		</div>
	);

	const renderSinglePreview = (file: FileWithMeta) => (
		<div
			className={`file-drop__container ${disabled ? 'file-drop__container--disabled' : ''}`}
			style={{ flexDirection: 'column', height: 'auto', padding: 0 }}
		>
			<div className={`file-drop__single-preview file-drop__single-preview--${actionPosition}`}>
				<img
					src={URL.createObjectURL(file.file)}
					className='file-drop__single-img'
					alt='Preview'
				/>

				{actionPosition === 'overlay' && (
					<button type='button' className='file-drop__change-btn' onClick={triggerUpload}>
						<IconRefresh size={32} />
						<span>Change Image</span>
					</button>
				)}
			</div>

			{actionPosition === 'below' && (
				<button
					type='button'
					className='file-drop__remove-bar'
					onClick={() => handleRemove(file.id!)}
				>
					<IconTrash size={16} /> Remove & Change
				</button>
			)}
		</div>
	);
	// #endregion

	const hasSingleFile = !multiple && files.length > 0;

	return (
		<div className={`field-file ${className || ''}`} style={style}>
			<LabelWrapper
				id={id}
				label={label}
				disabled={disabled}
				required={required}
				error={!!error}
				floatingRule={floatingRule}
			/>

			{/* LIST ABOVE */}
			{listPosition === 'top' && multiple && files.length > 0 && renderFileList()}

			{/* DROPZONE OR SINGLE PREVIEW */}
			{hasSingleFile
				? (
					renderSinglePreview(files[0])
				)
				: (
					<div
						className={[
							'file-drop__container',
							disabled && 'file-drop__container--disabled',
							!!error && 'file-drop__container--error',
							variant === 'single' && 'file-drop__container--single',
						].filter(Boolean).join(' ')}
						onDragEnter={handleDragEnter}
						onDragOver={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onClick={variant === 'single' ? triggerUpload : undefined}
					>
						<input
							ref={(el) => (inputRef.value = el) as any}
							type='file'
							id={id}
							multiple={multiple}
							accept={accept}
							onChange={handleFileInput}
							style={{ display: 'none' }}
						/>

						{isDragging.value && (
							<div className='file-drop__overlay'>
								<div className='file-drop__overlay-content'>
									<IconFilePlus size={48} />
									<span>Drop files to add them</span>
								</div>
							</div>
						)}

						{variant === 'split' && (
							<>
								<div
									className='file-drop__split-action'
									onClick={(e) => {
										e.stopPropagation();
										triggerUpload();
									}}
								>
									<IconCloudUpload size={32} stroke={1.5} />
									<div>
										<div className='file-drop__label'>Upload from Device</div>
										<div className='file-drop__sub'>JPG, PNG, PDF (Max 10MB)</div>
									</div>
								</div>
								<div className='file-drop__divider' />
								<div
									className='file-drop__split-action'
									onClick={(e) => {
										e.stopPropagation();
										onLibraryClick?.();
									}}
								>
									<IconBooks size={32} stroke={1.5} />
									<div>
										<div className='file-drop__label'>Select from Library</div>
										<div className='file-drop__sub'>Reuse existing assets</div>
									</div>
								</div>
							</>
						)}

						{variant === 'single' && (
							<div className='file-drop__split-action' style={{ width: '100%', border: 'none' }}>
								<IconCloudUpload size={32} stroke={1.5} />
								<div className='file-drop__label'>Click to Upload</div>
							</div>
						)}
					</div>
				)}

			{/* LIST BELOW */}
			{listPosition === 'below' && multiple && files.length > 0 && renderFileList()}
		</div>
	);
}

```

### File: packages\fields\src\components\HelpTooltip.tsx

```tsx
import { JSX } from 'preact';
import { IconHelp } from '@tabler/icons-preact';
import '../styles/components/help-tooltip.css';

export interface HelpTooltipProps {
	/** The content to show in the tooltip */
	content: string | JSX.Element;
	/** Optional link to navigate to on click */
	href?: string;
	/** Optional override for the icon */
	icon?: JSX.Element;
	className?: string;
	style?: JSX.CSSProperties;
}

export function HelpTooltip({ content, href, icon, className, style }: HelpTooltipProps) {
	const Icon = icon || <IconHelp size={16} />;

	// If it's a link, we render an anchor tag
	if (href) {
		return (
			<a
				href={href}
				target='_blank'
				rel='noopener noreferrer'
				className={`help-tooltip ${className || ''}`}
				style={style}
				onClick={(e) => e.stopPropagation()} // Prevent triggering parent label clicks
			>
				<span className='help-tooltip__icon'>{Icon}</span>
				<span className='help-tooltip__popup'>
					{content}
					<span className='help-tooltip__arrow' />
				</span>
			</a>
		);
	}

	// Otherwise, just a span
	return (
		<span className={`help-tooltip ${className || ''}`} style={style}>
			<span className='help-tooltip__icon'>{Icon}</span>
			<span className='help-tooltip__popup'>
				{content}
				<span className='help-tooltip__arrow' />
			</span>
		</span>
	);
}

```

### File: packages\fields\src\components\MoneyField.tsx

```tsx
import { TargetedEvent } from 'preact';
import { Signal, useSignal } from '@preact/signals';
import { MoneyFieldProps } from '../types/components/money-field.ts';
import { TextField } from './TextField.tsx';
import { useCurrencyMask } from '../hooks/useCurrencyMask.ts';

export function MoneyField(props: MoneyFieldProps) {
	const {
		value,
		defaultValue,
		onChange,
		onBlur,
		onFocus,
		currency = 'USD',
		locale = 'en-US',
		placeholder = '0.00',
		...rest
	} = props;

	const isValueSignal = value instanceof Signal;
	const internalSignal = useSignal(
		isValueSignal ? value.peek() : (value ?? defaultValue),
	);

	if (!isValueSignal && value !== undefined && value !== internalSignal.peek()) {
		internalSignal.value = value;
	}

	const signalValue = isValueSignal ? value : internalSignal;

	const { displayValue, handleBlur, handleFocus, handleChange, setProgrammaticValue } =
		useCurrencyMask(
			signalValue as Signal<number | undefined>,
			currency,
			locale,
		);

	const lastX = useSignal<number | null>(null);
	const lastTime = useSignal<number | null>(null);

	const handlePointerDown = (e: PointerEvent) => {
		const target = e.currentTarget as HTMLElement;
		target.setPointerCapture(e.pointerId);
		lastX.value = e.clientX;
		lastTime.value = performance.now();
		e.preventDefault();
	};

	const handlePointerMove = (e: PointerEvent) => {
		if (lastX.value === null || lastTime.value === null) return;

		const currentX = e.clientX;
		const currentTime = performance.now();

		const dx = currentX - lastX.value;
		const dt = currentTime - lastTime.value;

		if (dt > 0 && dx !== 0) {
			const velocity = Math.abs(dx / dt);

			const speedMultiplier = 1 + Math.log1p(velocity * 10);

			const delta = dx * 0.2 * speedMultiplier;

			const currentVal = signalValue.peek() ?? 0;
			const newVal = Math.max(0, currentVal + delta);

			setProgrammaticValue(newVal);
			onChange?.(newVal);
		}

		lastX.value = currentX;
		lastTime.value = currentTime;
	};

	const handlePointerUp = (e: PointerEvent) => {
		if (lastX.value !== null) {
			const target = e.currentTarget as HTMLElement;
			target.releasePointerCapture(e.pointerId);
			lastX.value = null;
			lastTime.value = null;
		}
	};

	return (
		<TextField
			{...rest}
			value={displayValue}
			placeholder={placeholder}
			onInput={(e: TargetedEvent<HTMLInputElement>) => {
				handleChange(e.currentTarget.value);
				onChange?.(signalValue.peek() as number);
			}}
			onBlur={(e) => {
				handleBlur();
				onBlur?.(e);
			}}
			onFocus={(e) => {
				handleFocus();
				onFocus?.(e);
			}}
			prefixProps={{
				onPointerDown: handlePointerDown,
				onPointerMove: handlePointerMove,
				onPointerUp: handlePointerUp,
				style: { cursor: 'ew-resize', touchAction: 'none' },
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

### File: packages\fields\src\components\RichTextField.tsx

```tsx
/* #region Imports */
import '../styles/fields/rich-text-field.css';
import { useEffect, useRef } from 'preact/hooks';
import { Signal, useComputed, useSignal } from '@preact/signals';
import { RichTextFieldProps } from '../types/components/rich-text-field.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
/* #endregion */

let Quill: any = null;

/**
 * @function RichTextField
 * @description A high-performance rich text editor powered by Quill, integrated
 * with the projective design system.
 * * @param {RichTextFieldProps} props - Component properties.
 * @returns {JSX.Element}
 */
export function RichTextField(props: RichTextFieldProps) {
	// #region State & Destructuring
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		outputFormat = 'delta',
		toolbar = 'basic',
		variant = 'framed',
		secureLinks = true,
		placeholder,
		readOnly,
		onImageUpload,
		error,
		hint,
		warning,
		info,
		disabled,
		required,
		minHeight = '150px',
		maxHeight,
		maxLength,
		showCount,
		className,
		style,
	} = props;

	const editorRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const quillInstance = useRef<any>(null);
	const parserRef = useRef<any>(null);

	const length = useSignal(0);

	const getRawValue = () => {
		if (value instanceof Signal) return value.value;
		return value || defaultValue || '';
	};

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const isReadOnly = !!readOnly || isDisabled;
	const isError = error instanceof Signal ? error.value : error;
	const isWarning = warning instanceof Signal ? warning.value : warning;

	const isOverLimit = useComputed(() => maxLength ? length.value > maxLength : false);
	// #endregion

	// #region Helper Logic: Links & Images
	/**
	 * @function registerSecureLink
	 * @description Sanitizes and secures link creation within the editor.
	 */
	const registerSecureLink = (QuillArg: any) => {
		const Link = QuillArg.import('formats/link');
		class SecureLink extends Link {
			static create(value: string) {
				const node = super.create(value);
				value = this.sanitize(value);
				node.setAttribute('href', value);
				node.setAttribute('rel', 'noopener noreferrer');
				node.setAttribute('target', '_blank');
				return node;
			}
			static sanitize(url: string) {
				const protocol = url.slice(0, url.indexOf(':'));
				if (['javascript', 'vbscript', 'data'].includes(protocol.toLowerCase())) {
					return 'about:blank';
				}
				return super.sanitize(url);
			}
		}
		if (secureLinks) {
			QuillArg.register(SecureLink, true);
		}
	};

	const insertImage = (url: string) => {
		const quill = quillInstance.current;
		if (!quill) return;
		const range = quill.getSelection(true);
		quill.insertEmbed(range.index, 'image', url);
		quill.setSelection(range.index + 1);
	};

	const handleFiles = async (files: FileList | File[]) => {
		if (!onImageUpload) return;
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (file.type.startsWith('image/')) {
				try {
					const url = await onImageUpload(file);
					insertImage(url);
				} catch (err) {
					console.error('Image upload failed', err);
				}
			}
		}
	};

	const imageHandler = () => {
		const input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'image/*');
		input.click();

		input.onchange = () => {
			if (input.files && input.files[0]) {
				if (onImageUpload) {
					handleFiles([input.files[0]]);
				} else {
					const reader = new FileReader();
					reader.onload = (e) => {
						insertImage(e.target?.result as string);
					};
					reader.readAsDataURL(input.files[0]);
				}
			}
		};
	};
	// #endregion

	// #region Lifecycle: Quill Initialization
	useEffect(() => {
		if (typeof window === 'undefined' || !editorRef.current) return;

		const init = async () => {
			if (!Quill) {
				const mod = await import('quill');
				Quill = mod.default;
				registerSecureLink(Quill);
			}

			if (!parserRef.current) {
				const { MarkdownParser } = await import('../../../utils/src/markdown/QuillParser.ts');
				parserRef.current = new MarkdownParser();
			}

			if (quillInstance.current) {
				if (quillInstance.current.isEnabled() === isReadOnly) {
					quillInstance.current.enable(!isReadOnly);
				}
				return;
			}

			let toolbarConfig = toolbar;
			if (toolbar === 'basic') {
				toolbarConfig = [
					['bold', 'italic', 'underline', 'strike'],
					['link', 'blockquote'],
					[{ 'list': 'ordered' }, { 'list': 'bullet' }],
					['clean'],
				];
			} else if (toolbar === 'full') {
				toolbarConfig = [
					[{ 'header': [1, 2, 3, false] }],
					['bold', 'italic', 'underline', 'strike'],
					[{ 'color': [] }, { 'background': [] }],
					[{ 'script': 'sub' }, { 'script': 'super' }],
					['link', 'blockquote', 'code-block', 'image'],
					[{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
					[{ 'align': [] }],
					['clean'],
				];
			}

			const modules = {
				toolbar: isReadOnly ? false : {
					container: toolbarConfig,
					handlers: { image: imageHandler },
				},
			};

			quillInstance.current = new Quill(editorRef.current, {
				theme: 'snow',
				modules,
				placeholder: isReadOnly ? '' : placeholder,
				readOnly: isReadOnly,
			});

			const toolbarC = containerRef.current?.querySelector('.ql-toolbar');
			if (toolbarC) {
				const controls = toolbarC.querySelectorAll('button, select');
				controls.forEach((control) => control.setAttribute('tabindex', '-1'));
			}

			if (!isReadOnly) {
				quillInstance.current.root.addEventListener('drop', (e: DragEvent) => {
					if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
						e.preventDefault();
						handleFiles(e.dataTransfer.files);
					}
				});
			}

			const raw = getRawValue();
			if (raw) {
				try {
					if (typeof raw === 'object' && raw !== null) {
						quillInstance.current.setContents(raw);
					} else if (typeof raw === 'string') {
						const trimmed = raw.trim();
						if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
							quillInstance.current.setContents(JSON.parse(trimmed));
						} else if (trimmed.startsWith('<')) {
							const delta = quillInstance.current.clipboard.convert(trimmed);
							quillInstance.current.setContents(delta);
						} else {
							if (parserRef.current) {
								parserRef.current.markdownToDelta(raw).then((delta: any) => {
									quillInstance.current.setContents(delta);
								});
							} else {
								quillInstance.current.setText(raw);
							}
						}
					}
				} catch {
					quillInstance.current.setText(String(raw));
				}
			}

			length.value = Math.max(0, quillInstance.current.getLength() - 1);

			quillInstance.current.on('text-change', () => {
				const delta = quillInstance.current.getContents();
				length.value = Math.max(0, quillInstance.current.getLength() - 1);

				let output = '';
				if (outputFormat === 'delta') output = JSON.stringify(delta);
				else if (outputFormat === 'html') output = quillInstance.current.root.innerHTML;
				else if (outputFormat === 'markdown' && parserRef.current) {
					output = parserRef.current.deltaToMarkdown(delta);
				}

				if (value instanceof Signal) value.value = output;
				onChange?.(output);
			});
		};

		init();
	}, [isReadOnly]);
	// #endregion

	// #region Render
	return (
		<div
			className={`field-rich-text field-rich-text--${variant} ${
				isReadOnly ? 'field-rich-text--readonly' : ''
			} ${className || ''}`}
			style={style}
		>
			<LabelWrapper
				id={id}
				label={label}
				required={required}
				error={!!isError}
				disabled={isDisabled}
				position='top'
				floatingRule='never'
			/>

			<div
				ref={containerRef}
				className={`field-rich-text__container ${
					isError ? 'field-rich-text__container--error' : ''
				} ${isWarning ? 'field-rich-text__container--warning' : ''}`}
			>
				<div
					ref={editorRef}
					style={{
						minHeight: variant === 'inline' ? 'auto' : minHeight,
						maxHeight: maxHeight,
					}}
				/>
			</div>

			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<div style={{ flex: 1 }}>
					<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
				</div>

				{showCount && (
					<div
						className={`field-rich-text__count ${
							isOverLimit.value ? 'field-rich-text__count--limit' : ''
						}`}
					>
						{length}/{maxLength || '∞'}
					</div>
				)}
			</div>
		</div>
	);
	// #endregion
}

```

### File: packages\fields\src\components\SelectField.tsx

```tsx
import '../styles/fields/select-field.css';
import { Signal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { IconCheck, IconChevronDown, IconLoader2, IconSelector, IconX } from '@tabler/icons-preact';
import { SelectFieldProps, SelectOption } from '../types/components/select-field.ts';
import { useSelectState } from '../hooks/useSelectState.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { EffectWrapper, useRipple } from '../wrappers/EffectWrapper.tsx';
import { focusNextElement } from '../hooks/useFocusNext.ts';

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
		groupSelectMode = 'value',
		icons,
		nextField,
		onKeyDown,
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
		groupSelectMode,
	});

	useEffect(() => {
		if (isOpen.value && containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const spaceBelow = globalThis.innerHeight - rect.bottom;
			if (containerRef.current.classList.contains('field-select--up')) {
				if (spaceBelow > 250) containerRef.current.classList.remove('field-select--up');
			} else {
				if (spaceBelow < 250) containerRef.current.classList.add('field-select--up');
			}

			if (searchable && inputRef.current) {
				inputRef.current.focus();
			}

			if (listRef.current && highlightedIndex.value >= 0) {
				const highlightedEl = listRef.current.children[highlightedIndex.value] as HTMLElement;
				if (highlightedEl) {
					highlightedEl.scrollIntoView({ block: 'nearest' });
				}
			}
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
	}, []);

	const getLabelForValue = (val: T) => {
		const findInTree = (opts: SelectOption<T>[]): SelectOption<T> | undefined => {
			for (const o of opts) {
				if (o.value === val) return o;
				if (o.options) {
					const found = findInTree(o.options);
					if (found) return found;
				}
			}
			return undefined;
		};
		const opt = findInTree(options);
		return opt ? opt.label : String(val);
	};

	const renderStatusIcon = () => {
		if (loading) return icons?.loading || <IconLoader2 className='field-select__spin' size={18} />;
		if (errorMessage) return icons?.invalid;
		if (isOpen.value) return icons?.arrowOpen || <IconChevronDown size={18} />;
		return icons?.arrow || <IconChevronDown size={18} />;
	};

	const renderChips = () => {
		return selectedValues.value.map((val) => {
			const label = getLabelForValue(val);
			return (
				<span key={String(val)} className='field-select__chip'>
					{label}
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
			const val = selectedValues.value[0];
			const label = getLabelForValue(val);

			if (searchable && searchQuery.value) return null;
			return (
				<div className='field-select__single'>
					{label}
				</div>
			);
		}

		return null;
	};

	const handleContainerClick = (e: MouseEvent) => {
		if (isDisabled) return;
		if (searchable && isOpen.value && e.target === inputRef.current) return;

		addRipple(e);
		toggleOpen();
		if (!isOpen.value) interaction.handleFocus(e);
	};

	const handleFieldKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Tab' && !e.shiftKey && nextField && !isOpen.value) {
			e.preventDefault();
			focusNextElement(inputRef.current || containerRef.current!, nextField);
		}

		handleKeyDown(e);
		onKeyDown?.(e);
	};

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
					if (e.target !== inputRef.current) e.preventDefault();
				}}
			>
				<EffectWrapper focused={interaction.focused} disabled={isDisabled} />

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
							onKeyDown={handleFieldKeyDown}
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
								const isHighlighted = index === highlightedIndex.value;

								let isSelected = false;
								if (option.isGroup && groupSelectMode === 'members' && multiple) {
									isSelected = option.descendantValues.length > 0 &&
										option.descendantValues.every((v) => selectedValues.value.includes(v));
								} else {
									isSelected = selectedValues.value.includes(option.value);
								}

								return (
									<div
										key={String(option.value) + index}
										className={[
											'field-select__option',
											isSelected && 'field-select__option--selected',
											isHighlighted && 'field-select__option--highlighted',
											option.disabled && 'field-select__option--disabled',
											option.isGroup && 'field-select__option--group',
										].filter(Boolean).join(' ')}
										style={{ paddingLeft: `${(option.depth * 12) + 12}px` }} // Indentation
										onClick={(e) => {
											e.stopPropagation();
											selectOption(option);
										}}
										onMouseEnter={() => highlightedIndex.value = index}
									>
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
								);
							})
						)}
				</div>
			</div>

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

					const markStyle = vertical
						? { bottom: `${pct}%`, left: '50%' }
						: { left: `${pct}%`, top: '50%' };

					const markClass = ['field-slider__mark', mark.className].filter(Boolean).join(' ');

					return (
						<div key={i} className={markClass} style={markStyle}>
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
				floatingRule={floatingRule ?? 'never'}
				required={required}
				floating={floating}
			/>

			<div className='field-slider__control' style={wrapperStyle}>
				<div
					className='field-slider__container'
					onClick={(e: MouseEvent) => handleTrackClick(e as PointerEvent)}
				>
					<div className='field-slider__track' ref={trackRef}>
						<div className='field-slider__fill' style={trackFillStyle.value}></div>

						{renderMarks()}

						{handleStyles.value.map((thumbStyle, index) => {
							const isActive = activeHandleIdx.value === index;
							const val = internalValues.value[index];

							return (
								<div
									key={index}
									className={`field-slider__thumb ${isActive ? 'field-slider__thumb--active' : ''}`}
									style={thumbStyle}
									tabIndex={isDisabled ? -1 : 0}
									role='slider'
									aria-orientation={vertical ? 'vertical' : 'horizontal'}
									aria-valuemin={min}
									aria-valuemax={max}
									aria-valuenow={val}
									onPointerDown={(e) => {
										(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
										handlePointerDown(index, e);
									}}
									onPointerMove={handlePointerMove}
									onPointerUp={(e) => {
										(e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
										handlePointerUp(e);
									}}
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
import { focusNextElement } from '../hooks/useFocusNext.ts';
import { generateTagTheme } from '@projective/utils';

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
		nextField,
		onKeyDown,
		tagColor,
		tagVariant = 'transparent',
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
		// Tab Navigation
		if (e.key === 'Tab' && !e.shiftKey && nextField) {
			e.preventDefault();
			focusNextElement(e.currentTarget as HTMLElement, nextField);
		}

		// Tag Creation
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

		onKeyDown?.(e);
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

	const getTagStyles = (tag: string) => {
		if (!tagColor) return {};
		const colorStr = typeof tagColor === 'function' ? tagColor(tag) : tagColor;
		return generateTagTheme(colorStr, tagVariant);
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
					<div key={tag} className='field-tag__chip' style={getTagStyles(tag)}>
						<span>{tag}</span>
						<span
							className='field-tag__chip-remove'
							onClick={(e) => {
								e.stopPropagation();
								removeTag(tag);
							}}
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='14'
								height='14'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M18 6 6 18' />
								<path d='m6 6 12 12' />
							</svg>
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
import { TargetedEvent } from 'preact';
import { computed, Signal } from '@preact/signals';
import { TextFieldProps } from '../types/components/text-field.ts';
import { useFieldState } from '../hooks/useFieldState.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { EffectWrapper } from '../wrappers/EffectWrapper.tsx';
import { AdornmentWrapper } from '../wrappers/AdornmentWrapper.tsx';
import { focusNextElement } from '../hooks/useFocusNext.ts';

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
		help,
		helpLink,
		helpPosition,
		type = 'text',
		multiline,
		rows = 3,
		maxRows,
		autoComplete,
		pattern,
		min,
		max,
		minLength,
		maxLength,
		showCount,
		prefix,
		suffix,
		prefixProps,
		suffixProps,
		onPrefixClick,
		onSuffixClick,
		onInput,
		onFocus,
		onBlur,
		nextField,
		onKeyDown,
	} = props;

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

	const length = computed(() => val.length);
	const isOverLimit = computed(() => maxLength ? length.value > maxLength : false);

	const handleContainerClick = (e: MouseEvent) => {
		if (isDisabled) return;
		const input = (e.currentTarget as HTMLElement).querySelector<
			HTMLInputElement | HTMLTextAreaElement
		>('.field-text__input');
		input?.focus();
	};

	const handleInput = (e: TargetedEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const newValue = e.currentTarget.value;
		fieldState.setValue(newValue);
		interaction.handleChange(newValue);
		onInput?.(e);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !multiline) {
			e.preventDefault();
			focusNextElement(e.currentTarget as HTMLElement, nextField);
		} else if (e.key === 'Tab' && !e.shiftKey && nextField) {
			e.preventDefault();
			focusNextElement(e.currentTarget as HTMLElement, nextField);
		}
		onKeyDown?.(e);
	};

	const renderInput = () => {
		const commonProps = {
			id,
			className: 'field-text__input',
			value: val,
			onInput: handleInput,
			onKeyDown: handleKeyDown,
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
			min,
			max,
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
					{...prefixProps}
				>
					{prefix}
				</AdornmentWrapper>

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
					help={help}
					helpLink={helpLink}
					helpPosition={helpPosition} // Passed down
				/>

				{renderInput()}

				<AdornmentWrapper
					position='suffix'
					onClick={onSuffixClick}
					{...suffixProps}
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
import { TimeFieldProps, TimeValue } from '../types/components/time-field.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { useFieldState } from '../hooks/useFieldState.ts';
import { AdornmentWrapper } from '../wrappers/AdornmentWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { DateTime } from '@projective/types';
import { Popover } from '@projective/ui';
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
		variant = 'popup',
		selectionMode = 'single',
	} = props;

	// FIX: Explicitly type the field state to allow DateTime arrays
	const fieldState = useFieldState<TimeValue | undefined>({
		value,
		defaultValue,
		required,
		disabled,
		error,
		onChange: onChange as (val: TimeValue | undefined) => void,
	});

	const interaction = useInteraction(fieldState.value.value);
	const isOpen = useSignal(false);

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = fieldState.error.value;

	const displayValue = computed(() => {
		const val = fieldState.value.value;
		if (!val) return '';

		if (Array.isArray(val)) {
			if (val.length === 0) return '';
			if (val.length === 1) return val[0].toFormat('HH:mm');
			return `${val.length} times selected`;
		}

		return (val as DateTime).toFormat('HH:mm');
	});

	const handleTimeSelect = (date: TimeValue) => {
		fieldState.setValue(date);

		// Auto-close logic
		if (selectionMode === 'single' && !Array.isArray(date)) {
			// Small delay to allow visual feedback
			setTimeout(() => {
				isOpen.value = false;
				interaction.handleBlur();
			}, 100);
		}
	};

	// --- Inline Variant ---
	if (variant === 'inline') {
		return (
			<div
				className={`field-date field-date--inline ${className || ''}`}
				style={style}
			>
				<TimeClock
					value={fieldState.value.value}
					onChange={handleTimeSelect}
					selectionMode={selectionMode}
				/>
				<MessageWrapper
					error={error}
					hint={hint}
					warning={warning}
					info={info}
				/>
			</div>
		);
	}

	// --- Popup Variant ---
	return (
		<div className={`field-date ${className || ''}`} style={style}>
			<Popover
				isOpen={isOpen.value}
				onClose={() => {
					isOpen.value = false;
					interaction.handleBlur();
				}}
				trigger={
					<div
						onClick={() => !isDisabled && (isOpen.value = !isOpen.value)}
					>
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
										!isDisabled &&
											(isOpen.value = !isOpen.value);
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
						selectionMode={selectionMode}
					/>
				}
			/>
			<MessageWrapper
				error={error}
				hint={hint}
				warning={warning}
				info={info}
			/>
		</div>
	);
}

```

### File: packages\fields\src\hooks\useCurrencyMask.ts

```ts
import { Signal, useSignal } from '@preact/signals';

export function useCurrencyMask(
	value: Signal<number | undefined>,
	currency = 'USD',
	locale = 'en-US',
) {
	const displayValue = useSignal('');

	const formatCurrency = (val: number) => {
		return new Intl.NumberFormat(locale, {
			style: 'decimal',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(val);
	};

	const handleBlur = () => {
		if (value.value !== undefined && !isNaN(value.value)) {
			displayValue.value = formatCurrency(value.value);
		} else {
			value.value = 0;
			displayValue.value = formatCurrency(0);
		}
	};

	const handleFocus = () => {
		if (value.value !== undefined && !isNaN(value.value) && value.value !== 0) {
			displayValue.value = value.value.toString();
		} else {
			displayValue.value = '';
		}
	};

	const handleChange = (val: string) => {
		let sanitized = val.replace(/[^0-9.]/g, '');

		const parts = sanitized.split('.');
		if (parts.length > 2) {
			sanitized = parts[0] + '.' + parts.slice(1).join('');
		}

		displayValue.value = sanitized;

		if (sanitized === '' || sanitized === '.') {
			value.value = undefined;
		} else {
			value.value = parseFloat(sanitized);
		}
	};

	const setProgrammaticValue = (newVal: number) => {
		const rounded = Math.round(newVal * 100) / 100;
		value.value = rounded;
		displayValue.value = formatCurrency(rounded);
	};

	if (value.value !== undefined && !displayValue.value) {
		displayValue.value = formatCurrency(value.value);
	}

	return {
		displayValue,
		handleBlur,
		handleFocus,
		handleChange,
		setProgrammaticValue,
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
import { FileProcessor } from '../types/file.ts';
import { FileWithMeta } from '@projective/types';

const generateId = () => Math.random().toString(36).substring(2, 15);

export function useFileProcessor(
	files: FileWithMeta[],
	processors: FileProcessor[] = [],
	onChange: (files: FileWithMeta[]) => void,
) {
	const processingQueue = useSignal<string[]>([]);

	useEffect(() => {
		const pendingFiles = files.filter(
			(f) => f.id && f.status === 'pending' && !processingQueue.value.includes(f.id),
		);

		if (pendingFiles.length === 0) return;

		pendingFiles.forEach((fileMeta) => {
			processFile(fileMeta as FileWithMeta & { id: string });
		});
	}, [files]);

	const processFile = async (fileMeta: FileWithMeta & { id: string }) => {
		const fileId = fileMeta.id;

		processingQueue.value = [...processingQueue.value, fileId];

		updateFile(fileId, { status: 'processing', progress: 0 });

		const processor = processors.find((p) => p.match(fileMeta.file));

		if (!processor) {
			updateFile(fileId, { status: 'ready', progress: 100 });
			removeFromQueue(fileId);
			return;
		}

		try {
			const result = await processor.process(fileMeta.file, (pct) => {
				updateFile(fileId, { progress: pct });
			});

			updateFile(fileId, {
				file: result.file,
				processingMeta: result.metadata,
				status: 'ready',
				progress: 100,
			});
		} catch (err: any) {
			updateFile(fileId, {
				status: 'error',
				errors: [{ code: 'PROCESSING_ERROR', message: err.message || 'Unknown error' }],
			});
		} finally {
			removeFromQueue(fileId);
		}
	};

	const updateFile = (id: string | undefined, updates: Partial<FileWithMeta>) => {
		if (!id) return;
		const newFiles = files.map((f) => (f.id === id ? { ...f, ...updates } : f));
		onChange(newFiles);
	};

	const removeFromQueue = (id: string | undefined) => {
		if (!id) return;
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

	const removeFile = (id: string | undefined) => {
		if (!id) return;
		onChange(files.filter((f) => f.id !== id));
	};

	return {
		addFiles,
		removeFile,
	};
}

```

### File: packages\fields\src\hooks\useFocusNext.ts

```ts
export function focusNextElement(current: HTMLElement, explicitNext?: string | HTMLElement) {
	if (explicitNext) {
		const target = typeof explicitNext === 'string'
			? document.getElementById(explicitNext)
			: explicitNext;
		if (target) {
			target.focus();
			return;
		}
	}

	const focusableSelector =
		'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
	const root = current.closest('form') || document.body;

	const elements = Array.from(root.querySelectorAll<HTMLElement>(focusableSelector))
		.filter((el) => {
			return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
		});

	const index = elements.indexOf(current);
	if (index > -1 && index < elements.length - 1) {
		elements[index + 1].focus();
	}
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
	groupSelectMode?: 'value' | 'members';
}

// Internal Interface for the flattened list
export interface FlatOption<T> extends SelectOption<T> {
	depth: number;
	isGroup: boolean;
	// Cache all descendant values for quick "select all members" logic
	descendantValues: T[];
}

export function useSelectState<T>({
	options,
	value,
	onChange,
	multiple,
	disabled,
	groupSelectMode = 'value',
}: UseSelectStateProps<T>) {
	const isOpen = useSignal(false);
	const highlightedIndex = useSignal(-1);
	const searchQuery = useSignal('');

	// Helper: Flatten tree to list
	const flattenOptions = (
		opts: SelectOption<T>[],
		depth = 0,
		accum: FlatOption<T>[] = [],
	): FlatOption<T>[] => {
		for (const opt of opts) {
			const isGroup = !!(opt.options && opt.options.length > 0);

			// Recursively get descendants if it's a group
			let descendantValues: T[] = [];
			let childrenFlat: FlatOption<T>[] = [];

			if (isGroup && opt.options) {
				childrenFlat = flattenOptions(opt.options, depth + 1);
				// Collect leaf values from children
				descendantValues = childrenFlat
					.filter((c) => !c.isGroup || groupSelectMode === 'value') // If mode is value, groups are valid values too
					.map((c) => c.value);

				// Also include children's descendants
				childrenFlat.forEach((c) => {
					if (c.isGroup) descendantValues.push(...c.descendantValues);
				});

				// Dedup
				descendantValues = Array.from(new Set(descendantValues));
			}

			accum.push({
				...opt,
				depth,
				isGroup,
				descendantValues,
			});

			if (isGroup) {
				accum.push(...childrenFlat);
			}
		}
		return accum;
	};

	// Flatten once (memoized by computed if options change)
	const flatOptions = computed(() => flattenOptions(options));

	const selectedValues = computed(() => {
		const val = value instanceof Signal ? value.value : (value ?? []);
		return Array.isArray(val) ? val : (val ? [val] : []);
	});

	const filteredOptions = computed(() => {
		const query = searchQuery.value.toLowerCase();
		if (!query) return flatOptions.value;
		return flatOptions.value.filter((opt) => opt.label.toLowerCase().includes(query));
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

	const selectOption = (option: FlatOption<T>) => {
		if (option.disabled) return;

		let newValue: T | T[];

		if (multiple) {
			const current = selectedValues.value as T[];

			// Logic for Group Members Selection
			if (option.isGroup && groupSelectMode === 'members') {
				const targets = option.descendantValues;
				const allSelected = targets.every((v) => current.includes(v));

				if (allSelected) {
					// Deselect all members
					newValue = current.filter((v) => !targets.includes(v));
				} else {
					// Select all members (union)
					const toAdd = targets.filter((v) => !current.includes(v));
					newValue = [...current, ...toAdd];
				}
			} else {
				// Standard Toggle
				const exists = current.includes(option.value);
				if (exists) {
					newValue = current.filter((v) => v !== option.value);
				} else {
					newValue = [...current, option.value];
				}
			}

			searchQuery.value = '';
			if (value instanceof Signal) value.value = newValue;
		} else {
			// Single Select
			// If clicking a group in 'members' mode, do nothing or expand?
			// Usually single select can't select multiple members, so we treat group as unselectable label
			// or we treat it as selecting the group value itself if allowGroupSelection is true.

			if (option.isGroup && groupSelectMode === 'members') {
				// In single mode, 'members' doesn't make sense for assignment.
				// We assume clicking it does nothing or perhaps expands (if we had collapsible).
				return;
			}

			newValue = option.value;
			if (value instanceof Signal) value.value = newValue;
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

		if (value instanceof Signal) value.value = newValue;
		onChange?.(newValue);
	};

	const toggleSelectAll = () => {
		if (!multiple) return;

		// Filter out groups if we are only selecting leaf nodes, OR select everything if mode is value
		const candidateOptions = filteredOptions.value.filter((o) =>
			!o.disabled && (!o.isGroup || groupSelectMode === 'value')
		);

		const enabledValues = candidateOptions.map((o) => o.value);
		const current = selectedValues.value as T[];

		const allSelected = enabledValues.every((v) => current.includes(v));

		let newValue: T[];
		if (allSelected) {
			newValue = current.filter((v) => !enabledValues.includes(v));
		} else {
			const toAdd = enabledValues.filter((v) => !current.includes(v));
			newValue = [...current, ...toAdd];
		}

		if (value instanceof Signal) value.value = newValue;
		onChange?.(newValue);
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
				if (isOpen.value) {
					if (highlightedIndex.value >= 0) {
						const opt = filteredOptions.value[highlightedIndex.value];
						if (opt) selectOption(opt);
					} else {
						// If open but nothing is highlighted, Enter closes the menu
						toggleOpen(false);
					}
				}
				break;
			case 'Escape':
				e.preventDefault();
				toggleOpen(false);
				break;
			case 'Backspace':
				if (searchQuery.value === '' && multiple && selectedValues.value.length > 0) {
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

### File: packages\fields\src\styles\components\calendar.css

```css
/* #region 1. BLOCK: calendar */
.calendar {
  display: flex;
  flex-direction: column;
  width: 320px;
  background-color: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
  padding: 1rem;
  user-select: none;
  font-family: var(--font-sans);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  /* Optional elevation */
}

/* Header */
.calendar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  height: 32px;
}

.calendar__nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  background: transparent;
  border-radius: var(--border-radius__small);
  color: var(--field-text-secondary);
  cursor: pointer;
  transition: all var(--fast) ease;
}

.calendar__nav-btn:hover {
  background-color: var(--field-bg-hover);
  color: var(--field-text);
}

.calendar__title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--field-text);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius__xsmall);
  transition: background-color var(--fast) ease;
}

.calendar__title:hover {
  background-color: var(--field-bg-hover);
}

/* #endregion */


/* #region 2. GRID LAYOUTS */
.calendar__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 0.5rem;
  text-align: center;
}

.calendar__weekday {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar__grid--days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar__grid--months,
.calendar__grid--years {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

/* #endregion */


/* #region 3. BUTTON STATES */

/* Base Day Cell */
.calendar__day {
  height: 2.25rem;
  width: 100%;
  background: transparent;
  border: none;
  border-radius: var(--border-radius__small);
  font-size: 0.875rem;
  color: var(--field-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--fast) ease;
}

/* Base Month/Year Cell */
.calendar__cell-lg {
  height: 3.5rem;
  width: 100%;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--field-radius);
  font-size: 0.9rem;
  color: var(--field-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--fast) ease;
}

/* Hover */
.calendar__day:hover:not(:disabled),
.calendar__cell-lg:hover:not(:disabled) {
  background-color: var(--field-bg-hover);
  color: var(--field-text);
}

/* Selected */
.calendar__day--selected,
.calendar__cell-lg--selected {
  background-color: var(--primary) !important;
  color: #ffffff !important;
  /* Always white on primary */
  font-weight: 600;
}

/* Today */
.calendar__day--today {
  color: var(--primary);
  font-weight: 600;
  background-color: hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.1);
}

/* Muted (Outside Month) */
.calendar__day--muted {
  color: var(--field-text-disabled);
}

/* Disabled */
.calendar__day:disabled,
.calendar__cell-lg:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  text-decoration: line-through;
  color: var(--field-text-disabled);
}

/* Ranges */
.calendar__day--range-start {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  background-color: var(--primary);
  color: #ffffff;
}

.calendar__day--range-end {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  background-color: var(--primary);
  color: #ffffff;
}

.calendar__day--range-middle {
  background-color: hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.15);
  color: var(--primary);
  border-radius: 0;
}

/* #endregion */
```

### File: packages\fields\src\styles\components\datetime-field.css

```css
/* packages/fields/src/styles/components/datetime-field.css */

.datetime-field__icon-btn {
    color: var(--field-text-placeholder, #9ca3af);
}

.datetime-field__tabs {
    border-bottom: 1px solid var(--border-subtle, #e5e7eb);
}

.datetime-field__tab {
    color: var(--text-secondary, #4b5563);
    transition: all var(--field-transition, 150ms ease);
}

.datetime-field__tab:hover {
    background-color: var(--bg-surface-subtle, #f9fafb);
    color: var(--text-primary, #111827);
}

.datetime-field__tab--active {
    color: var(--primary, #3b82f6);
    border-bottom-color: var(--primary, #3b82f6);
}

.datetime-field__tab-val {
    background-color: var(--bg-surface-active, #f3f4f6);
    border-radius: var(--border-radius__xsmall, 4px);
    color: var(--text-primary, #111827);
}
```

### File: packages\fields\src\styles\components\help-tooltip.css

```css
/* packages/fields/src/styles/components/help-tooltip.css */

.help-tooltip {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: help;
    color: var(--text-tertiary, #9ca3af);
    margin-left: 0.25rem;
    vertical-align: middle;
    line-height: 0;
}

a.help-tooltip {
    cursor: pointer;
}

a.help-tooltip:hover .help-tooltip__icon {
    color: var(--primary, #3b82f6);
}

.help-tooltip__icon {
    display: flex;
    transition: color var(--field-transition, 150ms ease);
}

.help-tooltip__popup {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-8px);

    /* Tooltips usually remain dark even in light mode for contrast */
    background-color: var(--gray-900, #111827);
    color: var(--gray-0, #ffffff);

    padding: 0.5rem 0.75rem;
    border-radius: var(--border-radius__small, 4px);
    font-size: 0.75rem;
    line-height: 1.4;
    font-weight: 400;
    white-space: normal;
    width: max-content;
    max-width: 200px;
    text-align: center;

    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity var(--field-transition, 150ms ease), transform var(--field-transition, 150ms ease);
    z-index: 100;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.help-tooltip:hover .help-tooltip__popup {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(-4px);
}

.help-tooltip__arrow {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 4px;
    border-style: solid;
    border-color: var(--gray-900, #111827) transparent transparent transparent;
}
```

### File: packages\fields\src\styles\components\time-clock.css

```css
/* #region 1. HEADER */
.time-clock__header {
    background-color: var(--primary);
    color: #ffffff;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: var(--field-radius) var(--field-radius) 0 0;
}

.time-clock__digital {
    display: flex;
    align-items: baseline;
    font-size: 2rem;
    font-weight: 500;
}

.time-clock__val {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    padding: 0 0.2rem;
    transition: color var(--fast) ease;
}

.time-clock__val--active {
    color: #ffffff;
}

.time-clock__sep {
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0.1rem;
}

.time-clock__ampm {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.time-clock__meridiem {
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: var(--border-radius__xsmall);
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.75rem;
    padding: 0.1rem 0.3rem;
    cursor: pointer;
    transition: all var(--fast) ease;
}

.time-clock__meridiem--active {
    background: #ffffff;
    color: var(--primary);
    font-weight: bold;
    border-color: #ffffff;
}

/* #endregion */


/* #region 2. CLOCK FACE */
.time-clock__body {
    padding: 1.5rem;
    display: flex;
    justify-content: center;
    background-color: var(--field-bg);
    border: 1px solid var(--field-border);
    border-top: none;
    border-radius: 0 0 var(--field-radius) var(--field-radius);
}

.clock__face {
    width: 230px;
    height: 230px;
    background: var(--field-bg-hover);
    /* Light gray usually */
    border-radius: 50%;
    position: relative;
    touch-action: none;
}

.clock__number {
    position: absolute;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 0.875rem;
    color: var(--field-text);
    cursor: pointer;
    transform: translate(-50%, -50%);
    transition: background-color var(--fast) ease, color var(--fast) ease;
}

.clock__number--active {
    background-color: var(--primary);
    color: #ffffff;
}

.clock__hand {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 2px;
    background-color: var(--primary);
    transform-origin: bottom center;
    pointer-events: none;
}

.clock__hand-center {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    background-color: var(--primary);
    border-radius: 50%;
    transform: translate(-50%, -50%);
}

.clock__hand-knob {
    position: absolute;
    top: 0;
    left: 50%;
    width: 32px;
    height: 32px;
    background-color: var(--primary);
    /* Usually darker for knob, but primary works */
    border-radius: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.2;
    /* Subtle Highlight around selected number */
}

/* #endregion */
```

### File: packages\fields\src\styles\fields\combobox-field.css

```css
/* #region ComboboxField Tokens */
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
  background-color: var(--field-bg, #ffffff);
  border: 1px solid var(--field-border, #d1d5db);
  border-radius: var(--field-radius, 8px);
  transition: all var(--field-transition, 150ms ease);
  min-height: var(--field-height, 2.5rem);
  cursor: text;
}

.field-combobox__menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: var(--bg-overlay, #ffffff);
  border: 1px solid var(--field-border, #d1d5db);
  border-radius: var(--field-radius, 8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 250px;
  overflow-y: auto;
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
  transition: all var(--field-transition, 150ms ease);
}

.field-combobox__menu--open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.field-combobox__option {
  padding: 8px var(--field-padding-x, 0.75rem);
  cursor: pointer;
  color: var(--field-text, #111827);
  transition: background-color var(--fast, 100ms);
}

.field-combobox__option:hover {
  background-color: var(--field-bg-hover, rgba(0, 0, 0, 0.05));
}

.field-combobox__option--selected {
  background-color: var(--primary-surface, rgba(186, 57%, 36%, 0.12));
  color: var(--text-brand, #1d4ed8);
  font-weight: 500;
}

/* #endregion */
```

### File: packages\fields\src\styles\fields\date-field.css

```css
/* #region DateField & TimeField Tokens */
/**
 * @file date-field.css
 * @description Styles for Date and Time inputs using semantic theme tokens.
 */

.field-date {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.field-date__container {
  display: flex;
  align-items: center;
  position: relative;
  background-color: var(--field-bg, #ffffff);
  border: 1px solid var(--field-border, #d1d5db);
  border-radius: var(--field-radius, 8px);
  transition: all var(--field-transition, 150ms ease);
  min-height: var(--field-height, 2.5rem);
  cursor: text;
}

.field-date__container:hover {
  background-color: var(--field-bg-hover, rgba(0, 0, 0, 0.05));
  border-color: var(--field-border-hover, #6b7280);
}

.field-date__container--focused {
  border-color: var(--field-border-focus, #3b82f6);
  background-color: var(--field-bg-active, #ffffff);
}

.field-date__container--error {
  border-color: var(--field-border-error, #ef4444);
}

.field-date__container--disabled {
  background-color: var(--field-bg-disabled, #f3f4f6);
  border-color: var(--field-border-disabled, #d1d5db);
  cursor: not-allowed;
  opacity: 0.8;
}

.field-date__input {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  padding: 0 var(--field-padding-x, 0.75rem);
  font-family: inherit;
  font-size: var(--field-font-size, 14px);
  color: var(--field-text, #111827);
  outline: none;
}

/* Calendar Popover */
.field-date__popover {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  background-color: var(--bg-overlay, #ffffff);
  border: 1px solid var(--field-border, #d1d5db);
  border-radius: var(--field-radius, 8px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
  padding: 16px;
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
  transition: all var(--field-transition, 150ms ease);
}

.field-date__popover--open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.field-date__day {
  padding: 4px;
  cursor: pointer;
  border-radius: var(--border-radius__small, 0.375rem);
  transition: background-color var(--fast, 100ms);
}

.field-date__day:hover {
  background-color: var(--field-bg-hover, rgba(0, 0, 0, 0.05));
}

.field-date__day--selected {
  background-color: var(--bg-brand-solid, #3b82f6);
  color: var(--text-on-brand, #ffffff);
}

/* #endregion */
```

### File: packages\fields\src\styles\fields\file-drop.css

```css
/* #region 1. Container & Layout */
.field-file {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  gap: 0.75rem;
  /* Gap between label, dropzone, and list */
}

.file-drop__container {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 140px;
  background-color: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
  transition: all var(--field-transition);
  overflow: hidden;
}

/* Error State */
.file-drop__container--error {
  border-color: var(--field-border-error);
  background-color: hsla(var(--danger-hue), var(--danger-saturation), var(--danger-lightness), 0.05);
}

/* Disabled State */
.file-drop__container--disabled {
  opacity: 0.6;
  pointer-events: none;
  background-color: var(--field-bg-disabled);
}

/* #endregion */


/* #region 2. The Split Actions (Left/Right) */
.file-drop__split-action {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 1rem;
  transition: background-color var(--fast) ease;
  color: var(--field-text-secondary);
  gap: 0.75rem;
}

.file-drop__split-action:hover {
  background-color: var(--field-bg-hover);
  color: var(--primary);
}

.file-drop__split-action:active {
  background-color: var(--field-bg-disabled);
}

/* The vertical divider line */
.file-drop__divider {
  width: 1px;
  background-color: var(--field-border);
  margin: 1rem 0;
}

/* Typography for inner content */
.file-drop__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: inherit;
}

.file-drop__sub {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-align: center;
}

/* #endregion */


/* #region 3. The "Glow" Drop Overlay */
.file-drop__overlay {
  position: absolute;
  inset: 0;
  background-color: hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.05);
  border: 2px dashed var(--primary);
  border-radius: var(--field-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  pointer-events: none;
  animation: fadeIn var(--fast) ease-out;
}

.file-drop__overlay-content {
  color: var(--primary);
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* #endregion */


/* #region 4. Simple/Avatar Variant (Not split) */
.file-drop__container--single {
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.file-drop__container--single:hover {
  border-color: var(--primary);
}

/* #endregion */


/* #region 5. File List (List View) */
.file-drop__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.file-drop__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
  position: relative;
  overflow: hidden;
  /* Important for progress bar clipping */
}

.file-drop__item-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
  /* Enables text truncation */
  z-index: 2;
  position: relative;
}

.file-drop__preview-thumb {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  background: var(--field-bg-disabled);
  flex-shrink: 0;
  border: 1px solid var(--field-border);
}

.file-drop__meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.file-drop__filename {
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--field-text);
}

.file-drop__filesize {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.file-drop__remove {
  border: none;
  background: transparent;
  color: var(--field-text-disabled);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--fast);
  z-index: 2;
  position: relative;
}

.file-drop__remove:hover {
  color: var(--field-text-error);
}

/* Progress Bar Background */
.file-drop__progress-bg {
  position: absolute;
  left: 0;
  bottom: 0;
  top: 0;
  background-color: hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.1);
  transition: width 0.3s ease;
  z-index: 1;
}

/* Spinner Animation */
.file-drop__spinner {
  animation: spin 1s linear infinite;
  color: var(--primary);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* #endregion */


/* #region 6. Single Preview (Thumbnail/Banner Mode) */
.file-drop__single-preview {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--field-bg-disabled);
  border-radius: var(--field-radius) var(--field-radius) 0 0;
}

/* Ensure the container doesn't have padding when showing preview */
.file-drop__container:has(.file-drop__single-preview) {
  padding: 0;
  border: 1px solid var(--field-border);
}

.file-drop__single-img {
  width: 100%;
  height: 100%;
  min-height: 140px;
  object-fit: cover;
  display: block;
}

/* --- Remove Position: Overlay (Avatars) --- */
.file-drop__single-preview--overlay {
  border-radius: var(--field-radius);
}

.file-drop__change-btn {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  opacity: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: opacity var(--fast) ease;
  border: none;
  cursor: pointer;
  font-weight: 500;
  backdrop-filter: blur(2px);
}

.file-drop__single-preview--overlay:hover .file-drop__change-btn {
  opacity: 1;
}

/* --- Remove Position: Below (Banners) --- */
.file-drop__remove-bar {
  width: 100%;
  padding: 0.75rem;
  background: var(--field-bg);
  border-top: 1px solid var(--field-border);
  color: var(--field-text-error);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color var(--fast);
}

.file-drop__remove-bar:hover {
  background-color: hsla(var(--danger-hue), var(--danger-saturation), var(--danger-lightness), 0.05);
}

/* #endregion */
```

### File: packages\fields\src\styles\fields\rich-text-field.css

```css
/* #region 1. BLOCK: field-rich-text */
/**
 * @file rich-text-field.css
 * @description Styles for the Quill-based rich text editor using semantic HSL tokens.
 */
.field-rich-text {
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
}

.field-rich-text__container {
    border: 1px solid var(--field-border);
    border-radius: var(--field-radius);
    background-color: var(--field-bg);
    transition: border-color var(--fast);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

/* Framed Variant (Default) */
.field-rich-text--framed .field-rich-text__container:hover {
    border-color: var(--field-border-hover);
}

.field-rich-text--framed .field-rich-text__container:focus-within {
    border-color: var(--field-border-focus);
}

/* States */
.field-rich-text__container--error {
    border-color: var(--field-border-error) !important;
}

.field-rich-text__container--warning {
    border-color: var(--warning) !important;
}

/* #endregion */

/* #region 2. ELEMENT: field-rich-text--inline */
.field-rich-text--inline .field-rich-text__container {
    border: none;
    background-color: transparent;
    border-radius: 0;
}

.field-rich-text--inline .ql-toolbar.ql-snow {
    border: none;
    background-color: transparent;
    padding: 0;
    padding-bottom: 8px;
    opacity: 0.6;
    transition: opacity var(--fast);
}

.field-rich-text--inline:focus-within .ql-toolbar.ql-snow,
.field-rich-text--inline:hover .ql-toolbar.ql-snow {
    opacity: 1;
}

.field-rich-text--inline .ql-container.ql-snow {
    border: none;
}

.field-rich-text--inline .ql-editor {
    padding: 0;
    min-height: 0;
}

/* #endregion */

/* #region 3. QUILL OVERRIDES: Toolbar & Container */
.ql-toolbar.ql-snow {
    border: none;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--input-bg);
    font-family: inherit;
    padding: 8px;
    z-index: 2;
}

.ql-container.ql-snow {
    border: none;
    font-family: inherit;
    font-size: var(--field-font-size);
    color: var(--field-text);
}

.ql-editor {
    min-height: 100px;
    padding: 16px;
    line-height: 1.6;
    overflow-y: auto;
}

.ql-editor.ql-blank::before {
    color: var(--field-text-placeholder);
    font-style: normal;
    left: 16px;
}

.field-rich-text--inline .ql-editor.ql-blank::before {
    left: 0;
}

/* #endregion */

/* #region 4. QUILL OVERRIDES: Status & ReadOnly */
.field-rich-text__count {
    align-self: flex-end;
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 4px;
    font-variant-numeric: tabular-nums;
}

.field-rich-text__count--limit {
    color: var(--field-text-error);
    font-weight: 500;
}

.field-rich-text--readonly .ql-toolbar {
    display: none;
    border-bottom: none;
}

.field-rich-text--readonly .field-rich-text__container {
    background-color: var(--field-bg-disabled);
}

.field-rich-text--readonly .ql-container.ql-snow {
    color: var(--field-text-disabled);
    opacity: 0.8;
}

.field-rich-text--readonly .ql-editor {
    padding: 12px;
}

.field-rich-text--inline.field-rich-text--readonly .field-rich-text__container {
    background-color: transparent;
    border: none;
}

.field-rich-text--inline.field-rich-text--readonly .ql-editor {
    padding: 0;
}

/* #endregion */

/* #region 5. QUILL OVERRIDES: Icons & Pickers */
.ql-snow .ql-stroke {
    stroke: var(--text-muted);
}

.ql-snow .ql-fill {
    fill: var(--text-muted);
}

.ql-snow .ql-picker {
    color: var(--text-muted);
}

.ql-snow .ql-picker:hover,
.ql-snow .ql-picker.ql-expanded {
    color: var(--text-main);
}

.ql-snow .ql-picker-options {
    background-color: var(--card);
    border-color: var(--field-border);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ql-snow .ql-picker-item:hover {
    color: var(--primary);
}

.ql-snow .ql-active .ql-stroke {
    stroke: var(--primary);
}

.ql-snow .ql-active .ql-fill {
    fill: var(--primary);
}

.ql-toolbar.ql-snow button {
    margin-right: 4px;
}

/* #endregion */
```

### File: packages\fields\src\styles\fields\select-field.css

```css
/* #region 1. BLOCK: field-select */
/**
 * @file select-field.css
 * @description Refactored Select component using strict semantic tokens.
 */
.field-select {
	display: flex;
	flex-direction: column;
	position: relative;
	width: 100%;
}

/* #endregion */

/* #region 2. ELEMENT: field-select__container */
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
	/* Room for arrow */
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

/* #endregion */

/* #region 3. ELEMENT: field-select__content & input */
.field-select__content {
	flex: 1;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 4px;
	padding: 0 var(--field-padding-x);
	min-height: var(--field-height);
}

.field-select__input {
	border: none;
	background: transparent;
	font-family: inherit;
	font-size: var(--field-font-size);
	color: var(--field-text);
	outline: none;
	padding: 0;
	margin: 0;
	min-width: 60px;
	flex: 1;
}

/* #endregion */

/* #region 4. ELEMENT: field-select__chip */
.field-select__chip {
	display: flex;
	align-items: center;
	background-color: var(--primary-surface);
	border-radius: var(--border-radius__small);
	padding: 2px 6px;
	font-size: 0.85em;
	gap: 4px;
	color: var(--text-main);
}

.field-select__chip-remove {
	cursor: pointer;
	opacity: 0.5;
	display: flex;
	align-items: center;
	transition: opacity var(--fast);
}

.field-select__chip-remove:hover {
	opacity: 1;
	color: var(--danger);
}

/* #endregion */

/* #region 5. BLOCK: field-select__menu & options */
.field-select__menu {
	position: absolute;
	top: calc(100% + 4px);
	left: 0;
	right: 0;
	background-color: var(--card);
	border: 1px solid var(--field-border);
	border-radius: var(--field-radius);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	z-index: 50;
	max-height: 250px;
	overflow-y: auto;
	opacity: 0;
	transform: translateY(-5px);
	pointer-events: none;
	transition: all var(--fast);
	display: flex;
	flex-direction: column;
}

.field-select__menu--open {
	opacity: 1;
	transform: translateY(0);
	pointer-events: auto;
}

.field-select__option {
	padding: 8px 12px;
	cursor: pointer;
	color: var(--text-main);
	display: flex;
	align-items: center;
	transition: background-color var(--fast);
}

.field-select__option:hover,
.field-select__option--highlighted {
	background-color: var(--field-bg-hover);
}

.field-select__option--selected {
	background-color: var(--primary-surface);
	color: var(--text-brand);
	font-weight: 500;
}

.field-select__option--group {
	font-weight: 600;
	color: var(--text-muted);
	background-color: var(--bg-surface-subtle);
}

.field-select__action-bar {
	padding: 8px 12px;
	border-bottom: 1px solid var(--field-border);
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 8px;
	color: var(--primary);
	font-weight: 500;
	font-size: 0.9em;
	transition: background-color var(--fast);
}

.field-select__action-bar:hover {
	background-color: var(--input-bg);
}

.field-select__arrow {
	transition: transform 150ms;
}

.field-select__container--open {
	.field-select__arrow {
		transform: rotate(180deg);
	}
}
/* #endregion */

```

### File: packages\fields\src\styles\fields\slider-field.css

```css
/* #region SLIDER FIELD */
.field-slider {
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  gap: 4px;
}

.field-slider__control {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  min-height: var(--field-height, 2.5rem);
}

.field-slider__container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  touch-action: none;
}

.field-slider__track {
  position: relative;
  width: 100%;
  height: 6px;
  background-color: var(--field-bg-disabled, var(--border-color));
  border-radius: var(--border-radius__xsmall, 4px);
}

.field-slider__fill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  height: 100%;
  background-color: var(--primary);
  border-radius: inherit;
  pointer-events: none;
}

/* #region MARKS */
.field-slider__marks {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.field-slider__mark {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Centers the mark exactly over its percentage coordinate */
  transform: translate(-50%, -50%);
  z-index: 1;
}

.field-slider__mark-tick {
  width: 2px;
  height: 8px;
  background-color: var(--text-muted);
  border-radius: 1px;
}

.field-slider__mark-label {
  position: absolute;
  top: 100%;
  /* Pushes label below the tick */
  margin-top: 6px;
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
}

/* #endregion */

/* #region THUMB */
.field-slider__thumb {
  position: absolute;
  top: 50%;
  width: 18px;
  height: 18px;
  background-color: var(--card, #ffffff);
  border: 2px solid var(--primary);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  transition: box-shadow var(--fast, 100ms);
  z-index: 2;
  outline: none;
}

.field-slider__thumb:focus-visible {
  box-shadow: var(--focus-ring);
}

.field-slider__thumb--active,
.field-slider__thumb:active {
  cursor: grabbing;
  box-shadow: 0 0 0 6px var(--field-ring-color, hsla(186, 57%, 36%, 0.15));
}

/* #endregion */
/* #endregion */
```

### File: packages\fields\src\styles\fields\tag-input.css

```css
/* packages/fields/src/styles/fields/tag-input.css */

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
  background-color: var(--field-bg, #ffffff);
  border: 1px solid var(--field-border, #d1d5db);
  border-radius: var(--field-radius, 8px);
  transition: all var(--field-transition, 150ms ease);
  min-height: var(--field-height, 2.5rem);
  padding: 4px var(--field-padding-x, 0.75rem);
  cursor: text;
}

.field-tag__container:hover {
  background-color: var(--field-bg-hover, rgba(0, 0, 0, 0.05));
  border-color: var(--field-border-hover, #6b7280);
}

.field-tag__container--focused {
  border-color: var(--field-border-focus, #3b82f6);
  background-color: var(--field-bg-active, #ffffff);
}

.field-tag__container--error {
  border-color: var(--field-border-error, #ef4444);
}

.field-tag__container--disabled {
  background-color: var(--field-bg-disabled, #f3f4f6);
  border-color: var(--field-border-disabled, #d1d5db);
}

/* Tag Chips */
.field-tag__chip {
  display: flex;
  align-items: center;
  gap: 6px;
  /* Balanced default state using colour.css semantics */
  background-color: var(--primary-surface);
  color: var(--text-blue);
  border: 1px solid var(--primary-half);
  border-radius: var(--border-radius__xlarge, 16px);
  padding: 2px 8px;
  font-size: 0.875em;
  transition: all var(--fast, 150ms ease);
}

.field-tag__chip-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity var(--fast, 150ms ease), color var(--fast, 150ms ease);
}

.field-tag__chip-remove:hover {
  opacity: 1;
  color: var(--danger);
}

.field-tag__input {
  color: var(--field-text, #111827);
  flex: 1;
  min-width: 60px;
  border: none;
  background: transparent;
  outline: none;
  font-family: inherit;
  font-size: var(--field-font-size, 14px);
}

.field-tag__input::placeholder {
  color: var(--field-text-placeholder, #6b7280);
}
```

### File: packages\fields\src\styles\fields\text-field.css

```css
/* packages/fields/src/styles/fields/text-field.css */

.field-text {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.field-text__container {
  display: flex;
  align-items: center;
  position: relative;
  background-color: var(--field-bg, #ffffff);
  border: 1px solid var(--field-border, #d1d5db);
  border-radius: var(--field-radius, 8px);
  transition: all var(--field-transition, 150ms ease);
  min-height: var(--field-height, 2.5rem);
  cursor: text;
}

.field-text__container:hover {
  background-color: var(--field-bg-hover, rgba(0, 0, 0, 0.05));
  border-color: var(--field-border-hover, #6b7280);
}

.field-text__container--focused {
  border-color: var(--field-border-focus, #3b82f6);
  background-color: var(--field-bg-active, #ffffff);
}

.field-text__container--error {
  border-color: var(--field-border-error, #ef4444);
}

.field-text__container--disabled {
  background-color: var(--field-bg-disabled, #f3f4f6);
  border-color: var(--field-border-disabled, #d1d5db);
  cursor: not-allowed;
  opacity: 0.8;
}

.field-text__input {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  padding: 0 var(--field-padding-x, 0.75rem);
  font-family: inherit;
  font-size: var(--field-font-size, 14px);
  color: var(--field-text, #111827);
  outline: none;
  min-width: 0;
}

.field-text__input::placeholder {
  color: var(--field-text-placeholder, #6b7280);
}

textarea.field-text__input {
  padding-top: 8px;
  padding-bottom: 8px;
  min-height: var(--field-height, 2.5rem);
  line-height: 1.5;
}

.field-text__count {
  align-self: flex-end;
  font-size: 0.75rem;
  color: var(--field-text-placeholder, #6b7280);
  margin-top: 4px;
}

.field-text__count--limit {
  color: var(--field-text-error, #ef4444);
}
```

### File: packages\fields\src\styles\wrappers\adornment-wrapper.css

```css
/* packages/fields/src/styles/wrappers/adornment-wrapper.css */

.field-adornment {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--field-text-placeholder, #9ca3af);
  min-width: var(--field-icon-size, 20px);
}

.field-adornment--prefix {
  margin-right: var(--field-gap, 8px);
}

.field-adornment--suffix {
  margin-left: var(--field-gap, 8px);
}

.field-adornment--interactive {
  cursor: pointer;
  pointer-events: auto;
  transition: color var(--field-transition, 150ms ease);
}

.field-adornment--interactive:hover {
  color: var(--field-text, #111827);
}
```

### File: packages\fields\src\styles\wrappers\effect-wrapper.css

```css
/* packages/fields/src/styles/wrappers/effect-wrapper.css */

/* --- Effect Wrapper (Ripple & Focus Ring) --- */
.field-focus-ring {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	border-radius: var(--field-radius, 8px);
	/* cite: 1 */
	pointer-events: none;
	box-shadow: 0 0 0 0 transparent;
	transition: box-shadow var(--field-transition, 150ms ease);
	/* cite: 1 */
}

.field-focus-ring--active {
	/* Uses mapped focus ring color and width from the design system */
	box-shadow: 0 0 0 var(--field-ring-width, 3px) var(--field-ring-color, rgba(59, 130, 246, 0.12));
	/* cite: 1 */
}

.field-ripple {
	position: absolute;
	border-radius: 50%;
	transform: scale(0);
	animation: ripple 600ms linear;
	background-color: var(--field-ripple-color, rgba(0, 0, 0, 0.1));
	/* cite: 1 */
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
/* packages/fields/src/styles/wrappers/field-array-wrapper.css */

/* --- Field Array Wrapper --- */
.field-array {
  display: flex;
  flex-direction: column;
  gap: var(--field-gap, 8px);
  /* cite: 1 */
}

.field-array__item {
  display: flex;
  align-items: flex-start;
  gap: var(--field-gap, 8px);
  /* cite: 1 */
}

.field-array__action {
  margin-top: 4px;
  /* Manual alignment offset for standard field height cite: 1 */
}
```

### File: packages\fields\src\styles\wrappers\label-wrapper.css

```css
/* #region 1. BLOCK: field-label */
.field-label {
    display: flex;
    align-items: center;
    font-family: inherit;
    font-size: var(--field-font-size, 14px);
    color: var(--field-text-label, #4b5563);
    margin-bottom: 4px;
    transition: all var(--field-transition, 150ms ease);
    pointer-events: none;
    line-height: 1.5;
}

/* #endregion */

/* #region 2. MODIFIER: field-label--floating */
.field-label--floating {
    position: absolute;
    z-index: 10;
    left: var(--field-padding-x, 12px);
    top: 50%;
    transform: translateY(-50%);
    background-color: transparent;
    padding: 0 4px;
    margin-bottom: 0;
}

/**
 * FIX: Active state background-color masks the field border.
 * Added z-index to ensure it sits above the EffectWrapper.
 */
.field-label--active {
    top: 0 !important;
    transform: translateY(-50%) scale(0.85) !important;
    left: calc(var(--field-padding-x, 12px) - 2px);
    color: var(--field-border-focus, #3b82f6);
    background-color: var(--field-bg, #ffffff);
    font-weight: 600;
    z-index: 20;
}

.field-label--error {
    color: var(--field-text-error, #ef4444);
}

.field-label--disabled {
    color: var(--field-text-disabled, #9ca3af);
}

.field-label__required {
    color: var(--danger, #ef4444);
    margin-left: 2px;
}

/* #endregion */
```

### File: packages\fields\src\styles\wrappers\message-wrapper.css

```css
/* packages/fields/src/styles/wrappers/message-wrapper.css */

.field-message {
  font-family: inherit;
  font-size: 0.75rem;
  line-height: 1.2;
  margin-top: 4px;
  transition: all var(--field-transition, 150ms ease);
  opacity: 1;
}

.field-message--error {
  color: var(--field-text-error, #ef4444);
}

.field-message--warning {
  color: var(--warning, #f59e0b);
}

.field-message--info {
  color: var(--field-text-placeholder, #9ca3af);
}
```

### File: packages\fields\src\styles\wrappers\skeleton-wrapper.css

```css
/* packages/fields/src/styles/wrappers/skeleton-wrapper.css */

.field-skeleton {
  background-color: var(--field-bg-disabled, #f3f4f6);
  border-radius: var(--field-radius, 8px);
  overflow: hidden;
  position: relative;
}

.field-skeleton--rect {
  height: var(--field-height, 2.5rem);
  width: 100%;
}

.field-skeleton--circle {
  width: var(--field-height, 2.5rem);
  height: var(--field-height, 2.5rem);
  border-radius: 50%;
}

.field-skeleton--pill {
  height: 24px;
  width: 60px;
  border-radius: var(--border-radius__xlarge, 16px);
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
import { ComponentChildren } from 'preact';
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';
import { DateTime } from '@projective/types';

export type DateSelectionMode = 'single' | 'multiple' | 'range';
export type DateFieldVariant = 'popup' | 'inline' | 'input';

// The value type changes based on mode
export type SingleDateValue = DateTime | null;
export type MultipleDateValue = DateTime[];
export type RangeDateValue = [DateTime | null, DateTime | null];

export type DateValue = SingleDateValue | MultipleDateValue | RangeDateValue;

/**
 * Modifiers allow external logic to style specific dates.
 * e.g. { disabled: (d) => d.isWeekend(), highlighted: (d) => d.day === 1 }
 */
export type DateModifiers = {
	disabled?: (date: DateTime) => boolean;
	highlighted?: (date: DateTime) => boolean;
	hidden?: (date: DateTime) => boolean;
	[key: string]: ((date: DateTime) => boolean) | undefined;
};

export interface DateFieldProps extends
	// We override ValueFieldProps because 'value' is dynamic here
	Omit<ValueFieldProps<any>, 'value' | 'onChange'>,
	AdornmentProps,
	Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
	Omit<MessageWrapperProps, 'error' | 'hint'> {
	value?: DateValue;
	onChange?: (value: any) => void; // Typed loosely here, narrowed in component

	/**
	 * How the component behaves.
	 * - popup: Standard input with dropdown (Default)
	 * - inline: Calendar rendered directly in page
	 * - input: Text input only (validation only)
	 */
	variant?: DateFieldVariant;

	/**
	 * Selection logic.
	 * - single: One date
	 * - multiple: Array of dates
	 * - range: [Start, End]
	 */
	selectionMode?: DateSelectionMode;

	/**
	 * External logic to style/disable dates.
	 * Use this for "Every Monday" or "Blocked Dates" logic.
	 */
	modifiers?: DateModifiers;

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
// deno-lint-ignore-file no-explicit-any
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
	onInput?: (e: any) => void;
	onBlur?: (e: any) => void;
	onFocus?: (e: any) => void;
}

```

### File: packages\fields\src\types\components\rich-text-field.ts

```ts
import { JSX } from 'preact';
import { Signal } from '@preact/signals';
import { ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

export type RichTextFormat = 'delta' | 'html' | 'markdown';
export type RichTextVariant = 'framed' | 'inline';

export interface RichTextFieldProps
	extends
		ValueFieldProps<string>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	outputFormat?: RichTextFormat;

	toolbar?: 'basic' | 'full' | any[];
	variant?: RichTextVariant;
	secureLinks?: boolean;

	onImageUpload?: (file: File) => Promise<string>;

	placeholder?: string;
	readOnly?: boolean;

	/** Minimum height of the editor area (e.g. "150px") */
	minHeight?: string | number;

	/** Maximum height before scrolling occurs (e.g. "300px") */
	maxHeight?: string | number;

	/** Soft limit for character count. Shows red counter if exceeded. */
	maxLength?: number;

	/** Whether to show the character counter */
	showCount?: boolean;
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
	/**
	 * Nested options for groups.
	 */
	options?: SelectOption<T>[];
	/**
	 * Legacy flat grouping (deprecated in favor of options nesting)
	 */
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
	value?: T | T[] | any;
	onChange?: (value: T | T[]) => void;

	options: SelectOption<T>[];
	multiple?: boolean;
	searchable?: boolean;
	clearable?: boolean;
	loading?: boolean;

	// Multi-select config
	displayMode?: SelectDisplayMode;
	enableSelectAll?: boolean;

	/**
	 * Defines behavior when a group option is clicked.
	 * - 'value': Selects the group's own value (treated as a selectable item).
	 * - 'members': Selects/Deselects all descendant leaf options (only valid if multiple=true).
	 * @default 'value'
	 */
	groupSelectMode?: 'value' | 'members';

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
	className?: string; // ADDED: Allows custom CSS targeting per mark type
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
	tagColor?: string | ((tag: string) => string);
	tagVariant?: 'solid' | 'transparent';
}

```

### File: packages\fields\src\types\components\text-field.ts

```ts
// deno-lint-ignore-file no-explicit-any
import { HTMLAttributes } from 'preact';
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

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
	min?: number | string;
	max?: number | string;
	minLength?: number;
	maxLength?: number;
	showCount?: boolean;
	prefixProps?: HTMLAttributes<HTMLDivElement>;
	suffixProps?: HTMLAttributes<HTMLDivElement>;
	onInput?: (e: any) => void;
	onBlur?: (e: any) => void;
	onFocus?: (e: any) => void;
}

```

### File: packages\fields\src\types\components\time-field.ts

```ts
import { DateTime } from '@projective/types';
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

export type TimeSelectionMode = 'single' | 'multiple';
export type TimeValue = DateTime | DateTime[];

/**
 * TimeField specific props.
 */
export interface TimeFieldProps extends
	// Override generic ValueFieldProps to support arrays
	Omit<ValueFieldProps<any>, 'value' | 'onChange'>,
	AdornmentProps,
	Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
	Omit<MessageWrapperProps, 'error' | 'hint'> {
	value?: TimeValue;
	onChange?: (value: TimeValue) => void;

	/**
	 * Visual variant
	 * @default 'popup'
	 */
	variant?: 'popup' | 'inline' | 'input';

	/**
	 * Selection mode
	 * @default 'single'
	 */
	selectionMode?: TimeSelectionMode;
}

```

### File: packages\fields\src\types\core.ts

```ts
import { Signal } from '@preact/signals';
import { CSSProperties, JSX } from 'preact';

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
	nextField?: string | HTMLElement;
	onKeyDown?: (e: KeyboardEvent) => void;
}

export type FieldVariant = 'outlined' | 'filled' | 'standard';
export type FieldDensity = 'compact' | 'normal' | 'comfortable';

export type ValidationStatus =
	| 'success'
	| 'warning'
	| 'error'
	| 'info'
	| 'neutral';

export interface ValueFieldProps<T> extends BaseFieldProps {
	value?: T | Signal<T>;
	defaultValue?: T;
	onChange?: (value: T) => void;
	error?: string | Signal<string | undefined>;
	hint?: string;
}

export interface AdornmentProps {
	prefix?: JSX.Element | string;
	suffix?: JSX.Element | string;
	onPrefixClick?: (e: MouseEvent) => void;
	onSuffixClick?: (e: MouseEvent) => void;
}

```

### File: packages\fields\src\types\file.ts

```ts
import { FileWithMeta } from '@projective/types';
import { ValueFieldProps } from './core.ts';
import { LabelWrapperProps, MessageWrapperProps } from './wrappers.ts';
import { Signal } from '@preact/signals';

export type FileStatus = 'pending' | 'processing' | 'ready' | 'error';

export interface FileError {
	code: string;
	message: string;
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
	value?: Signal<FileWithMeta[]>;
	onChange?: (files: FileWithMeta[]) => void;
	variant?: 'split' | 'single';
	onLibraryClick?: () => void;
	listPosition?: 'top' | 'bottom' | 'none';
	actionPosition?: 'below' | 'overlay';
}

```

### File: packages\fields\src\types\wrappers.ts

```ts
import { Signal } from '@preact/signals';
import { JSX } from 'preact';

export type HelpPosition = 'inline' | 'top-right' | 'bottom-right' | 'bottom-left';

/**
 * Props for the LabelWrapper component.
 */
export interface LabelWrapperProps {
	id?: string;
	label?: string;
	required?: boolean;
	floating?: boolean;

	/**
	 * Tooltip text to display.
	 */
	help?: string | JSX.Element;

	/**
	 * Optional URL to navigate to when the help icon is clicked.
	 */
	helpLink?: string;

	/**
	 * Position of the help icon.
	 * - 'inline': Next to the label text (moves with label).
	 * - 'top-right': Fixed to the top-right of the component.
	 * - 'bottom-right': Fixed to the bottom-right.
	 * - 'bottom-left': Fixed to the bottom-left.
	 * @default 'inline'
	 */
	helpPosition?: HelpPosition;

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

export interface AdornmentWrapperProps extends JSX.HTMLAttributes<HTMLDivElement> {
	children?: JSX.Element | string;
	position: 'prefix' | 'suffix';
}

export function AdornmentWrapper(props: AdornmentWrapperProps) {
	const { children, position, className, onClick, ...rest } = props;

	if (!children) return null;

	const classes = [
		'field-adornment',
		`field-adornment--${position}`,
		(onClick || rest.onPointerDown) && 'field-adornment--interactive',
		className,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={classes} onClick={onClick} {...rest}>
			{children}
		</div>
	);
}

```

### File: packages\fields\src\wrappers\EffectWrapper.tsx

```tsx
import { JSX } from 'preact';
import { Signal } from '@preact/signals';
import { useRipple } from '@projective/ui';
import '../styles/wrappers/effect-wrapper.css';

interface EffectWrapperProps {
	focused?: boolean | Signal<boolean>;
	disabled?: boolean | Signal<boolean>;
	children?: JSX.Element | JSX.Element[];
}

export function EffectWrapper(props: EffectWrapperProps) {
	const isFocused = props.focused instanceof Signal ? props.focused.value : props.focused;
	const isDisabled = props.disabled instanceof Signal ? props.disabled.value : props.disabled;

	const { ripples } = useRipple();

	if (isDisabled) return null;
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

