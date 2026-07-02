# Selected Codebase Context

> Included paths: ./apps/web/features/dashboard/projects, ./packages/fields

## Project Tree (Selected)

```text
./apps/web/features/dashboard/projects/
  projects/
  components/
  modals/
  NewProjectModal.tsx
  NewStageModal.tsx
  NewTicketModal.tsx
  TicketModal.tsx
  project/
  board/
  BoardDataView.tsx
  BoardHeader.tsx
  ProjectSidebarDetails.tsx
  ProjectSidebarStageItem.tsx
  stage/
  chat/
  files/
  StageHeader.tsx
  ProjectListItem.tsx
  ProjectSidebarList.tsx
  ProjectsSidebar.tsx
  contexts/
  ProjectContext.tsx
  StageContext.tsx
  contracts/
  new/
  Project.ts
  Stage.ts
  _validation.ts
  Projects.ts
  islands/
  project/
  Board.tsx
  Project.tsx
  stage/
  ChatNetworkSource.ts
  StageChat.island.tsx
  StageFile.island.tsx
  StageFiles.island.tsx
  StageFinance.island.tsx
  StageLayout.island.tsx
  StageMemeber.island.tsx
  StageSubmissions.island.tsx
  StageTasks.island.tsx
  ProjectsHome.tsx
  ProjectsLayout.island.tsx
  services/
  ProjectsService.ts
  ProjectsServiceBackend.ts
  StagesService.ts
  StagesServiceBackend.ts
  TicketsService.ts
  TicketsServiceBackend.ts
  styles/
  components/
  modals/
  project/
  stage/
  layouts/
  pages/
  stage/
./packages/fields/
  fields/
  deno.json
  mod.ts
  src/
  components/
  ComboboxField.tsx
  DateField.tsx
  datetime/
  Calendar.tsx
  TimeClock.tsx
  DateTimeField.tsx
  FileDrop.tsx
  HelpTooltip.tsx
  MoneyField.tsx
  RichTextField.tsx
  SelectField.tsx
  SliderField.tsx
  TagInput.tsx
  TextField.tsx
  TimeField.tsx
  core/
  hooks/
  useCurrencyMask.ts
  useFieldState.ts
  useFileProcessor.ts
  useFocusNext.ts
  useGlobalDrag.ts
  useInteraction.ts
  useSelectState.ts
  useSliderState.ts
  styles/
  components/
  fields/
  overlays/
  wrappers/
  types/
  components/
  combobox-field.ts
  date-field.ts
  datetime-field.ts
  file-drop.ts
  money-field.ts
  rich-text-field.ts
  select-field.ts
  slider-field.ts
  tag-input.ts
  text-field.ts
  time-field.ts
  core.ts
  file.ts
  wrappers.ts
  wrappers/
  AdornmentWrapper.tsx
  EffectWrapper.tsx
  FieldArrayWrapper.tsx
  GlobalFileDrop.tsx
  LabelWrapper.tsx
  MessageWrapper.tsx
  SkeletonWrapper.tsx
```

## File Contents

### File: apps\web\features\dashboard\projects\components\modals\NewProjectModal.tsx

```tsx
/**
 * @file NewProjectModal.tsx
 * @description Modal component for creating a new project with an iterative, draft-first approach.
 */

// #region Imports
// deno-lint-ignore-file no-explicit-any
import { useSignal } from '@preact/signals';
import { useMemo } from 'preact/hooks';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	Button,
	Modal,
	ModalLayout,
	toast,
} from '@projective/ui';
import { FileDrop, RichTextField, SelectField, SelectOption, TextField } from '@projective/fields';
import {
	currencyCategories,
	FileWithMeta,
	IPOptionMode,
	PortfolioDisplayRights,
	ProjectFormat,
	Visibility,
} from '@projective/types';
import { ProjectsService } from '@/features/dashboard/projects/services/ProjectsService.ts';
// #endregion

// #region Interfaces
export interface NewProjectModalProps {
	/** Controls the visibility of the modal. */
	isOpen: boolean;
	/** Callback fired when the modal should be closed. */
	onClose: () => void;
}
// #endregion

export default function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
	// #region State
	const title = useSignal('');
	const description = useSignal('');
	const attachments = useSignal<FileWithMeta[]>([]);
	const format = useSignal<ProjectFormat>(ProjectFormat.Pipeline);
	const visibility = useSignal<Visibility>(Visibility.Public);

	// Advanced options
	const ipMode = useSignal<IPOptionMode>(IPOptionMode.ExclusiveTransfer);
	const ndaRequired = useSignal<string>('false');
	const portfolioRights = useSignal<PortfolioDisplayRights>(PortfolioDisplayRights.Allowed);
	const locationRestriction = useSignal('');
	const languageRequirement = useSignal('');
	const currency = useSignal('USD');

	const isLoading = useSignal(false);
	// #endregion

	// #region Options
	const formatOptions: SelectOption<string>[] = useMemo(() => [
		{ label: 'Pipeline (Multiple ongoing stages/tickets)', value: ProjectFormat.Pipeline },
		{ label: 'One-Off Project (Single clear objective)', value: ProjectFormat.OneOff },
	], []);

	const visibilityOptions: SelectOption<string>[] = useMemo(() => [
		{ label: 'Public - Visible on Marketplace', value: Visibility.Public },
		{ label: 'Invite Only - Hidden from searches', value: Visibility.InviteOnly },
		{ label: 'Unlisted - Anyone with link can view', value: Visibility.Unlisted },
	], []);

	const ipOptions: SelectOption<string>[] = useMemo(() => [
		{ label: 'Exclusive Transfer', value: IPOptionMode.ExclusiveTransfer },
		{ label: 'Licensed Use', value: IPOptionMode.LicensedUse },
		{ label: 'Shared Ownership', value: IPOptionMode.SharedOwnership },
		{ label: 'Projective Partner', value: IPOptionMode.ProjectivePartner },
	], []);

	const portfolioOptions: SelectOption<string>[] = useMemo(() => [
		{ label: 'Allowed', value: PortfolioDisplayRights.Allowed },
		{ label: 'Forbidden', value: PortfolioDisplayRights.Forbidden },
		{ label: 'Embargoed', value: PortfolioDisplayRights.Embargoed },
	], []);

	const booleanOptions: SelectOption<string>[] = useMemo(() => [
		{ label: 'Yes, require NDA', value: 'true' },
		{ label: 'No NDA required', value: 'false' },
	], []);

	const currencyOptions: SelectOption<string>[] = useMemo(() => {
		const options: SelectOption<string>[] = [];
		for (const [_, currencies] of Object.entries(currencyCategories)) {
			for (const curr of currencies) {
				options.push({
					label: `${curr.code} (${curr.symbol}) - ${curr.name}`,
					value: curr.code,
				});
			}
		}
		return options;
	}, []);
	// #endregion

	// #region Handlers
	const handleSubmit = async () => {
		if (title.value.trim().length < 5) {
			toast.error('Title must be at least 5 characters.');
			return;
		}

		isLoading.value = true;

		try {
			const payload = {
				title: title.value,
				format: format.value,
				description: description.value,
				visibility: visibility.value,
				currency: currency.value,
				legal_and_screening: {
					ip_ownership_mode: ipMode.value,
					nda_required: ndaRequired.value === 'true',
					portfolio_display_rights: portfolioRights.value,
					location_restriction: locationRestriction.value ? [locationRestriction.value] : [],
					language_requirement: languageRequirement.value ? [languageRequirement.value] : [],
					screening_questions: [],
				},
			};

			const files = attachments.value.length > 0
				? { attachments: attachments.value.map((a) => a.file).filter(Boolean) as File[] }
				: undefined;

			const res = await ProjectsService.createProject(payload, files);

			toast.success('Project draft created successfully!');
			setTimeout(() => {
				onClose();
				globalThis.location.href = `/projects/${res.project_id}`;
			}, 1000);
		} catch (err: any) {
			toast.error(err.message || 'An unexpected error occurred while creating the project.');
		} finally {
			isLoading.value = false;
		}
	};
	// #endregion

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title='Create New Project'
			style={{ width: '600px', maxWidth: '100%' }}
		>
			<ModalLayout
				footer={
					<div
						style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}
					>
						<Button variant='secondary' onClick={onClose} disabled={isLoading.value}>Cancel</Button>
						<Button variant='primary' onClick={handleSubmit} loading={isLoading.value}>
							Create Project
						</Button>
					</div>
				}
			>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
					<TextField
						label='Project Title'
						value={title}
						onChange={(v) => title.value = v}
						placeholder='Enter project title'
						required
						floating
					/>

					<RichTextField
						label='Description'
						value={description}
						onChange={(v) => description.value = v as string}
						minHeight='120px'
						variant='framed'
						outputFormat='delta'
						placeholder='Describe your project...'
					/>

					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
						<SelectField
							name='format'
							label='Format'
							options={formatOptions}
							value={format.value}
							onChange={(v) => format.value = v as ProjectFormat}
							multiple={false}
							searchable={false}
							floating
						/>
						<SelectField
							name='visibility'
							label='Visibility'
							options={visibilityOptions}
							value={visibility.value}
							onChange={(v) => visibility.value = v as Visibility}
							multiple={false}
							searchable={false}
							floating
						/>
					</div>

					<FileDrop
						id='project-attachments'
						label='Attachments'
						value={attachments}
						onChange={(files) => attachments.value = files}
						variant='split'
						multiple
						maxFiles={10}
					/>

					<Accordion type='single' collapsible>
						<AccordionItem value='advanced'>
							<AccordionTrigger>Advanced Options</AccordionTrigger>
							<AccordionContent>
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										gap: '1rem',
										paddingTop: '1rem',
									}}
								>
									<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
										<SelectField
											name='ipMode'
											label='IP & Privacy'
											options={ipOptions}
											value={ipMode.value}
											onChange={(v) => ipMode.value = v as IPOptionMode}
											multiple={false}
											searchable={false}
											floating
										/>
										<SelectField
											name='ndaRequired'
											label='NDA Required'
											options={booleanOptions}
											value={ndaRequired.value}
											onChange={(v) => ndaRequired.value = v as string}
											multiple={false}
											searchable={false}
											floating
										/>
									</div>
									<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
										<SelectField
											name='portfolioRights'
											label='Portfolio Rights'
											options={portfolioOptions}
											value={portfolioRights.value}
											onChange={(v) => portfolioRights.value = v as PortfolioDisplayRights}
											multiple={false}
											searchable={false}
											floating
										/>
										<SelectField
											name='currency'
											label='Currency'
											options={currencyOptions}
											value={currency.value}
											onChange={(v) => currency.value = v as string}
											multiple={false}
											searchable
											floating
										/>
									</div>
									<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
										<TextField
											label='Location Restriction'
											value={locationRestriction}
											onChange={(v) => locationRestriction.value = v}
											placeholder='e.g. US Only'
											floating
										/>
										<TextField
											label='Language Requirement'
											value={languageRequirement}
											onChange={(v) => languageRequirement.value = v}
											placeholder='e.g. English'
											floating
										/>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			</ModalLayout>
		</Modal>
	);
}
```

### File: apps\web\features\dashboard\projects\components\modals\NewStageModal.tsx

```tsx
/**
 * @file NewStageModal.tsx
 * @description Modal component for creating a new stage within an existing project.
 */

// #region Imports
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	Button,
	Modal,
	ModalLayout,
	toast,
} from '@projective/ui';
import { DateField, RichTextField, SelectField, TagInput, TextField } from '@projective/fields';
import { DateTime, IPOptionMode } from '@projective/types';
import { useProjectContext } from '../../contexts/ProjectContext.tsx';
import { StagesService } from '../../services/StagesService.ts';
// #endregion

export interface NewStageModalProps {
	isOpen: boolean;
	onClose: () => void;
	projectId: string;
	projectFormat?: 'one_off' | 'pipeline' | string;
}

export default function NewStageModal(
	{ isOpen, onClose, projectId, projectFormat }: NewStageModalProps,
) {
	const { refresh } = useProjectContext();

	// #region State
	const name = useSignal('');
	// deno-lint-ignore no-explicit-any
	const description = useSignal<any>(null);
	const skills = useSignal<string[]>([]);
	const defaultTasks = useSignal<string[]>([]);
	const fileUploadRequired = useSignal('false');

	const startDate = useSignal<DateTime | undefined>(undefined);
	const endDate = useSignal<DateTime | undefined>(undefined);

	const ipModeOverride = useSignal<string>('none');
	const ndaRequired = useSignal('false');
	const isSubmitting = useSignal(false);
	// #endregion

	useEffect(() => {
		if (isOpen) {
			name.value = '';
			description.value = null;
			skills.value = [];
			defaultTasks.value = [];
			fileUploadRequired.value = 'false';
			startDate.value = undefined;
			endDate.value = undefined;
			ipModeOverride.value = 'none';
			ndaRequired.value = 'false';
		}
	}, [isOpen]);

	const handleSubmit = async () => {
		if (!projectId) {
			toast.error('Unable to locate Project ID.');
			return;
		}

		if (!name.value.trim()) {
			toast.error('Stage Name is required.');
			return;
		}

		isSubmitting.value = true;

		try {
			const payload = {
				name: name.value,
				description: description.value,
				skills: skills.value,
				default_tasks: defaultTasks.value,
				file_upload_required: fileUploadRequired.value === 'true',
				// FIX: Cast DateTime bounds to ISO Strings for Zod
				// deno-lint-ignore no-explicit-any
				start_date: startDate.value ? new Date(startDate.value as any).toISOString() : null,
				// deno-lint-ignore no-explicit-any
				end_date: endDate.value ? new Date(endDate.value as any).toISOString() : null,
				ip_ownership_override: ipModeOverride.value !== 'none' ? ipModeOverride.value : null,
				nda_required: ndaRequired.value === 'true',
			};

			await StagesService.createStage(projectId, payload);

			toast.success('Stage created successfully!');
			refresh();
			onClose();
		} catch (err: unknown) {
			console.error(err);
			toast.error(err instanceof Error ? err.message : 'Failed to create stage.');
		} finally {
			isSubmitting.value = false;
		}
	};

	const booleanOptions = [
		{ value: 'true', label: 'Yes' },
		{ value: 'false', label: 'No' },
	];

	const ipOptions = [
		{ value: 'none', label: 'Inherit from Project' },
		{ value: IPOptionMode.ExclusiveTransfer, label: 'Exclusive Transfer' },
		{ value: IPOptionMode.LicensedUse, label: 'Licensed Use' },
	];

	return (
		<Modal isOpen={isOpen} onClose={onClose} title='Create New Stage'>
			<ModalLayout
				footer={
					<div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', width: '100%' }}>
						<Button variant='secondary' onClick={onClose} disabled={isSubmitting.value}>
							Cancel
						</Button>
						<Button variant='primary' onClick={handleSubmit} loading={isSubmitting.value}>
							Create Stage
						</Button>
					</div>
				}
			>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
					<TextField
						label='Stage Name'
						value={name}
						onChange={(v) => name.value = v}
						placeholder='e.g., Discovery, UI Design, QA Testing'
						floating
					/>

					<RichTextField
						label='Stage Description & Requirements'
						value={description.value}
						onChange={(v) => description.value = v}
						placeholder='Detail the objectives for this stage...'
					/>

					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
						<TagInput
							label='Required Skills'
							value={skills.value}
							onChange={(v) => skills.value = v}
							placeholder='e.g., React, Figma'
						/>
						<SelectField
							name='fileUploadRequired'
							label='Require Deliverable Upload?'
							options={booleanOptions}
							value={fileUploadRequired.value}
							onChange={(v) => fileUploadRequired.value = v as string}
							multiple={false}
							searchable={false}
							floating
						/>
					</div>

					<TagInput
						label='Default Tasks (Press Enter to add)'
						value={defaultTasks.value}
						onChange={(v) => defaultTasks.value = v}
						placeholder='e.g., Setup environment, Review docs'
					/>

					{projectFormat === 'one_off' && (
						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
							<DateField
								label='Start Date'
								value={startDate.value}
								onChange={(v) =>
									startDate.value = v}
							/>
							<DateField
								label='Target End Date'
								value={endDate.value}
								onChange={(v) => endDate.value = v}
							/>
						</div>
					)}

					<Accordion type='single' collapsible>
						<AccordionItem value='advanced'>
							<AccordionTrigger>Advanced Settings</AccordionTrigger>
							<AccordionContent>
								<div
									style={{
										display: 'grid',
										gridTemplateColumns: '1fr 1fr',
										gap: '1rem',
										paddingTop: '0.5rem',
									}}
								>
									<SelectField
										name='ipOverride'
										label='IP Mode Override'
										options={ipOptions}
										value={ipModeOverride.value}
										onChange={(v) => ipModeOverride.value = v as string}
										multiple={false}
										searchable={false}
										floating
									/>
									<SelectField
										name='ndaRequired'
										label='Separate NDA Required?'
										options={booleanOptions}
										value={ndaRequired.value}
										onChange={(v) => ndaRequired.value = v as string}
										multiple={false}
										searchable={false}
										floating
									/>
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			</ModalLayout>
		</Modal>
	);
}
```

### File: apps\web\features\dashboard\projects\components\modals\NewTicketModal.tsx

```tsx
import '../../styles/components/modals/new-ticket-modal.css';
import { useSignal } from '@preact/signals';
import { Button, Modal, ModalLayout, ToggleButton, ToggleButtonGroup } from '@projective/ui';
import { DateField, TextField } from '@projective/fields';
import { DateTime, TicketStatus } from '@projective/types';
import { IconGripVertical } from '@tabler/icons-preact';
import { useEffect } from 'preact/hooks';

interface NewTicketModalProps {
	isOpen: boolean;
	onClose: () => void;
	availableStages: { label: string; value: string }[];
	preselectedStageId?: string | null;
	// deno-lint-ignore no-explicit-any
	onSubmit: (payload: any) => void;
}

interface DraggableStage {
	id: string;
	label: string;
	selected: boolean;
}

export function NewTicketModal(
	{ isOpen, onClose, availableStages, preselectedStageId, onSubmit }: NewTicketModalProps,
) {
	const title = useSignal('');
	const description = useSignal('');
	const intensityTier = useSignal<'Low' | 'Standard' | 'High'>('Standard');
	const dueDate = useSignal<DateTime | null>(null);

	const stagesList = useSignal<DraggableStage[]>([]);
	const draggedIndex = useSignal<number | null>(null);

	useEffect(() => {
		if (isOpen) {
			stagesList.value = availableStages.map((stage) => ({
				id: stage.value,
				label: stage.label,
				selected: true,
			}));

			title.value = '';
			description.value = '';
			intensityTier.value = 'Standard';
			dueDate.value = null;
		}
	}, [isOpen, availableStages]);

	const handleSubmit = () => {
		const required_stages = stagesList.value
			.filter((s) => s.selected)
			.map((s, index) => ({
				stage_id: s.id,
				order: index,
			}));

		// FIX: The Kanban board maps the backlog to the ID "new". Zod fails this because it expects a UUID.
		// Here we catch it and force it back to null for the DB.
		const resolvedStageId = (!preselectedStageId || preselectedStageId === 'new')
			? null
			: preselectedStageId;

		onSubmit({
			title: title.value,
			text_description: description.value,
			description: {},
			required_stages,
			workload_intensity: intensityTier.value === 'Low'
				? 0.5
				: intensityTier.value === 'High'
				? 2.0
				: 1.0,
			// deno-lint-ignore no-explicit-any
			due_date: dueDate.value ? new Date(dueDate.value as any).toISOString() : null,
			current_stage_id: resolvedStageId,
			status: TicketStatus.Backlog,
		});
	};

	// #region Local Drag & Drop Handlers
	const handleDragStart = (e: DragEvent, index: number) => {
		draggedIndex.value = index;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', index.toString());
		}
	};

	const handleDragOver = (e: DragEvent, index: number) => {
		e.preventDefault();
		if (draggedIndex.value === null || draggedIndex.value === index) return;

		const list = [...stagesList.value];
		const draggedItem = list[draggedIndex.value];

		list.splice(draggedIndex.value, 1);
		list.splice(index, 0, draggedItem);

		draggedIndex.value = index;
		stagesList.value = list;
	};

	const handleDrop = () => draggedIndex.value = null;

	const toggleStageSelection = (index: number) => {
		const list = [...stagesList.value];
		list[index].selected = !list[index].selected;
		stagesList.value = list;
	};
	// #endregion

	return (
		<Modal isOpen={isOpen} onClose={onClose} title='Create New Ticket'>
			<ModalLayout
				footer={
					<>
						<Button variant='secondary' ghost onClick={onClose}>Cancel</Button>
						<Button variant='primary' onClick={handleSubmit} disabled={!title.value.trim()}>
							Create Ticket
						</Button>
					</>
				}
			>
				<div class='new-ticket-form'>
					<TextField
						label='Ticket Title'
						value={title.value}
						onChange={(v) => title.value = v}
						required
						placeholder='e.g., Design Homepage Hero Section'
					/>

					<TextField
						label='Description'
						value={description.value}
						onChange={(v) => description.value = v}
						multiline
						placeholder='Add any details, links, or requirements here...'
						style={{ minHeight: '120px' }}
					/>

					<div class='new-ticket-form__section'>
						<span class='new-ticket-form__section-label'>Required Stages (Drag to reorder)</span>
						<div class='new-ticket-stage-list'>
							{stagesList.value.map((stage, index) => (
								<div
									key={stage.id}
									class={`new-ticket-stage-item ${draggedIndex.value === index ? 'dragging' : ''} ${
										!stage.selected ? 'disabled' : ''
									}`}
									draggable={true}
									onDragStart={(e) => handleDragStart(e, index)}
									onDragOver={(e) => handleDragOver(e, index)}
									onDragEnd={handleDrop}
									onDrop={handleDrop}
								>
									<div class='new-ticket-stage-item__drag-handle'>
										<IconGripVertical size={16} />
									</div>
									<input
										type='checkbox'
										checked={stage.selected}
										onChange={() => toggleStageSelection(index)}
										class='new-ticket-stage-item__checkbox'
									/>
									<span class='new-ticket-stage-item__label'>{stage.label}</span>
								</div>
							))}
						</div>
					</div>

					<div class='new-ticket-form__section'>
						<span class='new-ticket-form__section-label'>Intensity Tier (Wi Multiplier)</span>
						<ToggleButtonGroup
							value={intensityTier.value}
							// deno-lint-ignore no-explicit-any
							onChange={(v) => intensityTier.value = v as any}
							optional={false}
							fullWidth
						>
							<ToggleButton value='Low'>Low (0.5x)</ToggleButton>
							<ToggleButton value='Standard'>Standard (1.0x)</ToggleButton>
							<ToggleButton value='High'>High (2.0x)</ToggleButton>
						</ToggleButtonGroup>
					</div>

					<div class='new-ticket-form__section'>
						<span class='new-ticket-form__section-label'>Deadline (Optional)</span>
						<DateField label='Due Date' value={dueDate.value} onChange={(v) => dueDate.value = v} />
					</div>
				</div>
			</ModalLayout>
		</Modal>
	);
}
```

### File: apps\web\features\dashboard\projects\components\modals\TicketModal.tsx

```tsx
import '../../styles/components/new/ticket-modal.css';

export function TicketModal() {
	return (
		<div class='ticket-modal'>
			<div class='ticket-modal__header'>
				<div class='ticket-modal__header-status'>
				</div>
				<div class='ticket-modal__header-title'>
				</div>
				<div class='ticket-modal__header-meta'>
					Created, Created By, (if multiple project owners i.e., a business), Updated, Updated By,
					Due (if any), Total Cost, Workload Intensity
				</div>
			</div>

			<div class='ticket-modal__body'>
				<div class='ticket-modal__body-view-mode'>
					Details Attachments Financial Breakdown (Client only) - Shows full breakdown of costs,
					including internal costs, profit margins, and any other financial details relevant to the
					ticket.
				</div>

				<div class='ticket-modal__content'>
					<div class='ticket-modal__content-description'>
					</div>
					<div class='ticket-modal__content-stages'>
						Stage breakdown showing all stages, their current status, and any relevant details or
						notes for each stage. This section provides a clear overview / timeline of the ticket's
						progress through its lifecycle. Details include: Stage name, status, assigned team
						members, start and end dates, and cost.
					</div>
				</div>
			</div>
		</div>
	);
}
```

### File: apps\web\features\dashboard\projects\components\project\board\BoardDataView.tsx

```tsx
/**
 * @file BoardDataView.tsx
 * @description Shared renderer for mapping tickets and stages to either a Kanban or Table view.
 */

// #region Imports
import { useEffect, useMemo } from 'preact/hooks';
import { Kanban, KanbanFieldProps } from '@projective/charts';
import { ColumnDef, DataDisplay } from '@projective/data';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import { TicketStatus } from 'packages/types/src/entities/projects/enums.ts';
// #endregion

// #region Interfaces
export interface BoardTicket {
	id: string;
	title: string;
	stageId: string;
	stageName: string;
	status: TicketStatus;
	assigneeId: string | null;
	assigneeName: string | null;
	workloadIntensity: number;
	revisionsRequested: number;
	attachmentsScanned: boolean;
	createdAt: string;
}

interface BoardDataViewProps {
	tickets: BoardTicket[];
	stages: { label: string; value: string }[];
	viewType: 'stages' | 'status';
	displayMode: 'kanban' | 'list';
	isOwnerOrAdmin: boolean;
	onCardClick: (ticketId: string) => void;
	onCardMove: (
		cardId: string,
		sourceFieldId: string,
		targetFieldId: string,
		insertBeforeCardId: string | null,
	) => void;
	onFieldMove: (sourceId: string, targetId: string, insertBefore: boolean) => void;
	onAddStage: () => void;
	onAddTicket?: (stageId: string | null) => void;
}
// #endregion

const tableColumns: ColumnDef<BoardTicket>[] = [
	{ id: 'title', field: 'title', label: 'Ticket Title', sortable: true, width: 250 },
	{ id: 'stage', field: 'stageName', label: 'Stage', sortable: true, width: 150 },
	{ id: 'status', field: 'status', label: 'Status', sortable: true, width: 120 },
	{
		id: 'assignee',
		field: (t) => t.assigneeName || 'Unassigned',
		label: 'Assignee',
		sortable: true,
		width: 150,
	},
	{
		id: 'wi',
		field: (t) => t.workloadIntensity,
		label: 'Intensity (Wi)',
		sortable: true,
		width: 100,
		align: 'right',
	},
	{
		id: 'revisions',
		field: 'revisionsRequested',
		label: 'Revisions',
		sortable: true,
		width: 100,
		align: 'right',
	},
	{
		id: 'secured',
		field: (t) => t.attachmentsScanned ? 'Yes' : '-',
		label: 'Secured',
		width: 80,
		align: 'center',
	},
];

export function BoardDataView({
	tickets,
	stages,
	viewType,
	displayMode,
	isOwnerOrAdmin,
	onCardClick,
	onCardMove,
	onFieldMove,
	onAddStage,
	onAddTicket,
}: BoardDataViewProps) {
	const { setCustomScrollEnabled } = useNavigationContext();

	const mapTicketToCard = (t: BoardTicket, orderIndex: number): any => {
		const tags = [];
		if (t.attachmentsScanned) {
			tags.push({ id: `sec-${t.id}`, label: 'Secured', variant: 'solid', color: 'var(--success)' });
		}
		if (t.revisionsRequested > 0) {
			tags.push({ id: `rev-${t.id}`, label: 'Revision', variant: 'text', color: 'var(--warning)' });
		}
		tags.push({
			id: `wi-${t.id}`,
			label: `Wi: ${t.workloadIntensity}`,
			variant: 'solid',
		});

		const dateString = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(
			new Date(t.createdAt),
		);

		return {
			id: t.id,
			title: t.title,
			description:
				`This ticket requires a workload intensity of ${t.workloadIntensity} and has ${t.revisionsRequested} revisions requested.`,
			meta: `Created: ${dateString}`,
			takenBy: t.assigneeName ? { name: t.assigneeName } : undefined,
			order: orderIndex,
			permissions: { canReorder: isOwnerOrAdmin },
			tags,
		};
	};

	const kanbanFields = useMemo<KanbanFieldProps[]>(() => {
		const fieldsMap = new Map<string, KanbanFieldProps>();

		if (viewType === 'stages') {
			fieldsMap.set('New', {
				id: 'New',
				title: 'New',
				color: 'primary',
				order: 0,
				cards: [],
				permissions: { canReorder: false, canAddCard: isOwnerOrAdmin },
				addCardLabel: 'New Ticket',
			});

			let orderCounter = 1;
			stages.forEach((s) => {
				fieldsMap.set(s.value, {
					id: s.value,
					title: s.label,
					color: 'secondary',
					order: orderCounter++,
					cards: [],
					permissions: { canReorder: isOwnerOrAdmin },
				});
			});

			fieldsMap.set('Done', {
				id: 'Done',
				title: 'Done',
				color: 'var(--success)',
				order: 999,
				cards: [],
				permissions: { canReorder: false, canAddCard: false },
			});

			tickets.forEach((t) => {
				const targetField = t.status === TicketStatus.Completed
					? 'Done'
					: (t.status === TicketStatus.Backlog ? 'New' : t.stageId);
				const field = fieldsMap.get(targetField);

				if (field) field.cards.push(mapTicketToCard(t, field.cards.length));
			});
		} else {
			const statuses = [
				{
					id: TicketStatus.Backlog,
					title: 'Backlog',
					color: 'primary',
					fields: { canAddCard: isOwnerOrAdmin },
				},
				{ id: TicketStatus.Todo, title: 'Todo', color: 'secondary', fields: { canAddCard: false } },
				{
					id: TicketStatus.InProgress,
					title: 'In Progress',
					color: 'secondary',
					fields: { canAddCard: false },
				},
				{
					id: TicketStatus.InReview,
					title: 'In Review',
					color: 'secondary',
					fields: { canAddCard: false },
				},
				{
					id: TicketStatus.Completed,
					title: 'Completed',
					color: 'var(--success)',
					fields: { canAddCard: false },
				},
				{
					id: TicketStatus.Cancelled,
					title: 'Cancelled',
					color: 'var(--danger)',
					fields: { canAddCard: false },
				},
			];

			statuses.forEach((status, idx) => {
				fieldsMap.set(status.id, {
					id: status.id,
					title: status.title,
					color: status.color,
					order: idx,
					cards: [],
					permissions: { canReorder: false, canAddCard: status.fields.canAddCard },
					addCardLabel: status.id === TicketStatus.Backlog ? 'New Ticket' : 'Add Ticket',
				});
			});

			tickets.forEach((t) => {
				const field = fieldsMap.get(t.status);
				if (field) field.cards.push(mapTicketToCard(t, field.cards.length));
			});
		}

		return Array.from(fieldsMap.values()).sort((a, b) => a.order - b.order);
	}, [tickets, stages, viewType, isOwnerOrAdmin]);

	useEffect(() => {
		if (displayMode === 'kanban') {
			setCustomScrollEnabled(true);
		} else {
			setCustomScrollEnabled(false);
		}
		return () => setCustomScrollEnabled(false);
	}, [displayMode, setCustomScrollEnabled]);

	const handleAddCardInternal = (fieldId: string) => {
		if (onAddTicket) {
			const sanitizedId = fieldId === 'New' || fieldId === TicketStatus.Backlog ? null : fieldId;
			onAddTicket(sanitizedId);
		}
	};

	if (displayMode === 'kanban') {
		return (
			<div class='project-board__kanban-wrapper'>
				<Kanban
					fields={kanbanFields}
					onCardClick={(card) => onCardClick(card.id)}
					onCardMove={onCardMove}
					onFieldMove={onFieldMove}
					onAddCard={handleAddCardInternal}
					onAddField={viewType === 'stages' && isOwnerOrAdmin ? onAddStage : undefined}
					permissions={{ canAddField: viewType === 'stages' && isOwnerOrAdmin }}
				/>
			</div>
		);
	}

	return (
		<div style={{ height: '100%', width: '100%' }}>
			<DataDisplay
				mode='table'
				columns={tableColumns}
				dataSource={tickets}
				renderItem={() => <></>}
				onSelectionChange={() => {}}
				interactive
			/>
		</div>
	);
}
```

### File: apps\web\features\dashboard\projects\components\project\board\BoardHeader.tsx

```tsx
/**
 * @file BoardHeader.tsx
 * @description The top-level statistics, metadata, and toolbar display for the Project Board.
 */

import { useSignal } from '@preact/signals';
import { DateTime } from '@projective/types';
import { Button } from '@projective/ui';
import {
	IconFilter,
	IconSearch,
	IconSortAscending,
	IconSortDescending,
} from '@tabler/icons-preact';

// #region Interfaces
export interface FiduciaryMetrics {
	totalBudgetCents: number;
	tvlEscrowCents: number;
	releasedBalanceCents: number;
}

export interface CapacityMetrics {
	backlogQueueSize: number;
	cumulativeWi: number;
	accuracyPercentage: number;
}

interface BoardHeaderProps {
	projectTitle: string;
	projectFormat: string;
	fiduciary?: FiduciaryMetrics;
	capacity?: CapacityMetrics;
}
// #endregion

const formatCurrency = (cents: number) => {
	return (cents / 100).toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD',
	});
};

export function BoardHeader(
	{ projectTitle, projectFormat, fiduciary, capacity }: BoardHeaderProps,
) {
	const isFilterOpen = useSignal(false);
	const sortDesc = useSignal(true); // Toggle for Descending vs Ascending

	// Fallback to 0 if metrics aren't fully resolved yet
	const spent = fiduciary?.releasedBalanceCents ?? 0;
	const activeTickets = capacity?.backlogQueueSize ?? 0;

	return (
		<header class='project-board__header'>
			{/* 1. TOP ROW: Title & Metrics */}
			<div class='project-board__header-top'>
				<div class='project-board__panel'>
					<h1 class='project-board__title'>{projectTitle}</h1>
					<span class='project-board__subtitle'>
						{projectFormat.replace('_', ' ').toUpperCase()}
					</span>
				</div>

				<div class='project-board__details'>
					<div class='project-board__details-section'>
						<span class='project-board__details-label'>Tickets</span>
						<div class='project-board__details-section__content'>
							<BoardMetric name='New' rawValue={3} />
							<BoardMetric name='Active' rawValue={activeTickets} />
							<BoardMetric name='Total' rawValue={activeTickets + 3} />
						</div>
					</div>
					<div class='project-board__details-section'>
						<span class='project-board__details-label'>Budget</span>
						<div class='project-board__details-section__content'>
							<BoardMetric name='Avg.' rawValue={0} type='currency' />
							<BoardMetric name='Spent' rawValue={spent} type='currency' />
						</div>
					</div>
				</div>
			</div>

			{/* 2. MIDDLE ROW: Toolbar */}
			<div class='project-board__toolbar'>
				<div class='project-board__search'>
					<IconSearch size={18} class='project-board__search-icon' />
					<input
						type='text'
						class='project-board__search-input'
						placeholder='Search tickets by title or ID...'
					/>
				</div>

				<div class='project-board__toolbar-actions'>
					<Button
						variant='secondary'
						onClick={() => sortDesc.value = !sortDesc.value}
					>
						{sortDesc.value ? <IconSortDescending size={18} /> : <IconSortAscending size={18} />}
						Sort
					</Button>
					<Button
						variant={isFilterOpen.value ? 'primary' : 'secondary'}
						onClick={() => isFilterOpen.value = !isFilterOpen.value}
					>
						<IconFilter size={18} />
						Filter
					</Button>
				</div>
			</div>

			{/* 3. BOTTOM ROW: Collapsible Filters */}
			{isFilterOpen.value && (
				<div class='project-board__filters'>
					<div class='project-board__filter-group'>
						<label>Status</label>
						<select class='project-board__select'>
							<option value='all'>All Statuses</option>
							<option value='backlog'>Backlog</option>
							<option value='todo'>Todo</option>
							<option value='in_progress'>In Progress</option>
							<option value='in_review'>In Review</option>
							<option value='completed'>Completed</option>
						</select>
					</div>

					<div class='project-board__filter-group'>
						<label>Assignee</label>
						<select class='project-board__select'>
							<option value='all'>Anyone</option>
							<option value='me'>Assigned to me</option>
							<option value='unassigned'>Unassigned</option>
						</select>
					</div>

					<div class='project-board__filter-group'>
						<label>Start Date</label>
						<input type='date' class='project-board__input' />
					</div>

					<div class='project-board__filter-group'>
						<label>Last Updated</label>
						<select class='project-board__select'>
							<option value='any'>Any time</option>
							<option value='today'>Today</option>
							<option value='week'>Last 7 days</option>
							<option value='month'>Last 30 days</option>
						</select>
					</div>
				</div>
			)}
		</header>
	);
}

export function BoardMetric(
	{ name, rawValue, type }: { name: string; rawValue: string | number | DateTime; type?: string },
) {
	let value: string = rawValue as string;

	switch (type) {
		case 'currency':
			value = formatCurrency(rawValue as number);
			break;
	}

	return (
		<div class='project-board__metric'>
			<span class='project-board__metric-value'>{value}</span>
			<span class='project-board__metric-name'>{name}</span>
		</div>
	);
}
```

