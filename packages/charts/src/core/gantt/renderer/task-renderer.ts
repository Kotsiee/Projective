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
		const rows = this.store.rows.value;
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

			const margin = 12;
			const barHeight = rowHeight - (margin * 2);
			const y = (rowIndex * rowHeight) + margin;

			// Check if this task's row is currently selected
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
					coords.width,
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

		// If selected, highlight the stroke with the primary accent color instead of cutting it out
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
