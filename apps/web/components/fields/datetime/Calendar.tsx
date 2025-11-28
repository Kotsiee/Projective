import '@styles/components/fields/datetime/Calendar.css';
import { useComputed, useSignal } from '@preact/signals';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';
import { getCalendarGrid, getWeekdayLabels } from '@projective/utils';
import { DateTime } from '@projective/types';

// Types for Value: Single Date OR [Start, End]
type DateValue = DateTime | [DateTime | null, DateTime | null];

interface CalendarProps {
	value?: DateValue;
	onChange?: (date: DateValue) => void;
	min?: DateTime;
	max?: DateTime;
	startOfWeek?: 0 | 1;
	range?: boolean; // Enable range mode
	className?: string;
}

export default function Calendar(props: CalendarProps) {
	// Determine view date (use start of range or single value, or today)
	const initialView = Array.isArray(props.value)
		? (props.value[0] || DateTime.today())
		: (props.value || DateTime.today());

	const viewDate = useSignal(initialView);
	const hoverDate = useSignal<DateTime | null>(null);

	// Computed Grid with Range Logic
	const days = useComputed(() =>
		getCalendarGrid(
			viewDate.value,
			props.value,
			hoverDate.value, // Pass hover for ghost range
			props.min,
			props.max,
			props.startOfWeek ?? 1,
		)
	);

	const weekLabels = getWeekdayLabels(props.startOfWeek ?? 1);

	// --- Handlers ---

	const handlePrevMonth = () => viewDate.value = viewDate.value.minus(1, 'months');
	const handleNextMonth = () => viewDate.value = viewDate.value.add(1, 'months');

	const handleDayClick = (date: DateTime) => {
		// 1. Single Mode
		if (!props.range) {
			props.onChange?.(date);
			return;
		}

		// 2. Range Mode Logic
		const currentVal = props.value as [DateTime | null, DateTime | null] || [null, null];
		const [start, end] = currentVal;

		if (!start || (start && end)) {
			// Case A: No selection OR Full range selected -> Start new selection
			props.onChange?.([date, null]);
		} else {
			// Case B: Start exists, selecting End
			if (date.isBefore(start)) {
				// User clicked before start -> Swap (New Start is clicked date, Old Start becomes end)
				// Or just reset start? Standard UX is swap.
				props.onChange?.([date, start]);
			} else {
				// Standard forward range
				props.onChange?.([start, date]);
			}
		}
	};

	const handleDayHover = (date: DateTime) => {
		if (props.range) {
			hoverDate.value = date;
		}
	};

	return (
		<div
			className={`calendar ${props.className || ''}`}
			onMouseLeave={() => hoverDate.value = null}
		>
			<div className='calendar__header'>
				<button type='button' className='calendar__nav-btn' onClick={handlePrevMonth}>
					<IconChevronLeft size={20} />
				</button>
				<span className='calendar__title'>{viewDate.value.toFormat('MMMM yyyy')}</span>
				<button type='button' className='calendar__nav-btn' onClick={handleNextMonth}>
					<IconChevronRight size={20} />
				</button>
			</div>

			<div className='calendar__weekdays'>
				{weekLabels.map((day) => <span key={day} className='calendar__weekday'>{day}</span>)}
			</div>

			<div className='calendar__grid'>
				{days.value.map((dayItem, idx) => {
					const classes = [
						'calendar__day',
						!dayItem.isCurrentMonth ? 'calendar__day--muted' : '',
						dayItem.isToday ? 'calendar__day--today' : '',
						dayItem.isDisabled ? 'calendar__day--disabled' : '',
						// Range Classes
						dayItem.isRangeStart ? 'calendar__day--range-start' : '',
						dayItem.isRangeEnd ? 'calendar__day--range-end' : '',
						dayItem.isRangeMiddle ? 'calendar__day--range-middle' : '',
						// Fallback for single select
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
		</div>
	);
}