### File: apps\web\features\dashboard\projects\components\project\ProjectSidebarDetails.tsx

```tsx
import '../../styles/components/project/project-sidebar-details.css';
import { useProjectContext } from '@features/dashboard/projects/contexts/ProjectContext.tsx';
import { useSignal } from '@preact/signals';
import { ComponentChildren } from 'preact';
import {
	IconArrowLeft,
	IconBriefcase,
	IconCalendar,
	IconChevronDown,
	IconDots,
	IconDotsVertical,
	IconFile,
	IconHash,
	IconPlus,
	IconSettings,
	IconUser,
	IconUsers,
} from '@tabler/icons-preact';
import { IconButton } from '@projective/ui';
import NewStageModal from '../../components/new/NewStageModal.tsx';
import { Head } from 'fresh/runtime';

export default function ProjectSidebarDetails() {
	const { project, isLoading, error } = useProjectContext();

	// Collapse state signals
	const isStagesOpen = useSignal(true);
	const isTeamsOpen = useSignal(true);
	const isDmsOpen = useSignal(true);
	const isNewStageModalOpen = useSignal(false);

	if (isLoading.value && !project.value) {
		return <div class='sidebar-details--loading'>Loading Project...</div>;
	}

	if (error.value) {
		return <div class='sidebar-details--error'>Error: {error.value}</div>;
	}

	if (!project.value) return null;

	const data = project.value;

	// Permission evaluation - expand this based on your specific ProjectPermission enum
	const canEdit = data.viewer_context.role === 'owner' ||
		data.viewer_context.role === 'collaborator';

	return (
		<div class='sidebar-details'>
			<Head>
				<title>{project.value?.title}</title>
			</Head>
			<div class='sidebar-details__header'>
				<div class='sidebar-details__header__actions'>
					<IconButton
						aria-label='Back to List'
						variant='secondary'
						size='small'
					>
						<IconArrowLeft size={16} />
					</IconButton>
					<IconButton
						size='small'
						aria-label='Menu'
						variant='secondary'
					>
						<IconDotsVertical size={16} />
					</IconButton>
				</div>
				<div class='sidebar-details__header__details'>
					<div class='sidebar-details__header__details__avatar'>
						<img
							src={data.owner.avatar_url ??
								'https://cdn.prod.website-files.com/62d84e447b4f9e7263d31e94/6399a4d27711a5ad2c9bf5cd_ben-sweet-2LowviVHZ-E-unsplash-1.jpeg'}
							alt={data.owner.name}
						/>
					</div>
					<div class='sidebar-details__header__details__info'>
						<h3 class='sidebar-details__header__details__title'>{data.title}</h3>
						<a class='sidebar-details__header__details__owner' href={`/${data.owner.username}`}>
							{data.owner.name}
						</a>
					</div>
				</div>
			</div>

			<div class='sidebar-details__content'>
				<div class='sidebar-details__channels'>
					{/* 1. General Channel */}
					<div class='sidebar-details__channels__group'>
						<ul class='sidebar-details__channels__list'>
							<ProjectSidebarDetailsChannelsListItem
								title='General'
								icon={<IconHash size={16} />}
								url={`/projects/${data.project_id}/general`}
								isActive={false} // Hook up to your current route logic
							/>
						</ul>
					</div>

					{/* 2. Stages */}
					<div class='sidebar-details__channels__group'>
						<ProjectSidebarDetailsChannelsHeader
							title='Stages'
							isOpen={isStagesOpen.value}
							onToggle={() => isStagesOpen.value = !isStagesOpen.value}
							onAdd={() => {
								isNewStageModalOpen.value = true;
							}}
						/>
						{isStagesOpen.value && (
							<ul class='sidebar-details__channels__list'>
								{data.stages.length === 0
									? <div class='sidebar-details__channels__empty'>No stages created yet.</div>
									: (
										data.stages.map((stage) => (
											<ProjectSidebarDetailsChannelsListItem
												key={stage.id}
												title={stage.name}
												icon={<IconHash size={16} />}
												url={`/projects/${data.project_id}/${stage.id}/chat`}
												onOptions={canEdit
													? () => console.log(`Open options for stage: ${stage.id}`)
													: undefined}
											/>
										))
									)}
							</ul>
						)}
					</div>

					{/* 3. Teams */}
					<div class='sidebar-details__channels__group'>
						<ProjectSidebarDetailsChannelsHeader
							title='Teams'
							isOpen={isTeamsOpen.value}
							onToggle={() => isTeamsOpen.value = !isTeamsOpen.value}
						/>
						{isTeamsOpen.value && (
							<ul class='sidebar-details__channels__list'>
								{/* Placeholder data - map over actual team memberships when ready */}
								<ProjectSidebarDetailsChannelsListItem
									title='Frontend Guild'
									icon={<IconUsers size={16} />}
									url={`/projects/${data.project_id}/team-1`}
								/>
							</ul>
						)}
					</div>

					{/* 4. Direct Messages */}
					<div class='sidebar-details__channels__group'>
						<ProjectSidebarDetailsChannelsHeader
							title='Direct Messages'
							isOpen={isDmsOpen.value}
							onToggle={() => isDmsOpen.value = !isDmsOpen.value}
						/>
						{isDmsOpen.value && (
							<ul class='sidebar-details__channels__list'>
								{/* Placeholder data - map over actual DMs when ready */}
								<ProjectSidebarDetailsChannelsListItem
									title='Alice Johnson'
									icon={
										<div class='sidebar-details__channels__dm-avatar'>
											<IconUser size={12} />
										</div>
									}
									url={`/projects/${data.project_id}/dm-1`}
								/>
								<ProjectSidebarDetailsChannelsListItem
									title='Bob Smith'
									icon={
										<div class='sidebar-details__channels__dm-avatar'>
											<IconUser size={12} />
										</div>
									}
									url={`/projects/${data.project_id}/dm-2`}
								/>
							</ul>
						)}
					</div>
				</div>

				<div class='sidebar-details__actions'>
					<div>
						<IconButton
							href={`/projects/${data.project_id}`}
							aria-label='Project Details'
							variant='secondary'
						>
							<IconBriefcase size={20} />
						</IconButton>
						<IconButton
							href={`/projects/${data.project_id}/board`}
							aria-label='Stage Management'
							variant='secondary'
						>
							<IconCalendar size={20} />
						</IconButton>
						<IconButton
							href={`/projects/${data.project_id}/members`}
							aria-label='Members'
							variant='secondary'
						>
							<IconUsers size={20} />
						</IconButton>
						<IconButton
							href={`/projects/${data.project_id}/attachments`}
							aria-label='Attachments'
							variant='secondary'
						>
							<IconFile size={20} />
						</IconButton>
					</div>
					<IconButton
						href={`/projects/${data.project_id}/settings`}
						aria-label='Settings'
						variant='secondary'
					>
						<IconSettings size={20} />
					</IconButton>
				</div>
			</div>

			{isNewStageModalOpen.value && (
				<NewStageModal
					isOpen={isNewStageModalOpen.value}
					onClose={() => isNewStageModalOpen.value = false}
					projectId={data.project_id}
					projectFormat={data.format}
				/>
			)}
		</div>
	);
}

// #region Helper Components

interface ChannelHeaderProps {
	title: string;
	isOpen: boolean;
	onToggle: () => void;
	onAdd?: () => void;
}

function ProjectSidebarDetailsChannelsHeader(
	{ title, isOpen, onToggle, onAdd }: ChannelHeaderProps,
) {
	return (
		<div class='sidebar-details__channels__header'>
			<button
				type='button'
				class={`sidebar-details__channels__header-toggle ${
					!isOpen ? 'sidebar-details__channels__header-toggle--closed' : ''
				}`}
				onClick={onToggle}
			>
				<IconChevronDown size={14} />
				<h5 class='sidebar-details__channels__title'>{title}</h5>
			</button>

			{onAdd && (
				<div class='sidebar-details__channels__header-actions'>
					<button
						type='button'
						class='sidebar-details__channels__action__add'
						onClick={onAdd}
						title={`Add ${title.slice(0, -1)}`}
					>
						<IconPlus size={16} />
					</button>
				</div>
			)}
		</div>
	);
}

interface ChannelItemProps {
	title: string;
	url: string;
	icon: ComponentChildren;
	isActive?: boolean;
	onOptions?: () => void;
}

function ProjectSidebarDetailsChannelsListItem(
	{ title, icon, url, isActive, onOptions }: ChannelItemProps,
) {
	return (
		<li class='sidebar-details__channels__list-item-wrapper'>
			<a
				href={url}
				class={`sidebar-details__channels__list-item ${
					isActive ? 'sidebar-details__channels__list-item--active' : ''
				}`}
				f-client-nav={false}
			>
				<span class='sidebar-details__channels__list-item-icon'>{icon}</span>
				<span class='sidebar-details__channels__list-item-title'>{title}</span>
			</a>
			{onOptions && (
				<button
					type='button'
					class='sidebar-details__channels__list-item-options'
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onOptions();
					}}
					title='Options'
				>
					<IconDots size={16} />
				</button>
			)}
		</li>
	);
}

// #endregion
```

### File: apps\web\features\dashboard\projects\components\project\ProjectSidebarStageItem.tsx

```tsx
import '../../styles/components/project/project-sidebar-details-stage-item.css';
import { ProjectStageSummary } from '../../contracts/Projects.ts';

interface StageListItemProps {
	stage: ProjectStageSummary;
	projectId: string;
}

export default function ProjectSidebarStageItem({ stage, projectId }: StageListItemProps) {
	const statusClass = stage.status.toLowerCase().replace(/_/g, '-');

	const typeLabel = stage.stage_type.replace(/_/g, ' ');

	return (
		<div class='stage-list-item__container'>
			<a
				href={`/projects/${projectId}/${stage.id}/chat`}
				f-partial={`/projects/${projectId}/${stage.id}/chat`}
				class='stage-list-item'
			>
				<div class='stage-list-item__info'>
					<span class='stage-list-item__title'>{stage.name}</span>
					<div class='stage-list-item__meta'>
						<span
							class={`stage-list-item__status-dot stage-list-item__status-dot--${statusClass}`}
							title={`Status: ${stage.status}`}
						/>
						<span class='stage-list-item__type'>
							{typeLabel}
						</span>
					</div>
				</div>

				<div class='stage-list-item__indicators'>
					{stage.unread && <span class='stage-list-item__unread' title='Unread messages' />}
				</div>
			</a>
		</div>
	);
}
```

### File: apps\web\features\dashboard\projects\components\project\stage\chat\AudioMessageInput.tsx

```tsx
import { useEffect, useRef } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { IconButton } from '@projective/ui';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-preact';

interface AudioMessageInputVisualizerProps {
	stream: MediaStream | null;
	audioBlob: Blob | null;
}

const MAX_PLAYBACK_BARS = 80;
const SVG_HEIGHT = 40;
const LIVE_BAR_WIDTH = 3;
const LIVE_BAR_GAP = 2;
const LIVE_STEP = LIVE_BAR_WIDTH + LIVE_BAR_GAP;

export default function AudioMessageInputVisualizer(
	{ stream, audioBlob }: AudioMessageInputVisualizerProps,
) {
	const containerRef = useRef<HTMLDivElement>(null);
	const audioRef = useRef<HTMLAudioElement>(null);

	const volumes = useSignal<number[]>([]);
	const playbackBars = useSignal<number[]>([]);
	const progress = useSignal<number>(0);
	const isPlaying = useSignal<boolean>(false);
	const hoverPercent = useSignal<number | null>(null);
	const containerWidth = useSignal<number>(300);

	const audioUrl = useSignal<string>('');

	// Setup ResizeObserver for dynamic width tracking
	useEffect(() => {
		if (!containerRef.current) return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				containerWidth.value = entry.contentRect.width;
			}
		});
		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, []);

	// Handle Blob URL & Downsampling for Playback
	useEffect(() => {
		if (audioBlob) {
			const url = URL.createObjectURL(audioBlob);
			audioUrl.value = url;

			// Downsample the recorded volumes array to prevent rendering thousands of bars
			if (volumes.value.length > 0) {
				if (volumes.value.length <= MAX_PLAYBACK_BARS) {
					playbackBars.value = [...volumes.value];
				} else {
					const chunkSize = volumes.value.length / MAX_PLAYBACK_BARS;
					const downsampled = [];
					for (let i = 0; i < MAX_PLAYBACK_BARS; i++) {
						const start = Math.floor(i * chunkSize);
						const end = Math.floor((i + 1) * chunkSize) || start + 1;
						let sum = 0;
						for (let j = start; j < end; j++) {
							sum += volumes.value[j];
						}
						downsampled.push(sum / (end - start));
					}
					playbackBars.value = downsampled;
				}
			}

			return () => URL.revokeObjectURL(url);
		} else {
			audioUrl.value = '';
			playbackBars.value = [];
		}
	}, [audioBlob]);

	// Live Recording Analyser
	useEffect(() => {
		if (!stream) return;
		volumes.value = [];

		const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
		const source = audioCtx.createMediaStreamSource(stream);
		const analyser = audioCtx.createAnalyser();
		analyser.fftSize = 256;
		source.connect(analyser);

		const dataArray = new Uint8Array(analyser.frequencyBinCount);
		let animationFrameId: number;
		let lastUpdate = performance.now();

		const draw = () => {
			animationFrameId = requestAnimationFrame(draw);
			const now = performance.now();

			// Throttle slightly to get ~20 bars per second
			if (now - lastUpdate < 50) return;
			lastUpdate = now;

			analyser.getByteFrequencyData(dataArray);
			let sum = 0;
			for (let i = 0; i < dataArray.length; i++) {
				sum += dataArray[i];
			}
			const avg = sum / dataArray.length;
			const normalized = Math.min(1, avg / 128);

			volumes.value = [...volumes.value, normalized];
		};

		draw();

		return () => {
			cancelAnimationFrame(animationFrameId);
			audioCtx.close();
		};
	}, [stream]);

	// Playback Controls
	const togglePlay = () => {
		if (!audioRef.current) return;
		if (isPlaying.value) {
			audioRef.current.pause();
		} else {
			audioRef.current.play();
		}
	};

	const handleTimeUpdate = () => {
		if (!audioRef.current) return;
		progress.value = (audioRef.current.currentTime / audioRef.current.duration) || 0;
	};

	const handleEnded = () => {
		isPlaying.value = false;
		progress.value = 0;
	};

	const handleInteraction = (e: MouseEvent) => {
		if (!audioBlob || !containerRef.current || !audioRef.current) return;
		const rect = containerRef.current.getBoundingClientRect();
		const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
		const percent = x / rect.width;

		if (e.type === 'mousemove') {
			hoverPercent.value = percent;
		} else if (e.type === 'mouseleave') {
			hoverPercent.value = null;
		} else if (e.type === 'click' || e.type === 'mousedown') {
			audioRef.current.currentTime = percent * audioRef.current.duration;
			progress.value = percent;
			if (!isPlaying.value) {
				audioRef.current.play();
			}
		}
	};

	const isPlayback = !!audioBlob;

	// DOM Virtualization Logic
	let displayBars: number[] = [];
	let viewBoxX = 0;
	let startIndex = 0;

	if (isPlayback) {
		displayBars = playbackBars.value;
		viewBoxX = 0;
	} else {
		// Live mode: Only map and render the bars that are actually visible on screen
		const fullWidth = volumes.value.length * LIVE_STEP;
		viewBoxX = Math.max(0, fullWidth - containerWidth.value);
		startIndex = Math.max(0, Math.floor(viewBoxX / LIVE_STEP));
		const endIndex = startIndex + Math.ceil(containerWidth.value / LIVE_STEP) + 1;

		displayBars = volumes.value.slice(startIndex, endIndex);
	}

	return (
		<div class={`audio-message-input-visualizer ${isPlayback ? 'is-playback' : ''}`}>
			{isPlayback && (
				<IconButton
					aria-label='Play/Pause'
					variant='secondary'
					ghost={true}
					rounded
					onClick={togglePlay}
				>
					{isPlaying.value ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />}
				</IconButton>
			)}

			<div
				class='audio-message-input-visualizer__waveform'
				ref={containerRef}
				onMouseMove={isPlayback ? handleInteraction : undefined}
				onMouseLeave={isPlayback ? handleInteraction : undefined}
				onMouseDown={isPlayback ? handleInteraction : undefined}
				style={{ cursor: isPlayback ? 'pointer' : 'default' }}
			>
				<svg
					width='100%'
					height='100%'
					viewBox={`${viewBoxX} 0 ${containerWidth.value} ${SVG_HEIGHT}`}
				>
					{displayBars.map((vol, i) => {
						const barHeight = Math.max(4, vol * SVG_HEIGHT);

						// In live mode, calculate exact physical X coordinate. In playback, distribute evenly.
						const x = isPlayback
							? (i / displayBars.length) * containerWidth.value
							: (startIndex + i) * LIVE_STEP;

						const width = isPlayback
							? Math.max(1, (containerWidth.value / displayBars.length) - 1)
							: LIVE_BAR_WIDTH;

						let stateClass = 'bar-pending';
						if (isPlayback) {
							const barPercent = i / displayBars.length;
							if (barPercent <= progress.value) {
								stateClass = 'bar-played';
							} else if (hoverPercent.value !== null && barPercent <= hoverPercent.value) {
								stateClass = 'bar-hovered';
							}
						} else {
							stateClass = 'bar-live';
						}

						return (
							<rect
								key={isPlayback ? i : startIndex + i}
								class={`audio-bar ${stateClass}`}
								x={x}
								y={(SVG_HEIGHT - barHeight) / 2}
								width={width}
								height={barHeight}
								rx={width / 2}
							/>
						);
					})}
				</svg>
			</div>

			{isPlayback && (
				<audio
					ref={audioRef}
					src={audioUrl.value}
					onPlay={() => isPlaying.value = true}
					onPause={() => isPlaying.value = false}
					onTimeUpdate={handleTimeUpdate}
					onEnded={handleEnded}
					hidden
				/>
			)}
		</div>
	);
}
```

### File: apps\web\features\dashboard\projects\components\project\stage\chat\StageChatMessage.tsx

```tsx
import {
	ChatMessageAttachment,
	ChatMessageData,
} from '../../../../islands/project/stage/ChatNetworkSource.ts';

interface ChatMessageProps {
	message: ChatMessageData;
	onRetry?: (tempId: string) => void;
}

function formatBytes(bytes: number, decimals = 1) {
	if (!bytes || bytes === 0) return '0 B';
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const FileAttachment = (
	{ file, isSelf }: { file: ChatMessageAttachment; isSelf: boolean },
) => {
	const isImage = file.type.startsWith('image/');

	if (isImage) {
		return (
			<div style={{ marginBottom: '8px', marginTop: '4px' }}>
				<a href={file.url} target='_blank' rel='noopener noreferrer'>
					<img
						src={file.url}
						alt={file.name}
						style={{
							maxWidth: '100%',
							maxHeight: '300px',
							borderRadius: '8px',
							objectFit: 'cover',
							border: '1px solid rgba(0,0,0,0.1)',
							display: 'block',
						}}
						onError={(e) => {
							(e.target as HTMLImageElement).style.display = 'none';
						}}
					/>
				</a>
			</div>
		);
	}

	return (
		<a
			href={file.url}
			target='_blank'
			rel='noopener noreferrer'
			style={{
				display: 'flex',
				alignItems: 'center',
				padding: '8px 12px',
				marginBottom: '8px',
				backgroundColor: isSelf ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.05)',
				borderRadius: '8px',
				textDecoration: 'none',
				color: 'inherit',
				border: isSelf ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0,0,0,0.1)',
				transition: 'background-color 0.2s',
			}}
		>
			<div
				style={{
					marginRight: '10px',
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
				>
					<path d='M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' />
					<polyline points='14 2 14 8 20 8' />
				</svg>
			</div>
			<div style={{ overflow: 'hidden' }}>
				<div
					style={{
						fontSize: '0.85rem',
						fontWeight: '500',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
					}}
					title={file.name}
				>
					{file.name}
				</div>
				<div
					style={{
						fontSize: '0.7rem',
						opacity: 0.8,
					}}
				>
					{formatBytes(file.size)} • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
				</div>
			</div>
		</a>
	);
};

export default function ChatMessage({ message, onRetry }: ChatMessageProps) {
	const isSelf = message.isSelf;
	const hasAttachments = message.attachments && message.attachments.length > 0;

	// Evaluate status
	const isSending = message.status === 'sending';
	const isError = message.status === 'error';

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: isSelf ? 'flex-end' : 'flex-start',
				padding: '8px 16px',
				width: '100%',
				boxSizing: 'border-box',
				opacity: isSending ? 0.6 : 1,
				transition: 'opacity 0.2s ease-in-out',
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					maxWidth: '70%',
					alignItems: isSelf ? 'flex-end' : 'flex-start',
				}}
			>
				{!isSelf && (
					<div
						style={{
							fontSize: '0.75rem',
							color: '#6b7280',
							marginBottom: '2px',
							marginLeft: '4px',
						}}
					>
						{message.sender.name}
					</div>
				)}

				<div
					style={{
						backgroundColor: isSelf ? 'var(--primary-500, #3b82f6)' : 'var(--gray-200, #e5e7eb)',
						color: isSelf ? 'white' : 'var(--text-primary, #111827)',
						borderRadius: '12px',
						borderBottomRightRadius: isSelf ? '2px' : '12px',
						borderBottomLeftRadius: isSelf ? '12px' : '2px',
						padding: '10px 14px',
						boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
						width: hasAttachments ? '100%' : 'auto',
						minWidth: hasAttachments ? '200px' : 'auto',
					}}
				>
					{hasAttachments && (
						<div style={{ display: 'flex', flexDirection: 'column' }}>
							{message.attachments!.map((att) => (
								<FileAttachment key={att.id} file={att} isSelf={isSelf} />
							))}
						</div>
					)}

					{message.text && (
						<div
							style={{
								fontSize: '0.9rem',
								lineHeight: '1.4',
								whiteSpace: 'pre-wrap',
								wordBreak: 'break-word',
							}}
						>
							{message.text}
						</div>
					)}

					<div style={{ fontSize: '0.7rem', marginTop: '4px', opacity: 0.8, textAlign: 'right' }}>
						{new Date(message.timestamp).toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
						})}
					</div>
				</div>

				{/* Status Indicators */}
				{isSending && (
					<div
						style={{
							fontSize: '0.7rem',
							color: '#6b7280',
							marginTop: '4px',
							display: 'flex',
							justifyContent: 'flex-end',
						}}
					>
						Sending...
					</div>
				)}

				{isError && (
					<div
						style={{
							fontSize: '0.7rem',
							color: '#ef4444',
							marginTop: '4px',
							display: 'flex',
							justifyContent: 'flex-end',
							alignItems: 'center',
							gap: '6px',
						}}
					>
						Failed to send
						<button
							type='button'
							onClick={() => onRetry?.(message.tempId!)}
							style={{
								background: 'none',
								border: 'none',
								color: '#ef4444',
								textDecoration: 'underline',
								cursor: 'pointer',
								padding: 0,
								fontSize: '0.7rem',
							}}
						>
							Retry
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
```

### File: apps\web\features\dashboard\projects\components\project\stage\chat\StageChatMessageInput.tsx

```tsx
import '../../../../styles/components/project/stage/chat/message-input.css';
import {
	IconMicrophone,
	IconPlayerRecord,
	IconPlus,
	IconSend,
	IconSquare,
	IconTrash,
	IconX,
} from '@tabler/icons-preact';
import { Signal, useSignal } from '@preact/signals';
import { IconButton } from '@projective/ui';
import { UploadFileIsland } from '@features/shared/components/overlay/UploadFile.tsx';
import { FileWithMeta } from '@projective/types';
import { useMemo, useRef } from 'preact/hooks';
import AudioMessageInputVisualizer from './AudioMessageInput.tsx';
import {
	AudioRecorderResult,
	AudioRecorderService,
} from '@features/shared/services/comms/audioRecorderService.ts';

type RecordingState = 'idle' | 'pressing' | 'locked';

interface ChatMessageInputProps {
	onSend: (text: string, files: FileWithMeta[]) => void;
	files: Signal<FileWithMeta[]>;
}

export default function ChatMessageInput({ onSend, files }: ChatMessageInputProps) {
	const text = useSignal('');
	const isUploadFileOpen = useSignal(false);

	const audioRecorder = useMemo(() => new AudioRecorderService(), []);
	const recordingState = useSignal<RecordingState>('idle');
	const liveStream = useSignal<MediaStream | null>(null);
	const recordedAudio = useSignal<AudioRecorderResult | null>(null);
	const pointerDownTime = useRef<number>(0);

	const resetAudioState = () => {
		recordingState.value = 'idle';
		liveStream.value = null;
		recordedAudio.value = null;
	};

	const handleSend = () => {
		const payloadFiles = [...files.value];

		// If there is an audio message, bundle it with the other attachments
		if (recordedAudio.value) {
			const audioFile: FileWithMeta = {
				id: crypto.randomUUID(),
				file: recordedAudio.value.file,
				type: 'Audio',
				status: 'error',
				progress: 0,
				errors: [],
			};
			payloadFiles.push(audioFile);
		}

		if (!text.value.trim() && payloadFiles.length === 0) return;

		onSend(text.value, payloadFiles);

		text.value = '';
		files.value = [];
		resetAudioState();
	};

	const handleDiscardAudio = () => {
		audioRecorder.cancel();
		resetAudioState();
	};

	const handleRemoveFile = (idToRemove: string) => {
		files.value = files.value.filter((f) => f.id !== idToRemove);
	};

	// --- Recording Interaction Logic ---
	const startRecording = async () => {
		await audioRecorder.start();
		liveStream.value = audioRecorder.stream;
	};

	const stopRecording = async () => {
		const result = await audioRecorder.stop();
		liveStream.value = null;
		if (result) recordedAudio.value = result;

		recordingState.value = 'idle';
	};

	const handleRecordPointerDown = async (e: PointerEvent) => {
		if (e.button !== 0 && e.pointerType === 'mouse') return;
		if (recordingState.value === 'locked') return;

		const target = e.currentTarget as HTMLElement;
		target.setPointerCapture(e.pointerId);
		pointerDownTime.current = Date.now();
		recordingState.value = 'pressing';

		await startRecording();
	};

	const handleRecordPointerUp = async (e: PointerEvent) => {
		const target = e.currentTarget as HTMLElement;
		if (target.hasPointerCapture(e.pointerId)) {
			target.releasePointerCapture(e.pointerId);
		}

		if (recordingState.value === 'locked') {
			await stopRecording();
			return;
		}

		if (recordingState.value === 'pressing') {
			const duration = Date.now() - pointerDownTime.current;
			if (duration < 250) {
				recordingState.value = 'locked';
			} else {
				await stopRecording();
			}
		}
	};

	const isRecording = recordingState.value !== 'idle';
	const hasRecordedAudio = recordedAudio.value !== null;
	const isAudioActive = isRecording || hasRecordedAudio;

	return (
		<div class='chat-message-input'>
			{files.value.length > 0 && !isAudioActive && (
				<div class='chat-message-input__attachments'>
					{files.value.map((f) => (
						<div key={f.id} class='chat-message-input__attachment-item'>
							<span class='chat-message-input__attachment-name'>{f.file.name}</span>
							<div
								class='chat-message-input__attachment-remove'
								onClick={() => handleRemoveFile(f.id as string)}
							>
								<IconX size={14} />
							</div>
						</div>
					))}
				</div>
			)}

			<div class='chat-message-input__content'>
				<div
					class='chat-message-input__left'
					style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
				>
					<IconButton
						aria-label='Add attachment'
						variant='secondary'
						rounded
						onClick={() => isUploadFileOpen.value = true}
						disabled={isRecording}
					>
						<IconPlus size={18} />
					</IconButton>
					{hasRecordedAudio && (
						<IconButton
							aria-label='Discard message'
							variant='danger'
							ghost={true}
							rounded
							onClick={handleDiscardAudio}
						>
							<IconTrash size={18} />
						</IconButton>
					)}
				</div>

				<div class='chat-message-input__input-wrapper'>
					{isAudioActive
						? (
							<AudioMessageInputVisualizer
								stream={liveStream.value}
								audioBlob={recordedAudio.value?.blob || null}
							/>
						)
						: (
							<input
								type='text'
								class='chat-message-input__input'
								placeholder='Type a message...'
								value={text.value}
								onInput={(e) => text.value = e.currentTarget.value}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										handleSend();
									}
								}}
							/>
						)}
				</div>

				<div class='chat-message-input__right'>
					{hasRecordedAudio || (text.value.trim() || files.value.length > 0) && !isRecording
						? (
							<IconButton
								aria-label='Send'
								ghost={false}
								variant='primary'
								rounded
								onClick={handleSend}
							>
								<IconSend size={18} />
							</IconButton>
						)
						: (
							<div
								style={{ display: 'flex', touchAction: 'none', userSelect: 'none' }}
								onPointerDown={handleRecordPointerDown}
								onPointerUp={handleRecordPointerUp}
								onPointerCancel={handleRecordPointerUp}
							>
								<IconButton
									aria-label={isRecording ? 'Stop Recording' : 'Record'}
									variant={isRecording ? 'danger' : 'secondary'}
									rounded
									onClick={(e: Event) => e.preventDefault()}
								>
									{recordingState.value === 'locked'
										? <IconSquare size={18} />
										: recordingState.value === 'pressing'
										? <IconPlayerRecord size={18} />
										: <IconMicrophone size={18} />}
								</IconButton>
							</div>
						)}
				</div>
			</div>

			<UploadFileIsland
				isOpen={isUploadFileOpen.value}
				onClose={() => isUploadFileOpen.value = false}
				multiple={true}
				onConfirm={(selectedFiles) => {
					const newFiles = [...files.value];
					for (const file of selectedFiles) {
						if (!newFiles.some((f) => f.id === file.id)) newFiles.push(file);
					}
					files.value = newFiles;
				}}
			/>
		</div>
	);
}
```

### File: apps\web\features\dashboard\projects\components\project\stage\chat\StageChatMessageInputAttach.tsx

```tsx
// deno-lint-ignore-file no-explicit-any
import '../../../../styles/components/project/stage/chat/message-input-attach.css';
import { IconPlus } from '@tabler/icons-preact';
import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';

interface ChatMessageInputAttachProps {
	onAttach?: () => void;
	onFilesSelected?: (files: File[]) => void;
}

export default function ChatMessageInputAttach(
	{ onAttach, onFilesSelected }: ChatMessageInputAttachProps,
) {
	const openAttachmentPopup = useSignal(false);
	const rootRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const root = rootRef.current;
			if (!root) return;
			if (root.contains(event.target as Node)) return;
			openAttachmentPopup.value = false;
		};

		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	const handleAttach = () => {
		if (onAttach) {
			onAttach();
		}
		openAttachmentPopup.value = false;
	};

	const handleDirectUpload = (e: any) => {
		const input = e.currentTarget;
		if (input.files && input.files.length > 0) {
			const selectedFiles = Array.from(input.files) as File[];
			if (onFilesSelected) {
				onFilesSelected(selectedFiles);
			}
			// Reset input so same file can be selected again if needed
			input.value = '';
			openAttachmentPopup.value = false;
		}
	};

	return (
		<div ref={rootRef} class='chat-message-input__attach'>
			<button
				type='button'
				class='chat-message-input__attach__button'
				title='Add attachment'
				data-open={openAttachmentPopup.value}
				onClick={() => openAttachmentPopup.value = !openAttachmentPopup.value}
			>
				<IconPlus />
			</button>

			{openAttachmentPopup.value && (
				<div class='chat-message-input__attach__attachment-popup'>
					<label>
						<input
							type='file'
							class='chat-message-input__attach__attachment-popup__file-input'
							onInput={handleDirectUpload}
							multiple
							hidden
						/>
						<span style={{ cursor: 'pointer' }}>Upload Files</span>
					</label>
					<button type='button' onClick={handleAttach}>Add from Storage</button>
				</div>
			)}
		</div>
	);
}
```

### File: apps\web\features\dashboard\projects\components\project\stage\files\file\StageFIle3D.tsx

```tsx
```

### File: apps\web\features\dashboard\projects\components\project\stage\files\file\StageFileAudio.tsx

```tsx
```

### File: apps\web\features\dashboard\projects\components\project\stage\files\file\StageFileDocument.tsx

```tsx
```

### File: apps\web\features\dashboard\projects\components\project\stage\files\file\StageFileFooter.tsx

```tsx
```

### File: apps\web\features\dashboard\projects\components\project\stage\files\file\StageFileImage.tsx

```tsx
```

### File: apps\web\features\dashboard\projects\components\project\stage\files\file\StageFileMarkdown.tsx

```tsx
```

### File: apps\web\features\dashboard\projects\components\project\stage\files\file\StageFileText.tsx

```tsx
```

### File: apps\web\features\dashboard\projects\components\project\stage\files\file\StageFIleVideo.tsx

```tsx
```

### File: apps\web\features\dashboard\projects\components\project\stage\files\StageFilesFooter.tsx

```tsx
/* #region Imports */
import { JSX } from 'preact';
import { Button } from '@projective/ui';
import { IconFile, IconFileText, IconFileZip, IconMusic, IconVideo } from '@tabler/icons-preact';
import '../../../../styles/components/project/stage/files/message-files-footer.css';
import {
	ChatMessageAttachment,
	ChatMessageData,
} from '../../../../islands/project/stage/ChatNetworkSource.ts';
/* #endregion */

/* #region Interfaces */
/**
 * Props for the StageFilesFooter component.
 */
export interface StageFilesFooterProps {
	/** The currently selected attachment. Null if nothing is selected. */
	attachment: ChatMessageAttachment | null;
	/** The message context for the selected attachment. */
	message: ChatMessageData | null;
	/** The destination URL for opening the file */
	openUrl?: string;
}
/* #endregion */

/* #region Helpers */
const formatFileType = (mimeType: string, filename: string): string => {
	if (!mimeType) {
		const ext = filename.split('.').pop()?.toUpperCase() || '';
		return ext ? `${ext} File` : 'File';
	}
	if (mimeType.includes('png')) return 'PNG Image';
	if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPEG Image';
	if (mimeType.includes('pdf')) return 'PDF Document';
	return 'File';
};
/* #endregion */

/* #region Component */
/**
 * @function StageFilesFooter
 * @description Displays a detailed footer panel for a selected file/attachment in the stage view.
 * @param {StageFilesFooterProps} props - The component properties.
 * @returns {JSX.Element | null}
 */
export default function StageFilesFooter(
	{ attachment, message, openUrl }: StageFilesFooterProps,
): JSX.Element | null {
	if (!attachment || !message) return null;

	const dateObj = new Date(message.timestamp);
	const dateStr = dateObj.toLocaleDateString('en-US');
	const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
		.toLowerCase();

	const typeLabel = formatFileType(attachment.type, attachment.name);
	const mimeType = attachment.type?.toLowerCase() || '';
	const isImage = mimeType.startsWith('image/');

	const renderFallbackIcon = () => {
		if (mimeType.startsWith('video/')) return <IconVideo size={64} stroke={1.5} />;
		if (mimeType.startsWith('audio/')) return <IconMusic size={64} stroke={1.5} />;
		if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar')) {
			return <IconFileZip size={64} stroke={1.5} />;
		}
		if (mimeType.startsWith('text/') || mimeType.includes('pdf') || mimeType.includes('document')) {
			return <IconFileText size={64} stroke={1.5} />;
		}
		return <IconFile size={64} stroke={1.5} />;
	};

	return (
		<div class='stage-files-footer'>
			<div class='stage-files-footer__preview-container'>
				{isImage
					? (
						<img
							src={attachment.url}
							class='stage-files-footer__preview'
							alt={attachment.name || 'Selected file preview'}
						/>
					)
					: (
						<div class='stage-files-footer__preview-fallback'>
							{renderFallbackIcon()}
						</div>
					)}
			</div>

			<div class='stage-files-footer__details'>
				<div class='stage-files-footer__header'>
					<h3 class='stage-files-footer__title'>{attachment.name || 'Unnamed File'}</h3>
					<p class='stage-files-footer__meta'>
						{typeLabel} <br />
						{dateStr} - {timeStr}
					</p>
				</div>

				<hr class='stage-files-footer__divider' />

				<div class='stage-files-footer__message'>
					{message.text && <p class='stage-files-footer__message-text'>{message.text}</p>}

					<div class='stage-files-footer__actions'>
						<Button variant='primary' href={openUrl} f-partial={openUrl}>
							Open
						</Button>
						<Button variant='secondary'>
							Download
						</Button>
						<Button variant='secondary'>
							Properties
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
/* #endregion */
```

