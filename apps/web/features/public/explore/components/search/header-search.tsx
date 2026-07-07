import '../../styles/components/search/header-search.css';
import { useComputed } from '@preact/signals';
import { useExploreContext } from '../../contexts/ExploreContext.tsx';
import ExploreSearch from '../shared/search.tsx';
import { EntityFilter } from '../../contracts/Explore.ts';
import { relatedSearches } from '../../data/exploreSeed.ts';

function titleCase(s: string): string {
	return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

// Dynamic visual theme per active entity type (multi-entity style when 'all').
const THEME: Record<string, { accent: string; glyph: string; label: string }> = {
	all: { accent: 'multi', glyph: '✳', label: 'Everything' },
	service: { accent: 'mint', glyph: '🛠', label: 'Services' },
	product: { accent: 'amber', glyph: '📦', label: 'Products' },
	person: { accent: 'violet', glyph: '🧑‍💻', label: 'Profiles' },
	team: { accent: 'violet', glyph: '👥', label: 'Teams' },
	business: { accent: 'violet', glyph: '🏢', label: 'Businesses' },
	project: { accent: 'ocean', glyph: '🚀', label: 'Projects' },
};

/**
 * @function ExploreSearchHeaderSearch
 * @description The upper band of the extended middle-nav header. Its visual theme (accent glow +
 * graphic glyph + eyebrow) is driven dynamically by the active entity type — or a multi-entity
 * treatment when 'All' is selected. Below: contextual "related search" tags and the wide search
 * input paired with the native entity-type dropdown.
 */
export default function ExploreSearchHeaderSearch() {
	const { exploreQuery, entityType } = useExploreContext();

	const theme = useComputed(() => THEME[entityType.value] ?? THEME.all);

	const handleSearch = (term: string, type: EntityFilter) => {
		exploreQuery.value = term || null;
		entityType.value = type;
	};

	const related = relatedSearches(exploreQuery.value);

	return (
		<div class={`explore-search-header accent-${theme.value.accent}`}>
			{/* Dynamic themed graphic asset */}
			<div class='explore-search-header__glow' aria-hidden='true' />
			<div class='explore-search-header__topline'>
				<div class='explore-search-header__headline'>
					<span class='explore-search-header__eyebrow'>
						<span class='explore-search-header__glyph' aria-hidden='true'>{theme.value.glyph}</span>
						{entityType.value === 'all' ? 'Search results' : theme.value.label}
					</span>
					<h1 class='explore-search-header__title'>
						{exploreQuery.value ? titleCase(exploreQuery.value) : 'Discover Everything'}
					</h1>
				</div>
			</div>

			<div class='explore-search-header__related'>
				<span class='explore-search-header__related-label'>Related</span>
				<div class='explore-search-header__related-tags'>
					{related.map((term) => (
						<button
							type='button'
							key={term}
							class='explore-search-header__related-tag'
							onClick={() => exploreQuery.value = term}
						>
							{term}
						</button>
					))}
				</div>
			</div>

			<div class='explore-search-header__input'>
				<ExploreSearch
					onSearch={handleSearch}
					initialQuery={exploreQuery.value ?? ''}
					initialType={entityType.value}
					size='lg'
				/>
			</div>
		</div>
	);
}
