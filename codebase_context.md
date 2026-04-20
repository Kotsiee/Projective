# Selected Codebase Context

> Included paths: ./packages/charts

## Project Tree (Selected)

```text
./packages/charts/
  charts/
  deno.json
  mod.ts
  src/
  components/
  gantt/
  GanttChart.tsx
  GanttHeader.tsx
  GanttTaskCard.tsx
  GanttTaskList.tsx
  GanttTimeline.tsx
  GanttTooltip.tsx
  pie/
  core/
  gantt/
  gantt-manager.ts
  header-utils.ts
  interaction/
  renderer/
  store.ts
  time-scale.ts
  pie/
  hooks/
  styles/
  gantt/
  pie/
  types/
  gantt.ts
  utils/
  theme-bridge.ts
```

## File Contents

### File: packages\charts\deno.json

```json
{
  "name": "@projective/charts",
  "version": "0.0.0",
  "exports": "./mod.ts",
  "tasks": {
    "check": "deno fmt --check && deno lint && deno check mod.ts"
  },
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  }
}

```

### File: packages\charts\mod.ts

```ts
export * from './src/types/gantt.ts';
export * from './src/core/gantt/store.ts';
export * from './src/core/gantt/time-scale.ts';
export { default as GanttChart } from './src/components/gantt/GanttChart.tsx';

```

### File: packages\charts\src\components\gantt\GanttChart.tsx

```tsx
import '../../styles/gantt/gantt.css';
import { GanttStore } from '../../core/gantt/store.ts';
import { GanttHeader } from './GanttHeader.tsx';
import { GanttTimeline } from './GanttTimeline.tsx';
import { GanttTaskList } from './GanttTaskList.tsx';
import { useEffect, useMemo } from 'preact/hooks';
import { DependencyLink, GanttRow, GanttTask } from '../../types/gantt.ts';

// #region Interfaces
interface GanttChartProps {
	initialData: {
		rows: GanttRow[];
		tasks: GanttTask[];
		dependencies: DependencyLink[];
	};
	selectedRowId?: string;
	onRowSelect?: (rowId: string) => void;
}
// #endregion

export default function GanttChart({ initialData, selectedRowId, onRowSelect }: GanttChartProps) {
	const store = useMemo(() => {
		const defaultStart = initialData?.tasks?.[0]?.startAt ||
			(Date.now() - (7 * 24 * 60 * 60 * 1000));

		return new GanttStore({
			visibleWidth: 1000,
			visibleHeight: 500,
			startDate: defaultStart,
		});
	}, []);

	useEffect(() => {
		store.onRowSelect = onRowSelect;
	}, [onRowSelect, store]);

	useEffect(() => {
		if (selectedRowId !== undefined) {
			store.selectedRowId.value = selectedRowId;
		}
	}, [selectedRowId, store]);

	useEffect(() => {
		if (initialData) {
			store.loadData(initialData.rows, initialData.tasks, initialData.dependencies);

			if (initialData.tasks.length > 0) {
				const earliestTask = initialData.tasks.reduce(
					(min, t) => t.startAt < min.startAt ? t : min,
					initialData.tasks[0],
				);
				const currentStart = store.timelineStart.value;

				if (
					earliestTask.startAt < currentStart - (3 * 86400000) ||
					earliestTask.startAt > currentStart + (7 * 86400000)
				) {
					store.setStartDate(earliestTask.startAt - (3 * 86400000));
					store.scrollX.value = 0;
				}
			}
		}
	}, [initialData, store]);

	return (
		<div
			className='gantt-chart'
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '1rem',
				width: '100%',
				flex: 1, // CRITICAL: Use flex: 1 instead of height: 100% to resolve CSS minimum height collapse bounds
				minHeight: 0,
				minWidth: 0,
				overflow: 'hidden',
			}}
		>
			<div class='gantt-controls' style={{ width: '100%', flexShrink: 0 }}>
				<GanttHeader store={store} />
			</div>

			<div
				class='gantt-body'
				style={{
					display: 'flex',
					flex: 1,
					width: '100%',
					minHeight: 0,
					minWidth: 0,
					backgroundColor: 'var(--card)',
					border: '1px solid var(--border-color)',
					borderRadius: 'var(--border-radius)',
					overflow: 'hidden',
				}}
			>
				<GanttTaskList store={store} width={store.containerWidth.value} />
				<GanttTimeline store={store} />
			</div>
		</div>
	);
}

```

### File: packages\charts\src\components\gantt\GanttHeader.tsx

```tsx
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

	const dynamicMarks = useMemo(() => {
		const arr = [];
		for (let i = minDays; i <= maxDays; i++) {
			let className = 'gantt-slider-mark--day';
			let label = undefined;

			if (i === minDays) {
				label = `${i}d`;
				className += ' gantt-slider-mark--min';
			} else if (i === maxDays) {
				label = `${i}d`;
				className += ' gantt-slider-mark--max';
			}

			if (i % 30 === 0) {
				className += ' gantt-slider-mark--month';
			}

			arr.push({ value: i, label, className });
		}
		return arr;
	}, [minDays, maxDays]);

	return (
		<div
			class='gantt-header'
			style={{
				display: 'flex',
				width: '100%',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '0.25rem 0',
			}}
		>
			{/* Left section: Slider block */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '1rem',
					flex: '1 1 0%',
					minWidth: '250px',
					padding: '0 1rem',
				}}
			>
				<IconButton variant='secondary' size='small' aria-label='Decrease days' {...subProps}>
					<IconMinus size={16} />
				</IconButton>

				<div style={{ flex: 1, minWidth: '150px' }}>
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

			{/* Middle section: Date block */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					flex: '1 1 0%',
					gap: '0.5rem',
				}}
			>
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

				<span
					style={{ minWidth: '150px', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem' }}
				>
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

			{/* Right section: Spacer to maintain perfect center alignment for dates */}
			<div style={{ flex: '1 1 0%' }}></div>
		</div>
	);
}

```

### File: packages\charts\src\components\gantt\GanttTaskCard.tsx

```tsx
import { GanttRow } from '../../types/gantt.ts';
import { GanttStore } from './../../core/gantt/store.ts';
import { DateTime } from '@projective/types';

interface GanttTaskCardProps {
	row: GanttRow;
	store: GanttStore;
}

export function GanttTaskCard({ row, store }: GanttTaskCardProps) {
	const startDt = new DateTime(new Date(row.data?.startMs || Date.now()));
	const endDt = new DateTime(new Date(row.data?.endMs || Date.now() + 86400000));
	const dateStr = `${startDt.toFormat('dd/MM/yy')} - ${endDt.toFormat('dd/MM/yy')}`;

	const isSelected = store.selectedRowId.value === row.id;

	return (
		<div
			class='gantt-task-card__container'
			style={`--task-height: ${store.rowHeight.value}px`}
		>
			<div
				class='gantt-task-card'
				data-selected={isSelected}
				onClick={() => store.selectRow(row.id)}
			>
				<div class='gantt-task-card__content'>
					<div>
						<h4 class='gantt-task-card__title'>{row.label}</h4>
					</div>

					<div class='gantt-task-card__meta'>
						<span class='gantt-task-card__type'>
							{row.data?.originalType?.replace('_', ' ') || row.type}
						</span>
						<span class='gantt-task-card__date'>
							{dateStr}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

```