### File: apps\web\features\dashboard\projects\components\project\stage\files\StageFilesItem.tsx

```tsx
/* #region Imports */
import { JSX } from 'preact';
import { IconFile, IconFileText, IconFileZip, IconMusic, IconVideo } from '@tabler/icons-preact';
import '../../../../styles/components/project/stage/files/message-files-item.css';
import {
	ChatMessageAttachment,
	ChatMessageData,
} from '../../../../islands/project/stage/ChatNetworkSource.ts';
/* #endregion */

/* #region Interfaces */
/**
 * Props for the StageFilesItem component.
 */
export interface StageFilesItemProps {
	/** The attachment data to render. */
	attachment: ChatMessageAttachment;
	/** The parent chat message containing context like timestamp. */
	message: ChatMessageData;
	/** Indicates if the current file is actively selected. */
	isSelected?: boolean;
	/** The destination URL for opening the file */
	openUrl?: string;
	/** Callback fired when the item is clicked or activated. */
	onAction: (e: Event) => void;
}
/* #endregion */

/* #region Component */
/**
 * @function StageFilesItem
 * @description Renders a selectable grid item for a file shared in a stage chat.
 * @param {StageFilesItemProps} props - Component properties.
 * @returns {JSX.Element}
 */
export function StageFilesItem(
	{ attachment, message, isSelected, openUrl, onAction }: StageFilesItemProps,
): JSX.Element {
	const dateObj = new Date(message.timestamp);
	const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

	const mimeType = attachment.type?.toLowerCase() || '';
	const isImage = mimeType.startsWith('image/');
	const ext = attachment.name?.split('.').pop()?.toUpperCase() || 'FILE';

	const renderFallbackIcon = () => {
		if (mimeType.startsWith('video/')) return <IconVideo size={42} stroke={1.5} />;
		if (mimeType.startsWith('audio/')) return <IconMusic size={42} stroke={1.5} />;
		if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar')) {
			return <IconFileZip size={42} stroke={1.5} />;
		}
		if (mimeType.startsWith('text/') || mimeType.includes('pdf') || mimeType.includes('document')) {
			return <IconFileText size={42} stroke={1.5} />;
		}
		return <IconFile size={42} stroke={1.5} />;
	};

	return (
		<a
			class={`stage-files-item ${isSelected ? 'stage-files-item--selected' : ''}`}
			href={openUrl}
			f-partial={openUrl}
			onClick={onAction}
			role='button'
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					onAction(e);
				}
			}}
		>
			<div class='stage-files-item__preview-container'>
				{isImage
					? (
						<img
							src={attachment.url}
							class='stage-files-item__preview'
							alt={attachment.name || 'File preview'}
							loading='lazy'
						/>
					)
					: (
						<div class='stage-files-item__fallback'>
							{renderFallbackIcon()}
							<span class='stage-files-item__fallback-ext'>{ext}</span>
						</div>
					)}
			</div>
			<div class='stage-files-item__details'>
				<span class='stage-files-item__name' title={attachment.name}>
					{attachment.name || 'Unnamed File'}
				</span>
				<span class='stage-files-item__date'>
					{dateStr}
				</span>
			</div>
		</a>
	);
}
/* #endregion */
```

### File: apps\web\features\dashboard\projects\components\project\stage\StageHeader.tsx

```tsx
/**
 * @file StageHeader.tsx
 * @description Global middle-nav header component for the stage layout, displaying stage details,
 * contextual tabs, and actions. Injected via NavigationContext.
 */

// #region Imports
import '../../../styles/components/project/stage/stage-header.css';
import { useStageContext } from '../../../contexts/StageContext.tsx';
import { useProjectContext } from '@features/dashboard/projects/contexts/ProjectContext.tsx';
import { IconDotsVertical } from '@tabler/icons-preact';
import { IconButton } from '@projective/ui';
// #endregion

export const stageTabs = () => {
	const tabs = [
		{ label: 'Chat', href: 'chat' },
		{ label: 'Files', href: 'files' },
		{ label: 'Tasks', href: 'tasks' },
		{ label: 'Submissions', href: 'submissions' },
		{ label: 'Finance', href: 'finance' },
		{ label: 'Members', href: 'members' },
	];

	return tabs;
};

// #region Component
export default function StageHeader() {
	const { stage, stage_id } = useStageContext();
	const { project, project_id } = useProjectContext();

	let tabs: { label: string; href: string }[] = [];
	if (stage.value) {
		tabs = stageTabs();
	}

	const isCurrentTab = (href: string) => {
		if (typeof window === 'undefined') return false;
		return globalThis.location.pathname.includes(
			`/projects/${project_id.value}/${stage_id.value}/${href}`,
		);
	};

	return (
		<div class='stage-header'>
			{/* Left: Identity */}
			<div class='stage-header__left'>
				<img
					src={project.value?.banner_url || 'https://placehold.co/32'}
					alt='Stage Assignee Avatar'
					class='stage-header__avatar'
				/>
				<div class='stage-header__details'>
					<h3 class='stage-header__title'>
						{stage.value?.title || 'Loading Stage...'}
					</h3>
					<span class='stage-header__status'>Active</span>
				</div>
			</div>

			{/* Center: Navigation Tabs */}
			<div class='stage-header__center'>
				{tabs.map((tab) => {
					const targetUrl = `/projects/${project_id.value}/${stage_id.value}/${tab.href}`;
					const isActive = isCurrentTab(tab.href);

					return (
						<a
							key={tab.href}
							class={`stage-header__tab ${isActive ? 'stage-header__tab--active' : ''}`}
							href={targetUrl}
							f-client-nav={false}
						>
							{tab.label}
						</a>
					);
				})}
			</div>

			{/* Right: Actions */}
			<div class='stage-header__right'>
				<IconButton
					ghost
					size='small'
					aria-label='Stage Options'
				>
					<IconDotsVertical size={18} />
				</IconButton>
			</div>
		</div>
	);
}
// #endregion
```

### File: apps\web\features\dashboard\projects\components\ProjectListItem.tsx

```tsx
import '../styles/components/project-list-item.css';
import { IconStar } from '@tabler/icons-preact';
import { ProjectItem } from '../contracts/Projects.ts';

interface ProjectListItemProps {
	project: ProjectItem;
}

export function ProjectListItem({ project }: ProjectListItemProps) {
	const projectUrl = `/projects/${project.project_id}`;

	return (
		<a
			href={projectUrl}
			className='project-list-item'
			data-f-preload
			f-client-nav={false}
		>
			<img
				src={project.owner_avatar_url || 'https://placehold.co/32x32'}
				alt={project.owner_name}
				className='project-list-item__avatar'
			/>

			<div className='project-list-item__content'>
				<span className='project-list-item__title'>{project.title}</span>
				<div className='project-list-item__meta'>
					<span
						className={`project-list-item__status project-list-item__status--${project.status}`}
						title={`Status: ${project.status}`}
					/>
					<span>{project.owner_name}</span>
				</div>
			</div>

			<div className='project-list-item__indicators'>
				{project.is_starred && (
					<IconStar
						size={16}
						className='project-list-item__icon--active'
					/>
				)}
				{project.is_unread && (
					<span className='project-list-item__unread-dot' title='Unread activity' />
				)}
			</div>
		</a>
	);
}
```

### File: apps\web\features\dashboard\projects\components\ProjectSidebarList.tsx

```tsx
/**
 * @file ProjectSidebarList.tsx
 * @description Sidebar view displaying a filterable, infinitely scrolling list of projects.
 */

// #region Imports
import '../styles/components/project-sidebar-list.css';
import { IconCompass, IconFolderOff, IconPlus, IconSearch, IconX } from '@tabler/icons-preact';
import { DataDisplay, RestDataSource } from '@projective/data';
import { ProjectItem } from '../contracts/Projects.ts';
import { ProjectListItem } from './ProjectListItem.tsx';
import { useMemo } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { Button, IconButton } from '@projective/ui';
import NewProjectModal from './modals/NewProjectModal.tsx';
// #endregion

export default function ProjectsSidebarList() {
	// #region State
	const searchQuery = useSignal('');
	const isSearchExpanded = useSignal(false);
	const activeFilter = useSignal('all');

	const isNewProjectModalOpen = useSignal(false);

	// Placeholder tags for filtering
	const filterTags = [
		{ id: 'all', label: 'All' },
		{ id: 'active', label: 'Active' },
		{ id: 'starred', label: 'Starred' },
		{ id: 'archived', label: 'Archived' },
	];
	// #endregion

	// #region Data Management
	const dataSource = useMemo(() => {
		return new RestDataSource<ProjectItem, ProjectItem>({
			url: '/api/v1/dashboard/projects',
			keyExtractor: (item) => item.project_id,
			defaultParams: {
				category: activeFilter.value,
				search: searchQuery.value,
				sortBy: 'last_updated',
				sortDir: 'desc',
			},
		});
	}, [activeFilter.value, searchQuery.value]);
	// #endregion

	// #region Handlers
	const toggleSearch = () => {
		isSearchExpanded.value = !isSearchExpanded.value;
		if (!isSearchExpanded.value) {
			searchQuery.value = ''; // Clear search when collapsing
		}
	};
	// #endregion

	return (
		<div class='project-sidebar-list'>
			{/* 1. Header & Actions */}
			<div class='project-sidebar-list__header'>
				<h3 class='project-sidebar-list__title'>Projects</h3>
				<div class='project-sidebar-list__actions'>
					<IconButton
						className='project-sidebar-list__action-btn'
						onClick={toggleSearch}
						aria-label='Search Projects'
					>
						{isSearchExpanded.value ? <IconX size={18} /> : <IconSearch size={18} />}
					</IconButton>
				</div>
			</div>

			{/* 2. Expandable Search Bar */}
			{isSearchExpanded.value && (
				<div class='project-sidebar-list__search-container'>
					<IconSearch size={16} class='project-sidebar-list__search-icon' />
					<input
						type='text'
						class='project-sidebar-list__search-input'
						placeholder='Search projects...'
						value={searchQuery.value}
						onInput={(e) => searchQuery.value = (e.target as HTMLInputElement).value}
						autoFocus
					/>
				</div>
			)}

			{/* 3. Filter Tags (Chips) */}
			<div class='project-sidebar-list__tags'>
				{filterTags.map((tag) => (
					<button
						key={tag.id}
						class={`project-sidebar-list__tag ${
							activeFilter.value === tag.id ? 'project-sidebar-list__tag--active' : ''
						}`}
						onClick={() => activeFilter.value = tag.id}
					>
						{tag.label}
					</button>
				))}
			</div>

			{/* 4. Infinite Scroll List */}
			<div class='project-sidebar-list__content'>
				<DataDisplay<ProjectItem, ProjectItem>
					dataSource={dataSource}
					mode='list'
					estimateHeight={72}
					pageSize={20}
					selectionMode='none'
					renderItem={(project) => <ProjectListItem project={project} />}
					interactive={false}
					emptyState={
						<div class='project-sidebar-list__empty'>
							<IconFolderOff size={48} stroke={1.5} class='project-sidebar-list__empty-icon' />
							<p class='project-sidebar-list__empty-text'>No projects found.</p>
							<Button
								href='/explore?category=projects'
								className='project-sidebar-list__empty-link'
								f-client-nav={false}
								variant='primary'
							>
								<IconCompass size={18} />
								Explore Projects
							</Button>
						</div>
					}
				/>
			</div>

			<div class='project-sidebar-list__actions'>
				<Button
					onClick={() => isNewProjectModalOpen.value = true}
					className='project-sidebar-list__new-btn'
					aria-label='New Project'
					fullWidth
					variant='secondary'
				>
					<span class='project-sidebar-list__new-btn__content'>
						<IconPlus size={18} />
						<span>
							Create New Project
						</span>
					</span>
				</Button>
			</div>

			{isNewProjectModalOpen.value && (
				<NewProjectModal
					isOpen={isNewProjectModalOpen.value}
					onClose={() => isNewProjectModalOpen.value = false}
				/>
			)}
		</div>
	);
}
```

### File: apps\web\features\dashboard\projects\components\ProjectsSidebar.tsx

```tsx
import '../styles/components/projects-sidebar.css';
import { useProjectContext } from '@features/dashboard/projects/contexts/ProjectContext.tsx';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import ProjectSidebarDetails from './project/ProjectSidebarDetails.tsx';
import ProjectSidebarList from './ProjectSidebarList.tsx';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';
import { IconButton } from '@projective/ui';

export default function ProjectsSidebar() {
	const { project_id } = useProjectContext();
	const { middleNav, setMiddleNav } = useNavigationContext();

	const collapsedWidth = '30px';

	const isCollapsed = middleNav.value.sideWidth === collapsedWidth;

	const toggleCollapse = () => {
		setMiddleNav({ sideWidth: isCollapsed ? '280px' : collapsedWidth });
	};

	return (
		<div class='layout-projects__sidebar'>
			{!isCollapsed && (
				project_id.value ? <ProjectSidebarDetails /> : <ProjectSidebarList />
			)}

			<IconButton
				className='layout-projects__sidebar__close-btn'
				aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
				variant='secondary'
				rounded
				size='small'
				ghost={false}
				onClick={toggleCollapse}
			>
				{isCollapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
			</IconButton>
		</div>
	);
}
```

### File: apps\web\features\dashboard\projects\contexts\ProjectContext.tsx

```tsx
/**
 * @file ProjectContext.tsx
 * @description Global signal-based context for managing a single project and its board tickets.
 */

import { createContext } from 'preact';
import { useContext, useEffect } from 'preact/hooks';
import { Signal, useSignal } from '@preact/signals';
import { ComponentChildren } from 'preact';
import {
	FullProjectResponse,
	TicketResponse,
	TicketStatus,
	UpdateTicketRequest,
} from '@projective/types';

// #region 1. INTERFACES

/**
 * @interface ProjectState
 * @description Re-establishes the exact runtime contract expected by the platform layouts.
 */
export interface ProjectState {
	project_id: Signal<string | undefined>;
	project: Signal<FullProjectResponse | null>;
	tickets: Signal<TicketResponse[]>;
	isLoading: Signal<boolean>;
	error: Signal<string | null>;
	refresh: () => Promise<void>;
	loadTickets: (projectId: string) => Promise<void>;
	moveTicket: (
		ticketId: string,
		newStageId: string | null,
		newStatus: TicketStatus,
	) => Promise<void>;
}

// #endregion

// #region 2. CONTEXT INITIALIZATION

export const ProjectContext = createContext<ProjectState | null>(null);

// #endregion

// #region 3. PROVIDER COMPONENT

/**
 * @function ProjectProvider
 * @description Wraps layouts ensuring reactive sync boundaries match the layout pipelines.
 */
export function ProjectProvider(
	{ id, children }: { id: string | undefined; children: ComponentChildren },
) {
	const projectId = useSignal<string | undefined>(id);
	const project = useSignal<FullProjectResponse | null>(null);
	const tickets = useSignal<TicketResponse[]>([]);
	const isLoading = useSignal<boolean>(false);
	const error = useSignal<string | null>(null);

	// Multi-business/project switching dynamic guard rails
	if (projectId.value !== id) {
		projectId.value = id;
		project.value = null;
		tickets.value = [];
		error.value = null;
	}

	/**
	 * @description Fetches the project schema configuration.
	 */
	const fetchProject = async () => {
		if (!projectId.value) return;

		isLoading.value = true;
		error.value = null;

		try {
			const res = await fetch(`/api/v1/dashboard/projects/${projectId.value}`);
			if (!res.ok) throw new Error(`Project fetch failed with status: ${res.status}`);

			const data: FullProjectResponse = await res.json();
			project.value = data;
		} catch (err: any) {
			console.error('Project Context Fetch Error:', err);
			error.value = err.message || 'An unexpected error occurred.';
		} finally {
			isLoading.value = false;
		}
	};

	/**
	 * @description Fetches the atomic workspace pipeline components.
	 */
	const loadTickets = async (pId: string) => {
		try {
			const res = await fetch(`/api/v1/dashboard/projects/${pId}/tickets`);
			if (!res.ok) throw new Error('Failed to retrieve board tasks.');

			const data: TicketResponse[] = await res.json();
			tickets.value = data;
		} catch (err: any) {
			console.error('Tickets Fetch Error:', err);
			error.value = err.message || 'Failed to fetch tickets.';
		}
	};

	/**
	 * @description Optimistically records Kanban changes across streams.
	 */
	const moveTicket = async (
		ticketId: string,
		newStageId: string | null,
		newStatus: TicketStatus,
	) => {
		const previousState = [...tickets.value];
		tickets.value = tickets.value.map((t) =>
			t.id === ticketId ? { ...t, current_stage_id: newStageId, status: newStatus } : t
		);

		try {
			const payload: UpdateTicketRequest = {
				current_stage_id: newStageId,
				status: newStatus,
			};

			const res = await fetch(`/api/v1/dashboard/projects/${projectId.value}/tickets/${ticketId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			if (!res.ok) throw new Error('Persistence step failed.');
		} catch (err: any) {
			tickets.value = previousState;
			error.value = err.message || 'Failed to sync ticket update.';
		}
	};

	useEffect(() => {
		if (projectId.value) {
			fetchProject();
			loadTickets(projectId.value);
		}
	}, [projectId.value]);

	const state: ProjectState = {
		project_id: projectId,
		project,
		tickets,
		isLoading,
		error,
		refresh: fetchProject,
		loadTickets,
		moveTicket,
	};

	return (
		<ProjectContext.Provider value={state}>
			{children}
		</ProjectContext.Provider>
	);
}

// #endregion

// #region 4. HOOKS

export function useProjectContext(): ProjectState {
	const context = useContext(ProjectContext);
	if (!context) {
		throw new Error('useProjectContext must be used within a ProjectProvider');
	}
	return context;
}

// #endregion
```

### File: apps\web\features\dashboard\projects\contexts\StageContext.tsx

```tsx
// deno-lint-ignore-file no-explicit-any
import { ComponentChildren, createContext } from 'preact';
import { useContext, useEffect, useMemo } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { StageDetails, StageState } from '../contracts/Projects.ts';

export const StageContext = createContext<StageState | null>(null);

export function StageProvider({
	projectId,
	stageId: initialId,
	children,
}: {
	projectId: string;
	stageId: string;
	children: ComponentChildren;
}) {
	const stageId = useSignal(initialId);
	const stage = useSignal<StageDetails | null>(null);
	const isLoading = useSignal(false);
	const error = useSignal<string | null>(null);

	useEffect(() => {
		if (stageId.value !== initialId) {
			stageId.value = initialId;
			stage.value = null;
			error.value = null;
		}
	}, [initialId]);

	const fetchStage = async () => {
		if (!projectId || !stageId.value) return;

		isLoading.value = true;
		error.value = null;

		try {
			const res = await fetch(
				`/api/v1/dashboard/projects/${projectId}/stages/${stageId.value}`,
			);
			if (!res.ok) throw new Error(`Error ${res.status}`);
			stage.value = await res.json();
		} catch (err: any) {
			error.value = err.message;
		} finally {
			isLoading.value = false;
		}
	};

	useEffect(() => {
		if (stageId.value) {
			fetchStage();
		}
	}, [projectId, stageId.value]);

	const contextValue = useMemo(() => ({
		stage_id: stageId,
		stage,
		isLoading,
		error,
		refresh: fetchStage,
	}), []);

	return (
		<StageContext.Provider value={contextValue}>
			{children}
		</StageContext.Provider>
	);
}

export function useStageContext() {
	const ctx = useContext(StageContext);
	if (!ctx) throw new Error('useStageContext must be used within StageProvider');
	return ctx;
}
```

### File: apps\web\features\dashboard\projects\contracts\new\Project.ts

```ts
import {
	CurrencyDefinition,
	DateTime,
	FileWithMeta,
	IPOptionMode,
	PortfolioDisplayRights,
	ProjectFormat,
	TimelinePreset,
	Visibility,
} from '@projective/types';
import { QuillDelta } from '@projective/utils';
import { Stage } from './Stage.ts';

// #region 1. Sub-Interfaces
export interface LegalAndScreening {
	ip_ownership_mode: IPOptionMode;
	nda_required: boolean;
	portfolio_display_rights: PortfolioDisplayRights;
	screening_questions: string[]; // Stored as JSONB array
	location_restriction: string[];
	language_requirement: string[];
}
// #endregion

// #region 2. Main Contract
export interface Project {
	// Details
	title: string;
	description: string | QuillDelta;
	industry_category_id?: string; // UUID
	visibility: Visibility;
	global_attachments?: string[] | FileWithMeta[];
	currency: string | CurrencyDefinition;

	// Workflow Format
	format: ProjectFormat;

	// Timeline High-level
	timeline_preset?: TimelinePreset;
	target_project_start_date?: string | Date | DateTime;
	soft_deadline?: string | Date | DateTime;

	// Extracted Interface
	legal_and_screening?: LegalAndScreening;

	// The Stages List
	stages?: Stage[];
}
// #endregion
```

### File: apps\web\features\dashboard\projects\contracts\new\Stage.ts

```ts
import { QuillDelta } from '@projective/utils';
import { BudgetType, DateTime, StartTriggerType } from '@projective/types';

// #region 1. Sub-Interfaces
export interface StageStaffingRole {
	id?: string;
	role_title: string;
	quantity: number;
	budget_type: BudgetType;
	budget_amount_cents: number;
	allow_proposals: boolean;
}

export interface StageOpenSeat {
	id?: string;
	description_of_need: string;
	budget_min_cents?: number;
	budget_max_cents?: number;
	require_proposals: boolean;
}
// #endregion

// #region 2. Main Contract
export interface Stage {
	id?: string;
	project_id?: string;

	title: string;
	description: string | QuillDelta;
	status: string;
	sort_order: number;

	// Deliverable & Configuration Logic
	file_upload_required?: boolean;
	default_tasks?: Record<string, any>[];
	skills?: string[];

	// Triggers & Timeline
	start_trigger_type: StartTriggerType;
	fixed_start_date?: DateTime | string;
	start_dependency_stage_id?: string;
	start_dependency_lag_days?: number;
	file_revisions_allowed?: number;
	file_duration_mode?: 'fixed_deadline' | 'relative_duration' | 'no_due_date';
	file_duration_days?: number;
	file_due_date?: DateTime | string;
	file_extensions_allowed?: string[];
	file_max_size_mb?: number;
	file_max_count?: number;
	session_duration_minutes?: number;
	session_count?: number;
	session_preferred_days?: string[];
	management_contract_mode?: 'fixed_dates' | 'duration_from_start';
	maintenance_cycle_interval?: 'weekly' | 'monthly';
	ip_ownership_override?: string;

	// Staffing & Budgets
	staffing_roles: StageStaffingRole[];
	open_seats: StageOpenSeat[];
}
// #endregion
```

### File: apps\web\features\dashboard\projects\contracts\new\_validation.ts

```ts
import { z } from 'zod';
import {
	BudgetType,
	IPOptionMode,
	PortfolioDisplayRights,
	ProjectFormat,
	StartTriggerType,
	TimelinePreset,
	Visibility,
} from '@projective/types';

// #region 1. Base Utility Schemas
export const QuillDeltaSchema = z.object({
	ops: z.array(
		z.object({
			insert: z.union([
				z.string(),
				z.record(z.string(), z.any()),
			]),
			attributes: z.record(z.string(), z.any()).optional(),
		}),
	),
});
// #endregion

// #region 2. Nested Schemas
export const LegalAndScreeningSchema = z.object({
	ip_ownership_mode: z.nativeEnum(IPOptionMode),
	nda_required: z.boolean(),
	portfolio_display_rights: z.nativeEnum(PortfolioDisplayRights),
	screening_questions: z.array(z.string().min(1, 'Question cannot be empty')),
	location_restriction: z.array(z.string()),
	language_requirement: z.array(z.string()),
});

export const StageStaffingRoleSchema = z.object({
	role_title: z.string().min(1, 'Role title is required').max(100),
	quantity: z.number().int().min(1),
	budget_type: z.nativeEnum(BudgetType),
	budget_amount_cents: z.number().int().min(0, 'Budget cannot be negative'),
	allow_proposals: z.boolean(),
});

export const StageOpenSeatSchema = z.object({
	description_of_need: z.string().min(
		10,
		'Please describe the need in detail',
	).max(500),
	budget_min_cents: z.number().int().min(0).optional(),
	budget_max_cents: z.number().int().min(0).optional(),
	require_proposals: z.boolean(),
});

export const StageSchema = z.object({
	id: z.uuid().optional(),

	title: z.string().min(1, 'Stage title is required').max(100),
	description: z.union([z.string(), QuillDeltaSchema]),
	status: z.string().default('open'),
	sort_order: z.number().int().min(0),

	file_upload_required: z.boolean().default(false).optional(),
	default_tasks: z.array(z.record(z.string(), z.any())).default([]).optional(),
	skills: z.array(z.string()).default([]).optional(),

	start_trigger_type: z.nativeEnum(StartTriggerType),
	fixed_start_date: z.coerce.date().optional(),

	start_dependency_stage_id: z.string().optional(),
	start_dependency_lag_days: z.number().int().optional(),
	hire_trigger_active: z.boolean().optional(),

	file_revisions_allowed: z.number().int().min(0).optional(),
	file_duration_mode: z.enum([
		'fixed_deadline',
		'relative_duration',
		'no_due_date',
	]).optional(),
	file_duration_days: z.number().int().min(1).optional(),
	file_due_date: z.coerce.date().optional(),
	file_extensions_allowed: z.array(z.string()).optional(),
	file_max_size_mb: z.number().int().min(1).optional(),
	file_max_count: z.number().int().min(1).optional(),

	session_duration_minutes: z.number().int().min(1).optional(),
	session_count: z.number().int().min(1).optional(),
	session_preferred_days: z.array(z.string()).optional(),
	session_end_date: z.coerce.date().optional(),

	management_contract_mode: z.enum(['fixed_dates', 'duration_from_start']).optional(),
	maintenance_cycle_interval: z.enum(['weekly', 'monthly']).optional(),

	ip_ownership_override: z.string().optional(),

	staffing_roles: z.array(StageStaffingRoleSchema),
	open_seats: z.array(StageOpenSeatSchema),
}).refine((data) => {
	if (
		data.start_trigger_type === StartTriggerType.FixedDate &&
		!data.fixed_start_date
	) {
		return false;
	}
	return true;
}, {
	message: "Fixed start date is required when trigger type is 'Fixed Date'",
	path: ['fixed_start_date'],
});
// #endregion

