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
