import '../../styles/components/shared/search.css';
import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { IconSearch, IconX } from '@tabler/icons-preact';
import { SelectField, SelectOption } from '@projective/fields';
import { IconButton } from '@projective/ui';
import { EntityFilter } from '../../contracts/Explore.ts';

// #region 1. CONSTANTS & TYPES
const SEARCH_PHRASES = [
	'Find a full-stack team...',
	'Search pitch-deck templates...',
	'Hire a blockchain expert...',
	'Discover 3D models & motion...',
	'Find a growth micro-agency...',
];

/** The native entity-type dropdown. "Profiles" maps to `person` (which fans out to teams/businesses). */
const ENTITY_OPTIONS: SelectOption<EntityFilter>[] = [
	{ label: 'All', value: 'all' },
	{ label: 'Services', value: 'service' },
	{ label: 'Products', value: 'product' },
	{ label: 'Profiles', value: 'person' },
	{ label: 'Projects', value: 'project' },
];

export interface ExploreSearchProps {
	/** If provided, intercepts submission to update context instead of redirecting. */
	onSearch?: (term: string, type: EntityFilter) => void;
	initialQuery?: string;
	initialType?: EntityFilter;
	size?: 'md' | 'lg';
}
// #endregion

/**
 * @function ExploreSearch
 * @description The high-conversion search bar: animated placeholder, query input, native entity-type
 * dropdown, and submit. Embedded full-width in the hero and reused in the search header.
 */
export default function ExploreSearch({ onSearch, initialQuery, initialType, size = 'md' }: ExploreSearchProps) {
	const query = useSignal(initialQuery ?? '');
	const entityType = useSignal<EntityFilter>(initialType ?? 'all');
	const activeIndex = useSignal(0);
	const isFocused = useSignal(false);
	const inputRef = useRef<HTMLInputElement>(null);

	// Rotating placeholder animation
	useEffect(() => {
		if (isFocused.value || query.value.length > 0) return;
		const interval = setInterval(() => {
			activeIndex.value = (activeIndex.value + 1) % SEARCH_PHRASES.length;
		}, 3000);
		return () => clearInterval(interval);
	}, [isFocused.value, query.value]);

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		const term = query.value.trim();
		if (onSearch) {
			onSearch(term, entityType.value);
		} else {
			const params = new URLSearchParams();
			if (term) params.set('q', term);
			if (entityType.value !== 'all') params.set('type', entityType.value);
			globalThis.location.href = `/explore?${params.toString()}`;
		}
	};

	const getPlaceholderClass = (index: number) => {
		if (index === activeIndex.value) return 'explore-search-input__placeholder-item--active';
		const prev = activeIndex.value === 0 ? SEARCH_PHRASES.length - 1 : activeIndex.value - 1;
		if (index === prev) return 'explore-search-input__placeholder-item--prev';
		return 'explore-search-input__placeholder-item--next';
	};

	return (
		<form class={`explore-search-input explore-search-input--${size}`} onSubmit={handleSubmit}>
			<div class='explore-search-input__leading'>
				<IconSearch size={size === 'lg' ? 20 : 18} />
			</div>

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
				{query.value.length === 0 && (
					<div class='explore-search-input__placeholder' aria-hidden='true'>
						{SEARCH_PHRASES.map((phrase, idx) => (
							<span key={idx} class={`explore-search-input__placeholder-item ${getPlaceholderClass(idx)}`}>
								{phrase}
							</span>
						))}
					</div>
				)}
				{query.value.length > 0 && (
					<IconButton
						className='explore-search-input__clear'
						variant='secondary'
						ghost
						rounded
						size='small'
						onClick={() => {
							query.value = '';
							inputRef.current?.focus();
						}}
						aria-label='Clear search'
					>
						<IconX size={14} />
					</IconButton>
				)}
			</div>

			<div class='explore-search-input__divider' />

			<div class='explore-search-input__dropdown'>
				<SelectField<EntityFilter>
					options={ENTITY_OPTIONS}
					value={entityType}
					onChange={(val) => entityType.value = val as EntityFilter}
					displayMode='chips-inside'
				/>
			</div>

			<IconButton
				className='explore-search-input__submit'
				variant='primary'
				htmlType='submit'
				aria-label='Submit search'
			>
				<IconSearch size={size === 'lg' ? 20 : 18} />
			</IconButton>
		</form>
	);
}
