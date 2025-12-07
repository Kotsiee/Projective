import '../../styles/components/calendar.css';
import { useComputed, useSignal } from '@preact/signals';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';
import { DateTime } from '@projective/types';
import {
	DateModifiers,
	DateSelectionMode,
	DateValue,
	RangeDateValue,
} from '../../types/components/date-field.ts';
import { getCalendarGrid, getWeekdayLabels } from '../../../../utils/date-math.ts';

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

	// --- State ---
	const getInitialView = () => {
		if (Array.isArray(value)) {
			// Range or Multiple
			const first = value[0];
			return first ? first : new DateTime();
		}
		return value || new DateTime();
	};

	const viewDate = useSignal(getInitialView());
	const hoverDate = useSignal<DateTime | null>(null);
	const viewScope = useSignal<'days' | 'months' | 'years'>('days');

	// --- Grid Generation ---
	const rawDays = useComputed(() => {
		const ghostDate = selectionMode === 'range' ? hoverDate.value : null;

		return getCalendarGrid(
			viewDate.value,
			value,
			ghostDate,
			min,
			max,
			startOfWeek,
		);
	});

	const weekLabels = getWeekdayLabels(startOfWeek);

	// --- Modifiers Logic ---
	const getModifierClasses = (date: DateTime) => {
		const classes: string[] = [];
		for (const [key, check] of Object.entries(modifiers)) {
			if (check && check(date)) {
				classes.push(`calendar__day--${key}`);
			}
		}
		return classes;
	};

	const checkDisabled = (date: DateTime, baseDisabled: boolean) => {
		if (baseDisabled) return true;
		if (modifiers.disabled && modifiers.disabled(date)) return true;
		return false;
	};

	// --- Interaction Handlers ---
	const handleDayClick = (date: DateTime) => {
		if (checkDisabled(date, false)) return;

		let newValue: any;

		if (selectionMode === 'single') {
			newValue = date;
		} else if (selectionMode === 'multiple') {
			const current = (value as DateTime[]) || [];
			const exists = current.find((d) => d.isSameDay(date));
			if (exists) {
				newValue = current.filter((d) => !d.isSameDay(date));
			} else {
				newValue = [...current, date];
			}
		} else if (selectionMode === 'range') {
			const current = (value as RangeDateValue) || [null, null];
			const [start, end] = current;

			if (!start || (start && end)) {
				// Reset start
				newValue = [date, null];
			} else {
				// Complete range
				if (date.isBefore(start)) {
					newValue = [date, start];
				} else {
					newValue = [start, date];
				}
			}
		}

		onChange?.(newValue);
	};

	const handleNav = (dir: -1 | 1) => {
		if (viewScope.value === 'days') viewDate.value = viewDate.value.add(dir, 'months');
		else if (viewScope.value === 'months') viewDate.value = viewDate.value.add(dir, 'years');
		else viewDate.value = viewDate.value.add(dir * 10, 'years');
	};

	const handleMonthSelect = (monthIndex: number) => {
		// Update viewDate to the selected month, keeping year same, clamping day if needed
		const current = viewDate.value;
		// JS Date month is 0-indexed
		const d = new Date(current.getTime());
		d.setMonth(monthIndex);
		viewDate.value = new DateTime(d);
		viewScope.value = 'days';
	};

	const handleYearSelect = (year: number) => {
		const d = new Date(viewDate.value.getTime());
		d.setFullYear(year);
		viewDate.value = new DateTime(d);
		viewScope.value = 'months';
	};

	// --- Render ---
	const renderDays = () => (
		<>
			<div className='calendar__weekdays'>
				{weekLabels.map((day) => <span key={day} className='calendar__weekday'>{day}</span>)}
			</div>
			<div className='calendar__grid calendar__grid--days'>
				{rawDays.value.map((dayItem, idx) => {
					const isDisabled = checkDisabled(dayItem.date, dayItem.isDisabled);
					const modClasses = getModifierClasses(dayItem.date);

					// Range Hover Preview Logic
					let isRangeHover = false;
					if (selectionMode === 'range' && hoverDate.value && !isDisabled) {
						const [start, end] = (value as RangeDateValue) || [null, null];
						if (start && !end) {
							if (
								dayItem.date.isAfter(start) && dayItem.date.isBefore(hoverDate.value)
							) isRangeHover = true;
							if (
								dayItem.date.isBefore(start) && dayItem.date.isAfter(hoverDate.value)
							) isRangeHover = true;
							if (dayItem.date.isSameDay(hoverDate.value)) isRangeHover = true;
						}
					}

					const classes = [
						'calendar__day',
						!dayItem.isCurrentMonth ? 'calendar__day--muted' : '',
						dayItem.isToday ? 'calendar__day--today' : '',
						isDisabled ? 'calendar__day--disabled' : '',
						dayItem.isSelected ? 'calendar__day--selected' : '',
						dayItem.isRangeStart ? 'calendar__day--range-start' : '',
						dayItem.isRangeEnd ? 'calendar__day--range-end' : '',
						dayItem.isRangeMiddle ? 'calendar__day--range-middle' : '',
						isRangeHover ? 'calendar__day--range-hover' : '',
						...modClasses,
					].filter(Boolean).join(' ');

					return (
						<button
							key={`${idx}`}
							type='button'
							className={classes}
							disabled={isDisabled}
							onClick={(e) => {
								e.preventDefault();
								handleDayClick(dayItem.date);
							}}
							onMouseEnter={() => hoverDate.value = dayItem.date}
						>
							{dayItem.date.getDate()}
						</button>
					);
				})}
			</div>
		</>
	);

	const renderMonths = () => {
		const months = [
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
		const currentMonth = new DateTime().getMonth(); // 1-12
		const currentYear = new DateTime().getYear();
		const viewYear = viewDate.value.getYear();
		const selectedMonth = viewDate.value.getMonth(); // 1-12

		return (
			<div className='calendar__grid calendar__grid--months'>
				{months.map((m, i) => {
					const monthIndex = i; // 0-11
					const isToday = currentYear === viewYear && currentMonth === (monthIndex + 1);
					const isSelected = selectedMonth === (monthIndex + 1);

					return (
						<button
							key={m}
							type='button'
							className={`calendar__cell-lg ${isToday ? 'calendar__cell-lg--today' : ''} ${
								isSelected ? 'calendar__cell-lg--selected' : ''
							}`}
							onClick={(e) => {
								e.preventDefault();
								handleMonthSelect(monthIndex);
							}}
						>
							{m}
						</button>
					);
				})}
			</div>
		);
	};

	const renderYears = () => {
		const currentViewYear = viewDate.value.getYear();
		const startDecade = Math.floor(currentViewYear / 10) * 10;
		const years = Array.from({ length: 12 }, (_, i) => startDecade - 1 + i);
		const todayYear = new DateTime().getYear();

		return (
			<div className='calendar__grid calendar__grid--years'>
				{years.map((y) => {
					const isToday = y === todayYear;
					const isSelected = y === currentViewYear;
					const isMuted = y < startDecade || y > startDecade + 9;

					return (
						<button
							key={y}
							type='button'
							className={`calendar__cell-lg ${isToday ? 'calendar__cell-lg--today' : ''} ${
								isSelected ? 'calendar__cell-lg--selected' : ''
							} ${isMuted ? 'calendar__cell-lg--muted' : ''}`}
							onClick={(e) => {
								e.preventDefault();
								handleYearSelect(y);
							}}
						>
							{y}
						</button>
					);
				})}
			</div>
		);
	};

	// Header Label Logic
	let headerLabel = '';
	if (viewScope.value === 'days') {
		headerLabel = viewDate.value.toFormat('MMMM yyyy');
	} else if (viewScope.value === 'months') {
		headerLabel = viewDate.value.toFormat('yyyy');
	} else {
		// Years view: show decade range
		const currentViewYear = viewDate.value.getYear();
		const startDecade = Math.floor(currentViewYear / 10) * 10;
		headerLabel = `${startDecade} - ${startDecade + 9}`;
	}

	return (
		<div className={`calendar ${className || ''}`} onMouseLeave={() => hoverDate.value = null}>
			<div className='calendar__header'>
				<button type='button' className='calendar__nav-btn' onClick={() => handleNav(-1)}>
					<IconChevronLeft size={20} />
				</button>
				<button
					type='button'
					className='calendar__title-btn'
					onClick={() => {
						if (viewScope.value === 'days') viewScope.value = 'months';
						else if (viewScope.value === 'months') viewScope.value = 'years';
					}}
				>
					{headerLabel}
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