// #region 3. Core Output Schemas
export const CreateProjectSchema = z.object({
	client_business_id: z.uuid().optional(),

	format: z.nativeEnum(ProjectFormat),

	title: z.string().min(5, 'Title must be at least 5 characters').max(150),
	description: z.union([z.string(), QuillDeltaSchema]),
	industry_category_id: z.string().uuid({
		message: 'Please select an industry category',
	}).optional(),

	visibility: z.nativeEnum(Visibility),
	currency: z.string().length(3).regex(
		/^[A-Z]{3}$/,
		'Must be a 3-letter currency code',
	),

	timeline_preset: z.nativeEnum(TimelinePreset).optional(),

	target_project_start_date: z.coerce.date().optional().refine((date) => {
		if (!date) return true;
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return date.getTime() >= today.getTime();
	}, { message: 'Target project start date cannot be in the past' }),

	soft_deadline: z.coerce.date().optional(),

	legal_and_screening: LegalAndScreeningSchema.optional(),
	stages: z.array(StageSchema).optional().default([]),
	global_attachments: z.array(z.uuid()).optional(),
	tags: z.array(z.string()).max(10, 'Too many tags').optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type StageInput = z.infer<typeof StageSchema>;
// #endregion
```

### File: apps\web\features\dashboard\projects\contracts\Projects.ts

```ts
import { ProjectPermission, StagePermission } from '@projective/types';
import { Signal } from '@preact/signals';
import { VNode } from 'preact';

export interface ProjectItem {
	project_id: string;
	title: string;
	status: 'active' | 'draft' | 'completed' | 'archived';
	banner_url: string | null;
	owner_name: string;
	owner_avatar_url: string | null;
	is_starred: boolean;
	is_archived: boolean;
	is_unread: boolean;
	last_updated_at: string;
	total_count: number;
}

export interface ProjectsFilterParams {
	category?: string;
	categoryId?: string;
	search?: string;
	sortBy?: string;
	sortDir?: string;
	limit?: number;
	offset?: number;
}

export type ProjectRole = 'owner' | 'collaborator' | 'viewer';

export interface ProjectStageSummary {
	id: string;
	name: string;
	status: string;
	stage_type: string;
	unread: boolean;
	last_updated?: string;
}

export interface ProjectDetails {
	project_id: string;
	title: string;
	status: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled';
	banner_url: string | null;
	is_starred: boolean;
	format: 'one_off' | 'pipeline';

	owner: {
		id: string;
		name: string;
		username: string;
		avatar_url: string | null;
		type: 'business' | 'freelancer';
	};

	stages: ProjectStageSummary[];

	viewer_context: {
		role: ProjectRole;
		permissions: ProjectPermission[];
	};
}

export interface ProjectState {
	project_id: Signal<string | undefined>;
	project: Signal<ProjectDetails | null>;
	isLoading: Signal<boolean>;
	error: Signal<string | null>;
	refresh: () => void;
}

export type StageRole = 'owner' | 'assignee' | 'viewer';

export interface StageDetails {
	stage_id: string;
	project_id: string;
	channel_id: string;
	title: string;
	description: string;
	sort_order: number;

	status:
		| 'open'
		| 'assigned'
		| 'in_progress'
		| 'submitted'
		| 'approved'
		| 'revisions'
		| 'paid';
	ip_mode:
		| 'exclusive_transfer'
		| 'licensed_use'
		| 'internal_only'
		| 'template_only';
	due_date: string | null;

	budget: {
		type: 'fixed' | 'hourly_cap' | 'free';
		amount_cents: number;
		currency: string;
	} | null;

	assignee: {
		profile_id: string;
		name: string;
		avatar_url: string | null;
		type: 'freelancer' | 'team';
		status: 'invited' | 'accepted';
	} | null;

	latest_submission: {
		id: string;
		submitted_at: string;
		notes: string;
		files: Array<{ name: string; url: string }>;
	} | null;

	viewer_context: {
		role: StageRole;
		permissions: StagePermission[];
	};
}

export interface StageState {
	stage_id: Signal<string | undefined>;
	stage: Signal<StageDetails | null>;
	isLoading: Signal<boolean>;
	error: Signal<string | null>;
	refresh: () => void;
}
```

### File: apps\web\features\dashboard\projects\islands\project\Board.tsx

```tsx
/**
 * @file Board.tsx
 * @description The main interactive Kanban/List island for managing project stages and tickets.
 */

// #region Imports
import '../../styles/pages/board.css';
import { useComputed, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { Button, toast, ToggleButton, ToggleButtonGroup } from '@projective/ui';
import { IconBasket, IconLayoutKanban, IconList } from '@tabler/icons-preact';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import { useProjectContext } from '@features/dashboard/projects/contexts/ProjectContext.tsx';
import { NewTicketModal } from '@features/dashboard/projects/components/modals/NewTicketModal.tsx';
import NewStageModal from '@features/dashboard/projects/components/new/NewStageModal.tsx';
import {
	BoardDataView,
	BoardTicket,
} from '@features/dashboard/projects/components/project/board/BoardDataView.tsx';
import { BoardHeader } from '@features/dashboard/projects/components/project/board/BoardHeader.tsx';
import { TicketStatus } from '@projective/types';
import { TicketsService } from '@features/dashboard/projects/services/TicketsService.ts';
import { StagesService } from '@features/dashboard/projects/services/StagesService.ts';
// #endregion

export interface ProjectBoardIslandProps {
	isOwnerOrAdmin?: boolean;
}

export default function ProjectBoardIsland({ isOwnerOrAdmin = true }: ProjectBoardIslandProps) {
	const { setMiddleNav } = useNavigationContext();
	const { project, tickets, loadTickets, refresh, moveTicket, isLoading } = useProjectContext();

	// Safely resolve the active Project ID regardless of backend serialization nuances
	// deno-lint-ignore no-explicit-any
	const activeProjectId = project.value?.id || (project.value as any)?.projectId ||
		(project.value as any)?.project_id;

	// #region State Signals
	const viewType = useSignal<'stages' | 'status'>('stages');
	const displayMode = useSignal<'kanban' | 'list'>('kanban');

	const isNewTicketOpen = useSignal(false);
	const selectedStageForNewTicket = useSignal<string | null>(null);

	const isNewStageOpen = useSignal(false);
	// #endregion

	// #region Computed Data
	const availableStages = useComputed(() => {
		if (!project.value) return [];
		return project.value.stages
			.map((s) => ({ label: s.name, value: s.id }))
			.sort((a, b) => {
				const s1 = project.value!.stages.find((s) => s.id === a.value)?.sort_order || 0;
				const s2 = project.value!.stages.find((s) => s.id === b.value)?.sort_order || 0;
				return s1 - s2;
			});
	});

	const mappedTickets = useComputed<BoardTicket[]>(() => {
		if (!tickets.value) return [];
		return tickets.value.map((t) => {
			const stage = project.value?.stages.find((s) => s.id === t.current_stage_id);
			return {
				id: t.id,
				title: t.title,
				stageId: t.current_stage_id || 'new',
				stageName: stage ? stage.name : 'Backlog',
				status: t.status as TicketStatus,
				assigneeId: t.current_assignee_id,
				assigneeName: t.current_assignee_id ? 'Assigned' : null,
				workloadIntensity: t.workload_intensity,
				revisionsRequested: 0,
				attachmentsScanned: t.attachment_count > 0,
				createdAt: t.created_at,
			};
		});
	});

	const unpaidTicketsCount = useComputed(() => {
		// deno-lint-ignore no-explicit-any
		return tickets.value.filter((t: any) => t.payment_status === 'unpaid').length;
	});
	// #endregion

	// #region Navigation Footer Injection
	useEffect(() => {
		const footerContent = (
			<div class='project-board__footer-wrapper'>
				<div class='project-board__footer-right'>
					<ToggleButtonGroup
						value={viewType.value}
						// deno-lint-ignore no-explicit-any
						onChange={(v) => viewType.value = v as any}
						optional={false}
						variant='secondary'
					>
						<ToggleButton value='stages'>Pipeline</ToggleButton>
						<ToggleButton value='status'>Status</ToggleButton>
					</ToggleButtonGroup>

					{isOwnerOrAdmin && (
						<div style={{ display: 'flex', gap: '0.5rem' }}>
							<Button variant='secondary' onClick={() => isNewStageOpen.value = true}>
								+ Add Stage
							</Button>
							<Button
								variant='secondary'
								onClick={() => {
									selectedStageForNewTicket.value = null;
									isNewTicketOpen.value = true;
								}}
							>
								+ Add New Ticket
							</Button>
						</div>
					)}
				</div>

				<div class='project-board__footer-left'>
					<ToggleButtonGroup
						value={displayMode.value}
						// deno-lint-ignore no-explicit-any
						onChange={(v) => displayMode.value = v as any}
						optional={false}
						variant='secondary'
					>
						<ToggleButton value='kanban' aria-label='Kanban'>
							<IconLayoutKanban size={18} />
						</ToggleButton>
						<ToggleButton value='list' aria-label='List'>
							<IconList size={18} />
						</ToggleButton>
					</ToggleButtonGroup>

					<Button
						variant='primary'
						href={`/checkout?project=${activeProjectId}`}
						disabled={!activeProjectId}
					>
						<IconBasket /> Checkout
						{unpaidTicketsCount.value > 0 && (
							<div class='project-board__unpaid-badge'>
								{unpaidTicketsCount.value}
							</div>
						)}
					</Button>
				</div>
			</div>
		);

		setMiddleNav({ footerHeight: '64px', footerContent });
		return () => setMiddleNav({ footerHeight: '0px', footerContent: null });
	}, [
		viewType.value,
		displayMode.value,
		isOwnerOrAdmin,
		unpaidTicketsCount.value,
		activeProjectId,
		setMiddleNav,
	]);
	// #endregion

	// #region Handlers
	// deno-lint-ignore no-explicit-any
	const handleAddTicket = async (payload: any) => {
		if (!activeProjectId) {
			toast.error('Project ID is missing. Cannot create ticket.');
			return;
		}
		try {
			await TicketsService.createTicket(activeProjectId, payload);
			await loadTickets(activeProjectId);
			isNewTicketOpen.value = false;
			toast.success('Ticket created successfully');
		} catch (err: any) {
			console.error('Failed to create ticket', err);
			// Surfacing the Zod validation failure directly to the user
			toast.error(err.message || 'Failed to create ticket. Check your inputs.');
		}
	};

	const handleAddTicketTrigger = (stageId: string | null) => {
		selectedStageForNewTicket.value = stageId;
		isNewTicketOpen.value = true;
	};

	const handleAddStageTrigger = () => {
		isNewStageOpen.value = true;
	};

	const handleCardMove = async (cardId: string, sourceFieldId: string, targetFieldId: string) => {
		let newStatus: TicketStatus;
		let newStageId: string | null = targetFieldId;

		if (viewType.value === 'stages') {
			if (targetFieldId === 'New') {
				newStatus = TicketStatus.Backlog;
				newStageId = null;
			} else if (targetFieldId === 'Done') {
				newStatus = TicketStatus.Completed;
				newStageId = null;
			} else {
				newStatus = TicketStatus.InProgress;
			}
		} else {
			newStatus = targetFieldId as TicketStatus;
			const existingTicket = tickets.value.find((t) => t.id === cardId);
			newStageId = existingTicket?.current_stage_id || null;
		}

		await moveTicket(cardId, newStageId, newStatus);
	};

	const handleFieldMove = async (sourceId: string, targetId: string, insertBefore: boolean) => {
		if (!activeProjectId) return;

		const currentStages = [...availableStages.value];
		const sourceIndex = currentStages.findIndex((s) => s.value === sourceId);
		const targetIndex = currentStages.findIndex((s) => s.value === targetId);

		if (sourceIndex === -1 || targetIndex === -1) return;

		const [movedStage] = currentStages.splice(sourceIndex, 1);
		const adjustedTargetIndex = currentStages.findIndex((s) => s.value === targetId);

		if (insertBefore) {
			currentStages.splice(adjustedTargetIndex, 0, movedStage);
		} else {
			currentStages.splice(adjustedTargetIndex + 1, 0, movedStage);
		}

		const orderedIds = currentStages.map((s) => s.value);
		try {
			await StagesService.reorderStages(activeProjectId, orderedIds);
			await refresh();
		} catch (err: any) {
			console.error('Failed to reorder stages', err);
			toast.error(err.message || 'Failed to reorder stages.');
		}
	};
	// #endregion

	if (isLoading.value && !project.value) {
		return <div class='project-board__loading'>Loading board...</div>;
	}

	return (
		<div class='project-board'>
			<BoardHeader
				projectTitle={project.value?.title || 'Loading...'}
				projectFormat={project.value?.format || 'pipeline'}
				fiduciary={{ totalBudgetCents: 0, tvlEscrowCents: 0, releasedBalanceCents: 0 }}
				capacity={{
					backlogQueueSize: tickets.value.length,
					cumulativeWi: 0,
					accuracyPercentage: 100,
				}}
			/>

			<main class='project-board__content'>
				<BoardDataView
					tickets={mappedTickets.value}
					stages={availableStages.value}
					viewType={viewType.value}
					displayMode={displayMode.value}
					isOwnerOrAdmin={isOwnerOrAdmin}
					onCardClick={(id) => console.log('Ticket clicked:', id)}
					onCardMove={handleCardMove}
					onFieldMove={handleFieldMove}
					onAddStage={handleAddStageTrigger}
					onAddTicket={handleAddTicketTrigger}
				/>
			</main>

			<NewTicketModal
				isOpen={isNewTicketOpen.value}
				onClose={() => isNewTicketOpen.value = false}
				availableStages={availableStages.value}
				preselectedStageId={selectedStageForNewTicket.value}
				onSubmit={handleAddTicket}
			/>

			<NewStageModal
				isOpen={isNewStageOpen.value}
				onClose={() => isNewStageOpen.value = false}
				projectId={activeProjectId || ''}
				projectFormat={project.value?.format as 'pipeline' | 'one_off' | undefined}
			/>
		</div>
	);
}
```

### File: apps\web\features\dashboard\projects\islands\project\Project.tsx

```tsx
import { useProjectContext } from '@features/dashboard/projects/contexts/ProjectContext.tsx';

export default function ProjectIsland() {
	const state = useProjectContext();
	return (
		<div>
		</div>
	);
}
```

### File: apps\web\features\dashboard\projects\islands\project\stage\ChatNetworkSource.ts

```ts
import { DataSource, FetchResult, Range } from '@projective/data';

export interface ChatMessageSender {
	id: string;
	name: string;
	avatarUrl?: string;
}

export interface ChatMessageAttachment {
	id: string;
	name: string;
	type: string;
	size: number;
	url: string;
}

export interface ChatMessageData {
	id: string;
	text: string;
	sender: ChatMessageSender;
	timestamp: string;
	isSelf: boolean;
	attachments?: ChatMessageAttachment[];
	status?: 'sending' | 'error' | 'sent';
	tempId?: string;
}

export interface ChatRealtimeEvent {
	type: 'INSERT' | 'UPDATE' | 'DELETE';
	data: ChatMessageData | { id: string };
}

export class ChatNetworkSource extends DataSource<ChatMessageData> {
	private channelId: string;
	private currentUserId: string | null = null;

	constructor(channelId: string) {
		super({
			// deno-lint-ignore no-explicit-any
			keyExtractor: (item: any) => item.id,
		});
		this.channelId = channelId;
	}

	public setCurrentUser(userId: string) {
		this.currentUserId = userId;
	}

	private getEndpoint() {
		return `/api/v1/dashboard/comms/channels/${this.channelId}/messages`;
	}

	private getSubscriptionEndpoint() {
		return `/api/v1/dashboard/comms/channels/${this.channelId}/subscribe?type=channel`;
	}

	subscribe(onMessage: (event: ChatRealtimeEvent) => void): () => void {
		console.log('[SSE] Attempting to connect to EventSource at:', this.getSubscriptionEndpoint());

		const eventSource = new EventSource(this.getSubscriptionEndpoint());

		eventSource.onopen = () => {
			console.log('[SSE] Connection successfully opened!');
		};

		eventSource.onmessage = (event) => {
			console.log('[SSE] Raw event string received:', event.data);
			try {
				const parsed = JSON.parse(event.data);

				let type = parsed.type;
				let data = parsed.data;

				if (!type) {
					type = 'INSERT';
					data = parsed;
				}

				if (this.currentUserId && data.sender) {
					data.isSelf = data.sender.id === this.currentUserId;
				}

				console.log('[SSE] Successfully parsed and dispatching:', { type, data });
				onMessage({ type, data });
			} catch (e) {
				console.error('[SSE] Error parsing SSE message payload:', e);
			}
		};

		eventSource.onerror = (err) => {
			console.error('[SSE] EventSource Error state triggered:', err);
			if (eventSource.readyState === EventSource.CLOSED) {
				console.warn('[SSE] Connection permanently closed.');
			}
		};

		return () => {
			console.log('[SSE] Closing EventSource connection.');
			eventSource.close();
		};
	}

	async getMeta(): Promise<{ totalCount: number }> {
		try {
			const response = await fetch(
				`${this.getEndpoint()}?countOnly=true&type=channel`,
			);
			if (!response.ok) throw new Error('Failed to fetch meta');
			const data = await response.json();
			return data.meta || { totalCount: 0 };
		} catch (error) {
			console.error('[HTTP] Failed to init chat meta:', error);
			return { totalCount: 0 };
		}
	}

	async fetch(range: Range): Promise<FetchResult<ChatMessageData>> {
		try {
			const params = new URLSearchParams({
				start: range.start.toString(),
				limit: range.length.toString(),
				type: 'channel',
			});

			const response = await fetch(`${this.getEndpoint()}?${params.toString()}`);
			if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

			const data = await response.json();
			return { items: data.items || [], meta: data.meta || { totalCount: 0 } };
		} catch (error) {
			console.error('[HTTP] Failed to fetch chat chunk:', error);
			return { items: [], meta: { totalCount: 0 } };
		}
	}
}
```

### File: apps\web\features\dashboard\projects\islands\project\stage\StageChat.island.tsx

```tsx
import '../../../styles/components/project/stage/chat/messages.css';
import ChatMessage from '../../../components/project/stage/chat/StageChatMessage.tsx';
import { ChatMessageData, ChatNetworkSource } from './ChatNetworkSource.ts';
import { ChatList } from '@projective/data';
import { useStageContext } from '../../../contexts/StageContext.tsx';
import { getCsrfToken } from '@projective/utils';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import { effect, untracked, useSignal } from '@preact/signals';
import { IconMessages } from '@tabler/icons-preact';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import ChatMessageInput from '@features/dashboard/projects/components/project/stage/chat/StageChatMessageInput.tsx';
import { FileWithMeta } from '@projective/types';

export default function ProjectChatIsland() {
	const { stage, refresh } = useStageContext();
	const { setMiddleNav } = useNavigationContext();

	const optimisticMsgs = useSignal<ChatMessageData[]>([]);
	const attachments = useSignal<FileWithMeta[]>([]);
	const pendingUploads = useRef(new Map<string, { message: string; files: FileWithMeta[] }>());

	const handleSend = async (message: string, files: FileWithMeta[], retryId?: string) => {
		const tempId = retryId || crypto.randomUUID();
		const targetChannel = stage?.value?.channel_id || 'new';

		// Optimistic UI
		if (!retryId) {
			const optimisticData: ChatMessageData = {
				id: tempId,
				tempId: tempId,
				text: message,
				sender: { id: 'self', name: 'Me' },
				timestamp: new Date().toISOString(),
				isSelf: true,
				status: 'sending',
				attachments: files.map((f) => ({
					id: f.id as string,
					name: f.file.name as string,
					type: f.type as string,
					size: f.file.size,
					url: '',
				})),
			};
			optimisticMsgs.value = [...optimisticMsgs.value, optimisticData];
			pendingUploads.current.set(tempId, { message, files });
		}

		try {
			const formData = new FormData();
			formData.append('message', message);
			formData.append('tempId', tempId);

			files.forEach((f) => {
				formData.append('files', f.file);
				// Flag this specific file as an audio message based on the meta injected in the input component
				if (f.meta?.isAudioMessage) {
					formData.append('voiceMessages', f.file.name);
				}
			});

			const csrfToken = await getCsrfToken();

			const endpoint = targetChannel === 'new'
				? `/api/v1/dashboard/projects/${stage?.value?.project_id}/stages/${stage?.value?.stage_id}/chat/init`
				: `/api/v1/dashboard/comms/channels/${targetChannel}/messages?type=channel`;

			const res = await fetch(endpoint, {
				method: 'POST',
				headers: { 'X-CSRF': csrfToken || '' },
				body: formData,
			});

			if (!res.ok) throw new Error('Network response was not ok');

			const realMsg = await res.json();

			optimisticMsgs.value = optimisticMsgs.value.map((m) =>
				m.tempId === tempId
					? { ...m, id: realMsg.id, status: 'sent', timestamp: realMsg.timestamp }
					: m
			);
			pendingUploads.current.delete(tempId);

			if (targetChannel === 'new') refresh();
		} catch (err) {
			console.error('Failed to send message:', err);
			optimisticMsgs.value = optimisticMsgs.value.map((m) =>
				m.tempId === tempId ? { ...m, status: 'error' } : m
			);
		}
	};

	const onSend = (msg: string, files: FileWithMeta[]) => handleSend(msg, files);

	const onSendRef = useRef(onSend);
	onSendRef.current = onSend;

	const onRetry = (tempId: string) => {
		const data = pendingUploads.current.get(tempId);
		if (data) handleSend(data.message, data.files, tempId);
	};

	useEffect(() => {
		const dispose = effect(() => {
			const hasAttachments = attachments.value.length > 0;

			untracked(() => {
				setMiddleNav({
					footerHeight: hasAttachments ? '150px' : '86px',
					footerContent: (
						<ChatMessageInput
							onSend={(text, files) => onSendRef.current(text, files)}
							files={attachments}
						/>
					),
				});
			});
		});

		return () => {
			dispose();
			setMiddleNav({
				footerHeight: '0px',
				footerContent: null,
			});
		};
	}, []);

	const dataSource = useMemo(() => {
		if (!stage?.value || !stage.value.channel_id) return null;
		return new ChatNetworkSource(stage.value.channel_id);
	}, [stage?.value?.channel_id]);

	return (
		<div class='project-chat-island messages-container'>
			<div class='project-chat-island__messages'>
				{dataSource
					? (
						<ChatList
							dataSource={dataSource}
							optimisticItems={optimisticMsgs.value}
							renderItem={(item) => <ChatMessage message={item} onRetry={onRetry} />}
							estimateHeight={120}
							pageSize={20}
							scrollMode='window'
						/>
					)
					: (
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								height: '100%',
								color: 'var(--text-muted)',
								gap: '1rem',
							}}
						>
							<IconMessages size={48} opacity={0.5} />
							<p>Send a message to start the conversation.</p>
						</div>
					)}
			</div>
		</div>
	);
}
```

### File: apps\web\features\dashboard\projects\islands\project\stage\StageFile.island.tsx

```tsx
export default function ProjectFileIsland() {
	return (
		<div>
			<div></div>
		</div>
	);
}
```

### File: apps\web\features\dashboard\projects\islands\project\stage\StageFiles.island.tsx

```tsx
```

### File: apps\web\features\dashboard\projects\islands\project\stage\StageFinance.island.tsx

```tsx
export default function ProjectFileIsland() {
	return (
		<div>
			<div></div>
		</div>
	);
}
```

### File: apps\web\features\dashboard\projects\islands\project\stage\StageLayout.island.tsx

```tsx
// #region Imports
import { ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';
import { StageContext, StageProvider, useStageContext } from '../../../contexts/StageContext.tsx';
import { ProjectContext, useProjectContext } from '../../../contexts/ProjectContext.tsx'; // NEW: Import Project Context
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import StageHeader from '../../../components/project/stage/StageHeader.tsx';
// #endregion

// #region Interfaces
export interface StageLayoutIslandProps {
	projectId: string;
	stageId: string;
	children: ComponentChildren;
}
// #endregion

// #region 1. Inner Layout (The Multi-Tunnel)
/**
 * Consumes the local StageContext AND ProjectContext, and tunnels BOTH
 * up to the Navigation Header so the header has full data access.
 */
function StageLayoutInner({ children }: { children: ComponentChildren }) {
	const { setMiddleNav } = useNavigationContext();

	// Grab both local states
	const stageState = useStageContext();
	const projectState = useProjectContext();

	useEffect(() => {
		setMiddleNav({
			headerHeight: '64px',
			headerContent: (
				<ProjectContext.Provider value={projectState}>
					<StageContext.Provider value={stageState}>
						<StageHeader />
					</StageContext.Provider>
				</ProjectContext.Provider>
			),
		});

		// Cleanup when unmounting
		return () => {
			setMiddleNav({
				headerHeight: '0px',
				headerContent: null,
			});
		};
	}, [stageState, projectState]);

	return (
		<div
			style={{
				flex: 1,
				minHeight: 0,
				display: 'flex',
				flexDirection: 'column',
				position: 'relative',
			}}
		>
			{children}
		</div>
	);
}
// #endregion

// #region 2. Public Export
export default function StageLayoutIsland({
	projectId,
	stageId,
	children,
}: StageLayoutIslandProps) {
	return (
		<StageProvider projectId={projectId} stageId={stageId}>
			<StageLayoutInner>
				{children}
			</StageLayoutInner>
		</StageProvider>
	);
}
// #endregion
```

### File: apps\web\features\dashboard\projects\islands\project\stage\StageMemeber.island.tsx

```tsx
```

### File: apps\web\features\dashboard\projects\islands\project\stage\StageSubmissions.island.tsx

```tsx
export default function ProjectFileIsland() {
	return (
		<div>
			<div></div>
		</div>
	);
}
```

### File: apps\web\features\dashboard\projects\islands\project\stage\StageTasks.island.tsx

```tsx
// #region IMPORTS
import { useSignal } from '@preact/signals';
import { Kanban, KanbanFieldProps } from '@projective/charts';
// #endregion

// #region MOCK DATA
const MOCK_FIELDS: KanbanFieldProps[] = [
	{
		id: 'field-backlog',
		title: 'Backlog',
		color: 'var(--text-muted)',
		order: 0,
		addCardLabel: 'Add Backlog Item', // Customised add button label
		permissions: {
			canAddCard: true, // Hides unless true
			canReorder: true, // Disabled unless true
		},
		cards: [
			{
				id: 'card-1',
				title: 'Database Schema',
				description: 'Create ERD.',
				created: new Date().toISOString(),
				order: 0,
				permissions: { canReorder: true }, // Explicit opt-in
			},
			{
				id: 'card-2',
				title: 'Stripe Integration',
				description: 'Integrate Connect.',
				created: new Date().toISOString(),
				order: 1,
				permissions: { canReorder: true },
			},
		],
	},
	{
		id: 'field-in-progress',
		title: 'In Progress',
		color: 'var(--warning)',
		order: 1,
		limit: 5,
		addCardLabel: 'Add Sprint Task', // Customised add button label
		permissions: {
			canAddCard: true,
			canReorder: true,
		},
		cards: [
			{
				id: 'card-3',
				title: 'Kanban Component',
				description: 'Locked Ticket',
				created: new Date().toISOString(),
				order: 0,
				takenBy: 'Alice',
				permissions: { canReorder: false }, // Fixed card context
			},
		],
	},
	{
		id: 'field-done',
		title: 'Done',
		color: 'var(--success)',
		order: -1,
		permissions: {
			canAddCard: false, // Disables the add button completely
			canReorder: false, // Fixed layout structure
		},
		cards: [],
	},
];
// #endregion

// #region COMPONENT
/**
 * Renders the primary Project Tasks Island containing the updated custom pointer-event
 * driven Kanban system, passing tailored labels, configuration settings, and structural permissions.
 * * @returns {JSX.Element} The rendered project tasks framework island.
 */
export default function ProjectTasksIsland() {
	const fields = useSignal<KanbanFieldProps[]>(MOCK_FIELDS);

	/**
	 * Re-indexes array items sequentially to prevent internal collision artifacts.
	 * * @param {T[]} items - Array of sortable entities.
	 * @returns {T[]} Clean mapped sequence array.
	 */
	const reindexOrders = <T extends { order: number }>(items: T[]): T[] => {
		let counter = 0;
		return items.map((item) => item.order >= 0 ? { ...item, order: counter++ } : item);
	};

	/**
	 * Updates local signals when cards are repositioned dynamically across board vectors.
	 */
	const handleCardMove = (
		cardId: string,
		sourceFieldId: string,
		targetFieldId: string,
		insertBeforeCardId: string | null,
	) => {
		const currentFields = [...fields.value];

		const sIdx = currentFields.findIndex((f) => f.id === sourceFieldId);
		const tIdx = currentFields.findIndex((f) => f.id === targetFieldId);
		if (sIdx === -1 || tIdx === -1) return;

		const sourceCards = [...currentFields[sIdx].cards].sort((a, b) => a.order - b.order);
		const targetCards = sIdx === tIdx
			? sourceCards
			: [...currentFields[tIdx].cards].sort((a, b) => a.order - b.order);

		const cardIndex = sourceCards.findIndex((c) => c.id === cardId);
		if (cardIndex === -1) return;
		const [movedCard] = sourceCards.splice(cardIndex, 1);

		let insertIndex = targetCards.length;
		if (insertBeforeCardId) {
			const isAfter = insertBeforeCardId.endsWith('_after');
			const targetIdClean = isAfter ? insertBeforeCardId.replace('_after', '') : insertBeforeCardId;
			const targetIndex = targetCards.findIndex((c) => c.id === targetIdClean);
			if (targetIndex !== -1) insertIndex = isAfter ? targetIndex + 1 : targetIndex;
		}

		targetCards.splice(insertIndex, 0, movedCard);

		currentFields[sIdx] = { ...currentFields[sIdx], cards: reindexOrders(sourceCards) };
		currentFields[tIdx] = { ...currentFields[tIdx], cards: reindexOrders(targetCards) };

		fields.value = currentFields;
	};

	/**
	 * Updates local signals when fields are reordered across layout tracks.
	 */
	const handleFieldMove = (sourceFieldId: string, targetFieldId: string, insertBefore: boolean) => {
		const currentFields = [...fields.value].sort((a, b) => {
			if (a.order >= 0 && b.order >= 0) return a.order - b.order;
			if (a.order < 0 && b.order < 0) return b.order - a.order;
			if (a.order >= 0 && b.order < 0) return -1;
			return 1;
		});

		const sIdx = currentFields.findIndex((f) => f.id === sourceFieldId);
		if (sIdx === -1) return;
		const [movedField] = currentFields.splice(sIdx, 1);

		const tIdx = currentFields.findIndex((f) => f.id === targetFieldId);
		const insertIndex = insertBefore ? Math.max(0, tIdx) : tIdx + 1;

		currentFields.splice(insertIndex, 0, movedField);
		fields.value = reindexOrders(currentFields);
	};

	/**
	 * Creates new structured card entities using interactive browser dialog prompts.
	 */
	const handleAddCard = (fieldId: string) => {
		const title = globalThis.prompt('Enter new ticket title:');
		if (!title) return;

		const currentFields = [...fields.value];
		const fIdx = currentFields.findIndex((f) => f.id === fieldId);

		if (fIdx !== -1) {
			const cards = [...currentFields[fIdx].cards];
			cards.push({
				id: `card-new-${Date.now()}`,
				title,
				description: '',
				created: new Date().toISOString(),
				order: cards.length > 0 ? Math.max(...cards.map((c) => c.order)) + 1 : 0,
				permissions: { canReorder: true }, // Enabled on initial execution
			});
			currentFields[fIdx] = { ...currentFields[fIdx], cards };
			fields.value = currentFields;
		}
	};

	/**
	 * Creates new stage vectors dynamically inside the board array layout.
	 */
	const handleAddField = () => {
		const title = globalThis.prompt('Enter new stage title:');
		if (!title) return;

		const currentFields = [...fields.value];
		const newOrder = currentFields.length > 0
			? Math.max(...currentFields.filter((f) => f.order >= 0).map((f) => f.order)) + 1
			: 0;

		currentFields.push({
			id: `field-new-${Date.now()}`,
			title,
			color: 'var(--primary)',
			order: newOrder,
			addCardLabel: 'Add Ticket',
			permissions: {
				canAddCard: true,
				canReorder: true,
			},
			cards: [],
		});

		fields.value = reindexOrders(currentFields);
	};

	return (
		<div class='project-tasks-island' style={{ height: 'calc(100vh - var(--header-height))' }}>
			<Kanban
				mode='container' // Uses standard window body container scrollbar mapping natively
				fields={fields.value}
				permissions={{
					canAddField: true, // Passed down directly to structural context layout
				}}
				onCardMove={handleCardMove}
				onFieldMove={handleFieldMove}
				onAddCard={handleAddCard}
				onAddField={handleAddField}
			/>
		</div>
	);
}
// #endregion
```

### File: apps\web\features\dashboard\projects\islands\ProjectsHome.tsx

```tsx
import { useState } from 'preact/hooks';
import { ColumnDef, DataDisplay, DisplayMode } from '@projective/data';

// --- 1. Mock Data Generator (The "Sugar") ---
interface MockUser {
	id: string;
	name: string;
	email: string;
	role: 'Admin' | 'Editor' | 'Viewer';
	status: 'Active' | 'Inactive';
	joined: string;
}

const generateUsers = (count: number): MockUser[] => {
	return Array.from({ length: count }, (_, i) => ({
		id: `u-${i}`,
		name: `User ${i + 1}`,
		email: `user${i + 1}@projective.dev`,
		role: i % 10 === 0 ? 'Admin' : i % 3 === 0 ? 'Editor' : 'Viewer',
		status: i % 5 === 0 ? 'Inactive' : 'Active',
		joined: new Date(Date.now() - i * 10000000).toISOString().split('T')[0],
	}));
};

// --- 2. Configuration Definitions ---

// Table Columns
const columns: ColumnDef<MockUser>[] = [
	{ id: 'id', field: 'id', label: 'ID', width: 80, sortable: true },
	{ id: 'name', field: 'name', label: 'Name', width: 200, sortable: true },
	{ id: 'email', field: 'email', label: 'Email Address', width: 250, sortable: true },
	{ id: 'role', field: 'role', label: 'Role', width: 100, sortable: true },
	{
		id: 'status',
		field: 'status',
		label: 'Status',
		width: 100,
		sortable: true,
		align: 'center',
	},
	{
		id: 'joined',
		field: 'joined',
		label: 'Date Joined',
		width: 120,
		align: 'right',
		sortable: true,
	},
];

export default function ProjectsHome() {
	// --- State ---
	const [data] = useState(() => generateUsers(10000)); // Generate 10k items once
	const [mode, setMode] = useState<DisplayMode>('table');
	const [selectionMode, setSelectionMode] = useState<'single' | 'multi' | 'none'>('multi');
	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

	// --- Renderers ---

	// Used for List and Grid modes
	const renderCard = (user: MockUser) => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
			<div style={{ fontWeight: 'bold', fontSize: '14px' }}>{user.name}</div>
			<div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
			<div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
				<span
					style={{
						fontSize: '10px',
						padding: '2px 6px',
						borderRadius: '10px',
						backgroundColor: user.role === 'Admin' ? '#dbeafe' : '#f3f4f6',
						color: user.role === 'Admin' ? '#1e40af' : '#374151',
					}}
				>
					{user.role}
				</span>
				<span
					style={{
						fontSize: '10px',
						padding: '2px 6px',
						borderRadius: '10px',
						backgroundColor: user.status === 'Active' ? '#dcfce7' : '#fee2e2',
						color: user.status === 'Active' ? '#166534' : '#991b1b',
					}}
				>
					{user.status}
				</span>
			</div>
		</div>
	);

	return (
		<div
			style={{
				padding: '20px',
				fontFamily: 'sans-serif',
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
				gap: '20px',
				boxSizing: 'border-box',
				backgroundColor: '#f9fafb',
			}}
		>
			{/* --- Header / Controls --- */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					padding: '16px',
					backgroundColor: 'white',
					borderRadius: '8px',
					boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
				}}
			>
				<div>
					<h1 style={{ margin: 0, fontSize: '1.2rem' }}>Projective Data Display</h1>
					<p style={{ margin: '4px 0 0', color: '#666', fontSize: '0.9rem' }}>
						Loaded {data.length.toLocaleString()} items (Virtual Scrolled)
					</p>
				</div>

				<div style={{ display: 'flex', gap: '20px' }}>
					{/* View Mode Toggle */}
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						<label style={{ fontSize: '0.9rem', fontWeight: 600 }}>View:</label>
						<select
							value={mode}
							onChange={(e) => setMode(e.currentTarget.value as DisplayMode)}
							style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
						>
							<option value='table'>Table</option>
							<option value='grid'>Grid</option>
							<option value='list'>List</option>
						</select>
					</div>

					{/* Selection Mode Toggle */}
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						<label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Selection:</label>
						<select
							value={selectionMode}
							// deno-lint-ignore no-explicit-any
							onChange={(e) => setSelectionMode(e.currentTarget.value as any)}
							style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
						>
							<option value='single'>Single</option>
							<option value='multi'>Multi (Ctrl/Shift)</option>
							<option value='none'>None</option>
						</select>
					</div>
				</div>
			</div>

			{/* --- Main Display Area --- */}
			<div
				style={{
					flex: 1,
					backgroundColor: 'white',
					borderRadius: '8px',
					boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
					overflow: 'hidden', // Important for scroll pane
					border: '1px solid #e5e7eb',
				}}
			>
				<DataDisplay
					// Data
					dataSource={data}
					// Renderers
					renderItem={renderCard} // Used for Grid/List
					// Config
					mode={mode}
					columns={columns} // Used for Table
					gridColumns={4} // Used for Grid
					// Performance
					estimateHeight={mode === 'table' ? 40 : 80} // Hint helps physics
					// Interaction
					selectionMode={selectionMode}
					onSelectionChange={(keys) => setSelectedKeys(keys)}
				/>
			</div>

			{/* --- Footer / Feedback --- */}
			<div
				style={{
					padding: '12px',
					backgroundColor: 'white',
					borderRadius: '8px',
					fontSize: '0.9rem',
					borderTop: '4px solid #3b82f6',
				}}
			>
				<strong>Selection State:</strong>
				{selectedKeys.size === 0 ? <span style={{ color: '#999' }}>No items selected</span> : (
					<span>
						{selectedKeys.size} item{selectedKeys.size === 1 ? '' : 's'} selected (IDs:{' '}
						{Array.from(selectedKeys).slice(0, 5).join(', ')}
						{selectedKeys.size > 5 && '...'})
					</span>
				)}
			</div>
		</div>
	);
}
```

### File: apps\web\features\dashboard\projects\islands\ProjectsLayout.island.tsx

```tsx
// #region Imports
import '../styles/layouts/projects.css';
import { useEffect } from 'preact/hooks';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import { ProjectContext, ProjectProvider, useProjectContext } from '../contexts/ProjectContext.tsx';
import ProjectsSidebar from '../components/ProjectsSidebar.tsx';
// #endregion

// #region Interfaces
export interface ProjectsLayoutProps {
	projectId?: string;
	// deno-lint-ignore no-explicit-any
	children?: any;
}
// #endregion

// #region 1. Inner Layout (The Tunnel)
/**
 * This component sits inside the ProjectProvider, so it has access to the project state.
 * It grabs that state and explicitly passes it up to the Sidebar via NavigationContext.
 */
function ProjectsLayoutInner({ children }: { children: any }) {
	const { setMiddleNav } = useNavigationContext();
	const projectState = useProjectContext(); // Grab the local context state

	useEffect(() => {
		setMiddleNav({
			show: true,
			sideWidth: '280px',
			sideContent: (
				<ProjectContext.Provider value={projectState}>
					<ProjectsSidebar />
				</ProjectContext.Provider>
			),
		});

		return () => {
			setMiddleNav({
				show: false,
				sideContent: null,
			});
		};
	}, [projectState]);

	return (
		<div class='projects-layout'>
			{children}
		</div>
	);
}
// #endregion

// #region 2. Public Export
/**
 * The Island root creates the Provider locally.
 * This ensures the main body gets the context natively without mutating the global App tree.
 */
export default function ProjectsLayoutIsland({ projectId, children }: ProjectsLayoutProps) {
	return (
		<ProjectProvider id={projectId}>
			<ProjectsLayoutInner>
				{children}
			</ProjectsLayoutInner>
		</ProjectProvider>
	);
}
// #endregion
```

### File: apps\web\features\dashboard\projects\services\ProjectsService.ts

```ts
/**
 * @file ProjectsService.ts
 * @description Frontend Service layer for Project Dashboard interactions.
 * Handles API calls to /api/v1/dashboard/projects/*
 */

// #region Imports
// deno-lint-ignore-file no-explicit-any
import { ProjectDetails, ProjectsFilterParams } from '../contracts/Projects.ts';
import { getCsrfToken } from '@projective/utils'; // Assumed import path for your CSRF utility
// #endregion

