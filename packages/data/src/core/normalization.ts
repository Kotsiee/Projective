import type { Dataset, NormalizedItem } from './dataset.ts';
import type { DataSource } from './datasource.ts';

export function mergeItems<TOut, TIn>(
	currentDataset: Dataset<TOut>,
	newRawItems: TIn[],
	offset: number,
	source: DataSource<TOut, TIn>,
	newTotalCount?: number | null,
	requestedLength?: number, // NEW: We need to know how many we asked for
): Dataset<TOut> {
	const nextItems = new Map(currentDataset.items);
	const nextOrder = [...currentDataset.order];

	newRawItems.forEach((raw, index) => {
		const { key, data } = source.normalize(raw);
		const absoluteIndex = offset + index;
		const existing = nextItems.get(key);

		const newItem: NormalizedItem<TOut> = {
			key,
			data,
			selected: existing ? existing.selected : false,
			isSkeleton: false,
			layout: existing?.layout,
		};

		nextItems.set(key, newItem);

		if (absoluteIndex >= nextOrder.length) {
			nextOrder.length = absoluteIndex + 1;
		}
		nextOrder[absoluteIndex] = key;
	});

	// --- INTELLIGENT TOTAL COUNT LOGIC ---
	let finalTotalCount = newTotalCount !== undefined ? newTotalCount : currentDataset.totalCount;

	// Fallback: If API didn't give a total, but gave us fewer items than we asked for,
	// we have hit the end of the dataset.
	if (
		finalTotalCount === null && // No explicit total yet
		requestedLength !== undefined && // We know what we asked for
		newRawItems.length < requestedLength // We got less back
	) {
		finalTotalCount = offset + newRawItems.length;
	}

	// Sanity trim
	if (finalTotalCount !== null && nextOrder.length > finalTotalCount) {
		nextOrder.length = finalTotalCount;
	}

	return {
		...currentDataset,
		items: nextItems,
		order: nextOrder,
		totalCount: finalTotalCount,
	};
}
