export interface VirtualItem {
	index: number;
	start: number; // Pixel offset from top
	size: number; // Pixel height
	end: number; // start + size
	measured: boolean;
	/** Ref callback to attach to the rendered DOM element for measurement */
	measureElement: (el: Element | null) => void;
}

export interface VirtualizerOptions {
	count: number;
	estimateSize: (index: number) => number;
	overscan?: number;
	fixedItemHeight?: number;
	/** Callback fired when the total size changes (useful for updating scroll containers) */
	onChange?: () => void;
}

export class Virtualizer {
	private measurements = new Map<number, number>();
	private lastMeasuredIndex = -1;
	private options: VirtualizerOptions;
	private _totalSizeCache: number | null = null;

	// ResizeObserver Integration (Nullable for SSR safety)
	private resizeObserver: ResizeObserver | null = null;
	private activeElements = new Map<number, Element>();
	private elementIndexMap = new WeakMap<Element, number>();

	constructor(options: VirtualizerOptions) {
		this.options = { overscan: 1, ...options };

		// FIX: Only instantiate ResizeObserver if it exists (Browser environment)
		if (typeof ResizeObserver !== 'undefined') {
			this.resizeObserver = new ResizeObserver((entries) => {
				let hasChanges = false;
				for (const entry of entries) {
					const index = this.elementIndexMap.get(entry.target);
					if (index !== undefined) {
						// Use borderBoxSize for precision, fall back to contentRect
						const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;

						if (this.measurements.get(index) !== height) {
							this.measure(index, height);
							hasChanges = true;
						}
					}
				}

				if (hasChanges && this.options.onChange) {
					this.options.onChange();
				}
			});
		}
	}

	public setOptions(newOptions: Partial<VirtualizerOptions>) {
		this.options = { ...this.options, ...newOptions };
		this._totalSizeCache = null;
	}

	public measure(index: number, size: number) {
		const prev = this.measurements.get(index);
		if (prev !== size) {
			this.measurements.set(index, size);
			this._totalSizeCache = null;
			this.lastMeasuredIndex = Math.max(this.lastMeasuredIndex, index);
		}
	}

	public getTotalSize(): number {
		if (this.options.fixedItemHeight) {
			return this.options.count * this.options.fixedItemHeight;
		}

		if (this._totalSizeCache !== null) {
			return this._totalSizeCache;
		}

		let measuredHeight = 0;
		this.measurements.forEach((size) => {
			measuredHeight += size;
		});

		const unmeasuredCount = this.options.count - this.measurements.size;
		const total = measuredHeight + (unmeasuredCount * this.options.estimateSize(0));

		this._totalSizeCache = total;
		return total;
	}

	public getVirtualItems(
		scrollTop: number,
		viewportHeight: number,
	): VirtualItem[] {
		const { count, overscan = 1, fixedItemHeight } = this.options;

		if (count === 0) return [];

		// 1. Find Start Index
		let startIndex = 0;
		let startOffset = 0;

		if (fixedItemHeight) {
			startIndex = Math.floor(scrollTop / fixedItemHeight);
			startOffset = startIndex * fixedItemHeight;
		} else {
			let currentOffset = 0;
			for (let i = 0; i < count; i++) {
				const size = this.getSize(i);
				if (currentOffset + size > scrollTop) {
					startIndex = i;
					startOffset = currentOffset;
					break;
				}
				currentOffset += size;
			}
		}

		startIndex = Math.max(0, Math.min(startIndex, count - 1));

		// 2. Find End Index (Fill viewport)
		let endIndex = startIndex;
		let renderOffset = startOffset;

		const renderStart = Math.max(0, startIndex - overscan);

		// Adjust offset for overscan (look behind)
		for (let i = startIndex - 1; i >= renderStart; i--) {
			renderOffset -= this.getSize(i);
		}

		const items: VirtualItem[] = [];

		for (let i = renderStart; i < count; i++) {
			const size = this.getSize(i);

			items.push({
				index: i,
				start: renderOffset,
				size,
				end: renderOffset + size,
				measured: this.measurements.has(i),

				// The ref callback
				measureElement: (node: Element | null) => {
					// FIX: Check if observer exists before using
					if (!this.resizeObserver) return;

					if (node) {
						// Mount: Observe
						if (this.activeElements.get(i) !== node) {
							this.activeElements.set(i, node);
							this.elementIndexMap.set(node, i);
							this.resizeObserver.observe(node);
						}
					} else {
						// Unmount: Unobserve
						const activeNode = this.activeElements.get(i);
						if (activeNode) {
							this.resizeObserver.unobserve(activeNode);
							this.activeElements.delete(i);
							this.elementIndexMap.delete(activeNode);
						}
					}
				},
			});

			renderOffset += size;
			if (renderOffset - startOffset >= viewportHeight && i >= startIndex + overscan) {
				endIndex = i;
				break;
			}
		}

		return items;
	}

	private getSize(index: number): number {
		if (this.options.fixedItemHeight) return this.options.fixedItemHeight;
		return this.measurements.get(index) ?? this.options.estimateSize(index);
	}

	public cleanup() {
		// FIX: Safe access
		this.resizeObserver?.disconnect();
		this.activeElements.clear();
	}
}
