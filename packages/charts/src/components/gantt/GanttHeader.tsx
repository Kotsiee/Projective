import '../../styles/gantt/gantt-header.css';
import { useComputed } from '@preact/signals';
import { GanttStore } from '../../core/gantt/store.ts';
import { IconButton } from '@projective/ui';
import { SliderField } from '@projective/fields';
import { IconChevronLeft, IconChevronRight, IconMinus, IconPlus } from '@tabler/icons-preact';
import { DateTime } from '@projective/types';
import { useCallback, useEffect, useMemo, useRef } from 'preact/hooks';

// #region Helper Hook
function useHoldRepeat(callback: () => void, delay = 400, interval = 50) {
	// deno-lint-ignore no-explicit-any
	const timeoutRef = useRef<any>(null);
	// deno-lint-ignore no-explicit-any
	const intervalRef = useRef<any>(null);

	const stop = useCallback(() => {
		if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
		if (intervalRef.current !== null) clearInterval(intervalRef.current);
	}, []);

	const start = useCallback((e: PointerEvent) => {
		if (e.button !== 0) return;
		callback();
		timeoutRef.current = setTimeout(() => {
			intervalRef.current = setInterval(callback, interval);
		}, delay);
	}, [callback, delay, interval]);

	useEffect(() => stop, [stop]);

	return {
		onPointerDown: start,
		onPointerUp: stop,
		onPointerLeave: stop,
		onContextMenu: (e: Event) => e.preventDefault(),
	};
}
// #endregion

interface GanttHeaderProps {
	store: GanttStore;
}

export function GanttHeader({ store }: GanttHeaderProps) {
	const minDays = 1;
	const maxDays = 90;

	const dateLabel = useComputed(() => {
		const x = store.scrollX.value;
		const days = store.visibleDays.value;

		const startMs = store.timeScale.xToDate(-x);
		const startDt = new DateTime(new Date(startMs));
		const endDt = startDt.add(days, 'days');

		return `${startDt.toFormat('dd MMM')} - ${endDt.toFormat('dd MMM')}`;
	});

	const handleNav = (direction: -1 | 1) => {
		const shift = (store.containerWidth.value / 4) * direction;
		store.scrollX.value -= shift;
	};

	const handleAddDay = useCallback(() => {
		const current = store.visibleDays.value;
		if (current < maxDays) store.setVisibleDays(current + 1);
	}, [store]);

	const handleSubDay = useCallback(() => {
		const current = store.visibleDays.value;
		if (current > minDays) store.setVisibleDays(current - 1);
	}, [store]);

	const addProps = useHoldRepeat(handleAddDay);
	const subProps = useHoldRepeat(handleSubDay);

	// Dynamically generate the 90 tick marks
	const dynamicMarks = useMemo(() => {
		const arr = [];
		for (let i = minDays; i <= maxDays; i++) {
			let className = 'gantt-slider-mark--day';
			let label = undefined;

			// Only show labels on the very first and very last tick
			if (i === minDays) {
				label = `${i}d`;
				className += ' gantt-slider-mark--min';
			} else if (i === maxDays) {
				label = `${i}d`;
				className += ' gantt-slider-mark--max';
			}

			// Add month class every 30 days
			if (i % 30 === 0) {
				className += ' gantt-slider-mark--month';
			}

			arr.push({ value: i, label, className });
		}
		return arr;
	}, [minDays, maxDays]);

	return (
		<div class='gantt-header'>
			<div
				class='gantt-header__spacer'
				style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1rem' }}
			>
				<IconButton variant='secondary' size='small' aria-label='Decrease days' {...subProps}>
					<IconMinus size={16} />
				</IconButton>

				<div style={{ flex: 1 }}>
					<SliderField
						value={store.visibleDays.value}
						onChange={(val) => store.setVisibleDays(val as number)}
						min={minDays}
						max={maxDays}
						step={1}
						marks={dynamicMarks}
					/>
				</div>

				<IconButton variant='secondary' size='small' aria-label='Increase days' {...addProps}>
					<IconPlus size={16} />
				</IconButton>
			</div>

			<div class='gantt-header__date-range'>
				<IconButton
					variant='secondary'
					size='medium'
					aria-label='Previous'
					onClick={() => handleNav(-1)}
					outlined
					ghost
				>
					<IconChevronLeft />
				</IconButton>

				<span style={{ minWidth: '140px', textAlign: 'center' }}>
					{dateLabel.value}
				</span>

				<IconButton
					variant='secondary'
					size='medium'
					aria-label='Next'
					onClick={() => handleNav(1)}
					outlined
					ghost
				>
					<IconChevronRight />
				</IconButton>
			</div>

			<div class='gantt-header__spacer'></div>
		</div>
	);
}
