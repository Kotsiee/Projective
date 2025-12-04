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
