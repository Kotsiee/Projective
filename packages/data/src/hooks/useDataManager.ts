import { useEffect, useMemo } from 'preact/hooks';
import { DataManager } from '../core/data-manager.ts';
import type { DataSource } from '../core/datasource.ts';
import { onNavigate } from '../core/navigation.ts';

export function useDataManager<TOut, TIn>(
	dataSource: DataSource<TOut, TIn> | null,
	initialData?: TOut[],
	pageSize = 50,
) {
	const manager = useMemo(() =>
		new DataManager({
			dataSource,
			initialData,
			pageSize,
		}), []);

	useEffect(() => {
		manager.updateDataSource(dataSource);
	}, [dataSource, manager]);

	// Refetch cleanly across Fresh client-side (partial) navigation. Lists mounted in persistent
	// regions — the top nav, the middle-nav sidebar — do NOT remount on a partial swap, so without
	// this they keep their first-load snapshot and read as stale/empty until a hard refresh.
	// revalidate() no-ops for local-array sources and is de-duped by the RestDataSource cache.
	useEffect(() => onNavigate(() => manager.revalidate()), [manager]);

	useEffect(() => {
		return () => manager.destroy();
	}, [manager]);

	return manager;
}
