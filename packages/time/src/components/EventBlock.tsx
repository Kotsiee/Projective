// Minimalist event chip for the week/day time grids. A soft, semi-transparent
// wash of the event's accent colour with a single vibrant left-accent line —
// no loud solid fills, no heavy borders. The accent is handed to CSS via the
// `--cal-event-accent` custom property so all colour maths live in one place.

import type { CalendarEvent } from '../types/calendar.ts';
import { minutesToTime } from '../hooks/date-utils.ts';
import { type GridGeometry, minuteToTop, spanHeight } from './calendar-grid.ts';

export interface EventBlockProps {
	event: CalendarEvent;
	geometry: GridGeometry;
	onClick?: (event: CalendarEvent) => void;
}

/** A positioned, colour-accented chip for one event within a day column. */
export function EventBlock({ event, geometry, onClick }: EventBlockProps) {
	const colour = event.colour ?? 'var(--primary)';
	const top = minuteToTop(geometry, event.start);
	const height = spanHeight(geometry, event.start, event.end);
	const compact = height < 44;

	return (
		<button
			type='button'
			class='cal-event'
			data-kind={event.kind ?? 'booking'}
			data-compact={compact}
			style={{
				top: `${top}px`,
				height: `${Math.max(height, 22)}px`,
				['--cal-event-accent' as string]: colour,
			}}
			title={`${event.title} · ${minutesToTime(event.start)}–${minutesToTime(event.end)}`}
			onClick={onClick ? () => onClick(event) : undefined}
		>
			<span class='cal-event__content'>
				<span class='cal-event__title'>{event.title}</span>
				{!compact && (
					<span class='cal-event__time'>
						{minutesToTime(event.start)}–{minutesToTime(event.end)}
					</span>
				)}
				{!compact && event.subtitle && <span class='cal-event__subtitle'>{event.subtitle}</span>}
			</span>
		</button>
	);
}
