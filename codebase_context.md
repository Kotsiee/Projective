# Selected Codebase Context

> Included paths: ./apps/web/features/dashboard/projects, ./packages/charts

## Project Tree (Selected)

```text
./apps/web/features/dashboard/projects/
  projects/
  components/
  new/
  NewProjectModal.tsx
  NewStageModal.tsx
  NewTicketModal.tsx
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
  styles/
  components/
  new/
  project/
  stage/
  layouts/
  pages/
  stage/
./packages/charts/
  charts/
  deno.json
  mod.ts
  src/
  components/
  flow/
  gantt/
  GanttChart.tsx
  GanttHeader.tsx
  GanttTaskCard.tsx
  GanttTaskList.tsx
  GanttTimeline.tsx
  GanttTooltip.tsx
  kanban/
  index.ts
  Kanban.tsx
  KanbanCard.tsx
  KanbanField.tsx
  pie/
  core/
  gantt/
  gantt-manager.ts
  header-utils.ts
  interaction/
  renderer/
  store.ts
  time-scale.ts
  pie/
  hooks/
  useKanbanDnD.ts
  styles/
  gantt/
  kanban/
  pie/
  types/
  gantt.ts
  kanban.ts
  utils/
  theme-bridge.ts
```

## File Contents

### File: apps\web\features\dashboard\projects\components\new\NewProjectModal.tsx

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

### File: apps\web\features\dashboard\projects\components\new\NewStageModal.tsx

```tsx
/**
 * @file NewStageModal.tsx
 * @description Modal component for creating a new stage within an existing project.
 */

// #region Imports
import { useSignal } from '@preact/signals';
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
import { IPOptionMode } from '@projective/types';
import { useProjectContext } from '../../contexts/ProjectContext.tsx';
import { DateTime } from 'packages/types/src/core/datetime.ts';
import { ProjectsService } from '../../services/ProjectsService.ts';
// #endregion

// #region Interfaces
export interface NewStageModalProps {
	isOpen: boolean;
	onClose: () => void;
	projectId: string;
	projectFormat?: 'one_off' | 'pipeline';
}
// #endregion

// #region Component
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

	// One-Off Specific
	const startDate = useSignal<DateTime | undefined>(undefined);
	const endDate = useSignal<DateTime | undefined>(undefined);

	// Advanced
	const ipModeOverride = useSignal<string>('none');
	const ndaRequired = useSignal('false');

	const isSubmitting = useSignal(false);
	// #endregion

	// #region Handlers
	const handleSubmit = async () => {
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
				start_date: startDate.value,
				end_date: endDate.value,
				ip_ownership_override: ipModeOverride.value !== 'none' ? ipModeOverride.value : null,
				nda_required: ndaRequired.value === 'true',
			};

			await ProjectsService.createStage(projectId, payload);

			toast.success('Stage created successfully!');
			refresh(); // Refresh project context to pull the new stage into the sidebar
			onClose();
		} catch (err: unknown) {
			console.error(err);
			toast.error(err instanceof Error ? err.message : 'Failed to create stage.');
		} finally {
			isSubmitting.value = false;
		}
	};
	// #endregion

	// #region Options
	const booleanOptions = [
		{ value: 'true', label: 'Yes' },
		{ value: 'false', label: 'No' },
	];

	const ipOptions = [
		{ value: 'none', label: 'Inherit from Project' },
		{ value: IPOptionMode.ExclusiveTransfer, label: 'Exclusive Transfer' },
		{ value: IPOptionMode.LicensedUse, label: 'Licensed Use' },
	];
	// #endregion

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
					{/* Core Info */}
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

					{/* Conditionally Rendered Dates */}
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

					{/* Advanced Settings */}
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
// #endregion

```

### File: apps\web\features\dashboard\projects\components\new\NewTicketModal.tsx

```tsx
import '../../styles/components/new/new-ticket-modal.css';
import { useSignal } from '@preact/signals';
import { Button, Modal, ModalLayout, ToggleButton, ToggleButtonGroup } from '@projective/ui';
import { DateField, SelectField, TextField } from '@projective/fields';
import { DateTime } from '@projective/types';

interface NewTicketModalProps {
	isOpen: boolean;
	onClose: () => void;
	availableStages: { label: string; value: string }[];
	onSubmit: (payload: any) => void;
}

export function NewTicketModal(
	{ isOpen, onClose, availableStages, onSubmit }: NewTicketModalProps,
) {
	// Form State Signals
	const title = useSignal('');
	const description = useSignal('');
	const selectedStages = useSignal<string[]>(availableStages.map((s) => s.value)); // All selected by default
	const intensityTier = useSignal<'Low' | 'Standard' | 'High'>('Standard'); // Standard default
	const dueDate = useSignal<DateTime | null>(null);

	const handleSubmit = () => {
		onSubmit({
			title: title.value,
			description: description.value,
			stages: selectedStages.value,
			intensityTier: intensityTier.value,
			dueDate: dueDate.value,
		});
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title='Create New Ticket'
			style={{ width: '600px', maxWidth: '90vw' }}
		>
			<ModalLayout
				footer={
					<div>
						<Button ghost onClick={onClose}>Cancel</Button>
						<Button variant='primary' onClick={handleSubmit}>Create Ticket</Button>
					</div>
				}
			>
				<div class='new-ticket-form'>
					<TextField
						label='Ticket Title'
						value={title}
						onChange={(v) => title.value = String(v)}
						placeholder='e.g. Implement Navigation Header'
					/>

					<TextField
						label='Description'
						value={description}
						onChange={(v) => description.value = String(v)}
						multiline
						placeholder='Detail the acceptance criteria...'
						style={{ minHeight: '120px' }}
					/>

					{/* FileDropWrapper would go here for attachments. Placeholder: */}
					<div class='new-ticket-form__section'>
						<span class='new-ticket-form__section-label'>Attachments</span>
						<div
							style={{
								border: '1px dashed var(--border-color)',
								padding: '2rem',
								textAlign: 'center',
								borderRadius: 'var(--border-radius)',
								color: 'var(--text-muted)',
							}}
						>
							Drag and drop files here, or click to browse
						</div>
					</div>

					<SelectField
						label='Target Stages'
						options={availableStages}
						multiple
						value={selectedStages.value}
						onChange={(v) => selectedStages.value = v as string[]}
					/>

					<div class='new-ticket-form__section'>
						<span class='new-ticket-form__section-label'>Intensity Tier (Wi Multiplier)</span>
						<ToggleButtonGroup
							value={intensityTier.value}
							onChange={(v) => intensityTier.value = v as any}
							optional={false}
							fullWidth
						>
							<ToggleButton value='Low'>Low (0.5x)</ToggleButton>
							<ToggleButton value='Standard'>Standard (1.0x)</ToggleButton>
							<ToggleButton value='High'>High (2.0x)</ToggleButton>
						</ToggleButtonGroup>
					</div>

					<DateField
						label='Due Date (Optional)'
						variant='input'
						value={dueDate.value}
						onChange={(d) => dueDate.value = d}
					/>
				</div>
			</ModalLayout>
		</Modal>
	);
}

```

### File: apps\web\features\dashboard\projects\components\project\board\BoardDataView.tsx

