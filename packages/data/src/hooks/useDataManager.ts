import { useEffect, useRef, useState } from 'preact/hooks';
import type { DataSource } from '../core/datasource.ts';
import type { Dataset } from '../core/dataset.ts';
import { mergeItems } from '../core/normalization.ts';
import { findGaps, mergeRanges } from '../core/loading.ts';

interface UseDataManagerProps<TOut, TIn> {
	dataset: Dataset<TOut>;
	setDataset: (d: Dataset<TOut>) => void;
	/** Allow null for "Sugar Mode" (local arrays) */
	dataSource: DataSource<TOut, TIn> | null;
	visibleRange: { start: number; end: number };
	pageSize?: number;
}

export function useDataManager<TOut, TIn>({
	dataset,
	setDataset,
	dataSource,
	visibleRange,
	pageSize = 50,
}: UseDataManagerProps<TOut, TIn>) {
	const [isFetching, setIsFetching] = useState(false);
	const pendingRequests = useRef(new Set<string>());

	useEffect(() => {
		// 1. If no remote source, do nothing
		if (!dataSource) return;

		// 2. Identify what we need (Visible + Overscan)
		const PREFETCH = pageSize / 2;
		const start = Math.max(0, visibleRange.start - PREFETCH);
		let end = visibleRange.end + PREFETCH;

		// 3. CLAMP: If we know the total count, never ask for more than exists.
		// This stops the infinite loop where we keep asking for index 100, 101, etc.
		if (dataset.totalCount !== null) {
			end = Math.min(end, dataset.totalCount - 1);
		}

		// If our view is completely out of bounds (e.g. initial render with 0 items),
		// ensure we at least try to fetch page 0.
		if (end < start && dataset.totalCount === null) {
			end = Math.max(end, pageSize - 1);
		} else if (end < start) {
			// We are past the end of data
			return;
		}

		// 4. Find what's missing
		const gaps = findGaps(Math.floor(start), Math.ceil(end), dataset.order);

		if (gaps.length === 0) return;

		// 5. Optimize requests
		const optimizedGaps = mergeRanges(gaps).map((gap) => {
			const pageStart = Math.floor(gap.start / pageSize) * pageSize;
			// Clamp page end as well to be safe
			let pageEnd = Math.ceil((gap.start + gap.length) / pageSize) * pageSize;

			if (dataset.totalCount !== null) {
				pageEnd = Math.min(pageEnd, dataset.totalCount);
			}

			return { start: pageStart, length: pageEnd - pageStart };
		});

		// 6. Execute Fetch
		optimizedGaps.forEach((range) => {
			if (range.length <= 0) return;

			const reqKey = `${range.start}-${range.length}`;
			if (pendingRequests.current.has(reqKey)) return;

			pendingRequests.current.add(reqKey);
			setIsFetching(true);

			dataSource.fetch(range)
				.then((result) => {
					setDataset(
						mergeItems(
							dataset,
							result.items,
							range.start,
							dataSource,
							result.meta?.totalCount,
							range.length,
						),
					);
				})
				.catch((err) => {
					console.error('Fetch failed', err);
				})
				.finally(() => {
					pendingRequests.current.delete(reqKey);
					// Simple debounce on the spinner to prevent flickering
					if (pendingRequests.current.size === 0) {
						setIsFetching(false);
					}
				});
		});
	}, [visibleRange.start, visibleRange.end, dataset.order, dataset.totalCount, dataSource]);

	return { isFetching };
}