export class ProjectsService {
	// #region Query Operations
	/**
	 * Fetches full details for a specific project.
	 */
	static async getProjectDetails(projectId: string): Promise<ProjectDetails> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}`);
		if (!res.ok) throw new Error(`Failed to fetch project: ${res.statusText}`);
		return (await res.json()) as ProjectDetails;
	}

	/**
	 * Fetches a list of dashboard projects based on filters.
	 */
	static async getDashboardProjects(params: ProjectsFilterParams): Promise<any> {
		const queryParams = new URLSearchParams(params as any).toString();
		const res = await fetch(`/api/v1/dashboard/projects?${queryParams}`);

		if (!res.ok) throw new Error(`Failed to fetch dashboard projects: ${res.statusText}`);
		return await res.json();
	}
	// #endregion

	// #region Mutations
	/**
	 * Creates a new project in a draft/scoping state.
	 */
	static async createProject(data: any, files?: { attachments?: File[] }): Promise<any> {
		const formData = new FormData();
		formData.append('payload', JSON.stringify(data));

		if (files?.attachments) {
			files.attachments.forEach((file) => {
				formData.append('attachments', file);
			});
		}

		const csrf = getCsrfToken();
		if (!csrf) console.warn('[Projective] CSRF token is missing from the client environment.');

		const res = await fetch(`/api/v1/dashboard/projects/new/publish`, {
			method: 'POST',
			headers: {
				'X-CSRF': csrf || '',
			},
			body: formData,
		});

		if (!res.ok) {
			const errData = await res.json().catch(() => ({}));
			throw new Error(errData.error?.message || `Failed to create project: ${res.statusText}`);
		}

		return await res.json();
	}

	/**
	 * Updates the project status (e.g., draft -> active)
	 */
	static async updateStatus(projectId: string, status: string): Promise<void> {
		const csrf = getCsrfToken();

		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/status`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRF': csrf || '',
			},
			body: JSON.stringify({ status }),
		});

		if (!res.ok) throw new Error(`Failed to update project status: ${res.statusText}`);
	}
	// #endregion

	/**
	 * Creates a new stage within an existing project.
	 */
	static async createStage(projectId: string, data: any): Promise<any> {
		const csrf = getCsrfToken();

		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/stages`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRF': csrf || '',
			},
			body: JSON.stringify(data),
		});

		if (!res.ok) {
			const errData = await res.json().catch(() => ({}));
			throw new Error(errData.error?.message || `Failed to create stage: ${res.statusText}`);
		}

		return await res.json();
	}
}
```

### File: apps\web\features\dashboard\projects\services\ProjectsServiceBackend.ts

```ts
/**
 * @file ProjectsServiceBackend.ts
 * @description Backend service layer for handling database interactions for Projects.
 */

// #region Imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.90.1';
import {
	Config,
	Deps,
	fail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
	supabaseClient,
} from '@projective/backend';
import { ProjectsFilterParams } from '../contracts/Projects.ts';
import { CreateProjectInput } from '../contracts/new/_validation.ts';
import { StoragePaths } from '@projective/types';
// #endregion

// #region Interfaces
export interface FileOptions {
	attachments?: File[];
}
// #endregion

// #region Helper Functions
/**
 * Extracts plain string text from a Quill Delta object for search indexing.
 * @param {any} delta The Quill Delta object containing an ops array.
 * @returns {string} The concatenated plain text.
 */
// deno-lint-ignore no-explicit-any
const extractTextFromDelta = (delta: any): string => {
	if (!delta) return '';

	let parsedDelta = delta;

	if (typeof delta === 'string') {
		try {
			parsedDelta = JSON.parse(delta);
		} catch {
			return delta;
		}
	}

	if (!parsedDelta || !Array.isArray(parsedDelta.ops)) {
		return typeof parsedDelta === 'string' ? parsedDelta : '';
	}

	return parsedDelta.ops
		.filter((op: any) => typeof op.insert === 'string')
		.map((op: any) => op.insert)
		.join('');
};
// #endregion

// #region Service Definition
export class ProjectsBackendService {
	/**
	 * Creates a new project, handles file quarantine uploads, and triggers the database RPC.
	 * Automatically extracts plain text from Quill Deltas for search indexing.
	 */
	static async createProject(
		data: CreateProjectInput,
		targetStatus: 'draft' | 'active',
		files: FileOptions = {},
		deps: Deps = {},
	): Promise<Result<{ projectId: string }>> {
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			const { data: { user }, error: authError } = await supabase.auth.getUser();
			if (authError || !user) {
				return fail('unauthorized', 'You must be signed in to create a project.', 401);
			}

			const projectId = crypto.randomUUID();
			const serviceRoleKey = Config.SUPABASE_SERVICE_ROLE_KEY;
			const supabaseUrl = Config.SUPABASE_URL;
			// deno-lint-ignore no-explicit-any
			let adminClient: any = null;

			if (files.attachments && files.attachments.length > 0) {
				if (!serviceRoleKey || !supabaseUrl) {
					console.error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL');
					return fail('server_error', 'Upload configuration missing', 500);
				}
				adminClient = createClient(supabaseUrl, serviceRoleKey, {
					auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
				});
			}

			const processFile = async (
				file: File,
				contextType: 'project_global_attachment',
				attachmentId?: string,
			): Promise<{ url?: string; id: string }> => {
				const fileId = attachmentId || crypto.randomUUID();
				const quarantinePath = `${crypto.randomUUID()}/${file.name}`;

				const { bucket: targetBucket, path: targetPath } = StoragePaths.generate(
					file.name,
					{ type: contextType, projectId, attachmentId: fileId },
				);

				const { error: dbError } = await supabase.schema('files').from('items').insert({
					id: fileId,
					owner_user_id: user.id,
					display_name: file.name,
					original_name: file.name,
					mime_type: file.type,
					size_bytes: file.size,
					bucket_id: 'quarantine',
					storage_path: quarantinePath,
					target_bucket: targetBucket,
					target_path: targetPath,
					status: 'pending_upload',
				});
				if (dbError) throw dbError;

				const { error: uploadError } = await supabase.storage
					.from('quarantine')
					.upload(quarantinePath, file, { contentType: file.type, upsert: false });
				if (uploadError) throw uploadError;

				const { error: scanError } = await adminClient.functions.invoke('scan-file', {
					body: { fileId },
				});
				if (scanError) throw scanError;

				let url;
				if (targetBucket === 'public_assets') {
					const { data: publicUrlData } = supabase
						.storage
						.from(targetBucket)
						.getPublicUrl(targetPath);
					url = publicUrlData.publicUrl;
				}

				return { url, id: fileId };
			};

			const attachment_ids: string[] = [];

			if (files.attachments && files.attachments.length > 0) {
				try {
					const uploads = await Promise.all(
						files.attachments.map((f) => processFile(f, 'project_global_attachment')),
					);
					attachment_ids.push(...uploads.map((u) => u.id));
				} catch (e) {
					console.error('Attachment upload failed:', e);
					return fail('server_error', 'Failed to upload attachments', 500);
				}
			}

			const existingAttachments = data.global_attachments || [];
			const finalAttachments = [...existingAttachments, ...attachment_ids];

			const projectDescriptionText = extractTextFromDelta(data.description);
			const stagesWithText = data.stages.map((stage) => ({
				...stage,
				description_text: extractTextFromDelta(stage.description),
				skills: Array.isArray(stage.skills) ? stage.skills : [],
			}));

			// Construct a clean, perfectly flat mapping that matches the RPC explicit requirements
			// deno-lint-ignore no-explicit-any
			const rawData = data as any;
			const legalData = rawData.legal_and_screening || {};

			// Helper to ensure lists resolve as arrays for the PostgreSQL text[] mapper
			// deno-lint-ignore no-explicit-any
			const arrayify = (val: any) => Array.isArray(val) ? val : (val ? [val] : []);

			const rpcPayload = {
				id: projectId,
				title: rawData.title,
				description: rawData.description,
				description_text: projectDescriptionText,
				format: rawData.format,
				industry_category_id: rawData.industry_category_id || rawData.category || null,
				visibility: rawData.visibility || 'public',
				currency: rawData.currency || 'USD',
				timeline_preset: rawData.timeline_preset || rawData.timelinePreset || 'sequential',
				target_project_start_date: rawData.target_project_start_date || rawData.targetStartDate ||
					null,

				// Flatten the nested frontend legal data directly to Postgres column names
				ip_ownership_mode: legalData.ip_ownership_mode || rawData.ipMode || 'exclusive_transfer',
				nda_required: legalData.nda_required === 'true' || legalData.nda_required === true ||
					rawData.ndaRequired === 'true' || rawData.ndaRequired === true || false,
				portfolio_display_rights: legalData.portfolio_display_rights || rawData.portfolioRights ||
					'allowed',
				location_restriction: arrayify(
					legalData.location_restriction || rawData.locationRestriction,
				),
				language_requirement: arrayify(
					legalData.language_requirement || rawData.languageRequirement,
				),
				screening_questions: legalData.screening_questions || rawData.screeningQuestions || [],

				stages: stagesWithText,
				global_attachments: finalAttachments,
			};

			const { data: _rpcResultId, error: rpcError } = await supabase
				.schema('projects')
				.rpc('create_project', { payload: rpcPayload });

			if (rpcError) {
				const n = normaliseSupabaseError(rpcError);
				return fail(n.code, n.message, n.status);
			}

			if (targetStatus === 'active') {
				const { error: updateError } = await supabase
					.schema('projects')
					.from('projects')
					.update({ status: 'active' })
					.eq('id', projectId);

				if (updateError) {
					const n = normaliseSupabaseError(updateError);
					return fail('partial_error', `Project saved but failed to publish: ${n.message}`, 500);
				}
			}

			return ok({ projectId });
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}

	static async getProject(
		project_id: string,
		deps: Deps = {},
		// deno-lint-ignore no-explicit-any
	): Promise<Result<any>> {
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			const { data, error } = await supabase
				.schema('projects')
				.rpc('get_project_details', { p_project_id: project_id })
				.single();

			if (error) {
				console.error('getProject RPC Error:', error);
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, n.status);
			}

			return ok(data);
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}

	static async getDashboardProjects(
		params: ProjectsFilterParams,
		deps: Deps = {},
		// deno-lint-ignore no-explicit-any
	): Promise<Result<any>> {
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			const { data, error } = await supabase.schema('projects').rpc('get_dashboard_projects', {
				p_category: params.category ?? 'all',
				p_category_id: params.categoryId ?? null,
				p_search_query: params.search ?? '',
				p_sort_by: params.sortBy ?? 'last_updated',
				p_sort_dir: params.sortDir ?? 'desc',
				p_limit: params.limit ?? 20,
				p_offset: params.offset ?? 0,
			});

			if (error) {
				console.error('RPC Error:', error);
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, n.status);
			}

			return ok(data);
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}

	static async getStage(
		project_id: string,
		stage_id: string,
		deps: Deps = {},
		// deno-lint-ignore no-explicit-any
	): Promise<Result<any>> {
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			const { data, error } = await supabase
				.schema('projects')
				.rpc('get_stage_details', {
					p_project_id: project_id,
					p_stage_id: stage_id,
				})
				.single();

			if (error) {
				console.error('getStage RPC Error:', error);
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, n.status);
			}

			return ok(data);
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}

	/**
	 * Creates a new stage within an existing project and appends it to the correct sort order.
	 */
	static async createStage(
		projectId: string,
		// deno-lint-ignore no-explicit-any
		data: any,
		deps: Deps = {},
	): Promise<Result<{ stageId: string }>> {
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			// 1. Identify current highest sort_order
			const { data: stages, error: sortError } = await supabase
				.schema('projects')
				.from('project_stages')
				.select('sort_order')
				.eq('project_id', projectId)
				.order('sort_order', { ascending: false })
				.limit(1);

			if (sortError) throw sortError;
			const nextSortOrder = (stages?.[0]?.sort_order ?? -1) + 1;

			// 2. Process Rich Text Delta
			const descriptionText = extractTextFromDelta(data.description);

			// 3. Insert Stage
			const insertData = {
				project_id: projectId,
				name: data.name,
				description: data.description || {},
				description_text: descriptionText,
				sort_order: nextSortOrder,
				file_upload_required: !!data.file_upload_required,
				default_tasks: data.default_tasks || [],
				skills: data.skills || [],
				fixed_start_date: data.start_date || null,
				file_due_date: data.end_date || null,
				ip_ownership_override: data.ip_ownership_override || null,
				status: 'open',
			};

			const { data: newStage, error } = await supabase
				.schema('projects')
				.from('project_stages')
				.insert(insertData)
				.select('id')
				.single();

			if (error) {
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, n.status);
			}

			return ok({ stageId: newStage.id });
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}
}
// #endregion
```

### File: apps\web\features\dashboard\projects\services\StagesService.ts

```ts
/**
 * @file StagesService.ts
 * @description Frontend Service layer for Project Stages.
 */
// deno-lint-ignore-file no-explicit-any
import { getCsrfToken } from '@projective/utils';

export class StagesService {
	static async createStage(projectId: string, data: any): Promise<any> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/stages`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error(`Failed to create stage: ${res.statusText}`);
		return await res.json();
	}

	static async updateStage(projectId: string, stageId: string, data: any): Promise<any> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/stages/${stageId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error(`Failed to update stage: ${res.statusText}`);
		return await res.json();
	}

	static async reorderStages(projectId: string, orderedStageIds: string[]): Promise<void> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/stages/reorder`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
			body: JSON.stringify({ orderedIds: orderedStageIds }),
		});
		if (!res.ok) throw new Error(`Failed to reorder stages: ${res.statusText}`);
	}

	static async deleteStage(projectId: string, stageId: string): Promise<void> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/stages/${stageId}`, {
			method: 'DELETE',
			headers: { 'X-CSRF': getCsrfToken() || '' },
		});
		if (!res.ok) throw new Error(`Failed to delete stage: ${res.statusText}`);
	}
}
```

### File: apps\web\features\dashboard\projects\services\StagesServiceBackend.ts

```ts
/**
 * @file StagesServiceBackend.ts
 * @description Backend service layer for Stage operations.
 */
import { supabaseClient } from '@projective/backend';

export class StagesServiceBackend {
	static async createStage(projectId: string, data: any) {
		const supabase = await supabaseClient();

		// 1. Find the highest sort_order
		const { data: stages } = await supabase
			.schema('projects')
			.from('project_stages')
			.select('sort_order')
			.eq('project_id', projectId)
			.order('sort_order', { ascending: false })
			.limit(1);

		const nextSortOrder = (stages?.[0]?.sort_order ?? -1) + 1;

		// 2. Insert
		const { data: newStage, error } = await supabase
			.schema('projects')
			.from('project_stages')
			.insert({
				project_id: projectId,
				name: data.name,
				sort_order: nextSortOrder,
				// ... map other stage fields ...
			})
			.select()
			.single();

		if (error) throw error;
		return newStage;
	}

	static async reorderStages(projectId: string, orderedIds: string[]) {
		const supabase = await supabaseClient();
		// Supabase doesn't support bulk upsert easily with standard clients without an RPC.
		// For safety, iterate and update.
		for (let i = 0; i < orderedIds.length; i++) {
			await supabase
				.schema('projects')
				.from('project_stages')
				.update({ sort_order: i })
				.eq('id', orderedIds[i])
				.eq('project_id', projectId);
		}
		return { success: true };
	}

	static async deleteStage(projectId: string, stageId: string) {
		const supabase = await supabaseClient();

		// 1. Release escrow for any tickets CURRENTLY in this stage
		const { data: activeTickets } = await supabase
			.schema('projects')
			.from('tickets')
			.select('id, current_assignee_id')
			.eq('current_stage_id', stageId)
			.not('current_assignee_id', 'is', null);

		if (activeTickets && activeTickets.length > 0) {
			// Trigger Finance Escrow Release Logic Here
			// e.g., FinanceServiceBackend.releaseEscrows(activeTickets.map(t => t.id));
		}

		// 2. Remove this stage from the JSONB required_stages array of ALL tickets in the project
		// Note: In production, this is best done via a Postgres Trigger or RPC function for performance.

		// 3. Delete the stage
		const { error } = await supabase
			.schema('projects')
			.from('project_stages')
			.delete()
			.eq('id', stageId)
			.eq('project_id', projectId);

		if (error) throw error;
		return { success: true };
	}
}
```

### File: apps\web\features\dashboard\projects\services\TicketsService.ts

```ts
/**
 * @file TicketsService.ts
 * @description Frontend Service layer for Tickets.
 */
// deno-lint-ignore-file no-explicit-any
import { getCsrfToken } from '@projective/utils';

export class TicketsService {
	static async createTicket(
		projectId: string,
		data: any,
	): Promise<any> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/tickets`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
			body: JSON.stringify(data),
		});

		if (!res.ok) {
			const errData = await res.json().catch(() => ({}));
			const msg = errData.details
				? JSON.stringify(errData.details)
				: (errData.error?.message || errData.error || res.statusText);

			throw new Error(msg);
		}

		return await res.json();
	}

	static async updateTicket(projectId: string, ticketId: string, data: any): Promise<any> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/tickets/${ticketId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
			body: JSON.stringify(data),
		});
		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || `Failed to update ticket`);
		}
		return await res.json();
	}

	static async deleteTicket(projectId: string, ticketId: string): Promise<void> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/tickets/${ticketId}`, {
			method: 'DELETE',
			headers: { 'X-CSRF': getCsrfToken() || '' },
		});
		if (!res.ok) throw new Error(`Failed to delete ticket`);
	}

	static async reportTicketWorkload(
		projectId: string,
		ticketId: string,
		reason: string,
	): Promise<void> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/tickets/${ticketId}/report`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
			body: JSON.stringify({ reason }),
		});
		if (!res.ok) throw new Error(`Failed to report ticket`);
	}

	static async purchaseTicket(
		projectId: string,
		ticketId: string,
		method: 'buy_now' | 'basket' | 'invoice',
	): Promise<any> {
		const res = await fetch(
			`/api/v1/dashboard/projects/${projectId}/tickets/${ticketId}/purchase`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
				body: JSON.stringify({ method }),
			},
		);
		if (!res.ok) throw new Error(`Failed to purchase ticket. Ensure description is provided.`);
		return await res.json();
	}
}
```

### File: apps\web\features\dashboard\projects\services\TicketsServiceBackend.ts

```ts
/**
 * @file TicketsServiceBackend.ts
 * @description Backend service layer for Ticket operations.
 */
import { supabaseClient } from '@projective/backend';

export class TicketsServiceBackend {
	static async createTicket(projectId: string, data: { title: string; description?: any }) {
		const supabase = await supabaseClient();

		const { data: newTicket, error } = await supabase
			.schema('projects')
			.from('tickets')
			.insert({
				project_id: projectId,
				title: data.title,
				description: data.description || {},
				status: 'backlog',
				// Purchase blocked flags can be computed fields: if description == {}, purchasable = false
			})
			.select()
			.single();

		if (error) throw error;
		return newTicket;
	}

	static async updateTicket(projectId: string, ticketId: string, data: any) {
		const supabase = await supabaseClient();

		// 1. Check if claimed
		const { data: currentTicket } = await supabase
			.schema('projects')
			.from('tickets')
			.select('current_assignee_id')
			.eq('id', ticketId)
			.single();

		if (currentTicket?.current_assignee_id) {
			throw new Error('Cannot edit a ticket that has already been claimed by a freelancer.');
		}

		// 2. Update
		const { data: updated, error } = await supabase
			.schema('projects')
			.from('tickets')
			.update({
				...data,
				updated_at: new Date().toISOString(),
			})
			.eq('id', ticketId)
			.select()
			.single();

		if (error) throw error;
		return updated;
	}

	static async deleteTicket(projectId: string, ticketId: string) {
		const supabase = await supabaseClient();

		const { data: ticket } = await supabase
			.schema('projects')
			.from('tickets')
			.select('current_assignee_id, status')
			.eq('id', ticketId)
			.single();

		if (ticket?.current_assignee_id) {
			// Freelancer has claimed it. Delete releases escrow to Freelancer.
			// Client's payment has already been taken out, so they don't get a refund here.
			// await FinanceServiceBackend.releaseTicketEscrowToFreelancer(ticketId);
		} else {
			// Ticket not claimed. Delete and potentially refund/void invoice.
			// await FinanceServiceBackend.refundTicketEscrow(ticketId);
		}

		const { error } = await supabase.schema('projects').from('tickets').delete().eq('id', ticketId);
		if (error) throw error;
		return { success: true };
	}

	static async reportTicket(projectId: string, ticketId: string) {
		const supabase = await supabaseClient();

		// Sets a dispute flag that hides it from the UI for 48 hours
		const { error } = await supabase
			.schema('projects')
			.from('tickets')
			.update({
				status: 'disputed', // or custom flag 'workload_dispute_active: true'
				// update internal timestamp for 48hr penalty timer
			})
			.eq('id', ticketId);

		if (error) throw error;
		return { success: true };
	}

	static async purchaseTicket(projectId: string, ticketId: string, method: string) {
		const supabase = await supabaseClient();

		// 1. Verify description exists
		const { data: ticket } = await supabase
			.schema('projects')
			.from('tickets')
			.select('description')
			.eq('id', ticketId)
			.single();

		if (!ticket?.description || Object.keys(ticket.description).length === 0) {
			throw new Error('A detailed description is required before purchasing a ticket.');
		}

		// 2. Route to finance mechanisms (Basket / Buy Now / Invoice)
		// await FinanceServiceBackend.initiateTicketPurchase(ticketId, method);

		return { success: true, method };
	}
}
```

### File: packages\fields\deno.json

```json
{
	"name": "@projective/fields",
	"version": "0.0.0",
	"exports": "./mod.ts",
	"tasks": {
		"check": "deno fmt --check && deno lint && deno check mod.ts"
	},
	"compilerOptions": {
		"jsx": "react-jsx",
		"jsxImportSource": "preact"
	}
}
```

### File: packages\fields\mod.ts

```ts
// Types
export * from './src/types/core.ts';
export * from './src/types/components/select-field.ts';

// Wrappers
export * from './src/wrappers/LabelWrapper.tsx';
export * from './src/wrappers/AdornmentWrapper.tsx';
export * from './src/wrappers/SkeletonWrapper.tsx';
export * from './src/wrappers/MessageWrapper.tsx';
export * from './src/wrappers/EffectWrapper.tsx';
export * from './src/wrappers/FieldArrayWrapper.tsx';

// Hooks
export * from './src/hooks/useInteraction.ts';
export * from './src/hooks/useCurrencyMask.ts';
export * from './src/hooks/useGlobalDrag.ts';

// Components
export * from './src/components/TextField.tsx';
export * from './src/components/SelectField.tsx';
export * from './src/components/SliderField.tsx';
export * from './src/components/DateField.tsx';
export * from './src/components/TimeField.tsx';
export * from './src/components/FileDrop.tsx';
export * from './src/components/TagInput.tsx';
export * from './src/components/MoneyField.tsx';
export * from './src/components/ComboboxField.tsx';
export * from './src/components/DateTimeField.tsx';
export * from './src/components/RichTextField.tsx';
export * from './src/components/datetime/Calendar.tsx';
export * from './src/components/datetime/TimeClock.tsx';

export * from './src/components/HelpTooltip.tsx';
```

### File: packages\fields\src\components\ComboboxField.tsx

```tsx
import '../styles/fields/combobox-field.css';
import { JSX } from 'preact';
import { computed, Signal, useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { ComboboxFieldProps } from '../types/components/combobox-field.ts';
import { SelectOption } from '../types/components/select-field.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { EffectWrapper } from '../wrappers/EffectWrapper.tsx';

export function ComboboxField<T = string>(props: ComboboxFieldProps<T>) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		options,
		error,
		disabled,
		placeholder,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
	} = props;

	const containerRef = useRef<HTMLDivElement>(null);
	const menuPosition = useSignal<'down' | 'up'>('down');
	const interaction = useInteraction(
		value instanceof Signal ? value.value : value,
	);
	const isOpen = useSignal(false);
	const inputValue = useSignal('');

	const isValueSignal = value instanceof Signal;
	const internalSignal = useSignal(
		isValueSignal ? value.peek() : (value ?? defaultValue),
	);

	if (!isValueSignal && value !== undefined && value !== internalSignal.peek()) {
		internalSignal.value = value;
	}

	const signalValue = isValueSignal ? value : internalSignal;
	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = error instanceof Signal ? error.value : error;

	if (signalValue.value && !inputValue.value) {
		const selected = options.find((opt) => opt.value === signalValue.value);
		if (selected) {
			inputValue.value = selected.label;
		}
	}

	const filteredOptions = computed(() => {
		const term = inputValue.value.toLowerCase();
		return options.filter((opt) => opt.label.toLowerCase().includes(term));
	});

	// --- Positioning Logic ---
	useEffect(() => {
		if (isOpen.value && containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const spaceBelow = globalThis.innerHeight - rect.bottom;
			menuPosition.value = spaceBelow < 250 ? 'up' : 'down';
		}
	}, [isOpen.value]);

	const handleInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
		inputValue.value = e.currentTarget.value;
		isOpen.value = true;
	};

	const handleOptionClick = (option: SelectOption<T>) => {
		if (option.disabled) return;

		if (isValueSignal) {
			(value as Signal<T>).value = option.value;
		} else {
			internalSignal.value = option.value;
		}
		inputValue.value = option.label;
		onChange?.(option.value);
		isOpen.value = false;
	};

	return (
		<div
			className={`field-combobox ${className || ''} ${
				menuPosition.value === 'up' ? 'field-combobox--up' : ''
			}`}
			style={style}
			ref={containerRef}
		>
			<div
				className={[
					'field-combobox__container',
					interaction.focused.value &&
					'field-combobox__container--focused',
					errorMessage && 'field-combobox__container--error',
					isDisabled && 'field-combobox__container--disabled',
				].filter(Boolean).join(' ')}
			>
				<EffectWrapper
					focused={interaction.focused}
					disabled={isDisabled}
				/>

				<input
					id={id}
					className='field-combobox__input'
					value={inputValue.value}
					onInput={handleInput}
					onFocus={(e) => {
						interaction.handleFocus(e);
						isOpen.value = true;
					}}
					onBlur={(e) => {
						setTimeout(() => {
							isOpen.value = false;
							interaction.handleBlur(e);
						}, 200);
					}}
					disabled={!!isDisabled}
					placeholder={placeholder}
				/>

				<div
					className={`field-combobox__menu ${
						isOpen.value && filteredOptions.value.length > 0 ? 'field-combobox__menu--open' : ''
					}`}
				>
					{filteredOptions.value.map((option) => (
						<div
							key={String(option.value)}
							className={[
								'field-combobox__option',
								option.value === signalValue.value &&
								'field-combobox__option--selected',
								option.disabled &&
								'field-combobox__option--disabled',
							].filter(Boolean).join(' ')}
							onMouseDown={(e) => {
								e.preventDefault();
								handleOptionClick(option);
							}}
						>
							{option.label}
						</div>
					))}
					{filteredOptions.value.length === 0 && (
						<div
							className='field-combobox__option'
							style={{
								cursor: 'default',
								color: 'var(--field-text-disabled)',
							}}
						>
							No options found
						</div>
					)}
				</div>
			</div>

			<LabelWrapper
				id={id}
				label={label}
				active={interaction.focused.value || !!inputValue.value ||
					!!placeholder}
				error={!!errorMessage}
				disabled={isDisabled}
				required={required}
				floating={floating}
				position={position}
				floatingRule={floatingRule}
			/>

			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}
```

### File: packages\fields\src\components\DateField.tsx

```tsx
import '../styles/fields/date-field.css';
import { computed, Signal, useSignal } from '@preact/signals';
import { DateFieldProps, DateValue } from '../types/components/date-field.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { useFieldState } from '../hooks/useFieldState.ts';
import { AdornmentWrapper } from '../wrappers/AdornmentWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { DateTime } from '@projective/types';
import { Popover } from '@projective/ui';
import { Calendar } from './datetime/Calendar.tsx';
import { TextField } from './TextField.tsx';
import { IconCalendar } from '@tabler/icons-preact';

export function DateField(props: DateFieldProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		minDate,
		maxDate,
		format = 'yyyy-MM-dd',
		error,
		disabled,
		prefix,
		suffix,
		onPrefixClick,
		onSuffixClick,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
		variant = 'popup', // Default to existing behavior
		selectionMode = 'single',
		modifiers,
	} = props;

	const fieldState = useFieldState({
		value,
		defaultValue,
		required,
		disabled,
		error,
		onChange,
	});

	const interaction = useInteraction(fieldState.value.value);
	const isOpen = useSignal(false);

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = fieldState.error.value;

	// Computed string value for the input display
	const displayValue = computed(() => {
		const val = fieldState.value.value;
		if (!val) return '';

		if (Array.isArray(val)) {
			// Range
			if (selectionMode === 'range' && val.length === 2) {
				const start = val[0] ? val[0].toFormat(format) : '...';
				const end = val[1] ? val[1].toFormat(format) : '...';
				return `${start} - ${end}`;
			}
			// Multiple
			if (selectionMode === 'multiple') {
				return `${val.length} dates selected`;
			}
		}
		// Single
		if (val instanceof DateTime) return val.toFormat(format);

		return '';
	});

	const handleDateSelect = (date: DateValue) => {
		fieldState.setValue(date);

		// Auto-close popover rules:
		// Single: Close on select
		// Range: Close if both start/end selected? Maybe keep open for adjustments.
		// Multiple: Keep open.
		if (selectionMode === 'single') {
			isOpen.value = false;
			interaction.handleBlur();
		}
	};

	// --- Render Logic Based on Variant ---

	if (variant === 'inline') {
		return (
			<div
				className={`field-date field-date--inline ${className || ''}`}
				style={style}
			>
				<Calendar
					value={fieldState.value.value}
					onChange={handleDateSelect}
					min={minDate}
					max={maxDate}
					selectionMode={selectionMode}
					modifiers={modifiers}
					className='field-date__calendar--inline'
				/>
				<MessageWrapper
					error={error}
					hint={hint}
					warning={warning}
					info={info}
				/>
			</div>
		);
	}

	// Default: Popup Mode
	return (
		<div className={`field-date ${className || ''}`} style={style}>
			<Popover
				isOpen={isOpen.value}
				onClose={() => {
					isOpen.value = false;
					interaction.handleBlur();
				}}
				// Forward position prop if we want manual control, otherwise let Popover auto-flip
				trigger={
					<div
						onClick={() => !isDisabled && (isOpen.value = !isOpen.value)}
					>
						<TextField
							id={id}
							label={label}
							value={displayValue.value}
							placeholder={format.toUpperCase()}
							error={errorMessage}
							disabled={isDisabled}
							required={required}
							floating={floating}
							position={position}
							floatingRule={floatingRule}
							readonly // Prevent manual typing for complex modes for now
							suffix={
								<AdornmentWrapper
									position='suffix'
									onClick={(e) => {
										e.stopPropagation();
										!isDisabled &&
											(isOpen.value = !isOpen.value);
									}}
								>
									{suffix || <IconCalendar size={18} />}
								</AdornmentWrapper>
							}
							prefix={prefix}
							onPrefixClick={onPrefixClick}
							onFocus={interaction.handleFocus}
							onBlur={() => {}}
						/>
					</div>
				}
				content={
					<Calendar
						value={fieldState.value.value}
						onChange={handleDateSelect}
						min={minDate}
						max={maxDate}
						selectionMode={selectionMode}
						modifiers={modifiers}
					/>
				}
			/>
			<MessageWrapper
				error={error}
				hint={hint}
				warning={warning}
				info={info}
			/>
		</div>
	);
}
```

### File: packages\fields\src\components\datetime\Calendar.tsx

```tsx
/* #region Imports */
import '../../styles/components/calendar.css';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';
import { DateTime } from '@projective/types';
import { DateModifiers, DateSelectionMode, DateValue } from '../../types/components/date-field.ts';
/* #endregion */

export interface CalendarProps {
	value?: DateValue;
	onChange?: (date: any) => void;
	min?: DateTime;
	max?: DateTime;
	startOfWeek?: 0 | 1;
	selectionMode?: DateSelectionMode;
	modifiers?: DateModifiers;
	className?: string;
}

type CalendarScope = 'day' | 'month' | 'year';

export function Calendar(props: CalendarProps) {
	const {
		value,
		onChange,
		min,
		max,
		startOfWeek = 1,
		selectionMode = 'single',
		modifiers = {},
		className,
	} = props;

	// #region State
	const viewDate = useSignal(new DateTime());
	const scope = useSignal<CalendarScope>('day');

	// Sync internal viewDate with the selected value on mount
	useEffect(() => {
		if (value) {
			if (value instanceof DateTime) {
				viewDate.value = value;
			} else if (Array.isArray(value) && value.length > 0) {
				const start = value[0];
				if (start) viewDate.value = start;
			}
		}
	}, []);
	// #endregion

	// #region Logic Helpers
	const isDateDisabled = (date: DateTime) => {
		if (min && date.isBefore(min.startOf('day'))) return true;
		if (max && date.isAfter(max.endOf('day'))) return true;
		return modifiers.disabled?.(date) ?? false;
	};

	// Helper to set date parts (since DateTime is immutable)
	const setDatePart = (base: DateTime, unit: 'month' | 'year', val: number) => {
		const d = new Date(base.getTime());
		if (unit === 'month') d.setMonth(val);
		if (unit === 'year') d.setFullYear(val);
		return new DateTime(d);
	};

	// --- Grid Generators ---
	const getCalendarGrid = (currentDate: DateTime, weekStart: 0 | 1) => {
		const startOfMonth = currentDate.startOf('month');
		const startDay = startOfMonth.getDay();

		let lead = startDay - weekStart;
		if (lead < 0) lead += 7;

		const startDate = startOfMonth.minus(lead, 'days');
		const grid = [];

		for (let i = 0; i < 42; i++) {
			const d = startDate.add(i, 'days');
			grid.push({
				date: d,
				isCurrentMonth: d.getMonth() === currentDate.getMonth(),
				isToday: d.isSameDay(DateTime.today()),
			});
		}
		return grid;
	};

	const getWeekLabels = (weekStart: 0 | 1) => {
		const base = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		if (weekStart === 1) {
			const sun = base.shift();
			base.push(sun!);
		}
		return base;
	};
	// #endregion

	// #region Handlers
	const handlePrev = (e: Event) => {
		e.stopPropagation();
		// FIX: Use plural units ('months', 'years') to match DateTime.ts
		if (scope.value === 'day') viewDate.value = viewDate.value.minus(1, 'months');
		else if (scope.value === 'month') viewDate.value = viewDate.value.minus(1, 'years');
		else if (scope.value === 'year') viewDate.value = viewDate.value.minus(10, 'years');
	};

	const handleNext = (e: Event) => {
		e.stopPropagation();
		// FIX: Use plural units ('months', 'years') to match DateTime.ts
		if (scope.value === 'day') viewDate.value = viewDate.value.add(1, 'months');
		else if (scope.value === 'month') viewDate.value = viewDate.value.add(1, 'years');
		else if (scope.value === 'year') viewDate.value = viewDate.value.add(10, 'years');
	};

	const handleTitleClick = (e: Event) => {
		e.stopPropagation();
		if (scope.value === 'day') scope.value = 'month';
		else if (scope.value === 'month') scope.value = 'year';
	};

	const handleDaySelect = (date: DateTime) => {
		if (selectionMode === 'single') {
			onChange?.(date);
		}
	};

	const handleMonthSelect = (monthIndex: number) => {
		viewDate.value = setDatePart(viewDate.value, 'month', monthIndex);
		scope.value = 'day';
	};

	const handleYearSelect = (year: number) => {
		viewDate.value = setDatePart(viewDate.value, 'year', year);
		scope.value = 'month';
	};
	// #endregion

	// #region Renderers
	const renderHeader = () => {
		let title = '';
		if (scope.value === 'day') title = viewDate.value.toFormat('MMMM yyyy');
		else if (scope.value === 'month') title = viewDate.value.toFormat('yyyy');
		else {
			const startYear = Math.floor(viewDate.value.getYear() / 10) * 10;
			title = `${startYear} - ${startYear + 9}`;
		}

		return (
			<div className='calendar__header'>
				<button type='button' className='calendar__nav-btn' onClick={handlePrev}>
					<IconChevronLeft size={18} />
				</button>
				<button type='button' className='calendar__title' onClick={handleTitleClick}>
					{title}
				</button>
				<button type='button' className='calendar__nav-btn' onClick={handleNext}>
					<IconChevronRight size={18} />
				</button>
			</div>
		);
	};

	const renderDays = () => {
		const grid = getCalendarGrid(viewDate.value, startOfWeek);
		const weekLabels = getWeekLabels(startOfWeek);

		return (
			<>
				<div className='calendar__weekdays'>
					{weekLabels.map((day) => <div key={day} className='calendar__weekday'>{day}</div>)}
				</div>
				<div className='calendar__grid calendar__grid--days'>
					{grid.map((dayItem, idx) => {
						const isDisabled = isDateDisabled(dayItem.date);
						let isSelected = false;
						if (value instanceof DateTime) isSelected = value.isSameDay(dayItem.date);

						const classes = [
							'calendar__day',
							isDisabled ? 'calendar__day--disabled' : '',
							!dayItem.isCurrentMonth ? 'calendar__day--muted' : '',
							dayItem.isToday ? 'calendar__day--today' : '',
							isSelected ? 'calendar__day--selected' : '',
						].filter(Boolean).join(' ');

						return (
							<button
								key={idx}
								type='button'
								className={classes}
								disabled={isDisabled}
								onClick={(e) => {
									e.stopPropagation();
									handleDaySelect(dayItem.date);
								}}
							>
								{dayItem.date.getDate()}
							</button>
						);
					})}
				</div>
			</>
		);
	};

	const renderMonths = () => {
		const months = Array.from({ length: 12 }, (_, i) => {
			const d = new DateTime(new Date(2000, i, 1));
			return d.toFormat('MMM');
		});

		const currentMonth = viewDate.value.getMonth() - 1;

		return (
			<div className='calendar__grid calendar__grid--months'>
				{months.map((m, idx) => (
					<button
						key={m}
						type='button'
						className={`calendar__cell-lg ${
							idx === currentMonth ? 'calendar__cell-lg--selected' : ''
						}`}
						onClick={(e) => {
							e.stopPropagation();
							handleMonthSelect(idx);
						}}
					>
						{m}
					</button>
				))}
			</div>
		);
	};

	const renderYears = () => {
		const currentYear = viewDate.value.getYear();
		const startYear = Math.floor(currentYear / 10) * 10;
		const years = Array.from({ length: 12 }, (_, i) => startYear - 1 + i);

		return (
			<div className='calendar__grid calendar__grid--years'>
				{years.map((y) => (
					<button
						key={y}
						type='button'
						className={`calendar__cell-lg ${
							y === currentYear ? 'calendar__cell-lg--selected' : ''
						} ${y < startYear || y > startYear + 9 ? 'calendar__day--muted' : ''}`}
						onClick={(e) => {
							e.stopPropagation();
							handleYearSelect(y);
						}}
					>
						{y}
					</button>
				))}
			</div>
		);
	};
	// #endregion

	return (
		<div className={`calendar ${className || ''}`}>
			{renderHeader()}
			<div className='calendar__body'>
				{scope.value === 'day' && renderDays()}
				{scope.value === 'month' && renderMonths()}
				{scope.value === 'year' && renderYears()}
			</div>
		</div>
	);
}
```

### File: packages\fields\src\components\datetime\TimeClock.tsx

