import { GanttStore } from '../store.ts';

export class ScrollManager {
	private store: GanttStore;
	private readonly BOTTOM_BUFFER = 50;

	constructor(store: GanttStore) {
		this.store = store;
	}

	public handlePointerDown() {
		if (!this.store.canDrag.value) return;

		this.store.isMouseDown.value = true;
	}

	public handlePointerMove(x: number) {
		if (!this.store.isMouseDown.value) return;
		this.store.scrollX.value += x;
		this.store.deltaX.value = x;
	}

	public handlePointerUp() {
		this.store.isMouseDown.value = false;
	}

	public handleWheel(e: WheelEvent) {
		e.preventDefault();

		if (this.store.isShiftDown.value) {
			this.store.scrollX.value -= e.deltaY;
		} else {
			const currentY = this.store.scrollY.value;
			const delta = e.deltaY * 0.6;

			const contentHeight = this.store.contentHeight.value;
			const viewportHeight = this.store.containerHeight.value;

			const maxScrollY = Math.max(0, contentHeight - viewportHeight);

			let newY = currentY + delta;

			if (newY < 0) newY = 0;
			if (newY > maxScrollY) newY = maxScrollY;

			this.store.scrollY.value = newY;
		}
	}
}