### File: packages\charts\src\components\gantt\GanttTaskList.tsx

```tsx
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
		<aside
			class='gantt-task-list'
			style={{
				flex: '0 0 320px',
				width: '320px',
				display: 'flex',
				flexDirection: 'column',
				borderRight: '1px solid var(--border-color)',
				backgroundColor: 'var(--card)',
				overflow: 'hidden',
				zIndex: 10,
			}}
		>
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

```

### File: packages\charts\src\components\gantt\GanttTimeline.tsx

```tsx
import { useEffect, useRef } from 'preact/hooks';
import { useComputed } from '@preact/signals';
import { GanttStore } from '../../core/gantt/store.ts';
import { GanttManager } from '../../core/gantt/gantt-manager.ts';
import { generateHeaderBlocks, getHeaderTier } from '../../core/gantt/header-utils.ts';
import { DateTime } from '@projective/types';
import { GanttTooltip } from './GanttTooltip.tsx';
import '../../styles/gantt/gantt-timeline.css';

interface GanttTimelineProps {
	store: GanttStore;
}

export function GanttTimeline({ store }: GanttTimelineProps) {
	const canvasRootRef = useRef<HTMLDivElement>(null);
	const ganttManager = useRef<GanttManager | null>(null);

	useEffect(() => {
		if (canvasRootRef.current && !ganttManager.current) {
			ganttManager.current = new GanttManager(canvasRootRef.current, store);
		}

		return () => {
			ganttManager.current?.destroy();
			ganttManager.current = null;
		};
	}, []);

	const dynamicHeaders = useComputed(() => {
		const currentX = store.scrollX.value;
		const width = store.containerWidth.value;
		const days = store.visibleDays.value;

		const buffer = 2000;
		const renderStartX = -currentX - buffer;
		const renderEndX = -currentX + width + buffer;

		const startDate = new DateTime(new Date(store.timeScale.xToDate(renderStartX)));
		const endDate = new DateTime(new Date(store.timeScale.xToDate(renderEndX)));

		const tier = getHeaderTier(days, width);
		const dateToX = (t: number) => store.timeScale.dateToX(t);

		const topRows = generateHeaderBlocks(startDate, endDate, tier.top, tier.topStep, dateToX);
		const bottomRows = generateHeaderBlocks(
			startDate,
			endDate,
			tier.bottom,
			tier.bottomStep,
			dateToX,
		);

		return {
			topRows,
			bottomRows,
			tier,
		};
	});

	// deno-lint-ignore no-explicit-any
	const renderBlock = (block: any, content: string, isTop: boolean) => {
		// Hardware-accelerated GPU translation instead of expanding the DOM width
		const screenX = block.x + store.scrollX.value;

		return (
			<div
				key={block.key}
				class='gantt-time-block'
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					height: '100%',
					width: `${block.width}px`,
					transform: `translateX(${screenX}px)`,
					willChange: 'transform',
				}}
			>
				<span class={isTop ? 'gantt-sticky-label' : 'gantt-centered-label'}>
					{content}
				</span>
			</div>
		);
	};

	const header = dynamicHeaders.value;

	return (
		<section
			class='gantt-timeline'
			style={{
				flex: 1,
				display: 'flex',
				flexDirection: 'column',
				minWidth: 0,
				width: '100%',
				overflow: 'hidden',
			}}
		>
			<div
				class='gantt-timeline__header'
				style={{ overflow: 'hidden', width: '100%', position: 'relative' }}
			>
				<div
					class='gantt-header-content'
					style={{ width: '100%', position: 'relative', height: '100%' }}
				>
					{/* CRITICAL FIX: Removed conflicting inline relative positioning */}
					<div class='gantt-header-row top'>
						{header.topRows.map((block) =>
							renderBlock(
								block,
								header.tier.formatTop(block.date),
								true,
							)
						)}
					</div>

					<div class='gantt-header-row bottom'>
						{header.bottomRows.map((block) =>
							renderBlock(
								block,
								header.tier.formatBottom(block.date),
								false,
							)
						)}
					</div>
				</div>
			</div>

			<div
				class='gantt-timeline__viewport'
				style={{ flex: 1, position: 'relative', overflow: 'hidden', width: '100%' }}
			>
				<div
					class='gantt-timeline__canvas'
					ref={canvasRootRef}
					style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
				/>
				<GanttTooltip store={store} />
			</div>
		</section>
	);
}

```

### File: packages\charts\src\components\gantt\GanttTooltip.tsx

```tsx
import { GanttStore } from '../../core/gantt/store.ts';
import { DateTime } from '@projective/types';
import '../../styles/gantt/gantt-tooltip.css';

interface GanttTooltipProps {
	store: GanttStore;
}

export function GanttTooltip({ store }: GanttTooltipProps) {
	const task = store.hoveredTask.value;
	const pos = store.pointerPos.value;

	// Hide if nothing hovered, or if the user is actively dragging the canvas around
	if (!task || store.isMouseDown.value) return null;

	const startDt = new DateTime(new Date(task.startAt));
	const endDt = new DateTime(new Date(task.endAt));

	const isSinglePoint = task.startAt === task.endAt;

	// Collision Detection:
	// If near the top roof, flip it below the cursor.
	// If near the right edge, shift it left of the cursor.
	const isHitRoof = pos.y < 120;
	const isHitWall = pos.x > store.containerWidth.value - 280;

	// Diagonal offset of 15px so it doesn't cover the mouse pointer
	const transformX = isHitWall ? 'calc(-100% - 15px)' : '15px';
	const transformY = isHitRoof ? '15px' : 'calc(-100% - 15px)';

	const style = {
		left: `${pos.x}px`,
		top: `${pos.y}px`,
		transform: `translate(${transformX}, ${transformY})`,
	};

	return (
		<div class='gantt-tooltip' style={style}>
			<div class='gantt-tooltip__header'>
				<span class='gantt-tooltip__type'>{task.isMilestone ? 'Milestone' : 'Task'}</span>
			</div>

			<div class='gantt-tooltip__title'>{task.name}</div>

			<div class='gantt-tooltip__meta'>
				{isSinglePoint
					? (
						<div class='gantt-tooltip__meta-row'>
							<span class='gantt-tooltip__meta-label'>Scheduled:</span>
							<span>{startDt.toFormat('dd MMM yyyy, HH:mm')}</span>
						</div>
					)
					: (
						<>
							<div class='gantt-tooltip__meta-row'>
								<span class='gantt-tooltip__meta-label'>Starts:</span>
								<span>{startDt.toFormat('dd MMM yyyy, HH:mm')}</span>
							</div>
							<div class='gantt-tooltip__meta-row'>
								<span class='gantt-tooltip__meta-label'>Ends:</span>
								<span>{endDt.toFormat('dd MMM yyyy, HH:mm')}</span>
							</div>
						</>
					)}
			</div>
		</div>
	);
}

```

### File: packages\charts\src\core\gantt\gantt-manager.ts

