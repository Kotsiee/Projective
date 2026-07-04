/**
 * @file MonthGrid.tsx
 * @description Month overview — a 6-row day grid. Each cell surfaces the day's
 * availability window count and booking count as small chips, dims time-off
 * days, and highlights today. Clicking a day drops into Day view centred there.
 */

import '../../styles/components/availability.css';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import { addDays, isoDate, isoWeekday, parseIso, WEEKDAY_LABELS } from '../../utils.ts';
import { bookingsForDate, timeOffForDate, windowsForDate } from './calendar.ts';

function grid(anchorIso: string): string[] {
	const anchor = parseIso(anchorIso);
	const first = isoDate(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
	const lead = isoWeekday(first) - 1;
	const start = addDays(first, -lead);
	return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export default function MonthGrid({ onPickDay }: { onPickDay: (iso: string) => void }) {
	const { profile, calendarCursor } = useProfileContext();
	const av = profile.value.availability;
	const cursor = calendarCursor.value;
	const cursorMonth = parseIso(cursor).getMonth();
	const today = isoDate(new Date());
	const days = grid(cursor);

	return (
		<div class='avail-month'>
			<div class='avail-month__dow'>
				{WEEKDAY_LABELS.map((d) => <span key={d} class='avail-month__dow-cell'>{d}</span>)}
			</div>
			<div class='avail-month__grid'>
				{days.map((iso) => {
					const inMonth = parseIso(iso).getMonth() === cursorMonth;
					const off = timeOffForDate(iso, av.timeOff);
					const windows = windowsForDate(iso, av.rules);
					const bookings = bookingsForDate(iso, av.bookings);
					return (
						<button
							type='button'
							key={iso}
							class='avail-month__cell'
							data-outside={!inMonth}
							data-today={iso === today}
							data-off={!!off}
							onClick={() => onPickDay(iso)}
						>
							<span class='avail-month__num'>{parseIso(iso).getDate()}</span>
							{off
								? <span class='avail-month__off'>{off.label}</span>
								: (
									<span class='avail-month__chips'>
										{windows.length > 0 && (
											<span class='avail-month__chip' data-kind='avail'>
												{windows.length} open
											</span>
										)}
										{bookings.length > 0 && (
											<span class='avail-month__chip' data-kind='booked'>
												{bookings.length} booked
											</span>
										)}
									</span>
								)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
