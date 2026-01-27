import { Dataset } from './dataset.ts';
import { ColumnDef, getCellValue } from './table.ts';

export function sortLocalData<T>(
	dataset: Dataset<T>,
	colId: string,
	dir: 'asc' | 'desc',
	columns?: ColumnDef<T>[],
) {
	const colDef = columns?.find((c) => c.id === colId);
	if (!colDef) return dataset.order;

	return [...dataset.order].sort((keyA, keyB) => {
		const itemA = dataset.items.get(keyA)?.data;
		const itemB = dataset.items.get(keyB)?.data;
		if (!itemA || !itemB) return 0;

		const valA = getCellValue(itemA, colDef);
		const valB = getCellValue(itemB, colDef);

		if (valA < valB) return dir === 'asc' ? -1 : 1;
		if (valA > valB) return dir === 'asc' ? 1 : -1;
		return 0;
	});
}
