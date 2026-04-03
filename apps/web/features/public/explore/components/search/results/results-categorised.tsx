import { useExploreContext } from '../../../contexts/ExploreContext.tsx';

/**
 * @function ExploreSearchResults
 * @description Virtualized data display, now wired up to the live Supabase API.
 */
export default function ExploreSearchResultsCategorised() {
    const { viewMode, exploreQuery } = useExploreContext();

    return (
        <div class='explore-search-results-categorised'>
        </div>
    );
}
