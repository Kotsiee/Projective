import '../styles/islands/search.css';
import ExploreSearchHeaderActions from '../components/search/header-actions.tsx';
import ExploreSearchHeaderSearch from '../components/search/header-search.tsx';
import ExploreSearchResults from '../components/search/results.tsx';
import ExploreSearchFilters from '../components/search/filters.tsx';
import { useExploreContext } from '../contexts/ExploreContext.tsx';

/**
 * @function ExploreSearchIsland
 * @description The main layout wrapper for the search interface.
 * Reacts to global context state to mount/unmount the sidebar.
 */
export default function ExploreSearchIsland() {
	const { isFiltersOpen, searchTab } = useExploreContext();

	// Only show filters if toggled ON and we are NOT in the federated carousel view
	const showFilters = isFiltersOpen.value && searchTab.value !== 'all';

	return (
		<div class='explore-search'>
			<div class='explore-search__header'>
				<ExploreSearchHeaderSearch />
				<ExploreSearchHeaderActions />
			</div>

			<div class='explore-search__content'>
				{/* Conditionally render the sticky sidebar */}
				{showFilters && (
					<div class='explore-search__filters'>
						<ExploreSearchFilters />
					</div>
				)}

				<div class='explore-search__results'>
					<ExploreSearchResults />
				</div>
			</div>
		</div>
	);
}
