import '@styles/pages/public/explore/search.css';
import SearchBar from '@components/public/explore/SearchBar.tsx';
import { signal } from '@preact/signals';
import { IconLayout2Filled, IconList } from '@tabler/icons-preact';
import ExploreFilters from '@components/public/explore/Filters.tsx';

const showFilters = signal(true);
const displayType = signal(true);

export default function SearchIsland({ query }: { query: string }) {
	return (
		<div class='search-page'>
			<section class='search-page__search'>
				<h1 class='search-page__search__title'>{query}</h1>
				<div class='search-page__search__related'>
					<span>Related:</span>
				</div>
				<SearchBar />
			</section>
			<section class='search-page__options'>
				<div class='search-page__options__top'>
					<div class='search-page__options__toggle-filter'>
						<label for='search-page__options__toggle-filter'>
							<input
								type='checkbox'
								name='search-page__options__toggle-filter--toggle'
								id='search-page__options__toggle-filter'
								onInput={() => showFilters.value = !showFilters.value}
								checked={showFilters.value}
								hidden
							/>
							Filters
						</label>
					</div>
					<div class='search-page__options__categories'>
						<label>
							<input type='radio' value='work' name='search-page__options__categories' hidden />
							Work
						</label>
						<label>
							<input
								type='radio'
								value='resources'
								name='search-page__options__categories'
								hidden
							/>
							Resources
						</label>
						<label>
							<input type='radio' value='projects' name='search-page__options__categories' hidden />
							Projects
						</label>
					</div>
					<div class='search-page__options__sort'>
						<button type='button'>Sort</button>
					</div>
				</div>

				<div class='search-page__options__bottom'>
					<div class='search-page__options__results-count'>
						<p type='button'>Showing 472 results for "{query}" category</p>
					</div>
					<div class='search-page__options__category-type'>
						<label>
							<input
								type='radio'
								value='resources-templates'
								name='search-page__options__category-type'
								hidden
							/>
							Templates
						</label>
						<label>
							<input
								type='radio'
								value='resources-products'
								name='search-page__options__category-type'
								hidden
							/>
							Products
						</label>
						<label>
							<input
								type='radio'
								value='resources-articles'
								name='search-page__options__category-type'
								hidden
							/>
							Articles
						</label>
						<label>
							<input
								type='radio'
								value='resources-courses'
								name='search-page__options__category-type'
								hidden
							/>
							Courses
						</label>
					</div>
					<div class='search-page__options__layout'>
						<label for='search-page__options__layout--layout-list'>
							<input
								type='radio'
								value='layout-list'
								name='search-page__options__layout'
								id='search-page__options__layout--layout-list'
								hidden
								checked={!displayType.value}
								onInput={() => displayType.value = false}
							/>
							<IconList />
						</label>
						<label for='search-page__options__layout--layout-grid'>
							<input
								type='radio'
								value='layout-grid'
								name='search-page__options__layout'
								id='search-page__options__layout--layout-grid'
								hidden
								checked={displayType.value}
								onInput={() => displayType.value = true}
							/>
							<IconLayout2Filled />
						</label>
					</div>
				</div>
			</section>
			<div class='search-page__results'>
				{showFilters.value &&
					(
						<aside class='search-page__results__filters__container'>
							<ExploreFilters />
						</aside>
					)}
				<div class='search-page__results__content'>
					Search Results
				</div>
			</div>
		</div>
	);
}
