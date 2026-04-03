import { ComponentChildren, createContext } from 'preact';
import { useContext, useEffect } from 'preact/hooks';
import { effect, useSignal } from '@preact/signals';
import { ExploreState, SearchType, SortType, ViewMode } from '../contracts/Explore.ts';

// #region 1. CONTEXT INITIALIZATION
const ExploreContext = createContext<ExploreState | null>(null);
// #endregion

// #region 2. PROVIDER PROPS
export interface ExploreProviderProps {
	query?: string | null;
	initialViewMode?: ViewMode;
	initialTab?: SearchType;
	initialSort?: SortType;
	initialSelectedId?: string | null;
	initialFiltersOpen?: boolean;
	children: ComponentChildren;
}
// #endregion

/**
 * @function ExploreProvider
 * @description Injects the reactive state tree for the Explore discovery engine.
 * Handles SSR-safe client hydration from LocalStorage and URL Parameters.
 */
export function ExploreProvider(props: ExploreProviderProps) {
	// #region 3. SIGNAL INSTANTIATION
	const exploreQuery = useSignal<string | null>(props.query || null);
	const viewMode = useSignal<ViewMode>(props.initialViewMode || 'list');
	const searchType = useSignal<SearchType>(props.initialTab || 'all');
	const sortType = useSignal<SortType>(props.initialSort || 'recommended');
	const selectedItem = useSignal<any | null>(null);
	const isFiltersOpen = useSignal<boolean>(props.initialFiltersOpen || true);
	// #endregion

	// #region 4. HYDRATION (On Mount)
	useEffect(() => {
		if (typeof globalThis === 'undefined') return;

		const urlParams = new URLSearchParams(globalThis.location.search);

		const localView = localStorage.getItem('explore_view_mode') as ViewMode | null;
		const urlView = urlParams.get('view') as ViewMode | null;

		if (localView) {
			viewMode.value = localView;
		} else if (urlView) {
			viewMode.value = urlView;
		}

		const urlQuery = urlParams.get('q');
		if (urlQuery) exploreQuery.value = urlQuery;

		const urlTab = urlParams.get('tab') as SearchType | null;
		if (urlTab) searchType.value = urlTab;

		const urlSort = urlParams.get('sort') as SortType | null;
		if (urlSort) sortType.value = urlSort;

		const previewId = urlParams.get('preview_id');
		const previewType = urlParams.get('preview_type');
		if (previewId) {
			selectedItem.value = { id: previewId, type: previewType, fetchNeeded: true };
		}
	}, []);
	// #endregion

	useEffect(() => {
		if (typeof globalThis === 'undefined') return;

		// Sync View Mode to LocalStorage
		localStorage.setItem('explore_view_mode', viewMode.value);

		// Sync core parameters to URL via replaceState (so we don't spam the back-button history)
		const url = new URL(globalThis.location.href);

		if (exploreQuery.value) url.searchParams.set('q', exploreQuery.value);
		else url.searchParams.delete('q');

		if (searchType.value !== 'all') url.searchParams.set('tab', searchType.value);
		else url.searchParams.delete('tab');

		if (sortType.value !== 'recommended') url.searchParams.set('sort', sortType.value);
		else url.searchParams.delete('sort');

		if (viewMode.value !== 'list') url.searchParams.set('view', viewMode.value);
		else url.searchParams.delete('view');

		globalThis.history.replaceState({}, '', url.toString());
	}, [exploreQuery.value, viewMode.value, searchType.value, sortType.value]);
	// #endregion

	return (
		<ExploreContext.Provider
			value={{
				exploreQuery,
				viewMode,
				searchType,
				sortType,
				selectedItem,
				isFiltersOpen,
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
