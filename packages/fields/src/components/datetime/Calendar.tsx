/* #region Imports */
import '../../styles/components/calendar.css';

import { computed, useSignal } from '@preact/signals'; // Changed useComputed to computed

import { useEffect, useMemo } from 'preact/hooks';

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';

import { DateTime } from '@projective/types';

import {
	DateModifiers,
	DateSelectionMode,
	DateValue,
	RangeDateValue,
} from '../../types/components/date-field.ts';

import { getCalendarGrid, getWeekdayLabels } from '../../../../utils/date-math.ts';
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

/**
 * @function Calendar
 * @description A reactive calendar component for date selection.
 * Fixed: selection reactivity by using computed() inside useMemo().
 */
export function Calendar(props: CalendarProps) {
	// #region 1. State & Props Destructuring
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

	const getInitialView = () => {
		if (Array.isArray(value)) {
			const first = value[0];
			return first ? first : new DateTime();
		}

		return (value as DateTime) || new DateTime();
	};

	const viewDate = useSignal(new DateTime());
	const hoverDate = useSignal<DateTime | null>(null);
	const viewScope = useSignal<'days' | 'months' | 'years'>('days');

	// Keep the calendar view in sync if the value prop changes externally
	useEffect(() => {
		viewDate.value = getInitialView();
	}, [value]);
	// #endregion

	// #region 2. Reactive Grid Logic
	/**
	 * @description Generates the calendar days.
	 * Using useMemo + computed allows us to mix signals (viewDate)
	 * with standard props (value, min, max) without breaking hook rules.
	 */
	const rawDays = useMemo(() => {
		return computed(() => {
			const ghostDate = selectionMode === 'range' ? hoverDate.value : null;
			return getCalendarGrid(viewDate.value, value, ghostDate, min, max, startOfWeek);
		});
	}, [viewDate, hoverDate, value, selectionMode, min, max, startOfWeek]);

	const weekLabels = getWeekdayLabels(startOfWeek);
	// #endregion

	// #region 3. Interaction Handlers
	const handleDayClick = (date: DateTime, e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		// Check modifiers or range boundaries
		if (modifiers.disabled && modifiers.disabled(date)) return;

		let newValue: any;

		if (selectionMode === 'single') {
			newValue = date;
		} else if (selectionMode === 'multiple') {
			const current = (value as DateTime[]) || [];
			const exists = current.find((d) => d.isSameDay(date));
			newValue = exists ? current.filter((d) => !d.isSameDay(date)) : [...current, date];
		} else if (selectionMode === 'range') {
			const current = (value as RangeDateValue) || [null, null];
			const [start, end] = current;

			if (!start || (start && end)) {
				newValue = [date, null];
			} else {
				newValue = date.isBefore(start) ? [date, start] : [start, date];
			}
		}

		onChange?.(newValue);
	};

	const handleNav = (dir: -1 | 1) => {
		const unit = viewScope.value === 'days' ? 'months' : 'years';
		viewDate.value = viewDate.value.add(dir, unit);
	};
	// #endregion

	// #region 4. Render Helpers
	const renderDays = () => (
		<>
			<div className='calendar__weekdays'>
				{weekLabels.map((day) => <span key={day} className='calendar__weekday'>{day}</span>)}
			</div>{' '}
			<div className='calendar__grid calendar__grid--days'>
				{rawDays.value.map((dayItem, idx) => {
					const modClasses = [];
					if (dayItem.isToday) modClasses.push('calendar__day--today');
					if (dayItem.isSelected) modClasses.push('calendar__day--selected');
					if (dayItem.isRangeStart) modClasses.push('calendar__day--range-start');
					if (dayItem.isRangeEnd) modClasses.push('calendar__day--range-end');
					if (dayItem.isRangeMiddle) modClasses.push('calendar__day--range-middle');
					if (!dayItem.isCurrentMonth) modClasses.push('calendar__day--muted');
					if (dayItem.isDisabled) modClasses.push('calendar__day--disabled');

					return (
						<button
							key={`$ {
                                idx
                            }

                            `}
							type='button'
							className={`calendar__day $ {
                                modClasses.join(' ')
                            }

                            `}
							disabled={dayItem.isDisabled}
							onClick={(e) => handleDayClick(dayItem.date, e)}
							onMouseEnter={() => hoverDate.value = dayItem.date}
						>
							{dayItem.date.getDate()}
						</button>
					);
				})}
			</div>
		</>
	);
	// #endregion

	let headerLabel = '';

	if (viewScope.value === 'days') {
		headerLabel = viewDate.value.toFormat('MMMM yyyy');
	} else {
		headerLabel = viewDate.value.toFormat('yyyy');
	}

	// #region Logic: Disabled Check
	/**
	 * @function isDateDisabled
	 * @description Determines if a date is blocked by min/max or custom logic.
	 */
	const isDateDisabled = (date: DateTime, gridDisabled: boolean) => {
		if (gridDisabled) return true;
		if (modifiers.disabled && modifiers.disabled(date)) return true;
		return false;
	};
	// #endregion

	return (
		<div
			className={`calendar $ {
                className || ''
            }

            `}
			onMouseLeave={() => hoverDate.value = null}
		>
			{
				/* Header omitted for brevity */
			}

			<div className='calendar__body'>
				<div className='calendar__grid calendar__grid--days'>
					{rawDays.value.map((dayItem, idx) => {
						const isDisabled = isDateDisabled(dayItem.date, dayItem.isDisabled);

						const classes = [
							'calendar__day',
							isDisabled ? 'calendar__day--disabled' : '',
							!dayItem.isCurrentMonth ? 'calendar__day--muted' : '',
							dayItem.isToday ? 'calendar__day--today' : '',
							dayItem.isSelected ? 'calendar__day--selected' : '',
							dayItem.isRangeStart ? 'calendar__day--range-start' : '',
							dayItem.isRangeEnd ? 'calendar__day--range-end' : '',
							dayItem.isRangeMiddle ? 'calendar__day--range-middle' : '',
						].filter(Boolean).join(' ');

						return (
							<button
								key={idx}
								type='button'
								className={classes}
								disabled={isDisabled}
								onClick={(e) => {
									e.stopPropagation();
									if (!isDisabled) onChange?.(dayItem.date);
								}}
								onMouseEnter={() => !isDisabled && (hoverDate.value = dayItem.date)}
							>
								{dayItem.date.getDate()}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
	// #endregion
}
