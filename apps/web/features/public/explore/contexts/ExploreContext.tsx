import { ComponentChildren, createContext } from 'preact';
import { useContext, useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { EntityType, ExploreEntity } from '@projective/types';
import { DEFAULT_FILTERS, EntityFilter, ExploreState, UserRole } from '../contracts/Explore.ts';
import { byId } from '../data/exploreSeed.ts';

// #region 1. CONTEXT INITIALIZATION
// Exported so content projected into the global middle-nav via `setMiddleNav` (which renders
// OUTSIDE this island's provider tree) can re-wrap itself with the same context value.
export const ExploreContext = createContext<ExploreState | null>(null);
// #endregion

// #region 2. PROVIDER PROPS
export interface ExploreProviderProps {
	query?: string | null;
	initialEntityType?: EntityFilter;
	initialSort?: ExploreState['sort']['value'];
	initialFiltersOpen?: boolean;
	/** Session role. Real auth wiring is a TODO — driven by `?role=` for now. */
	initialRole?: UserRole;
	children: ComponentChildren;
}
// #endregion

const ENTITY_VALUES: EntityFilter[] = [
	'all',
	'service',
	'product',
	'person',
	'team',
	'business',
	'project',
];

/**
 * @function ExploreProvider
 * @description Injects the reactive state tree for the Explore discovery engine. Handles SSR-safe
 * client hydration from URL parameters. State also flows back to the URL (via `replaceState`) so any
 * discovery view is shareable.
 */
export function ExploreProvider(props: ExploreProviderProps) {
	// #region 3. SIGNAL INSTANTIATION
	const exploreQuery = useSignal<string | null>(props.query || null);
	const entityType = useSignal<EntityFilter>(props.initialEntityType || 'all');
	const sort = useSignal<ExploreState['sort']['value']>(props.initialSort || 'recommended');
	const filters = useSignal({ ...DEFAULT_FILTERS });
	const selectedItem = useSignal<ExploreEntity | null>(null);
	const isFiltersOpen = useSignal<boolean>(props.initialFiltersOpen ?? false);
	const userRole = useSignal<UserRole>(props.initialRole || 'guest');
	// #endregion

	// #region 4. HYDRATION (On Mount)
	useEffect(() => {
		if (typeof globalThis === 'undefined' || !globalThis.location) return;
		const p = new URLSearchParams(globalThis.location.search);

		const q = p.get('q');
		if (q) exploreQuery.value = q;

		const tab = p.get('type') as EntityFilter | null;
		if (tab && ENTITY_VALUES.includes(tab)) entityType.value = tab;

		const s = p.get('sort');
		if (s) sort.value = s as ExploreState['sort']['value'];

		const role = p.get('role') as UserRole | null;
		if (role && ['guest', 'client', 'freelancer'].includes(role)) userRole.value = role;

		const previewId = p.get('preview_id');
		if (previewId) {
			const found = byId(previewId);
			if (found) selectedItem.value = found;
		}
	}, []);
	// #endregion

	// #region 5. URL SYNC (share-ability)
	useEffect(() => {
		if (typeof globalThis === 'undefined' || !globalThis.location) return;
		const url = new URL(globalThis.location.href);

		if (exploreQuery.value) url.searchParams.set('q', exploreQuery.value);
		else url.searchParams.delete('q');

		if (entityType.value !== 'all') url.searchParams.set('type', entityType.value);
		else url.searchParams.delete('type');

		if (sort.value !== 'recommended') url.searchParams.set('sort', sort.value);
		else url.searchParams.delete('sort');

		if (selectedItem.value) url.searchParams.set('preview_id', selectedItem.value.id);
		else url.searchParams.delete('preview_id');

		globalThis.history.replaceState({}, '', url.toString());
	}, [exploreQuery.value, entityType.value, sort.value, selectedItem.value]);
	// #endregion

	// Isolating on a concrete entity type resets any inspector selection cleanly.
	useEffect(() => {
		filters.value = { ...filters.value, entity_type: entityType.value === 'all' ? null : entityType.value as EntityType };
		if (entityType.value === 'all') selectedItem.value = null;
	}, [entityType.value]);

	return (
		<ExploreContext.Provider
			value={{ exploreQuery, entityType, sort, filters, selectedItem, isFiltersOpen, userRole }}
		>
			{props.children}
		</ExploreContext.Provider>
	);
}

export function useExploreContext(): ExploreState {
	const ctx = useContext(ExploreContext);
	if (!ctx) {
		throw new Error('useExploreContext must be used within an ExploreProvider boundary');
	}
	return ctx;
}
