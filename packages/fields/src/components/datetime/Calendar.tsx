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
