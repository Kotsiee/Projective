/**
 * @file ProjectStages.tsx
 * @description Step 3 of the Project Creation Engine.
 * Manages the definition of atomic project stages (The "What"), stripping out temporal, financial, and rigid type concerns.
 */

// #region Imports
import '../../styles/components/new/new-project-stages.css';
import { Signal, signal, useSignal } from '@preact/signals';
import {
	IconBriefcase,
	IconCheck,
	IconChevronDown,
	IconCircle,
	IconListCheck,
	IconPlus,
	IconSettings,
	IconTrash,
	IconUpload,
} from '@tabler/icons-preact';

import { RichTextField, SelectField, SelectOption, TagInput, TextField } from '@projective/fields';
import { FileWithMeta, IPOptionMode, StartTriggerType } from '@projective/types';

import { Stage } from '../../contracts/new/Stage.ts';
import { useNewProjectContext } from '../../contexts/NewProjectContext.tsx';
// #endregion

// #region Interfaces
export interface UIStage extends Stage {
	_ui_model_type: 'defined_roles' | 'open_seats';
	_attachments_temp: Signal<FileWithMeta[]>;
	hire_trigger_active: boolean;
}
// #endregion

export default function ProjectStages() {
	const state = useNewProjectContext();
	const activeTabIndex = useSignal(0);

	// #region Helpers
	function createDefaultStage(): UIStage {
		return {
			title: '',
			description: { ops: [{ insert: '\n' }] },
			status: 'open',
			sort_order: state.stages.value.length,
			start_trigger_type: StartTriggerType.DependentOnStage,

			// New Unified Features
			file_upload_required: false,
			default_tasks: [],
			skills: [],

			staffing_roles: [],
			open_seats: [],
			_ui_model_type: 'defined_roles',
			_attachments_temp: signal([]),
			hire_trigger_active: true,
		};
	}

	const getStatusIcon = (status: string) => {
		if (status.toLowerCase() === 'completed') {
			return <IconCheck size={16} color='var(--success)' />;
		}
		if (status.toLowerCase() === 'in_progress') {
			return <IconCircle size={16} color='var(--primary)' fill='currentColor' />;
		}
		return <IconCircle size={16} color='currentColor' style={{ opacity: 0.5 }} />;
	};

	const addStage = () => {
		state.stages.value = [...state.stages.value, createDefaultStage()];
		activeTabIndex.value = state.stages.value.length - 1;
	};

	const removeStage = (index: number) => {
		state.stages.value = state.stages.value.filter((_, i) => i !== index);
		if (activeTabIndex.value >= state.stages.value.length) {
			activeTabIndex.value = Math.max(0, state.stages.value.length - 1);
		}
	};
	// #endregion

	return (
		<div className='new-project__stages'>
			<div className='stages-header'>
				<h2>Define Stages (The "What")</h2>
				<p className='stages-header__subtitle'>
					Break your project down into modular milestones. Define the scope, required skills, and
					specific tasks.
				</p>
			</div>

			{/* TABBED NAVIGATION */}
			<div className='stages-tabs-wrapper'>
				<div className='stages-tabs'>
					{state.stages.value.map((stage, index) => (
						<button
							key={index.toString()}
							type='button'
							className={`stages-tab ${activeTabIndex.value === index ? 'stages-tab--active' : ''}`}
							onClick={() => activeTabIndex.value = index}
						>
							{getStatusIcon(stage.status)}
							<span className='stages-tab__label'>
								{stage.title || `Stage ${index + 1}`}
							</span>
						</button>
					))}
					<button type='button' className='stages-tab-add' onClick={addStage} title='Add Stage'>
						<IconPlus size={18} />
					</button>
				</div>
			</div>

			{/* ACTIVE STAGE CONTENT PANEL */}
			{state.stages.value.length > 0 && (
				<div className='stages-content-panel'>
					{/* FIX: Added a unique key to force remount on tab change so RichTextField re-initializes */}
					<ProjectStage key={`stage-panel-${activeTabIndex.value}`} id={activeTabIndex.value} />

					<div className='stage-footer'>
						<button
							type='button'
							className='btn-remove-stage'
							onClick={() => removeStage(activeTabIndex.value)}
						>
							<IconTrash size={16} /> Remove Stage
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

// #region Sub-Components
/**
 * @function ProjectStage
 * @description Sub-component for individual stage editing (Scope Definition only).
 */
export function ProjectStage({ id }: { id: number }) {
	const state = useNewProjectContext();
	const stage = state.stages.value[id];
	const isAdvancedOpen = useSignal(false);

	if (!stage) return null;

	const ipOptions: SelectOption<string>[] = [
		{ label: 'Use Project Default', value: 'default' },
		{ label: 'Exclusive Transfer', value: IPOptionMode.ExclusiveTransfer },
		{ label: 'Licensed Use', value: IPOptionMode.LicensedUse },
		{ label: 'Shared Ownership', value: IPOptionMode.SharedOwnership },
	];

	// deno-lint-ignore no-explicit-any
	const updateStage = (field: keyof UIStage, value: any) => {
		const newStages = [...state.stages.value];
		newStages[id] = { ...newStages[id], [field]: value };
		state.stages.value = newStages;
	};

	// Task Management Handlers
	const addTask = () => {
		const currentTasks = stage.default_tasks || [];
		updateStage('default_tasks', [...currentTasks, { id: crypto.randomUUID(), description: '' }]);
	};

	const updateTask = (taskIndex: number, desc: string) => {
		const currentTasks = [...(stage.default_tasks || [])];
		currentTasks[taskIndex].description = desc;
		updateStage('default_tasks', currentTasks);
	};

	const removeTask = (taskIndex: number) => {
		const currentTasks = (stage.default_tasks || []).filter((_, i) => i !== taskIndex);
		updateStage('default_tasks', currentTasks);
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
					<div className='form-grid--span-full'>
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
					</div>

					<div className='form-grid--span-full'>
						<TagInput
							name={`stage-skills-${id}`}
							label='Required Skills for this Stage'
							value={stage.skills || []}
							onChange={(v) => updateStage('skills', v)}
							placeholder='e.g. React, Figma, SEO...'
							floating
							hint='Skills specific to executing this milestone.'
						/>
					</div>

					<div className='form-grid--span-full'>
						<RichTextField
							label='Stage Requirements & Description'
							value={typeof stage.description === 'string'
								? stage.description
								: JSON.stringify(stage.description)}
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

			{/* SECTION 2: TASKS & DELIVERABLES */}
			<div className='stage-section'>
				<div className='stage-section__header'>
					<h4 className='stage-section__title'>
						<IconListCheck size={16} /> Tasks & Deliverables
					</h4>
				</div>

				<div className='stage-section__content'>
					{/* File Upload Toggle */}
					<div
						className='toggle-row'
						style={{ paddingBottom: '1rem', borderBottom: '1px dashed var(--border-color)' }}
					>
						<label className='toggle-label'>
							<IconUpload size={18} color='var(--text-muted)' />
							<div>
								<span className='toggle-label__title'>Require File Deliverables</span>
								<span className='toggle-label__desc'>
									The freelancer must upload files before this stage can be submitted for review.
								</span>
							</div>
						</label>
						<div className='toggle-switch'>
							<input
								type='checkbox'
								id={`file-req-${id}`}
								checked={stage.file_upload_required === true}
								onChange={(e) => updateStage('file_upload_required', e.currentTarget.checked)}
							/>
							<label htmlFor={`file-req-${id}`}></label>
						</div>
					</div>

					{/* Task Checklist Builder */}
					<div style={{ paddingTop: '0.5rem' }}>
						<p className='project-legal__subtitle' style={{ marginBottom: '1rem' }}>
							Define specific checklist items the freelancer must complete.
						</p>

						<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
							{(stage.default_tasks || []).map((task, idx) => (
								<div
									key={task.id}
									style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}
								>
									<div style={{ flex: 1 }}>
										<TextField
											label={`Task ${idx + 1}`}
											value={task.description}
											onChange={(v) => updateTask(idx, v)}
											placeholder='e.g. Optimize database queries'
											floating
										/>
									</div>
									<button
										type='button'
										className='btn-remove-stage'
										style={{ marginTop: '0.25rem', padding: '0.5rem' }}
										onClick={() => removeTask(idx)}
										title='Remove Task'
									>
										<IconTrash size={18} />
									</button>
								</div>
							))}
						</div>

						<button
							type='button'
							className='project-legal__btn-add'
							onClick={addTask}
							style={{ marginTop: '1rem' }}
						>
							<IconPlus size={18} /> Add Checklist Item
						</button>
					</div>
				</div>
			</div>

			{/* SECTION 3: ADVANCED SETTINGS */}
			<div className='stage-section'>
				<button
					type='button'
					className='stage-section__header stage-section__header--interactive'
					onClick={() => isAdvancedOpen.value = !isAdvancedOpen.value}
				>
					<h4 className='stage-section__title'>
						<IconSettings size={16} /> Advanced Legal Settings
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
						<div className='form-grid'>
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
					</div>
				)}
			</div>
		</div>
	);
}
// #endregion