```ts
import { effect } from '@preact/signals';
import { TaskRenderer } from './renderer/task-renderer.ts';
import { GridRenderer } from './renderer/grid-renderer.ts';
import { ScrollRenderer } from './renderer/scroll-renderer.ts';
import { GanttStore } from './store.ts';
import * as PIXI from 'pixi.js';
import { ScrollManager } from './interaction/scroll.ts';

export class GanttManager {
	private app: PIXI.Application;
	private store: GanttStore;
	private scroll: ScrollManager;
	// deno-lint-ignore no-explicit-any
	private renderers: any[] = [];
	private resizeObserver: ResizeObserver;
	private themeObserver?: MutationObserver;

	constructor(container: HTMLElement, store: GanttStore) {
		this.store = store;
		this.app = new PIXI.Application();
		this.scroll = new ScrollManager(this.store);

		this.resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				if (width === 0 || height === 0) continue;

				this.store.resize(width, height);

				if (this.app.renderer) {
					this.app.renderer.resize(width, height);
				}
			}
		});

		this.init(container);
	}

	private async init(container: HTMLElement) {
		await this.app.init({
			width: 800,
			height: 600,
			backgroundAlpha: 0,
			antialias: true,
			resolution: globalThis.devicePixelRatio || 1,
			autoDensity: true,
		});

		container.appendChild(this.app.canvas);
		this.resizeObserver.observe(container);

		this.themeObserver = new MutationObserver((mutations) => {
			for (const m of mutations) {
				if (m.attributeName === 'data-theme') {
					this.store.themeTrigger.value++;
				}
			}
		});
		this.themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme'],
		});

		const grid = new GridRenderer(this.store);
		const tasks = new TaskRenderer(this.store);
		const scrollbars = new ScrollRenderer(this.store);

		this.app.stage.addChild(grid.container);
		this.app.stage.addChild(tasks.container);
		this.app.stage.addChild(scrollbars.container);

		this.renderers.push(grid, tasks, scrollbars);

		this.app.canvas.addEventListener('pointerdown', () => {
			if (this.store.hoveredScrollbar.value) return;
			this.scroll.handlePointerDown();
		});

		this.app.canvas.addEventListener('wheel', (e) => {
			if (e.ctrlKey || e.metaKey) {
				e.preventDefault();

				const zoomFactor = Math.exp(e.deltaY * 0.002);
				const currentDays = this.store.visibleDays.value;
				let newDays = currentDays * zoomFactor;
				newDays = Math.max(1, Math.min(newDays, 3650));

				const firstTask = this.store.tasks.value.length > 0 ? this.store.tasks.value[0] : null;
				const anchorDate = firstTask ? firstTask.startAt : this.store.timelineStart.value;
				const currentScreenX = this.store.timeScale.dateToX(anchorDate) + this.store.scrollX.value;

				this.store.setVisibleDays(newDays);

				const newAbsoluteX = this.store.timeScale.dateToX(anchorDate);
				this.store.scrollX.value = currentScreenX - newAbsoluteX;

				return;
			}

			this.store.isShiftDown.value = e.shiftKey;
			this.scroll.handleWheel(e);
		}, { passive: false });

		globalThis.addEventListener('pointermove', (e) => this.scroll.handlePointerMove(e.movementX));
		globalThis.addEventListener('pointerup', () => this.scroll.handlePointerUp());

		this.app.ticker.add(() => {
			if (this.store.isMouseDown.value) return;

			if (Math.abs(Math.round(this.store.deltaX.value)) > 0) {
				this.store.scrollX.value += this.store.deltaX.value;
				this.store.deltaX.value = this.store.deltaX.value * 0.9;
			} else {
				this.store.deltaX.value = 0;
			}
		});

		effect(() => {
			this.store.scrollX.value;
			this.store.scrollY.value;
			this.store.tasks.value;
			this.store.visibleDays.value;
			this.store.headerData.value;
			this.store.selectedRowId.value;

			this.store.containerWidth.value;
			this.store.containerHeight.value;
			this.store.themeTrigger.value;

			this.app.stage.y = -this.store.scrollY.value;
			this.app.stage.x = this.store.scrollX.value;

			this.renderAll();
		});
	}

	public renderAll() {
		this.renderers.forEach((r) => r.render());
	}

	public destroy() {
		this.resizeObserver.disconnect();
		this.themeObserver?.disconnect();
		this.app.destroy(true, { children: true });
	}
}

```

### File: packages\charts\src\core\gantt\header-utils.ts

