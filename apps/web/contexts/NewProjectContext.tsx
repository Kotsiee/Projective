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
	Visibility,
} from '@projective/types';
import { UIStage } from '@components/dashboard/projects/new/ProjectStages.tsx';

export interface ProjectFormState {
	title: Signal<string>;
	description: Signal<any>;
	tags: Signal<string[]>;
	category: Signal<string | undefined>;
	visibility: Signal<string>;
	currency: Signal<string>;
	timelinePreset: Signal<string | undefined>;
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
}

export function useProjectFormState(): ProjectFormState {
	return {
		title: useSignal(''),
		description: useSignal(JSON.stringify({ ops: [{ insert: '\n' }] })),
		tags: useSignal(['Design', 'Development']),
		category: useSignal<string | undefined>(undefined),
		visibility: useSignal<string>(Visibility.Public),
		currency: useSignal<string>('USD'),
		timelinePreset: useSignal<string | undefined>(undefined),
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
			order: 0,
			start_trigger_type: StartTriggerType.OnProjectStart,
			staffing_roles: [],
			open_seats: [],
			_ui_model_type: 'defined_roles',
			_attachments_temp: signal([]),
			file_revisions_allowed: 1,
			session_duration_minutes: 60,
		}]),
	};
}

const ProjectContext = createContext<ProjectFormState | null>(null);

export function ProjectFormProvider({ children }: { children: any }) {
	const state = useProjectFormState();
	return <ProjectContext.Provider value={state}>{children}</ProjectContext.Provider>;
}

export function useNewProjectContext() {
	const ctx = useContext(ProjectContext);
	if (!ctx) throw new Error('useNewProjectContext must be used within ProjectFormProvider');
	return ctx;
}
