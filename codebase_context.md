# Selected Codebase Context

> Included paths: ./apps/web/features/public/explore

## Project Tree (Selected)

```text
./apps/web/features/public/explore/
  explore/
  components/
  home/
  categories.tsx
  freelancers.tsx
  guides.tsx
  hero.tsx
  marketplace.tsx
  teams.tsx
  search/
  filters.tsx
  header-actions.tsx
  header-search.tsx
  results/
  results-card-list.tsx
  results-card.tsx
  results-categorised.tsx
  results-details.tsx
  results-uncategorised.tsx
  results.tsx
  shared/
  banner.tsx
  search.tsx
  suggested.tsx
  contexts/
  ExploreContext.tsx
  contracts/
  Explore.ts
  Filters.ts
  ProjectResponse.ts
  Search.ts
  islands/
  ExploreHomeIsland.tsx
  ExploreSearchIsland.tsx
  routes/
  services/
  SearchService.ts
  SearchServiceBackend.ts
  styles/
  components/
  home/
  search/
  results/
  shared/
  islands/
```

## File Contents

### File: apps\web\features\public\explore\components\home\categories.tsx

```tsx
import { Carousel } from '@projective/data';
import '../../styles/components/home/categories.css';

// #region Interfaces

/**
 * Represents a simplified category link for the home page exploration.
 */
export interface CategoryData {
	name: string;
	href: string;
}

interface ExploreHomeCategoryProps {
	category: CategoryData;
}

// #endregion

// #region Static Data

const MOCK_CATEGORIES: CategoryData[] = [
	{ name: 'Technology', href: '/explore/technology' },
	{ name: 'Design', href: '/explore/design' },
	{ name: 'Business', href: '/explore/business' },
	{ name: 'Marketing', href: '/explore/marketing' },
	{ name: 'Engineering', href: '/explore/engineering' },
	{ name: 'Science', href: '/explore/science' },
	{ name: 'Art', href: '/explore/art' },
	{ name: 'Music', href: '/explore/music' },
];

// #endregion

// #region Components

/**
 * Individual category card rendered within the carousel.
 */
function ExploreHomeCategory({ category }: ExploreHomeCategoryProps) {
	return (
		<a href={category.href} class='explore-home-category' draggable={false}>
			{category.name}
		</a>
	);
}

/**
 * Island component displaying a horizontal, fluid carousel of categories.
 * Encapsulates the interactive Carousel within a hydrated client boundary.
 */
export default function ExploreHomeCategories() {
	return (
		<div class='explore-home-categories' style={{ display: 'flex' }}>
			<Carousel<CategoryData>
				dataSource={MOCK_CATEGORIES}
				renderItem={(item) => <ExploreHomeCategory category={item} />}
				itemMinWidth={200}
				numVisible={4}
				arrowPosition='outside'
				indicatorPosition='bottom'
			/>
		</div>
	);
}

// #endregion

```

### File: apps\web\features\public\explore\components\home\freelancers.tsx

```tsx

```

### File: apps\web\features\public\explore\components\home\guides.tsx

```tsx

```

### File: apps\web\features\public\explore\components\home\hero.tsx

```tsx
import '../../styles/components/home/hero.css';
import ExploreSearch from '../shared/search.tsx';

export default function ExploreHomeHero() {
	return (
		<div class='explore-home-hero'>
			<div class='explore-home-hero__header'>
				<div class='explore-home-hero__header__context'>
					<h1 class='explore-home-hero__header__context__title'>
						Discover Your<br />Perfect Team
					</h1>
					<p class='explore-home-hero__header__context__subtitle'>
						Explore a world of creativity, imagination and commitment from people ready to take on
						your project.
					</p>
				</div>
				<div class='explore-home-hero__header__search'>
					<div class='explore-home-hero__header__search__input'>
						<ExploreSearch />
					</div>
					<div class='explore-home-hero__header__search__suggested'></div>
				</div>
			</div>
			<div class='explore-home-hero__promotion'></div>
		</div>
	);
}

```

### File: apps\web\features\public\explore\components\home\marketplace.tsx

