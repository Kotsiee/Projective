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
