// #region Imports
import '../../../styles/components/onboarding/inputs/objective-input.css';
import { Signal, useSignal } from '@preact/signals';
import { Button, useWizardContext } from '@projective/ui';
import { TextField } from '@projective/fields';
import { IconBriefcase, IconPlus, IconUser } from '@tabler/icons-preact';
import { useOnboardingContext } from '../../../contexts/OnboardingContext.tsx';
import { CreateAccountButton } from '@features/auth/components/onboarding/actions/CreateAccount.tsx';
// #endregion

// #region Constants
const SUGGESTED_SKILLS = [
	'Figma',
	'JavaScript',
	'Architecture',
	'React',
	'Mathematics',
	'Logo Design',
	'Social Media',
	'C#',
	'C++',
	'Graphics Programming',
	'Game Design',
	'Graph Theory',
];

const SUGGESTED_INTERESTS = [
	'Web Development',
	'Brand Identity',
	'SEO',
	'Mobile Apps',
	'Data Analysis',
	'Copywriting',
	'Video Editing',
	'Machine Learning',
	'UX Research',
	'Illustration',
];
// #endregion

// #region Sub-Components
interface TagSelectorProps {
	title: string;
	subtitle: string;
	suggestions: string[];
	signal: Signal<string[] | undefined>;
	max?: number;
}

/**
 * @function TagSelector
 * @description Renders a pill-based tag selection interface with manual input fallback.
 */
function TagSelector({ title, subtitle, suggestions, signal, max = 10 }: TagSelectorProps) {
	const customInput = useSignal('');
	const currentTags = signal.value || [];

	const toggleTag = (tag: string) => {
		if (currentTags.includes(tag)) {
			signal.value = currentTags.filter((t) => t !== tag);
		} else if (currentTags.length < max) {
			signal.value = [...currentTags, tag];
		}
	};

	const addCustomTag = () => {
		const cleanTag = customInput.value.trim();
		if (cleanTag && !currentTags.includes(cleanTag) && currentTags.length < max) {
			signal.value = [...currentTags, cleanTag];
			customInput.value = '';
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			addCustomTag();
		}
	};

	// Combine selected tags that aren't in the suggestions with the suggestions list
	const customSelected = currentTags.filter((t) => !suggestions.includes(t));
	const displayTags = [...suggestions, ...customSelected];

	return (
		<div class='objective-tag-selector'>
			<div class='objective-input__header'>
				<h3 class='objective-input__title'>{title}</h3>
				<p class='objective-input__subtitle'>{subtitle}</p>
			</div>

			<div class='objective-tag-selector__pool'>
				{displayTags.map((tag) => {
					const isSelected = currentTags.includes(tag);
					return (
						<button
							key={tag}
							type='button'
							class={`objective-tag ${
								isSelected ? 'objective-tag--selected' : 'objective-tag--suggested'
							}`}
							onClick={() => toggleTag(tag)}
						>
							{tag} {isSelected ? '' : '+'}
						</button>
					);
				})}
			</div>

			<TextField
				value={customInput}
				placeholder='Add custom...'
				onKeyDown={handleKeyDown}
				floatingRule='never'
				disabled={currentTags.length >= max}
				suffix={
					<button
						type='button'
						class='objective-tag-selector__add-btn'
						onClick={addCustomTag}
						disabled={!customInput.value.trim() || currentTags.length >= max}
					>
						<IconPlus size={16} stroke={2.5} />
					</button>
				}
			/>
		</div>
	);
}
// #endregion

// #region Main Component
/**
 * @function ObjectiveInput
 * @description Step 3 of the onboarding wizard. Handles role selection (Client/Seller) and respective tags.
 */
export function ObjectiveInput() {
	const { back } = useWizardContext();
	const { objective, skills, interests } = useOnboardingContext();

	return (
		<div class='objective-input'>
			{/* Base Objective Selection */}
			<div class='objective-input__selection'>
				<div class='objective-input__section'>
					<div class='objective-input__header'>
						<h3 class='objective-input__title'>What do you wish to achieve?</h3>
						<p class='objective-input__subtitle'>This can always be changed later.</p>
					</div>

					<div class='objective-input__cards'>
						<div
							class={`objective-card ${
								objective.value === 'client' ? 'objective-card--selected' : ''
							}`}
							onClick={() => objective.value = 'client'}
						>
							<IconUser size={48} stroke={1.5} class='objective-card__icon' />
							<div>
								<h4 class='objective-card__title'>Client</h4>
								<p class='objective-card__desc'>I want to hire freelancers for my projects</p>
							</div>
						</div>

						<div
							class={`objective-card ${
								objective.value === 'seller' ? 'objective-card--selected' : ''
							}`}
							onClick={() => objective.value = 'seller'}
						>
							<IconBriefcase size={48} stroke={1.5} class='objective-card__icon' />
							<div>
								<h4 class='objective-card__title'>Seller</h4>
								<p class='objective-card__desc'>
									I want to be a freelancer and sell my products or services
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Conditional Slide-in Sections based on Objective */}
				{objective.value && (
					<div class='objective-input__slide-wrapper'>
						{objective.value === 'seller' && (
							<TagSelector
								title='What are your skills?'
								subtitle='Pick up to 10'
								suggestions={SUGGESTED_SKILLS}
								signal={skills}
							/>
						)}

						{/* Clients see Interests. Sellers see both Skills and Interests. */}
						{(objective.value === 'client' || objective.value === 'seller') && (
							<TagSelector
								title='What are your interests?'
								subtitle='Pick up to 10 to help us personalize your feed'
								suggestions={SUGGESTED_INTERESTS}
								signal={interests}
							/>
						)}
					</div>
				)}
			</div>
			<div class='objective-input__actions'>
				<Button
					className='objective-input__back-button'
					variant='secondary'
					onClick={back}
				>
					Back
				</Button>

				<CreateAccountButton enabled={!!objective.value} />
			</div>
		</div>
	);
}
// #endregion