```tsx
import { DataDisplay } from '@projective/data';
import '../../styles/components/home/marketplace.css';

// #region Interfaces
/**
 * Represents a single item in the marketplace feed.
 */
export interface MarketplaceItem {
	id: string;
	title: string;
	price: number;
	imageUrl: string;
	/** * CRITICAL for Masonry: Providing an aspect ratio allows the grid to
	 * calculate the exact height before the image finishes downloading,
	 * preventing the layout from jumping around.
	 */
	aspectRatio: number;
}
// #endregion

// #region Mock Data
const MOCK_DATA: MarketplaceItem[] = [
	{
		id: '1',
		title: 'Vintage Leather Jacket',
		price: 120.00,
		imageUrl: 'https://picsum.photos/seed/jacket/400/533',
		aspectRatio: 400 / 533,
	},
	{
		id: '2',
		title: 'Mechanical Keyboard',
		price: 85.50,
		imageUrl: 'https://picsum.photos/seed/keyboard/600/400',
		aspectRatio: 600 / 400,
	},
	{
		id: '3',
		title: 'Minimalist Desk Lamp',
		price: 45.00,
		imageUrl: 'https://picsum.photos/seed/lamp/400/400',
		aspectRatio: 1,
	},
	{
		id: '4',
		title: 'Ceramic Coffee Mug',
		price: 15.00,
		imageUrl: 'https://picsum.photos/seed/mug/400/400',
		aspectRatio: 1,
	},
	{
		id: '5',
		title: 'Noise-Cancelling Headphones',
		price: 299.99,
		imageUrl: 'https://picsum.photos/seed/headphones/400/533',
		aspectRatio: 400 / 533,
	},
	{
		id: '6',
		title: 'Ergonomic Office Chair',
		price: 199.00,
		imageUrl: 'https://picsum.photos/seed/chair/400/600',
		aspectRatio: 400 / 600,
	},
	{
		id: '7',
		title: 'Wooden Monitor Stand',
		price: 35.00,
		imageUrl: 'https://picsum.photos/seed/stand/600/300',
		aspectRatio: 600 / 300,
	},
	{
		id: '8',
		title: 'Wireless Gaming Mouse',
		price: 59.99,
		imageUrl: 'https://picsum.photos/seed/mouse/400/400',
		aspectRatio: 1,
	},
	{
		id: '9',
		title: 'Canvas Backpack',
		price: 65.00,
		imageUrl: 'https://picsum.photos/seed/backpack/400/533',
		aspectRatio: 400 / 533,
	},
	{
		id: '10',
		title: 'Smart Home Speaker',
		price: 89.00,
		imageUrl: 'https://picsum.photos/seed/speaker/400/400',
		aspectRatio: 1,
	},
	{
		id: '11',
		title: 'Abstract Wall Art',
		price: 40.00,
		imageUrl: 'https://picsum.photos/seed/art/400/600',
		aspectRatio: 400 / 600,
	},
	{
		id: '12',
		title: 'Stainless Steel Water Bottle',
		price: 25.00,
		imageUrl: 'https://picsum.photos/seed/bottle/400/533',
		aspectRatio: 400 / 533,
	},
];
// #endregion

// #region Components

/**
 * Individual card component for a marketplace item.
 * Designed to be rendered inside the Masonry Layout Engine.
 * * @param props - The item data to render
 */
export function ExploreHomeMarketplaceItem({ item }: { item: MarketplaceItem }) {
	return (
		<div className='marketplace-item'>
			{
				/* By applying the aspect ratio to a wrapper, the masonry engine can instantly
                measure the final DOM height of this block even if the image takes 2 seconds to load.
            */
			}
			<div
				className='marketplace-item__image-wrapper'
				style={{ aspectRatio: String(item.aspectRatio) }}
			>
				<img
					src={item.imageUrl}
					alt={item.title}
					className='marketplace-item__image'
					loading='lazy'
				/>
			</div>
			<div className='marketplace-item__content'>
				<h3 className='marketplace-item__title'>{item.title}</h3>
				<p className='marketplace-item__price'>${item.price.toFixed(2)}</p>
			</div>
		</div>
	);
}

/**
 * The main masonry grid wrapper for the marketplace.
 * Connects the `@projective/data` virtualizer with the marketplace UI.
 */
export default function ExploreHomeMarketplaceGrid() {
	return (
		<DataDisplay<MarketplaceItem, unknown>
			mode='masonry'
			dataSource={MOCK_DATA}
			// Let the container stretch, and the engine will pack as many 250px columns as possible
			columnWidth={150}
			gap={16}
			estimateHeight={350}
			// Use the window's native scrollbar for infinite scrolling
			scrollMode='window'
			// Render mapping
			renderItem={(item) => <ExploreHomeMarketplaceItem item={item} />}
			// Optional: enable selection or interactivity
			interactive
			// FIX: Enforce 100% width so the DataDisplay doesn't shrink-wrap the 0-width absolute children
			style={{ width: '100%', display: 'block' }}
		/>
	);
}
// #endregion

```

### File: apps\web\features\public\explore\components\home\teams.tsx

```tsx

```

### File: apps\web\features\public\explore\components\search\filters.tsx

```tsx
import { useSignal } from '@preact/signals';
import { IconStar, IconStarFilled } from '@tabler/icons-preact';
import { SelectField, SelectOption } from '@projective/fields';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@projective/ui';

// #region 1. MOCK DATA
const MOCK_SKILLS: SelectOption<string>[] = [
	{ label: 'JavaScript', value: 'javascript' },
	{ label: 'TypeScript', value: 'typescript' },
	{ label: 'Python', value: 'python' },
	{ label: 'VSCode', value: 'vscode' },
	{ label: 'React', value: 'react' },
	{ label: 'Figma', value: 'figma' },
];

const MOCK_LOCATIONS: SelectOption<string>[] = [
	{ label: 'United Kingdom', value: 'uk' },
	{ label: 'Ireland', value: 'ireland' },
	{ label: 'France', value: 'france' },
	{ label: 'Sweden', value: 'sweden' },
	{ label: 'Germany', value: 'germany' },
];

const MOCK_LANGUAGES: SelectOption<string>[] = [
	{ label: 'English', value: 'en' },
	{ label: 'French', value: 'fr' },
	{ label: 'Spanish', value: 'es' },
	{ label: 'German', value: 'de' },
];
// #endregion

/**
 * @function ExploreSearchFilters
 * @description A sticky sidebar component utilizing an accordion structure to house dynamic search filters.
 */
export default function ExploreSearchFilters() {
	// #region 2. LOCAL STATE (Mocked)
	const priceMin = useSignal<string>('0');
	const priceMax = useSignal<string>('2000');
	const selectedSkills = useSignal<string[]>(['javascript', 'typescript', 'python', 'vscode']);
	const selectedRating = useSignal<number>(4);
	const selectedLocations = useSignal<string[]>(['uk', 'ireland', 'france', 'sweden', 'germany']);
	const selectedLanguages = useSignal<string[]>([]);
	// #endregion

	return (
		// Using Accordion component from @projective/ui.
		// type="multiple" ensures sections don't close each other.
		<Accordion
			type='multiple'
			defaultValue={['price', 'skills', 'rating', 'location', 'language']}
			variant='ghost'
			density='compact'
		>
			{/* --- PRICE --- */}
			<AccordionItem value='price'>
				<AccordionTrigger>Price</AccordionTrigger>
				<AccordionContent>
					<div class='filter-price-inputs'>
						<input
							type='number'
							placeholder='Min'
							value={priceMin.value}
							onInput={(e) => priceMin.value = e.currentTarget.value}
							aria-label='Minimum Price'
						/>
						<span style={{ color: 'var(--text-muted)' }}>-</span>
						<input
							type='number'
							placeholder='Max'
							value={priceMax.value}
							onInput={(e) => priceMax.value = e.currentTarget.value}
							aria-label='Maximum Price'
						/>
					</div>
				</AccordionContent>
			</AccordionItem>

			{/* --- SKILLS --- */}
			<AccordionItem value='skills'>
				<AccordionTrigger>Skills</AccordionTrigger>
				<AccordionContent>
					<SelectField<string>
						options={MOCK_SKILLS}
						value={selectedSkills}
						onChange={(val) => selectedSkills.value = val as string[]}
						multiple
						searchable
						clearable
						displayMode='chips-below'
						placeholder='Select Skills'
					/>
				</AccordionContent>
			</AccordionItem>

			{/* --- RATING --- */}
			<AccordionItem value='rating'>
				<AccordionTrigger>Rating</AccordionTrigger>
				<AccordionContent>
					<div class='filter-stars' role='radiogroup' aria-label='Select Rating'>
						{[1, 2, 3, 4, 5].map((star) => (
							<span
								key={star}
								onClick={() => selectedRating.value = star}
								onKeyDown={(e) => e.key === 'Enter' && (selectedRating.value = star)}
								tabIndex={0}
								role='radio'
								aria-checked={selectedRating.value === star}
							>
								{star <= selectedRating.value
									? <IconStarFilled className='active' size={24} />
									: <IconStar size={24} />}
							</span>
						))}
					</div>
				</AccordionContent>
			</AccordionItem>

			{/* --- LOCATION --- */}
			<AccordionItem value='location'>
				<AccordionTrigger>Location</AccordionTrigger>
				<AccordionContent>
					<SelectField<string>
						options={MOCK_LOCATIONS}
						value={selectedLocations}
						onChange={(val) => selectedLocations.value = val as string[]}
						multiple
						searchable
						clearable
						displayMode='chips-below'
						placeholder='Select Locations'
					/>
				</AccordionContent>
			</AccordionItem>

			{/* --- LANGUAGE --- */}
			<AccordionItem value='language'>
				<AccordionTrigger>Language</AccordionTrigger>
				<AccordionContent>
					<SelectField<string>
						options={MOCK_LANGUAGES}
						value={selectedLanguages}
						onChange={(val) => selectedLanguages.value = val as string[]}
						multiple
						searchable
						clearable
						displayMode='chips-below'
						placeholder='Select Languages'
					/>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}

```

