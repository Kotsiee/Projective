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
