/**
 * @file data_lifecycle.test.ts
 * @description Unit coverage for the `@projective/data` client-navigation lifecycle fix.
 *
 * Fresh keeps island state intact across partial (client-side) navigation, so a data list mounted in
 * a persistent region (the top nav, the middle-nav projects/teams sidebar) never remounts and its
 * `DataManager` — created once via `useMemo` — would keep its first-load snapshot forever, reading as
 * stale/empty until a full page refresh. `useDataManager` now calls `manager.revalidate()` on every
 * client navigation; these cases prove the two behaviours that fix relies on, DB-free:
 *
 *   1. `revalidate()` triggers a fresh fetch even when the data source reference is unchanged.
 *   2. `updateDataSource()` revives a manager that was previously `destroy()`ed (Fresh reusing a
 *      preserved island), instead of silently bailing and leaving the list empty.
 */

import { assert, assertEquals } from '@std/assert';
import { DataManager } from '../packages/data/src/core/data-manager.ts';
import { DataSource, type FetchResult } from '../packages/data/src/core/datasource.ts';
import type { Range } from '../packages/data/src/core/types.ts';

interface Row {
	id: string;
	total_count?: number;
}

/** A fake network source that counts fetches and serves a fixed number of rows. */
class CountingSource extends DataSource<Row, Row> {
	public fetchCount = 0;
	public metaCount = 0;

	constructor(private readonly total: number) {
		super({ keyExtractor: (item) => item.id });
	}

	// deno-lint-ignore require-await
	async getMeta(): Promise<{ totalCount: number }> {
		this.metaCount++;
		return { totalCount: this.total };
	}

	// deno-lint-ignore require-await
	async fetch(range: Range): Promise<FetchResult<Row>> {
		this.fetchCount++;
		const items: Row[] = [];
		const end = Math.min(range.start + range.length, this.total);
		for (let i = range.start; i < end; i++) {
			items.push({ id: String(i), total_count: this.total });
		}
		return { items, meta: { totalCount: this.total } };
	}
}

/** Let async fetches + the 60ms visible-range debounce settle. */
const settle = () => new Promise((r) => setTimeout(r, 120));

Deno.test('DataManager · revalidate() refetches on an UNCHANGED source (recovers a persisted list after client nav)', async () => {
	const source = new CountingSource(3);
	const manager = new DataManager<Row, Row>({ dataSource: source, pageSize: 20 });

	// Simulate the host mount: updateDataSource + the virtualiser reporting a visible window.
	manager.updateDataSource(source);
	manager.setVisibleRange(0, 2);
	await settle();

	assertEquals(manager.dataset.value.totalCount, 3, 'initial load resolves the count');
	assertEquals(manager.dataset.value.order.length, 3, 'initial load populates the rows');
	const fetchesAfterLoad = source.fetchCount;
	assert(fetchesAfterLoad >= 1, 'the initial mount fetched at least once');

	// The list is now "persisted" — the same source reference, data already present. A plain
	// re-render (updateDataSource with the same source) must NOT refetch...
	manager.updateDataSource(source);
	await settle();
	assertEquals(source.fetchCount, fetchesAfterLoad, 'a no-op re-render does not refetch');

	// ...but a navigation revalidation MUST refetch and repopulate, even though nothing changed.
	manager.revalidate();
	await settle();

	assert(
		source.fetchCount > fetchesAfterLoad,
		'revalidate() issues a fresh fetch on the unchanged source',
	);
	assertEquals(manager.dataset.value.order.length, 3, 'the list is repopulated, never left empty');
});

Deno.test('DataManager · updateDataSource() revives a destroyed manager (Fresh reusing a preserved island)', async () => {
	const source = new CountingSource(2);
	const manager = new DataManager<Row, Row>({ dataSource: source, pageSize: 20 });

	manager.updateDataSource(source);
	manager.setVisibleRange(0, 1);
	await settle();
	assertEquals(manager.dataset.value.order.length, 2, 'initial load populated');

	// Host unmounts → destroy(); then Fresh preserves & reuses the island, re-running updateDataSource.
	manager.destroy();
	manager.updateDataSource(source);
	manager.setVisibleRange(0, 1);
	await settle();

	assertEquals(
		manager.dataset.value.order.length,
		2,
		'a revived manager fetches again instead of staying empty',
	);
});
