import { ComponentChildren, createContext } from 'preact';
import { useContext, useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { EntityType, ExploreEntity } from '@projective/types';
import {
	DEFAULT_FILTERS,
	EMPTY_SECTIONS,
	EntityFilter,
	ExploreState,
	SearchSections,
	UserRole,
} from '../contracts/Explore.ts';
import { byId, recommended, search } from '../data/exploreSeed.ts';
import { SearchService } from '../services/SearchService.ts';

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

	// Live results state (populated by useLiveSearch on the search island; seed fallback).
	const results = useSignal<ExploreEntity[]>([]);
	const sections = useSignal<SearchSections>({ ...EMPTY_SECTIONS });
	const loading = useSignal<boolean>(false);
	const totalCount = useSignal<number>(0);
	const usingSeed = useSignal<boolean>(true);
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
		filters.value = {
			...filters.value,
			entity_type: entityType.value === 'all' ? null : entityType.value as EntityType,
		};
		if (entityType.value === 'all') selectedItem.value = null;
	}, [entityType.value]);

	return (
		<ExploreContext.Provider
			value={{
				exploreQuery,
				entityType,
				sort,
				filters,
				selectedItem,
				isFiltersOpen,
				userRole,
				results,
				sections,
				loading,
				totalCount,
				usingSeed,
			}}
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

// #region 6. LIVE SEARCH (backend-wired, seed fallback)

/** Build the federated section buckets from the seed — instant paint + fallback. */
function seedGlobal(q: string | null): SearchSections {
	const query = q ?? '';
	const bucket = (t: EntityType) => search(t, query, DEFAULT_FILTERS, 'recommended');
	return {
		recommended: recommended().filter((e) =>
			!query ||
			`${e.display_title} ${e.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())
		),
		service: bucket('service'),
		person: bucket('person'),
		product: bucket('product'),
		project: bucket('project'),
	};
}

function sectionsTotal(s: SearchSections): number {
	return s.service.length + s.person.length + s.product.length + s.project.length;
}

/**
 * @hook useLiveSearch
 * @description Drives the search results off the live ranking endpoint. Reads the reactive facets
 * (query / entity type / sort / filters), paints the seed immediately for a rich first frame, then
 * debounces a call to {@link SearchService.query}. The live response replaces the seed only when it
 * returns real rows — so an empty/unavailable backend gracefully keeps the seeded showcase. Call once
 * from the search island (NOT the home hub, which renders the seed directly).
 */
export function useLiveSearch(): void {
	const {
		exploreQuery,
		entityType,
		sort,
		filters,
		results,
		sections,
		loading,
		totalCount,
		usingSeed,
	} = useExploreContext();

	useEffect(() => {
		const q = exploreQuery.value ?? '';
		const type = entityType.value;

		// 1. Instant seed paint (doubles as the fallback).
		if (type === 'all') {
			const seed = seedGlobal(q);
			sections.value = seed;
			totalCount.value = sectionsTotal(seed);
		} else {
			const seed = search(type as EntityType, q, filters.value, sort.value);
			results.value = seed;
			totalCount.value = seed.length;
		}
		usingSeed.value = true;
		loading.value = true;

		// 2. Live query (debounced) — replaces the seed only on real data.
		let cancelled = false;
		const timer = setTimeout(async () => {
			try {
				const data = await SearchService.query({
					query: q,
					type,
					sort: sort.value,
					filters: filters.value,
				});
				if (cancelled) return;

				if (data.mode === 'global') {
					const live: SearchSections = {
						recommended: data.recommended,
						service: data.sections.service,
						person: data.sections.person,
						// The ranking engine has no product bucket — keep the seeded products.
						product: sections.value.product,
						project: data.sections.project,
					};
					if (data.recommended.length + sectionsTotal(live) > 0) {
						sections.value = live;
						totalCount.value = sectionsTotal(live);
						usingSeed.value = false;
					}
				} else if (data.items.length > 0) {
					results.value = data.items;
					totalCount.value = data.count;
					usingSeed.value = false;
				}
			} catch (_) {
				// Live backend unavailable — the seed paint from step 1 stands.
			} finally {
				if (!cancelled) loading.value = false;
			}
		}, 280);

		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [exploreQuery.value, entityType.value, sort.value, JSON.stringify(filters.value)]);
}

// #endregion
