import type { Range } from './types.ts';

export interface VirtualItem {
	index: number;
	start: number; // Pixel offset from top
	size: number; // Pixel height
	end: number; // start + size
	measured: boolean;
}

export interface VirtualizerOptions {
	count: number;
	/** Estimated height for unmeasured items */
	estimateSize: (index: number) => number;
	/** Number of extra items to render outside viewport (prevents white flashes) */
	overscan?: number;
	/** Optional fixed height optimization. If set, ignores measurements. */
	fixedItemHeight?: number;
}

export class Virtualizer {
	private measurements = new Map<number, number>();
	private lastMeasuredIndex = -1;
	private options: VirtualizerOptions;

	// Cache the last computed total size to avoid frequent expensive loops
	private _totalSizeCache: number | null = null;

	constructor(options: VirtualizerOptions) {
		this.options = { overscan: 1, ...options };
	}

	/**
	 * Update configuration (e.g., when item count changes)
	 */
	public setOptions(newOptions: Partial<VirtualizerOptions>) {
		this.options = { ...this.options, ...newOptions };
		this._totalSizeCache = null; // Invalidate size cache
	}

	/**
	 * The UI calls this when a DOM node is rendered and we know its real height.
	 */
	public measure(index: number, size: number) {
		const prev = this.measurements.get(index);
		if (prev !== size) {
			this.measurements.set(index, size);
			this._totalSizeCache = null; // Size changed, invalidate total
			this.lastMeasuredIndex = Math.max(this.lastMeasuredIndex, index);
		}
	}

	/**
	 * Calculates the total height of the scrollable content.
	 */
	public getTotalSize(): number {
		// Optimization: Return exact math for fixed height
		if (this.options.fixedItemHeight) {
			return this.options.count * this.options.fixedItemHeight;
		}

		if (this._totalSizeCache !== null) {
			return this._totalSizeCache;
		}

		// Sum known measurements + estimate remaining
		// Note: In a production 1M item list, we'd use a Prefix Sum Tree for O(log N) lookups.
		// For this MVP, we use a simpler approximation:
		// (Sum of measured) + (Count of unmeasured * Estimate)

		let measuredHeight = 0;
		for (const [_, size] of this.measurements) {
			measuredHeight += size;
		}

		const unmeasuredCount = this.options.count - this.measurements.size;
		const total = measuredHeight + (unmeasuredCount * this.options.estimateSize(0));

		this._totalSizeCache = total;
		return total;
	}

	/**
	 * The core engine. Returns exactly which items should be in the DOM.
	 */
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
			// O(1) Lookup for fixed height
			startIndex = Math.floor(scrollTop / fixedItemHeight);
			startOffset = startIndex * fixedItemHeight;
		} else {
			// O(N) Scan for variable height (Simple version)
			// *Optimization Note*: For 1M items, replacing this linear scan
			// with a Binary Search over a cached offset array is Phase 4 work.
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

		// Clamp start
		startIndex = Math.max(0, Math.min(startIndex, count - 1));

		// 2. Find End Index (Fill viewport)
		let endIndex = startIndex;
		let currentStackHeight = 0;
		const items: VirtualItem[] = [];

		// Apply overscan to start (look behind)
		const renderStart = Math.max(0, startIndex - overscan);

		// We need to back-calculate the offset if we overscanned backwards
		let renderOffset = startOffset;
		for (let i = startIndex - 1; i >= renderStart; i--) {
			renderOffset -= this.getSize(i);
		}

		// Loop forward until we fill viewport + overscan
		for (let i = renderStart; i < count; i++) {
			const size = this.getSize(i);

			items.push({
				index: i,
				start: renderOffset,
				size,
				end: renderOffset + size,
				measured: this.measurements.has(i),
			});

			renderOffset += size;
			currentStackHeight = renderOffset - startOffset;

			if (currentStackHeight >= viewportHeight && i >= startIndex + overscan) {
				endIndex = i;
				break;
			}
		}

		return items;
	}

	/**
	 * Helper to get size (measured > fixed > estimate)
	 */
	private getSize(index: number): number {
		if (this.options.fixedItemHeight) return this.options.fixedItemHeight;
		return this.measurements.get(index) ?? this.options.estimateSize(index);
	}
}
