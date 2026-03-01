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
