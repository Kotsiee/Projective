import { ComponentChildren, createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { ExploreState, SearchTab, SortType, ViewMode } from '../contracts/Explore.ts';

// #region 1. CONTEXT INITIALIZATION
const ExploreContext = createContext<ExploreState | null>(null);
// #endregion

// #region 2. PROVIDER PROPS
/**
 * @interface ExploreProviderProps
 */
export interface ExploreProviderProps {
	query?: string | null;
	initialViewMode?: ViewMode;
	initialTab?: SearchTab;
	initialSort?: SortType;
	initialSelectedId?: string | null;
	initialFiltersOpen?: boolean;
	children: ComponentChildren;
}
// #endregion

/**
 * @function ExploreProvider
 * @description Injects the reactive state tree for the Explore discovery engine.
 */
export function ExploreProvider(props: ExploreProviderProps) {
	const {
		query = null,
		initialViewMode = 'grid',
		initialTab = 'all',
		initialSort = 'recommended',
		initialSelectedId = null,
		initialFiltersOpen = true,
		children,
	} = props;

	// #region 3. SIGNAL INSTANTIATION
	const exploreQuery = useSignal<string | null>(query);
	const viewMode = useSignal<ViewMode>(initialViewMode);
	const searchTab = useSignal<SearchTab>(initialTab);
	const sortType = useSignal<SortType>(initialSort);
	const selectedItemId = useSignal<string | null>(initialSelectedId);
	const isFiltersOpen = useSignal<boolean>(initialFiltersOpen);
	// #endregion

	return (
		<ExploreContext.Provider
			value={{
				exploreQuery,
				viewMode,
				searchTab,
				sortType,
				selectedItemId,
				isFiltersOpen,
			}}
		>
			{children}
		</ExploreContext.Provider>
	);
}

/**
 * @function useExploreContext
 * @description Hook to consume the Explore state. Must be used within an ExploreProvider Island.
 * @throws {Error} If called outside of the ExploreProvider tree.
 */
export function useExploreContext(): ExploreState {
	const ctx = useContext(ExploreContext);
	if (!ctx) {
		throw new Error('useExploreContext must be used within an ExploreProvider boundary');
	}
	return ctx;
}
