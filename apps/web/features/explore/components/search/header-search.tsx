import '../../styles/components/search/header-search.css';
import { StringModifier } from '../../../../utils/pipes/StringModifier.ts';
import { useExploreContext } from '../../contexts/ExploreContext.tsx';
import { SearchTab } from '../../contracts/Explore.ts';
import ExploreSearch from '../shared/search.tsx';

export default function ExploreSearchHeaderSearch() {
	const { exploreQuery, searchTab } = useExploreContext();

	const handleSearch = (term: string, type: string) => {
		exploreQuery.value = term;
		searchTab.value = type as SearchTab;
	};

	return (
		<div class='explore-search-header-search'>
			<div class='explore-search-header-search__header'>
				<h1 class='explore-search-header-search__title'>
					{StringModifier.titleCase(exploreQuery.value || 'Discover Everything')}
				</h1>
			</div>
			<div class='explore-search-header-search__input'>
				<ExploreSearch onSearch={handleSearch} />
			</div>
		</div>
	);
}
