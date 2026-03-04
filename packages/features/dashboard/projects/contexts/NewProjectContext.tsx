// deno-lint-ignore-file no-explicit-any
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { Signal, signal, useSignal } from '@preact/signals';
import {
	DateTime,
	FileWithMeta,
	IPOptionMode,
	PortfolioDisplayRights,
	StageType,
	StartTriggerType,
	TimelinePreset,
	Visibility,
} from '@projective/types';
import { UIStage } from '@components/dashboard/projects/new/ProjectStages.tsx';

export interface ProjectFormState {
	currentStep: Signal<number>;

	title: Signal<string>;
	description: Signal<any>;
	tags: Signal<string[]>;
	category: Signal<string | undefined>;
	visibility: Signal<string>;
	currency: Signal<string>;
	timelinePreset: Signal<string>; // Changed from undefined
	targetStartDate: Signal<DateTime | undefined>;
	thumbnail: Signal<FileWithMeta | undefined>;
	attachments: Signal<FileWithMeta[]>;

	ipMode: Signal<string>;
	ndaRequired: Signal<string>;
	portfolioRights: Signal<string>;
	locationRestriction: Signal<string>;
	languageRequirement: Signal<string>;
	skills: Signal<string[]>;
	screeningQuestions: Signal<string[]>;

	stages: Signal<UIStage[]>;

	timelineSelectedStageIndex: Signal<number>;
}

export function useProjectFormState(): ProjectFormState {
	return {
		currentStep: useSignal(1),

		title: useSignal(''),
		description: useSignal(JSON.stringify({ ops: [{ insert: '\n' }] })),
		tags: useSignal(['Design', 'Development']),
		category: useSignal<string | undefined>(undefined),
		visibility: useSignal<string>(Visibility.Public),
		currency: useSignal<string>('USD'),
		timelinePreset: useSignal<string>(TimelinePreset.Sequential), // Now safely initialized
		targetStartDate: useSignal<DateTime | undefined>(undefined),
		thumbnail: useSignal<FileWithMeta | undefined>(undefined),
		attachments: useSignal<FileWithMeta[]>([]),

		ipMode: useSignal<string>(IPOptionMode.ExclusiveTransfer),
		ndaRequired: useSignal<string>('false'),
		portfolioRights: useSignal<string>(PortfolioDisplayRights.Allowed),
		locationRestriction: useSignal(''),
		languageRequirement: useSignal(''),
		skills: useSignal<string[]>([]),
		screeningQuestions: useSignal<string[]>(['']),

		stages: useSignal<UIStage[]>([{
			title: 'Initial Stage',
			description: { ops: [{ insert: '\n' }] },
			stage_type: StageType.FileBased,
			status: 'open',
			sort_order: 0,
			start_trigger_type: StartTriggerType.OnProjectStart,
			staffing_roles: [],
			open_seats: [],
			_ui_model_type: 'defined_roles',
			_attachments_temp: signal([]),
			file_revisions_allowed: 1,
			session_duration_minutes: 60,
			hire_trigger_active: true,
		}]),

		timelineSelectedStageIndex: useSignal(0),
	};
}

const ProjectContext = createContext<ProjectFormState | null>(null);

export function ProjectFormProvider({ children }: { children: any }) {
	const state = useProjectFormState();
	return (
		<ProjectContext.Provider value={state}>
			{children}
		</ProjectContext.Provider>
	);
}

export function useNewProjectContext() {
	const ctx = useContext(ProjectContext);
	if (!ctx) {
		throw new Error(
			'useNewProjectContext must be used within ProjectFormProvider',
		);
	}
	return ctx;
}

// #region Validation Helpers
export function validateProjectStep(stepIndex: number, state: ProjectFormState): string[] {
	const errors: string[] = [];

	try {
		if (stepIndex === 0) { // Step 1: Details
			if (!state.title.value || state.title.value.trim().length < 5) {
				errors.push('Project Title must be at least 5 characters.');
			}
			if (!state.category.value) errors.push('Please select an Industry Category.');
		}

		if (stepIndex === 2) { // Step 3: Stages
			if (!state.stages.value || state.stages.value.length === 0) {
				errors.push('You must define at least one project stage.');
			} else {
				state.stages.value.forEach((stage, i) => {
					if (!stage.title || stage.title.trim().length === 0) {
						errors.push(`Stage ${i + 1} is missing a title.`);
					}
				});
			}
		}

		if (stepIndex === 3) { // Step 4: Timeline
			if (!state.targetStartDate.value) {
				errors.push('Global Project Start Date is required.');
			}
			state.stages.value.forEach((stage, i) => {
				if (stage.start_trigger_type === StartTriggerType.FixedDate && !stage.fixed_start_date) {
					errors.push(`Stage ${i + 1} requires a Fixed Start Date.`);
				}
				if (
					stage.start_trigger_type === StartTriggerType.DependentOnStage &&
					!stage.start_dependency_stage_id
				) {
					errors.push(`Stage ${i + 1} is missing a dependency selection.`);
				}
			});
		}

		if (stepIndex === 4) { // Step 5: Budget
			state.stages.value.forEach((stage, i) => {
				if (stage._ui_model_type === 'defined_roles') {
					if (!stage.staffing_roles || stage.staffing_roles.length === 0) {
						errors.push(`Stage ${i + 1} requires at least one defined role.`);
					} else {
						stage.staffing_roles.forEach((r) => {
							if (!r.role_title || r.role_title.trim().length === 0) {
								errors.push(`A role in Stage ${i + 1} is missing a title.`);
							}
							if (r.quantity < 1) {
								errors.push(`A role in Stage ${i + 1} must have a quantity of at least 1.`);
							}
						});
					}
				} else if (stage._ui_model_type === 'open_seats') {
					const seat = stage.open_seats?.[0];
					if (!seat || !seat.description_of_need || seat.description_of_need.trim().length < 10) {
						errors.push(`Stage ${i + 1} requires a detailed description of need (min 10 chars).`);
					}
				}
			});
		}
	} catch (e) {
		console.error('Validation crashed:', e);
		errors.push('An unexpected error occurred while validating this step.');
	}

	return errors;
}

export function isProjectFormValid(state: ProjectFormState): boolean {
	// Check all 5 user input steps (0 through 4)
	for (let i = 0; i <= 4; i++) {
		if (validateProjectStep(i, state).length > 0) return false;
	}
	return true;
}
// #endregion
