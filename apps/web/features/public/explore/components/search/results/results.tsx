import { useExploreContext } from '../../../contexts/ExploreContext.tsx';
import ExploreSearchResultsCategorised from './results-categorised.tsx';
import ExploreSearchResultsUncategorised from './results-uncategorised.tsx';

/**
 * @function ExploreSearchResults
 * @description Virtualized data display, now wired up to the live Supabase API.
 */
export default function ExploreSearchResults() {
	const { searchType } = useExploreContext();

	if (searchType.value != 'all') {
		return <ExploreSearchResultsCategorised />;
	}

	return <ExploreSearchResultsUncategorised />;
}
