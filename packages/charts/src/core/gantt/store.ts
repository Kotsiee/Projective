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