### File: apps\web\features\public\explore\components\search\header-actions.tsx

```tsx
import '../../styles/components/search/header-actions.css';
import { Button, ButtonGroup, IconButton } from '@projective/ui';
import { IconArrowsUpDown, IconFilter, IconGridDots, IconList } from '@tabler/icons-preact';
import { SelectField, SelectOption } from '@projective/fields';
import { useExploreContext } from '../../contexts/ExploreContext.tsx';
import { useSignal } from '@preact/signals';

type SortType = 'recommended' | 'price' | 'rating' | 'recent' | 'popularity';

const SORT_OPTIONS: SelectOption<SortType>[] = [
	{ label: 'Recommended', value: 'recommended' },
	{ label: 'Rating', value: 'rating' },
	{ label: 'Recent', value: 'recent' },
	{ label: 'Price', value: 'price' },
	{ label: 'Popularity', value: 'popularity' },
];

/**
 * @function ExploreSearchHeaderActions
 * @description Toolbar for filtering, sorting, and toggling the results view layout.
 */
export default function ExploreSearchHeaderActions() {
	const { exploreQuery, viewMode, isFiltersOpen, searchType } = useExploreContext();
	const sortType = useSignal<SortType>('recommended');

	const isFederatedView = searchType.value === 'all';

	return (
		<div class='explore-search-header-actions'>
			<div class='explore-search-header-actions__left'>
				<Button
					rounded
					outlined
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

			{
				/* <div class='explore-search-header-actions__center'>
				<div class='explore-search-header-actions__groups'>
					<ButtonGroup>
						<Button
							variant={searchType.value === 'work' ? 'primary' : 'secondary'}
							ghost={searchType.value !== 'work'}
							onClick={() => searchType.value = 'work'}
						>
							People
						</Button>
						<Button
							variant={searchType.value === 'projects' ? 'primary' : 'secondary'}
							ghost={searchType.value !== 'projects'}
							onClick={() => searchType.value = 'projects'}
						>
							Projects
						</Button>
						<Button
							variant={searchType.value === 'services' ? 'primary' : 'secondary'}
							ghost={searchType.value !== 'services'}
							onClick={() => searchType.value = 'services'}
						>
							Services
						</Button>
					</ButtonGroup>
				</div>
			</div> */
			}

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

```

### File: apps\web\features\public\explore\components\search\header-search.tsx

```tsx
import '../../styles/components/search/header-search.css';
import { useExploreContext } from '../../contexts/ExploreContext.tsx';
import { searchType } from '../../contracts/Explore.ts';
import ExploreSearch from '../shared/search.tsx';
import { StringModifier } from 'packages/utils/src/pipes/StringModifier.ts';

export default function ExploreSearchHeaderSearch() {
	const { exploreQuery, searchType } = useExploreContext();

	const handleSearch = (term: string, type: string) => {
		exploreQuery.value = term;
		searchType.value = type as searchType;
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

```

### File: apps\web\features\public\explore\components\search\results\results-card-list.tsx