```ts
import { DateTime } from '@projective/types';

// #region Interfaces
export type HeaderUnit = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface HeaderTier {
	top: HeaderUnit;
	topStep: number;
	bottom: HeaderUnit;
	bottomStep: number;
	formatTop: (d: DateTime) => string;
	formatBottom: (d: DateTime) => string;
}

export interface HeaderBlock {
	key: string;
	label: string;
	x: number;
	width: number;
	date: DateTime;
}
// #endregion

// #region Helpers
function toPlural(unit: HeaderUnit): string {
	switch (unit) {
		case 'hour':
			return 'hours';
		case 'day':
			return 'days';
		case 'week':
			return 'weeks';
		case 'month':
			return 'months';
		case 'year':
			return 'years';
		case 'quarter':
			return 'months';
		default:
			return unit;
	}
}
// #endregion

// #region Configuration
export function getHeaderTier(visibleDays: number, containerWidth: number): HeaderTier {
	const pixelsPerDay = containerWidth / Math.max(1, visibleDays);

	// Reduced from 45. A two digit day ("24") only needs about 20-25px to render cleanly.
	const MIN_DAY_WIDTH = 25;

	if (pixelsPerDay >= 120) {
		const pixelsPerHour = pixelsPerDay / 24;
		const hourStepRaw = Math.ceil(MIN_DAY_WIDTH / pixelsPerHour);
		const validHourSteps = [1, 2, 3, 4, 6, 12];
		const hourStep = validHourSteps.find((s) => s >= hourStepRaw) || 12;

		return {
			top: 'day',
			topStep: 1,
			bottom: 'hour',
			bottomStep: hourStep,
			formatTop: (d) => d.toFormat('ddd d MMM yyyy'),
			formatBottom: (d) => d.toFormat('HH:mm'),
		};
	} else if (pixelsPerDay >= MIN_DAY_WIDTH) {
		// Single Days (If there is enough physical room, show every single day)
		return {
			top: 'month',
			topStep: 1,
			bottom: 'day',
			bottomStep: 1,
			formatTop: (d) => d.toFormat('MMMM yyyy'),
			formatBottom: (d) => d.toFormat('dd'),
		};
	} else {
		// Grouped Days
		const dayStepRaw = Math.ceil(MIN_DAY_WIDTH / pixelsPerDay);
		const validDaySteps = [2, 3, 4, 5, 7, 10, 14, 15];

		if (dayStepRaw <= 15) {
			const dayStep = validDaySteps.find((s) => s >= dayStepRaw) || 15;
			return {
				top: 'month',
				topStep: 1,
				bottom: 'day',
				bottomStep: dayStep,
				formatTop: (d) => d.toFormat('MMMM yyyy'),
				formatBottom: (d) => d.toFormat('dd'),
			};
		}

		// Months
		const pixelsPerMonth = pixelsPerDay * 30;
		if (pixelsPerMonth >= MIN_DAY_WIDTH) {
			const monthStepRaw = Math.ceil(MIN_DAY_WIDTH / pixelsPerMonth);
			const validMonthSteps = [1, 2, 3, 4, 6];
			const monthStep = validMonthSteps.find((s) => s >= monthStepRaw) || 6;

			return {
				top: 'year',
				topStep: 1,
				bottom: 'month',
				bottomStep: monthStep,
				formatTop: (d) => d.toFormat('yyyy'),
				formatBottom: (d) => d.toFormat('MMM'),
			};
		}

		// Quarters / Years
		return {
			top: 'year',
			topStep: 1,
			bottom: 'quarter',
			bottomStep: 1,
			formatTop: (d) => d.toFormat('yyyy'),
			formatBottom: (d) => `Q${Math.ceil((d.getMonth() + 1) / 3)}`,
		};
	}
}
// #endregion

// #region Generators
export function generateHeaderBlocks(
	start: DateTime,
	end: DateTime,
	unit: HeaderUnit,
	step: number,
	dateToX: (ms: number) => number,
): HeaderBlock[] {
	const blocks: HeaderBlock[] = [];

	// 1. ANCHOR TO EPOCH: Always snap to the absolute beginning of the relevant calendar unit.
	// This ensures that when scrolling, the math doesn't shift relative to the scrollbar.
	let current = new DateTime(new Date(start.getTime()));

	if (unit === 'hour') {
		current = current.startOf('day');
	} else if (unit === 'day') {
		current = current.startOf('month');
	} else if (unit === 'week') {
		const dayOfWeek = current.getDay();
		const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
		current = new DateTime(new Date(current.getTime() - diff * 86400000)).startOf('day');
	} else {
		current = current.startOf('year');
	}

	const startMs = start.getTime();
	const endTime = end.getTime();
	const pluralUnit = toPlural(unit);

	// 2. FAST FORWARD: Skip iterations until we reach the visible viewport
	let safety = 0;
	while (safety < 5000) {
		let next: DateTime;
		if (unit === 'quarter') {
			next = current.add(3 * step, 'months');
		} else {
			// @ts-ignore
			next = current.add(step, pluralUnit);
		}

		if (next.getTime() > startMs) break;

		current = next;
		safety++;
	}

	// 3. GENERATE RENDER BLOCKS
	safety = 0;
	while (current.getTime() < endTime && safety < 5000) {
		let next: DateTime;
		if (unit === 'quarter') {
			next = current.add(3 * step, 'months');
		} else {
			// @ts-ignore
			next = current.add(step, pluralUnit);
		}

		const xStart = dateToX(current.getTime());
		const xEnd = dateToX(next.getTime());

		if (xEnd > xStart) {
			blocks.push({
				key: `${unit}-${current.getTime()}`,
				label: '',
				x: xStart,
				width: xEnd - xStart,
				date: current.clone(),
			});
		}

		current = next;
		safety++;
	}

	return blocks;
}
// #endregion

```

### File: packages\charts\src\core\gantt\interaction\scroll.ts

```ts
import { GanttStore } from '../store.ts';

export class ScrollManager {
	private store: GanttStore;
	private readonly BOTTOM_BUFFER = 50;

	constructor(store: GanttStore) {
		this.store = store;
	}

	public handlePointerDown() {
		if (!this.store.canDrag.value) return;

		this.store.isMouseDown.value = true;
	}

	public handlePointerMove(x: number) {
		if (!this.store.isMouseDown.value) return;
		this.store.scrollX.value += x;
		this.store.deltaX.value = x;
	}

	public handlePointerUp() {
		this.store.isMouseDown.value = false;
	}

	public handleWheel(e: WheelEvent) {
		e.preventDefault();

		if (this.store.isShiftDown.value) {
			this.store.scrollX.value -= e.deltaY;
		} else {
			const currentY = this.store.scrollY.value;
			const delta = e.deltaY * 0.6;

			const contentHeight = this.store.contentHeight.value;
			const viewportHeight = this.store.containerHeight.value;

			const maxScrollY = Math.max(0, contentHeight - viewportHeight);

			let newY = currentY + delta;

			if (newY < 0) newY = 0;
			if (newY > maxScrollY) newY = maxScrollY;

			this.store.scrollY.value = newY;
		}
	}
}

```

### File: packages\charts\src\core\gantt\renderer\base-renderer.ts

```ts
import * as PIXI from 'pixi.js';
import { GanttStore } from '../store.ts';

/**
 * Base class for all Gantt canvas layers.
 */
export abstract class BaseRenderer {
	public container: PIXI.Container;
	protected store: GanttStore;

	constructor(store: GanttStore) {
		this.store = store;
		this.container = new PIXI.Container();
	}

	/**
	 * Called every frame or on state change to redraw the layer.
	 */
	abstract render(): void;

	/**
	 * Cleanup resources if necessary.
	 */
	public destroy(): void {
		this.container.destroy({ children: true });
	}
}

```

### File: packages\charts\src\core\gantt\renderer\grid-renderer.ts

```ts
import * as PIXI from 'pixi.js';
import { BaseRenderer } from './base-renderer.ts';
import { GanttStore } from '../store.ts';
import { getThemeColor } from '../../../utils/theme-bridge.ts';
import { DateTime } from '@projective/types';
import { generateHeaderBlocks, getHeaderTier } from '../header-utils.ts';

export class GridRenderer extends BaseRenderer {
	private graphics: PIXI.Graphics;

	constructor(store: GanttStore) {
		super(store);
		this.graphics = new PIXI.Graphics();
		this.container.addChild(this.graphics);
	}

	public render(): void {
		this.graphics.clear();

		const cPrimary = getThemeColor('--primary');
		const cSecondary = getThemeColor('--border-color');

		const currentX = this.store.scrollX.value;
		const width = this.store.containerWidth.value;
		const days = this.store.visibleDays.value;

		const buffer = 500;
		const renderStartX = -currentX - buffer;
		const renderEndX = -currentX + width + buffer;

		const startDate = new DateTime(new Date(this.store.timeScale.xToDate(renderStartX)));
		const endDate = new DateTime(new Date(this.store.timeScale.xToDate(renderEndX)));

		const tier = getHeaderTier(days, width);
		const dateToX = (t: number) => this.store.timeScale.dateToX(t);

		const topRows = generateHeaderBlocks(startDate, endDate, tier.top, tier.topStep, dateToX);
		const bottomRows = generateHeaderBlocks(
			startDate,
			endDate,
			tier.bottom,
			tier.bottomStep,
			dateToX,
		);

		// Calculate drawing boundaries relative to scroll to ensure lines reach bottom of viewport
		const startY = this.store.scrollY.value;
		const endY = startY + this.store.containerHeight.value;

		// Render secondary (bottom) vertical lines using standard border color
		this.graphics.beginPath();
		for (const block of bottomRows) {
			const x = block.x;
			this.graphics.moveTo(x, startY);
			this.graphics.lineTo(x, endY);
		}
		this.graphics.stroke({ width: 1, color: cSecondary, alpha: 0.3 });

		// Render primary (top) vertical lines using accent
		this.graphics.beginPath();
		for (const block of topRows) {
			const x = block.x;
			this.graphics.moveTo(x, startY);
			this.graphics.lineTo(x, endY);
		}
		this.graphics.stroke({ width: 1, color: cPrimary, alpha: 0.2 });
	}
}

```

