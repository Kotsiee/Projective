import { batch, type Signal, signal } from '@preact/signals';
import type { DataSource } from './datasource.ts';
import type { Dataset, NormalizedItem } from './dataset.ts';
import { createEmptyDataset } from './dataset.ts';
import { mergeItems } from './normalization.ts';
import { findGaps, mergeRanges } from './loading.ts';
import type { Range } from './types.ts';

interface DataManagerOptions<TOut, TIn> {
	dataSource: DataSource<TOut, TIn> | null;
	pageSize?: number;
	initialData?: TOut[];
}

export class DataManager<TOut, TIn> {
	public dataset: Signal<Dataset<TOut>>;
	public isFetching: Signal<boolean>;

	private dataSource: DataSource<TOut, TIn> | null;
	private pageSize: number;
	private pendingRequests = new Set<string>();
	private visibleRange: Range = { start: 0, length: 0 };
	private debounceTimer: number | null = null;
	private isDestroyed = false;

	constructor(options: DataManagerOptions<TOut, TIn>) {
		this.dataSource = options.dataSource;
		this.pageSize = options.pageSize || 50;
		this.isFetching = signal(false);

		if (options.initialData) {
			const items = new Map<string, NormalizedItem<TOut>>();
			const order: string[] = [];
			options.initialData.forEach((d, i) => {
				const key = String(i);
				items.set(key, { key, data: d, selected: false, isSkeleton: false });
				order.push(key);
			});
			this.dataset = signal({
				items,
				order,
				totalCount: options.initialData.length,
				pendingRanges: [],
			});
		} else {
			this.dataset = signal(createEmptyDataset<TOut>());
		}

		// REMOVED: this.fetchMeta();
		// SSR Safety: Do not fetch in constructor.
	}

	public updateDataSource(newSource: DataSource<TOut, TIn> | null) {
		// Even if source is same, we might need to fetch if it's the initial client-side hydration
		// So we only return if we have data or are already fetching
		if (
			this.dataSource === newSource &&
			(this.dataset.value.totalCount !== null || this.isFetching.value)
		) return;

		this.dataSource = newSource;
		this.pendingRequests.clear();

		// Only reset if we are actually switching sources, not just initializing
		if (this.dataset.value.totalCount !== null) {
			batch(() => {
				this.dataset.value = createEmptyDataset<TOut>();
				this.isFetching.value = false;
			});
		}

		this.fetchMeta();
		this.checkGaps();
	}

	// ... (rest of the file remains exactly the same as previous step)
	public setVisibleRange(start: number, end: number) {
		const length = end - start + 1;
		if (this.visibleRange.start === start && this.visibleRange.length === length) return;

		this.visibleRange = { start, length };

		if (this.debounceTimer) clearTimeout(this.debounceTimer);
		this.debounceTimer = setTimeout(() => {
			if (!this.isDestroyed) this.checkGaps();
		}, 60) as unknown as number;
	}

	private async fetchMeta() {
		if (!this.dataSource || this.dataset.value.totalCount !== null) return;

		// @ts-ignore
		if (typeof this.dataSource.getMeta === 'function') {
			try {
				// @ts-ignore
				const meta = await this.dataSource.getMeta();
				if (typeof meta?.totalCount === 'number') {
					this.dataset.value = {
						...this.dataset.value,
						totalCount: meta.totalCount,
					};
					this.checkGaps();
				}
			} catch (e) {
				console.error('Meta fetch failed', e);
			}
		}
	}

	private checkGaps() {
		if (!this.dataSource || this.isDestroyed) return;

		const currentTotal = this.dataset.value.totalCount;
		const PREFETCH = this.pageSize;
		const start = Math.max(0, this.visibleRange.start - PREFETCH);
		let end = this.visibleRange.start + this.visibleRange.length + PREFETCH;

		if (currentTotal !== null) {
			end = Math.min(end, currentTotal);
		} else {
			end = Math.min(end, this.pageSize * 2);
		}

		if (start >= end) return;

		const gaps = findGaps(Math.floor(start), Math.ceil(end), this.dataset.value.order);
		if (gaps.length === 0) return;

		const requests = mergeRanges(gaps).map((gap) => {
			const pageStart = Math.floor(gap.start / this.pageSize) * this.pageSize;
			let pageEnd = Math.ceil((gap.start + gap.length) / this.pageSize) * this.pageSize;

			if (currentTotal !== null) {
				pageEnd = Math.min(pageEnd, currentTotal);
			}

			return { start: pageStart, length: pageEnd - pageStart };
		}).filter((r) => r.length > 0);

		requests.forEach((range) => this.fetchRange(range));
	}

	private async fetchRange(range: Range) {
		const reqKey = `${range.start}-${range.length}`;

		if (this.pendingRequests.has(reqKey)) return;
		this.pendingRequests.add(reqKey);

		if (!this.isFetching.value) this.isFetching.value = true;

		try {
			const result = await this.dataSource!.fetch(range);
			if (this.isDestroyed) return;

			if (Array.isArray(result.items)) {
				batch(() => {
					this.dataset.value = mergeItems(
						this.dataset.value,
						result.items,
						range.start,
						this.dataSource!,
						result.meta?.totalCount,
						range.length,
					);
				});
			}
		} catch (err) {
			console.error(`Fetch failed ${reqKey}`, err);
		} finally {
			this.pendingRequests.delete(reqKey);
			if (this.pendingRequests.size === 0 && !this.isDestroyed) {
				this.isFetching.value = false;
			}
		}
	}

	public destroy() {
		this.isDestroyed = true;
		if (this.debounceTimer) clearTimeout(this.debounceTimer);
		this.pendingRequests.clear();
	}
}