```tsx
import { IconClockHour4, IconLanguage, IconMapPin, IconStarFilled } from '@tabler/icons-preact';
import { DateTime } from '@projective/types';
import { ListCard } from '@projective/ui';
import { ProjectResponse } from '../../../contracts/ProjectResponse.ts';
import { ExploreResponses } from '../../../contracts/Explore.ts';
import { useExploreContext } from '../../../contexts/ExploreContext.tsx';

export default function ExploreSearchResultsListItem(
	{ type, data }: { type: string; data: ExploreResponses },
) {
	if (type === 'projects') {
		return <ExploreSearchResultsListItemProjects data={data as ProjectResponse} />;
	}

	return null;
}

function ExploreSearchResultsListItemProjects({ data }: { data: ProjectResponse }) {
	const { selectedItem } = useExploreContext();
	const projectUrl = `/projects/${data.project_id}`;
	const startDate = data.target_project_start_date
		? new DateTime(data.target_project_start_date).toFormat('DD MMM yyyy')
		: 'TBD';

	// Assuming you will add an end date to the schema later, using a placeholder for now to match UI
	const endDate = 'TBD';

	const location = data.locations?.[0] ?? 'Global';
	const languages = data.languages?.length > 0 ? data.languages.join(', ') : 'English';

	// Hardcoded rating for now to match the UI screenshot, replace with actual data later
	const mockRating = '4.3 (123)';

	return (
		<ListCard
			id={data.project_id}
			href={projectUrl}
			typeLabel='PROJECT'
			title={data.title}
			subtitle={`Posted By ${data.owner.name}`}
			description={data.description ?? ''}
			imageUrl={data.thumbnail_url ??
				'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60'}
			imageFallback={data.owner.name.charAt(0)}
			onClick={(e: MouseEvent) => {
				if (e.metaKey || e.ctrlKey || e.button === 1) return;
				e.preventDefault();
				selectedItem.value = data;
			}}
			footer={
				<div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
					{/* Rating */}
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
						<IconStarFilled size={18} color='var(--primary)' />
						<span style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{mockRating}</span>
					</div>

					{/* Timeline (Stacked Start/End) */}
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
						<IconClockHour4 size={18} color='var(--primary)' />
						<div style={{ display: 'flex', gap: '1rem' }}>
							<div style={{ display: 'flex', flexDirection: 'column' }}>
								<span
									style={{
										fontSize: '0.6rem',
										textTransform: 'uppercase',
										color: 'var(--text-muted)',
										fontWeight: 700,
									}}
								>
									Start
								</span>
								<span style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{startDate}</span>
							</div>
							<div style={{ display: 'flex', flexDirection: 'column' }}>
								<span
									style={{
										fontSize: '0.6rem',
										textTransform: 'uppercase',
										color: 'var(--text-muted)',
										fontWeight: 700,
									}}
								>
									End
								</span>
								<span style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{endDate}</span>
							</div>
						</div>
					</div>

					{/* Location */}
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
						<IconMapPin size={18} color='var(--primary)' />
						<span style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{location}</span>
					</div>

					{/* Languages */}
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
						<IconLanguage size={18} color='var(--primary)' />
						<span style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{languages}</span>
					</div>
				</div>
			}
		/>
	);
}

```

### File: apps\web\features\public\explore\components\search\results\results-card.tsx

```tsx

```

### File: apps\web\features\public\explore\components\search\results\results-categorised.tsx

```tsx
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

```

### File: apps\web\features\public\explore\components\search\results\results-details.tsx