### File: packages\charts\src\core\gantt\renderer\scroll-renderer.ts

```ts
import * as PIXI from 'pixi.js';
import { BaseRenderer } from './base-renderer.ts';
import { GanttStore } from '../store.ts';
import { getThemeColor } from '../../../utils/theme-bridge.ts';

export class ScrollRenderer extends BaseRenderer {
	private vThumb: PIXI.Graphics;
	private hThumb: PIXI.Graphics;

	private vHovered = false;
	private hHovered = false;

	// Dragging State
	private dragging = false;
	private activeThumb: 'v' | 'h' | null = null;
	private dragStartY = 0;
	private dragStartX = 0;
	private startScrollY = 0;
	private startScrollX = 0;

	// Dynamic Boundaries captured at the exact moment a drag starts
	private dragTotalWidth = 0;
	private dragMinX = 0;

	constructor(store: GanttStore) {
		super(store);

		this.vThumb = new PIXI.Graphics();
		this.vThumb.eventMode = 'static';
		this.vThumb.cursor = 'default';

		this.hThumb = new PIXI.Graphics();
		this.hThumb.eventMode = 'static';
		this.hThumb.cursor = 'default';

		this.bindInteraction();

		this.container.addChild(this.vThumb);
		this.container.addChild(this.hThumb);
	}

	private bindInteraction() {
		// Hover States (Communicates to Canvas to yield priority)
		this.vThumb.on('pointerenter', () => {
			this.vHovered = true;
			this.store.hoveredScrollbar.value = true;
			this.render();
		});
		this.vThumb.on('pointerleave', () => {
			this.vHovered = false;
			if (!this.hHovered && !this.dragging) this.store.hoveredScrollbar.value = false;
			this.render();
		});

		this.hThumb.on('pointerenter', () => {
			this.hHovered = true;
			this.store.hoveredScrollbar.value = true;
			this.render();
		});
		this.hThumb.on('pointerleave', () => {
			this.hHovered = false;
			if (!this.vHovered && !this.dragging) this.store.hoveredScrollbar.value = false;
			this.render();
		});

		// Start Vertical Drag
		this.vThumb.on('pointerdown', (e) => {
			this.dragging = true;
			this.activeThumb = 'v';
			this.dragStartY = e.client.y; // Use raw client pixels to match DOM window events
			this.startScrollY = this.store.scrollY.value;
			this.store.hoveredScrollbar.value = true;
		});

		// Start Horizontal Drag
		this.hThumb.on('pointerdown', (e) => {
			this.dragging = true;
			this.activeThumb = 'h';
			this.dragStartX = e.client.x;
			this.startScrollX = this.store.scrollX.value;
			this.store.hoveredScrollbar.value = true;

			// Snapshot the virtual boundaries so the scale doesn't warp while actively dragging
			const vWidth = this.store.containerWidth.value;
			const vLeft = -this.startScrollX;
			const timelineStartMs = this.store.timelineStart.value;

			let maxEndMs = timelineStartMs;
			this.store.tasks.value.forEach((t) => {
				if (t.endAt > maxEndMs) maxEndMs = t.endAt;
			});
			maxEndMs += 14 * 86400000;

			const dataStartX = this.store.timeScale.dateToX(timelineStartMs);
			const dataEndX = this.store.timeScale.dateToX(maxEndMs);

			this.dragMinX = Math.min(vLeft, dataStartX);
			const maxX = Math.max(vLeft + vWidth, dataEndX);
			this.dragTotalWidth = maxX - this.dragMinX;
		});

		// Bind move/up to the global window so we don't drop the drag if the cursor flies off the canvas
		globalThis.addEventListener('pointermove', this.onPointerMove);
		globalThis.addEventListener('pointerup', this.onPointerUp);
	}

	private onPointerMove = (e: PointerEvent) => {
		if (!this.dragging) return;

		if (this.activeThumb === 'v') {
			const vHeight = this.store.containerHeight.value;
			const cHeight = this.store.contentHeight.value;
			const maxScroll = Math.max(0, cHeight - vHeight);

			const margin = 4;
			const minThumbHeight = 40;
			const thumbHeight = Math.max((vHeight / cHeight) * vHeight, minThumbHeight);
			const maxThumbTravel = vHeight - thumbHeight - margin * 2;

			if (maxThumbTravel <= 0) return;

			const deltaY = e.clientY - this.dragStartY;
			const multiplier = maxScroll / maxThumbTravel;

			let newScroll = this.startScrollY + (deltaY * multiplier);
			newScroll = Math.max(0, Math.min(newScroll, maxScroll));

			this.store.scrollY.value = newScroll;
		} else if (this.activeThumb === 'h') {
			const vWidth = this.store.containerWidth.value;
			const margin = 4;
			const minThumbWidth = 40;

			const thumbWidth = Math.max((vWidth / this.dragTotalWidth) * vWidth, minThumbWidth);
			const maxThumbTravel = vWidth - thumbWidth - margin * 2;
			const maxScroll = this.dragTotalWidth - vWidth;

			if (maxThumbTravel <= 0) return;

			const deltaX = e.clientX - this.dragStartX;
			const multiplier = maxScroll / maxThumbTravel;

			const startVLeft = -this.startScrollX;
			let newVLeft = startVLeft + (deltaX * multiplier);

			newVLeft = Math.max(this.dragMinX, Math.min(newVLeft, this.dragMinX + maxScroll));

			// Store uses inverted scroll logic for canvas panning
			this.store.scrollX.value = -newVLeft;
		}
	};

	private onPointerUp = () => {
		if (this.dragging) {
			this.dragging = false;
			this.activeThumb = null;
			this.store.hoveredScrollbar.value = false;
			this.render();
		}
	};

	public render(): void {
		this.container.x = -this.store.scrollX.value;
		this.container.y = this.store.scrollY.value;

		this.renderVertical();
		this.renderHorizontal();
	}

	private renderVertical() {
		this.vThumb.clear();

		const vHeight = this.store.containerHeight.value;
		const cHeight = this.store.contentHeight.value;

		if (cHeight <= vHeight) return;

		const scrollY = this.store.scrollY.value;
		const maxScroll = cHeight - vHeight;

		const isHovering = this.vHovered || this.activeThumb === 'v';
		const width = isHovering ? 8 : 6;
		const margin = 4;

		const minThumbHeight = 40;
		const thumbHeight = Math.max((vHeight / cHeight) * vHeight, minThumbHeight);
		const scrollRatio = scrollY / maxScroll;

		const rawThumbY = margin + scrollRatio * (vHeight - thumbHeight - margin * 2);
		const thumbY = Math.max(margin, Math.min(rawThumbY, vHeight - thumbHeight - margin));
		const x = this.store.containerWidth.value - width - margin;

		const cTextMain = getThemeColor('--text-main');
		const alpha = isHovering ? 0.6 : 0.2;

		// Invisible fill allows hit detection on the hollow inside of the outline
		this.vThumb.roundRect(x, thumbY, width, thumbHeight, width / 2);
		this.vThumb.fill({ color: 0xffffff, alpha: 0.001 });
		this.vThumb.stroke({ width: 1.5, color: cTextMain, alpha });
	}

	private renderHorizontal() {
		this.hThumb.clear();

		const vWidth = this.store.containerWidth.value;
		const vLeft = -this.store.scrollX.value;
		const vRight = vLeft + vWidth;

		const timelineStartMs = this.store.timelineStart.value;
		let maxEndMs = timelineStartMs;
		this.store.tasks.value.forEach((t) => {
			if (t.endAt > maxEndMs) maxEndMs = t.endAt;
		});
		maxEndMs += 14 * 86400000;

		const dataStartX = this.store.timeScale.dateToX(timelineStartMs);
		const dataEndX = this.store.timeScale.dateToX(maxEndMs);

		const minX = Math.min(vLeft, dataStartX);
		const maxX = Math.max(vRight, dataEndX);
		const totalWidth = maxX - minX;

		if (totalWidth <= vWidth + 1) return;

		const isHovering = this.hHovered || this.activeThumb === 'h';
		const height = isHovering ? 8 : 6;
		const margin = 4;

		const minThumbWidth = 40;
		const thumbWidth = Math.max((vWidth / totalWidth) * vWidth, minThumbWidth);

		const scrollRatio = (vLeft - minX) / (totalWidth - vWidth);
		const rawThumbX = margin + scrollRatio * (vWidth - thumbWidth - margin * 2);
		const thumbX = Math.max(margin, Math.min(rawThumbX, vWidth - thumbWidth - margin));

		const y = this.store.containerHeight.value - height - margin;

		const cTextMain = getThemeColor('--text-main');
		const alpha = isHovering ? 0.6 : 0.2;

		// Invisible fill allows hit detection on the hollow inside of the outline
		this.hThumb.roundRect(thumbX, y, thumbWidth, height, height / 2);
		this.hThumb.fill({ color: 0xffffff, alpha: 0.001 });
		this.hThumb.stroke({ width: 1.5, color: cTextMain, alpha });
	}

	public override destroy() {
		super.destroy();
		globalThis.removeEventListener('pointermove', this.onPointerMove);
		globalThis.removeEventListener('pointerup', this.onPointerUp);
	}
}

```

