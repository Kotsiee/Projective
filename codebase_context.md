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
  gantt-header.css
  gantt-task-card.css
  gantt-task-list.css
  gantt-timeline.css
  gantt.css
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
import { useComputed } from '@preact/signals';
import { GanttStore } from '../../core/gantt/store.ts';
import { GanttHeader } from './GanttHeader.tsx';
import { GanttTimeline } from './GanttTimeline.tsx';
import { GanttTaskList } from './GanttTaskList.tsx';
import { useEffect } from 'preact/hooks';

export default function GanttChart({ initialData }: any) {
	const store = new GanttStore({
		visibleWidth: 1000,
		startDate: Date.now() - (7 * 24 * 60 * 60 * 1000),
		endDate: Date.now() + (21 * 24 * 60 * 60 * 1000),
	});

	store.loadData(initialData.rows, initialData.tasks, initialData.dependencies);

	useEffect(() => {
		console.log(store);
	});

	return (
		<div className='gantt-chart'>
			<div class='gantt-controls'>
				<GanttHeader store={store} />
			</div>
			<div class='gantt-body'>
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
import { Button, ButtonGroup, IconButton } from '@projective/ui';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';
import { DateTime } from '@projective/types';

interface GanttHeaderProps {
	store: GanttStore;
}

export function GanttHeader({ store }: GanttHeaderProps) {
	const dateLabel = useComputed(() => {
		const x = store.scrollX.value;
		const days = store.visibleDays.value;

		const startMs = store.timeScale.xToDate(x);
		const startDt = new DateTime(new Date(startMs));

		const endDt = startDt.add(days, 'days');

		return `${startDt.toFormat('dd MMM')} - ${endDt.toFormat('dd MMM')}`;
	});

	const handleNav = (direction: -1 | 1) => {
		const shift = (store.containerWidth.value / 4) * direction;
		store.scrollX.value += shift;
	};

	return (
		<div class='gantt-header'>
			<div class='gantt-header__spacer'>
				<ButtonGroup>
					<Button
						variant={store.visibleDays.value === 7 ? 'primary' : 'secondary'}
						onClick={() => store.setVisibleDays(7)}
					>
						Week
					</Button>
					<Button
						variant={store.visibleDays.value === 30 ? 'primary' : 'secondary'}
						onClick={() => store.setVisibleDays(30)}
					>
						Month
					</Button>
				</ButtonGroup>
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
					{dateLabel}
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

```

### File: packages\charts\src\components\gantt\GanttTaskCard.tsx

```tsx
import { GanttRow } from '../../types/gantt.ts';
import { IconGripVertical } from '@tabler/icons-preact';
import { GanttStore } from './../../core/gantt/store.ts';

interface GanttTaskCardProps {
	row: GanttRow;
	isActive?: boolean;
	store: GanttStore;
}

export function GanttTaskCard({ row, isActive, store }: GanttTaskCardProps) {
	return (
		<div
			class='gantt-task-card__container'
			data-active={isActive}
			style={`--task-height: ${store.rowHeight.value}px`}
		>
			<div class='gantt-task-card' data-active={isActive}>
				<div class='gantt-task-card__grip'>
					<IconGripVertical size={18} />
				</div>

				<div class='gantt-task-card__content'>
					<div>
						<h4 class='gantt-task-card__title'>{row.label}</h4>
					</div>

					<div class='gantt-task-card__meta'>
						<span class='gantt-task-card__type'>
							{row.type}
						</span>
						<span class='gantt-task-card__date'>
							27/02/25 - 04/03/25
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

	// 1. Isolate the index calculation so we ONLY trigger a re-render
	// when the user scrolls past a full row boundary.
	const startIndex = useComputed(() => {
		return Math.floor(store.scrollY.value / store.rowHeight.value);
	});

	// 2. React to the index, not the raw scroll pixels.
	// This stops Preact from thrashing/re-rendering 60 times a second.
	const visibleRows = useComputed(() => {
		const start = startIndex.value;
		const end = start + 15;

		return [...store.rows.value]
			.sort((a, b) => a.orderIndex - b.orderIndex)
			.slice(start, end);
	});

	// 3. Hardware-accelerated DOM update bypassing the Preact render cycle.
	// This matches your PIXI canvas scroll perfectly.
	useEffect(() => {
		const dispose = effect(() => {
			if (tasksRef.current) {
				const offset = store.scrollY.value % store.rowHeight.value;
				tasksRef.current.style.transform = `translateY(-${offset}px)`;
			}
		});

		return () => dispose();
	}, [store]);

	// Handle wheel events directly on the list
	const handleWheel = (e: WheelEvent) => {
		e.preventDefault();

		const currentY = store.scrollY.value;
		const delta = e.deltaY * 0.6; // Matches friction in scroll.ts

		const contentHeight = store.contentHeight.value;
		const viewportHeight = store.containerHeight.value;
		const maxScrollY = Math.max(0, contentHeight - viewportHeight + 50);

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

```

### File: packages\charts\src\components\gantt\GanttTimeline.tsx

```tsx
import { useEffect, useRef } from 'preact/hooks';
import { effect, useComputed } from '@preact/signals';
import { GanttStore } from '../../core/gantt/store.ts';
import { GanttManager } from '../../core/gantt/gantt-manager.ts';
import { generateHeaderBlocks, getHeaderTier } from '../../core/gantt/header-utils.ts';
import { DateTime } from '@projective/types';
import '../../styles/gantt/gantt-timeline.css';

interface GanttTimelineProps {
	store: GanttStore;
}

const VIRTUAL_OFFSET = 5000000;

export function GanttTimeline({ store }: GanttTimelineProps) {
	const canvasRootRef = useRef<HTMLDivElement>(null);
	const headerScrollRef = useRef<HTMLDivElement>(null);
	const ganttManager = useRef<GanttManager | null>(null);

	useEffect(() => {
		if (canvasRootRef.current && !ganttManager.current) {
			ganttManager.current = new GanttManager(canvasRootRef.current, store);
		}

		const dispose = effect(() => {
			const x = store.scrollX.value;

			const targetLeft = VIRTUAL_OFFSET - x;

			if (headerScrollRef.current) {
				if (Math.abs(headerScrollRef.current.scrollLeft - targetLeft) > 1) {
					headerScrollRef.current.scrollLeft = targetLeft;
				}
			}
		});

		return () => {
			dispose();
			ganttManager.current?.destroy();
			ganttManager.current = null;
		};
	}, []);

	const onScroll = (e: Event) => {
		const target = e.target as HTMLDivElement;

		const newX = VIRTUAL_OFFSET - target.scrollLeft;

		if (Math.abs(store.scrollX.value - newX) > 1) {
			store.scrollX.value = newX;
		}
	};

	const dynamicHeaders = useComputed(() => {
		const currentX = store.scrollX.value;
		const width = store.containerWidth.value;
		const days = store.visibleDays.value;

		const buffer = 2000;
		const renderStartX = -currentX - buffer;
		const renderEndX = -currentX + width + buffer;

		const startDate = new DateTime(new Date(store.timeScale.xToDate(renderStartX)));
		const endDate = new DateTime(new Date(store.timeScale.xToDate(renderEndX)));

		const tier = getHeaderTier(days);
		const dateToX = (t: number) => store.timeScale.dateToX(t);

		const topRows = generateHeaderBlocks(startDate, endDate, tier.top, dateToX);
		const bottomRows = generateHeaderBlocks(startDate, endDate, tier.bottom, dateToX);

		return {
			topRows,
			bottomRows,
			tier,

			totalWidth: VIRTUAL_OFFSET * 2,
		};
	});

	const renderBlock = (block: any, content: string, isTop: boolean) => {
		const domLeft = VIRTUAL_OFFSET + block.x;

		return (
			<div
				key={block.key}
				class='gantt-time-block'
				style={{
					left: `${domLeft}px`,
					width: `${block.width}px`,
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
		<section class='gantt-timeline'>
			<div
				class='gantt-timeline__header'
				ref={headerScrollRef}
				onScroll={onScroll}
			>
				<div
					class='gantt-header-content'
					style={{ width: `${header.totalWidth}px` }}
				>
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

			<div class='gantt-timeline__viewport'>
				<div
					class='gantt-timeline__canvas'
					ref={canvasRootRef}
				/>
			</div>
		</section>
	);
}

```

### File: packages\charts\src\core\gantt\gantt-manager.ts

```ts
import { effect } from '@preact/signals';
import { TaskRenderer } from './renderer/task-renderer.ts';
import { GridRenderer } from './renderer/grid-renderer.ts';
import { GanttStore } from './store.ts';
import * as PIXI from 'pixi.js';
import { ScrollManager } from './interaction/scroll.ts';

export class GanttManager {
	private app: PIXI.Application;
	private store: GanttStore;
	private scroll: ScrollManager;
	private renderers: any[] = [];
	private resizeObserver: ResizeObserver;

	constructor(container: HTMLElement, store: GanttStore) {
		this.store = store;
		this.app = new PIXI.Application();
		this.scroll = new ScrollManager(this.store);

		this.resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				this.store.resize(width, height);
			}
		});

		this.init(container);
	}

	private async init(container: HTMLElement) {
		await this.app.init({
			resizeTo: container,
			backgroundAlpha: 0,
			antialias: true,
			resolution: globalThis.devicePixelRatio || 1,
			autoDensity: true,
		});

		container.appendChild(this.app.canvas);

		this.resizeObserver.observe(container);

		const rect = container.getBoundingClientRect();
		this.store.resize(rect.width, rect.height);

		const grid = new GridRenderer(this.store);
		const tasks = new TaskRenderer(this.store);

		this.app.stage.addChild(grid.container);
		this.app.stage.addChild(tasks.container);

		this.renderers.push(grid);
		this.renderers.push(tasks);

		this.app.canvas.addEventListener('pointerdown', (e) => {
			this.scroll.handlePointerDown();
		});

		this.app.canvas.addEventListener('wheel', (e) => {
			this.store.isShiftDown.value = e.shiftKey;
			this.scroll.handleWheel(e);
		});

		globalThis.addEventListener('pointermove', (e) => {
			this.scroll.handlePointerMove(e.movementX);
		});

		globalThis.addEventListener('pointerup', () => {
			this.scroll.handlePointerUp();
		});

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
			this.store.containerHeight.value;

			this.app.stage.y = -this.store.scrollY.value;
			this.app.stage.x = this.store.scrollX.value;

			console.log(this.store.scrollY.value);

			this.renderAll();
		});
	}

	public renderAll() {
		this.renderers.forEach((r) => r.render());
	}

	public destroy() {
		this.resizeObserver.disconnect();
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
	bottom: HeaderUnit;
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

export function getHeaderTier(visibleDays: number): HeaderTier {
	if (visibleDays <= 3) {
		return {
			top: 'day',
			bottom: 'hour',
			formatTop: (d) => d.toFormat('ddd d MMM yyyy'),
			formatBottom: (d) => d.toFormat('HH:mm'),
		};
	} else if (visibleDays <= 14) {
		return {
			top: 'month',
			bottom: 'day',
			formatTop: (d) => d.toFormat('MMMM yyyy'),
			formatBottom: (d) => d.toFormat('dd'),
		};
	} else if (visibleDays <= 45) {
		return {
			top: 'month',
			bottom: 'day',
			formatTop: (d) => d.toFormat('MMMM yyyy'),
			formatBottom: (d) => d.toFormat('dd'),
		};
	} else if (visibleDays <= 365) {
		return {
			top: 'year',
			bottom: 'month',
			formatTop: (d) => d.toFormat('yyyy'),
			formatBottom: (d) => d.toFormat('MMM'),
		};
	} else {
		return {
			top: 'year',
			bottom: 'quarter',
			formatTop: (d) => d.toFormat('yyyy'),
			formatBottom: (d) => `Q${Math.ceil(d.getMonth() / 3)}`,
		};
	}
}

// #endregion

// #region Generators

export function generateHeaderBlocks(
	start: DateTime,
	end: DateTime,
	unit: HeaderUnit,
	dateToX: (ms: number) => number,
): HeaderBlock[] {
	const blocks: HeaderBlock[] = [];
	// Always start at the beginning of the unit (e.g., Feb 1st)
	// even if the view starts at Feb 25th.
	let current = start.startOf(unit === 'quarter' ? 'month' : unit);
	const endTime = end.getTime();
	const pluralUnit = toPlural(unit);

	let safety = 0;
	while (current.getTime() < endTime && safety < 5000) {
		let next: DateTime;
		if (unit === 'quarter') {
			next = current.add(3, 'months');
		} else {
			next = current.add(1, pluralUnit);
		}

		const xStart = dateToX(current.getTime());
		const xEnd = dateToX(next.getTime());

		// Important: We allow xStart to be negative here (e.g. Feb 1st is before Feb 25th).
		// The renderer will handle the clamping to ensure the text stays visible.
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
	private readonly BOTTOM_BUFFER = 50; // Extra space at bottom in px

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

			const maxScrollY = Math.max(0, contentHeight - viewportHeight + this.BOTTOM_BUFFER);

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
		const cSecondary = getThemeColor('--card-light');

		const header = this.store.headerData.value;
		const totalHeight = Math.max(
			this.store.rows.value.length * this.store.rowHeight.value,
			this.store.containerWidth.value / 2,
		);

		this.graphics.context.beginPath();
		for (const block of header.bottomRows) {
			const x = block.x;

			this.graphics.context.moveTo(x, 0);
			this.graphics.context.lineTo(x, totalHeight);
		}
		this.graphics.context.stroke({ width: 1, color: cSecondary, alpha: 1 });
		this.graphics.context.closePath();

		this.graphics.context.beginPath();
		for (const block of header.topRows) {
			const x = block.x;
			this.graphics.context.moveTo(x, 0);
			this.graphics.context.lineTo(x, totalHeight);
		}
		this.graphics.context.stroke({ width: 1, color: cPrimary, alpha: 1 });
		this.graphics.context.closePath();

		// this.renderHorizonal();
	}

	private renderHorizonal() {
		this.graphics.context.beginPath();

		for (const row of this.store.rows.value) {
			const y = row.orderIndex * this.store.rowHeight.value;
			this.graphics.context.moveTo(0, y);
			this.graphics.context.lineTo(this.store.containerWidth.value, y);
		}

		this.graphics.context.stroke({ width: 1, color: 0x0000ff, alpha: 1 });
	}
}

```

### File: packages\charts\src\core\gantt\renderer\scroll-renderer.ts

```ts
import * as PIXI from 'pixi.js';
import { BaseRenderer } from './base-renderer.ts';
import { GanttStore } from '../store.ts';

export class GridRenderer extends BaseRenderer {
	private graphics: PIXI.Graphics;

	constructor(store: GanttStore) {
		super(store);
		this.graphics = new PIXI.Graphics();
		this.container.addChild(this.graphics);
	}

	public render(): void {
	}

	private renderVertical() {
	}

	private renderHorizonal() {
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

export class TaskRenderer extends BaseRenderer {
	constructor(store: GanttStore) {
		super(store);
	}

	public render(): void {
		this.container.removeChildren();

		const tasks = this.store.tasks.value;
		const rows = this.store.rows.value;
		const rowHeight = this.store.rowHeight.value;

		const rowMap = new Map<string, number>();
		rows.forEach((row, index) => rowMap.set(row.id, index));

		const cBody = getThemeColor('--card');
		const cAccent = getThemeColor('--primary');
		const cTextMain = getThemeColor('--text-main');
		const cTextMuted = getThemeColor('--text-muted');
		const cBorder = getThemeColor('--border-color');
		const cMilestone = getThemeColor('--warning');

		const titleStyle = new PIXI.TextStyle({
			fontFamily: 'Inter, system-ui, sans-serif',
			fontSize: 12,
			fill: cTextMain,
			fontWeight: '500',
		});

		const dateStyle = new PIXI.TextStyle({
			fontFamily: 'Inter, system-ui, sans-serif',
			fontSize: 10,
			fill: cTextMuted,
		});

		for (const task of tasks) {
			const rowIndex = rowMap.get(task.rowId);
			if (rowIndex === undefined) continue;

			const coords = this.store.getTaskCoordinates(task);

			const margin = 8;
			const barHeight = rowHeight - (margin * 2);
			const y = (rowIndex * rowHeight) + margin;

			if (task.isMilestone) {
				this.renderMilestone(coords.x, y, barHeight, { cBody, cAccent, cBorder, cMilestone });
			} else {
				this.renderTaskBar(
					task,
					coords.x,
					coords.width,
					y,
					barHeight,
					{ cBody, cAccent, cBorder },
					{ titleStyle, dateStyle },
				);
			}
		}
	}

	private renderTaskBar(
		task: any,
		x: number,
		width: number,
		y: number,
		height: number,
		colors: { cBody: number; cAccent: number; cBorder: number },
		styles: { titleStyle: PIXI.TextStyle; dateStyle: PIXI.TextStyle },
	): void {
		const group = new PIXI.Container();
		group.x = x;
		group.y = y;

		const bg = new PIXI.Graphics();
		const radius = 6;

		bg.roundRect(0, 0, width, height, radius);
		bg.fill(colors.cBody);

		const linePadY = 4;
		const linePadX = 4;
		const stripWidth = 6;
		bg.beginPath();
		bg.roundRect(linePadX, linePadY, stripWidth, height - (linePadY * 2), 4);
		bg.fill(colors.cAccent);

		group.addChild(bg);

		if (width > 40) {
			const title = new PIXI.Text({ text: task.name, style: styles.titleStyle });
			title.x = 10 + linePadX;
			title.y = 4;
			group.addChild(title);
		}

		if (width > 120) {
			const dateStr = `${new DateTime(task.startAt).toFormat('dd/MM')} - ${
				new DateTime(task.endAt).toFormat('dd/MM')
			}`;
			const dateText = new PIXI.Text({ text: dateStr, style: styles.dateStyle });
			dateText.x = 10 + linePadX;
			dateText.y = 20;
			group.addChild(dateText);
		}

		this.container.addChild(group);
	}

	private renderMilestone(
		x: number,
		y: number,
		size: number,
		colors: { cBody: number; cAccent: number; cBorder: number; cMilestone: number },
	): void {
		const graphics = new PIXI.Graphics();

		const halfSize = size / 2;
		const xStart = x - halfSize;

		graphics.roundRect(xStart, y, size, size, 6);
		graphics.fill(colors.cBody);

		const centerX = x;
		const centerY = y + halfSize;
		const diamondRadius = size / 3.5;

		graphics.beginPath();
		graphics.moveTo(centerX, centerY - diamondRadius);
		graphics.lineTo(centerX + diamondRadius, centerY);
		graphics.lineTo(centerX, centerY + diamondRadius);
		graphics.lineTo(centerX - diamondRadius, centerY);
		graphics.closePath();

		graphics.fill(colors.cMilestone);

		this.container.addChild(graphics);
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
	visibleHeight: number; // Added
	startDate: number;
	endDate?: number;
}

export interface HeaderData {
	topRows: HeaderBlock[];
	bottomRows: HeaderBlock[];
	tier: HeaderTier;
	totalWidth: number;
}

/**
 * The Central Nervous System of the Gantt Chart.
 */
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

	public containerWidth: Signal<number>;
	public containerHeight: Signal<number>; // Added

	public rowHeight: Signal<number>;
	public rowGap: Signal<number>;

	public timelineStart: Signal<number>;

	public timeScale: GanttTimeScale;

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

		this.containerWidth = signal(options.visibleWidth);
		this.containerHeight = signal(options.visibleHeight);

		this.rowHeight = signal(60);
		this.rowGap = signal(40);

		this.timelineStart = signal(options.startDate);

		this.timeScale = new GanttTimeScale({
			visibleDays: this.visibleDays.value,
			width: options.visibleWidth,
			startDate: options.startDate,
		});
	}

	/**
	 * Total vertical height required to render all rows.
	 */
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
		batch(() => {
			this.containerWidth.value = width;
			this.containerHeight.value = height;
		});
		this.updateScale();
	}

	public setVisibleDays(days: number) {
		this.visibleDays.value = Math.max(1, days);
		this.updateScale();
	}

	public setStartDate(start: number) {
		this.timelineStart.value = start;
		this.updateScale();
	}

	private updateScale() {
		this.timeScale.update(
			this.visibleDays.value,
			this.containerWidth.value,
			this.timelineStart.value,
		);
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

		const tier = getHeaderTier(days);

		const startDT = new DateTime(new Date(startMs));
		const endDT = startDT.add(days, 'days').endOf('day');

		this.timeScale.update(days, width, startMs);
		const dateToX = (t: number) => this.timeScale.dateToX(t);

		const topRows = generateHeaderBlocks(startDT, endDT, tier.top, dateToX);
		const bottomRows = generateHeaderBlocks(startDT, endDT, tier.bottom, dateToX);

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

### File: packages\charts\src\styles\gantt\gantt-header.css

```css
.gantt-header {
    width: 100%;
    background-color: var(--header);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius__large);
    box-shadow: 0 4px 12px #0006;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;

    .gantt-header__spacer {
        width: 30%;
    }
}
```

### File: packages\charts\src\styles\gantt\gantt-task-card.css

```css
.gantt-task-card__container {
    height: var(--task-height, 60px);
    min-height: var(--task-height, 60px);
    max-height: var(--task-height, 60px);
    width: calc(100% - 2rem);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 1rem;
}

.gantt-task-card {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;

    &:hover {

        .gantt-task-card__grip {
            width: 24px;
            opacity: 1;
            margin-right: 0.5rem;
        }

        .gantt-task-card__content {
            background-color: var(--card);

        }
    }
}

.gantt-task-card__grip {
    /* Instead of display: none */
    width: 0;
    opacity: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    cursor: grab;

    /* Transition the width and opacity */
    transition: width 200ms ease-in-out, opacity 200ms ease-in-out, margin 200ms ease-in-out;

    &:active {
        cursor: grabbing;
    }
}

.gantt-task-card__content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    border-radius: var(--border-radius);
    cursor: pointer;
    padding: 0.5rem;
    transition: all 200ms ease-in-out;
    flex: 1;
}

.gantt-task-card__title {
    margin: 0;
    padding: 0;
    font-weight: 500;
}

.gantt-task-card__meta {
    display: flex;
    justify-content: space-between;
    width: 100%;
    font-size: 0.75rem;
}

.gantt-task-card__date {
    text-align: center;
}
```

### File: packages\charts\src\styles\gantt\gantt-task-list.css

```css
@import './gantt-task-card.css';

/* #region GANTT TASK LIST */
.gantt-task-list {
    width: 100%;
    min-width: 200px;
    max-width: 300px;
    background-color: var(--header);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 100%;
    overflow: hidden;
}

.gantt-task-list__header {
    height: 60px;
    min-height: 60px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    padding: 0 1rem;
    font-weight: 500;
}

.gantt-task-list__container {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    overflow: hidden;
    position: relative;
}

.gantt-task-list__container__tasks {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    /* Allow children to dictate the height so the 15 virtualized rows aren't clipped */
    height: max-content;
    /* Force hardware acceleration for smooth 60fps scrolling */
    will-change: transform;
}

/* #endregion */
```

### File: packages\charts\src\styles\gantt\gantt-timeline.css

```css
.gantt-timeline {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: var(--bg);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
}

/* #region HEADER */

.gantt-timeline__header {
    width: 100%;
    height: 60px;
    min-height: 60px;
    background-color: var(--header);
    border-bottom: 1px solid var(--border-color);
    overflow-x: hidden;
    /* Programmatically scrolled via JS */
    overflow-y: hidden;
    position: relative;
}

.gantt-header-content {
    height: 100%;
    position: relative;
}

.gantt-header-row {
    position: absolute;
    left: 0;
    width: 100%;
    height: 50%;
    display: flex;
}

.gantt-header-row.top {
    top: 0;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--card);
}

.gantt-header-row.bottom {
    top: 50%;
}

/* #endregion */

/* #region TIME BLOCKS */

.gantt-time-block {
    position: absolute;
    top: 0;
    bottom: 0;
    height: 100%;
    border-right: 1px solid var(--border-color);
    box-sizing: border-box;
    overflow: hidden;
}

/* STICKY LABEL: Keeps "February 2026" visible while scrolling right */
.gantt-sticky-label {
    position: sticky;
    left: 0;
    display: inline-flex;
    align-items: center;
    padding: 0 0.5rem;
    height: 100%;
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--text-main);
    white-space: nowrap;
    background-color: inherit;
    z-index: 2;
}

.gantt-centered-label {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: var(--text-muted);
}

/* #endregion */

/* #region VIEWPORT */

.gantt-timeline__viewport {
    flex: 1;
    width: 100%;
    overflow: hidden;
    position: relative;
}

.gantt-timeline__canvas {
    position: relative;
    min-height: 100%;
}

/* #endregion */
```

### File: packages\charts\src\styles\gantt\gantt.css

```css
.gantt-chart {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
}

.gantt-controls {
    display: flex;
}

.gantt-body {
    display: flex;
    gap: 1rem;
    height: 100%;
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
 * Resolves a CSS variable (e.g., "--primary") to a Hex number (0xffffff).
 * Handles Hex, RGB, and HSL formats returned by getComputedStyle.
 */
export function getThemeColor(varName: string): number {
	if (typeof window === 'undefined') return 0x000000;

	const style = getComputedStyle(document.documentElement);
	const color = style.getPropertyValue(varName).trim();

	if (!color) return 0x000000;

	if (color.startsWith('#')) {
		return parseInt(color.replace('#', '0x'), 16);
	}

	if (color.startsWith('rgb')) {
		const match = color.match(/\d+/g);
		if (match && match.length >= 3) {
			const [r, g, b] = match.map(Number);
			return (r << 16) + (g << 8) + b;
		}
	}

	if (color.startsWith('hsl')) {
		const match = color.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/);
		if (match) {
			const h = parseFloat(match[1]);
			const s = parseFloat(match[2]) / 100;
			const l = parseFloat(match[3]) / 100;

			const k = (n: number) => (n + h / 30) % 12;
			const a = s * Math.min(l, 1 - l);
			const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

			const r = Math.round(f(0) * 255);
			const g = Math.round(f(8) * 255);
			const b = Math.round(f(4) * 255);

			return (r << 16) + (g << 8) + b;
		}
	}

	return 0x22d3ee;
}

```