```tsx
import '../../styles/components/time-clock.css';
import { useSignal } from '@preact/signals';
import { useRef } from 'preact/hooks';
import { DateTime } from '@projective/types';
import { getAngleValue, getPosition } from '@projective/utils';

export type TimeSelectionMode = 'single' | 'multiple';

interface TimeClockProps {
	value?: DateTime | DateTime[];
	onChange?: (date: any) => void;
	selectionMode?: TimeSelectionMode;
}

type ViewMode = 'hours' | 'minutes';

export function TimeClock(props: TimeClockProps) {
	const { value, onChange, selectionMode = 'single' } = props;

	// Helper to get the primary "view" date (for header display)
	const getPrimaryDate = () => {
		if (Array.isArray(value)) {
			return value.length > 0 ? value[value.length - 1] : new DateTime();
		}
		return value || new DateTime();
	};

	const displayDate = getPrimaryDate();

	// State
	const mode = useSignal<ViewMode>('hours');
	const isPm = useSignal(displayDate.getHour() >= 12);
	const isDragging = useSignal(false);
	const clockRef = useRef<HTMLDivElement>(null);

	// Display values
	const hours12 = displayDate.getHour() % 12 || 12;
	const minutes = displayDate.getMinute();

	// --- Handlers ---

	const updateValue = (newDate: DateTime, isFinish: boolean) => {
		let result: any;

		if (selectionMode === 'single') {
			result = newDate;
		} else {
			// Multi-select logic
			const current = (Array.isArray(value) ? value : (value ? [value] : [])) as DateTime[];

			// Check if we are toggling an existing time
			// We compare based on the current mode (Hour match or Minute match)
			// Simplification: For multi-time, we usually just add the new timestamp.
			// However, UX for multi-time on a clock is tricky.
			// We will assume "Add/Update" logic.

			// For this implementation, we replace the last entry if dragging,
			// or add new if clicking fresh?
			// To keep it simple: Multi-mode on a clock usually implies picking slots.
			// We will append if it doesn't exist, remove if it does (Toggle).

			// Check for exact hour/minute match in current array
			const existsIndex = current.findIndex((d) =>
				d.getHour() === newDate.getHour() && d.getMinute() === newDate.getMinute()
			);

			if (existsIndex >= 0) {
				if (isFinish) {
					// Toggle off on release
					result = current.filter((_, i) => i !== existsIndex);
				} else {
					result = current; // Don't toggle while dragging
				}
			} else {
				result = [...current, newDate];
			}
		}

		onChange?.(result);

		// Auto-switch to minutes only in single mode
		if (isFinish && mode.value === 'hours' && selectionMode === 'single') {
			mode.value = 'minutes';
		}
	};

	const handlePointer = (e: PointerEvent, isFinish: boolean) => {
		if (!clockRef.current) return;

		const rect = clockRef.current.getBoundingClientRect();
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const x = e.clientX - rect.left - centerX;
		const y = e.clientY - rect.top - centerY;

		const steps = mode.value === 'hours' ? 12 : 60;
		let val = getAngleValue(x, y, steps);

		// Calculate new date based on primary
		const d = new Date(displayDate.getTime());

		if (mode.value === 'hours') {
			if (isPm.value && val < 12) val += 12;
			if (!isPm.value && val === 12) val = 0;
			d.setHours(val);
		} else {
			d.setMinutes(val);
		}

		const newDateTime = new DateTime(d);
		updateValue(newDateTime, isFinish);
	};

	const toggleAmPm = (pm: boolean) => {
		isPm.value = pm;
		// Update ALL selected dates or just display?
		// Usually AM/PM toggles the context for future clicks.
		// For single value, we update immediately.
		if (selectionMode === 'single') {
			let h = displayDate.getHour();
			if (pm && h < 12) h += 12;
			if (!pm && h >= 12) h -= 12;

			const d = new Date(displayDate.getTime());
			d.setHours(h);
			onChange?.(new DateTime(d));
		}
	};

	// --- Rendering ---

	const renderFace = () => {
		const total = mode.value === 'hours' ? 12 : 12; // 12 visual segments
		const numbers = [];
		const radius = 100;

		// Determine highlighted values
		const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

		for (let i = 1; i <= total; i++) {
			const numVal = mode.value === 'hours' ? i : i * 5;
			const pos = getPosition(i, 12, radius);

			// Check if this number is selected
			let isActive = false;
			let isMulti = false;

			if (mode.value === 'hours') {
				// Match hour (considering AM/PM context of the toggle)
				// We highlight if ANY selected date matches this hour in current AM/PM context
				const checkHour = isPm.value ? (i === 12 ? 12 : i + 12) : (i === 12 ? 0 : i);

				isActive = selectedValues.some((d) => d.getHour() === checkHour);
			} else {
				// Match minute (rough match for 5-min intervals)
				const checkMin = numVal === 60 ? 0 : numVal;
				isActive = selectedValues.some((d) => Math.round(d.getMinute() / 5) * 5 === checkMin);
			}

			// Style distinction for primary vs multi
			if (isActive) {
				const isPrimary = mode.value === 'hours'
					? (displayDate.getHour() % 12 || 12) === i
					: Math.round(displayDate.getMinute() / 5) * 5 === numVal;
				if (!isPrimary && selectionMode === 'multiple') isMulti = true;
			}

			numbers.push(
				<div
					key={i}
					className={`clock__number ${isActive ? 'clock__number--active' : ''} ${
						isMulti ? 'clock__number--multi' : ''
					}`}
					style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
				>
					{numVal === 60 ? '00' : numVal}
				</div>,
			);
		}

		// Hand logic (only points to primary display value)
		const currentVal = mode.value === 'hours' ? hours12 : minutes;
		const handSteps = mode.value === 'hours' ? 12 : 60;
		const handPos = getPosition(
			currentVal === 0 && mode.value === 'hours' ? 12 : currentVal,
			handSteps,
			radius,
		);

		return (
			<div
				className='clock__face'
				ref={clockRef}
				onPointerDown={(e) => {
					e.preventDefault();
					clockRef.current?.setPointerCapture(e.pointerId);
					isDragging.value = true;
					handlePointer(e, false);
				}}
				onPointerMove={(e) => {
					if (isDragging.value) handlePointer(e, false);
				}}
				onPointerUp={(e) => {
					clockRef.current?.releasePointerCapture(e.pointerId);
					isDragging.value = false;
					handlePointer(e, true);
				}}
			>
				<div className='clock__center-dot'></div>
				<div
					className='clock__hand'
					style={{
						height: `${radius}px`,
						transform: `rotate(${Math.atan2(handPos.y, handPos.x) * (180 / Math.PI) + 90}deg)`,
					}}
				>
					<div className='clock__hand-knob'></div>
				</div>
				{numbers}
			</div>
		);
	};

	return (
		<div className='time-clock'>
			<div className='time-clock__header'>
				<div className='time-clock__digital'>
					<button
						type='button'
						className={`time-clock__val ${mode.value === 'hours' ? 'time-clock__val--active' : ''}`}
						onClick={() => mode.value = 'hours'}
					>
						{hours12.toString().padStart(2, '0')}
					</button>
					<span className='time-clock__sep'>:</span>
					<button
						type='button'
						className={`time-clock__val ${
							mode.value === 'minutes' ? 'time-clock__val--active' : ''
						}`}
						onClick={() => mode.value = 'minutes'}
					>
						{minutes.toString().padStart(2, '0')}
					</button>
				</div>

				<div className='time-clock__ampm'>
					<button
						type='button'
						className={`time-clock__meridiem ${!isPm.value ? 'time-clock__meridiem--active' : ''}`}
						onClick={() => toggleAmPm(false)}
					>
						AM
					</button>
					<button
						type='button'
						className={`time-clock__meridiem ${isPm.value ? 'time-clock__meridiem--active' : ''}`}
						onClick={() => toggleAmPm(true)}
					>
						PM
					</button>
				</div>
			</div>

			<div className='time-clock__body'>
				{renderFace()}
			</div>
		</div>
	);
}
```

### File: packages\fields\src\components\DateTimeField.tsx

```tsx
import '../styles/components/datetime-field.css';
import { Signal, useSignal } from '@preact/signals';
import { IconCalendar, IconClock } from '@tabler/icons-preact';
import { DateTime } from '@projective/types';
import { DateTimeFieldProps } from '../types/components/datetime-field.ts';
import { TextField } from './TextField.tsx';
import { Calendar } from './datetime/Calendar.tsx';
import { TimeClock } from './datetime/TimeClock.tsx';
import { Popover } from '@projective/ui';

type TabView = 'date' | 'time';

export function DateTimeField(props: DateTimeFieldProps) {
	const {
		value,
		defaultValue,
		onChange,
		min,
		max,
		placeholder,
		...rest
	} = props;

	const isOpen = useSignal(false);
	const activeTab = useSignal<TabView>('date');
	const inputValue = useSignal('');

	// Normalize signal
	const isValueSignal = value instanceof Signal;
	const internalSignal = useSignal(
		isValueSignal ? value.peek() : (value ?? defaultValue),
	);

	if (
		!isValueSignal && value !== undefined && value !== internalSignal.peek()
	) {
		internalSignal.value = value;
	}

	const signalValue = isValueSignal ? value : internalSignal;

	// --- Format Helper ---
	const formatValue = (val?: DateTime) => {
		if (!val) return '';
		return val.toFormat('dd/MM/yyyy HH:mm');
	};

	// Sync Input (Unidirectional)
	// We watch signalValue
	const currentVal = signalValue.value;
	if (currentVal && !isOpen.value) {
		const formatted = formatValue(currentVal);
		if (inputValue.value !== formatted) inputValue.value = formatted;
	}

	// --- State Logic ---

	const updateDatePart = (newDate: DateTime) => {
		const current = signalValue.value || new DateTime();

		const d = new Date(current.getTime());
		d.setFullYear(newDate.getYear());
		d.setMonth(newDate.getMonth() - 1);
		d.setDate(newDate.getDate());

		const nextVal = new DateTime(d);

		if (isValueSignal) {
			(value as Signal<DateTime>).value = nextVal;
		} else {
			internalSignal.value = nextVal;
		}
		onChange?.(nextVal);
		inputValue.value = formatValue(nextVal);

		activeTab.value = 'time';
	};

	const updateTimePart = (newTime: DateTime) => {
		const current = signalValue.value || new DateTime();

		const d = new Date(current.getTime());
		d.setHours(newTime.getHour());
		d.setMinutes(newTime.getMinute());

		const nextVal = new DateTime(d);

		if (isValueSignal) {
			(value as Signal<DateTime>).value = nextVal;
		} else {
			internalSignal.value = nextVal;
		}
		onChange?.(nextVal);
		inputValue.value = formatValue(nextVal);
	};

	const handleInputChange = (val: string) => {
		inputValue.value = val;
		if (val === '') {
			// Handle clear
			// We can't set undefined to DateTime signal easily if strict?
			// But ValueFieldProps<DateTime> implies it might be undefined?
			// Let's assume we can set it to undefined if the type allows.
			// But signalValue is Signal<DateTime | undefined> (inferred).
			// Actually internalSignal is initialized with value ?? defaultValue.
			// If both undefined, it's Signal<undefined>.

			// If we want to support clearing:
			// if (isValueSignal) (value as Signal<DateTime | undefined>).value = undefined;
			// else internalSignal.value = undefined;
			// onChange?.(undefined);
			return;
		}
		try {
			const dt = new DateTime(val, 'dd/MM/yyyy HH:mm', true);
			// Check validity? DateTime constructor throws if invalid format?
			// Assuming it's valid if no throw.

			if (isValueSignal) {
				(value as Signal<DateTime>).value = dt;
			} else {
				internalSignal.value = dt;
			}
			onChange?.(dt);
		} catch {
			// Ignore invalid dates
		}
	};

	// Tabs Header
	const renderTabs = () => (
		<div className='datetime-field__tabs'>
			<button
				type='button'
				className={`datetime-field__tab ${
					activeTab.value === 'date' ? 'datetime-field__tab--active' : ''
				}`}
				onClick={() => activeTab.value = 'date'}
			>
				<IconCalendar size={16} />
				<span>Date</span>
				<span className='datetime-field__tab-val'>
					{signalValue.value ? signalValue.value.toFormat('dd MMM') : '--'}
				</span>
			</button>

			<button
				type='button'
				className={`datetime-field__tab ${
					activeTab.value === 'time' ? 'datetime-field__tab--active' : ''
				}`}
				onClick={() => activeTab.value = 'time'}
			>
				<IconClock size={16} />
				<span>Time</span>
				<span className='datetime-field__tab-val'>
					{signalValue.value ? signalValue.value.toFormat('HH:mm') : '--:--'}
				</span>
			</button>
		</div>
	);

	return (
		<div className='datetime-field'>
			<Popover
				isOpen={isOpen.value}
				onClose={() => isOpen.value = false}
				trigger={
					<TextField
						name='datetime-field'
						{...rest}
						type='text'
						placeholder={placeholder || 'DD/MM/YYYY HH:mm'}
						value={inputValue.value}
						onInput={(e) => handleInputChange(e.currentTarget.value)}
						suffix={
							<button
								type='button'
								className='datetime-field__icon-btn'
								onClick={(e) => {
									e.preventDefault();
									isOpen.value = !isOpen.value;
								}}
								tabIndex={-1}
							>
								<IconCalendar size={18} />
							</button>
						}
						onFocus={() => isOpen.value = true}
					/>
				}
				content={
					<div className='datetime-field__popup'>
						{renderTabs()}

						<div className='datetime-field__body'>
							{activeTab.value === 'date'
								? (
									<Calendar
										value={signalValue.value}
										onChange={(v) => {
											if (v instanceof DateTime) {
												updateDatePart(v);
											}
										}}
										min={min}
										max={max}
										className='datetime-field__calendar'
									/>
								)
								: (
									<div className='datetime-field__clock-wrapper'>
										<TimeClock
											value={signalValue.value}
											onChange={updateTimePart}
										/>
									</div>
								)}
						</div>
					</div>
				}
			/>
		</div>
	);
}
```

### File: packages\fields\src\components\FileDrop.tsx

```tsx
/* #region Imports */
import '../styles/fields/file-drop.css';
import { JSX } from 'preact';
import { useSignal } from '@preact/signals';
import {
	IconBooks,
	IconCloudUpload,
	IconFile,
	IconFilePlus,
	IconLoader2,
	IconPhoto,
	IconRefresh,
	IconTrash,
} from '@tabler/icons-preact';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { FileWithMeta, getFileCategory } from '@projective/types';
import { FileFieldProps } from '../types/file.ts';
import { TargetedEvent } from 'preact';
import { toast } from '@projective/ui'; // Required for notifications
/* #endregion */

export function FileDrop(props: FileFieldProps) {
	const {
		id,
		label,
		value,
		onChange,
		accept,
		multiple,
		disabled,
		className,
		style,
		error,
		required,
		variant = 'split',
		listPosition = 'below',
		onLibraryClick,
		maxSize = 10 * 1024 * 1024,
		maxFiles = 10,
		floatingRule = 'never',
		actionPosition = 'below',
	} = props;

	const isDragging = useSignal(false);
	const inputRef = useSignal<HTMLInputElement | null>(null);

	const files = value?.value || [];

	// #region Helpers
	const processFiles = (incomingFiles: File[]) => {
		if (disabled) return;

		let validFiles = incomingFiles;

		// 1. Validate File Type (Accept) - CRITICAL FOR DRAG & DROP
		if (accept) {
			const acceptedTypes = accept.split(',').map((t) => t.trim().toLowerCase());

			validFiles = validFiles.filter((f) => {
				const fType = f.type.toLowerCase();
				const fName = f.name.toLowerCase();

				const isValid = acceptedTypes.some((type) => {
					// Check extension (e.g., .png)
					if (type.startsWith('.')) return fName.endsWith(type);
					// Check mime type (e.g., image/*)
					if (type.endsWith('/*')) return fType.startsWith(type.replace('/*', ''));
					// Check exact mime type (e.g., image/png)
					return fType === type;
				});

				if (!isValid) {
					toast.error(`File "${f.name}" format is not supported.`);
					return false;
				}
				return true;
			});
		}

		// 2. Validate Max Files
		if (!multiple && validFiles.length > 1) {
			// If single mode, just take the last one dropped
			validFiles = [validFiles[validFiles.length - 1]];
		} else if (multiple && (files.length + validFiles.length) > maxFiles) {
			const slotsRemaining = maxFiles - files.length;
			if (slotsRemaining <= 0) {
				toast.error(`Maximum file limit (${maxFiles}) reached.`);
				return;
			}

			toast.warning(`Limit exceeded. Only adding ${slotsRemaining} file(s).`);
			validFiles = validFiles.slice(0, slotsRemaining);
		}

		// 3. Validate Size
		validFiles = validFiles.filter((f) => {
			if (f.size > maxSize) {
				const sizeMb = Math.round(maxSize / 1024 / 1024);
				toast.error(`"${f.name}" is too large (Max ${sizeMb}MB).`);
				return false;
			}
			return true;
		});

		if (validFiles.length === 0) return;

		// 4. Create FileWithMeta
		const processed: FileWithMeta[] = validFiles.map((f) => ({
			file: f,
			id: crypto.randomUUID(),
			status: 'pending',
			progress: 0,
			errors: [],
			type: getFileCategory(f),
			meta: {
				uploadedAt: new Date().toISOString(),
			},
		}));

		if (onChange) {
			if (multiple) {
				onChange([...files, ...processed]);
			} else {
				// Replace in single mode
				onChange([processed[processed.length - 1]]);
			}
		}
	};

	const handleRemove = (fileId: string, e?: Event) => {
		e?.stopPropagation();
		if (onChange) {
			onChange(files.filter((f) => f.id !== fileId));
		}
	};
	// #endregion

	// #region Event Handlers
	const handleDragEnter = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!disabled) isDragging.value = true;
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();

		// Fix: Only disable dragging if we actually left the container
		// (prevents flickering when dragging over child elements like icons)
		const container = e.currentTarget as HTMLElement;
		const enteringElement = e.relatedTarget as HTMLElement;

		if (!container.contains(enteringElement)) {
			isDragging.value = false;
		}
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		isDragging.value = false;

		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			processFiles(Array.from(e.dataTransfer.files));
			e.dataTransfer.clearData();
		}
	};

	const handleFileInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
		if (e.currentTarget.files) {
			processFiles(Array.from(e.currentTarget.files));
			e.currentTarget.value = '';
		}
	};

	const triggerUpload = () => inputRef.value?.click();
	// #endregion

	// #region Renderers
	const renderIcon = (file: FileWithMeta) => {
		if (file.status === 'processing') {
			return <IconLoader2 size={24} className='file-drop__spinner' />;
		}
		if (file.type === 'Image') return <IconPhoto size={24} />;
		return <IconFile size={24} />;
	};

	const renderFileList = () => (
		<div className='file-drop__list'>
			{files.map((file) => (
				<div key={file.id} className='file-drop__item'>
					{file.status === 'processing' && (
						<div className='file-drop__progress-bg' style={{ width: `${file.progress}%` }} />
					)}

					<div className='file-drop__item-info'>
						{file.type === 'Image'
							? (
								<img
									src={URL.createObjectURL(file.file)}
									className='file-drop__preview-thumb'
									alt={file.file.name}
								/>
							)
							: (
								<div style={{ color: 'var(--text-secondary)' }}>
									{renderIcon(file)}
								</div>
							)}

						<div className='file-drop__meta'>
							<span className='file-drop__filename'>{file.file.name}</span>
							<span className='file-drop__filesize'>
								{(file.file.size / 1024 / 1024).toFixed(2)} MB
								{file.status === 'processing' && ` • ${Math.round(file.progress)}%`}
								{file.status === 'error' && (
									<span style={{ color: 'var(--error-500)' }}>• Failed</span>
								)}
							</span>
						</div>
					</div>

					<button
						type='button'
						className='file-drop__remove'
						onClick={(e) => handleRemove(file.id!, e)}
						title='Remove file'
					>
						<IconTrash size={18} />
					</button>
				</div>
			))}
		</div>
	);

	const renderSinglePreview = (file: FileWithMeta) => (
		<div
			className={`file-drop__container ${disabled ? 'file-drop__container--disabled' : ''}`}
			style={{ flexDirection: 'column', height: 'auto', padding: 0 }}
		>
			<div className={`file-drop__single-preview file-drop__single-preview--${actionPosition}`}>
				<img
					src={URL.createObjectURL(file.file)}
					className='file-drop__single-img'
					alt='Preview'
				/>

				{actionPosition === 'overlay' && (
					<button type='button' className='file-drop__change-btn' onClick={triggerUpload}>
						<IconRefresh size={32} />
						<span>Change Image</span>
					</button>
				)}
			</div>

			{actionPosition === 'below' && (
				<button
					type='button'
					className='file-drop__remove-bar'
					onClick={() => handleRemove(file.id!)}
				>
					<IconTrash size={16} /> Remove & Change
				</button>
			)}
		</div>
	);
	// #endregion

	const hasSingleFile = !multiple && files.length > 0;

	return (
		<div className={`field-file ${className || ''}`} style={style}>
			<LabelWrapper
				id={id}
				label={label}
				disabled={disabled}
				required={required}
				error={!!error}
				floatingRule={floatingRule}
			/>

			{/* LIST ABOVE */}
			{listPosition === 'top' && multiple && files.length > 0 && renderFileList()}

			{/* DROPZONE OR SINGLE PREVIEW */}
			{hasSingleFile
				? (
					renderSinglePreview(files[0])
				)
				: (
					<div
						className={[
							'file-drop__container',
							disabled && 'file-drop__container--disabled',
							!!error && 'file-drop__container--error',
							variant === 'single' && 'file-drop__container--single',
						].filter(Boolean).join(' ')}
						onDragEnter={handleDragEnter}
						onDragOver={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onClick={variant === 'single' ? triggerUpload : undefined}
					>
						<input
							ref={(el) => (inputRef.value = el) as any}
							type='file'
							id={id}
							multiple={multiple}
							accept={accept}
							onChange={handleFileInput}
							style={{ display: 'none' }}
						/>

						{isDragging.value && (
							<div className='file-drop__overlay'>
								<div className='file-drop__overlay-content'>
									<IconFilePlus size={48} />
									<span>Drop files to add them</span>
								</div>
							</div>
						)}

						{variant === 'split' && (
							<>
								<div
									className='file-drop__split-action'
									onClick={(e) => {
										e.stopPropagation();
										triggerUpload();
									}}
								>
									<IconCloudUpload size={32} stroke={1.5} />
									<div>
										<div className='file-drop__label'>Upload from Device</div>
										<div className='file-drop__sub'>JPG, PNG, PDF (Max 10MB)</div>
									</div>
								</div>
								<div className='file-drop__divider' />
								<div
									className='file-drop__split-action'
									onClick={(e) => {
										e.stopPropagation();
										onLibraryClick?.();
									}}
								>
									<IconBooks size={32} stroke={1.5} />
									<div>
										<div className='file-drop__label'>Select from Library</div>
										<div className='file-drop__sub'>Reuse existing assets</div>
									</div>
								</div>
							</>
						)}

						{variant === 'single' && (
							<div className='file-drop__split-action' style={{ width: '100%', border: 'none' }}>
								<IconCloudUpload size={32} stroke={1.5} />
								<div className='file-drop__label'>Click to Upload</div>
							</div>
						)}
					</div>
				)}

			{/* LIST BELOW */}
			{listPosition === 'below' && multiple && files.length > 0 && renderFileList()}
		</div>
	);
}
```

### File: packages\fields\src\components\HelpTooltip.tsx

```tsx
import { JSX } from 'preact';
import { IconHelp } from '@tabler/icons-preact';
import '../styles/components/help-tooltip.css';

export interface HelpTooltipProps {
	/** The content to show in the tooltip */
	content: string | JSX.Element;
	/** Optional link to navigate to on click */
	href?: string;
	/** Optional override for the icon */
	icon?: JSX.Element;
	className?: string;
	style?: JSX.CSSProperties;
}

export function HelpTooltip({ content, href, icon, className, style }: HelpTooltipProps) {
	const Icon = icon || <IconHelp size={16} />;

	// If it's a link, we render an anchor tag
	if (href) {
		return (
			<a
				href={href}
				target='_blank'
				rel='noopener noreferrer'
				className={`help-tooltip ${className || ''}`}
				style={style}
				onClick={(e) => e.stopPropagation()} // Prevent triggering parent label clicks
			>
				<span className='help-tooltip__icon'>{Icon}</span>
				<span className='help-tooltip__popup'>
					{content}
					<span className='help-tooltip__arrow' />
				</span>
			</a>
		);
	}

	// Otherwise, just a span
	return (
		<span className={`help-tooltip ${className || ''}`} style={style}>
			<span className='help-tooltip__icon'>{Icon}</span>
			<span className='help-tooltip__popup'>
				{content}
				<span className='help-tooltip__arrow' />
			</span>
		</span>
	);
}
```

### File: packages\fields\src\components\MoneyField.tsx

```tsx
import { TargetedEvent } from 'preact';
import { Signal, useSignal } from '@preact/signals';
import { MoneyFieldProps } from '../types/components/money-field.ts';
import { TextField } from './TextField.tsx';
import { useCurrencyMask } from '../hooks/useCurrencyMask.ts';

export function MoneyField(props: MoneyFieldProps) {
	const {
		value,
		defaultValue,
		onChange,
		onBlur,
		onFocus,
		currency = 'USD',
		locale = 'en-US',
		placeholder = '0.00',
		...rest
	} = props;

	const isValueSignal = value instanceof Signal;
	const internalSignal = useSignal(
		isValueSignal ? value.peek() : (value ?? defaultValue),
	);

	if (!isValueSignal && value !== undefined && value !== internalSignal.peek()) {
		internalSignal.value = value;
	}

	const signalValue = isValueSignal ? value : internalSignal;

	const { displayValue, handleBlur, handleFocus, handleChange, setProgrammaticValue } =
		useCurrencyMask(
			signalValue as Signal<number | undefined>,
			currency,
			locale,
		);

	const lastX = useSignal<number | null>(null);
	const lastTime = useSignal<number | null>(null);

	const handlePointerDown = (e: PointerEvent) => {
		const target = e.currentTarget as HTMLElement;
		target.setPointerCapture(e.pointerId);
		lastX.value = e.clientX;
		lastTime.value = performance.now();
		e.preventDefault();
	};

	const handlePointerMove = (e: PointerEvent) => {
		if (lastX.value === null || lastTime.value === null) return;

		const currentX = e.clientX;
		const currentTime = performance.now();

		const dx = currentX - lastX.value;
		const dt = currentTime - lastTime.value;

		if (dt > 0 && dx !== 0) {
			const velocity = Math.abs(dx / dt);

			const speedMultiplier = 1 + Math.log1p(velocity * 10);

			const delta = dx * 0.2 * speedMultiplier;

			const currentVal = signalValue.peek() ?? 0;
			const newVal = Math.max(0, currentVal + delta);

			setProgrammaticValue(newVal);
			onChange?.(newVal);
		}

		lastX.value = currentX;
		lastTime.value = currentTime;
	};

	const handlePointerUp = (e: PointerEvent) => {
		if (lastX.value !== null) {
			const target = e.currentTarget as HTMLElement;
			target.releasePointerCapture(e.pointerId);
			lastX.value = null;
			lastTime.value = null;
		}
	};

	return (
		<TextField
			{...rest}
			value={displayValue}
			placeholder={placeholder}
			onInput={(e: TargetedEvent<HTMLInputElement>) => {
				handleChange(e.currentTarget.value);
				onChange?.(signalValue.peek() as number);
			}}
			onBlur={(e) => {
				handleBlur();
				onBlur?.(e);
			}}
			onFocus={(e) => {
				handleFocus();
				onFocus?.(e);
			}}
			prefixProps={{
				onPointerDown: handlePointerDown,
				onPointerMove: handlePointerMove,
				onPointerUp: handlePointerUp,
				style: { cursor: 'ew-resize', touchAction: 'none' },
			}}
			prefix={
				<span style={{ fontSize: '0.9em', fontWeight: 'bold' }}>
					{new Intl.NumberFormat(locale, {
						style: 'currency',
						currency,
					}).formatToParts(0).find((p) => p.type === 'currency')
						?.value}
				</span>
			}
		/>
	);
}
```

### File: packages\fields\src\components\RichTextField.tsx

```tsx
/* #region Imports */
import '../styles/fields/rich-text-field.css';
import { useEffect, useRef } from 'preact/hooks';
import { Signal, useComputed, useSignal } from '@preact/signals';
import { RichTextFieldProps } from '../types/components/rich-text-field.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
/* #endregion */

let Quill: any = null;

/**
 * @function RichTextField
 * @description A high-performance rich text editor powered by Quill, integrated
 * with the projective design system.
 * * @param {RichTextFieldProps} props - Component properties.
 * @returns {JSX.Element}
 */
export function RichTextField(props: RichTextFieldProps) {
	// #region State & Destructuring
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		outputFormat = 'delta',
		toolbar = 'basic',
		variant = 'framed',
		secureLinks = true,
		placeholder,
		readOnly,
		onImageUpload,
		error,
		hint,
		warning,
		info,
		disabled,
		required,
		minHeight = '150px',
		maxHeight,
		maxLength,
		showCount,
		className,
		style,
	} = props;

	const editorRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const quillInstance = useRef<any>(null);
	const parserRef = useRef<any>(null);

	const length = useSignal(0);

	const getRawValue = () => {
		if (value instanceof Signal) return value.value;
		return value || defaultValue || '';
	};

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const isReadOnly = !!readOnly || isDisabled;
	const isError = error instanceof Signal ? error.value : error;
	const isWarning = warning instanceof Signal ? warning.value : warning;

	const isOverLimit = useComputed(() => maxLength ? length.value > maxLength : false);
	// #endregion

	// #region Helper Logic: Links & Images
	/**
	 * @function registerSecureLink
	 * @description Sanitizes and secures link creation within the editor.
	 */
	const registerSecureLink = (QuillArg: any) => {
		const Link = QuillArg.import('formats/link');
		class SecureLink extends Link {
			static create(value: string) {
				const node = super.create(value);
				value = this.sanitize(value);
				node.setAttribute('href', value);
				node.setAttribute('rel', 'noopener noreferrer');
				node.setAttribute('target', '_blank');
				return node;
			}
			static sanitize(url: string) {
				const protocol = url.slice(0, url.indexOf(':'));
				if (['javascript', 'vbscript', 'data'].includes(protocol.toLowerCase())) {
					return 'about:blank';
				}
				return super.sanitize(url);
			}
		}
		if (secureLinks) {
			QuillArg.register(SecureLink, true);
		}
	};

	const insertImage = (url: string) => {
		const quill = quillInstance.current;
		if (!quill) return;
		const range = quill.getSelection(true);
		quill.insertEmbed(range.index, 'image', url);
		quill.setSelection(range.index + 1);
	};

	const handleFiles = async (files: FileList | File[]) => {
		if (!onImageUpload) return;
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (file.type.startsWith('image/')) {
				try {
					const url = await onImageUpload(file);
					insertImage(url);
				} catch (err) {
					console.error('Image upload failed', err);
				}
			}
		}
	};

	const imageHandler = () => {
		const input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'image/*');
		input.click();

		input.onchange = () => {
			if (input.files && input.files[0]) {
				if (onImageUpload) {
					handleFiles([input.files[0]]);
				} else {
					const reader = new FileReader();
					reader.onload = (e) => {
						insertImage(e.target?.result as string);
					};
					reader.readAsDataURL(input.files[0]);
				}
			}
		};
	};
	// #endregion

	// #region Lifecycle: Quill Initialization
	useEffect(() => {
		if (typeof window === 'undefined' || !editorRef.current) return;

		const init = async () => {
			if (!Quill) {
				const mod = await import('quill');
				Quill = mod.default;
				registerSecureLink(Quill);
			}

			if (!parserRef.current) {
				const { MarkdownParser } = await import('../../../utils/src/markdown/QuillParser.ts');
				parserRef.current = new MarkdownParser();
			}

			if (quillInstance.current) {
				if (quillInstance.current.isEnabled() === isReadOnly) {
					quillInstance.current.enable(!isReadOnly);
				}
				return;
			}

			let toolbarConfig = toolbar;
			if (toolbar === 'basic') {
				toolbarConfig = [
					['bold', 'italic', 'underline', 'strike'],
					['link', 'blockquote'],
					[{ 'list': 'ordered' }, { 'list': 'bullet' }],
					['clean'],
				];
			} else if (toolbar === 'full') {
				toolbarConfig = [
					[{ 'header': [1, 2, 3, false] }],
					['bold', 'italic', 'underline', 'strike'],
					[{ 'color': [] }, { 'background': [] }],
					[{ 'script': 'sub' }, { 'script': 'super' }],
					['link', 'blockquote', 'code-block', 'image'],
					[{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
					[{ 'align': [] }],
					['clean'],
				];
			}

			const modules = {
				toolbar: isReadOnly ? false : {
					container: toolbarConfig,
					handlers: { image: imageHandler },
				},
			};

			quillInstance.current = new Quill(editorRef.current, {
				theme: 'snow',
				modules,
				placeholder: isReadOnly ? '' : placeholder,
				readOnly: isReadOnly,
			});

			const toolbarC = containerRef.current?.querySelector('.ql-toolbar');
			if (toolbarC) {
				const controls = toolbarC.querySelectorAll('button, select');
				controls.forEach((control) => control.setAttribute('tabindex', '-1'));
			}

			if (!isReadOnly) {
				quillInstance.current.root.addEventListener('drop', (e: DragEvent) => {
					if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
						e.preventDefault();
						handleFiles(e.dataTransfer.files);
					}
				});
			}

			const raw = getRawValue();
			if (raw) {
				try {
					if (typeof raw === 'object' && raw !== null) {
						quillInstance.current.setContents(raw);
					} else if (typeof raw === 'string') {
						const trimmed = raw.trim();
						if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
							quillInstance.current.setContents(JSON.parse(trimmed));
						} else if (trimmed.startsWith('<')) {
							const delta = quillInstance.current.clipboard.convert(trimmed);
							quillInstance.current.setContents(delta);
						} else {
							if (parserRef.current) {
								parserRef.current.markdownToDelta(raw).then((delta: any) => {
									quillInstance.current.setContents(delta);
								});
							} else {
								quillInstance.current.setText(raw);
							}
						}
					}
				} catch {
					quillInstance.current.setText(String(raw));
				}
			}

			length.value = Math.max(0, quillInstance.current.getLength() - 1);

			quillInstance.current.on('text-change', () => {
				const delta = quillInstance.current.getContents();
				length.value = Math.max(0, quillInstance.current.getLength() - 1);

				let output = '';
				if (outputFormat === 'delta') output = JSON.stringify(delta);
				else if (outputFormat === 'html') output = quillInstance.current.root.innerHTML;
				else if (outputFormat === 'markdown' && parserRef.current) {
					output = parserRef.current.deltaToMarkdown(delta);
				}

				if (value instanceof Signal) value.value = output;
				onChange?.(output);
			});
		};

		init();
	}, [isReadOnly]);
	// #endregion

	// #region Render
	return (
		<div
			className={`field-rich-text field-rich-text--${variant} ${
				isReadOnly ? 'field-rich-text--readonly' : ''
			} ${className || ''}`}
			style={style}
		>
			<LabelWrapper
				id={id}
				label={label}
				required={required}
				error={!!isError}
				disabled={isDisabled}
				position='top'
				floatingRule='never'
			/>

			<div
				ref={containerRef}
				className={`field-rich-text__container ${
					isError ? 'field-rich-text__container--error' : ''
				} ${isWarning ? 'field-rich-text__container--warning' : ''}`}
			>
				<div
					ref={editorRef}
					style={{
						minHeight: variant === 'inline' ? 'auto' : minHeight,
						maxHeight: maxHeight,
					}}
				/>
			</div>

			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<div style={{ flex: 1 }}>
					<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
				</div>

				{showCount && (
					<div
						className={`field-rich-text__count ${
							isOverLimit.value ? 'field-rich-text__count--limit' : ''
						}`}
					>
						{length}/{maxLength || '∞'}
					</div>
				)}
			</div>
		</div>
	);
	// #endregion
}
```

### File: packages\fields\src\components\SelectField.tsx