```tsx
import '../../../styles/components/search/results/results-details.css';
import { useExploreContext } from '../../../contexts/ExploreContext.tsx';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { Button, Skeleton } from '@projective/ui';
import { StringModifier } from '@projective/utils';
import {
	IconBriefcase,
	IconClock,
	IconCurrencyDollar,
	IconLayoutGridAdd,
	IconMapPin,
	IconX,
} from '@tabler/icons-preact';
import { DateTime } from 'packages/types/src/core/datetime.ts';

export default function ExploreSearchResultsDetails() {
	const { selectedItem } = useExploreContext();
	const isLoading = useSignal(false);
	const parsedData = useSignal<any | null>(null);

	// Map raw polymorphic data into a clean, uniform object for the details pane
	useEffect(() => {
		if (!selectedItem.value) {
			parsedData.value = null;
			return;
		}

		let isMounted = true;
		isLoading.value = true;

		// Optional: 250ms simulated delay to show the skeleton animation for polish
		setTimeout(() => {
			if (!isMounted) return;

			const raw = selectedItem.value;
			const mapped: any = {
				id: raw.id || raw.project_id || raw.entity_id || raw.service_id,
				type: 'Item',
				title: 'Unknown',
				subtitle: '',
				description: '',
				bannerUrl: '',
				avatarUrl: '',
				tags: [],
				attributes: [],
			};

			// Project Mapping
			if (raw.project_id) {
				mapped.type = 'Project';
				mapped.title = raw.title;
				mapped.subtitle = raw.owner_name ? `Posted by ${raw.owner_name}` : '';
				mapped.description = raw.description || '';
				mapped.bannerUrl = raw.thumbnail_url;
				mapped.avatarUrl = raw.owner_avatar_url;
				mapped.tags = raw.skills || [];

				if (raw.locations?.[0]) {
					mapped.attributes.push({ icon: <IconMapPin size={16} />, label: raw.locations[0] });
				}
				if (raw.target_project_start_date) {
					mapped.attributes.push({
						icon: <IconClock size={16} />,
						label: new DateTime(raw.target_project_start_date).toFormat('DD MMM YYYY'),
					});
				}
				if (raw.roles?.length) {
					mapped.attributes.push({
						icon: <IconBriefcase size={16} />,
						label: `${raw.roles.length} Role(s) Open`,
					});
				}
			} // People Mapping
			else if (raw.entity_id) {
				mapped.type = StringModifier.titleCase(raw.entity_type || 'Profile');
				mapped.title = raw.display_name;
				mapped.subtitle = raw.headline || '';
				mapped.description = raw.metadata?.bio || '';
				mapped.avatarUrl = raw.metadata?.avatar_url;
				mapped.tags = raw.metadata?.skills || [];

				if (raw.metadata?.hourly_rate) {
					mapped.attributes.push({
						icon: <IconCurrencyDollar size={16} />,
						label: `$${raw.metadata.hourly_rate}/hr`,
					});
				}
			} // Services Mapping
			else if (raw.service_id) {
				mapped.type = 'Service';
				mapped.title = raw.title;
				// Add attributes like price, revisions, etc., as needed
			}

			parsedData.value = mapped;
			isLoading.value = false;
		}, 250);

		return () => {
			isMounted = false;
		};
	}, [selectedItem.value]);

	// STATE 1: Empty
	if (!selectedItem.value) {
		return (
			<div class='explore-search-results-details explore-search-results-details--empty'>
				<div class='explore-search-results-details__empty-state'>
					<IconLayoutGridAdd size={48} color='var(--text-disabled)' />
					<h3>Select an item</h3>
					<p>Click on any result to view its full details here.</p>
				</div>
			</div>
		);
	}

	// STATE 2: Loading (Using your official Skeleton UI primitives)
	if (isLoading.value || !parsedData.value) {
		return (
			<div class='explore-search-results-details explore-search-results-details--loading'>
				<Skeleton variant='image' height={140} style={{ borderRadius: 0 }} />

				<div style={{ position: 'relative', marginTop: '-2.5rem', marginLeft: '2rem' }}>
					<Skeleton
						variant='avatar'
						width={80}
						height={80}
						style={{ border: '4px solid var(--card)' }}
					/>
				</div>

				<div
					style={{
						padding: '0 2rem',
						marginTop: '1.5rem',
						display: 'flex',
						flexDirection: 'column',
						gap: '1rem',
					}}
				>
					<Skeleton variant='text' width='25%' height={12} />
					<Skeleton variant='text' width='75%' height={28} />
					<Skeleton variant='text' width='40%' height={14} />

					<div style={{ marginTop: '1.5rem' }}>
						<Skeleton variant='multiline' lines={5} />
					</div>
				</div>
			</div>
		);
	}

	// STATE 3: Populated
	const data = parsedData.value;

	return (
		<div class='explore-search-results-details'>
			<div class='explore-search-results-details__hero'>
				{data.bannerUrl
					? <img class='explore-search-results-details__banner' src={data.bannerUrl} alt='Banner' />
					: (
						<div class='explore-search-results-details__banner explore-search-results-details__banner--fallback' />
					)}

				<div class='explore-search-results-details__identity'>
					{data.avatarUrl
						? (
							<img
								class='explore-search-results-details__avatar'
								src={data.avatarUrl}
								alt='Avatar'
							/>
						)
						: (
							<div class='explore-search-results-details__avatar explore-search-results-details__avatar--fallback'>
								{data.title.charAt(0)}
							</div>
						)}
				</div>
			</div>

			<div class='explore-search-results-details__body'>
				<div class='explore-search-results-details__header'>
					<span class='explore-search-results-details__type'>{data.type}</span>
					<h2 class='explore-search-results-details__title'>{data.title}</h2>
					{data.subtitle && <p class='explore-search-results-details__subtitle'>{data.subtitle}</p>}
				</div>

				{data.attributes && data.attributes.length > 0 && (
					<ul class='explore-search-results-details__attributes'>
						{data.attributes.map((attr: any, idx: number) => (
							<li key={idx}>
								{attr.icon}
								<span>{attr.label}</span>
							</li>
						))}
					</ul>
				)}

				{data.description && (
					<div class='explore-search-results-details__section'>
						<h3>Description</h3>
						<p class='explore-search-results-details__description'>
							{data.description}
						</p>
					</div>
				)}

				{data.tags && data.tags.length > 0 && (
					<div class='explore-search-results-details__section'>
						<h3>Skills & Tags</h3>
						<ul class='explore-search-results-details__tags'>
							{data.tags.map((tag: string) => (
								<li key={tag} class='explore-search-results-details__tag'>{tag}</li>
							))}
						</ul>
					</div>
				)}
			</div>

			<div class='explore-search-results-details__footer'>
				<Button variant='primary' size='large' style={{ width: '100%' }}>
					View Full {data.type}
				</Button>
			</div>
		</div>
	);
}

```

### File: apps\web\features\public\explore\components\search\results\results-uncategorised.tsx

```tsx
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

	// Visibility Check & Auto-Select
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

				// Auto-Select Logic: Pass the FULL object into the state
				if (
					viewMode.value === 'list' && !selectedItem.value && data.items && data.items.length > 0
				) {
					selectedItem.value = data.items[0];
				}
			})
			.catch(() => {
				if (isMounted) resultCount.value = 0;
			});

		return () => {
			isMounted = false;
		};
	}, [exploreQuery.value, section, viewMode.value]);

	const dataSource = useMemo(() => {
		return new RestDataSource({
			url: `/api/v1/public/search/${section}`,
			defaultParams: { query: exploreQuery.value || '' },
			keyExtractor: (item: any) => item.id || item.entity_id || item.project_id || item.service_id,
		});
	}, [exploreQuery.value, section]);

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

```

### File: apps\web\features\public\explore\components\search\results\results.tsx

```tsx
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

```

### File: apps\web\features\public\explore\components\shared\banner.tsx

```tsx

```

### File: apps\web\features\public\explore\components\shared\search.tsx

