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
