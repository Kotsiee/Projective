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

		// OVERRIDE: If mouse is hovering a scrollbar, let the ScrollRenderer handle it exclusively
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
