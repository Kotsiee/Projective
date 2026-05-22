// #region Imports
import { ComponentChildren, createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { Signal, signal } from '@preact/signals';
import {
	FileWithMeta,
	IPOptionMode,
	PortfolioDisplayRights,
	ProjectFormat,
	TimelinePreset,
	Visibility,
} from '@projective/types';
import { UIStage } from '../components/new/ProjectStages.tsx';
// #endregion

// #region Interfaces
/**
 * @interface NewProjectState
 * @description Centralized state management for the Project Creation Wizard.
 */
export interface NewProjectState {
	currentStep: Signal<number>;

	// Step 1: Details
	format: Signal<ProjectFormat>;
	title: Signal<string>;
	description: Signal<string>;
	category: Signal<string>;
	visibility: Signal<Visibility>;
	currency: Signal<string>;
	tags: Signal<string[]>;
	attachments: Signal<FileWithMeta[]>;

	// Step 2: Legal
	ipMode: Signal<IPOptionMode>;
	ndaRequired: Signal<string>;
	portfolioRights: Signal<PortfolioDisplayRights>;
	locationRestriction: Signal<string>;
	languageRequirement: Signal<string>;
	screeningQuestions: Signal<string[]>;

	// Step 3: Stages (Skills & Tasks moved into UIStage)
	stages: Signal<UIStage[]>;

	// Step 4: Timeline
	timelinePreset: Signal<TimelinePreset>;
	targetStartDate: Signal<any>;
	timelineSelectedStageIndex: Signal<number>;
}
// #endregion

// #region State Initialization
const defaultState: NewProjectState = {
	currentStep: signal(1),

	format: signal(ProjectFormat.Pipeline),
	title: signal(''),
	description: signal(''),
	category: signal(''),
	visibility: signal(Visibility.Public),
	currency: signal('USD'),
	tags: signal([]),
	attachments: signal([]),

	ipMode: signal(IPOptionMode.ExclusiveTransfer),
	ndaRequired: signal('false'),
	portfolioRights: signal(PortfolioDisplayRights.Allowed),
	locationRestriction: signal(''),
	languageRequirement: signal(''),
	screeningQuestions: signal(['']),

	stages: signal([]),

	timelinePreset: signal(TimelinePreset.Sequential),
	targetStartDate: signal(undefined),
	timelineSelectedStageIndex: signal(0),
};

const NewProjectContext = createContext<NewProjectState>(defaultState);
// #endregion

// #region Provider & Hooks
/**
 * @function ProjectFormProvider
 * @description Wraps the creation wizard to provide isolated state.
 */
export function ProjectFormProvider({ children }: { children: ComponentChildren }) {
	return (
		<NewProjectContext.Provider value={defaultState}>
			{children}
		</NewProjectContext.Provider>
	);
}

/**
 * @function useNewProjectContext
 * @description Accesses the project creation wizard state.
 * @throws Error if used outside of ProjectFormProvider.
 */
export function useNewProjectContext() {
	const context = useContext(NewProjectContext);
	if (!context) throw new Error('useNewProjectContext must be used within ProjectFormProvider');
	return context;
}
// #endregion

// #region Validation Logic
/**
 * @function validateProjectStep
 * @description Validates a specific step in the wizard.
 * @param step The current step index (1-based).
 * @param state The current state context.
 * @returns An array of error strings. Empty if valid.
 */
export function validateProjectStep(step: number, state: NewProjectState): string[] {
	const errors: string[] = [];

	if (step === 1) {
		if (!state.format.value) errors.push('Project format is required.');
		if (state.title.value.trim().length < 5) errors.push('Title must be at least 5 characters.');
		if (!state.description.value) errors.push('Description is required.');
		if (!state.category.value) errors.push('Industry category is required.');
	}

	if (step === 3) {
		if (state.stages.value.length === 0) errors.push('At least one stage is required.');
	}

	if (step === 4) {
		if (!state.targetStartDate.value) errors.push('Target start date is required.');
	}

	return errors;
}

/**
 * @function isProjectFormValid
 * @description Validates the entire form before publishing.
 * @param state The current state context.
 * @returns True if all steps pass validation.
 */
export function isProjectFormValid(state: NewProjectState): boolean {
	for (let i = 1; i <= 5; i++) {
		if (validateProjectStep(i, state).length > 0) return false;
	}
	return true;
}
// #endregion
