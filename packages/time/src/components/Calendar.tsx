// The main, controlled calendar. Owns its own CSS import and renders a toolbar
// plus the active view (day / week / month). Cursor + view are controlled via
// props/callbacks so a host page can bind them to its own signals.
//
// The Day/Week grids virtualize continuously: scrolling the timeline broadcasts
// the live cursor back through `onCursorChange`, while toolbar navigation pushes
// a new cursor down that the grid re-anchors to. Month stays a static grid.

import '../styles/calendar.css';
import type {
	AvailabilityWindow,
	CalendarEvent,
	CalendarView,
	TimeOffRange,
} from '../types/calendar.ts';
import { addDays, isoDate, parseIso } from '../hooks/date-utils.ts';
import { CalendarToolbar } from './CalendarToolbar.tsx';
import { WeekView } from './WeekView.tsx';
import { DayView } from './DayView.tsx';
import { MonthTimeline } from './MonthTimeline.tsx';

export interface CalendarProps {
	view: CalendarView;
	cursor: string;
	onViewChange: (view: CalendarView) => void;
	onCursorChange: (cursor: string) => void;
	events: CalendarEvent[];
	windows: AvailabilityWindow[];
	timeOff: TimeOffRange[];
	onSelectSlot?: (date: string, startMin: number) => void;
	onEventClick?: (event: CalendarEvent) => void;
	/** Hour the day/week grid vertically scrolls to on mount. Default 7. */
	startHour?: number;
	/** Retained for API compatibility; the grid now renders a full 24h matrix. */
	endHour?: number;
	/** Slot granularity in minutes for the clickable substrate. Default 30. */
	slotMinutes?: number;
}

export function Calendar(props: CalendarProps) {
	const {
		view,
		cursor,
		onViewChange,
		onCursorChange,
		events,
		windows,
		timeOff,
		onSelectSlot,
		onEventClick,
		startHour = 7,
		slotMinutes = 30,
	} = props;

	const stepCursor = (dir: -1 | 1) => {
		if (view === 'day') {
			onCursorChange(addDays(cursor, dir));
		} else if (view === 'week') {
			onCursorChange(addDays(cursor, dir * 7));
		} else {
			const d = parseIso(cursor);
			d.setMonth(d.getMonth() + dir, 1);
			onCursorChange(isoDate(d));
		}
	};

	const openDay = (iso: string) => {
		onCursorChange(iso);
		onViewChange('day');
	};

	return (
		<div class='cal' data-view={view}>
			<CalendarToolbar
				view={view}
				cursor={cursor}
				onViewChange={onViewChange}
				onPrev={() => stepCursor(-1)}
				onNext={() => stepCursor(1)}
				onToday={() => onCursorChange(isoDate(new Date()))}
			/>

			<div class='cal__body'>
				{view === 'month'
					? (
						<MonthTimeline
							anchor={cursor}
							events={events}
							windows={windows}
							timeOff={timeOff}
							onSelectDay={openDay}
							onEventClick={onEventClick}
							onAnchorChange={onCursorChange}
						/>
					)
					: view === 'week'
					? (
						<WeekView
							anchor={cursor}
							events={events}
							windows={windows}
							timeOff={timeOff}
							slotMinutes={slotMinutes}
							scrollToHour={startHour}
							onSelectSlot={onSelectSlot}
							onEventClick={onEventClick}
							onAnchorChange={onCursorChange}
						/>
					)
					: (
						<DayView
							day={cursor}
							events={events}
							windows={windows}
							timeOff={timeOff}
							slotMinutes={slotMinutes}
							scrollToHour={startHour}
							onSelectSlot={onSelectSlot}
							onEventClick={onEventClick}
							onAnchorChange={onCursorChange}
						/>
					)}
			</div>
		</div>
	);
}
