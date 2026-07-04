/**
 * @file MiniMonth.tsx
 * @description Compact month calendar in the left sidebar. Highlights the active
 * cursor day, dots days that carry availability or bookings, and dims time-off
 * days. Clicking a day recentres the cursor (and drops into Day view via a
 * caller-supplied handler).
 */

import '../../styles/components/availability.css';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import {
	addDays,
	isoDate,
	isoWeekday,
	MONTH_LABELS,
	parseIso,
	WEEKDAY_LABELS,
} from '../../utils.ts';
import { bookingsForDate, timeOffForDate, windowsForDate } from './calendar.ts';

/** All ISO dates to render in a 6-row month grid (leading/trailing padding). */
function monthGrid(anchorIso: string): string[] {
	const anchor = parseIso(anchorIso);
	const first = isoDate(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
	// Back up to the Monday on/just before the 1st.
	const lead = isoWeekday(first) - 1;
	const gridStart = addDays(first, -lead);
	return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export default function MiniMonth({ onPick }: { onPick: (iso: string) => void }) {
	const { profile, calendarCursor } = useProfileContext();
	const av = profile.value.availability;
	const cursor = calendarCursor.value;
	const cursorDate = parseIso(cursor);
	const cursorMonth = cursorDate.getMonth();

	const days = monthGrid(cursor);
	const today = isoDate(new Date());

	const stepMonth = (delta: number) => {
		const d = parseIso(cursor);
		d.setMonth(d.getMonth() + delta, 1);
		calendarCursor.value = isoDate(d);
	};

	return (
		<div class='avail-mini'>
			<div class='avail-mini__head'>
				<span class='avail-mini__month'>
					{MONTH_LABELS[cursorMonth]} {cursorDate.getFullYear()}
				</span>
				<div class='avail-mini__nav'>
					<button
						type='button'
						class='avail-mini__navbtn'
						aria-label='Previous month'
						onClick={() => stepMonth(-1)}
					>
						<IconChevronLeft size={15} />
					</button>
					<button
						type='button'
						class='avail-mini__navbtn'
						aria-label='Next month'
						onClick={() => stepMonth(1)}
					>
						<IconChevronRight size={15} />
					</button>
				</div>
			</div>

			<div class='avail-mini__dow'>
				{WEEKDAY_LABELS.map((d) => <span key={d} class='avail-mini__dow-cell'>{d[0]}</span>)}
			</div>

			<div class='avail-mini__grid'>
				{days.map((iso) => {
					const inMonth = parseIso(iso).getMonth() === cursorMonth;
					const isCursor = iso === cursor;
					const isToday = iso === today;
					const hasWindows = windowsForDate(iso, av.rules).length > 0;
					const hasBookings = bookingsForDate(iso, av.bookings).length > 0;
					const off = timeOffForDate(iso, av.timeOff);
					return (
						<button
							key={iso}
							type='button'
							class='avail-mini__day'
							data-outside={!inMonth}
							data-cursor={isCursor}
							data-today={isToday}
							data-off={!!off}
							onClick={() => onPick(iso)}
							title={off ? off.label : undefined}
						>
							<span class='avail-mini__daynum'>{parseIso(iso).getDate()}</span>
							<span class='avail-mini__dots'>
								{hasWindows && <i class='avail-mini__dot' data-kind='avail' />}
								{hasBookings && <i class='avail-mini__dot' data-kind='booked' />}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
