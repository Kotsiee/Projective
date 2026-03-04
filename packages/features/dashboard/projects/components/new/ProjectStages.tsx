/**
 * @file ProjectStages.tsx
 * @description Step 3 of the Project Creation Engine.
 * Manages the definition of atomic project stages (The "What"), stripping out temporal and financial concerns.
 */
// deno-lint-ignore-file no-explicit-any
import '../../styles/components/new/new-project-stages.css';
import { Signal, signal, useSignal } from '@preact/signals';
import {
	IconBriefcase,
	IconCheck,
	IconChevronDown,
	IconCircle,
	IconPlus,
	IconSettings,
	IconTrash,
} from '@tabler/icons-preact';

import { RichTextField, SelectField, TextField } from '@projective/fields';
import { IPOptionMode, SelectOption, StageType, StartTriggerType } from '@projective/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@projective/ui';

import ProjectStageFile from './stages/ProjectStageFile.tsx';
import ProjectStageMaintenance from './stages/ProjectStageMaintenance.tsx';
import ProjectStageManagement from './stages/ProjectStageManagement.tsx';
import ProjectStageSession from './stages/ProjectStageSession.tsx';
import { Stage } from '../../contracts/new/Stage.ts';
import { useNewProjectContext } from '../../contexts/NewProjectContext.tsx';
import { FileWithMeta } from '@projective/types';

export interface UIStage extends Stage {
	_ui_model_type: 'defined_roles' | 'open_seats';
	_attachments_temp: Signal<FileWithMeta[]>;
	hire_trigger_active: boolean;
}

