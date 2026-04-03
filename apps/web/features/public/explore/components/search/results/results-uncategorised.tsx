import '../../../styles/components/search/results/results-uncategorised.css';
import { StringModifier } from '@projective/utils';
import { useExploreContext } from '../../../contexts/ExploreContext.tsx';
import { DataDisplay, RestDataSource } from '@projective/data';
import { useEffect, useMemo } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { SearchType } from '../../../contracts/Explore.ts';
import ExploreSearchResultsDetails from './results-details.tsx';
import { Button } from '@projective/ui';
import { IconChevronRight } from '@tabler/icons-preact';
import ExploreSearchResultsListItem from '@features/public/explore/components/search/results/results-card-list.tsx';

export default function ExploreSearchResultsUncategorised() {
	const { viewMode, exploreQuery, selectedItem } = useExploreContext();
	const sections: SearchType[] = [
		'projects',
		'services',
		'people',
	];

	// Clear the selected item when the user types a new search query
	useEffect(() => {
		selectedItem.value = null;
	}, [exploreQuery.value]);

	return (
		<div class='explore-search-results-uncategorised'>
			<div class='explore-search-results-uncategorised__sections'>
				{sections.map((section) => (
					<ExploreSearchResultsUncategorisedSection key={section} section={section} />
				))}
			</div>
			{viewMode.value === 'list' && <ExploreSearchResultsDetails />}
		</div>
	);
}

function ExploreSearchResultsUncategorisedSection({ section }: { section: SearchType }) {
	const { exploreQuery, viewMode, selectedItem } = useExploreContext();
	const resultCount = useSignal<number | null>(null);

	const name = StringModifier.titleCase(section);

	// #region 1. Visibility Check & Fallback Auto-Select
	useEffect(() => {
		let isMounted = true;
		resultCount.value = null;

		const params = new URLSearchParams({
			query: exploreQuery.value || '',
			limit: '1',
		});

		fetch(`/api/v1/public/search/${section}?${params.toString()}`)
			.then((res) => {
				if (!res.ok) throw new Error('API Error');
				return res.json();
			})
			.then((data) => {
				if (!isMounted) return;

				resultCount.value = data.meta?.totalCount ?? 0;

				// AUTO-SELECT FALLBACK: Only fires if Context didn't already find a preview_id
				// in the URL, AND the user is in list mode.
				if (
					viewMode.value === 'list' &&
					!selectedItem.value &&
					data.items &&
					data.items.length > 0
				) {
					const firstItem = data.items[0];
					selectedItem.value = firstItem;

					// Silently append to URL so it can be copied cleanly
					const newUrl = new URL(globalThis.location.href);
					const firstId = firstItem.id || firstItem.project_id || firstItem.service_id ||
						firstItem.entity_id;

					newUrl.searchParams.set('preview_id', firstId);
					newUrl.searchParams.set('preview_type', section);
					globalThis.history.replaceState({}, '', newUrl.toString());
				}
			})
			.catch(() => {
				if (isMounted) resultCount.value = 0;
			});

		return () => {
			isMounted = false;
		};
	}, [exploreQuery.value, section, viewMode.value]);
	// #endregion

	// #region 2. Data Source Initialization
	const dataSource = useMemo(() => {
		return new RestDataSource({
			url: `/api/v1/public/search/${section}`,
			defaultParams: { query: exploreQuery.value || '' },
			keyExtractor: (item: any) => item.id || item.entity_id || item.project_id || item.service_id,
		});
	}, [exploreQuery.value, section]);
	// #endregion

	if (resultCount.value === 0) return null;

	return (
		<div style={{ display: resultCount.value === null ? 'none' : 'flex' }}>
			<section class='explore-search-results-uncategorised__section'>
				<div class='explore-search-results-uncategorised__section-header'>
					<h2>{name}</h2>
					<a
						href={`/explore?tab=${section}`}
						className='explore-search-results-uncategorised__view-all'
					>
						<span>View all {name}</span>
						<IconChevronRight />
					</a>
				</div>
				<div class='explore-search-results-uncategorised__section-content'>
					<DataDisplay
						dataSource={dataSource}
						mode={viewMode.value}
						columnWidth={260}
						gap={16}
						estimateHeight={110}
						scrollMode='window'
						renderItem={(item: any) => <ExploreSearchResultsListItem type={section} data={item} />}
					/>
				</div>

				{resultCount.value !== null && resultCount.value > 20 && (
					<div class='explore-search-results-uncategorised__section-footer'>
						<Button
							className='explore-search-results-uncategorised__view-more'
							variant='secondary'
							ghost
							onClick={() => globalThis.location.href = `/explore?tab=${section}`}
						>
							View More
						</Button>
					</div>
				)}
			</section>
		</div>
	);
}