```tsx
import '../styles/fields/select-field.css';
import { Signal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { IconCheck, IconChevronDown, IconLoader2, IconSelector, IconX } from '@tabler/icons-preact';
import { SelectFieldProps, SelectOption } from '../types/components/select-field.ts';
import { useSelectState } from '../hooks/useSelectState.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { EffectWrapper, useRipple } from '../wrappers/EffectWrapper.tsx';
import { focusNextElement } from '../hooks/useFocusNext.ts';

export function SelectField<T = string>(props: SelectFieldProps<T>) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		options,
		error,
		disabled,
		placeholder,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
		multiple,
		searchable,
		clearable,
		loading,
		displayMode = 'chips-inside',
		enableSelectAll,
		groupSelectMode = 'value',
		icons,
		nextField,
		onKeyDown,
	} = props;

	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	const interaction = useInteraction(
		value instanceof Signal ? value.value : value,
	);
	const { ripples, addRipple } = useRipple();

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = error instanceof Signal ? error.value : error;

	const {
		isOpen,
		highlightedIndex,
		searchQuery,
		filteredOptions,
		selectedValues,
		toggleOpen,
		selectOption,
		removeValue,
		toggleSelectAll,
		handleKeyDown,
	} = useSelectState({
		options,
		value,
		onChange,
		multiple,
		disabled: !!isDisabled,
		groupSelectMode,
	});

	useEffect(() => {
		if (isOpen.value && containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const spaceBelow = globalThis.innerHeight - rect.bottom;
			if (containerRef.current.classList.contains('field-select--up')) {
				if (spaceBelow > 250) containerRef.current.classList.remove('field-select--up');
			} else {
				if (spaceBelow < 250) containerRef.current.classList.add('field-select--up');
			}

			if (searchable && inputRef.current) {
				inputRef.current.focus();
			}

			if (listRef.current && highlightedIndex.value >= 0) {
				const highlightedEl = listRef.current.children[highlightedIndex.value] as HTMLElement;
				if (highlightedEl) {
					highlightedEl.scrollIntoView({ block: 'nearest' });
				}
			}
		}
	}, [isOpen.value, highlightedIndex.value]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				toggleOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const getLabelForValue = (val: T) => {
		const findInTree = (opts: SelectOption<T>[]): SelectOption<T> | undefined => {
			for (const o of opts) {
				if (o.value === val) return o;
				if (o.options) {
					const found = findInTree(o.options);
					if (found) return found;
				}
			}
			return undefined;
		};
		const opt = findInTree(options);
		return opt ? opt.label : String(val);
	};

	const renderStatusIcon = () => {
		if (loading) return icons?.loading || <IconLoader2 className='field-select__spin' size={18} />;
		if (errorMessage) return icons?.invalid;
		if (isOpen.value) return icons?.arrowOpen || <IconChevronDown size={18} />;
		return icons?.arrow || <IconChevronDown size={18} />;
	};

	const renderChips = () => {
		return selectedValues.value.map((val) => {
			const label = getLabelForValue(val);
			return (
				<span key={String(val)} className='field-select__chip'>
					{label}
					<span
						className='field-select__chip-remove'
						onMouseDown={(e) => {
							e.preventDefault();
							e.stopPropagation();
							removeValue(val);
						}}
					>
						{icons?.remove || <IconX size={14} />}
					</span>
				</span>
			);
		});
	};

	const renderValue = () => {
		if (displayMode === 'count' && selectedValues.value.length > 0) {
			return <span className='field-select__summary'>{selectedValues.value.length} selected</span>;
		}

		if (multiple && displayMode === 'chips-inside') {
			return renderChips();
		}

		if (!multiple && selectedValues.value.length > 0) {
			const val = selectedValues.value[0];
			const label = getLabelForValue(val);

			if (searchable && searchQuery.value) return null;
			return (
				<div className='field-select__single'>
					{label}
				</div>
			);
		}

		return null;
	};

	const handleContainerClick = (e: MouseEvent) => {
		if (isDisabled) return;
		if (searchable && isOpen.value && e.target === inputRef.current) return;

		addRipple(e);
		toggleOpen();
		if (!isOpen.value) interaction.handleFocus(e);
	};

	const handleFieldKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Tab' && !e.shiftKey && nextField && !isOpen.value) {
			e.preventDefault();
			focusNextElement(inputRef.current || containerRef.current!, nextField);
		}

		handleKeyDown(e);
		onKeyDown?.(e);
	};

	return (
		<div
			className={`field-select ${className || ''}`}
			style={style}
			ref={containerRef}
		>
			<LabelWrapper
				id={id}
				label={label}
				active={isOpen.value || selectedValues.value.length > 0 || !!placeholder ||
					!!searchQuery.value}
				error={!!errorMessage}
				disabled={isDisabled}
				required={required}
				floating={floating}
				position={position}
				floatingRule={floatingRule}
			/>

			<div
				className={[
					'field-select__container',
					isOpen.value && 'field-select__container--open',
					interaction.focused.value && 'field-select__container--focused',
					errorMessage && 'field-select__container--error',
					isDisabled && 'field-select__container--disabled',
				].filter(Boolean).join(' ')}
				onClick={handleContainerClick}
				onMouseDown={(e) => {
					if (e.target !== inputRef.current) e.preventDefault();
				}}
			>
				<EffectWrapper focused={interaction.focused} disabled={isDisabled} />

				<div
					className='field-ripple-container'
					style={{
						position: 'absolute',
						inset: 0,
						overflow: 'hidden',
						pointerEvents: 'none',
						borderRadius: 'inherit',
					}}
				>
					{ripples.value.map((r) => (
						<span key={r.id} className='field-ripple' style={{ left: r.x, top: r.y }} />
					))}
				</div>

				<div className='field-select__content'>
					{renderValue()}

					{(searchable || (selectedValues.value.length === 0 && placeholder)) && (
						<input
							ref={inputRef}
							className='field-select__input'
							value={searchQuery.value}
							placeholder={selectedValues.value.length === 0
								? (placeholder || (floating ? '' : 'Select...'))
								: ''}
							onInput={(e) => searchQuery.value = e.currentTarget.value}
							onKeyDown={handleFieldKeyDown}
							onFocus={interaction.handleFocus}
							onBlur={() => {
								setTimeout(() => interaction.handleBlur(), 100);
							}}
							disabled={!!isDisabled}
							readOnly={!searchable}
						/>
					)}
				</div>

				{clearable && !loading && selectedValues.value.length > 0 && (
					<div
						className='field-select__clear'
						onClick={(e) => {
							e.stopPropagation();
							if (multiple) {
								if (value instanceof Signal) value.value = [];
								onChange?.([]);
							} else {
								if (value instanceof Signal) value.value = undefined as any;
								onChange?.(undefined as any);
							}
						}}
					>
						<IconX size={16} />
					</div>
				)}

				<div className={`field-select__arrow ${isOpen.value ? 'field-select__arrow--flip' : ''}`}>
					{renderStatusIcon()}
				</div>

				<div
					className={`field-select__menu ${isOpen.value ? 'field-select__menu--open' : ''}`}
					ref={listRef}
				>
					{multiple && enableSelectAll && filteredOptions.value.length > 0 && (
						<div
							className='field-select__action-bar'
							onClick={(e) => {
								e.stopPropagation();
								toggleSelectAll();
							}}
						>
							<IconSelector size={16} />
							<span>Select All</span>
						</div>
					)}

					{filteredOptions.value.length === 0
						? <div className='field-select__no-options'>No options found</div>
						: (
							filteredOptions.value.map((option, index) => {
								const isHighlighted = index === highlightedIndex.value;

								let isSelected = false;
								if (option.isGroup && groupSelectMode === 'members' && multiple) {
									isSelected = option.descendantValues.length > 0 &&
										option.descendantValues.every((v) => selectedValues.value.includes(v));
								} else {
									isSelected = selectedValues.value.includes(option.value);
								}

								return (
									<div
										key={String(option.value) + index}
										className={[
											'field-select__option',
											isSelected && 'field-select__option--selected',
											isHighlighted && 'field-select__option--highlighted',
											option.disabled && 'field-select__option--disabled',
											option.isGroup && 'field-select__option--group',
										].filter(Boolean).join(' ')}
										style={{ paddingLeft: `${(option.depth * 12) + 12}px` }} // Indentation
										onClick={(e) => {
											e.stopPropagation();
											selectOption(option);
										}}
										onMouseEnter={() => highlightedIndex.value = index}
									>
										{option.icon && (
											<span className='field-select__option-icon'>{option.icon}</span>
										)}
										{option.avatarUrl && (
											<img src={option.avatarUrl} className='field-select__avatar' />
										)}

										<span className='field-select__option-label'>{option.label}</span>

										{isSelected && (
											<span className='field-select__check'>
												{icons?.check || <IconCheck size={16} />}
											</span>
										)}
									</div>
								);
							})
						)}
				</div>
			</div>

			{multiple && displayMode === 'chips-below' && selectedValues.value.length > 0 && (
				<div className='field-select__chips-external'>
					{renderChips()}
				</div>
			)}

			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}
```

### File: packages\fields\src\components\SliderField.tsx

```tsx
import '../styles/fields/slider-field.css';
import { Signal } from '@preact/signals';
import { SliderFieldProps, SliderMark } from '../types/components/slider-field.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { useSliderState } from '../hooks/useSliderState.ts';
import { valueToPercent, valueToPercentLog } from '@projective/utils';

export function SliderField(props: SliderFieldProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		min = 0,
		max = 100,
		step = 1,
		disabled,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
		error,
		range,
		marks,
		snapToMarks,
		vertical,
		scale,
		minDistance,
		passthrough,
	} = props;

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = error instanceof Signal ? error.value : error;

	const rawValue = value instanceof Signal ? value.value : (value ?? defaultValue);

	const {
		trackRef,
		internalValues,
		activeHandleIdx,
		handleStyles,
		trackFillStyle,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		handleTrackClick,
	} = useSliderState({
		value: rawValue,
		onChange: (val) => {
			if (value instanceof Signal) {
				(value as Signal<number | number[]>).value = val;
			}
			onChange?.(val);
		},
		min,
		max,
		step,
		range,
		disabled: !!isDisabled,
		marks,
		snapToMarks,
		vertical,
		scale,
		minDistance,
		passthrough,
	});

	const renderMarks = () => {
		if (!marks) return null;
		let points: SliderMark[] = [];
		if (Array.isArray(marks)) {
			points = marks.map((m) => (typeof m === 'number' ? { value: m } : m));
		} else if (marks === true) {
			if (scale === 'logarithmic') return null;
			const count = (max - min) / step;
			if (count > 100) return null;
			for (let i = min; i <= max; i += step) points.push({ value: i });
		}

		return (
			<div className='field-slider__marks'>
				{points.map((mark, i) => {
					const pct = scale === 'logarithmic'
						? valueToPercentLog(mark.value, min, max)
						: valueToPercent(mark.value, min, max);
					if (pct < 0 || pct > 100) return null;

					const markStyle = vertical
						? { bottom: `${pct}%`, left: '50%' }
						: { left: `${pct}%`, top: '50%' };

					const markClass = ['field-slider__mark', mark.className].filter(Boolean).join(' ');

					return (
						<div key={i} className={markClass} style={markStyle}>
							<div className='field-slider__mark-tick'></div>
							{mark.label && <div className='field-slider__mark-label'>{mark.label}</div>}
						</div>
					);
				})}
			</div>
		);
	};

	const containerClasses = [
		'field-slider',
		className,
		isDisabled ? 'field-slider--disabled' : '',
		range ? 'field-slider--range' : '',
		marks ? 'field-slider--has-marks' : '',
		vertical ? 'field-slider--vertical' : '',
	].filter(Boolean).join(' ');

	const wrapperStyle = vertical && props.height ? { height: props.height } : {};

	return (
		<div className={containerClasses} style={style}>
			<LabelWrapper
				id={id}
				label={label}
				disabled={isDisabled}
				position={position}
				floatingRule={floatingRule ?? 'never'}
				required={required}
				floating={floating}
			/>

			<div className='field-slider__control' style={wrapperStyle}>
				<div
					className='field-slider__container'
					onClick={(e: MouseEvent) => handleTrackClick(e as PointerEvent)}
				>
					<div className='field-slider__track' ref={trackRef}>
						<div className='field-slider__fill' style={trackFillStyle.value}></div>

						{renderMarks()}

						{handleStyles.value.map((thumbStyle, index) => {
							const isActive = activeHandleIdx.value === index;
							const val = internalValues.value[index];

							return (
								<div
									key={index}
									className={`field-slider__thumb ${isActive ? 'field-slider__thumb--active' : ''}`}
									style={thumbStyle}
									tabIndex={isDisabled ? -1 : 0}
									role='slider'
									aria-orientation={vertical ? 'vertical' : 'horizontal'}
									aria-valuemin={min}
									aria-valuemax={max}
									aria-valuenow={val}
									onPointerDown={(e) => {
										(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
										handlePointerDown(index, e);
									}}
									onPointerMove={handlePointerMove}
									onPointerUp={(e) => {
										(e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
										handlePointerUp(e);
									}}
									onContextMenu={(e) => e.preventDefault()}
								>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			<MessageWrapper error={errorMessage} hint={hint} warning={warning} info={info} />
		</div>
	);
}
```

### File: packages\fields\src\components\TagInput.tsx

```tsx
import '../styles/fields/tag-input.css';
import { Signal, useSignal } from '@preact/signals';
import { TagInputProps } from '../types/components/tag-input.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { EffectWrapper } from '../wrappers/EffectWrapper.tsx';
import { focusNextElement } from '../hooks/useFocusNext.ts';
import { generateTagTheme } from '@projective/utils';

export function TagInput(props: TagInputProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		error,
		disabled,
		placeholder,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
		nextField,
		onKeyDown,
		tagColor,
		tagVariant = 'transparent',
	} = props;

	const interaction = useInteraction(
		value instanceof Signal ? value.value : value,
	);
	const inputValue = useSignal('');

	const isValueSignal = value instanceof Signal;
	const internalSignal = useSignal(
		isValueSignal ? value.peek() : (value ?? defaultValue ?? []),
	);

	if (!isValueSignal && value !== undefined && value !== internalSignal.peek()) {
		internalSignal.value = value;
	}

	const signalValue = isValueSignal ? value : internalSignal;
	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = error instanceof Signal ? error.value : error;

	const handleKeyDown = (e: KeyboardEvent) => {
		// Tab Navigation
		if (e.key === 'Tab' && !e.shiftKey && nextField) {
			e.preventDefault();
			focusNextElement(e.currentTarget as HTMLElement, nextField);
		}

		// Tag Creation
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			const val = inputValue.value.trim();
			if (val) {
				const currentTags = signalValue.value || [];
				if (!currentTags.includes(val)) {
					const newTags = [...currentTags, val];
					if (isValueSignal) {
						(value as Signal<string[]>).value = newTags;
					} else {
						internalSignal.value = newTags;
					}
					onChange?.(newTags);
				}
				inputValue.value = '';
			}
		} else if (
			e.key === 'Backspace' && !inputValue.value &&
			signalValue.value?.length
		) {
			const newTags = signalValue.value.slice(0, -1);
			if (isValueSignal) {
				(value as Signal<string[]>).value = newTags;
			} else {
				internalSignal.value = newTags;
			}
			onChange?.(newTags);
		}

		onKeyDown?.(e);
	};

	const removeTag = (tagToRemove: string) => {
		const currentTags = signalValue.value || [];
		const newTags = currentTags.filter((tag) => tag !== tagToRemove);
		if (isValueSignal) {
			(value as Signal<string[]>).value = newTags;
		} else {
			internalSignal.value = newTags;
		}
		onChange?.(newTags);
	};

	const handleContainerClick = (e: MouseEvent) => {
		if (isDisabled) return;
		const input = (e.currentTarget as HTMLElement).querySelector('input');
		input?.focus();
	};

	const getTagStyles = (tag: string) => {
		if (!tagColor) return {};
		const colorStr = typeof tagColor === 'function' ? tagColor(tag) : tagColor;
		return generateTagTheme(colorStr, tagVariant);
	};

	return (
		<div className={`field-tag ${className || ''}`} style={style}>
			<div
				className={[
					'field-tag__container',
					interaction.focused.value &&
					'field-tag__container--focused',
					errorMessage && 'field-tag__container--error',
					isDisabled && 'field-tag__container--disabled',
				].filter(Boolean).join(' ')}
				onClick={handleContainerClick}
			>
				<EffectWrapper
					focused={interaction.focused}
					disabled={isDisabled}
				/>

				{signalValue.value?.map((tag) => (
					<div key={tag} className='field-tag__chip' style={getTagStyles(tag)}>
						<span>{tag}</span>
						<span
							className='field-tag__chip-remove'
							onClick={(e) => {
								e.stopPropagation();
								removeTag(tag);
							}}
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='14'
								height='14'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M18 6 6 18' />
								<path d='m6 6 12 12' />
							</svg>
						</span>
					</div>
				))}

				<input
					id={id}
					className='field-tag__input'
					value={inputValue.value}
					onInput={(e) => inputValue.value = e.currentTarget.value}
					onKeyDown={handleKeyDown}
					onFocus={interaction.handleFocus}
					onBlur={interaction.handleBlur}
					disabled={!!isDisabled}
					placeholder={signalValue.value?.length ? '' : placeholder}
				/>
			</div>

			<LabelWrapper
				id={id}
				label={label}
				active={interaction.focused.value ||
					(signalValue.value && signalValue.value.length > 0) ||
					!!placeholder}
				error={!!errorMessage}
				disabled={isDisabled}
				required={required}
				floating={floating}
				position={position}
				floatingRule={floatingRule}
			/>

			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}
```

### File: packages\fields\src\components\TextField.tsx

```tsx
import '../styles/fields/text-field.css';
import { TargetedEvent } from 'preact';
import { computed, Signal } from '@preact/signals';
import { TextFieldProps } from '../types/components/text-field.ts';
import { useFieldState } from '../hooks/useFieldState.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { EffectWrapper } from '../wrappers/EffectWrapper.tsx';
import { AdornmentWrapper } from '../wrappers/AdornmentWrapper.tsx';
import { focusNextElement } from '../hooks/useFocusNext.ts';

export function TextField(props: TextFieldProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		error,
		disabled,
		placeholder,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
		help,
		helpLink,
		helpPosition,
		type = 'text',
		multiline,
		rows = 3,
		maxRows,
		autoComplete,
		pattern,
		min,
		max,
		minLength,
		maxLength,
		showCount,
		prefix,
		suffix,
		prefixProps,
		suffixProps,
		onPrefixClick,
		onSuffixClick,
		onInput,
		onFocus,
		onBlur,
		nextField,
		onKeyDown,
	} = props;

	const fieldState = useFieldState({
		value,
		defaultValue: defaultValue ?? '',
		required,
		disabled,
		error,
		onChange,
	});

	const interaction = useInteraction(fieldState.value.value);

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = fieldState.error.value;
	const val = fieldState.value.value || '';

	const length = computed(() => val.length);
	const isOverLimit = computed(() => maxLength ? length.value > maxLength : false);

	const handleContainerClick = (e: MouseEvent) => {
		if (isDisabled) return;
		const input = (e.currentTarget as HTMLElement).querySelector<
			HTMLInputElement | HTMLTextAreaElement
		>('.field-text__input');
		input?.focus();
	};

	const handleInput = (e: TargetedEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const newValue = e.currentTarget.value;
		fieldState.setValue(newValue);
		interaction.handleChange(newValue);
		onInput?.(e);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !multiline) {
			e.preventDefault();
			focusNextElement(e.currentTarget as HTMLElement, nextField);
		} else if (e.key === 'Tab' && !e.shiftKey && nextField) {
			e.preventDefault();
			focusNextElement(e.currentTarget as HTMLElement, nextField);
		}
		onKeyDown?.(e);
	};

	const renderInput = () => {
		const commonProps = {
			id,
			className: 'field-text__input',
			value: val,
			onInput: handleInput,
			onKeyDown: handleKeyDown,
			onFocus: (e: any) => {
				interaction.handleFocus(e);
				onFocus?.(e);
			},
			onBlur: (e: any) => {
				interaction.handleBlur(e);
				fieldState.validate();
				onBlur?.(e);
			},
			disabled: !!isDisabled,
			placeholder: placeholder,
			autoComplete,
			maxLength,
			minLength,
			min,
			max,
		};

		if (multiline) {
			return (
				<textarea
					{...commonProps}
					rows={rows}
					style={maxRows ? { maxHeight: `${maxRows * 1.5}em` } : undefined}
				/>
			);
		}

		return (
			<input
				{...commonProps}
				type={type}
				pattern={pattern}
			/>
		);
	};

	return (
		<div className={`field-text ${className || ''}`} style={style}>
			<div
				className={[
					'field-text__container',
					interaction.focused.value && 'field-text__container--focused',
					errorMessage && 'field-text__container--error',
					isDisabled && 'field-text__container--disabled',
				].filter(Boolean).join(' ')}
				onClick={handleContainerClick}
			>
				<EffectWrapper
					focused={interaction.focused}
					disabled={isDisabled}
				/>

				<AdornmentWrapper
					position='prefix'
					onClick={onPrefixClick}
					{...prefixProps}
				>
					{prefix}
				</AdornmentWrapper>

				<LabelWrapper
					id={id}
					label={label}
					active={interaction.focused.value || !!val || !!placeholder}
					error={!!errorMessage}
					disabled={isDisabled}
					required={required}
					floating={floating}
					position={position}
					floatingRule={floatingRule}
					multiline={multiline}
					help={help}
					helpLink={helpLink}
					helpPosition={helpPosition} // Passed down
				/>

				{renderInput()}

				<AdornmentWrapper
					position='suffix'
					onClick={onSuffixClick}
					{...suffixProps}
				>
					{suffix}
				</AdornmentWrapper>
			</div>

			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<div style={{ flex: 1 }}>
					<MessageWrapper
						error={fieldState.error}
						hint={hint}
						warning={warning}
						info={info}
					/>
				</div>

				{showCount && maxLength && (
					<div
						className={`field-text__count ${isOverLimit.value ? 'field-text__count--limit' : ''}`}
					>
						{length}/{maxLength}
					</div>
				)}
			</div>
		</div>
	);
}
```

### File: packages\fields\src\components\TimeField.tsx

```tsx
import '../styles/fields/date-field.css';
import { computed, Signal, useSignal } from '@preact/signals';
import { TimeFieldProps, TimeValue } from '../types/components/time-field.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { useFieldState } from '../hooks/useFieldState.ts';
import { AdornmentWrapper } from '../wrappers/AdornmentWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { DateTime } from '@projective/types';
import { Popover } from '@projective/ui';
import { TimeClock } from './datetime/TimeClock.tsx';
import { TextField } from './TextField.tsx';
import { IconClock } from '@tabler/icons-preact';

export function TimeField(props: TimeFieldProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		error,
		disabled,
		placeholder,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
		variant = 'popup',
		selectionMode = 'single',
	} = props;

	// FIX: Explicitly type the field state to allow DateTime arrays
	const fieldState = useFieldState<TimeValue | undefined>({
		value,
		defaultValue,
		required,
		disabled,
		error,
		onChange: onChange as (val: TimeValue | undefined) => void,
	});

	const interaction = useInteraction(fieldState.value.value);
	const isOpen = useSignal(false);

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = fieldState.error.value;

	const displayValue = computed(() => {
		const val = fieldState.value.value;
		if (!val) return '';

		if (Array.isArray(val)) {
			if (val.length === 0) return '';
			if (val.length === 1) return val[0].toFormat('HH:mm');
			return `${val.length} times selected`;
		}

		return (val as DateTime).toFormat('HH:mm');
	});

	const handleTimeSelect = (date: TimeValue) => {
		fieldState.setValue(date);

		// Auto-close logic
		if (selectionMode === 'single' && !Array.isArray(date)) {
			// Small delay to allow visual feedback
			setTimeout(() => {
				isOpen.value = false;
				interaction.handleBlur();
			}, 100);
		}
	};

	// --- Inline Variant ---
	if (variant === 'inline') {
		return (
			<div
				className={`field-date field-date--inline ${className || ''}`}
				style={style}
			>
				<TimeClock
					value={fieldState.value.value}
					onChange={handleTimeSelect}
					selectionMode={selectionMode}
				/>
				<MessageWrapper
					error={error}
					hint={hint}
					warning={warning}
					info={info}
				/>
			</div>
		);
	}

	// --- Popup Variant ---
	return (
		<div className={`field-date ${className || ''}`} style={style}>
			<Popover
				isOpen={isOpen.value}
				onClose={() => {
					isOpen.value = false;
					interaction.handleBlur();
				}}
				trigger={
					<div
						onClick={() => !isDisabled && (isOpen.value = !isOpen.value)}
					>
						<TextField
							id={id}
							label={label}
							value={displayValue.value}
							placeholder={placeholder || 'HH:MM'}
							error={errorMessage}
							disabled={isDisabled}
							required={required}
							floating={floating}
							position={position}
							floatingRule={floatingRule}
							readonly
							suffix={
								<AdornmentWrapper
									position='suffix'
									onClick={(e) => {
										e.stopPropagation();
										!isDisabled &&
											(isOpen.value = !isOpen.value);
									}}
								>
									<IconClock size={18} />
								</AdornmentWrapper>
							}
							onFocus={interaction.handleFocus}
							onBlur={() => {}}
						/>
					</div>
				}
				content={
					<TimeClock
						value={fieldState.value.value}
						onChange={handleTimeSelect}
						selectionMode={selectionMode}
					/>
				}
			/>
			<MessageWrapper
				error={error}
				hint={hint}
				warning={warning}
				info={info}
			/>
		</div>
	);
}
```

### File: packages\fields\src\hooks\useCurrencyMask.ts

```ts
import { Signal, useSignal } from '@preact/signals';

export function useCurrencyMask(
	value: Signal<number | undefined>,
	currency = 'USD',
	locale = 'en-US',
) {
	const displayValue = useSignal('');

	const formatCurrency = (val: number) => {
		return new Intl.NumberFormat(locale, {
			style: 'decimal',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(val);
	};

	const handleBlur = () => {
		if (value.value !== undefined && !isNaN(value.value)) {
			displayValue.value = formatCurrency(value.value);
		} else {
			value.value = 0;
			displayValue.value = formatCurrency(0);
		}
	};

	const handleFocus = () => {
		if (value.value !== undefined && !isNaN(value.value) && value.value !== 0) {
			displayValue.value = value.value.toString();
		} else {
			displayValue.value = '';
		}
	};

	const handleChange = (val: string) => {
		let sanitized = val.replace(/[^0-9.]/g, '');

		const parts = sanitized.split('.');
		if (parts.length > 2) {
			sanitized = parts[0] + '.' + parts.slice(1).join('');
		}

		displayValue.value = sanitized;

		if (sanitized === '' || sanitized === '.') {
			value.value = undefined;
		} else {
			value.value = parseFloat(sanitized);
		}
	};

	const setProgrammaticValue = (newVal: number) => {
		const rounded = Math.round(newVal * 100) / 100;
		value.value = rounded;
		displayValue.value = formatCurrency(rounded);
	};

	if (value.value !== undefined && !displayValue.value) {
		displayValue.value = formatCurrency(value.value);
	}

	return {
		displayValue,
		handleBlur,
		handleFocus,
		handleChange,
		setProgrammaticValue,
	};
}
```

### File: packages\fields\src\hooks\useFieldState.ts

```ts
import { Signal, useSignal } from '@preact/signals';

export interface FieldStateProps<T> {
	value?: T | Signal<T>;
	defaultValue?: T;
	required?: boolean;
	disabled?: boolean | Signal<boolean>;
	error?: string | Signal<string | undefined>;
	onChange?: (value: T) => void;
}

export interface FieldState<T> {
	value: Signal<T>;
	error: Signal<string | undefined>;
	dirty: Signal<boolean>;
	touched: Signal<boolean>;
	setValue: (newValue: T) => void;
	validate: () => boolean;
}

export function useFieldState<T>(props: FieldStateProps<T>): FieldState<T> {
	// Normalize value signal
	const isValueSignal = props.value instanceof Signal;
	const internalValue = useSignal<T>(
		isValueSignal ? (props.value as Signal<T>).peek() : (props.value ?? props.defaultValue) as T,
	);

	// Sync if prop changes and is not a signal
	if (!isValueSignal && props.value !== undefined && props.value !== internalValue.peek()) {
		internalValue.value = props.value as T;
	}

	const valueSignal = isValueSignal ? (props.value as Signal<T>) : internalValue;

	const errorSignal = useSignal<string | undefined>(
		props.error instanceof Signal ? props.error.peek() : props.error,
	);

	// Sync error prop
	if (
		props.error !== undefined && !(props.error instanceof Signal) &&
		props.error !== errorSignal.peek()
	) {
		errorSignal.value = props.error;
	}

	const dirty = useSignal(false);
	const touched = useSignal(false);

	const validate = () => {
		if (props.required) {
			const val = valueSignal.value;
			const isEmpty = val === undefined || val === null || val === '' ||
				(Array.isArray(val) && val.length === 0);
			if (isEmpty) {
				errorSignal.value = 'This field is required';
				return false;
			}
		}
		// Clear error if it was "This field is required" but now has value
		if (errorSignal.value === 'This field is required') {
			errorSignal.value = undefined;
		}
		return true;
	};

	const setValue = (newValue: T) => {
		valueSignal.value = newValue;
		dirty.value = true;
		props.onChange?.(newValue);
		if (touched.value) {
			validate();
		}
	};

	return {
		value: valueSignal,
		error: errorSignal,
		dirty,
		touched,
		setValue,
		validate,
	};
}
```

### File: packages\fields\src\hooks\useFileProcessor.ts

```ts
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { FileProcessor } from '../types/file.ts';
import { FileWithMeta } from '@projective/types';

const generateId = () => Math.random().toString(36).substring(2, 15);

export function useFileProcessor(
	files: FileWithMeta[],
	processors: FileProcessor[] = [],
	onChange: (files: FileWithMeta[]) => void,
) {
	const processingQueue = useSignal<string[]>([]);

	useEffect(() => {
		const pendingFiles = files.filter(
			(f) => f.id && f.status === 'pending' && !processingQueue.value.includes(f.id),
		);

		if (pendingFiles.length === 0) return;

		pendingFiles.forEach((fileMeta) => {
			processFile(fileMeta as FileWithMeta & { id: string });
		});
	}, [files]);

	const processFile = async (fileMeta: FileWithMeta & { id: string }) => {
		const fileId = fileMeta.id;

		processingQueue.value = [...processingQueue.value, fileId];

		updateFile(fileId, { status: 'processing', progress: 0 });

		const processor = processors.find((p) => p.match(fileMeta.file));

		if (!processor) {
			updateFile(fileId, { status: 'ready', progress: 100 });
			removeFromQueue(fileId);
			return;
		}

		try {
			const result = await processor.process(fileMeta.file, (pct) => {
				updateFile(fileId, { progress: pct });
			});

			updateFile(fileId, {
				file: result.file,
				processingMeta: result.metadata,
				status: 'ready',
				progress: 100,
			});
		} catch (err: any) {
			updateFile(fileId, {
				status: 'error',
				errors: [{ code: 'PROCESSING_ERROR', message: err.message || 'Unknown error' }],
			});
		} finally {
			removeFromQueue(fileId);
		}
	};

	const updateFile = (id: string | undefined, updates: Partial<FileWithMeta>) => {
		if (!id) return;
		const newFiles = files.map((f) => (f.id === id ? { ...f, ...updates } : f));
		onChange(newFiles);
	};

	const removeFromQueue = (id: string | undefined) => {
		if (!id) return;
		processingQueue.value = processingQueue.value.filter((pid) => pid !== id);
	};

	const addFiles = (newFiles: File[]) => {
		const newFileMetas: FileWithMeta[] = newFiles.map((f) => ({
			file: f,
			originalFile: f,
			id: generateId(),
			status: 'pending',
			progress: 0,
			errors: [],
		}));

		onChange([...files, ...newFileMetas]);
	};

	const removeFile = (id: string | undefined) => {
		if (!id) return;
		onChange(files.filter((f) => f.id !== id));
	};

	return {
		addFiles,
		removeFile,
	};
}
```

### File: packages\fields\src\hooks\useFocusNext.ts

```ts
export function focusNextElement(current: HTMLElement, explicitNext?: string | HTMLElement) {
	if (explicitNext) {
		const target = typeof explicitNext === 'string'
			? document.getElementById(explicitNext)
			: explicitNext;
		if (target) {
			target.focus();
			return;
		}
	}

	const focusableSelector =
		'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
	const root = current.closest('form') || document.body;

	const elements = Array.from(root.querySelectorAll<HTMLElement>(focusableSelector))
		.filter((el) => {
			return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
		});

	const index = elements.indexOf(current);
	if (index > -1 && index < elements.length - 1) {
		elements[index + 1].focus();
	}
}
```

### File: packages\fields\src\hooks\useGlobalDrag.ts

```ts
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';

export function useGlobalDrag() {
	const isDragging = useSignal(false);

	useEffect(() => {
		let dragCounter = 0;

		const handleDragEnter = (e: DragEvent) => {
			e.preventDefault();
			dragCounter++;
			if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
				isDragging.value = true;
			}
		};

		const handleDragLeave = (e: DragEvent) => {
			e.preventDefault();
			dragCounter--;
			if (dragCounter === 0) {
				isDragging.value = false;
			}
		};

		const handleDragOver = (e: DragEvent) => {
			e.preventDefault();
		};

		const handleDrop = (e: DragEvent) => {
			e.preventDefault();
			dragCounter = 0;
			isDragging.value = false;
		};

		globalThis.addEventListener('dragenter', handleDragEnter);
		globalThis.addEventListener('dragleave', handleDragLeave);
		globalThis.addEventListener('dragover', handleDragOver);
		globalThis.addEventListener('drop', handleDrop);

		return () => {
			globalThis.removeEventListener('dragenter', handleDragEnter);
			globalThis.removeEventListener('dragleave', handleDragLeave);
			globalThis.removeEventListener('dragover', handleDragOver);
			globalThis.removeEventListener('drop', handleDrop);
		};
	}, []);

	return isDragging;
}
```

### File: packages\fields\src\hooks\useInteraction.ts

```ts
import { Signal, useSignal } from '@preact/signals';

export interface InteractionState {
	focused: Signal<boolean>;
	hovered: Signal<boolean>;
	active: Signal<boolean>;
	dirty: Signal<boolean>;
	touched: Signal<boolean>;
	handleFocus: (e?: FocusEvent | MouseEvent) => void;
	handleBlur: (e?: FocusEvent | MouseEvent) => void;
	handleMouseEnter: (e: MouseEvent) => void;
	handleMouseLeave: (e: MouseEvent) => void;
	handleMouseDown: (e: MouseEvent) => void;
	handleMouseUp: (e: MouseEvent) => void;
	handleChange: (value: unknown) => void;
}

export function useInteraction(initialValue?: unknown): InteractionState {
	const focused = useSignal(false);
	const hovered = useSignal(false);
	const active = useSignal(false);
	const dirty = useSignal(false);
	const touched = useSignal(false);

	// Track initial value to determine dirty state
	const _initialValue = initialValue;

	const handleFocus = (_e?: FocusEvent | MouseEvent) => {
		focused.value = true;
		touched.value = true;
	};

	const handleBlur = (_e?: FocusEvent | MouseEvent) => {
		focused.value = false;
	};

	const handleMouseEnter = (_e: MouseEvent) => {
		hovered.value = true;
	};

	const handleMouseLeave = (_e: MouseEvent) => {
		hovered.value = false;
		active.value = false; // Ensure active is cleared
	};

	const handleMouseDown = (_e: MouseEvent) => {
		active.value = true;
	};

	const handleMouseUp = (_e: MouseEvent) => {
		active.value = false;
	};

	const handleChange = (value: unknown) => {
		dirty.value = value !== _initialValue;
	};

	return {
		focused,
		hovered,
		active,
		dirty,
		touched,
		handleFocus,
		handleBlur,
		handleMouseEnter,
		handleMouseLeave,
		handleMouseDown,
		handleMouseUp,
		handleChange,
	};
}
```

### File: packages\fields\src\hooks\useSelectState.ts

