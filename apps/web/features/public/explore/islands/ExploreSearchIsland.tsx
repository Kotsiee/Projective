import '../styles/islands/search.css';
import { useEffect } from 'preact/hooks';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import ExploreSearchHeaderSearch from '../components/search/header-search.tsx';
import ExploreSearchHeaderActions from '../components/search/header-actions.tsx';
import ExploreSearchFilters from '../components/search/filters.tsx';
import ExploreSearchResults from '../components/search/results/results.tsx';
import { ExploreContext, useExploreContext } from '../contexts/ExploreContext.tsx';

/**
 * @function ExploreSearchIsland
 * @description The high-density discovery matrix. An extended middle-nav header sits above a
 * workspace that conditionally mounts the collapsible filter sidebar (single-entity view only) and
 * the results canvas (federated sections or an isolated entity layout + inspector).
 *
 * The filter sidebar is projected into the global side navigation via `setMiddleNav` (the same
 * tunnelling pattern the profile rail + dashboard stage layout use). An inline fallback is rendered
 * for guests (for whom the middle-nav chrome is gated off) and CSS-hidden when the docked version
 * is active — so there's never a duplicate.
 */
export default function ExploreSearchIsland({ authenticated = false }: { authenticated?: boolean }) {
	const ctx = useExploreContext();
	const { isFiltersOpen, entityType } = ctx;
	const { setMiddleNav } = useNavigationContext();

	// Guardrail: the filter sidebar is only available once a concrete entity type is isolated.
	const showFilters = isFiltersOpen.value && entityType.value !== 'all';

	// Project the collapsible filter layout into the global middle-nav side slot.
	useEffect(() => {
		if (showFilters) {
			setMiddleNav({
				show: true,
				sideWidth: '300px',
				sideContent: (
					<ExploreContext.Provider value={ctx}>
						<div class='explore-filters-dock'>
							<ExploreSearchFilters />
						</div>
					</ExploreContext.Provider>
				),
			});
		} else {
			setMiddleNav({ show: false, sideWidth: '0px', sideContent: null });
		}
	}, [showFilters, entityType.value]);

	// Tear down on unmount so filters don't leak into other routes.
	useEffect(() => () => setMiddleNav({ show: false, sideWidth: '0px', sideContent: null }), []);

	return (
		<div class='explore-search'>
			<div class='explore-search__header'>
				<ExploreSearchHeaderSearch />
				<ExploreSearchHeaderActions />
			</div>

			<div class={`explore-search__content ${showFilters ? 'explore-search__content--filtered' : ''}`}>
				{/* Guests get the inline sidebar (their middle-nav chrome is gated off); authenticated
				    users get the docked version projected via setMiddleNav above — never both. */}
				{showFilters && !authenticated && (
					<aside class='explore-search__filters'>
						<ExploreSearchFilters />
					</aside>
				)}
				<main class='explore-search__main'>
					<ExploreSearchResults />
				</main>
			</div>
		</div>
	);
}
