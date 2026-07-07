import '../../styles/components/search/filters.css';
import { useSignal } from '@preact/signals';
import { IconStar, IconStarFilled } from '@tabler/icons-preact';
import { SelectField, SelectOption, SliderField } from '@projective/fields';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from '@projective/ui';
import type { Availability } from '@projective/types';
import { useExploreContext } from '../../contexts/ExploreContext.tsx';
import { DEFAULT_FILTERS } from '../../contracts/Explore.ts';

// #region Option data
const SKILLS: SelectOption<string>[] = [
	{ label: 'React', value: 'react' },
	{ label: 'TypeScript', value: 'typescript' },
	{ label: 'Python', value: 'python' },
	{ label: 'Figma', value: 'figma' },
	{ label: 'Motion', value: 'motion' },
	{ label: 'AI / LLM', value: 'ai' },
];
const LOCATIONS: SelectOption<string>[] = [
	{ label: 'Remote', value: 'remote' },
	{ label: 'United Kingdom', value: 'uk' },
	{ label: 'Germany', value: 'de' },
	{ label: 'Portugal', value: 'pt' },
	{ label: 'United States', value: 'us' },
];
const LANGUAGES: SelectOption<string>[] = [
	{ label: 'English', value: 'en' },
	{ label: 'French', value: 'fr' },
	{ label: 'Spanish', value: 'es' },
	{ label: 'German', value: 'de' },
];
const AVAILABILITY: { label: string; value: Availability | 'any' }[] = [
	{ label: 'Any', value: 'any' },
	{ label: 'Available', value: 'available' },
	{ label: 'Busy', value: 'busy' },
];
// #endregion

/**
 * @function ExploreSearchFilters
 * @description Advanced parameter workspace (Budget, Availability, Rating, Skills, Location,
 * Language). Only mounted in the single-entity view, where these parameters are unlocked. Every
 * change mirrors into the shared `filters` signal so results re-query live.
 */
export default function ExploreSearchFilters() {
	const { filters } = useExploreContext();
	const f = filters.value;

	// Local mirrors bound to the field components.
	const budget = useSignal<number[]>([f.budget_min_cents / 100, f.budget_max_cents / 100]);
	const rating = useSignal<number>(f.min_rating);
	const availability = useSignal<Availability | 'any'>(f.availability ?? 'any');
	const skills = useSignal<string[]>(f.skills);
	const locations = useSignal<string[]>(f.locations);
	const languages = useSignal<string[]>(f.languages);

	const patch = (next: Partial<typeof f>) => {
		filters.value = { ...filters.value, ...next };
	};

	const reset = () => {
		budget.value = [0, 10000];
		rating.value = 0;
		availability.value = 'any';
		skills.value = [];
		locations.value = [];
		languages.value = [];
		filters.value = { ...DEFAULT_FILTERS, entity_type: filters.value.entity_type };
	};

	return (
		<div class='explore-filters'>
			<div class='explore-filters__head'>
				<h3>Refine</h3>
				<button type='button' class='explore-filters__reset' onClick={reset}>Reset</button>
			</div>

			<Accordion
				type='multiple'
				defaultValue={['budget', 'availability', 'rating', 'skills', 'location', 'language']}
				variant='ghost'
				density='compact'
			>
				{/* BUDGET */}
				<AccordionItem value='budget'>
					<AccordionTrigger>Budget</AccordionTrigger>
					<AccordionContent>
						<div class='explore-filters__budget'>
							<div class='explore-filters__budget-readout'>
								<span>${budget.value[0].toLocaleString()}</span>
								<span>${budget.value[1].toLocaleString()}+</span>
							</div>
							<SliderField
								value={budget}
								onChange={(val) => {
									const v = val as number[];
									budget.value = v;
									patch({ budget_min_cents: v[0] * 100, budget_max_cents: v[1] * 100 });
								}}
								min={0}
								max={10000}
								step={50}
								range
							/>
						</div>
					</AccordionContent>
				</AccordionItem>

				{/* AVAILABILITY */}
				<AccordionItem value='availability'>
					<AccordionTrigger>Availability</AccordionTrigger>
					<AccordionContent>
						<div class='explore-filters__segment' role='radiogroup' aria-label='Availability'>
							{AVAILABILITY.map((opt) => (
								<button
									type='button'
									key={opt.value}
									role='radio'
									aria-checked={availability.value === opt.value}
									class={`explore-filters__seg ${availability.value === opt.value ? 'is-active' : ''}`}
									onClick={() => {
										availability.value = opt.value;
										patch({ availability: opt.value === 'any' ? null : opt.value });
									}}
								>
									{opt.label}
								</button>
							))}
						</div>
					</AccordionContent>
				</AccordionItem>

				{/* RATING */}
				<AccordionItem value='rating'>
					<AccordionTrigger>Rating</AccordionTrigger>
					<AccordionContent>
						<div class='explore-filters__stars' role='radiogroup' aria-label='Minimum rating'>
							{[1, 2, 3, 4, 5].map((star) => (
								<button
									type='button'
									key={star}
									role='radio'
									aria-checked={rating.value === star}
									class='explore-filters__star'
									onClick={() => {
										const next = rating.value === star ? 0 : star;
										rating.value = next;
										patch({ min_rating: next });
									}}
								>
									{star <= rating.value
										? <IconStarFilled class='is-on' size={22} />
										: <IconStar size={22} />}
								</button>
							))}
							<span class='explore-filters__stars-label'>
								{rating.value ? `${rating.value}.0 & up` : 'Any'}
							</span>
						</div>
					</AccordionContent>
				</AccordionItem>

				{/* SKILLS */}
				<AccordionItem value='skills'>
					<AccordionTrigger>Skills</AccordionTrigger>
					<AccordionContent>
						<SelectField<string>
							options={SKILLS}
							value={skills}
							onChange={(val) => {
								skills.value = val as string[];
								patch({ skills: val as string[] });
							}}
							multiple
							searchable
							clearable
							displayMode='chips-below'
							placeholder='Add skills'
						/>
					</AccordionContent>
				</AccordionItem>

				{/* LOCATION */}
				<AccordionItem value='location'>
					<AccordionTrigger>Location</AccordionTrigger>
					<AccordionContent>
						<SelectField<string>
							options={LOCATIONS}
							value={locations}
							onChange={(val) => {
								locations.value = val as string[];
								patch({ locations: val as string[] });
							}}
							multiple
							searchable
							clearable
							displayMode='chips-below'
							placeholder='Add locations'
						/>
					</AccordionContent>
				</AccordionItem>

				{/* LANGUAGE */}
				<AccordionItem value='language'>
					<AccordionTrigger>Language</AccordionTrigger>
					<AccordionContent>
						<SelectField<string>
							options={LANGUAGES}
							value={languages}
							onChange={(val) => {
								languages.value = val as string[];
								patch({ languages: val as string[] });
							}}
							multiple
							searchable
							clearable
							displayMode='chips-below'
							placeholder='Add languages'
						/>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			{/* Filters apply live via the shared signal; this is a reassuring affordance. */}
			<Button variant='primary' fullWidth rounded>
				Show results
			</Button>
		</div>
	);
}