```ts
import { computed, Signal, useSignal } from '@preact/signals';
import { SelectOption } from '../types/components/select-field.ts';

interface UseSelectStateProps<T> {
	options: SelectOption<T>[];
	value?: T | T[] | Signal<T | T[]>;
	onChange?: (val: T | T[]) => void;
	multiple?: boolean;
	disabled?: boolean;
	groupSelectMode?: 'value' | 'members';
}

// Internal Interface for the flattened list
export interface FlatOption<T> extends SelectOption<T> {
	depth: number;
	isGroup: boolean;
	// Cache all descendant values for quick "select all members" logic
	descendantValues: T[];
}

export function useSelectState<T>({
	options,
	value,
	onChange,
	multiple,
	disabled,
	groupSelectMode = 'value',
}: UseSelectStateProps<T>) {
	const isOpen = useSignal(false);
	const highlightedIndex = useSignal(-1);
	const searchQuery = useSignal('');

	// Helper: Flatten tree to list
	const flattenOptions = (
		opts: SelectOption<T>[],
		depth = 0,
		accum: FlatOption<T>[] = [],
	): FlatOption<T>[] => {
		for (const opt of opts) {
			const isGroup = !!(opt.options && opt.options.length > 0);

			// Recursively get descendants if it's a group
			let descendantValues: T[] = [];
			let childrenFlat: FlatOption<T>[] = [];

			if (isGroup && opt.options) {
				childrenFlat = flattenOptions(opt.options, depth + 1);
				// Collect leaf values from children
				descendantValues = childrenFlat
					.filter((c) => !c.isGroup || groupSelectMode === 'value') // If mode is value, groups are valid values too
					.map((c) => c.value);

				// Also include children's descendants
				childrenFlat.forEach((c) => {
					if (c.isGroup) descendantValues.push(...c.descendantValues);
				});

				// Dedup
				descendantValues = Array.from(new Set(descendantValues));
			}

			accum.push({
				...opt,
				depth,
				isGroup,
				descendantValues,
			});

			if (isGroup) {
				accum.push(...childrenFlat);
			}
		}
		return accum;
	};

	// Flatten once (memoized by computed if options change)
	const flatOptions = computed(() => flattenOptions(options));

	const selectedValues = computed(() => {
		const val = value instanceof Signal ? value.value : (value ?? []);
		return Array.isArray(val) ? val : (val ? [val] : []);
	});

	const filteredOptions = computed(() => {
		const query = searchQuery.value.toLowerCase();
		if (!query) return flatOptions.value;
		return flatOptions.value.filter((opt) => opt.label.toLowerCase().includes(query));
	});

	const toggleOpen = (forceState?: boolean) => {
		if (disabled) return;
		const newState = forceState !== undefined ? forceState : !isOpen.value;
		isOpen.value = newState;

		if (newState) {
			// Find first selected index to highlight
			const firstSelected = filteredOptions.value.findIndex((o) =>
				selectedValues.value.includes(o.value)
			);
			highlightedIndex.value = firstSelected >= 0 ? firstSelected : 0;
		} else {
			searchQuery.value = '';
			highlightedIndex.value = -1;
		}
	};

	const selectOption = (option: FlatOption<T>) => {
		if (option.disabled) return;

		let newValue: T | T[];

		if (multiple) {
			const current = selectedValues.value as T[];

			// Logic for Group Members Selection
			if (option.isGroup && groupSelectMode === 'members') {
				const targets = option.descendantValues;
				const allSelected = targets.every((v) => current.includes(v));

				if (allSelected) {
					// Deselect all members
					newValue = current.filter((v) => !targets.includes(v));
				} else {
					// Select all members (union)
					const toAdd = targets.filter((v) => !current.includes(v));
					newValue = [...current, ...toAdd];
				}
			} else {
				// Standard Toggle
				const exists = current.includes(option.value);
				if (exists) {
					newValue = current.filter((v) => v !== option.value);
				} else {
					newValue = [...current, option.value];
				}
			}

			searchQuery.value = '';
			if (value instanceof Signal) value.value = newValue;
		} else {
			// Single Select
			// If clicking a group in 'members' mode, do nothing or expand?
			// Usually single select can't select multiple members, so we treat group as unselectable label
			// or we treat it as selecting the group value itself if allowGroupSelection is true.

			if (option.isGroup && groupSelectMode === 'members') {
				// In single mode, 'members' doesn't make sense for assignment.
				// We assume clicking it does nothing or perhaps expands (if we had collapsible).
				return;
			}

			newValue = option.value;
			if (value instanceof Signal) value.value = newValue;
			toggleOpen(false);
		}

		onChange?.(newValue);
	};

	const removeValue = (valToRemove: T) => {
		if (!multiple) {
			if (value instanceof Signal) value.value = undefined as any;
			onChange?.(undefined as any);
			return;
		}

		const current = selectedValues.value as T[];
		const newValue = current.filter((v) => v !== valToRemove);

		if (value instanceof Signal) value.value = newValue;
		onChange?.(newValue);
	};

	const toggleSelectAll = () => {
		if (!multiple) return;

		// Filter out groups if we are only selecting leaf nodes, OR select everything if mode is value
		const candidateOptions = filteredOptions.value.filter((o) =>
			!o.disabled && (!o.isGroup || groupSelectMode === 'value')
		);

		const enabledValues = candidateOptions.map((o) => o.value);
		const current = selectedValues.value as T[];

		const allSelected = enabledValues.every((v) => current.includes(v));

		let newValue: T[];
		if (allSelected) {
			newValue = current.filter((v) => !enabledValues.includes(v));
		} else {
			const toAdd = enabledValues.filter((v) => !current.includes(v));
			newValue = [...current, ...toAdd];
		}

		if (value instanceof Signal) value.value = newValue;
		onChange?.(newValue);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (disabled) return;

		if (!isOpen.value && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
			e.preventDefault();
			toggleOpen(true);
			return;
		}

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				if (highlightedIndex.value < filteredOptions.value.length - 1) {
					highlightedIndex.value++;
				}
				break;
			case 'ArrowUp':
				e.preventDefault();
				if (highlightedIndex.value > 0) {
					highlightedIndex.value--;
				}
				break;
			case 'Enter':
				e.preventDefault();
				if (isOpen.value) {
					if (highlightedIndex.value >= 0) {
						const opt = filteredOptions.value[highlightedIndex.value];
						if (opt) selectOption(opt);
					} else {
						// If open but nothing is highlighted, Enter closes the menu
						toggleOpen(false);
					}
				}
				break;
			case 'Escape':
				e.preventDefault();
				toggleOpen(false);
				break;
			case 'Backspace':
				if (searchQuery.value === '' && multiple && selectedValues.value.length > 0) {
					const last = selectedValues.value[selectedValues.value.length - 1];
					removeValue(last);
				}
				break;
			case 'Tab':
				if (isOpen.value) toggleOpen(false);
				break;
		}
	};

	return {
		isOpen,
		highlightedIndex,
		searchQuery,
		filteredOptions,
		selectedValues,
		toggleOpen,
		selectOption,
		removeValue,
		toggleSelectAll,
		handleKeyDown,
	};
}
```

### File: packages\fields\src\hooks\useSliderState.ts

```ts
import { useComputed, useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import {
	clamp,
	percentToValue,
	percentToValueLog,
	roundToStep,
	snapToClosest,
	valueToPercent,
	valueToPercentLog,
} from '@projective/utils';
import { SliderMark } from '../types/components/slider-field.ts';

interface UseSliderStateProps {
	value?: number | number[];
	onChange?: (val: number | number[]) => void;
	min: number;
	max: number;
	step: number;
	range?: boolean;
	disabled?: boolean;
	marks?: boolean | number[] | SliderMark[];
	snapToMarks?: boolean;
	vertical?: boolean;
	scale?: 'linear' | 'logarithmic';
	minDistance?: number;
	passthrough?: boolean;
}

export function useSliderState({
	value,
	onChange,
	min,
	max,
	step,
	range,
	disabled,
	marks,
	snapToMarks,
	vertical,
	scale = 'linear',
	minDistance = 0,
	passthrough = false,
}: UseSliderStateProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const activeHandleIdx = useSignal<number | null>(null);
	const internalValues = useSignal<number[]>([]);

	const isLog = scale === 'logarithmic';

	useEffect(() => {
		if (activeHandleIdx.value !== null) return;
		if (range) {
			if (Array.isArray(value)) internalValues.value = value;
			else internalValues.value = [min, max];
		} else {
			if (typeof value === 'number') internalValues.value = [value];
			else internalValues.value = [min];
		}
	}, [value, range, min, max, activeHandleIdx.value]);

	const snapPoints = useComputed(() => {
		if (!snapToMarks || !marks) return null;
		if (Array.isArray(marks)) {
			return marks.map((m) => (typeof m === 'number' ? m : m.value));
		}
		return null;
	});

	const calcValueFromPointer = (e: { clientX: number; clientY: number }) => {
		if (!trackRef.current) return min;
		const rect = trackRef.current.getBoundingClientRect();

		let percent = 0;
		if (vertical) {
			percent = ((rect.bottom - e.clientY) / rect.height) * 100;
		} else {
			percent = ((e.clientX - rect.left) / rect.width) * 100;
		}

		const rawValue = isLog
			? percentToValueLog(percent, min, max)
			: percentToValue(percent, min, max);

		if (snapToMarks && snapPoints.value) {
			return snapToClosest(rawValue, snapPoints.value);
		}
		return roundToStep(rawValue, step);
	};

	const handlePointerDown = (index: number, e: PointerEvent) => {
		if (disabled) return;
		e.preventDefault();
		e.stopPropagation();

		const target = e.target as HTMLElement;
		target.setPointerCapture(e.pointerId);
		activeHandleIdx.value = index;
		target.focus();
	};

	const handleTrackClick = (e: PointerEvent) => {
		if (disabled || activeHandleIdx.value !== null) return;

		const val = calcValueFromPointer(e);
		const current = internalValues.value;

		let closestIdx = 0;
		let minDiff = Infinity;

		current.forEach((v, i) => {
			const diff = Math.abs(v - val);
			if (diff < minDiff) {
				minDiff = diff;
				closestIdx = i;
			}
		});

		updateValue(closestIdx, val);
	};

	const handlePointerMove = (e: PointerEvent) => {
		if (activeHandleIdx.value === null || disabled) return;
		const newVal = calcValueFromPointer(e);
		updateValue(activeHandleIdx.value, newVal);
	};

	const handlePointerUp = (e: PointerEvent) => {
		if (activeHandleIdx.value !== null) {
			const target = e.target as HTMLElement;
			target.releasePointerCapture(e.pointerId);
			activeHandleIdx.value = null;
		}
	};

	const updateValue = (index: number, rawNewValue: number) => {
		const current = [...internalValues.value];
		let newValue = clamp(rawNewValue, min, max);

		// Collision / Passthrough Logic
		if (!passthrough) {
			const dist = minDistance;

			// Check Previous
			if (index > 0) {
				const prevVal = current[index - 1];
				if (newValue < prevVal + dist) newValue = prevVal + dist;
			}

			// Check Next
			if (index < current.length - 1) {
				const nextVal = current[index + 1];
				if (newValue > nextVal - dist) newValue = nextVal - dist;
			}
		}

		newValue = clamp(newValue, min, max);

		if (current[index] !== newValue) {
			current[index] = newValue;
			internalValues.value = current;
			if (range) onChange?.(current);
			else onChange?.(current[0]);
		}
	};

	const handleStyles = useComputed(() => {
		return internalValues.value.map((v) => {
			const pct = isLog ? valueToPercentLog(v, min, max) : valueToPercent(v, min, max);

			return vertical ? { bottom: `${pct}%`, left: '50%' } : { left: `${pct}%`, top: '50%' };
		});
	});

	const trackFillStyle = useComputed(() => {
		const count = internalValues.value.length;
		if (count === 0) return {};

		// For Track Fill, we always want min to max visually,
		// regardless of which handle is which (if passthrough is on).
		const values = [...internalValues.value].sort((a, b) => a - b);
		const firstVal = values[0];
		const lastVal = values[count - 1];

		const startPct = range
			? (isLog ? valueToPercentLog(firstVal, min, max) : valueToPercent(firstVal, min, max))
			: 0;

		const endPct = isLog ? valueToPercentLog(lastVal, min, max) : valueToPercent(lastVal, min, max);

		const size = Math.abs(endPct - startPct);
		const startPos = Math.min(startPct, endPct);

		return vertical
			? { bottom: `${startPos}%`, height: `${size}%`, left: 0, width: '100%' }
			: { left: `${startPos}%`, width: `${size}%`, top: 0, height: '100%' };
	});

	return {
		trackRef,
		internalValues,
		activeHandleIdx,
		handleStyles,
		trackFillStyle,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		handleTrackClick,
	};
}
```

### File: packages\fields\src\types\components\combobox-field.ts

```ts
import { SelectFieldProps } from './select-field.ts';

/**
 * ComboboxField specific props.
 */
export interface ComboboxFieldProps<T = string> extends SelectFieldProps<T> {
	// Combobox specific props
}
```

### File: packages\fields\src\types\components\date-field.ts

```ts
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';
import { DateTime } from '@projective/types';

export type DateSelectionMode = 'single' | 'multiple' | 'range';
export type DateFieldVariant = 'popup' | 'inline' | 'input';

// The value type changes based on mode
export type SingleDateValue = DateTime | null;
export type MultipleDateValue = DateTime[];
export type RangeDateValue = [DateTime | null, DateTime | null];

export type DateValue = SingleDateValue | MultipleDateValue | RangeDateValue;

/**
 * Modifiers allow external logic to style specific dates.
 * e.g. { disabled: (d) => d.isWeekend(), highlighted: (d) => d.day === 1 }
 */
export type DateModifiers = {
	disabled?: (date: DateTime) => boolean;
	highlighted?: (date: DateTime) => boolean;
	hidden?: (date: DateTime) => boolean;
	[key: string]: ((date: DateTime) => boolean) | undefined;
};

export interface DateFieldProps extends
	// We override ValueFieldProps because 'value' is dynamic here
	Omit<ValueFieldProps<any>, 'value' | 'onChange'>,
	AdornmentProps,
	Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
	Omit<MessageWrapperProps, 'error' | 'hint'> {
	value?: DateValue;
	onChange?: (value: any) => void; // Typed loosely here, narrowed in component

	/**
	 * How the component behaves.
	 * - popup: Standard input with dropdown (Default)
	 * - inline: Calendar rendered directly in page
	 * - input: Text input only (validation only)
	 */
	variant?: DateFieldVariant;

	/**
	 * Selection logic.
	 * - single: One date
	 * - multiple: Array of dates
	 * - range: [Start, End]
	 */
	selectionMode?: DateSelectionMode;

	/**
	 * External logic to style/disable dates.
	 * Use this for "Every Monday" or "Blocked Dates" logic.
	 */
	modifiers?: DateModifiers;

	minDate?: DateTime;
	maxDate?: DateTime;
	format?: string;
}
```

### File: packages\fields\src\types\components\datetime-field.ts

```ts
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';
import { DateTime } from '@projective/types';

/**
 * DateTimeField specific props.
 */
export interface DateTimeFieldProps
	extends
		ValueFieldProps<DateTime>,
		AdornmentProps,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	min?: DateTime;
	max?: DateTime;
	clearable?: boolean;
}
```

### File: packages\fields\src\types\components\file-drop.ts

```ts
import { BaseFieldProps, ValueFieldProps } from '../core.ts';
import { Signal } from '@preact/signals';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * FileDrop specific props.
 */
export interface FileDropProps
	extends
		ValueFieldProps<File[]>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	accept?: string;
	multiple?: boolean;
	maxSize?: number;
	maxFiles?: number;
}
```

### File: packages\fields\src\types\components\money-field.ts

```ts
// deno-lint-ignore-file no-explicit-any
import { ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * MoneyField specific props.
 */
export interface MoneyFieldProps
	extends
		ValueFieldProps<number>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	currency?: string;
	locale?: string;
	onInput?: (e: any) => void;
	onBlur?: (e: any) => void;
	onFocus?: (e: any) => void;
}
```

### File: packages\fields\src\types\components\rich-text-field.ts

```ts
import { JSX } from 'preact';
import { Signal } from '@preact/signals';
import { ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

export type RichTextFormat = 'delta' | 'html' | 'markdown';
export type RichTextVariant = 'framed' | 'inline';

export interface RichTextFieldProps
	extends
		ValueFieldProps<string>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	outputFormat?: RichTextFormat;

	toolbar?: 'basic' | 'full' | any[];
	variant?: RichTextVariant;
	secureLinks?: boolean;

	onImageUpload?: (file: File) => Promise<string>;

	placeholder?: string;
	readOnly?: boolean;

	/** Minimum height of the editor area (e.g. "150px") */
	minHeight?: string | number;

	/** Maximum height before scrolling occurs (e.g. "300px") */
	maxHeight?: string | number;

	/** Soft limit for character count. Shows red counter if exceeded. */
	maxLength?: number;

	/** Whether to show the character counter */
	showCount?: boolean;
}
```

### File: packages\fields\src\types\components\select-field.ts

```ts
import { JSX } from 'preact';
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * Select option interface.
 */
export interface SelectOption<T = string> {
	label: string;
	value: T;
	disabled?: boolean;
	icon?: JSX.Element;
	avatarUrl?: string;
	/**
	 * Nested options for groups.
	 */
	options?: SelectOption<T>[];
	/**
	 * Legacy flat grouping (deprecated in favor of options nesting)
	 */
	group?: string;
}

export type SelectDisplayMode = 'chips-inside' | 'chips-below' | 'count' | 'text';

/**
 * SelectField specific props.
 */
export interface SelectFieldProps<T = string> extends
	// We allow T | T[] for value
	Omit<ValueFieldProps<T | T[]>, 'value' | 'onChange'>,
	AdornmentProps,
	Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
	Omit<MessageWrapperProps, 'error' | 'hint'> {
	// Value & Change override for generics
	value?: T | T[] | any;
	onChange?: (value: T | T[]) => void;

	options: SelectOption<T>[];
	multiple?: boolean;
	searchable?: boolean;
	clearable?: boolean;
	loading?: boolean;

	// Multi-select config
	displayMode?: SelectDisplayMode;
	enableSelectAll?: boolean;

	/**
	 * Defines behavior when a group option is clicked.
	 * - 'value': Selects the group's own value (treated as a selectable item).
	 * - 'members': Selects/Deselects all descendant leaf options (only valid if multiple=true).
	 * @default 'value'
	 */
	groupSelectMode?: 'value' | 'members';

	// Custom Icons
	icons?: {
		arrow?: JSX.Element;
		arrowOpen?: JSX.Element;
		check?: JSX.Element;
		remove?: JSX.Element;
		loading?: JSX.Element;
		invalid?: JSX.Element;
		valid?: JSX.Element;
	};
}
```

### File: packages\fields\src\types\components\slider-field.ts

```ts
import { ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * SliderField specific props.
 */
export interface SliderMark {
	value: number;
	label?: string;
	className?: string; // ADDED: Allows custom CSS targeting per mark type
}

/**
 * SliderField specific props.
 */
export interface SliderFieldProps
	extends
		ValueFieldProps<number | number[]>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	min?: number;
	max?: number;
	step?: number;
	marks?: boolean | number[] | SliderMark[];
	range?: boolean;
	vertical?: boolean;
	scale?: 'linear' | 'logarithmic';
	minDistance?: number;
	snapToMarks?: boolean;
	height?: string;
	passthrough?: boolean;
}
```

### File: packages\fields\src\types\components\tag-input.ts

```ts
import { ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * TagInput specific props.
 */
export interface TagInputProps
	extends
		ValueFieldProps<string[]>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	tagColor?: string | ((tag: string) => string);
	tagVariant?: 'solid' | 'transparent';
}
```

### File: packages\fields\src\types\components\text-field.ts

```ts
// deno-lint-ignore-file no-explicit-any
import { HTMLAttributes } from 'preact';
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

export interface TextFieldProps
	extends
		ValueFieldProps<string>,
		AdornmentProps,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
	multiline?: boolean;
	rows?: number;
	maxRows?: number;
	autoComplete?: string;
	pattern?: string;
	min?: number | string;
	max?: number | string;
	minLength?: number;
	maxLength?: number;
	showCount?: boolean;
	prefixProps?: HTMLAttributes<HTMLDivElement>;
	suffixProps?: HTMLAttributes<HTMLDivElement>;
	onInput?: (e: any) => void;
	onBlur?: (e: any) => void;
	onFocus?: (e: any) => void;
}
```

### File: packages\fields\src\types\components\time-field.ts

```ts
import { DateTime } from '@projective/types';
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

export type TimeSelectionMode = 'single' | 'multiple';
export type TimeValue = DateTime | DateTime[];

/**
 * TimeField specific props.
 */
export interface TimeFieldProps extends
	// Override generic ValueFieldProps to support arrays
	Omit<ValueFieldProps<any>, 'value' | 'onChange'>,
	AdornmentProps,
	Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
	Omit<MessageWrapperProps, 'error' | 'hint'> {
	value?: TimeValue;
	onChange?: (value: TimeValue) => void;

	/**
	 * Visual variant
	 * @default 'popup'
	 */
	variant?: 'popup' | 'inline' | 'input';

	/**
	 * Selection mode
	 * @default 'single'
	 */
	selectionMode?: TimeSelectionMode;
}
```

### File: packages\fields\src\types\core.ts

```ts
import { Signal } from '@preact/signals';
import { CSSProperties, JSX } from 'preact';

export interface BaseFieldProps {
	id?: string;
	name?: string;
	label?: string;
	placeholder?: string;
	disabled?: boolean | Signal<boolean>;
	readonly?: boolean | Signal<boolean>;
	loading?: boolean | Signal<boolean>;
	required?: boolean;
	floating?: boolean;
	className?: string;
	style?: CSSProperties;
	nextField?: string | HTMLElement;
	onKeyDown?: (e: KeyboardEvent) => void;
}

export type FieldVariant = 'outlined' | 'filled' | 'standard';
export type FieldDensity = 'compact' | 'normal' | 'comfortable';

export type ValidationStatus =
	| 'success'
	| 'warning'
	| 'error'
	| 'info'
	| 'neutral';

export interface ValueFieldProps<T> extends BaseFieldProps {
	value?: T | Signal<T>;
	defaultValue?: T;
	onChange?: (value: T) => void;
	error?: string | Signal<string | undefined>;
	hint?: string;
}

export interface AdornmentProps {
	prefix?: JSX.Element | string;
	suffix?: JSX.Element | string;
	onPrefixClick?: (e: MouseEvent) => void;
	onSuffixClick?: (e: MouseEvent) => void;
}
```

### File: packages\fields\src\types\file.ts

```ts
import { FileWithMeta } from '@projective/types';
import { ValueFieldProps } from './core.ts';
import { LabelWrapperProps, MessageWrapperProps } from './wrappers.ts';
import { Signal } from '@preact/signals';

export type FileStatus = 'pending' | 'processing' | 'ready' | 'error';

export interface FileError {
	code: string;
	message: string;
}

export interface FileProcessor {
	id: string;
	name: string;
	match: (file: File) => boolean;
	process: (
		file: File,
		onProgress?: (pct: number) => void,
	) => Promise<{ file: File; metadata?: any }>;
}

export interface FileFieldProps
	extends
		ValueFieldProps<FileWithMeta[]>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	accept?: string;
	maxSize?: number;
	maxFiles?: number;
	multiple?: boolean;
	layout?: 'list' | 'grid';
	dropzoneLabel?: string;
	processors?: FileProcessor[];
	onDrop?: (acceptedFiles: File[], rejectedFiles: FileWithMeta[]) => void;
	value?: Signal<FileWithMeta[]>;
	onChange?: (files: FileWithMeta[]) => void;
	variant?: 'split' | 'single';
	onLibraryClick?: () => void;
	listPosition?: 'top' | 'bottom' | 'none';
	actionPosition?: 'below' | 'overlay';
}
```

### File: packages\fields\src\types\wrappers.ts

```ts
import { Signal } from '@preact/signals';
import { JSX } from 'preact';

export type HelpPosition = 'inline' | 'top-right' | 'bottom-right' | 'bottom-left';

/**
 * Props for the LabelWrapper component.
 */
export interface LabelWrapperProps {
	id?: string;
	label?: string;
	required?: boolean;
	floating?: boolean;

	/**
	 * Tooltip text to display.
	 */
	help?: string | JSX.Element;

	/**
	 * Optional URL to navigate to when the help icon is clicked.
	 */
	helpLink?: string;

	/**
	 * Position of the help icon.
	 * - 'inline': Next to the label text (moves with label).
	 * - 'top-right': Fixed to the top-right of the component.
	 * - 'bottom-right': Fixed to the bottom-right.
	 * - 'bottom-left': Fixed to the bottom-left.
	 * @default 'inline'
	 */
	helpPosition?: HelpPosition;

	active?: boolean | Signal<boolean>;
	error?: boolean | Signal<boolean>;
	disabled?: boolean | Signal<boolean>;
	className?: string;
	/** Inline styles for precise control */
	style?: JSX.CSSProperties;
	/**
	 * Position of the label relative to the field.
	 * @default "top"
	 */
	position?: 'top' | 'left' | 'right' | 'bottom';
	/**
	 * Floating behavior rules.
	 * - auto: Floats when focused or has value (default)
	 * - always: Always floating (static top)
	 * - never: Never floats (placeholder style)
	 */
	floatingRule?: 'auto' | 'always' | 'never';
	/**
	 * Origin point for floating animation.
	 * - top-left: Standard Material (default)
	 * - center: Starts as placeholder, moves up
	 */
	floatingOrigin?: 'top-left' | 'center';
	/**
	 * If true, adjusts start position for textareas (top aligned vs center aligned)
	 */
	multiline?: boolean;
}

/**
 * Props for the AdornmentWrapper component.
 */
export interface AdornmentWrapperProps {
	children?: JSX.Element | string;
	position?: 'prefix' | 'suffix';
	onClick?: (e: MouseEvent) => void;
	className?: string;
}

/**
 * Props for the MessageWrapper component.
 */
export interface MessageWrapperProps {
	error?: string | Signal<string | undefined>;
	warning?: string | Signal<string | undefined>;
	info?: string | Signal<string | undefined>;
	hint?: string;
}

/**
 * Props for the SkeletonWrapper component.
 */
export interface SkeletonWrapperProps {
	loading?: boolean | Signal<boolean>;
	variant?: 'rect' | 'circle' | 'pill';
	width?: string | number;
	height?: string | number;
	className?: string;
}

/**
 * Props for the EffectWrapper component.
 */
export interface EffectWrapperProps {
	focused?: boolean | Signal<boolean>;
	disabled?: boolean | Signal<boolean>;
	children?: JSX.Element | JSX.Element[];
}

/**
 * Props for the FieldArrayWrapper component.
 */
export interface FieldArrayWrapperProps<T> {
	items: T[] | Signal<T[]>;
	onAdd?: () => void;
	onRemove?: (index: number) => void;
	renderItem: (item: T, index: number) => JSX.Element;
	renderAddButton?: (onClick: () => void) => JSX.Element;
	renderRemoveButton?: (onClick: () => void) => JSX.Element;
	className?: string;
	maxItems?: number;
}
```

### File: packages\fields\src\wrappers\AdornmentWrapper.tsx

```tsx
import { JSX } from 'preact';
import '../styles/wrappers/adornment-wrapper.css';

export interface AdornmentWrapperProps extends JSX.HTMLAttributes<HTMLDivElement> {
	children?: JSX.Element | string;
	position: 'prefix' | 'suffix';
}

export function AdornmentWrapper(props: AdornmentWrapperProps) {
	const { children, position, className, onClick, ...rest } = props;

	if (!children) return null;

	const classes = [
		'field-adornment',
		`field-adornment--${position}`,
		(onClick || rest.onPointerDown) && 'field-adornment--interactive',
		className,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={classes} onClick={onClick} {...rest}>
			{children}
		</div>
	);
}
```

### File: packages\fields\src\wrappers\EffectWrapper.tsx

```tsx
import { JSX } from 'preact';
import { Signal } from '@preact/signals';
import { useRipple } from '@projective/ui';
import '../styles/wrappers/effect-wrapper.css';

interface EffectWrapperProps {
	focused?: boolean | Signal<boolean>;
	disabled?: boolean | Signal<boolean>;
	children?: JSX.Element | JSX.Element[];
}

export function EffectWrapper(props: EffectWrapperProps) {
	const isFocused = props.focused instanceof Signal ? props.focused.value : props.focused;
	const isDisabled = props.disabled instanceof Signal ? props.disabled.value : props.disabled;

	const { ripples } = useRipple();

	if (isDisabled) return null;
	return (
		<>
			<div
				className={`field-focus-ring ${isFocused ? 'field-focus-ring--active' : ''}`}
			/>
			<div
				className='field-ripple-container'
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					overflow: 'hidden',
					pointerEvents: 'none',
					borderRadius: 'inherit',
				}}
			>
				{ripples.value.map((r) => (
					<span
						key={r.id}
						className='field-ripple'
						style={{ left: r.x, top: r.y }}
					/>
				))}
			</div>
		</>
	);
}

// We also need to export the hook so components can use it if they want manual control
export { useRipple };
```

### File: packages\fields\src\wrappers\FieldArrayWrapper.tsx

```tsx
import { JSX } from 'preact';
import { Signal } from '@preact/signals';
import '../styles/wrappers/field-array-wrapper.css';

interface FieldArrayWrapperProps<T> {
	items: T[] | Signal<T[]>;
	onAdd?: () => void;
	onRemove?: (index: number) => void;
	renderItem: (item: T, index: number) => JSX.Element;
	renderAddButton?: (onClick: () => void) => JSX.Element;
	renderRemoveButton?: (onClick: () => void) => JSX.Element;
	className?: string;
	maxItems?: number;
}

export function FieldArrayWrapper<T>(props: FieldArrayWrapperProps<T>) {
	const items = props.items instanceof Signal ? props.items.value : props.items;

	return (
		<div className={`field-array ${props.className || ''}`}>
			{items.map((item, index) => (
				<div key={index} className='field-array__item'>
					<div style={{ flex: 1 }}>
						{props.renderItem(item, index)}
					</div>
					{props.onRemove && (
						<div className='field-array__action'>
							{props.renderRemoveButton
								? (
									props.renderRemoveButton(() => props.onRemove!(index))
								)
								: (
									<button
										type='button'
										onClick={() => props.onRemove!(index)}
										className='field-array__remove-btn'
										aria-label='Remove item'
									>
										&times;
									</button>
								)}
						</div>
					)}
				</div>
			))}

			{props.onAdd &&
				(!props.maxItems || items.length < props.maxItems) && (
				<div className='field-array__add'>
					{props.renderAddButton
						? (
							props.renderAddButton(props.onAdd)
						)
						: (
							<button
								type='button'
								onClick={props.onAdd}
								className='field-array__add-btn'
							>
								+ Add Item
							</button>
						)}
				</div>
			)}
		</div>
	);
}
```

### File: packages\fields\src\wrappers\GlobalFileDrop.tsx

```tsx
import { ComponentChildren } from 'preact';
import { useGlobalDrag } from '../hooks/useGlobalDrag.ts';
import { FileFieldProps } from '../types/file.ts';
import { FileDrop } from '../components/FileDrop.tsx';

interface GlobalFileDropProps extends FileFieldProps {
	children: ComponentChildren;
	overlayText?: string;
}

export default function GlobalFileDrop(props: GlobalFileDropProps) {
	const isDragging = useGlobalDrag();
	const { children, overlayText, ...fileDropProps } = props;

	return (
		<div
			className='global-drop-wrapper'
			style={{ position: 'relative', height: '100%', minHeight: '100vh' }}
		>
			{/* 1. Main Content */}
			<div className='global-drop-content'>
				{children}
			</div>

			{/* 2. Overlay (Visible on Drag) */}
			{isDragging.value && (
				<div
					className='global-drop-overlay'
					style={{
						position: 'fixed',
						inset: 0,
						zIndex: 9999,
						background: 'rgba(255, 255, 255, 0.9)',
						backdropFilter: 'blur(4px)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '3rem',
					}}
				>
					{
						/* We reuse FileDrop but apply specific styles to make it fill the modal
            and hide the default list, acting purely as a target.
          */
					}
					<div style={{ width: '100%', height: '100%', maxWidth: '800px', maxHeight: '600px' }}>
						<FileDrop
							{...fileDropProps}
							className='file-drop--global-active'
							dropzoneLabel={overlayText || 'Drop files anywhere to upload'}
							layout='list'
						/>
					</div>
				</div>
			)}
		</div>
	);
}
```

### File: packages\fields\src\wrappers\LabelWrapper.tsx

```tsx
import '../styles/wrappers/label-wrapper.css';
import '../styles/components/help-tooltip.css';
import { Signal } from '@preact/signals';
import { LabelWrapperProps } from '../types/wrappers.ts';
import { HelpTooltip } from '../components/HelpTooltip.tsx';

export function LabelWrapper(props: LabelWrapperProps) {
	if (!props.label) return null;

	const isActive = props.active instanceof Signal ? props.active.value : props.active;
	const isError = props.error instanceof Signal ? props.error.value : props.error;
	const isDisabled = props.disabled instanceof Signal ? props.disabled.value : props.disabled;

	const {
		position = 'top',
		floatingRule = 'auto',
		floatingOrigin = 'top-left',
		helpPosition = 'inline',
	} = props;

	// Determine if floating styles should be applied (Absolute positioning)
	const canFloat = position === 'top' && floatingRule !== 'never';
	const isFloating = canFloat;

	// Determine if the label is currently in the "up" (active) state
	const isFloatedUp = floatingRule === 'always' || (floatingRule === 'auto' && isActive);

	const labelClasses = [
		'field-label',
		`field-label--pos-${position}`,
		isFloating && 'field-label--floating',
		isFloating && `field-label--float-from-${floatingOrigin}`,
		props.multiline && 'field-label--multiline',
		isFloatedUp && 'field-label--active',
		isError && 'field-label--error',
		isDisabled && 'field-label--disabled',
		props.className,
	]
		.filter(Boolean)
		.join(' ');

	// Render Helper
	const tooltip = props.help
		? (
			<HelpTooltip
				content={props.help}
				href={props.helpLink}
				className={helpPosition !== 'inline' ? `help-tooltip--${helpPosition}` : ''}
			/>
		)
		: null;

	return (
		<>
			<div className={labelClasses} style={props.style}>
				<label htmlFor={props.id}>
					{props.label}
					{props.required && <span className='field-label__required'>*</span>}
				</label>

				{/* Render inline if position is inline */}
				{helpPosition === 'inline' && tooltip}
			</div>

			{/* Render outside if position is corner-based (Detached from label transforms) */}
			{helpPosition !== 'inline' && tooltip}
		</>
	);
}
```

### File: packages\fields\src\wrappers\MessageWrapper.tsx

```tsx
import { Signal } from '@preact/signals';
import '../styles/wrappers/message-wrapper.css';

interface MessageWrapperProps {
	error?: string | Signal<string | undefined>;
	warning?: string | Signal<string | undefined>;
	info?: string | Signal<string | undefined>;
	hint?: string;
}

export function MessageWrapper(props: MessageWrapperProps) {
	const error = props.error instanceof Signal ? props.error.value : props.error;
	const warning = props.warning instanceof Signal ? props.warning.value : props.warning;
	const info = props.info instanceof Signal ? props.info.value : props.info;

	// Priority: Error > Warning > Info > Hint
	const message = error || warning || info || props.hint;
	const type = error ? 'error' : warning ? 'warning' : info ? 'info' : 'hint';

	if (!message) {
		return (
			<div
				className='field-message field-message--hidden'
				aria-hidden='true'
			/>
		);
	}

	const classes = [
		'field-message',
		`field-message--${type}`,
	].join(' ');

	return (
		<div className={classes} role={type === 'error' ? 'alert' : 'status'}>
			{message}
		</div>
	);
}
```

### File: packages\fields\src\wrappers\SkeletonWrapper.tsx

```tsx
import { Signal } from '@preact/signals';
import '../styles/wrappers/skeleton-wrapper.css';

interface SkeletonWrapperProps {
	loading?: boolean | Signal<boolean>;
	variant?: 'rect' | 'circle' | 'pill';
	width?: string | number;
	height?: string | number;
	className?: string;
}

export function SkeletonWrapper(props: SkeletonWrapperProps) {
	const isLoading = props.loading instanceof Signal ? props.loading.value : props.loading;

	if (!isLoading) return null;

	const classes = [
		'field-skeleton',
		'field-skeleton--pulse',
		`field-skeleton--${props.variant || 'rect'}`,
		props.className,
	]
		.filter(Boolean)
		.join(' ');

	const style = {
		width: props.width,
		height: props.height,
	};

	return <div className={classes} style={style} aria-hidden='true' />;
}
```
