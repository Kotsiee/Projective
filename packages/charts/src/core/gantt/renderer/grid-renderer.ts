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
		const cSecondary = getThemeColor('--card');

		// 1. Determine local X boundaries based on the current scroll position
		const currentX = this.store.scrollX.value;
		const width = this.store.containerWidth.value;
		const days = this.store.visibleDays.value;

		// Add a buffer so lines are drawn slightly off-screen before smoothly scrolling into view
		const buffer = 500;
		const renderStartX = -currentX - buffer;
		const renderEndX = -currentX + width + buffer;

		// 2. Map the visible pixel coordinates back to timestamps
		const startDate = new DateTime(new Date(this.store.timeScale.xToDate(renderStartX)));
		const endDate = new DateTime(new Date(this.store.timeScale.xToDate(renderEndX)));

		const tier = getHeaderTier(days);
		const dateToX = (t: number) => this.store.timeScale.dateToX(t);

		// 3. Generate dynamic header blocks for the exact window the user is looking at
		const topRows = generateHeaderBlocks(startDate, endDate, tier.top, dateToX);
		const bottomRows = generateHeaderBlocks(startDate, endDate, tier.bottom, dateToX);

		const totalHeight = Math.max(
			this.store.rows.value.length * this.store.rowHeight.value,
			this.store.containerHeight.value,
		);

		// Render secondary (bottom) vertical lines
		this.graphics.context.beginPath();
		for (const block of bottomRows) {
			const x = block.x;
			this.graphics.context.moveTo(x, 0);
			this.graphics.context.lineTo(x, totalHeight);
		}
		this.graphics.context.stroke({ width: 1, color: cSecondary, alpha: 1 });

		// Render primary (top) vertical lines
		this.graphics.context.beginPath();
		for (const block of topRows) {
			const x = block.x;
			this.graphics.context.moveTo(x, 0);
			this.graphics.context.lineTo(x, totalHeight);
		}
		this.graphics.context.stroke({ width: 1, color: cPrimary, alpha: 0.5 });

		// this.renderHorizontal();
	}

	private renderHorizontal() {
		this.graphics.context.beginPath();

		const currentX = this.store.scrollX.value;
		const width = this.store.containerWidth.value;

		// Because the entire PIXI container is physically moved by `scrollX`,
		// drawing from `0` means the lines scroll off the screen.
		// We must offset the start and end coordinates to match the inverse of the scroll.
		const startX = -currentX;
		const endX = -currentX + width;

		for (const row of this.store.rows.value) {
			const y = row.orderIndex * this.store.rowHeight.value;
			this.graphics.context.moveTo(startX, y);
			this.graphics.context.lineTo(endX, y);
		}

		// Pull your BEM semantic border color dynamically
		const cBorder = getThemeColor('--border-color');
		this.graphics.context.stroke({ width: 1, color: cBorder, alpha: 1 });
	}
}
