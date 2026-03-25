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
