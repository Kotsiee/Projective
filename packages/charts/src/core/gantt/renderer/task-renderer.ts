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