### File: packages\charts\src\core\gantt\renderer\task-renderer.ts

```ts
// deno-lint-ignore-file no-explicit-any
import * as PIXI from 'pixi.js';
import { BaseRenderer } from './base-renderer.ts';
import { GanttStore } from '../store.ts';
import { DateTime } from '@projective/types';
import { getThemeColor } from '../../../utils/theme-bridge.ts';
import { GanttTask } from '../../../types/gantt.ts';

export class TaskRenderer extends BaseRenderer {
	constructor(store: GanttStore) {
		super(store);
	}

	public render(): void {
		this.container.removeChildren();

		const tasks = this.store.tasks.value;
		const rows = [...this.store.rows.value].sort((a, b) => a.orderIndex - b.orderIndex);
		const rowHeight = this.store.rowHeight.value;

		const rowMap = new Map<string, number>();
		rows.forEach((row, index) => rowMap.set(row.id, index));

		const cBg = getThemeColor('--bg');
		const cAccent = getThemeColor('--primary');
		const cTextMain = getThemeColor('--text-main');
		const cTextMuted = getThemeColor('--text-muted');
		const cMilestone = getThemeColor('--warning');

		const titleStyle = new PIXI.TextStyle({
			fontFamily: 'Inter, system-ui, sans-serif',
			fontSize: 12,
			fill: cTextMain,
			fontWeight: '600',
		});

		const dateStyle = new PIXI.TextStyle({
			fontFamily: 'Inter, system-ui, sans-serif',
			fontSize: 10,
			fill: cTextMuted,
			fontWeight: '500',
		});

		for (const task of tasks) {
			const rowIndex = rowMap.get(task.rowId);
			if (rowIndex === undefined) continue;

			const coords = this.store.getTaskCoordinates(task);
			const safeWidth = Math.min(Math.max(coords.width, 2), 16000);

			const margin = 12;
			const barHeight = rowHeight - (margin * 2);
			const y = (rowIndex * rowHeight) + margin;

			const isSelected = task.rowId === this.store.selectedRowId.value;

			if (task.isMilestone) {
				this.renderMilestone(task, isSelected, coords.x, y, barHeight, {
					cBg,
					cMilestone,
					cAccent,
				});
			} else {
				this.renderTaskBar(
					task,
					isSelected,
					coords.x,
					safeWidth,
					y,
					barHeight,
					{ cAccent },
					{ titleStyle, dateStyle },
				);
			}
		}
	}

	private renderTaskBar(
		task: GanttTask,
		isSelected: boolean,
		x: number,
		width: number,
		y: number,
		height: number,
		colors: { cAccent: number },
		styles: { titleStyle: PIXI.TextStyle; dateStyle: PIXI.TextStyle },
	): void {
		const group = new PIXI.Container();
		group.x = x;
		group.y = y;

		const bg = new PIXI.Graphics();
		const radius = 4;

		const strokeAlpha = isSelected ? 1 : 0.4;
		const strokeWidth = isSelected ? 2 : 1;

		bg.roundRect(0, 0, width, height, radius);
		bg.fill({ color: colors.cAccent, alpha: 0.15 });
		bg.stroke({ width: strokeWidth, color: colors.cAccent, alpha: strokeAlpha });

		bg.beginPath();
		bg.roundRect(0, 0, 4, height, radius);
		bg.fill({ color: colors.cAccent, alpha: 1 });

		group.addChild(bg);

		const textPadX = 12;
		if (width > 40) {
			const title = new PIXI.Text({ text: task.name, style: styles.titleStyle });
			title.x = textPadX;
			title.y = 5;
			group.addChild(title);
		}

		if (width > 120) {
			const dateStr = `${new DateTime(new Date(task.startAt)).toFormat('dd/MM')} - ${
				new DateTime(new Date(task.endAt)).toFormat('dd/MM')
			}`;
			const dateText = new PIXI.Text({ text: dateStr, style: styles.dateStyle });
			dateText.x = textPadX;
			dateText.y = 20;
			group.addChild(dateText);
		}

		this.bindInteraction(group, task);
		this.container.addChild(group);
	}

	private renderMilestone(
		task: GanttTask,
		isSelected: boolean,
		x: number,
		y: number,
		size: number,
		colors: { cBg: number; cMilestone: number; cAccent: number },
	): void {
		const graphics = new PIXI.Graphics();

		const centerX = x;
		const centerY = y + size / 2;
		const diamondRadius = 10;

		graphics.beginPath();
		graphics.moveTo(centerX, centerY - diamondRadius);
		graphics.lineTo(centerX + diamondRadius, centerY);
		graphics.lineTo(centerX, centerY + diamondRadius);
		graphics.lineTo(centerX - diamondRadius, centerY);
		graphics.closePath();

		graphics.fill({ color: colors.cMilestone, alpha: 1 });

		const strokeColor = isSelected ? colors.cAccent : colors.cBg;
		graphics.stroke({ width: 3, color: strokeColor, alpha: 1 });

		this.bindInteraction(graphics, task);
		this.container.addChild(graphics);
	}

	private bindInteraction(element: PIXI.Container, task: GanttTask) {
		element.eventMode = 'static';
		element.cursor = 'pointer';

		element.on('pointerenter', (e) => {
			this.store.hoveredTask.value = task;
			this.store.pointerPos.value = { x: e.global.x, y: e.global.y };
		});

		element.on('pointermove', (e) => {
			if (this.store.hoveredTask.value?.id === task.id) {
				this.store.pointerPos.value = { x: e.global.x, y: e.global.y };
			}
		});

		element.on('pointerleave', () => {
			this.store.hoveredTask.value = null;
		});

		element.on('pointerdown', () => {
			this.store.selectRow(task.rowId);
		});
	}
}

```

