import { useEffect, useMemo } from 'preact/hooks';
import { DataManager } from '../core/data-manager.ts';
import type { DataSource } from '../core/datasource.ts';

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

	useEffect(() => {
		return () => manager.destroy();
	}, [manager]);

	return manager;
}