```tsx
import '../../styles/components/shared/search.css';
import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { IconSearch, IconX } from '@tabler/icons-preact';
import { SelectField, SelectOption } from '@projective/fields';
import { IconButton } from '@projective/ui';
import { SearchType } from '../../contracts/Explore.ts';

// #region 1. CONSTANTS & TYPES
const SEARCH_PHRASES = [
	'Find a full-stack team...',
	'Search for Pitch Deck templates...',
	'Hire a Blockchain expert...',
	'Discover 3D models...',
	'Find marketing micro-agencies...',
];

const CATEGORY_OPTIONS: SelectOption<SearchType>[] = [
	{ label: 'All', value: 'all' },
	{ label: 'Projects', value: 'projects' },
	{ label: 'Services', value: 'services' },
	{ label: 'People', value: 'people' },
	// { label: 'Posts', value: 'posts' },
	// { label: 'Marketplace', value: 'marketplace' },
	// { label: 'Local Traders', value: 'traders' },
];

export interface ExploreSearchProps {
	/** Optional callback. If provided, intercepts the form submission to update context instead of redirecting. */
	onSearch?: (term: string, type: SearchType) => void;
}
// #endregion

/**
 * ExploreSearch Island
 * A high-conversion, interactive search bar for the Explore homepage.
 */
export default function ExploreSearch({ onSearch }: ExploreSearchProps) {
	// #region 2. STATE
	const query = useSignal('');
	const searchType = useSignal<SearchType>('all');
	const activeIndex = useSignal(0);
	const isFocused = useSignal(false);
	const inputRef = useRef<HTMLInputElement>(null);
	// #endregion

	// #region 3. EFFECTS (Placeholder Animation)
	useEffect(() => {
		if (isFocused.value || query.value.length > 0) return;

		const interval = setInterval(() => {
			activeIndex.value = (activeIndex.value + 1) % SEARCH_PHRASES.length;
		}, 3000);

		return () => clearInterval(interval);
	}, [isFocused.value, query.value]);
	// #endregion

	// #region 4. EVENT HANDLERS
	const handleSubmit = (e: Event) => {
		e.preventDefault(); // Prevents page reload!
		const term = query.value.trim();

		if (onSearch) {
			// Update the Island Context directly (e.g., inside the explore page)
			onSearch(term, searchType.value);
		} else {
			// Fallback redirect (e.g., when used in the global site header)
			const searchParams = new URLSearchParams();
			if (term) searchParams.set('q', term);
			searchParams.set('tab', searchType.value);

			globalThis.location.href = `/explore?${searchParams.toString()}`;
		}
	};

	const handleClear = () => {
		query.value = '';
		inputRef.current?.focus();
	};
	// #endregion

	// #region 5. RENDER HELPERS
	const getPlaceholderClass = (index: number) => {
		if (index === activeIndex.value) return 'explore-search-input__placeholder-item--active';

		const prevIndex = activeIndex.value === 0 ? SEARCH_PHRASES.length - 1 : activeIndex.value - 1;
		if (index === prevIndex) return 'explore-search-input__placeholder-item--prev';

		return 'explore-search-input__placeholder-item--next';
	};
	// #endregion

	return (
		<form class='explore-search-input' onSubmit={handleSubmit}>
			{/* Input Area */}
			<div class='explore-search-input__input-group'>
				<input
					ref={inputRef}
					class='explore-search-input__input'
					type='text'
					value={query.value}
					onInput={(e) => query.value = (e.target as HTMLInputElement).value}
					onFocus={() => isFocused.value = true}
					onBlur={() => isFocused.value = false}
					aria-label='Search Projective'
				/>

				{/* Animated Placeholder */}
				{query.value.length === 0 && (
					<div class='explore-search-input__placeholder' aria-hidden='true'>
						{SEARCH_PHRASES.map((phrase, idx) => (
							<span
								key={idx}
								class={`explore-search-input__placeholder-item ${getPlaceholderClass(idx)}`}
							>
								{phrase}
							</span>
						))}
					</div>
				)}

				{/* Clear Button (Using Projective UI) */}
				{query.value.length > 0 && (
					<IconButton
						className='explore-search-input__clear'
						variant='secondary'
						ghost
						rounded
						size='small'
						onClick={handleClear}
						aria-label='Clear search'
					>
						<IconX size={14} />
					</IconButton>
				)}
			</div>

			<div class='explore-search-input__divider'></div>

			{/* Dropdown */}
			<div class='explore-search-input__dropdown'>
				<SelectField<SearchType>
					options={CATEGORY_OPTIONS}
					value={searchType}
					onChange={(val) => searchType.value = val as SearchType}
					displayMode='chips-inside'
				/>
			</div>

			{/* Submit Button (Using Projective UI) */}
			<IconButton
				className='explore-search-input__submit'
				variant='primary'
				ghost={false}
				rounded={false}
				htmlType='submit'
				aria-label='Submit search'
			>
				<IconSearch size={20} />
			</IconButton>
		</form>
	);
}

```

### File: apps\web\features\public\explore\components\shared\suggested.tsx

```tsx

```

### File: apps\web\features\public\explore\contexts\ExploreContext.tsx

```tsx
import { ComponentChildren, createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { ExploreState, SearchType, SortType, ViewMode } from '../contracts/Explore.ts';

// #region 1. CONTEXT INITIALIZATION
const ExploreContext = createContext<ExploreState | null>(null);
// #endregion

// #region 2. PROVIDER PROPS
/**
 * @interface ExploreProviderProps
 */
export interface ExploreProviderProps {
	query?: string | null;
	initialViewMode?: ViewMode;
	initialTab?: SearchType;
	initialSort?: SortType;
	initialSelectedId?: string | null;
	initialFiltersOpen?: boolean;
	children: ComponentChildren;
}
// #endregion

/**
 * @function ExploreProvider
 * @description Injects the reactive state tree for the Explore discovery engine.
 */
export function ExploreProvider(props: ExploreProviderProps) {
	const {
		query = null,
		initialViewMode = 'list',
		initialTab = 'all',
		initialSort = 'recommended',
		initialSelectedId = null,
		initialFiltersOpen = true,
		children,
	} = props;

	// #region 3. SIGNAL INSTANTIATION
	const exploreQuery = useSignal<string | null>(query);
	const viewMode = useSignal<ViewMode>(initialViewMode);
	const searchType = useSignal<SearchType>(initialTab);
	const sortType = useSignal<SortType>(initialSort);
	const selectedItem = useSignal<any | null>(initialSelectedId);
	const isFiltersOpen = useSignal<boolean>(initialFiltersOpen);
	// #endregion

	return (
		<ExploreContext.Provider
			value={{
				exploreQuery,
				viewMode,
				searchType,
				sortType,
				selectedItem,
				isFiltersOpen,
			}}
		>
			{children}
		</ExploreContext.Provider>
	);
}

/**
 * @function useExploreContext
 * @description Hook to consume the Explore state. Must be used within an ExploreProvider Island.
 * @throws {Error} If called outside of the ExploreProvider tree.
 */
export function useExploreContext(): ExploreState {
	const ctx = useContext(ExploreContext);
	if (!ctx) {
		throw new Error('useExploreContext must be used within an ExploreProvider boundary');
	}
	return ctx;
}

```