### File: packages\charts\src\core\gantt\store.ts

```ts
import { DateTime } from '@projective/types';
import { batch, computed, type Signal, signal } from '@preact/signals';
import { GanttTimeScale } from './time-scale.ts';
import {
	generateHeaderBlocks,
	getHeaderTier,
	type HeaderBlock,
	type HeaderTier,
} from './header-utils.ts';
import type { DependencyLink, GanttRow, GanttTask } from '../../types/gantt.ts';

export interface GanttStoreOptions {
	visibleWidth: number;
	visibleHeight: number;
	startDate: number;
	endDate?: number;
}

export interface HeaderData {
	topRows: HeaderBlock[];
	bottomRows: HeaderBlock[];
	tier: HeaderTier;
	totalWidth: number;
}

export class GanttStore {
	public rows: Signal<GanttRow[]>;
	public tasks: Signal<GanttTask[]>;
	public dependencies: Signal<DependencyLink[]>;

	public visibleDays: Signal<number>;

	public scrollX: Signal<number>;
	public scrollY: Signal<number>;
	public deltaX: Signal<number>;
	public canDrag: Signal<boolean>;

	public isMouseDown: Signal<boolean>;
	public isShiftDown: Signal<boolean>;

	// Hover & Tooltip State
	public hoveredTask: Signal<GanttTask | null>;
	public pointerPos: Signal<{ x: number; y: number }>;

	// Interaction Overrides
	public hoveredScrollbar: Signal<boolean>;

	// Selection State
	public selectedRowId: Signal<string | null>;
	public onRowSelect?: (rowId: string) => void;

	public containerWidth: Signal<number>;
	public containerHeight: Signal<number>;

	public rowHeight: Signal<number>;
	public rowGap: Signal<number>;

	public timelineStart: Signal<number>;
	public timeScale: GanttTimeScale;

	public themeTrigger: Signal<number>;

	constructor(options: GanttStoreOptions) {
		this.rows = signal([]);
		this.tasks = signal([]);
		this.dependencies = signal([]);

		this.visibleDays = signal(30);
		this.scrollX = signal(0);
		this.scrollY = signal(0);
		this.deltaX = signal(0);
		this.canDrag = signal(true);

		this.isMouseDown = signal(false);
		this.isShiftDown = signal(false);

		this.hoveredTask = signal(null);
		this.pointerPos = signal({ x: 0, y: 0 });
		this.hoveredScrollbar = signal(false);

		this.selectedRowId = signal(null);

		this.containerWidth = signal(options.visibleWidth);
		this.containerHeight = signal(options.visibleHeight);

		this.rowHeight = signal(60);
		this.rowGap = signal(40);
		this.themeTrigger = signal(0);

		this.timelineStart = signal(options.startDate);

		this.timeScale = new GanttTimeScale({
			visibleDays: this.visibleDays.value,
			width: options.visibleWidth,
			startDate: options.startDate,
		});
	}

	public selectRow(rowId: string) {
		this.selectedRowId.value = rowId;
		if (this.onRowSelect) {
			this.onRowSelect(rowId);
		}
	}

	public contentHeight = computed(() => {
		return this.rows.value.length * this.rowHeight.value;
	});

	public loadData(rows: GanttRow[], tasks: GanttTask[], links: DependencyLink[]) {
		batch(() => {
			this.rows.value = rows;
			this.tasks.value = tasks;
			this.dependencies.value = links;
		});
	}

	public resize(width: number, height: number) {
		this.timeScale.update(this.visibleDays.value, width, this.timelineStart.value);
		batch(() => {
			this.containerWidth.value = width;
			this.containerHeight.value = height;
		});
	}

	public setVisibleDays(days: number) {
		const validDays = Math.max(1, days);
		this.timeScale.update(validDays, this.containerWidth.value, this.timelineStart.value);
		this.visibleDays.value = validDays;
	}

	public setStartDate(start: number) {
		this.timeScale.update(this.visibleDays.value, this.containerWidth.value, start);
		this.timelineStart.value = start;
	}

	public getTaskCoordinates(task: GanttTask): { x: number; width: number } {
		const x1 = this.timeScale.dateToX(task.startAt);
		const x2 = this.timeScale.dateToX(task.endAt);
		return { x: x1, width: Math.max(x2 - x1, 2) };
	}

	public headerData = computed<HeaderData>(() => {
		const days = this.visibleDays.value;
		const width = this.containerWidth.value;
		const startMs = this.timelineStart.value;

		const tier = getHeaderTier(days, width);

		const startDT = new DateTime(new Date(startMs));
		const endDT = startDT.add(days, 'days').endOf('day');

		this.timeScale.update(days, width, startMs);
		const dateToX = (t: number) => this.timeScale.dateToX(t);

		const topRows = generateHeaderBlocks(startDT, endDT, tier.top, tier.topStep, dateToX);
		const bottomRows = generateHeaderBlocks(startDT, endDT, tier.bottom, tier.bottomStep, dateToX);

		return {
			topRows,
			bottomRows,
			tier,
			totalWidth: width,
		};
	});
}

```

### File: packages\charts\src\core\gantt\time-scale.ts

