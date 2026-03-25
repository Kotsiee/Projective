import '../../styles/components/search/header-actions.css';
import { Button, ButtonGroup, IconButton } from '@projective/ui';
import { IconArrowsUpDown, IconFilter, IconGridDots, IconList } from '@tabler/icons-preact';
import { SelectField, SelectOption } from '@projective/fields';
import { useExploreContext } from '../../contexts/ExploreContext.tsx';
import { useSignal } from '@preact/signals';
import { SearchTab } from '../../contracts/Explore.ts';

// #region 1. CONSTANTS
type SortType = 'recommended' | 'price' | 'rating' | 'recent' | 'popularity';

const SORT_OPTIONS: SelectOption<SortType>[] = [
	{ label: 'Recommended', value: 'recommended' },
	{ label: 'Rating', value: 'rating' },
	{ label: 'Recent', value: 'recent' },
	{ label: 'Price', value: 'price' },
	{ label: 'Popularity', value: 'popularity' },
];
// #endregion

/**
 * @function ExploreSearchHeaderActions
 * @description Toolbar for filtering, sorting, and toggling the results view layout.
 */
export default function ExploreSearchHeaderActions() {
	const { exploreQuery, viewMode, isFiltersOpen, searchTab } = useExploreContext();
	const sortType = useSignal<SortType>('recommended');

	// Boolean helper to determine if we are in the master/federated view
	const isFederatedView = searchTab.value === 'all';

	return (
		<div class='explore-search-header-actions'>
			{/* --- LEFT: Filter Toggle & Summary --- */}
			<div class='explore-search-header-actions__left'>
				<Button
					rounded
					outlined
					// Force ghost mode and disable if in federated view
					disabled={isFederatedView}
					ghost={!isFiltersOpen.value || isFederatedView}
					variant={isFiltersOpen.value && !isFederatedView ? 'primary' : 'secondary'}
					className='explore-search-header-actions__toggle-filter__btn'
					onClick={() => isFiltersOpen.value = !isFiltersOpen.value}
					aria-label={isFiltersOpen.value ? 'Hide filters' : 'Show filters'}
				>
					<div className='explore-search-header-actions__toggle-filter'>
						<span>Filters</span>
						<IconFilter size={16} />
					</div>
				</Button>
				<p className='explore-search-header-actions__search-summary'>
					Showing <span>428</span> results for "<span>{exploreQuery.value}</span>" <span></span>
				</p>
			</div>

			{/* --- CENTER: Federated Tabs --- */}
			<div class='explore-search-header-actions__center'>
				<div class='explore-search-header-actions__groups'>
					<ButtonGroup>
						<Button
							variant={searchTab.value === 'work' ? 'primary' : 'secondary'}
							ghost={searchTab.value !== 'work'}
							onClick={() => searchTab.value = 'work'}
						>
							People
						</Button>
						<Button
							variant={searchTab.value === 'projects' ? 'primary' : 'secondary'}
							ghost={searchTab.value !== 'projects'}
							onClick={() => searchTab.value = 'projects'}
						>
							Projects
						</Button>
						<Button
							variant={searchTab.value === 'services' ? 'primary' : 'secondary'}
							ghost={searchTab.value !== 'services'}
							onClick={() => searchTab.value = 'services'}
						>
							Services
						</Button>
					</ButtonGroup>
				</div>
			</div>

			{/* --- RIGHT: Sort & Layout Toggle --- */}
			<div class='explore-search-header-actions__right'>
				<div class='explore-search-header-actions__sort'>
					<IconButton
						variant='secondary'
						outlined
						aria-label='Sort Direction'
						disabled={isFederatedView}
					>
						<IconArrowsUpDown size={16} />
					</IconButton>
					<SelectField
						options={SORT_OPTIONS}
						value={sortType}
						onChange={(val) => sortType.value = val as SortType}
						displayMode='chips-inside'
						disabled={isFederatedView}
					/>
				</div>
				<ButtonGroup>
					<Button
						variant={viewMode.value === 'list' ? 'primary' : 'secondary'}
						ghost={viewMode.value !== 'list'}
						onClick={() => viewMode.value = 'list'}
						aria-label='List View'
						disabled={isFederatedView}
					>
						<IconList size={16} />
					</Button>
					<Button
						variant={viewMode.value === 'grid' ? 'primary' : 'secondary'}
						ghost={viewMode.value !== 'grid'}
						onClick={() => viewMode.value = 'grid'}
						aria-label='Grid View'
						disabled={isFederatedView}
					>
						<IconGridDots size={16} />
					</Button>
				</ButtonGroup>
			</div>
		</div>
	);
}