```tsx
import { useEffect, useMemo } from 'preact/hooks';
import { Kanban, KanbanCardProps, KanbanFieldProps } from '@projective/charts';
import { ColumnDef, DataDisplay } from '@projective/data';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';

export interface BoardTicket {
	id: string;
	title: string;
	stageId: string;
	stageName: string;
	status: 'Backlog' | 'Todo' | 'In Progress' | 'In Review' | 'Completed' | 'Cancelled';
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
}

// Columns for the DataDisplay Table
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
		field: (t) => t.workloadIntensity.toFixed(1),
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
}: BoardDataViewProps) {
	const { setCustomScrollEnabled } = useNavigationContext();
	// 1. Define the mapper function FIRST so it's initialized before useMemo calls it.
	// deno-lint-ignore no-explicit-any
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
			label: `Wi: ${t.workloadIntensity.toFixed(1)}`,
			variant: 'solid',
		});

		const dateString = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(
			new Date(t.createdAt),
		);

		return {
			id: t.id,
			title: t.title,
			description: `This ticket requires a workload intensity of ${
				t.workloadIntensity.toFixed(1)
			} and has ${t.revisionsRequested} revisions requested.`,
			meta: `Created: ${dateString}`,
			takenBy: t.assigneeName ? { name: t.assigneeName } : undefined,
			order: orderIndex,
			permissions: { canReorder: isOwnerOrAdmin },
			tags,
		};
	};

	// 2. Compute the fields safely using the initialized mapper.
	const kanbanFields = useMemo<KanbanFieldProps[]>(() => {
		const fieldsMap = new Map<string, KanbanFieldProps>();

		if (viewType === 'stages') {
			fieldsMap.set('New', {
				id: 'New',
				title: 'New',
				color: 'primary',
				order: 0,
				cards: [],
				permissions: { canReorder: false },
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
				permissions: { canReorder: false },
			});

			tickets.forEach((t) => {
				const targetField = t.status === 'Completed'
					? 'Done'
					: (t.status === 'Backlog' ? 'New' : t.stageId);
				const field = fieldsMap.get(targetField);

				if (field) field.cards.push(mapTicketToCard(t, field.cards.length));
			});
		} else {
			const statuses = [
				{ id: 'Backlog', color: 'primary' },
				{ id: 'Todo', color: 'secondary' },
				{ id: 'In Progress', color: 'secondary' },
				{ id: 'In Review', color: 'secondary' },
				{ id: 'Completed', color: 'var(--success)' },
				{ id: 'Cancelled', color: 'var(--danger)' },
			];

			statuses.forEach((status, idx) => {
				fieldsMap.set(status.id, {
					id: status.id,
					title: status.id,
					color: status.color,
					order: idx,
					cards: [],
					permissions: { canReorder: false },
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
			// Turn it off if they switch to the Table view
			setCustomScrollEnabled(false);
		}

		// Cleanup: Always disable it when leaving the page entirely
		return () => setCustomScrollEnabled(false);
	}, [displayMode, setCustomScrollEnabled]);

	if (displayMode === 'kanban') {
		return (
			<div class='project-board__kanban-wrapper'>
				<Kanban
					fields={kanbanFields}
					onCardClick={(card) => onCardClick(card.id)}
					onCardMove={onCardMove}
					onFieldMove={onFieldMove}
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
import { DateTime } from '@projective/types';

// Shared interfaces can be extracted to a separate file, defining them here for completeness
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
	fiduciary: FiduciaryMetrics;
	capacity: CapacityMetrics;
}

const formatCurrency = (cents: number) => {
	return (cents / 100).toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD',
	});
};

export function BoardHeader(
	{ projectTitle, projectFormat, fiduciary, capacity }: BoardHeaderProps,
) {
	return (
		<header class='project-board__header'>
			<div class='project-board__panel'>
				<h1 class='project-board__title'>{projectTitle}</h1>
			</div>

			<div class='project-board__details'>
				<div class='project-board__details-section'>
					<h3>Tickets</h3>
					<div class='project-board__details-section__content'>
						<BoardMetric name='New' rawValue={3} />
						<BoardMetric name='Active' rawValue={5} />
						<BoardMetric name='Total' rawValue={8} />
					</div>
				</div>
				<div class='project-board__details-section'>
					<h3>Budget</h3>
					<div class='project-board__details-section__content'>
						<BoardMetric name='Ave. Cost / Ticket' rawValue={98327} type='currency' />
						<BoardMetric name='Spent' rawValue={3672353276} type='currency' />
					</div>
				</div>
			</div>
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
		<div class='project-board__details-metric'>
			<p class='project-board__details-metric__name'>{name}</p>
			<p class='project-board__details-metric__value'>{value}</p>
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
import NewProjectModal from './new/NewProjectModal.tsx';
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
import { createContext } from 'preact';
import { useContext, useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { ComponentChildren } from 'preact';
import { ProjectDetails, ProjectState } from '../contracts/Projects.ts';
import { ProjectsService } from '../services/ProjectsService.ts';

// 1. MUST BE EXPORTED to allow tunneling
export const ProjectContext = createContext<ProjectState | null>(null);

export function ProjectProvider(
	{ id, children }: { id: string | undefined; children: ComponentChildren },
) {
	const projectId = useSignal(id);
	const project = useSignal<ProjectDetails | null>(null);
	const isLoading = useSignal(false);
	const error = useSignal<string | null>(null);

	if (projectId.value !== id) {
		projectId.value = id;
		project.value = null;
		error.value = null;
	}

	const fetchProject = async () => {
		if (!projectId.value) return;

		isLoading.value = true;
		error.value = null;

		try {
			const data = await ProjectsService.getProjectDetails(projectId.value);
			project.value = data;
			// deno-lint-ignore no-explicit-any
		} catch (err: any) {
			console.error('Project Fetch Error:', err);
			error.value = err.message || 'An unexpected error occurred.';
		} finally {
			isLoading.value = false;
		}
	};

	useEffect(() => {
		if (projectId.value) {
			fetchProject();
		}
	}, [projectId.value]);

	return (
		<ProjectContext.Provider
			value={{
				project_id: projectId,
				project,
				isLoading,
				error,
				refresh: fetchProject,
			}}
		>
			{children}
		</ProjectContext.Provider>
	);
}

export function useProjectContext() {
	const ctx = useContext(ProjectContext);
	if (!ctx) throw new Error('useProjectContext must be used within ProjectProvider');
	return ctx;
}

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
import '../../styles/pages/board.css';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { Button, ToggleButton, ToggleButtonGroup } from '@projective/ui';
import { IconBasket, IconLayoutKanban, IconList } from '@tabler/icons-preact';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import { NewTicketModal } from '@features/dashboard/projects/components/new/NewTicketModal.tsx';
import {
	BoardDataView,
	BoardTicket,
} from '@features/dashboard/projects/components/project/board/BoardDataView.tsx';
import { BoardHeader } from '@features/dashboard/projects/components/project/board/BoardHeader.tsx';

export interface ProjectBoardIslandProps {
	initialData?: any;
	isOwnerOrAdmin?: boolean;
}

export default function ProjectBoardIsland(
	{ initialData, isOwnerOrAdmin = true }: ProjectBoardIslandProps,
) {
	const { setMiddleNav } = useNavigationContext();

	// #region State Signals
	const viewType = useSignal<'stages' | 'status'>('stages');
	const displayMode = useSignal<'kanban' | 'list'>('kanban');
	const isNewTicketOpen = useSignal(false);
	const isNewStageOpen = useSignal(false);
	// #endregion

	// #region Fallback Data
	const data = initialData || {
		title: 'Alpha Platform Build',
		format: 'pipeline',
		fiduciary: { totalBudgetCents: 1500000, tvlEscrowCents: 500000, releasedBalanceCents: 1000000 },
		capacity: { backlogQueueSize: 12, cumulativeWi: 28.5, accuracyPercentage: 94.2 },
		tickets: [
			// NEW (Backlog)
			{
				id: '1',
				title: 'Spider-man is at it again!',
				stageId: 's1',
				stageName: 'UI/UX Design',
				status: 'Backlog',
				assigneeName: null,
				workloadIntensity: 2.5,
				revisionsRequested: 0,
				attachmentsScanned: true,
				createdAt: new Date().toISOString(),
			},
			{
				id: '2',
				title: 'Draft landing page copy',
				stageId: 's2',
				stageName: 'Web Development',
				status: 'Backlog',
				assigneeName: 'Alice',
				workloadIntensity: 1.0,
				revisionsRequested: 0,
				attachmentsScanned: false,
				createdAt: new Date().toISOString(),
			},

			// STAGE 1: UI/UX Design
			{
				id: '3',
				title: 'Design user onboarding flow',
				stageId: 's1',
				stageName: 'UI/UX Design',
				status: 'In Progress',
				assigneeName: 'Bob',
				workloadIntensity: 4.5,
				revisionsRequested: 2,
				attachmentsScanned: true,
				createdAt: new Date().toISOString(),
			},
			{
				id: '4',
				title: 'Wireframe dashboard layout',
				stageId: 's1',
				stageName: 'UI/UX Design',
				status: 'In Review',
				assigneeName: 'Bob',
				workloadIntensity: 3.0,
				revisionsRequested: 1,
				attachmentsScanned: true,
				createdAt: new Date().toISOString(),
			},
			{
				id: '5',
				title: 'Update color palette',
				stageId: 's1',
				stageName: 'UI/UX Design',
				status: 'Todo',
				assigneeName: null,
				workloadIntensity: 1.5,
				revisionsRequested: 0,
				attachmentsScanned: false,
				createdAt: new Date().toISOString(),
			},

			// STAGE 2: Web Development
			{
				id: '6',
				title: 'Setup database schema',
				stageId: 's2',
				stageName: 'Web Development',
				status: 'In Progress',
				assigneeName: 'Charlie',
				workloadIntensity: 5.0,
				revisionsRequested: 0,
				attachmentsScanned: true,
				createdAt: new Date().toISOString(),
			},
			{
				id: '7',
				title: 'Implement Auth0 integration',
				stageId: 's2',
				stageName: 'Web Development',
				status: 'In Progress',
				assigneeName: 'Alice',
				workloadIntensity: 3.5,
				revisionsRequested: 0,
				attachmentsScanned: true,
				createdAt: new Date().toISOString(),
			},

			// STAGE 3: QA & Testing
			{
				id: '8',
				title: 'Write E2E Cypress tests',
				stageId: 's3',
				stageName: 'QA & Testing',
				status: 'Todo',
				assigneeName: 'Diana',
				workloadIntensity: 4.0,
				revisionsRequested: 0,
				attachmentsScanned: false,
				createdAt: new Date().toISOString(),
			},

			// DONE (Completed)
			{
				id: '9',
				title: 'Initial repository setup',
				stageId: 's2',
				stageName: 'Web Development',
				status: 'Completed',
				assigneeName: 'Charlie',
				workloadIntensity: 1.0,
				revisionsRequested: 0,
				attachmentsScanned: true,
				createdAt: new Date().toISOString(),
			},
			{
				id: '10',
				title: 'Competitor analysis',
				stageId: 's1',
				stageName: 'UI/UX Design',
				status: 'Completed',
				assigneeName: 'Bob',
				workloadIntensity: 2.0,
				revisionsRequested: 0,
				attachmentsScanned: true,
				createdAt: new Date().toISOString(),
			},
		] as BoardTicket[],
		availableStages: [
			{ label: 'UI/UX Design', value: 's1' },
			{ label: 'Web Development', value: 's2' },
			{ label: 'QA & Testing', value: 's3' },
		],
	};

	// Convert data to mutable signals for Drag and Drop
	const tickets = useSignal<BoardTicket[]>(data.tickets);
	const availableStages = useSignal<{ label: string; value: string }[]>(data.availableStages);
	// #endregion

	// #region Navigation Footer Injection
	useEffect(() => {
		const footerContent = (
			<div class='project-board__footer-wrapper'>
				<div class='project-board__footer-right'>
					<ToggleButtonGroup
						value={viewType.value}
						onChange={(v) => viewType.value = v as any}
						optional={false}
						variant='secondary'
					>
						<ToggleButton value='stages'>Pipeline</ToggleButton>
						<ToggleButton value='status'>Status</ToggleButton>
					</ToggleButtonGroup>

					{isOwnerOrAdmin && (
						<Button
							variant='secondary'
							onClick={() => isNewTicketOpen.value = true}
						>
							+ Add New Ticket
						</Button>
					)}
				</div>

				<div class='project-board__footer-left'>
					<ToggleButtonGroup
						value={displayMode.value}
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

					<Button variant='primary'>
						<IconBasket /> Checkout
					</Button>
				</div>
			</div>
		);

		setMiddleNav({
			footerHeight: '64px',
			footerContent,
		});

		return () => {
			setMiddleNav({ footerHeight: '0px', footerContent: null });
		};
	}, [viewType.value, displayMode.value, isOwnerOrAdmin, setMiddleNav]);
	// #endregion

	// #region Handlers
	const handleAddTicket = (payload: any) => {
		console.log('[New Ticket Payload]', payload);
		// Add API logic here
	};

	const handleAddStageTrigger = () => {
		console.log('Open Add Stage Modal');
		isNewStageOpen.value = true;
	};

	const handleCardMove = (
		cardId: string,
		sourceFieldId: string,
		targetFieldId: string,
		insertBeforeCardId: string | null,
	) => {
		const currentTickets = [...tickets.value];
		const ticketIndex = currentTickets.findIndex((t) => t.id === cardId);

		if (ticketIndex === -1) return;

		// Clone the ticket to mutate it safely
		const ticket = { ...currentTickets[ticketIndex] };

		// 1. Update data based on view type context
		if (viewType.value === 'stages') {
			if (targetFieldId === 'New') {
				ticket.status = 'Backlog';
			} else if (targetFieldId === 'Done') {
				ticket.status = 'Completed';
			} else {
				ticket.stageId = targetFieldId;

				// Lookup the stage name from the available stages
				const stage = availableStages.value.find((s) => s.value === targetFieldId);
				if (stage) ticket.stageName = stage.label;

				// If it was backlog or completed, reset it to active
				if (ticket.status === 'Backlog' || ticket.status === 'Completed') {
					ticket.status = 'In Progress';
				}
			}
		} else {
			// If in status view, simply update the status
			ticket.status = targetFieldId as any;
		}

		// 2. Remove from old position
		currentTickets.splice(ticketIndex, 1);

		// 3. Insert into new position
		if (insertBeforeCardId) {
			const isAfter = insertBeforeCardId.endsWith('_after');
			const targetId = isAfter ? insertBeforeCardId.replace('_after', '') : insertBeforeCardId;
			let targetIndex = currentTickets.findIndex((t) => t.id === targetId);

			if (targetIndex !== -1) {
				if (isAfter) targetIndex += 1;
				currentTickets.splice(targetIndex, 0, ticket);
			} else {
				currentTickets.push(ticket); // Fallback to end
			}
		} else {
			currentTickets.push(ticket); // Insert at end of column
		}

		// 4. Commit to signal
		tickets.value = currentTickets;
	};

	const handleFieldMove = (sourceId: string, targetId: string, insertBefore: boolean) => {
		const currentStages = [...availableStages.value];
		const sourceIndex = currentStages.findIndex((s) => s.value === sourceId);
		const targetIndex = currentStages.findIndex((s) => s.value === targetId);

		if (sourceIndex === -1 || targetIndex === -1) return;

		// Remove the stage being dragged
		const [movedStage] = currentStages.splice(sourceIndex, 1);

		// Find the newly adjusted target index
		const adjustedTargetIndex = currentStages.findIndex((s) => s.value === targetId);

		// Insert the stage back into the array
		if (insertBefore) {
			currentStages.splice(adjustedTargetIndex, 0, movedStage);
		} else {
			currentStages.splice(adjustedTargetIndex + 1, 0, movedStage);
		}

		// Commit to signal
		availableStages.value = currentStages;
	};
	// #endregion

	return (
		<div class='project-board'>
			<BoardHeader
				projectTitle={data.title}
				projectFormat={data.format}
				fiduciary={data.fiduciary}
				capacity={data.capacity}
			/>

			<main class='project-board__content'>
				<main class='project-board__content'>
					<BoardDataView
						tickets={tickets.value}
						stages={availableStages.value}
						viewType={viewType.value}
						displayMode={displayMode.value}
						isOwnerOrAdmin={isOwnerOrAdmin}
						onCardClick={(id) => console.log('Ticket clicked:', id)}
						onCardMove={handleCardMove}
						onFieldMove={handleFieldMove}
						onAddStage={handleAddStageTrigger}
					/>
				</main>
			</main>

			<NewTicketModal
				isOpen={isNewTicketOpen.value}
				onClose={() => isNewTicketOpen.value = false}
				availableStages={availableStages.value}
				onSubmit={handleAddTicket}
			/>

			{isNewStageOpen.value && <div style={{ display: 'none' }}>Stage Modal Mount Point</div>}
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

### File: packages\charts\deno.json

```json
{
  "name": "@projective/charts",
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

### File: packages\charts\mod.ts

```ts
export * from './src/types/gantt.ts';
export * from './src/core/gantt/store.ts';
export * from './src/core/gantt/time-scale.ts';
export { default as GanttChart } from './src/components/gantt/GanttChart.tsx';

export * from './src/components/kanban/index.ts';

```

### File: packages\charts\src\components\gantt\GanttChart.tsx

```tsx
import '../../styles/gantt/gantt.css';
import { GanttStore } from '../../core/gantt/store.ts';
import { GanttHeader } from './GanttHeader.tsx';
import { GanttTimeline } from './GanttTimeline.tsx';
import { GanttTaskList } from './GanttTaskList.tsx';
import { useEffect, useMemo } from 'preact/hooks';
import { DependencyLink, GanttRow, GanttTask } from '../../types/gantt.ts';

// #region Interfaces
interface GanttChartProps {
	initialData: {
		rows: GanttRow[];
		tasks: GanttTask[];
		dependencies: DependencyLink[];
	};
	selectedRowId?: string;
	onRowSelect?: (rowId: string) => void;
}
// #endregion

export default function GanttChart({ initialData, selectedRowId, onRowSelect }: GanttChartProps) {
	const store = useMemo(() => {
		const defaultStart = initialData?.tasks?.[0]?.startAt ||
			(Date.now() - (7 * 24 * 60 * 60 * 1000));

		return new GanttStore({
			visibleWidth: 1000,
			visibleHeight: 500,
			startDate: defaultStart,
		});
	}, []);

	useEffect(() => {
		store.onRowSelect = onRowSelect;
	}, [onRowSelect, store]);

	useEffect(() => {
		if (selectedRowId !== undefined) {
			store.selectedRowId.value = selectedRowId;
		}
	}, [selectedRowId, store]);

	useEffect(() => {
		if (initialData) {
			store.loadData(initialData.rows, initialData.tasks, initialData.dependencies);

			if (initialData.tasks.length > 0) {
				const earliestTask = initialData.tasks.reduce(
					(min, t) => t.startAt < min.startAt ? t : min,
					initialData.tasks[0],
				);
				const currentStart = store.timelineStart.value;

				if (
					earliestTask.startAt < currentStart - (3 * 86400000) ||
					earliestTask.startAt > currentStart + (7 * 86400000)
				) {
					store.setStartDate(earliestTask.startAt - (3 * 86400000));
					store.scrollX.value = 0;
				}
			}
		}
	}, [initialData, store]);

	return (
		<div
			className='gantt-chart'
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '1rem',
				width: '100%',
				flex: 1, // CRITICAL: Use flex: 1 instead of height: 100% to resolve CSS minimum height collapse bounds
				minHeight: 0,
				minWidth: 0,
				overflow: 'hidden',
			}}
		>
			<div class='gantt-controls' style={{ width: '100%', flexShrink: 0 }}>
				<GanttHeader store={store} />
			</div>

			<div
				class='gantt-body'
				style={{
					display: 'flex',
					flex: 1,
					width: '100%',
					minHeight: 0,
					minWidth: 0,
					backgroundColor: 'var(--card)',
					border: '1px solid var(--border-color)',
					borderRadius: 'var(--border-radius)',
					overflow: 'hidden',
				}}
			>
				<GanttTaskList store={store} width={store.containerWidth.value} />
				<GanttTimeline store={store} />
			</div>
		</div>
	);
}

```

### File: packages\charts\src\components\gantt\GanttHeader.tsx

```tsx
import '../../styles/gantt/gantt-header.css';
import { useComputed } from '@preact/signals';
import { GanttStore } from '../../core/gantt/store.ts';
import { IconButton } from '@projective/ui';
import { SliderField } from '@projective/fields';
import { IconChevronLeft, IconChevronRight, IconMinus, IconPlus } from '@tabler/icons-preact';
import { DateTime } from '@projective/types';
import { useCallback, useEffect, useMemo, useRef } from 'preact/hooks';

// #region Helper Hook
function useHoldRepeat(callback: () => void, delay = 400, interval = 50) {
	// deno-lint-ignore no-explicit-any
	const timeoutRef = useRef<any>(null);
	// deno-lint-ignore no-explicit-any
	const intervalRef = useRef<any>(null);

	const stop = useCallback(() => {
		if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
		if (intervalRef.current !== null) clearInterval(intervalRef.current);
	}, []);

	const start = useCallback((e: PointerEvent) => {
		if (e.button !== 0) return;
		callback();
		timeoutRef.current = setTimeout(() => {
			intervalRef.current = setInterval(callback, interval);
		}, delay);
	}, [callback, delay, interval]);

	useEffect(() => stop, [stop]);

	return {
		onPointerDown: start,
		onPointerUp: stop,
		onPointerLeave: stop,
		onContextMenu: (e: Event) => e.preventDefault(),
	};
}
// #endregion

interface GanttHeaderProps {
	store: GanttStore;
}

export function GanttHeader({ store }: GanttHeaderProps) {
	const minDays = 1;
	const maxDays = 90;

	const dateLabel = useComputed(() => {
		const x = store.scrollX.value;
		const days = store.visibleDays.value;

		const startMs = store.timeScale.xToDate(-x);
		const startDt = new DateTime(new Date(startMs));
		const endDt = startDt.add(days, 'days');

		return `${startDt.toFormat('dd MMM')} - ${endDt.toFormat('dd MMM')}`;
	});

	const handleNav = (direction: -1 | 1) => {
		const shift = (store.containerWidth.value / 4) * direction;
		store.scrollX.value -= shift;
	};

	const handleAddDay = useCallback(() => {
		const current = store.visibleDays.value;
		if (current < maxDays) store.setVisibleDays(current + 1);
	}, [store]);

	const handleSubDay = useCallback(() => {
		const current = store.visibleDays.value;
		if (current > minDays) store.setVisibleDays(current - 1);
	}, [store]);

	const addProps = useHoldRepeat(handleAddDay);
	const subProps = useHoldRepeat(handleSubDay);

	const dynamicMarks = useMemo(() => {
		const arr = [];
		for (let i = minDays; i <= maxDays; i++) {
			let className = 'gantt-slider-mark--day';
			let label = undefined;

			if (i === minDays) {
				label = `${i}d`;
				className += ' gantt-slider-mark--min';
			} else if (i === maxDays) {
				label = `${i}d`;
				className += ' gantt-slider-mark--max';
			}

			if (i % 30 === 0) {
				className += ' gantt-slider-mark--month';
			}

			arr.push({ value: i, label, className });
		}
		return arr;
	}, [minDays, maxDays]);

	return (
		<div
			class='gantt-header'
			style={{
				display: 'flex',
				width: '100%',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '0.25rem 0',
			}}
		>
			{/* Left section: Slider block */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '1rem',
					flex: '1 1 0%',
					minWidth: '250px',
					padding: '0 1rem',
				}}
			>
				<IconButton variant='secondary' size='small' aria-label='Decrease days' {...subProps}>
					<IconMinus size={16} />
				</IconButton>

				<div style={{ flex: 1, minWidth: '150px' }}>
					<SliderField
						value={store.visibleDays.value}
						onChange={(val) => store.setVisibleDays(val as number)}
						min={minDays}
						max={maxDays}
						step={1}
						marks={dynamicMarks}
					/>
				</div>

				<IconButton variant='secondary' size='small' aria-label='Increase days' {...addProps}>
					<IconPlus size={16} />
				</IconButton>
			</div>

			{/* Middle section: Date block */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					flex: '1 1 0%',
					gap: '0.5rem',
				}}
			>
				<IconButton
					variant='secondary'
					size='medium'
					aria-label='Previous'
					onClick={() => handleNav(-1)}
					outlined
					ghost
				>
					<IconChevronLeft />
				</IconButton>

				<span
					style={{ minWidth: '150px', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem' }}
				>
					{dateLabel.value}
				</span>

				<IconButton
					variant='secondary'
					size='medium'
					aria-label='Next'
					onClick={() => handleNav(1)}
					outlined
					ghost
				>
					<IconChevronRight />
				</IconButton>
			</div>

			{/* Right section: Spacer to maintain perfect center alignment for dates */}
			<div style={{ flex: '1 1 0%' }}></div>
		</div>
	);
}

```

### File: packages\charts\src\components\gantt\GanttTaskCard.tsx

```tsx
import { GanttRow } from '../../types/gantt.ts';
import { GanttStore } from './../../core/gantt/store.ts';
import { DateTime } from '@projective/types';

interface GanttTaskCardProps {
	row: GanttRow;
	store: GanttStore;
}

export function GanttTaskCard({ row, store }: GanttTaskCardProps) {
	const startDt = new DateTime(new Date(row.data?.startMs || Date.now()));
	const endDt = new DateTime(new Date(row.data?.endMs || Date.now() + 86400000));
	const dateStr = `${startDt.toFormat('dd/MM/yy')} - ${endDt.toFormat('dd/MM/yy')}`;

	const isSelected = store.selectedRowId.value === row.id;

	return (
		<div
			class='gantt-task-card__container'
			style={`--task-height: ${store.rowHeight.value}px`}
		>
			<div
				class='gantt-task-card'
				data-selected={isSelected}
				onClick={() => store.selectRow(row.id)}
			>
				<div class='gantt-task-card__content'>
					<div>
						<h4 class='gantt-task-card__title'>{row.label}</h4>
					</div>

					<div class='gantt-task-card__meta'>
						<span class='gantt-task-card__type'>
							{row.data?.originalType?.replace('_', ' ') || row.type}
						</span>
						<span class='gantt-task-card__date'>
							{dateStr}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

```

### File: packages\charts\src\components\gantt\GanttTaskList.tsx

```tsx
import '../../styles/gantt/gantt-task-list.css';
import { effect, useComputed } from '@preact/signals';
import { GanttStore } from '../../core/gantt/store.ts';
import { GanttTaskCard } from './GanttTaskCard.tsx';
import { useEffect, useRef } from 'preact/hooks';

interface GanttTaskListProps {
	store: GanttStore;
	width: number;
}

export function GanttTaskList({ store, width }: GanttTaskListProps) {
	const listRef = useRef<HTMLDivElement>(null);
	const tasksRef = useRef<HTMLDivElement>(null);

	const startIndex = useComputed(() => {
		return Math.floor(store.scrollY.value / store.rowHeight.value);
	});

	const visibleRows = useComputed(() => {
		const start = startIndex.value;
		const end = start + 15;

		return [...store.rows.value]
			.sort((a, b) => a.orderIndex - b.orderIndex)
			.slice(start, end);
	});

	useEffect(() => {
		const dispose = effect(() => {
			if (tasksRef.current) {
				const offset = store.scrollY.value % store.rowHeight.value;
				tasksRef.current.style.transform = `translateY(-${offset}px)`;
			}
		});

		return () => dispose();
	}, [store]);

	const handleWheel = (e: WheelEvent) => {
		e.preventDefault();

		const currentY = store.scrollY.value;
		const delta = e.deltaY * 0.6;

		const contentHeight = store.contentHeight.value;
		const viewportHeight = store.containerHeight.value;
		const maxScrollY = Math.max(0, contentHeight - viewportHeight);

		let newY = currentY + delta;
		if (newY < 0) newY = 0;
		if (newY > maxScrollY) newY = maxScrollY;

		store.scrollY.value = newY;
	};

	return (
		<aside
			class='gantt-task-list'
			style={{
				flex: '0 0 320px',
				width: '320px',
				display: 'flex',
				flexDirection: 'column',
				borderRight: '1px solid var(--border-color)',
				backgroundColor: 'var(--card)',
				overflow: 'hidden',
				zIndex: 10,
			}}
		>
			<div class='gantt-task-list__header'>
				<span class='gantt-task-list__header__title'>Stages</span>
			</div>
			<div class='gantt-task-list__container' onWheel={handleWheel} ref={listRef}>
				<div class='gantt-task-list__container__tasks' ref={tasksRef}>
					{visibleRows.value.map((row) => <GanttTaskCard key={row.id} row={row} store={store} />)}
				</div>
			</div>
		</aside>
	);
}

```

### File: packages\charts\src\components\gantt\GanttTimeline.tsx

```tsx
import { useEffect, useRef } from 'preact/hooks';
import { useComputed } from '@preact/signals';
import { GanttStore } from '../../core/gantt/store.ts';
import { GanttManager } from '../../core/gantt/gantt-manager.ts';
import { generateHeaderBlocks, getHeaderTier } from '../../core/gantt/header-utils.ts';
import { DateTime } from '@projective/types';
import { GanttTooltip } from './GanttTooltip.tsx';
import '../../styles/gantt/gantt-timeline.css';

interface GanttTimelineProps {
	store: GanttStore;
}

export function GanttTimeline({ store }: GanttTimelineProps) {
	const canvasRootRef = useRef<HTMLDivElement>(null);
	const ganttManager = useRef<GanttManager | null>(null);

	useEffect(() => {
		if (canvasRootRef.current && !ganttManager.current) {
			ganttManager.current = new GanttManager(canvasRootRef.current, store);
		}

		return () => {
			ganttManager.current?.destroy();
			ganttManager.current = null;
		};
	}, []);

	const dynamicHeaders = useComputed(() => {
		const currentX = store.scrollX.value;
		const width = store.containerWidth.value;
		const days = store.visibleDays.value;

		const buffer = 2000;
		const renderStartX = -currentX - buffer;
		const renderEndX = -currentX + width + buffer;

		const startDate = new DateTime(new Date(store.timeScale.xToDate(renderStartX)));
		const endDate = new DateTime(new Date(store.timeScale.xToDate(renderEndX)));

		const tier = getHeaderTier(days, width);
		const dateToX = (t: number) => store.timeScale.dateToX(t);

		const topRows = generateHeaderBlocks(startDate, endDate, tier.top, tier.topStep, dateToX);
		const bottomRows = generateHeaderBlocks(
			startDate,
			endDate,
			tier.bottom,
			tier.bottomStep,
			dateToX,
		);

		return {
			topRows,
			bottomRows,
			tier,
		};
	});

	// deno-lint-ignore no-explicit-any
	const renderBlock = (block: any, content: string, isTop: boolean) => {
		// Hardware-accelerated GPU translation instead of expanding the DOM width
		const screenX = block.x + store.scrollX.value;

		return (
			<div
				key={block.key}
				class='gantt-time-block'
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					height: '100%',
					width: `${block.width}px`,
					transform: `translateX(${screenX}px)`,
					willChange: 'transform',
				}}
			>
				<span class={isTop ? 'gantt-sticky-label' : 'gantt-centered-label'}>
					{content}
				</span>
			</div>
		);
	};

	const header = dynamicHeaders.value;

	return (
		<section
			class='gantt-timeline'
			style={{
				flex: 1,
				display: 'flex',
				flexDirection: 'column',
				minWidth: 0,
				width: '100%',
				overflow: 'hidden',
			}}
		>
			<div
				class='gantt-timeline__header'
				style={{ overflow: 'hidden', width: '100%', position: 'relative' }}
			>
				<div
					class='gantt-header-content'
					style={{ width: '100%', position: 'relative', height: '100%' }}
				>
					{/* CRITICAL FIX: Removed conflicting inline relative positioning */}
					<div class='gantt-header-row top'>
						{header.topRows.map((block) =>
							renderBlock(
								block,
								header.tier.formatTop(block.date),
								true,
							)
						)}
					</div>

					<div class='gantt-header-row bottom'>
						{header.bottomRows.map((block) =>
							renderBlock(
								block,
								header.tier.formatBottom(block.date),
								false,
							)
						)}
					</div>
				</div>
			</div>

			<div
				class='gantt-timeline__viewport'
				style={{ flex: 1, position: 'relative', overflow: 'hidden', width: '100%' }}
			>
				<div
					class='gantt-timeline__canvas'
					ref={canvasRootRef}
					style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
				/>
				<GanttTooltip store={store} />
			</div>
		</section>
	);
}

```

### File: packages\charts\src\components\gantt\GanttTooltip.tsx

```tsx
import { GanttStore } from '../../core/gantt/store.ts';
import { DateTime } from '@projective/types';
import '../../styles/gantt/gantt-tooltip.css';

interface GanttTooltipProps {
	store: GanttStore;
}

export function GanttTooltip({ store }: GanttTooltipProps) {
	const task = store.hoveredTask.value;
	const pos = store.pointerPos.value;

	// Hide if nothing hovered, or if the user is actively dragging the canvas around
	if (!task || store.isMouseDown.value) return null;

	const startDt = new DateTime(new Date(task.startAt));
	const endDt = new DateTime(new Date(task.endAt));

	const isSinglePoint = task.startAt === task.endAt;

	// Collision Detection:
	// If near the top roof, flip it below the cursor.
	// If near the right edge, shift it left of the cursor.
	const isHitRoof = pos.y < 120;
	const isHitWall = pos.x > store.containerWidth.value - 280;

	// Diagonal offset of 15px so it doesn't cover the mouse pointer
	const transformX = isHitWall ? 'calc(-100% - 15px)' : '15px';
	const transformY = isHitRoof ? '15px' : 'calc(-100% - 15px)';

	const style = {
		left: `${pos.x}px`,
		top: `${pos.y}px`,
		transform: `translate(${transformX}, ${transformY})`,
	};

	return (
		<div class='gantt-tooltip' style={style}>
			<div class='gantt-tooltip__header'>
				<span class='gantt-tooltip__type'>{task.isMilestone ? 'Milestone' : 'Task'}</span>
			</div>

			<div class='gantt-tooltip__title'>{task.name}</div>

			<div class='gantt-tooltip__meta'>
				{isSinglePoint
					? (
						<div class='gantt-tooltip__meta-row'>
							<span class='gantt-tooltip__meta-label'>Scheduled:</span>
							<span>{startDt.toFormat('dd MMM yyyy, HH:mm')}</span>
						</div>
					)
					: (
						<>
							<div class='gantt-tooltip__meta-row'>
								<span class='gantt-tooltip__meta-label'>Starts:</span>
								<span>{startDt.toFormat('dd MMM yyyy, HH:mm')}</span>
							</div>
							<div class='gantt-tooltip__meta-row'>
								<span class='gantt-tooltip__meta-label'>Ends:</span>
								<span>{endDt.toFormat('dd MMM yyyy, HH:mm')}</span>
							</div>
						</>
					)}
			</div>
		</div>
	);
}

```

### File: packages\charts\src\components\kanban\index.ts

```ts
export * from './Kanban.tsx';
export * from './KanbanField.tsx';
export * from './KanbanCard.tsx';
export * from '../../types/kanban.ts';

```

### File: packages\charts\src\components\kanban\Kanban.tsx

```tsx
import { Fragment } from 'preact';
import { KanbanField } from './KanbanField.tsx';
import { KanbanCard } from './KanbanCard.tsx';
import { Button } from '@projective/ui';
import { KanbanFieldProps, KanbanProps } from '../../types/kanban.ts';
import { useKanbanDnD } from '../../hooks/useKanbanDnD.ts';
import '../../styles/kanban/kanban.css';

const sortFields = (fields: KanbanFieldProps[]): KanbanFieldProps[] => {
	return [...fields].sort((a, b) => {
		if (a.order >= 0 && b.order >= 0) return a.order - b.order;
		if (a.order < 0 && b.order < 0) return b.order - a.order;
		if (a.order >= 0 && b.order < 0) return -1;
		return 1;
	});
};

export function Kanban({
	fields,
	minHeight = '400px',
	permissions,
	onCardClick,
	onAddCard,
	onAddField,
	onCardMove,
	onFieldMove,
}: KanbanProps) {
	const dragData = useKanbanDnD(onCardMove, onFieldMove);
	const sortedFields = sortFields(fields);

	const classes = ['kanban', dragData.value.isDragging ? 'kanban--dragging' : ''].filter(Boolean)
		.join(' ');

	return (
		<div class={classes} style={{ '--kanban-min-height': minHeight } as any}>
			<div class='kanban__track'>
				{sortedFields.map((field) => {
					const isDraggingThisField = dragData.value.type === 'field' &&
						dragData.value.id === field.id;
					const isDropTarget = dragData.value.isDragging && dragData.value.type === 'field' &&
						dragData.value.targetFieldId === field.id && !isDraggingThisField;

					return (
						<Fragment key={field.id}>
							{isDropTarget && dragData.value.insertPosition === 'before' && (
								<div class='kanban__field-ghost' style={{ height: `${dragData.value.height}px` }} />
							)}

							<div
								class='kanban__field-wrapper'
								data-kanban-field-wrapper-id={field.id}
								style={{ display: isDraggingThisField ? 'none' : 'flex' }}
							>
								<KanbanField
									{...field}
									onCardClick={onCardClick}
									onAddCard={field.permissions?.canAddCard && onAddCard
										? () => onAddCard(field.id)
										: undefined}
								/>
							</div>

							{isDropTarget && dragData.value.insertPosition === 'after' && (
								<div class='kanban__field-ghost' style={{ height: `${dragData.value.height}px` }} />
							)}
						</Fragment>
					);
				})}

				{permissions?.canAddField && onAddField && (
					<div class='kanban__add-action'>
						<Button ghost onClick={onAddField} className='kanban__add-btn'>
							<span class='kanban__add-icon'>+</span> Add Stage
						</Button>
					</div>
				)}
			</div>

			{dragData.value.isDragging && (
				<div
					class='kanban__drag-avatar'
					style={{
						left: `${dragData.value.clientX - dragData.value.offsetX}px`,
						top: `${dragData.value.clientY - dragData.value.offsetY}px`,
						width: `${dragData.value.width}px`,
						height: `${dragData.value.height}px`,
					}}
				>
					{dragData.value.type === 'field'
						? <KanbanField {...dragData.value.fieldData!} cards={[]} />
						: <KanbanCard {...dragData.value.cardData!} fieldId='' />}
				</div>
			)}
		</div>
	);
}

```

### File: packages\charts\src\components\kanban\KanbanCard.tsx

```tsx
import type { KanbanCardProps } from '../../types/kanban.ts';
import { useDraggable, useDropzone } from '../../hooks/useKanbanDnD.ts';
import '../../styles/kanban/kanban-card.css';

interface ExtendedCardProps extends KanbanCardProps {
	fieldId: string;
	onClick?: () => void;
}

export function KanbanCard({
	fieldId,
	id,
	title,
	description,
	meta,
	tags,
	takenBy,
	permissions,
	onClick,
	...rest
}: ExtendedCardProps) {
	const isLocked = permissions?.canReorder !== true;
	const draggableProps = useDraggable(
		'card',
		{ id, title, description, tags, takenBy, permissions, ...rest },
		fieldId,
		isLocked,
	);
	const dropzoneProps = useDropzone('card', id);

	return (
		<div
			class='kanban-card'
			{...dropzoneProps}
			{...draggableProps}
			onClick={onClick}
			role='button'
			tabIndex={0}
		>
			<div class='kanban-card__header'>
				<h4 class='kanban-card__title'>{title}</h4>
				{meta && <span class='kanban-card__meta'>{meta}</span>}
			</div>

			{description && (
				<div class='kanban-card__body'>
					<p class='kanban-card__desc'>{description}</p>
				</div>
			)}

			<div class='kanban-card__footer'>
				<div class='kanban-card__tags'>
					{tags?.map((tag) => (
						<span
							key={tag.id}
							class={`kanban-card__tag kanban-card__tag--${tag.variant || 'solid'}`}
							style={tag.color ? { color: tag.color } : {}}
						>
							{tag.icon && <span class='kanban-card__tag-icon'>{tag.icon}</span>}
							{tag.label}
						</span>
					))}
				</div>

				{takenBy && (
					<div class='kanban-card__assignee'>
						{takenBy.avatarUrl
							? <img src={takenBy.avatarUrl} alt={takenBy.name} class='kanban-card__avatar-img' />
							: (
								<div class='kanban-card__avatar' title={takenBy.name}>
									{takenBy.name.charAt(0).toUpperCase()}
								</div>
							)}
					</div>
				)}
			</div>
		</div>
	);
}

```

### File: packages\charts\src\components\kanban\KanbanField.tsx

```tsx
import { Fragment } from 'preact';
import { Button } from '@projective/ui';
import { KanbanCard } from './KanbanCard.tsx';
import { KanbanCardProps, KanbanFieldProps } from '../../types/kanban.ts';
import { dragData, useDraggable, useDropzone } from '../../hooks/useKanbanDnD.ts';
import '../../styles/kanban/kanban-field.css';

const getTimestamp = (date: any): number => date ? new Date(date).getTime() : 0;

const sortCards = (cards: KanbanCardProps[]): KanbanCardProps[] => {
	return [...cards].sort((a, b) => {
		if (a.order !== b.order) return a.order - b.order;
		return getTimestamp(a.created) - getTimestamp(b.created);
	});
};

const resolveColor = (c: string) => {
	if (c === 'primary') return 'var(--primary)';
	if (!c || c === 'secondary') return 'var(--text-muted)';
	return c;
};

interface ExtendedFieldProps extends KanbanFieldProps {
	onCardClick?: (card: KanbanCardProps) => void;
	onAddCard?: () => void;
}

export function KanbanField({
	id,
	title,
	color = 'secondary',
	cards,
	limit,
	order,
	permissions,
	addCardLabel = 'Add Ticket',
	onCardClick,
	onAddCard,
}: ExtendedFieldProps) {
	const sortedCards = sortCards(cards);
	const cardCount = cards.length;
	const isOverLimit = limit !== undefined && cardCount > limit;

	// Locks/Hooks Setup
	const isLocked = permissions?.canReorder !== true;
	const draggableProps = useDraggable(
		'field',
		{ id, title, color, cards, limit, order, permissions },
		id,
		isLocked,
	);
	const dropzoneProps = useDropzone('field', id);

	return (
		<div
			class='kanban-field'
			style={{ '--field-solid': resolveColor(color) } as any}
			{...dropzoneProps}
		>
			<div class='kanban-field__header' {...draggableProps}>
				<h3 class='kanban-field__title'>{title}</h3>
				<div class={`kanban-field__metrics ${isOverLimit ? 'kanban-field__metrics--danger' : ''}`}>
					<span class='kanban-field__count'>{cardCount}</span>
				</div>
			</div>

			<div class='kanban-field__body'>
				{sortedCards.map((card) => {
					const isDraggingThisCard = dragData.value.type === 'card' &&
						dragData.value.id === card.id;
					const isDropTarget = dragData.value.isDragging && dragData.value.type === 'card' &&
						dragData.value.targetCardId === card.id && !isDraggingThisCard;

					return (
						<Fragment key={card.id}>
							{isDropTarget && dragData.value.insertPosition === 'before' && (
								<div class='kanban-card-ghost' style={{ height: `${dragData.value.height}px` }} />
							)}

							<div style={{ display: isDraggingThisCard ? 'none' : 'block' }}>
								<KanbanCard
									{...card}
									fieldId={id}
									onClick={() => onCardClick?.(card)}
								/>
							</div>

							{isDropTarget && dragData.value.insertPosition === 'after' && (
								<div class='kanban-card-ghost' style={{ height: `${dragData.value.height}px` }} />
							)}
						</Fragment>
					);
				})}

				{dragData.value.isDragging && dragData.value.type === 'card' &&
					dragData.value.targetFieldId === id && !dragData.value.targetCardId && (
					<div class='kanban-card-ghost' style={{ height: `${dragData.value.height}px` }} />
				)}

				{permissions?.canAddCard && onAddCard && (
					<div class='kanban-field__add-wrapper'>
						<Button ghost variant='secondary' onClick={onAddCard} className='kanban-field__add-btn'>
							+ {addCardLabel}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

```

### File: packages\charts\src\core\gantt\gantt-manager.ts

```ts
import { effect } from '@preact/signals';
import { TaskRenderer } from './renderer/task-renderer.ts';
import { GridRenderer } from './renderer/grid-renderer.ts';
import { ScrollRenderer } from './renderer/scroll-renderer.ts';
import { GanttStore } from './store.ts';
import * as PIXI from 'pixi.js';
import { ScrollManager } from './interaction/scroll.ts';

export class GanttManager {
	private app: PIXI.Application;
	private store: GanttStore;
	private scroll: ScrollManager;
	// deno-lint-ignore no-explicit-any
	private renderers: any[] = [];
	private resizeObserver: ResizeObserver;
	private themeObserver?: MutationObserver;

	constructor(container: HTMLElement, store: GanttStore) {
		this.store = store;
		this.app = new PIXI.Application();
		this.scroll = new ScrollManager(this.store);

		this.resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				if (width === 0 || height === 0) continue;

				this.store.resize(width, height);

				if (this.app.renderer) {
					this.app.renderer.resize(width, height);
				}
			}
		});

		this.init(container);
	}

	private async init(container: HTMLElement) {
		await this.app.init({
			width: 800,
			height: 600,
			backgroundAlpha: 0,
			antialias: true,
			resolution: globalThis.devicePixelRatio || 1,
			autoDensity: true,
		});

		container.appendChild(this.app.canvas);
		this.resizeObserver.observe(container);

		this.themeObserver = new MutationObserver((mutations) => {
			for (const m of mutations) {
				if (m.attributeName === 'data-theme') {
					this.store.themeTrigger.value++;
				}
			}
		});
		this.themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme'],
		});

		const grid = new GridRenderer(this.store);
		const tasks = new TaskRenderer(this.store);
		const scrollbars = new ScrollRenderer(this.store);

		this.app.stage.addChild(grid.container);
		this.app.stage.addChild(tasks.container);
		this.app.stage.addChild(scrollbars.container);

		this.renderers.push(grid, tasks, scrollbars);

		this.app.canvas.addEventListener('pointerdown', () => {
			if (this.store.hoveredScrollbar.value) return;
			this.scroll.handlePointerDown();
		});

		this.app.canvas.addEventListener('wheel', (e) => {
			if (e.ctrlKey || e.metaKey) {
				e.preventDefault();

				const zoomFactor = Math.exp(e.deltaY * 0.002);
				const currentDays = this.store.visibleDays.value;
				let newDays = currentDays * zoomFactor;
				newDays = Math.max(1, Math.min(newDays, 3650));

				const firstTask = this.store.tasks.value.length > 0 ? this.store.tasks.value[0] : null;
				const anchorDate = firstTask ? firstTask.startAt : this.store.timelineStart.value;
				const currentScreenX = this.store.timeScale.dateToX(anchorDate) + this.store.scrollX.value;

				this.store.setVisibleDays(newDays);

				const newAbsoluteX = this.store.timeScale.dateToX(anchorDate);
				this.store.scrollX.value = currentScreenX - newAbsoluteX;

				return;
			}

			this.store.isShiftDown.value = e.shiftKey;
			this.scroll.handleWheel(e);
		}, { passive: false });

		globalThis.addEventListener('pointermove', (e) => this.scroll.handlePointerMove(e.movementX));
		globalThis.addEventListener('pointerup', () => this.scroll.handlePointerUp());

		this.app.ticker.add(() => {
			if (this.store.isMouseDown.value) return;

			if (Math.abs(Math.round(this.store.deltaX.value)) > 0) {
				this.store.scrollX.value += this.store.deltaX.value;
				this.store.deltaX.value = this.store.deltaX.value * 0.9;
			} else {
				this.store.deltaX.value = 0;
			}
		});

		effect(() => {
			this.store.scrollX.value;
			this.store.scrollY.value;
			this.store.tasks.value;
			this.store.visibleDays.value;
			this.store.headerData.value;
			this.store.selectedRowId.value;

			this.store.containerWidth.value;
			this.store.containerHeight.value;
			this.store.themeTrigger.value;

			this.app.stage.y = -this.store.scrollY.value;
			this.app.stage.x = this.store.scrollX.value;

			this.renderAll();
		});
	}

	public renderAll() {
		this.renderers.forEach((r) => r.render());
	}

	public destroy() {
		this.resizeObserver.disconnect();
		this.themeObserver?.disconnect();
		this.app.destroy(true, { children: true });
	}
}

```

### File: packages\charts\src\core\gantt\header-utils.ts

```ts
import { DateTime } from '@projective/types';

// #region Interfaces
export type HeaderUnit = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface HeaderTier {
	top: HeaderUnit;
	topStep: number;
	bottom: HeaderUnit;
	bottomStep: number;
	formatTop: (d: DateTime) => string;
	formatBottom: (d: DateTime) => string;
}

export interface HeaderBlock {
	key: string;
	label: string;
	x: number;
	width: number;
	date: DateTime;
}
// #endregion

// #region Helpers
function toPlural(unit: HeaderUnit): string {
	switch (unit) {
		case 'hour':
			return 'hours';
		case 'day':
			return 'days';
		case 'week':
			return 'weeks';
		case 'month':
			return 'months';
		case 'year':
			return 'years';
		case 'quarter':
			return 'months';
		default:
			return unit;
	}
}
// #endregion

// #region Configuration
export function getHeaderTier(visibleDays: number, containerWidth: number): HeaderTier {
	const pixelsPerDay = containerWidth / Math.max(1, visibleDays);

	// Reduced from 45. A two digit day ("24") only needs about 20-25px to render cleanly.
	const MIN_DAY_WIDTH = 25;

	if (pixelsPerDay >= 120) {
		const pixelsPerHour = pixelsPerDay / 24;
		const hourStepRaw = Math.ceil(MIN_DAY_WIDTH / pixelsPerHour);
		const validHourSteps = [1, 2, 3, 4, 6, 12];
		const hourStep = validHourSteps.find((s) => s >= hourStepRaw) || 12;

		return {
			top: 'day',
			topStep: 1,
			bottom: 'hour',
			bottomStep: hourStep,
			formatTop: (d) => d.toFormat('ddd d MMM yyyy'),
			formatBottom: (d) => d.toFormat('HH:mm'),
		};
	} else if (pixelsPerDay >= MIN_DAY_WIDTH) {
		// Single Days (If there is enough physical room, show every single day)
		return {
			top: 'month',
			topStep: 1,
			bottom: 'day',
			bottomStep: 1,
			formatTop: (d) => d.toFormat('MMMM yyyy'),
			formatBottom: (d) => d.toFormat('dd'),
		};
	} else {
		// Grouped Days
		const dayStepRaw = Math.ceil(MIN_DAY_WIDTH / pixelsPerDay);
		const validDaySteps = [2, 3, 4, 5, 7, 10, 14, 15];

		if (dayStepRaw <= 15) {
			const dayStep = validDaySteps.find((s) => s >= dayStepRaw) || 15;
			return {
				top: 'month',
				topStep: 1,
				bottom: 'day',
				bottomStep: dayStep,
				formatTop: (d) => d.toFormat('MMMM yyyy'),
				formatBottom: (d) => d.toFormat('dd'),
			};
		}

		// Months
		const pixelsPerMonth = pixelsPerDay * 30;
		if (pixelsPerMonth >= MIN_DAY_WIDTH) {
			const monthStepRaw = Math.ceil(MIN_DAY_WIDTH / pixelsPerMonth);
			const validMonthSteps = [1, 2, 3, 4, 6];
			const monthStep = validMonthSteps.find((s) => s >= monthStepRaw) || 6;

			return {
				top: 'year',
				topStep: 1,
				bottom: 'month',
				bottomStep: monthStep,
				formatTop: (d) => d.toFormat('yyyy'),
				formatBottom: (d) => d.toFormat('MMM'),
			};
		}

		// Quarters / Years
		return {
			top: 'year',
			topStep: 1,
			bottom: 'quarter',
			bottomStep: 1,
			formatTop: (d) => d.toFormat('yyyy'),
			formatBottom: (d) => `Q${Math.ceil((d.getMonth() + 1) / 3)}`,
		};
	}
}
// #endregion

// #region Generators
export function generateHeaderBlocks(
	start: DateTime,
	end: DateTime,
	unit: HeaderUnit,
	step: number,
	dateToX: (ms: number) => number,
): HeaderBlock[] {
	const blocks: HeaderBlock[] = [];

	// 1. ANCHOR TO EPOCH: Always snap to the absolute beginning of the relevant calendar unit.
	// This ensures that when scrolling, the math doesn't shift relative to the scrollbar.
	let current = new DateTime(new Date(start.getTime()));

	if (unit === 'hour') {
		current = current.startOf('day');
	} else if (unit === 'day') {
		current = current.startOf('month');
	} else if (unit === 'week') {
		const dayOfWeek = current.getDay();
		const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
		current = new DateTime(new Date(current.getTime() - diff * 86400000)).startOf('day');
	} else {
		current = current.startOf('year');
	}

	const startMs = start.getTime();
	const endTime = end.getTime();
	const pluralUnit = toPlural(unit);

	// 2. FAST FORWARD: Skip iterations until we reach the visible viewport
	let safety = 0;
	while (safety < 5000) {
		let next: DateTime;
		if (unit === 'quarter') {
			next = current.add(3 * step, 'months');
		} else {
			// @ts-ignore
			next = current.add(step, pluralUnit);
		}

		if (next.getTime() > startMs) break;

		current = next;
		safety++;
	}

	// 3. GENERATE RENDER BLOCKS
	safety = 0;
	while (current.getTime() < endTime && safety < 5000) {
		let next: DateTime;
		if (unit === 'quarter') {
			next = current.add(3 * step, 'months');
		} else {
			// @ts-ignore
			next = current.add(step, pluralUnit);
		}

		const xStart = dateToX(current.getTime());
		const xEnd = dateToX(next.getTime());

		if (xEnd > xStart) {
			blocks.push({
				key: `${unit}-${current.getTime()}`,
				label: '',
				x: xStart,
				width: xEnd - xStart,
				date: current.clone(),
			});
		}

		current = next;
		safety++;
	}

	return blocks;
}
// #endregion

```

### File: packages\charts\src\core\gantt\interaction\scroll.ts

```ts
import { GanttStore } from '../store.ts';

export class ScrollManager {
	private store: GanttStore;
	private readonly BOTTOM_BUFFER = 50;

	constructor(store: GanttStore) {
		this.store = store;
	}

	public handlePointerDown() {
		if (!this.store.canDrag.value) return;

		this.store.isMouseDown.value = true;
	}

	public handlePointerMove(x: number) {
		if (!this.store.isMouseDown.value) return;
		this.store.scrollX.value += x;
		this.store.deltaX.value = x;
	}

	public handlePointerUp() {
		this.store.isMouseDown.value = false;
	}

	public handleWheel(e: WheelEvent) {
		e.preventDefault();

		if (this.store.isShiftDown.value) {
			this.store.scrollX.value -= e.deltaY;
		} else {
			const currentY = this.store.scrollY.value;
			const delta = e.deltaY * 0.6;

			const contentHeight = this.store.contentHeight.value;
			const viewportHeight = this.store.containerHeight.value;

			const maxScrollY = Math.max(0, contentHeight - viewportHeight);

			let newY = currentY + delta;

			if (newY < 0) newY = 0;
			if (newY > maxScrollY) newY = maxScrollY;

			this.store.scrollY.value = newY;
		}
	}
}

```

### File: packages\charts\src\core\gantt\renderer\base-renderer.ts

```ts
import * as PIXI from 'pixi.js';
import { GanttStore } from '../store.ts';

/**
 * Base class for all Gantt canvas layers.
 */
export abstract class BaseRenderer {
	public container: PIXI.Container;
	protected store: GanttStore;

	constructor(store: GanttStore) {
		this.store = store;
		this.container = new PIXI.Container();
	}

	/**
	 * Called every frame or on state change to redraw the layer.
	 */
	abstract render(): void;

	/**
	 * Cleanup resources if necessary.
	 */
	public destroy(): void {
		this.container.destroy({ children: true });
	}
}

```

### File: packages\charts\src\core\gantt\renderer\grid-renderer.ts

```ts
import * as PIXI from 'pixi.js';
import { BaseRenderer } from './base-renderer.ts';
import { GanttStore } from '../store.ts';
import { getThemeColor } from '../../../utils/theme-bridge.ts';
import { DateTime } from '@projective/types';
import { generateHeaderBlocks, getHeaderTier } from '../header-utils.ts';

export class GridRenderer extends BaseRenderer {
	private graphics: PIXI.Graphics;

	constructor(store: GanttStore) {
		super(store);
		this.graphics = new PIXI.Graphics();
		this.container.addChild(this.graphics);
	}

	public render(): void {
		this.graphics.clear();

		const cPrimary = getThemeColor('--primary');
		const cSecondary = getThemeColor('--border-color');

		const currentX = this.store.scrollX.value;
		const width = this.store.containerWidth.value;
		const days = this.store.visibleDays.value;

		const buffer = 500;
		const renderStartX = -currentX - buffer;
		const renderEndX = -currentX + width + buffer;

		const startDate = new DateTime(new Date(this.store.timeScale.xToDate(renderStartX)));
		const endDate = new DateTime(new Date(this.store.timeScale.xToDate(renderEndX)));

		const tier = getHeaderTier(days, width);
		const dateToX = (t: number) => this.store.timeScale.dateToX(t);

		const topRows = generateHeaderBlocks(startDate, endDate, tier.top, tier.topStep, dateToX);
		const bottomRows = generateHeaderBlocks(
			startDate,
			endDate,
			tier.bottom,
			tier.bottomStep,
			dateToX,
		);

		// Calculate drawing boundaries relative to scroll to ensure lines reach bottom of viewport
		const startY = this.store.scrollY.value;
		const endY = startY + this.store.containerHeight.value;

		// Render secondary (bottom) vertical lines using standard border color
		this.graphics.beginPath();
		for (const block of bottomRows) {
			const x = block.x;
			this.graphics.moveTo(x, startY);
			this.graphics.lineTo(x, endY);
		}
		this.graphics.stroke({ width: 1, color: cSecondary, alpha: 0.3 });

		// Render primary (top) vertical lines using accent
		this.graphics.beginPath();
		for (const block of topRows) {
			const x = block.x;
			this.graphics.moveTo(x, startY);
			this.graphics.lineTo(x, endY);
		}
		this.graphics.stroke({ width: 1, color: cPrimary, alpha: 0.2 });
	}
}

```

### File: packages\charts\src\core\gantt\renderer\scroll-renderer.ts

```ts
import * as PIXI from 'pixi.js';
import { BaseRenderer } from './base-renderer.ts';
import { GanttStore } from '../store.ts';
import { getThemeColor } from '../../../utils/theme-bridge.ts';

export class ScrollRenderer extends BaseRenderer {
	private vThumb: PIXI.Graphics;
	private hThumb: PIXI.Graphics;

	private vHovered = false;
	private hHovered = false;

	// Dragging State
	private dragging = false;
	private activeThumb: 'v' | 'h' | null = null;
	private dragStartY = 0;
	private dragStartX = 0;
	private startScrollY = 0;
	private startScrollX = 0;

	// Dynamic Boundaries captured at the exact moment a drag starts
	private dragTotalWidth = 0;
	private dragMinX = 0;

	constructor(store: GanttStore) {
		super(store);

		this.vThumb = new PIXI.Graphics();
		this.vThumb.eventMode = 'static';
		this.vThumb.cursor = 'default';

		this.hThumb = new PIXI.Graphics();
		this.hThumb.eventMode = 'static';
		this.hThumb.cursor = 'default';

		this.bindInteraction();

		this.container.addChild(this.vThumb);
		this.container.addChild(this.hThumb);
	}

	private bindInteraction() {
		// Hover States (Communicates to Canvas to yield priority)
		this.vThumb.on('pointerenter', () => {
			this.vHovered = true;
			this.store.hoveredScrollbar.value = true;
			this.render();
		});
		this.vThumb.on('pointerleave', () => {
			this.vHovered = false;
			if (!this.hHovered && !this.dragging) this.store.hoveredScrollbar.value = false;
			this.render();
		});

		this.hThumb.on('pointerenter', () => {
			this.hHovered = true;
			this.store.hoveredScrollbar.value = true;
			this.render();
		});
		this.hThumb.on('pointerleave', () => {
			this.hHovered = false;
			if (!this.vHovered && !this.dragging) this.store.hoveredScrollbar.value = false;
			this.render();
		});

		// Start Vertical Drag
		this.vThumb.on('pointerdown', (e) => {
			this.dragging = true;
			this.activeThumb = 'v';
			this.dragStartY = e.client.y; // Use raw client pixels to match DOM window events
			this.startScrollY = this.store.scrollY.value;
			this.store.hoveredScrollbar.value = true;
		});

		// Start Horizontal Drag
		this.hThumb.on('pointerdown', (e) => {
			this.dragging = true;
			this.activeThumb = 'h';
			this.dragStartX = e.client.x;
			this.startScrollX = this.store.scrollX.value;
			this.store.hoveredScrollbar.value = true;

			// Snapshot the virtual boundaries so the scale doesn't warp while actively dragging
			const vWidth = this.store.containerWidth.value;
			const vLeft = -this.startScrollX;
			const timelineStartMs = this.store.timelineStart.value;

			let maxEndMs = timelineStartMs;
			this.store.tasks.value.forEach((t) => {
				if (t.endAt > maxEndMs) maxEndMs = t.endAt;
			});
			maxEndMs += 14 * 86400000;

			const dataStartX = this.store.timeScale.dateToX(timelineStartMs);
			const dataEndX = this.store.timeScale.dateToX(maxEndMs);

			this.dragMinX = Math.min(vLeft, dataStartX);
			const maxX = Math.max(vLeft + vWidth, dataEndX);
			this.dragTotalWidth = maxX - this.dragMinX;
		});

		// Bind move/up to the global window so we don't drop the drag if the cursor flies off the canvas
		globalThis.addEventListener('pointermove', this.onPointerMove);
		globalThis.addEventListener('pointerup', this.onPointerUp);
	}

	private onPointerMove = (e: PointerEvent) => {
		if (!this.dragging) return;

		if (this.activeThumb === 'v') {
			const vHeight = this.store.containerHeight.value;
			const cHeight = this.store.contentHeight.value;
			const maxScroll = Math.max(0, cHeight - vHeight);

			const margin = 4;
			const minThumbHeight = 40;
			const thumbHeight = Math.max((vHeight / cHeight) * vHeight, minThumbHeight);
			const maxThumbTravel = vHeight - thumbHeight - margin * 2;

			if (maxThumbTravel <= 0) return;

			const deltaY = e.clientY - this.dragStartY;
			const multiplier = maxScroll / maxThumbTravel;

			let newScroll = this.startScrollY + (deltaY * multiplier);
			newScroll = Math.max(0, Math.min(newScroll, maxScroll));

			this.store.scrollY.value = newScroll;
		} else if (this.activeThumb === 'h') {
			const vWidth = this.store.containerWidth.value;
			const margin = 4;
			const minThumbWidth = 40;

			const thumbWidth = Math.max((vWidth / this.dragTotalWidth) * vWidth, minThumbWidth);
			const maxThumbTravel = vWidth - thumbWidth - margin * 2;
			const maxScroll = this.dragTotalWidth - vWidth;

			if (maxThumbTravel <= 0) return;

			const deltaX = e.clientX - this.dragStartX;
			const multiplier = maxScroll / maxThumbTravel;

			const startVLeft = -this.startScrollX;
			let newVLeft = startVLeft + (deltaX * multiplier);

			newVLeft = Math.max(this.dragMinX, Math.min(newVLeft, this.dragMinX + maxScroll));

			// Store uses inverted scroll logic for canvas panning
			this.store.scrollX.value = -newVLeft;
		}
	};

	private onPointerUp = () => {
		if (this.dragging) {
			this.dragging = false;
			this.activeThumb = null;
			this.store.hoveredScrollbar.value = false;
			this.render();
		}
	};

	public render(): void {
		this.container.x = -this.store.scrollX.value;
		this.container.y = this.store.scrollY.value;

		this.renderVertical();
		this.renderHorizontal();
	}

	private renderVertical() {
		this.vThumb.clear();

		const vHeight = this.store.containerHeight.value;
		const cHeight = this.store.contentHeight.value;

		if (cHeight <= vHeight) return;

		const scrollY = this.store.scrollY.value;
		const maxScroll = cHeight - vHeight;

		const isHovering = this.vHovered || this.activeThumb === 'v';
		const width = isHovering ? 8 : 6;
		const margin = 4;

		const minThumbHeight = 40;
		const thumbHeight = Math.max((vHeight / cHeight) * vHeight, minThumbHeight);
		const scrollRatio = scrollY / maxScroll;

		const rawThumbY = margin + scrollRatio * (vHeight - thumbHeight - margin * 2);
		const thumbY = Math.max(margin, Math.min(rawThumbY, vHeight - thumbHeight - margin));
		const x = this.store.containerWidth.value - width - margin;

		const cTextMain = getThemeColor('--text-main');
		const alpha = isHovering ? 0.6 : 0.2;

		// Invisible fill allows hit detection on the hollow inside of the outline
		this.vThumb.roundRect(x, thumbY, width, thumbHeight, width / 2);
		this.vThumb.fill({ color: 0xffffff, alpha: 0.001 });
		this.vThumb.stroke({ width: 1.5, color: cTextMain, alpha });
	}

	private renderHorizontal() {
		this.hThumb.clear();

		const vWidth = this.store.containerWidth.value;
		const vLeft = -this.store.scrollX.value;
		const vRight = vLeft + vWidth;

		const timelineStartMs = this.store.timelineStart.value;
		let maxEndMs = timelineStartMs;
		this.store.tasks.value.forEach((t) => {
			if (t.endAt > maxEndMs) maxEndMs = t.endAt;
		});
		maxEndMs += 14 * 86400000;

		const dataStartX = this.store.timeScale.dateToX(timelineStartMs);
		const dataEndX = this.store.timeScale.dateToX(maxEndMs);

		const minX = Math.min(vLeft, dataStartX);
		const maxX = Math.max(vRight, dataEndX);
		const totalWidth = maxX - minX;

		if (totalWidth <= vWidth + 1) return;

		const isHovering = this.hHovered || this.activeThumb === 'h';
		const height = isHovering ? 8 : 6;
		const margin = 4;

		const minThumbWidth = 40;
		const thumbWidth = Math.max((vWidth / totalWidth) * vWidth, minThumbWidth);

		const scrollRatio = (vLeft - minX) / (totalWidth - vWidth);
		const rawThumbX = margin + scrollRatio * (vWidth - thumbWidth - margin * 2);
		const thumbX = Math.max(margin, Math.min(rawThumbX, vWidth - thumbWidth - margin));

		const y = this.store.containerHeight.value - height - margin;

		const cTextMain = getThemeColor('--text-main');
		const alpha = isHovering ? 0.6 : 0.2;

		// Invisible fill allows hit detection on the hollow inside of the outline
		this.hThumb.roundRect(thumbX, y, thumbWidth, height, height / 2);
		this.hThumb.fill({ color: 0xffffff, alpha: 0.001 });
		this.hThumb.stroke({ width: 1.5, color: cTextMain, alpha });
	}

	public override destroy() {
		super.destroy();
		globalThis.removeEventListener('pointermove', this.onPointerMove);
		globalThis.removeEventListener('pointerup', this.onPointerUp);
	}
}

```

### File: packages\charts\src\core\gantt\renderer\task-renderer.ts

```ts
// deno-lint-ignore-file no-explicit-any
import * as PIXI from 'pixi.js';
import { BaseRenderer } from './base-renderer.ts';
import { GanttStore } from '../store.ts';
import { DateTime } from '@projective/types';
import { getThemeColor } from '../../../utils/theme-bridge.ts';
import { GanttTask } from '../../../types/gantt.ts';

export class TaskRenderer extends BaseRenderer {
	constructor(store: GanttStore) {
		super(store);
	}

	public render(): void {
		this.container.removeChildren();

		const tasks = this.store.tasks.value;
		const rows = [...this.store.rows.value].sort((a, b) => a.orderIndex - b.orderIndex);
		const rowHeight = this.store.rowHeight.value;

		const rowMap = new Map<string, number>();
		rows.forEach((row, index) => rowMap.set(row.id, index));

		const cBg = getThemeColor('--bg');
		const cAccent = getThemeColor('--primary');
		const cTextMain = getThemeColor('--text-main');
		const cTextMuted = getThemeColor('--text-muted');
		const cMilestone = getThemeColor('--warning');

		const titleStyle = new PIXI.TextStyle({
			fontFamily: 'Inter, system-ui, sans-serif',
			fontSize: 12,
			fill: cTextMain,
			fontWeight: '600',
		});

		const dateStyle = new PIXI.TextStyle({
			fontFamily: 'Inter, system-ui, sans-serif',
			fontSize: 10,
			fill: cTextMuted,
			fontWeight: '500',
		});

		for (const task of tasks) {
			const rowIndex = rowMap.get(task.rowId);
			if (rowIndex === undefined) continue;

			const coords = this.store.getTaskCoordinates(task);
			const safeWidth = Math.min(Math.max(coords.width, 2), 16000);

			const margin = 12;
			const barHeight = rowHeight - (margin * 2);
			const y = (rowIndex * rowHeight) + margin;

			const isSelected = task.rowId === this.store.selectedRowId.value;

			if (task.isMilestone) {
				this.renderMilestone(task, isSelected, coords.x, y, barHeight, {
					cBg,
					cMilestone,
					cAccent,
				});
			} else {
				this.renderTaskBar(
					task,
					isSelected,
					coords.x,
					safeWidth,
					y,
					barHeight,
					{ cAccent },
					{ titleStyle, dateStyle },
				);
			}
		}
	}

	private renderTaskBar(
		task: GanttTask,
		isSelected: boolean,
		x: number,
		width: number,
		y: number,
		height: number,
		colors: { cAccent: number },
		styles: { titleStyle: PIXI.TextStyle; dateStyle: PIXI.TextStyle },
	): void {
		const group = new PIXI.Container();
		group.x = x;
		group.y = y;

		const bg = new PIXI.Graphics();
		const radius = 4;

		const strokeAlpha = isSelected ? 1 : 0.4;
		const strokeWidth = isSelected ? 2 : 1;

		bg.roundRect(0, 0, width, height, radius);
		bg.fill({ color: colors.cAccent, alpha: 0.15 });
		bg.stroke({ width: strokeWidth, color: colors.cAccent, alpha: strokeAlpha });

		bg.beginPath();
		bg.roundRect(0, 0, 4, height, radius);
		bg.fill({ color: colors.cAccent, alpha: 1 });

		group.addChild(bg);

		const textPadX = 12;
		if (width > 40) {
			const title = new PIXI.Text({ text: task.name, style: styles.titleStyle });
			title.x = textPadX;
			title.y = 5;
			group.addChild(title);
		}

		if (width > 120) {
			const dateStr = `${new DateTime(new Date(task.startAt)).toFormat('dd/MM')} - ${
				new DateTime(new Date(task.endAt)).toFormat('dd/MM')
			}`;
			const dateText = new PIXI.Text({ text: dateStr, style: styles.dateStyle });
			dateText.x = textPadX;
			dateText.y = 20;
			group.addChild(dateText);
		}

		this.bindInteraction(group, task);
		this.container.addChild(group);
	}

	private renderMilestone(
		task: GanttTask,
		isSelected: boolean,
		x: number,
		y: number,
		size: number,
		colors: { cBg: number; cMilestone: number; cAccent: number },
	): void {
		const graphics = new PIXI.Graphics();

		const centerX = x;
		const centerY = y + size / 2;
		const diamondRadius = 10;

		graphics.beginPath();
		graphics.moveTo(centerX, centerY - diamondRadius);
		graphics.lineTo(centerX + diamondRadius, centerY);
		graphics.lineTo(centerX, centerY + diamondRadius);
		graphics.lineTo(centerX - diamondRadius, centerY);
		graphics.closePath();

		graphics.fill({ color: colors.cMilestone, alpha: 1 });

		const strokeColor = isSelected ? colors.cAccent : colors.cBg;
		graphics.stroke({ width: 3, color: strokeColor, alpha: 1 });

		this.bindInteraction(graphics, task);
		this.container.addChild(graphics);
	}

	private bindInteraction(element: PIXI.Container, task: GanttTask) {
		element.eventMode = 'static';
		element.cursor = 'pointer';

		element.on('pointerenter', (e) => {
			this.store.hoveredTask.value = task;
			this.store.pointerPos.value = { x: e.global.x, y: e.global.y };
		});

		element.on('pointermove', (e) => {
			if (this.store.hoveredTask.value?.id === task.id) {
				this.store.pointerPos.value = { x: e.global.x, y: e.global.y };
			}
		});

		element.on('pointerleave', () => {
			this.store.hoveredTask.value = null;
		});

		element.on('pointerdown', () => {
			this.store.selectRow(task.rowId);
		});
	}
}

```

### File: packages\charts\src\core\gantt\store.ts

```ts
import { DateTime } from '@projective/types';
import { batch, computed, type Signal, signal } from '@preact/signals';
import { GanttTimeScale } from './time-scale.ts';
import {
	generateHeaderBlocks,
	getHeaderTier,
	type HeaderBlock,
	type HeaderTier,
} from './header-utils.ts';
import type { DependencyLink, GanttRow, GanttTask } from '../../types/gantt.ts';

export interface GanttStoreOptions {
	visibleWidth: number;
	visibleHeight: number;
	startDate: number;
	endDate?: number;
}

export interface HeaderData {
	topRows: HeaderBlock[];
	bottomRows: HeaderBlock[];
	tier: HeaderTier;
	totalWidth: number;
}

export class GanttStore {
	public rows: Signal<GanttRow[]>;
	public tasks: Signal<GanttTask[]>;
	public dependencies: Signal<DependencyLink[]>;

	public visibleDays: Signal<number>;

	public scrollX: Signal<number>;
	public scrollY: Signal<number>;
	public deltaX: Signal<number>;
	public canDrag: Signal<boolean>;

	public isMouseDown: Signal<boolean>;
	public isShiftDown: Signal<boolean>;

	// Hover & Tooltip State
	public hoveredTask: Signal<GanttTask | null>;
	public pointerPos: Signal<{ x: number; y: number }>;

	// Interaction Overrides
	public hoveredScrollbar: Signal<boolean>;

	// Selection State
	public selectedRowId: Signal<string | null>;
	public onRowSelect?: (rowId: string) => void;

	public containerWidth: Signal<number>;
	public containerHeight: Signal<number>;

	public rowHeight: Signal<number>;
	public rowGap: Signal<number>;

	public timelineStart: Signal<number>;
	public timeScale: GanttTimeScale;

	public themeTrigger: Signal<number>;

	constructor(options: GanttStoreOptions) {
		this.rows = signal([]);
		this.tasks = signal([]);
		this.dependencies = signal([]);

		this.visibleDays = signal(30);
		this.scrollX = signal(0);
		this.scrollY = signal(0);
		this.deltaX = signal(0);
		this.canDrag = signal(true);

		this.isMouseDown = signal(false);
		this.isShiftDown = signal(false);

		this.hoveredTask = signal(null);
		this.pointerPos = signal({ x: 0, y: 0 });
		this.hoveredScrollbar = signal(false);

		this.selectedRowId = signal(null);

		this.containerWidth = signal(options.visibleWidth);
		this.containerHeight = signal(options.visibleHeight);

		this.rowHeight = signal(60);
		this.rowGap = signal(40);
		this.themeTrigger = signal(0);

		this.timelineStart = signal(options.startDate);

		this.timeScale = new GanttTimeScale({
			visibleDays: this.visibleDays.value,
			width: options.visibleWidth,
			startDate: options.startDate,
		});
	}

	public selectRow(rowId: string) {
		this.selectedRowId.value = rowId;
		if (this.onRowSelect) {
			this.onRowSelect(rowId);
		}
	}

	public contentHeight = computed(() => {
		return this.rows.value.length * this.rowHeight.value;
	});

	public loadData(rows: GanttRow[], tasks: GanttTask[], links: DependencyLink[]) {
		batch(() => {
			this.rows.value = rows;
			this.tasks.value = tasks;
			this.dependencies.value = links;
		});
	}

	public resize(width: number, height: number) {
		this.timeScale.update(this.visibleDays.value, width, this.timelineStart.value);
		batch(() => {
			this.containerWidth.value = width;
			this.containerHeight.value = height;
		});
	}

	public setVisibleDays(days: number) {
		const validDays = Math.max(1, days);
		this.timeScale.update(validDays, this.containerWidth.value, this.timelineStart.value);
		this.visibleDays.value = validDays;
	}

	public setStartDate(start: number) {
		this.timeScale.update(this.visibleDays.value, this.containerWidth.value, start);
		this.timelineStart.value = start;
	}

	public getTaskCoordinates(task: GanttTask): { x: number; width: number } {
		const x1 = this.timeScale.dateToX(task.startAt);
		const x2 = this.timeScale.dateToX(task.endAt);
		return { x: x1, width: Math.max(x2 - x1, 2) };
	}

	public headerData = computed<HeaderData>(() => {
		const days = this.visibleDays.value;
		const width = this.containerWidth.value;
		const startMs = this.timelineStart.value;

		const tier = getHeaderTier(days, width);

		const startDT = new DateTime(new Date(startMs));
		const endDT = startDT.add(days, 'days').endOf('day');

		this.timeScale.update(days, width, startMs);
		const dateToX = (t: number) => this.timeScale.dateToX(t);

		const topRows = generateHeaderBlocks(startDT, endDT, tier.top, tier.topStep, dateToX);
		const bottomRows = generateHeaderBlocks(startDT, endDT, tier.bottom, tier.bottomStep, dateToX);

		return {
			topRows,
			bottomRows,
			tier,
			totalWidth: width,
		};
	});
}

```

### File: packages\charts\src\core\gantt\time-scale.ts

```ts
import { DateTime } from '@projective/types';

// #region Interfaces

export interface TimeScaleConfig {
	visibleDays: number;
	width: number;
	startDate: number; // Timestamp
}

// #endregion

/**
 * Manages the "Time Domain" -> "Pixel Range" mapping.
 * Calculates coordinates based on a specific number of visible days.
 */
export class GanttTimeScale {
	private _visibleDays: number;
	private _width: number;
	private _start: number;
	private _msPerPixel: number;

	constructor(config: TimeScaleConfig) {
		this._visibleDays = config.visibleDays;
		this._width = config.width;
		this._start = config.startDate;

		this._msPerPixel = this.calculateRatio();
	}

	/**
	 * Recalculates the ratio of milliseconds per pixel.
	 * Total MS in View / Total Pixels
	 */
	private calculateRatio(): number {
		const totalMs = this._visibleDays * 86400000; // days * 24 * 60 * 60 * 1000
		return totalMs / (this._width || 1);
	}

	/**
	 * Updates the configuration and recalculates ratio.
	 */
	public update(visibleDays: number, width: number, startDate: number) {
		this._visibleDays = visibleDays;
		this._width = width;
		this._start = startDate;
		this._msPerPixel = this.calculateRatio();
	}

	/**
	 * Converts a timestamp to a generic X pixel coordinate.
	 * @param date Timestamp in ms
	 */
	public dateToX(date: number): number {
		const diffMs = date - this._start;
		return diffMs / this._msPerPixel;
	}

	/**
	 * Converts an X pixel coordinate back to a timestamp.
	 * @param x Pixel coordinate
	 */
	public xToDate(x: number): number {
		const msToAdd = x * this._msPerPixel;
		return this._start + msToAdd;
	}

	/**
	 * Returns the Date object for the right-most edge of the view.
	 */
	public getEndDate(): DateTime {
		const start = new DateTime(new Date(this._start));
		return start.add(this._visibleDays, 'days');
	}

	/**
	 * Returns the visible width of a single day in pixels.
	 */
	public getDayWidth(): number {
		return this._width / this._visibleDays;
	}
}

```

### File: packages\charts\src\hooks\useKanbanDnD.ts

```ts
import { useEffect } from 'preact/hooks';
import { signal } from '@preact/signals';
import { DragData, INITIAL_DRAG_DATA, KanbanCardProps, KanbanFieldProps } from '../types/kanban.ts';

export const dragData = signal<DragData>(INITIAL_DRAG_DATA);

export function useDraggable(
	type: 'card' | 'field',
	data: any,
	sourceId: string,
	isLocked: boolean,
) {
	const onPointerDown = (e: PointerEvent) => {
		if (isLocked) return;
		if ((e.target as HTMLElement).closest('button')) return;

		// Prevent default to capture pointer completely
		e.preventDefault();
		e.stopPropagation();

		const el = e.currentTarget as HTMLElement;
		const rect = el.getBoundingClientRect();

		dragData.value = {
			...INITIAL_DRAG_DATA,
			isDragging: true,
			type,
			id: data.id,
			sourceFieldId: type === 'card' ? sourceId : null,
			clientX: e.clientX,
			clientY: e.clientY,
			offsetX: e.clientX - rect.left,
			offsetY: e.clientY - rect.top,
			width: rect.width,
			height: rect.height,
			...(type === 'card' ? { cardData: data } : { fieldData: data }),
		};
	};

	return {
		onPointerDown,
		'data-reorderable': !isLocked,
	};
}

export function useDropzone(type: 'card' | 'field', id: string) {
	return {
		[`data-kanban-${type}-id`]: id,
	};
}

export function useKanbanDnD(
	onCardMove?: (
		cardId: string,
		sourceFieldId: string,
		targetFieldId: string,
		insertBeforeId: string | null,
	) => void,
	onFieldMove?: (sourceFieldId: string, targetFieldId: string, insertBefore: boolean) => void,
) {
	useEffect(() => {
		const handlePointerMove = (e: PointerEvent) => {
			if (!dragData.value.isDragging) return;
			e.preventDefault();

			const targetEl = document.elementFromPoint(e.clientX, e.clientY);
			let targetFieldId = dragData.value.targetFieldId;
			let targetCardId = dragData.value.targetCardId;
			let insertPosition = dragData.value.insertPosition;

			if (dragData.value.type === 'card') {
				const cardEl = targetEl?.closest('[data-kanban-card-id]');
				const fieldEl = targetEl?.closest('[data-kanban-field-id]');

				if (cardEl) {
					targetFieldId = fieldEl?.getAttribute('data-kanban-field-id') || null;
					targetCardId = cardEl.getAttribute('data-kanban-card-id');
					const rect = cardEl.getBoundingClientRect();
					insertPosition = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
				} else if (fieldEl) {
					const hoveredFieldId = fieldEl.getAttribute('data-kanban-field-id');
					if (hoveredFieldId !== targetFieldId) {
						targetFieldId = hoveredFieldId;
						targetCardId = null;
						insertPosition = 'after';
					}
				}
			} else if (dragData.value.type === 'field') {
				const fieldEl = targetEl?.closest('[data-kanban-field-wrapper-id]');
				if (fieldEl) {
					targetFieldId = fieldEl.getAttribute('data-kanban-field-wrapper-id');
					const rect = fieldEl.getBoundingClientRect();
					insertPosition = e.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
				}
			}

			dragData.value = {
				...dragData.value,
				clientX: e.clientX,
				clientY: e.clientY,
				targetFieldId,
				targetCardId,
				insertPosition,
			};
		};

		const handlePointerUp = () => {
			if (!dragData.value.isDragging) return;

			const { type, id, sourceFieldId, targetFieldId, targetCardId, insertPosition } =
				dragData.value;

			if (type === 'card' && id && sourceFieldId && targetFieldId) {
				let insertBeforeId = null;
				if (targetCardId) {
					insertBeforeId = insertPosition === 'before'
						? targetCardId
						: `${targetCardId}_after`;
				}
				if (!(sourceFieldId === targetFieldId && targetCardId === id)) {
					onCardMove?.(id, sourceFieldId, targetFieldId, insertBeforeId);
				}
			} else if (type === 'field' && id && targetFieldId && id !== targetFieldId) {
				onFieldMove?.(id, targetFieldId, insertPosition === 'before');
			}

			dragData.value = INITIAL_DRAG_DATA;
		};

		if (dragData.value.isDragging) {
			globalThis.addEventListener('pointermove', handlePointerMove, { passive: false });
			globalThis.addEventListener('pointerup', handlePointerUp);
		}

		return () => {
			globalThis.removeEventListener('pointermove', handlePointerMove);
			globalThis.removeEventListener('pointerup', handlePointerUp);
		};
	}, [dragData.value.isDragging, onCardMove, onFieldMove]);

	return dragData;
}

```

### File: packages\charts\src\types\gantt.ts

```ts
import { z } from 'zod';

// #region 1. Enums & Constants

/**
 * Defines the granularity of the timeline view.
 */
export enum ZoomLevel {
	Hour = 'hour',
	Day = 'day',
	Week = 'week',
	Month = 'month',
	Quarter = 'quarter',
	Year = 'year',
}

/**
 * Defines the relationship type between two tasks.
 */
export enum DependencyType {
	FS = 'FS',
	SS = 'SS',
	FF = 'FF',
	SF = 'SF',
}

/**
 * Visual style of the row in the left grid.
 */
export enum RowType {
	Task = 'task',
	Group = 'group',
	Milestone = 'milestone',
	Divider = 'divider',
}

// #endregion

// #region 2. Zod Schemas

/**
 * Schema for a visual dependency link between tasks.
 * Corrected nativeEnum to avoid deprecated signature.
 */
export const DependencyLinkSchema = z.object({
	id: z.uuid(),
	fromTaskId: z.uuid(),
	toTaskId: z.uuid(),
	type: z.nativeEnum(DependencyType).default(DependencyType.FS),
	lagMs: z.number().default(0),
	style: z.record(z.string(), z.string()).optional(), // Fixed: Explicit key and value types
});

/**
 * Schema for a specific marker (vertical line, flag, etc.).
 */
export const MarkerSchema = z.object({
	id: z.uuid(),
	type: z.enum(['verticalLine', 'point', 'range', 'flag']),
	scope: z.enum(['global', 'row', 'task']),
	at: z.number().optional(), // Timestamp
	startAt: z.number().optional(), // For ranges
	endAt: z.number().optional(), // For ranges
	label: z.string(),
	color: z.string().optional(),
});

/**
 * Schema for a task rendered as a bar on the timeline.
 */
export const GanttTaskSchema = z.object({
	id: z.uuid(),
	rowId: z.uuid(),
	name: z.string(),
	startAt: z.number(), // Timestamp (ms)
	endAt: z.number(), // Timestamp (ms)
	progress: z.number().min(0).max(100).default(0),
	status: z.string().default('todo'),
	assignees: z.array(z.string()).default([]), // User IDs

	// Relationships
	dependencies: z.array(z.uuid()).default([]), // IDs of DependencyLinks

	// Configuration
	isMilestone: z.boolean().default(false),
	baseline: z.object({
		startAt: z.number(),
		endAt: z.number(),
	}).optional(),

	// Constraints & Metadata
	constraints: z.object({
		lockStart: z.boolean().optional(),
		lockEnd: z.boolean().optional(),
		allowMove: z.boolean().default(true),
		allowResize: z.boolean().default(true),
	}).optional(),
	meta: z.record(z.string(), z.any()).default({}), // Fixed: Explicit key and value types
});

/**
 * Schema for a row in the "Left Table".
 */
export const GanttRowSchema = z.object({
	id: z.uuid(),
	type: z.enum(RowType).default(RowType.Task),
	parentId: z.uuid().nullable().optional(),
	orderIndex: z.number(),
	collapsed: z.boolean().default(false),

	// Display Fields
	label: z.string(),
	height: z.number().optional(),
	style: z.record(z.string(), z.string()).optional(), // Fixed: Explicit key and value types

	// Data Payload (Projective specific)
	data: z.record(z.string(), z.any()).default({}), // Fixed: Explicit key and value types
});

/**
 * Schema for the Project context.
 */
export const GanttProjectSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	timezone: z.string().default('UTC'),
	workingDays: z.array(z.number()).default([1, 2, 3, 4, 5]), // Mon-Fri
	holidays: z.array(z.number()).default([]), // Array of timestamps
});

// #endregion

// #region 3. TypeScript Interfaces

export type DependencyLink = z.infer<typeof DependencyLinkSchema>;
export type GanttMarker = z.infer<typeof MarkerSchema>;
export type GanttTask = z.infer<typeof GanttTaskSchema>;
export type GanttRow = z.infer<typeof GanttRowSchema>;
export type GanttProject = z.infer<typeof GanttProjectSchema>;

// #endregion

```

### File: packages\charts\src\types\kanban.ts

```ts
import type { DateTime } from '@projective/types';

export interface KanbanTag {
	id: string;
	label: string;
	icon?: any; // e.g., Preact component or string emoji
	color?: string; // CSS color variable or hex
	variant?: 'solid' | 'ghost' | 'text';
}

export interface KanbanCardProps {
	id: string;
	title: string;
	description?: string;
	meta?: string; // e.g., "Created: 4 Hours ago • Due: 30th July"
	tags?: KanbanTag[];
	takenBy?: {
		name: string;
		avatarUrl?: string;
	};
	order: number;
	permissions?: {
		canEdit?: boolean;
		canDelete?: boolean;
		canReorder?: boolean;
	};
}

export interface KanbanFieldProps {
	id: string;
	title: string;
	description?: string;
	color?: 'primary' | 'secondary' | string; // Supports presets or custom hex/rgb
	cards: KanbanCardProps[];
	limit?: number;
	order: number;
	addCardLabel?: string;
	permissions?: {
		canAddCard?: boolean;
		canEdit?: boolean;
		canDelete?: boolean;
		canReorder?: boolean; // Acts as our lock
	};
}

export interface KanbanProps {
	fields: KanbanFieldProps[];
	minHeight?: string;
	permissions?: {
		canAddField?: boolean;
	};
	onCardClick?: (card: KanbanCardProps) => void;
	onFieldClick?: (field: KanbanFieldProps) => void;
	onAddCard?: (fieldId: string) => void;
	onAddField?: () => void;
	onCardMove?: (
		cardId: string,
		sourceFieldId: string,
		targetFieldId: string,
		insertBeforeCardId: string | null,
	) => void;
	onFieldMove?: (sourceFieldId: string, targetFieldId: string, insertBefore: boolean) => void;
}

export interface DragData {
	isDragging: boolean;
	type: 'field' | 'card' | null;
	id: string | null;
	sourceFieldId: string | null;
	clientX: number;
	clientY: number;
	offsetX: number;
	offsetY: number;
	width: number;
	height: number;
	targetFieldId: string | null;
	targetCardId: string | null;
	insertPosition: 'before' | 'after' | null;
	fieldData?: KanbanFieldProps;
	cardData?: KanbanCardProps;
}

export const INITIAL_DRAG_DATA: DragData = {
	isDragging: false,
	type: null,
	id: null,
	sourceFieldId: null,
	clientX: 0,
	clientY: 0,
	offsetX: 0,
	offsetY: 0,
	width: 0,
	height: 0,
	targetFieldId: null,
	targetCardId: null,
	insertPosition: null,
};

```

### File: packages\charts\src\utils\theme-bridge.ts

```ts
/**
 * Global cache to prevent DOM thrashing during 60FPS PIXI renders.
 * Keys are formatted as `${themeMode}:${varName}` to support dynamic theme toggling.
 */
const colorCache = new Map<string, number>();

/**
 * Resolves a CSS variable (e.g., "--primary") to a Hex number (0xffffff).
 * Uses a hidden DOM element to force the browser to evaluate nested var() and calc()
 * statements, safely converting them into absolute RGB values.
 */
export function getThemeColor(varName: string): number {
	if (typeof window === 'undefined') return 0x000000;

	// Determine current theme to invalidate cache correctly if user switches to Dark Mode
	const theme = document.documentElement.getAttribute('data-theme') || 'light';
	const cacheKey = `${theme}:${varName}`;

	if (colorCache.has(cacheKey)) {
		return colorCache.get(cacheKey)!;
	}

	// Create a temporary element to force browser CSS evaluation
	const tempEl = document.createElement('div');
	tempEl.style.color = `var(${varName})`;
	tempEl.style.display = 'none';
	document.body.appendChild(tempEl);

	// The browser automatically resolves hsl() and var() into standard rgb() format for the 'color' property
	const computedColor = getComputedStyle(tempEl).color;

	// Cleanup
	document.body.removeChild(tempEl);

	let result = 0x22d3ee; // Default cyan fallback

	// Parse the clean rgb(r, g, b) string
	if (computedColor.startsWith('rgb')) {
		const match = computedColor.match(/\d+/g);
		if (match && match.length >= 3) {
			const [r, g, b] = match.map(Number);
			result = (r << 16) + (g << 8) + b;
		}
	}

	// Cache the hex value so subsequent render frames are instant
	colorCache.set(cacheKey, result);

	return result;
}

```

