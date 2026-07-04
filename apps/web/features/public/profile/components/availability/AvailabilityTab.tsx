/**
 * @file AvailabilityTab.tsx
 * @description The Availability engine — an MS-Teams-style scheduling surface.
 *
 * Layout: a header row (Day/Week/Month toggle + Prev / Today / Next range
 * stepper), a left sidebar (mini-month + the freelancer's recurring rules), and
 * the main calendar fabric that paints availability windows, overlays holidays
 * and renders bookings. Double-clicking an open 30-min cell opens the booking
 * modal (rendered by the island, driven off `bookingModal`).
 *
 * When `publicBookingEnabled` is false the whole surface collapses to a clean
 * "Bookings offline" placeholder.
 */

import '../../styles/components/availability.css';
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';
import type { CalendarView } from '../../contexts/ProfileContext.tsx';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import { addDays, isoDate, MONTH_LABELS, parseIso, startOfWeek } from '../../utils.ts';
import BookingsOffline from './BookingsOffline.tsx';
import MiniMonth from './MiniMonth.tsx';
import RulesList from './RulesList.tsx';
import ScheduleGrid from './ScheduleGrid.tsx';
import MonthGrid from './MonthGrid.tsx';

const VIEWS: { key: CalendarView; label: string }[] = [
	{ key: 'day', label: 'Day' },
	{ key: 'week', label: 'Week' },
	{ key: 'month', label: 'Month' },
];

/** The range label shown between the steppers, per active view. */
function rangeLabel(view: CalendarView, cursor: string): string {
	const d = parseIso(cursor);
	if (view === 'day') {
		return `${MONTH_LABELS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
	}
	if (view === 'week') {
		const start = parseIso(startOfWeek(cursor));
		const end = parseIso(addDays(startOfWeek(cursor), 6));
		const sameMonth = start.getMonth() === end.getMonth();
		const startLabel = `${MONTH_LABELS[start.getMonth()].slice(0, 3)} ${start.getDate()}`;
		const endLabel = sameMonth
			? `${end.getDate()}`
			: `${MONTH_LABELS[end.getMonth()].slice(0, 3)} ${end.getDate()}`;
		return `${startLabel} – ${endLabel}, ${end.getFullYear()}`;
	}
	return `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function AvailabilityTab() {
	const { profile, calendarView, calendarCursor } = useProfileContext();
	const av = profile.value.availability;

	if (!av.publicBookingEnabled) return <BookingsOffline />;

	const view = calendarView.value;
	const cursor = calendarCursor.value;

	// #region Cursor steppers
	const step = (dir: -1 | 1) => {
		if (view === 'day') {
			calendarCursor.value = addDays(cursor, dir);
		} else if (view === 'week') {
			calendarCursor.value = addDays(cursor, dir * 7);
		} else {
			const d = parseIso(cursor);
			d.setMonth(d.getMonth() + dir, 1);
			calendarCursor.value = isoDate(d);
		}
	};
	const goToday = () => {
		calendarCursor.value = isoDate(new Date());
	};
	const pickDay = (iso: string) => {
		calendarCursor.value = iso;
		calendarView.value = 'day';
	};
	// #endregion

	return (
		<div class='avail'>
			{/* #region Header */}
			<div class='tab-head avail-head'>
				<div>
					<h2 class='tab-head__title'>
						<IconCalendar size={19} /> Availability
					</h2>
					<p class='tab-head__sub'>
						Double-click an open slot to request a session. Times shown in the freelancer's local
						timezone.
					</p>
				</div>

				<div class='avail-head__controls'>
					<div class='avail-stepper'>
						<button
							type='button'
							class='avail-stepper__btn'
							aria-label='Previous'
							onClick={() => step(-1)}
						>
							<IconChevronLeft size={16} />
						</button>
						<button type='button' class='avail-stepper__today' onClick={goToday}>Today</button>
						<button
							type='button'
							class='avail-stepper__btn'
							aria-label='Next'
							onClick={() => step(1)}
						>
							<IconChevronRight size={16} />
						</button>
					</div>

					<div class='view-toggle avail-viewtoggle'>
						{VIEWS.map((v) => (
							<button
								key={v.key}
								type='button'
								class='view-toggle__btn avail-viewtoggle__btn'
								data-active={view === v.key}
								onClick={() => (calendarView.value = v.key)}
							>
								{v.label}
							</button>
						))}
					</div>
				</div>
			</div>
			{/* #endregion */}

			<div class='avail-range'>{rangeLabel(view, cursor)}</div>

			<div class='avail-body'>
				{/* #region Left sidebar */}
				<aside class='avail-side'>
					<MiniMonth onPick={pickDay} />
					<RulesList />
				</aside>
				{/* #endregion */}

				{/* #region Main fabric */}
				<div class='avail-main'>
					{view === 'month' ? <MonthGrid onPickDay={pickDay} /> : <ScheduleGrid view={view} />}
				</div>
				{/* #endregion */}
			</div>
		</div>
	);
}