export default function ProjectStages() {
	const state = useNewProjectContext();

	// #region Factory
	function createDefaultStage(): UIStage {
		return {
			title: '',
			description: { ops: [{ insert: '\n' }] },
			stage_type: StageType.FileBased,
			status: 'open',
			sort_order: state.stages.value.length,

			// Initialized for Step 4
			start_trigger_type: StartTriggerType.DependentOnStage,

			// Initialized for Step 5
			staffing_roles: [],
			open_seats: [],
			_ui_model_type: 'defined_roles',

			_attachments_temp: signal([]),

			// Defaults for Type-Specific configs
			file_revisions_allowed: 1,
			file_duration_mode: 'relative_duration',
			file_duration_days: 7,
			file_extensions_allowed: [],
			file_max_size_mb: 2048, // 2GB default
			file_max_count: 20,

			session_duration_minutes: 60,
			session_count: 1,
			session_preferred_days: [],
			hire_trigger_active: true,
		};
	}
	// #endregion

	// #region Helper Functions
	const getStatusIcon = (status: string) => {
		if (status.toLowerCase() === 'completed') {
			return <IconCheck size={18} color='var(--success)' />;
		}
		if (status.toLowerCase() === 'in_progress') {
			return <IconCircle size={18} color='var(--primary-500)' fill='currentColor' />;
		}
		return <IconCircle size={18} color='var(--gray-400)' />;
	};

	const addStage = () => {
		state.stages.value = [...state.stages.value, createDefaultStage()];
	};

	const removeStage = (index: number) => {
		state.stages.value = state.stages.value.filter((_, i) => i !== index);
	};
	// #endregion

	return (
		<div className='new-project__stages'>
			<div className='stages-header'>
				<h2>Define Stages (The "What")</h2>
				<p className='stages-header__subtitle'>
					Break your project down into modular deliverables or milestones. We will assign budgets
					and timelines later.
				</p>
			</div>

			<Accordion type='multiple' variant='outlined' defaultValue={['0']}>
				{state.stages.value.map((stage, index) => (
					<AccordionItem
						key={index.toString()}
						value={index.toString()}
						className='accordion-item'
					>
						<AccordionTrigger
							startIcon={getStatusIcon(stage.status)}
							subtitle={stage.stage_type.replace('_', ' ')}
						>
							{stage.title.length > 0 ? stage.title : `Stage ${index + 1}`}
						</AccordionTrigger>
						<AccordionContent>
							<ProjectStage id={index} />
							<div className='stage-footer'>
								<button
									type='button'
									className='btn-remove-stage'
									onClick={() => removeStage(index)}
								>
									<IconTrash size={16} /> Remove Stage
								</button>
							</div>
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>

			<button type='button' className='btn-add-dashed' onClick={addStage}>
				<IconPlus size={18} /> Add New Stage
			</button>
		</div>
	);
}

/**
 * Sub-component for individual stage editing (Scope Definition only).
 */
export function ProjectStage({ id }: { id: number }) {
	const state = useNewProjectContext();
	const stage = state.stages.value[id];
	const isAdvancedOpen = useSignal(false);

	if (!stage) return null;

	// #region Options
	const stageTypes: SelectOption<string>[] = [
		{ label: 'File Based (Deliverable)', value: StageType.FileBased },
		{ label: 'Session Based (Call/Workshop)', value: StageType.SessionBased },
		{ label: 'Management Based (Contractual)', value: StageType.ManagementBased },
		{ label: 'Maintenance Based (Recurring)', value: StageType.MaintenanceBased },
	];

	const ipOptions: SelectOption<string>[] = [
		{ label: 'Use Project Default', value: 'default' },
		{ label: 'Exclusive Transfer', value: IPOptionMode.ExclusiveTransfer },
		{ label: 'Licensed Use', value: IPOptionMode.LicensedUse },
		{ label: 'Shared Ownership', value: IPOptionMode.SharedOwnership },
	];
	// #endregion

	const updateStage = (field: keyof UIStage, value: any) => {
		const newStages = [...state.stages.value];
		newStages[id] = { ...newStages[id], [field]: value };
		state.stages.value = newStages;
	};

	return (
		<div className='stage-form'>
			{/* SECTION 1: CORE DEFINITION */}
			<div className='stage-section'>
				<div className='stage-section__header'>
					<h4 className='stage-section__title'>
						<IconBriefcase size={16} /> Scope Definition
					</h4>
				</div>

				<div className='form-grid'>
					<TextField
						label='Stage Name'
						value={stage.title}
						onChange={(v) => updateStage('title', v)}
						showCount
						maxLength={100}
						placeholder='e.g. Initial UI/UX Design'
						floating
						required
					/>
					<SelectField
						name={`stage-type-${id}`}
						label='Stage Type'
						options={stageTypes}
						value={stage.stage_type}
						onChange={(v) => updateStage('stage_type', v as string)}
						searchable={false}
						multiple={false}
						floating
						required
					/>

					<div className='form-grid--span-full'>
						<RichTextField
							label='Stage Requirements & Description'
							value={stage.description.toString()}
							onChange={(v) => updateStage('description', v)}
							minHeight='120px'
							toolbar='basic'
							placeholder='Describe exactly what needs to be delivered or accomplished...'
							variant='framed'
							outputFormat='delta'
							required
						/>
					</div>
				</div>
			</div>

			{/* SECTION 2: ADVANCED SETTINGS (COLLAPSIBLE) */}
			<div className='stage-section'>
				<button
					type='button'
					className='stage-section__header stage-section__header--interactive'
					onClick={() => isAdvancedOpen.value = !isAdvancedOpen.value}
				>
					<h4 className='stage-section__title'>
						<IconSettings size={16} /> Advanced Settings & Constraints
					</h4>
					<IconChevronDown
						size={16}
						className={`stage-section__chevron ${
							isAdvancedOpen.value ? 'stage-section__chevron--open' : ''
						}`}
					/>
				</button>

				{isAdvancedOpen.value && (
					<div className='stage-section__content'>
						{/* Overrides block (Applies to all stage types) */}
						<div className='form-grid' style={{ marginBottom: '1.25rem' }}>
							<div className='form-grid--span-full'>
								<SelectField
									name={`ip-override-${id}`}
									label='Stage IP Ownership Override'
									options={ipOptions}
									value={stage.ip_ownership_override || 'default'}
									onChange={(v) =>
										updateStage('ip_ownership_override', v === 'default' ? undefined : v)}
									searchable={false}
									multiple={false}
									floating
									hint='Overrides the global project IP ownership specifically for this deliverable.'
								/>
							</div>
						</div>

						{/* Type Specific Advanced Config */}
						<div className='type-specific-config'>
							{stage.stage_type === StageType.FileBased && (
								<ProjectStageFile stage={stage} updateStage={updateStage} />
							)}
							{stage.stage_type === StageType.SessionBased && (
								<ProjectStageSession stage={stage} updateStage={updateStage} />
							)}
							{stage.stage_type === StageType.ManagementBased && (
								<ProjectStageManagement stage={stage} updateStage={updateStage} />
							)}
							{stage.stage_type === StageType.MaintenanceBased && (
								<ProjectStageMaintenance stage={stage} updateStage={updateStage} />
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
