/**
 * @file AvailabilityCalendar.tsx
 * @description App-side adapter that binds the profile's availability data to the
 * generic minimalist calendar in `@projective/time`. It maps the profile's
 * recurring rules → availability windows, bookings → calendar events and
 * time-off blocks → time-off ranges, then renders a clean two-pane layout:
 * a sidebar (mini month + weekly rules) beside the main calendar.
 *
 * Cursor/view are bound to ProfileContext signals; double-clicking an open slot
 * opens the booking modal via `openBooking`. When public booking is disabled the
 * whole surface collapses to the shared `<BookingsOffline/>` placeholder.
 */

import '../../styles/components/availability-page.css';
import { useComputed } from '@preact/signals';
import { IconClock } from '@tabler/icons-preact';
import {
	type AvailabilityWindow,
	Calendar,
	type CalendarEvent,
	MiniCalendar,
	type TimeOffRange,
} from '@projective/time';
import type { CalendarView } from '../../contexts/ProfileContext.tsx';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import type { AvailabilityRule, MeetingPlatform } from '../../contracts/Profile.ts';
import { minutesToTime, WEEKDAY_LABELS } from '../../utils.ts';
import BookingsOffline from './BookingsOffline.tsx';
import BookSessionModal from './BookSessionModal.tsx';

/** Per-platform accent so bookings read distinctly on the grid. */
function platformColour(platform: MeetingPlatform): string {
	switch (platform) {
		case 'zoom':
			return 'var(--primary)';
		case 'teams':
			return 'var(--warning)';
		case 'meet':
			return 'var(--success)';
	}
}

/** "Mon, Tue, Wed" from ISO weekday numbers (1=Mon…7=Sun). */
function daysLabel(days: number[]): string {
	return [...days].sort((a, b) => a - b).map((d) => WEEKDAY_LABELS[d - 1]).join(', ');
}

/** A compact weekly-rules list for the sidebar (mirrors the calendar's palette). */
function RulesList({ rules }: { rules: AvailabilityRule[] }) {
	return (
		<div class='avail-page__rules'>
			<h4 class='avail-page__rules-title'>Weekly availability</h4>
			{rules.length === 0
				? <p class='avail-page__rules-empty'>No recurring availability set.</p>
				: (
					<ul class='avail-page__rules-list'>
						{rules.map((rule) => (
							<li key={rule.id} class='avail-page__rule'>
								<span class='avail-page__rule-swatch' style={{ background: rule.colour }} />
								<div class='avail-page__rule-body'>
									<div class='avail-page__rule-top'>
										<span class='avail-page__rule-label'>{rule.label}</span>
										<span class='avail-page__rule-days'>{daysLabel(rule.days)}</span>
									</div>
									<ul class='avail-page__rule-slots'>
										{rule.slots.map((slot, i) => (
											<li key={i} class='avail-page__rule-slot'>
												<IconClock size={12} />
												<span>
													{minutesToTime(slot.start, true)} – {minutesToTime(slot.end, true)}
												</span>
												{slot.label && <span class='avail-page__rule-slot-name'>{slot.label}</span>}
											</li>
										))}
									</ul>
								</div>
							</li>
						))}
					</ul>
				)}
		</div>
	);
}

/** Premium legend for the three public interval states. */
function StatesLegend() {
	return (
		<div class='avail-page__legend' aria-hidden='true'>
			<span class='avail-page__legend-item' data-state='available'>
				<span class='avail-page__legend-swatch' />Available
			</span>
			<span class='avail-page__legend-item' data-state='reserved'>
				<span class='avail-page__legend-swatch' />Reserved
			</span>
			<span class='avail-page__legend-item' data-state='unavailable'>
				<span class='avail-page__legend-swatch' />Unavailable
			</span>
		</div>
	);
}

export default function AvailabilityCalendar() {
	const { profile, calendarView, calendarCursor, openBooking, isOwn } = useProfileContext();
	const av = profile.value.availability;
	// External viewers must never see booked activity, attendees, or project
	// context — collapse every booking to an anonymous "Reserved" block.
	const masked = !isOwn.value;

	// #region Adapt profile data → package types
	// (Hooks must run unconditionally — the offline guard happens after.)
	const windows = useComputed<AvailabilityWindow[]>(() => {
		const out: AvailabilityWindow[] = [];
		for (const rule of profile.value.availability.rules) {
			for (const day of rule.days) {
				for (const slot of rule.slots) {
					out.push({ weekday: day, start: slot.start, end: slot.end, colour: rule.colour });
				}
			}
		}
		return out;
	});

	const events = useComputed<CalendarEvent[]>(() =>
		profile.value.availability.bookings.map((b) => ({
			id: b.id,
			title: b.title,
			date: b.date,
			start: b.start,
			end: b.end,
			kind: 'booking' as const,
			colour: platformColour(b.platform),
			subtitle: b.with,
		}))
	);

	const timeOff = useComputed<TimeOffRange[]>(() =>
		profile.value.availability.timeOff.map((t) => ({
			id: t.id,
			from: t.startDate,
			to: t.endDate,
			label: t.label,
		}))
	);
	// #endregion

	if (!av.publicBookingEnabled) return <BookingsOffline />;

	return (
		<div class='avail-page'>
			<aside class='avail-page__side'>
				<MiniCalendar
					value={calendarCursor.value}
					onSelect={(iso) => (calendarCursor.value = iso)}
					events={events.value}
					windows={windows.value}
					timeOff={timeOff.value}
				/>
				<RulesList rules={av.rules} />
			</aside>

			<div class='avail-page__main'>
				<StatesLegend />
				<Calendar
					view={calendarView.value}
					cursor={calendarCursor.value}
					onViewChange={(v) => (calendarView.value = v as CalendarView)}
					onCursorChange={(iso) => (calendarCursor.value = iso)}
					events={events.value}
					windows={windows.value}
					timeOff={timeOff.value}
					slotMinutes={av.slotMinutes}
					masked={masked}
					onSelectSlot={(date, start) => openBooking(date, start)}
				/>
			</div>

			<BookSessionModal />
		</div>
	);
}
