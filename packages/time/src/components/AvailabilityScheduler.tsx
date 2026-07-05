import '../styles/availability-scheduler.css';
import { useComputed, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { IconPlus, IconTrash, IconX } from '@tabler/icons-preact';
import { LocalTimeChip } from './LocalTimeChip.tsx';
import type { AvailabilitySlot, AvailabilityValue, AwayDate, Weekday } from '../types/scheduler.ts';

export interface AvailabilitySchedulerProps {
	open: boolean;
	value: AvailabilityValue;
	onChange: (next: AvailabilityValue) => void;
	onClose: () => void;
	readOnly?: boolean;
}

// Grid runs from START_HOUR up to (but not including) END_HOUR; each row is one hour block.
const START_HOUR = 8;
const END_HOUR = 20;

// Columns are ordered Mon–Sun for display, but Weekday values keep 0=Sun semantics.
const DAY_COLUMNS: { day: Weekday; label: string }[] = [
	{ day: 1, label: 'Mon' },
	{ day: 2, label: 'Tue' },
	{ day: 3, label: 'Wed' },
	{ day: 4, label: 'Thu' },
	{ day: 5, label: 'Fri' },
	{ day: 6, label: 'Sat' },
	{ day: 0, label: 'Sun' },
];

/** Key for a single toggled hour cell, e.g. '1-9' for Monday 09:00–10:00. */
function cellKey(day: Weekday, hour: number): string {
	return `${day}-${hour}`;
}

function pad2(n: number): string {
	return n.toString().padStart(2, '0');
}

/** Expands weekly slots into the set of covered hour cells. */
function slotsToSet(weekly: AvailabilitySlot[]): Set<string> {
	const set = new Set<string>();
	for (const slot of weekly) {
		const startHour = parseInt(slot.start.split(':')[0] ?? '0', 10);
		const endHour = parseInt(slot.end.split(':')[0] ?? '0', 10);
		for (let h = startHour; h < endHour; h++) {
			set.add(cellKey(slot.day, h));
		}
	}
	return set;
}

/** Collapses the set of hour cells back into contiguous per-day slots. */
function setToSlots(set: Set<string>): AvailabilitySlot[] {
	const slots: AvailabilitySlot[] = [];
	for (const col of DAY_COLUMNS) {
		const hours: number[] = [];
		for (let h = 0; h < 24; h++) {
			if (set.has(cellKey(col.day, h))) hours.push(h);
		}
		hours.sort((a, b) => a - b);

		let runStart: number | null = null;
		let prev: number | null = null;
		const flush = (end: number) => {
			if (runStart !== null) {
				slots.push({
					day: col.day,
					start: `${pad2(runStart)}:00`,
					end: `${pad2(end)}:00`,
				});
			}
		};
		for (const h of hours) {
			if (runStart === null) {
				runStart = h;
			} else if (prev !== null && h !== prev + 1) {
				flush(prev + 1);
				runStart = h;
			}
			prev = h;
		}
		if (prev !== null) flush(prev + 1);
	}
	return slots;
}

/**
 * Overlay scheduler for editing weekly availability windows and away-date ranges.
 *
 * @remarks
 * Renders nothing when `open` is false. Grid state is derived from `value.weekly` on open and
 * whenever it changes upstream; every edit recomputes the full {@link AvailabilityValue} and
 * emits it via `onChange`.
 */
export function AvailabilityScheduler(props: AvailabilitySchedulerProps) {
	const { open, value, onChange, onClose, readOnly = false } = props;

	const active = useSignal<Set<string>>(slotsToSet(value.weekly));
	const awayFrom = useSignal('');
	const awayTo = useSignal('');
	const awayNote = useSignal('');

	// Re-sync internal grid state whenever the incoming weekly slots change.
	useEffect(() => {
		active.value = slotsToSet(value.weekly);
	}, [value.weekly]);

	const hours = useComputed(() => {
		const list: number[] = [];
		for (let h = START_HOUR; h < END_HOUR; h++) list.push(h);
		return list;
	});

	const emit = (patch: Partial<AvailabilityValue>) => {
		onChange({ ...value, ...patch });
	};

	const toggleCell = (day: Weekday, hour: number) => {
		if (readOnly) return;
		const next = new Set(active.value);
		const key = cellKey(day, hour);
		if (next.has(key)) next.delete(key);
		else next.add(key);
		active.value = next;
		emit({ weekly: setToSlots(next) });
	};

	const addAway = () => {
		if (readOnly) return;
		if (!awayFrom.value || !awayTo.value) return;
		const entry: AwayDate = {
			id: crypto.randomUUID(),
			from: awayFrom.value,
			to: awayTo.value,
			note: awayNote.value.trim() || undefined,
		};
		emit({ away: [...value.away, entry] });
		awayFrom.value = '';
		awayTo.value = '';
		awayNote.value = '';
	};

	const removeAway = (id: string) => {
		if (readOnly) return;
		emit({ away: value.away.filter((a) => a.id !== id) });
	};

	if (!open) return null;

	return (
		<div class='availability-scheduler__backdrop' onClick={onClose}>
			<div
				class='availability-scheduler'
				role='dialog'
				aria-modal='true'
				aria-label='Availability'
				onClick={(e) => e.stopPropagation()}
			>
				<header class='availability-scheduler__header'>
					<div class='availability-scheduler__title-group'>
						<h2 class='availability-scheduler__title'>Availability</h2>
						<LocalTimeChip timezone={value.timezone} label='Local time' />
					</div>
					<button
						type='button'
						class='availability-scheduler__close'
						aria-label='Close scheduler'
						onClick={onClose}
					>
						<IconX size={18} />
					</button>
				</header>

				<div class='availability-scheduler__body'>
					<section class='availability-scheduler__section'>
						<h3 class='availability-scheduler__section-title'>Weekly hours</h3>
						<div
							class='availability-scheduler__grid'
							style={{
								gridTemplateColumns: `auto repeat(${DAY_COLUMNS.length}, minmax(0, 1fr))`,
							}}
						>
							<span class='availability-scheduler__corner' aria-hidden='true' />
							{DAY_COLUMNS.map((col) => (
								<span key={`h-${col.day}`} class='availability-scheduler__day-label'>
									{col.label}
								</span>
							))}

							{hours.value.map((hour) => [
								<span
									key={`t-${hour}`}
									class='availability-scheduler__hour-label'
								>
									{pad2(hour)}:00
								</span>,
								...DAY_COLUMNS.map((col) => {
									const isActive = active.value.has(cellKey(col.day, hour));
									return (
										<button
											key={cellKey(col.day, hour)}
											type='button'
											disabled={readOnly}
											aria-pressed={isActive}
											aria-label={`${col.label} ${pad2(hour)}:00 ${
												isActive ? 'available' : 'unavailable'
											}`}
											class={`availability-scheduler__cell${
												isActive ? ' availability-scheduler__cell--active' : ''
											}`}
											onClick={() => toggleCell(col.day, hour)}
										/>
									);
								}),
							])}
						</div>
					</section>

					<section class='availability-scheduler__section'>
						<h3 class='availability-scheduler__section-title'>Away dates</h3>

						{value.away.length === 0 && (
							<p class='availability-scheduler__empty'>No away dates added.</p>
						)}

						<ul class='availability-scheduler__away-list'>
							{value.away.map((entry) => (
								<li key={entry.id} class='availability-scheduler__away-item'>
									<span class='availability-scheduler__away-range'>
										{entry.from} → {entry.to}
									</span>
									{entry.note && (
										<span class='availability-scheduler__away-note'>
											{entry.note}
										</span>
									)}
									{!readOnly && (
										<button
											type='button'
											class='availability-scheduler__away-remove'
											aria-label='Remove away dates'
											onClick={() => removeAway(entry.id)}
										>
											<IconTrash size={16} />
										</button>
									)}
								</li>
							))}
						</ul>

						{!readOnly && (
							<div class='availability-scheduler__away-add'>
								<input
									type='date'
									class='availability-scheduler__input'
									aria-label='Away from date'
									value={awayFrom.value}
									onInput={(e) => awayFrom.value = (e.target as HTMLInputElement).value}
								/>
								<input
									type='date'
									class='availability-scheduler__input'
									aria-label='Away to date'
									value={awayTo.value}
									onInput={(e) => awayTo.value = (e.target as HTMLInputElement).value}
								/>
								<input
									type='text'
									class='availability-scheduler__input availability-scheduler__input--note'
									placeholder='Note (optional)'
									aria-label='Away note'
									value={awayNote.value}
									onInput={(e) => awayNote.value = (e.target as HTMLInputElement).value}
								/>
								<button
									type='button'
									class='availability-scheduler__add-btn'
									aria-label='Add away dates'
									disabled={!awayFrom.value || !awayTo.value}
									onClick={addAway}
								>
									<IconPlus size={16} />
									<span>Add</span>
								</button>
							</div>
						)}
					</section>
				</div>
			</div>
		</div>
	);
}
