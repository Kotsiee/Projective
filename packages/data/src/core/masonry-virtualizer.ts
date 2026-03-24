import {
	calculateMasonryLayout,
	type MasonryConfig,
	type MasonryLayoutResult,
	type MasonryPosition,
} from './masonry.ts';

// #region Interfaces
/**
 * A virtualized masonry item containing both DOM measurement callbacks
 * and absolute 2D spatial coordinates.
 */
export interface VirtualMasonryItem {
	/** Original index of the item in the dataset */
	index: number;
	/** Absolute horizontal pixel offset */
	x: number;
	/** Absolute vertical pixel offset */
	y: number;
	/** Calculated width of the item based on column count */
	width: number;
	/** Actual or estimated height of the item */
	height: number;
	/** The column index this item belongs to */
	columnIndex: number;
	/** Has this item been explicitly measured by the DOM yet? */
	measured: boolean;
	/** Ref callback to attach to the rendered DOM element for measurement */
	measureElement: (el: Element | null) => void;
}

export interface MasonryVirtualizerOptions extends MasonryConfig {
	/** Total number of items in the dataset */
	count: number;
	/** Function to estimate item height before it renders */
	estimateHeight: (index: number) => number;
	/** Number of pixel rows to render outside the visible viewport */
	overscan?: number;
	/** Callback fired when the total size changes (useful for updating scroll containers) */
	onChange?: () => void;
}
// #endregion

// #region Core Virtualizer Class
/**
 * 2D Spatial Layout Engine and Virtualizer.
 * Handles exact intersection calculations for masonry grids,
 * using binary search against column-indexed position data.
 */
export class MasonryVirtualizer {
	private options: MasonryVirtualizerOptions;
	private measurements = new Map<number, number>();
	private layoutCache: MasonryLayoutResult | null = null;
	private columnIndicesCache: number[][] = [];

	// ResizeObserver Integration (Nullable for SSR safety)
	private resizeObserver: ResizeObserver | null = null;
	private activeElements = new Map<number, Element>();
	private elementIndexMap = new WeakMap<Element, number>();

	constructor(options: MasonryVirtualizerOptions) {
		this.options = { overscan: 200, ...options };

		if (typeof ResizeObserver !== 'undefined') {
			this.resizeObserver = new ResizeObserver((entries) => {
				let hasChanges = false;
				for (const entry of entries) {
					const index = this.elementIndexMap.get(entry.target);
					if (index !== undefined) {
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

	// #region Public API
	/**
	 * Updates the configuration options and invalidates the layout cache.
	 */
	public setOptions(newOptions: Partial<MasonryVirtualizerOptions>) {
		let needsRelayout = false;

		if (
			newOptions.containerWidth !== undefined &&
				newOptions.containerWidth !== this.options.containerWidth ||
			newOptions.columns !== this.options.columns ||
			newOptions.columnWidth !== this.options.columnWidth ||
			newOptions.gap !== this.options.gap ||
			newOptions.count !== this.options.count
		) {
			needsRelayout = true;
		}

		this.options = { ...this.options, ...newOptions };

		if (needsRelayout) {
			this.layoutCache = null;
		}
	}

	/**
	 * Updates the known height of an item. Triggers a relayout if the height changed.
	 */
	public measure(index: number, height: number) {
		const prev = this.measurements.get(index);
		if (prev !== height) {
			this.measurements.set(index, height);
			this.layoutCache = null; // Invalidate current layout
		}
	}

	/**
	 * Returns the absolute maximum height of the masonry grid.
	 */
	public getTotalSize(): number {
		this.ensureLayout();
		return this.layoutCache?.totalHeight ?? 0;
	}

	/**
	 * Returns the array of items that currently intersect the viewport.
	 */
	public getVirtualItems(scrollTop: number, viewportHeight: number): VirtualMasonryItem[] {
		this.ensureLayout();
		if (!this.layoutCache || this.options.count === 0) return [];

		const { overscan = 200 } = this.options;
		const viewStart = Math.max(0, scrollTop - overscan);
		const viewEnd = scrollTop + viewportHeight + overscan;

		const visibleItems: VirtualMasonryItem[] = [];

		// For each column, binary search to find the first visible item,
		// then iterate downwards until we pass the viewport.
		for (let c = 0; c < this.layoutCache.columns; c++) {
			const colIndices = this.columnIndicesCache[c];
			if (!colIndices || colIndices.length === 0) continue;

			const startIndex = this.findFirstVisibleIndex(colIndices, viewStart);

			for (let i = startIndex; i < colIndices.length; i++) {
				const itemIndex = colIndices[i];
				const pos = this.layoutCache.positions[itemIndex];

				if (pos.y > viewEnd) {
					break; // Passed the bottom of the viewport
				}

				visibleItems.push(this.createVirtualItem(itemIndex, pos));
			}
		}

		return visibleItems;
	}

	/**
	 * Cleans up DOM observers to prevent memory leaks.
	 */
	public cleanup() {
		this.resizeObserver?.disconnect();
		this.activeElements.clear();
	}
	// #endregion

	// #region Internal Logic
	/**
	 * Re-calculates the entire grid layout if the cache is invalidated.
	 */
	private ensureLayout() {
		if (this.layoutCache !== null) return;

		const itemHeights = new Array(this.options.count);
		for (let i = 0; i < this.options.count; i++) {
			itemHeights[i] = this.measurements.get(i) ?? this.options.estimateHeight(i);
		}

		this.layoutCache = calculateMasonryLayout(itemHeights, {
			containerWidth: this.options.containerWidth,
			gap: this.options.gap,
			columnWidth: this.options.columnWidth,
			columns: this.options.columns,
		});

		// Build column indices cache for fast binary searching per-column
		this.columnIndicesCache = Array.from({ length: this.layoutCache.columns }, () => []);
		for (let i = 0; i < this.layoutCache.positions.length; i++) {
			const pos = this.layoutCache.positions[i];
			this.columnIndicesCache[pos.columnIndex].push(i);
		}
	}

	/**
	 * Binary search to find the index of the first item in a column that crosses the viewStart boundary.
	 */
	private findFirstVisibleIndex(colIndices: number[], viewStart: number): number {
		let low = 0;
		let high = colIndices.length - 1;
		let best = 0;

		while (low <= high) {
			const mid = (low + high) >> 1;
			const itemIndex = colIndices[mid];
			const pos = this.layoutCache!.positions[itemIndex];
			const itemBottom = pos.y + pos.height;

			if (itemBottom >= viewStart) {
				best = mid;
				high = mid - 1; // Look for an earlier one
			} else {
				low = mid + 1;
			}
		}

		return best;
	}

	/**
	 * Wraps the raw position data into a react/preact-friendly Virtual Item with ref measurement hooks.
	 */
	private createVirtualItem(index: number, pos: MasonryPosition): VirtualMasonryItem {
		return {
			index,
			x: pos.x,
			y: pos.y,
			width: pos.width,
			height: pos.height,
			columnIndex: pos.columnIndex,
			measured: this.measurements.has(index),
			measureElement: (node: Element | null) => {
				if (!this.resizeObserver) return;

				if (node) {
					if (this.activeElements.get(index) !== node) {
						this.activeElements.set(index, node);
						this.elementIndexMap.set(node, index);
						this.resizeObserver.observe(node);
					}
				} else {
					const activeNode = this.activeElements.get(index);
					if (activeNode) {
						this.resizeObserver.unobserve(activeNode);
						this.activeElements.delete(index);
						this.elementIndexMap.delete(activeNode);
					}
				}
			},
		};
	}
	// #endregion
}