### File: apps\web\features\public\explore\contracts\Explore.ts

```ts
import { Signal } from '@preact/signals';
import { ProjectResponse } from './ProjectResponse.ts';

export type ExploreResponses = ProjectResponse;
export type ViewMode = 'grid' | 'list' | 'masonry';
export type SortType = 'recommended' | 'price' | 'rating' | 'recent';
export type SearchType =
	| 'projects'
	| 'marketplace'
	| 'traders'
	| 'services'
	| 'people'
	| 'posts'
	| 'all';

/**
 * @interface ExploreState
 * @description The central state contract for the Explore & Search discovery engine.
 */
export interface ExploreState {
	/** The current search term entered by the user */
	exploreQuery: Signal<string | null>;
	/** The layout mode for the search results (e.g., grid vs list) */
	viewMode: Signal<ViewMode>;
	/** The active federated search tab */
	searchType: Signal<SearchType>;
	/** The active sorting parameter */
	sortType: Signal<SortType>;
	/** Store the full data object of the selected item instead of just the ID */
	selectedItem: Signal<any | null>;
	/** Controls the visibility of the sticky filter sidebar */
	isFiltersOpen: Signal<boolean>;
}

```

### File: apps\web\features\public\explore\contracts\Filters.ts

```ts

```

### File: apps\web\features\public\explore\contracts\ProjectResponse.ts

```ts
export interface ProjectResponse {
	project_id: string;
	title: string;
	description: string | null;
	thumbnail_url: string;
	status: 'active' | 'inactive' | string; // Adjusted to include literal types if known
	is_active: boolean;
	industry_category_id: string;
	target_project_start_date: string; // ISO Date string
	created_at: string;
	owner: Owner;
	nda_required: boolean;
	ip_ownership_mode: 'exclusive_transfer' | string;
	languages: string[];
	locations: string[];
	skills: string[]; // Based on the empty array in the example
	stages: ProjectStage[];
	roles: ProjectRole[];
}

export interface Owner {
	id: string;
	type: 'user' | 'business' | string;
	name: string;
	username: string;
	avatar_url: string | null;
}

export interface ProjectStage {
	id: string;
	name: string;
	type: 'file_based' | 'session_based' | 'maintenance_based' | string;
	status: 'open' | 'closed' | string;
	end_date: string | null;
	start_date: string | null;
}

export interface ProjectRole {
	quantity: number;
	role_title: string;
	budget_type: 'fixed_price' | 'hourly' | string;
	budget_amount_cents: number;
}

```

### File: apps\web\features\public\explore\contracts\Search.ts

```ts
// #region 1. Core Interfaces
/**
 * @interface SearchResult
 * @description The standardized return format from all search RPCs.
 */
export interface SearchResult {
	id: string;
	similarity: number;
}
// #endregion

// #region 2. Base Search Parameters
/**
 * @interface BaseSearchParams
 * @description Standard parameters applied to all search queries.
 */
export interface BaseSearchParams {
	query?: string;
	limit?: number;
	offset?: number;
}
// #endregion

/**
 * @interface PeopleSearchParams extends BaseSearchParams {

 * @description Filter parameters for searching people.
 */
export interface PeopleSearchParams extends BaseSearchParams {
	minRate?: number;
	maxRate?: number;
	type?: string; // Freelancer, Agency, etc.
	skills?: string;
	serviceTypes?: string;
	location?: string;
	languages?: string[];
}

export interface ProjectsSearchParams extends BaseSearchParams {
	category?: string;
	budgetMin?: number;
	budgetMax?: number;
	durationMin?: number;
	durationMax?: number;
	skills?: string;
}

export interface ServicesSearchParams extends BaseSearchParams {
	type?: string; // File, Session, Maintenance, etc.
	revisions?: number;
	priceMin?: number;
	priceMax?: number;
	languages?: string[];
}

export type SearchParams = PeopleSearchParams | ProjectsSearchParams | ServicesSearchParams;

```

### File: apps\web\features\public\explore\islands\ExploreHomeIsland.tsx

```tsx
import ExploreHomeCategories from '../components/home/categories.tsx';
import ExploreHomeHero from '../components/home/hero.tsx';
import ExploreHomeMarketplaceGrid from '../components/home/marketplace.tsx';

export default function ExploreHomeIsland() {
	return (
		<div>
			<ExploreHomeHero />
			<ExploreHomeCategories />
			<ExploreHomeMarketplaceGrid />
		</div>
	);
}

```

### File: apps\web\features\public\explore\islands\ExploreSearchIsland.tsx

```tsx
import '../styles/islands/search.css';
import ExploreSearchHeaderActions from '../components/search/header-actions.tsx';
import ExploreSearchHeaderSearch from '../components/search/header-search.tsx';
import ExploreSearchFilters from '../components/search/filters.tsx';
import { useExploreContext } from '../contexts/ExploreContext.tsx';
import ExploreSearchResults from '../components/search/results/results.tsx';

/**
 * @function ExploreSearchIsland
 * @description The main layout wrapper for the search interface.
 * Reacts to global context state to mount/unmount the sidebar.
 */
export default function ExploreSearchIsland() {
	const { isFiltersOpen, searchType } = useExploreContext();

	const showFilters = isFiltersOpen.value && searchType.value !== 'all';

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

```

### File: apps\web\features\public\explore\services\SearchService.ts

