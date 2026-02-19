import '../../styles/gantt/gantt-task-list.css';
import { effect, useComputed } from '@preact/signals';
import { GanttStore } from '../../core/gantt/store.ts';
import { GanttTaskCard } from './GanttTaskCard.tsx';
import { useEffect, useRef } from 'preact/hooks';

interface GanttTaskListProps {
	store: GanttStore;
	width: number;
}

export function GanttTaskList({ store, width }: GanttTaskListProps) {
	const listRef = useRef<HTMLDivElement>(null);
	const tasksRef = useRef<HTMLDivElement>(null);

	const startIndex = useComputed(() => {
		return Math.floor(store.scrollY.value / store.rowHeight.value);
	});

	const visibleRows = useComputed(() => {
		const start = startIndex.value;
		const end = start + 15;

		return [...store.rows.value]
			.sort((a, b) => a.orderIndex - b.orderIndex)
			.slice(start, end);
	});

	useEffect(() => {
		const dispose = effect(() => {
			if (tasksRef.current) {
				const offset = store.scrollY.value % store.rowHeight.value;
				tasksRef.current.style.transform = `translateY(-${offset}px)`;
			}
		});

		return () => dispose();
	}, [store]);

	const handleWheel = (e: WheelEvent) => {
		e.preventDefault();

		const currentY = store.scrollY.value;
		const delta = e.deltaY * 0.6;

		const contentHeight = store.contentHeight.value;
		const viewportHeight = store.containerHeight.value;
		const maxScrollY = Math.max(0, contentHeight - viewportHeight);

		let newY = currentY + delta;
		if (newY < 0) newY = 0;
		if (newY > maxScrollY) newY = maxScrollY;

		store.scrollY.value = newY;
	};

	return (
		<aside class='gantt-task-list'>
			<div class='gantt-task-list__header'>
				<span class='gantt-task-list__header__title'>Stages</span>
			</div>
			<div class='gantt-task-list__container' onWheel={handleWheel} ref={listRef}>
				<div class='gantt-task-list__container__tasks' ref={tasksRef}>
					{visibleRows.value.map((row) => <GanttTaskCard key={row.id} row={row} store={store} />)}
				</div>
			</div>
		</aside>
	);
}
