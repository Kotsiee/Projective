/**
 * @file ScheduleGrid.tsx
 * @description The MS-Teams-style schedule fabric shared by Day and Week views.
 * A fixed time gutter on the left; one column per day. Each column layers:
 *   1. background half-hour gridlines (the clickable cell substrate)
 *   2. coloured availability windows painted from matching rules
 *   3. a holiday / time-off overlay (hatched, inert)
 *   4. existing bookings as filled cards
 *
 * Double-clicking an OPEN cell (inside a window, no booking, not on time-off)
 * opens the booking modal for that 30-min block.
 */

import '../../styles/components/availability.css';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import type { BookingEntry } from '../../contracts/Profile.ts';
import {
	addDays,
	isoDate,
	minutesToTime,
	parseIso,
	startOfWeek,
	WEEKDAY_LABELS,
} from '../../utils.ts';
import {
	bookingsForDate,
	cellStarts,
	columnHeight,
	durationToHeight,
	hourMarks,
	isWithinWindow,
	minuteToTop,
	overlapsBooking,
	type ResolvedWindow,
	timeOffForDate,
	windowsForDate,
} from './calendar.ts';
import { PlatformIcon } from './platformIcon.tsx';

// #region Column
function DayColumn({ iso, showHeader }: { iso: string; showHeader: boolean }) {
	const { profile, openBooking } = useProfileContext();
	const av = profile.value.availability;
	const slot = av.slotMinutes;

	const windows = windowsForDate(iso, av.rules);
	const off = timeOffForDate(iso, av.timeOff);
	const bookings = bookingsForDate(iso, av.bookings);
	const date = parseIso(iso);
	const isToday = iso === isoDate(new Date());

	return (
		<div class='avail-col' data-today={isToday}>
			{showHeader && (
				<div class='avail-col__head' data-today={isToday}>
					<span class='avail-col__dow'>
						{WEEKDAY_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1]}
					</span>
					<span class='avail-col__date'>{date.getDate()}</span>
				</div>
			)}

			<div class='avail-col__body' style={{ height: `${columnHeight()}px` }}>
				{/* 1. Clickable half-hour substrate */}
				{cellStarts(slot).map((start) => {
					const end = start + slot;
					const open = !off && isWithinWindow(start, end, windows) &&
						!overlapsBooking(start, end, bookings);
					return (
						<div
							key={start}
							class='avail-cell'
							data-open={open}
							style={{
								top: `${minuteToTop(start)}px`,
								height: `${durationToHeight(start, end)}px`,
							}}
							onDblClick={open ? () => openBooking(iso, start) : undefined}
							title={open ? `Book ${minutesToTime(start)}` : undefined}
						/>
					);
				})}

				{/* 2. Availability windows */}
				{windows.map((w, i) => <WindowBlock key={i} win={w} dimmed={!!off} />)}

				{/* 3. Time-off overlay */}
				{off && (
					<div
						class='avail-off-overlay'
						style={{ top: 0, height: `${columnHeight()}px` }}
						title={off.label}
					>
						<span class='avail-off-overlay__label'>{off.label}</span>
					</div>
				)}

				{/* 4. Bookings */}
				{bookings.map((b) => <BookingCard key={b.id} booking={b} />)}
			</div>
		</div>
	);
}
// #endregion

// #region Painted window
function WindowBlock({ win, dimmed }: { win: ResolvedWindow; dimmed: boolean }) {
	return (
		<div
			class='avail-window'
			data-dimmed={dimmed}
			style={{
				top: `${minuteToTop(win.start)}px`,
				height: `${durationToHeight(win.start, win.end)}px`,
				// The rule colour tints a translucent surface + a solid left rail.
				background: `color-mix(in srgb, ${win.colour} 14%, transparent)`,
				borderLeft: `3px solid ${win.colour}`,
			}}
		>
			{win.slotLabel && <span class='avail-window__label'>{win.slotLabel}</span>}
		</div>
	);
}
// #endregion

// #region Booking card
function BookingCard({ booking }: { booking: BookingEntry }) {
	return (
		<div
			class='avail-booking'
			style={{
				top: `${minuteToTop(booking.start)}px`,
				height: `${durationToHeight(booking.start, booking.end)}px`,
			}}
			title={`${booking.title} · ${minutesToTime(booking.start)}–${minutesToTime(booking.end)}`}
		>
			<span class='avail-booking__time'>
				<PlatformIcon platform={booking.platform} size={12} />
				{minutesToTime(booking.start)}
			</span>
			<span class='avail-booking__title'>{booking.title}</span>
			<span class='avail-booking__with'>{booking.with}</span>
		</div>
	);
}
// #endregion

// #region Time gutter
function TimeGutter({ spacer }: { spacer: boolean }) {
	return (
		<div class='avail-gutter'>
			{spacer && <div class='avail-gutter__head' />}
			<div class='avail-gutter__body' style={{ height: `${columnHeight()}px` }}>
				{hourMarks().map((m) => (
					<span key={m} class='avail-gutter__mark' style={{ top: `${minuteToTop(m)}px` }}>
						{minutesToTime(m)}
					</span>
				))}
			</div>
		</div>
	);
}
// #endregion

export default function ScheduleGrid({ view }: { view: 'day' | 'week' }) {
	const { calendarCursor } = useProfileContext();
	const cursor = calendarCursor.value;

	const days = view === 'week'
		? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i))
		: [cursor];

	return (
		<div class='avail-fabric' data-view={view}>
			<TimeGutter spacer />
			<div class='avail-fabric__cols'>
				{days.map((iso) => <DayColumn key={iso} iso={iso} showHeader />)}
			</div>
		</div>
	);
}
