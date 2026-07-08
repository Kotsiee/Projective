import '../../styles/components/search/header-actions.css';
import { Button } from '@projective/ui';
import { IconAdjustmentsHorizontal, IconArrowsSort } from '@tabler/icons-preact';
import { SelectField, SelectOption } from '@projective/fields';
import { useComputed } from '@preact/signals';
import type { ExploreSort } from '@projective/types';
import { useExploreContext } from '../../contexts/ExploreContext.tsx';

const SORT_OPTIONS: SelectOption<ExploreSort>[] = [
	{ label: 'Recommended', value: 'recommended' },
	{ label: 'Top rated', value: 'rating' },
	{ label: 'Most recent', value: 'recent' },
	{ label: 'Price', value: 'price' },
	{ label: 'Most popular', value: 'popularity' },
];

/**
 * @function ExploreSearchHeaderActions
 * @description Lower band of the extended header: result summary, the filter-workspace toggle, and
 * the sort dropdown. Sorting + filtering are guard-railed OFF in the federated (multi-entity) view.
 */
export default function ExploreSearchHeaderActions() {
	const { exploreQuery, entityType, sort, isFiltersOpen, totalCount, loading } =
		useExploreContext();

	const isFederated = useComputed(() => entityType.value === 'all');

	return (
		<div class='explore-actions'>
			<div class='explore-actions__left'>
				<Button
					rounded
					outlined={!isFiltersOpen.value}
					ghost={!isFiltersOpen.value}
					variant={isFiltersOpen.value ? 'primary' : 'secondary'}
					disabled={isFederated.value}
					startIcon={<IconAdjustmentsHorizontal size={16} />}
					onClick={() => isFiltersOpen.value = !isFiltersOpen.value}
					aria-label={isFiltersOpen.value ? 'Hide filters' : 'Show filters'}
				>
					Filters
				</Button>
				<p class='explore-actions__summary'>
					<strong>{totalCount.value}</strong> results
					{exploreQuery.value
						? (
							<>
								for <span>“{exploreQuery.value}”</span>
							</>
						)
						: null}
					{loading.value
						? <span class='explore-actions__hint'>· searching…</span>
						: isFederated.value && (
							<span class='explore-actions__hint'>· pick a type to sort &amp; filter</span>
						)}
				</p>
			</div>

			<div class='explore-actions__right'>
				<span class='explore-actions__sort-icon'>
					<IconArrowsSort size={16} />
				</span>
				<div class='explore-actions__sort'>
					<SelectField<ExploreSort>
						options={SORT_OPTIONS}
						value={sort}
						onChange={(val) => sort.value = val as ExploreSort}
						displayMode='chips-inside'
						disabled={isFederated.value}
					/>
				</div>
			</div>
		</div>
	);
}