```ts
import { DateTime } from '@projective/types';

// #region Interfaces

export interface TimeScaleConfig {
	visibleDays: number;
	width: number;
	startDate: number; // Timestamp
}

// #endregion

/**
 * Manages the "Time Domain" -> "Pixel Range" mapping.
 * Calculates coordinates based on a specific number of visible days.
 */
export class GanttTimeScale {
	private _visibleDays: number;
	private _width: number;
	private _start: number;
	private _msPerPixel: number;

	constructor(config: TimeScaleConfig) {
		this._visibleDays = config.visibleDays;
		this._width = config.width;
		this._start = config.startDate;

		this._msPerPixel = this.calculateRatio();
	}

	/**
	 * Recalculates the ratio of milliseconds per pixel.
	 * Total MS in View / Total Pixels
	 */
	private calculateRatio(): number {
		const totalMs = this._visibleDays * 86400000; // days * 24 * 60 * 60 * 1000
		return totalMs / (this._width || 1);
	}

	/**
	 * Updates the configuration and recalculates ratio.
	 */
	public update(visibleDays: number, width: number, startDate: number) {
		this._visibleDays = visibleDays;
		this._width = width;
		this._start = startDate;
		this._msPerPixel = this.calculateRatio();
	}

	/**
	 * Converts a timestamp to a generic X pixel coordinate.
	 * @param date Timestamp in ms
	 */
	public dateToX(date: number): number {
		const diffMs = date - this._start;
		return diffMs / this._msPerPixel;
	}

	/**
	 * Converts an X pixel coordinate back to a timestamp.
	 * @param x Pixel coordinate
	 */
	public xToDate(x: number): number {
		const msToAdd = x * this._msPerPixel;
		return this._start + msToAdd;
	}

	/**
	 * Returns the Date object for the right-most edge of the view.
	 */
	public getEndDate(): DateTime {
		const start = new DateTime(new Date(this._start));
		return start.add(this._visibleDays, 'days');
	}

	/**
	 * Returns the visible width of a single day in pixels.
	 */
	public getDayWidth(): number {
		return this._width / this._visibleDays;
	}
}

```

### File: packages\charts\src\types\gantt.ts

```ts
import { z } from 'zod';

// #region 1. Enums & Constants

/**
 * Defines the granularity of the timeline view.
 */
export enum ZoomLevel {
	Hour = 'hour',
	Day = 'day',
	Week = 'week',
	Month = 'month',
	Quarter = 'quarter',
	Year = 'year',
}

/**
 * Defines the relationship type between two tasks.
 */
export enum DependencyType {
	FS = 'FS',
	SS = 'SS',
	FF = 'FF',
	SF = 'SF',
}

/**
 * Visual style of the row in the left grid.
 */
export enum RowType {
	Task = 'task',
	Group = 'group',
	Milestone = 'milestone',
	Divider = 'divider',
}

// #endregion

// #region 2. Zod Schemas

/**
 * Schema for a visual dependency link between tasks.
 * Corrected nativeEnum to avoid deprecated signature.
 */
export const DependencyLinkSchema = z.object({
	id: z.uuid(),
	fromTaskId: z.uuid(),
	toTaskId: z.uuid(),
	type: z.nativeEnum(DependencyType).default(DependencyType.FS),
	lagMs: z.number().default(0),
	style: z.record(z.string(), z.string()).optional(), // Fixed: Explicit key and value types
});

/**
 * Schema for a specific marker (vertical line, flag, etc.).
 */
export const MarkerSchema = z.object({
	id: z.uuid(),
	type: z.enum(['verticalLine', 'point', 'range', 'flag']),
	scope: z.enum(['global', 'row', 'task']),
	at: z.number().optional(), // Timestamp
	startAt: z.number().optional(), // For ranges
	endAt: z.number().optional(), // For ranges
	label: z.string(),
	color: z.string().optional(),
});

/**
 * Schema for a task rendered as a bar on the timeline.
 */
export const GanttTaskSchema = z.object({
	id: z.uuid(),
	rowId: z.uuid(),
	name: z.string(),
	startAt: z.number(), // Timestamp (ms)
	endAt: z.number(), // Timestamp (ms)
	progress: z.number().min(0).max(100).default(0),
	status: z.string().default('todo'),
	assignees: z.array(z.string()).default([]), // User IDs

	// Relationships
	dependencies: z.array(z.uuid()).default([]), // IDs of DependencyLinks

	// Configuration
	isMilestone: z.boolean().default(false),
	baseline: z.object({
		startAt: z.number(),
		endAt: z.number(),
	}).optional(),

	// Constraints & Metadata
	constraints: z.object({
		lockStart: z.boolean().optional(),
		lockEnd: z.boolean().optional(),
		allowMove: z.boolean().default(true),
		allowResize: z.boolean().default(true),
	}).optional(),
	meta: z.record(z.string(), z.any()).default({}), // Fixed: Explicit key and value types
});

/**
 * Schema for a row in the "Left Table".
 */
export const GanttRowSchema = z.object({
	id: z.uuid(),
	type: z.enum(RowType).default(RowType.Task),
	parentId: z.uuid().nullable().optional(),
	orderIndex: z.number(),
	collapsed: z.boolean().default(false),

	// Display Fields
	label: z.string(),
	height: z.number().optional(),
	style: z.record(z.string(), z.string()).optional(), // Fixed: Explicit key and value types

	// Data Payload (Projective specific)
	data: z.record(z.string(), z.any()).default({}), // Fixed: Explicit key and value types
});

/**
 * Schema for the Project context.
 */
export const GanttProjectSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	timezone: z.string().default('UTC'),
	workingDays: z.array(z.number()).default([1, 2, 3, 4, 5]), // Mon-Fri
	holidays: z.array(z.number()).default([]), // Array of timestamps
});

// #endregion

// #region 3. TypeScript Interfaces

export type DependencyLink = z.infer<typeof DependencyLinkSchema>;
export type GanttMarker = z.infer<typeof MarkerSchema>;
export type GanttTask = z.infer<typeof GanttTaskSchema>;
export type GanttRow = z.infer<typeof GanttRowSchema>;
export type GanttProject = z.infer<typeof GanttProjectSchema>;

// #endregion

```

### File: packages\charts\src\utils\theme-bridge.ts

```ts
/**
 * Global cache to prevent DOM thrashing during 60FPS PIXI renders.
 * Keys are formatted as `${themeMode}:${varName}` to support dynamic theme toggling.
 */
const colorCache = new Map<string, number>();

/**
 * Resolves a CSS variable (e.g., "--primary") to a Hex number (0xffffff).
 * Uses a hidden DOM element to force the browser to evaluate nested var() and calc()
 * statements, safely converting them into absolute RGB values.
 */
export function getThemeColor(varName: string): number {
	if (typeof window === 'undefined') return 0x000000;

	// Determine current theme to invalidate cache correctly if user switches to Dark Mode
	const theme = document.documentElement.getAttribute('data-theme') || 'light';
	const cacheKey = `${theme}:${varName}`;

	if (colorCache.has(cacheKey)) {
		return colorCache.get(cacheKey)!;
	}

	// Create a temporary element to force browser CSS evaluation
	const tempEl = document.createElement('div');
	tempEl.style.color = `var(${varName})`;
	tempEl.style.display = 'none';
	document.body.appendChild(tempEl);

	// The browser automatically resolves hsl() and var() into standard rgb() format for the 'color' property
	const computedColor = getComputedStyle(tempEl).color;

	// Cleanup
	document.body.removeChild(tempEl);

	let result = 0x22d3ee; // Default cyan fallback

	// Parse the clean rgb(r, g, b) string
	if (computedColor.startsWith('rgb')) {
		const match = computedColor.match(/\d+/g);
		if (match && match.length >= 3) {
			const [r, g, b] = match.map(Number);
			result = (r << 16) + (g << 8) + b;
		}
	}

	// Cache the hex value so subsequent render frames are instant
	colorCache.set(cacheKey, result);

	return result;
}

```