```ts
/**
 * @file search-service.ts
 * @description Frontend Service layer for Explore & Search interactions.
 * Handles API calls to /api/v1/public/search/* ensuring Islands remain thin.
 */

import { SearchType } from '../contracts/Explore.ts';
import { SearchParams, SearchResult } from '../contracts/Search.ts';

export class SearchService {
	// #region 1. Helper Methods
	/**
	 * @private
	 * @description Safely serializes query parameters, dropping undefined values and handling arrays.
	 */
	private static buildQueryString(params: Record<string, any>): string {
		const searchParams = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null) {
				if (Array.isArray(value)) {
					searchParams.append(key, value.join(','));
				} else {
					searchParams.append(key, String(value));
				}
			}
		}
		return searchParams.toString();
	}
	// #endregion

	static async search(params: SearchParams, type?: SearchType): Promise<SearchResult[]> {
		const qs = SearchService.buildQueryString(params);
		const searchType = type || 'all';
		const res = await fetch(`/api/v1/public/search/${searchType}?${qs}`);
		if (!res.ok) throw new Error(`Failed to search ${searchType}: ${res.statusText}`);
		return await res.json() as SearchResult[];
	}
}

```

### File: apps\web\features\public\explore\services\SearchServiceBackend.ts

```ts
import { SupabaseClient } from 'supabaseClient';
import { ProjectResponse } from '../contracts/ProjectResponse.ts';

// #region 1. Interfaces
export interface PaginatedSearchQuery {
	query: string;
	limit: number;
	offset: number;
	countOnly: boolean;
}

export interface Deps {
	getClient?: () => Promise<SupabaseClient>;
}
// #endregion

export class SearchBackendService {
	// #region 2. Helper Methods
	private static buildArgs(args: Record<string, any>) {
		return Object.fromEntries(
			Object.entries(args).filter(([_, v]) => v !== null && v !== undefined),
		);
	}
	// #endregion

	// #region 3. Main Router
	static async search(entity: string, params: PaginatedSearchQuery, deps: Deps = {}) {
		if (!deps.getClient) {
			return { ok: false, error: { status: 500, message: 'Missing database client context' } };
		}

		switch (entity) {
			case 'people':
				return await this.searchPeople(params, deps);
			case 'projects':
				return await this.searchProjects(params, deps);
			case 'services':
				return await this.searchServices(params, deps);
			default:
				return { ok: false, error: { status: 400, message: `Invalid search entity: ${entity}` } };
		}
	}
	// #endregion

	// #region 4. Entity Search Implementations
	private static async searchPeople(params: PaginatedSearchQuery, deps: Deps) {
		const client = await deps.getClient!();

		let query = client
			.schema('search')
			.from('profiles_index')
			.select(
				params.countOnly ? '*' : 'entity_id, entity_type, display_name, headline, metadata',
				{
					count: 'exact',
					head: params.countOnly,
				},
			)
			.eq('is_active', true);

		if (params.query) {
			query = query.textSearch('fts', params.query, { config: 'english', type: 'websearch' });
		}

		if (!params.countOnly) {
			query = query.range(params.offset, params.offset + params.limit - 1);
		}

		const { data, count, error } = await query;
		if (error) return { ok: false, error };

		return {
			ok: true,
			data: {
				items: params.countOnly ? [] : data || [],
				meta: { totalCount: count || 0 },
			},
		};
	}

	/**
	 * @private
	 * @description Queries the search.projects_index table.
	 * Security Note: RLS policies on projects.projects will cascade here if configured properly,
	 * but currently the index is filtered strictly by is_active (public visibility).
	 */
	private static async searchProjects(params: PaginatedSearchQuery, deps: Deps) {
		const client = await deps.getClient!();

		const selectColumns = params.countOnly
			? 'project_id'
			: 'project_id, title, description, thumbnail_url, status, is_active, industry_category_id, target_project_start_date, created_at, owner_id, owner_type, owner_name, owner_username, owner_avatar_url, nda_required, ip_ownership_mode, languages, locations, skills, stages, roles';

		let query = client
			.schema('search')
			.from('projects_index')
			.select(selectColumns, {
				count: 'exact',
				head: params.countOnly,
			})
			.eq('is_active', true);

		if (params.query) {
			query = query.textSearch('fts', params.query, { config: 'english', type: 'websearch' });
		}

		if (!params.countOnly) {
			query = query.range(params.offset, params.offset + params.limit - 1);
		}

		const { data, count, error } = await query;
		if (error) return { ok: false, error };

		// Map the flat database row to the nested ProjectResponse structure
		const formattedItems: ProjectResponse[] = params.countOnly
			? []
			: (data || []).map((item: any) => {
				// Extract owner fields to construct the nested object
				const {
					owner_id,
					owner_type,
					owner_name,
					owner_username,
					owner_avatar_url,
					...projectData
				} = item;

				return {
					...projectData,
					owner: {
						id: owner_id,
						type: owner_type,
						name: owner_name,
						username: owner_username,
						avatar_url: owner_avatar_url,
					},
				} as ProjectResponse;
			});

		return {
			ok: true,
			data: {
				items: formattedItems,
				meta: { totalCount: count || 0 },
			},
		};
	}

	private static async searchServices(params: PaginatedSearchQuery, deps: Deps) {
		const client = await deps.getClient!();

		let query = client
			.schema('search')
			.from('services_index')
			.select(params.countOnly ? '*' : 'service_id, title, avg_rating', {
				count: 'exact',
				head: params.countOnly,
			})
			.eq('is_public', true);

		if (params.query) {
			query = query.textSearch('fts', params.query, { config: 'english', type: 'websearch' });
		}

		if (!params.countOnly) {
			query = query.range(params.offset, params.offset + params.limit - 1);
		}

		const { data, count, error } = await query;
		if (error) return { ok: false, error };

		return {
			ok: true,
			data: {
				items: params.countOnly ? [] : data || [],
				meta: { totalCount: count || 0 },
			},
		};
	}
	// #endregion
}

```

