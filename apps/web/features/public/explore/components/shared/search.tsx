import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { IconSearch, IconX } from '@tabler/icons-preact';
import { SelectField, SelectOption } from '@projective/fields';
import { IconButton } from '@projective/ui';
import '../../styles/components/shared/search.css';

// #region 1. CONSTANTS & TYPES
const SEARCH_PHRASES = [
	'Find a full-stack team...',
	'Search for Pitch Deck templates...',
	'Hire a Blockchain expert...',
	'Discover 3D models...',
	'Find marketing micro-agencies...',
];

type SearchType = 'projects' | 'marketplace' | 'traders';

const CATEGORY_OPTIONS: SelectOption<SearchType>[] = [
	{ label: 'Projects', value: 'projects' },
	{ label: 'Marketplace', value: 'marketplace' },
	{ label: 'Local Traders', value: 'traders' },
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
	const searchType = useSignal<SearchType>('projects');
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
