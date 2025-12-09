import '@styles/components/dashboard/projects/new-project-stages.css';
import { Signal, useSignal } from '@preact/signals';
import { IconCheck, IconCircle, IconTrash } from '@tabler/icons-preact';

// Components
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	DateField,
	MoneyField,
	SelectField,
	TextField,
} from '@projective/fields';
import { DateTime, FileWithMeta, SelectOption } from '@projective/types';

import ProjectStageFile from './stages/ProjectStageFile.tsx';
import ProjectStageMaintenance from './stages/ProjectStageMaintenance.tsx';
import ProjectStageManagement from './stages/ProjectStageManagement.tsx';
import ProjectStageSession from './stages/ProjectStageSession.tsx';
import { Stage } from '@contracts/dashboard/projects/Stage.ts';
import { BudgetType, StageType, StartTriggerType } from '@enums/project.ts';

// Extended type for UI state management (things not directly in DB table)
export interface UIStage extends Stage {
	_ui_model_type: 'defined_roles' | 'open_seats'; // Transient toggle
	_attachments_temp: Signal<FileWithMeta[]>; // Files not yet uploaded
}

export default function ProjectStages() {
	const stages = useSignal<UIStage[]>([
		createDefaultStage(),
	]);

	function createDefaultStage(): UIStage {
		return {
			title: 'Initial Stage',
			description: { ops: [{ insert: '\n' }] },
			stage_type: StageType.FileBased,
			status: 'open',
			order: 0,

			// Timeline defaults
			start_trigger_type: StartTriggerType.OnProjectStart,

			// Staffing defaults
			staffing_roles: [],
			open_seats: [],

			// UI Helper defaults
			_ui_model_type: 'defined_roles',
			_attachments_temp: new Signal([]),

			// Type specific defaults (optional in DB, initialized here for UI)
			file_revisions_allowed: 1,
			session_duration_minutes: 60,
		};
	}

	const getStatusIcon = (status: string) => {
		if (status.toLowerCase() === 'completed') return <IconCheck size={18} color='var(--success)' />;
		if (status.toLowerCase() === 'in_progress') {
			return <IconCircle size={18} color='var(--primary-500)' fill='currentColor' />;
		}
		return <IconCircle size={18} color='var(--gray-400)' />;
	};

	const addStage = () => {
		stages.value = [...stages.value, {
			...createDefaultStage(),
			title: '',
			start_trigger_type: StartTriggerType.DependentOnStage,
			order: stages.value.length,
		}];
	};

	const removeStage = (index: number) => {
		stages.value = stages.value.filter((_, i) => i !== index);
	};

	return (
		<div className='new-project__stages'>
			<div className='stages-section'>
				<h2>Stages</h2>
				<Accordion type='multiple' variant='outlined' defaultValue={['0']}>
					{stages.value.map((stage, index) => (
						<AccordionItem key={index.toString()} value={index.toString()}>
							<AccordionTrigger
								startIcon={getStatusIcon(stage.status)}
								subtitle={stage.stage_type.replace('_', ' ')}
							>
								{stage.title.length > 0 ? stage.title : `Stage ${index + 1}`}
							</AccordionTrigger>
							<AccordionContent>
								<ProjectStage id={index} stages={stages} />
								<div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
									<button
										type='button'
										className='btn-remove-stage'
										onClick={() =>
											removeStage(index)}
										style={{
											color: 'var(--error)',
											background: 'none',
											border: 'none',
											cursor: 'pointer',
											display: 'flex',
											alignItems: 'center',
											gap: '0.5rem',
										}}
									>
										<IconTrash size={16} /> Remove Stage
									</button>
								</div>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
				<button
					type='button'
					onClick={() => addStage()}
					style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
				>
					+ Add Stage
				</button>
			</div>
		</div>
	);
}

export function ProjectStage({ id, stages }: { id: number; stages: Signal<UIStage[]> }) {
	const stageTypes: SelectOption<string>[] = [
		{ label: 'File Based (Deliverable)', value: StageType.FileBased },
		{ label: 'Session Based (Call/Workshop)', value: StageType.SessionBased },
		{ label: 'Management Based (Contractual)', value: StageType.ManagementBased },
		{ label: 'Maintenance Based (Recurring)', value: StageType.MaintenanceBased },
	];

	const staffingModels: SelectOption<string>[] = [
		{ label: 'Defined Roles', value: 'defined_roles' },
		{ label: 'Open Seats', value: 'open_seats' },
	];

	const startTriggers: SelectOption<string>[] = [
		{ label: 'Fixed Date', value: StartTriggerType.FixedDate },
		{ label: 'On Project Start', value: StartTriggerType.OnProjectStart },
		{ label: 'On Hire Confirmed', value: StartTriggerType.OnHireConfirmed },
		{ label: 'Dependent on Stage', value: StartTriggerType.DependentOnStage },
	];

	const updateStage = (field: keyof UIStage, value: any) => {
		stages.value = stages.value.map((s, i) => {
			if (i === id) {
				return { ...s, [field]: value };
			}
			return s;
		});
	};

	const stage = stages.value[id];

	return (
		<div className='new-project__stage'>
			<div className='stage-section'>
				<h4>Basics</h4>
				<TextField
					label='Stage Name'
					value={stage.title}
					onChange={(v) => updateStage('title', v)}
					showCount
					maxLength={100}
					floating
					required
				/>

				<TextField
					label='Description'
					value={typeof stage.description === 'string' ? stage.description : 'Description...'}
					onChange={(v) => updateStage('description', { ops: [{ insert: v + '\n' }] })}
					multiline
					rows={3}
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
			</div>

			<hr />

			<div className='stage-section'>
				<h4>Staffing Model</h4>
				<SelectField
					name={`model-type-${id}`}
					label='Model Type'
					options={staffingModels}
					value={stage._ui_model_type}
					onChange={(v) => updateStage('_ui_model_type', v as string)}
					searchable={false}
					multiple={false}
					floating
				/>

				{stage._ui_model_type === 'defined_roles'
					? (
						<div className='roles-config'>
							{stage.staffing_roles.map((role, rIndex) => (
								<div
									key={rIndex}
									style={{
										marginBottom: '1rem',
										padding: '1rem',
										border: '1px solid var(--gray-200)',
										borderRadius: 'var(--radius-sm)',
									}}
								>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											marginBottom: '0.5rem',
										}}
									>
										<h5 style={{ margin: 0 }}>Role {rIndex + 1}</h5>
										<button
											type='button'
											onClick={() => {
												const newRoles = [...stage.staffing_roles];
												newRoles.splice(rIndex, 1);
												updateStage('staffing_roles', newRoles);
											}}
											style={{
												background: 'none',
												border: 'none',
												color: 'var(--error)',
												cursor: 'pointer',
											}}
										>
											<IconTrash size={16} />
										</button>
									</div>
									<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
										<TextField
											label='Role Title'
											value={role.role_title}
											onChange={(v) => {
												const newRoles = [...stage.staffing_roles];
												newRoles[rIndex] = { ...newRoles[rIndex], role_title: v };
												updateStage('staffing_roles', newRoles);
											}}
											floating
											required
										/>
										<TextField
											label='Quantity'
											type='number'
											value={role.quantity.toString()}
											onChange={(v) => {
												const newRoles = [...stage.staffing_roles];
												newRoles[rIndex] = { ...newRoles[rIndex], quantity: parseInt(v) };
												updateStage('staffing_roles', newRoles);
											}}
											floating
											required
										/>
									</div>
									<div
										style={{
											display: 'grid',
											gridTemplateColumns: '1fr 1fr',
											gap: '1rem',
											marginTop: '1rem',
										}}
									>
										<SelectField
											name={`budget-type-${id}-${rIndex}`}
											label='Budget Type'
											options={[
												{ label: 'Fixed Price', value: BudgetType.FixedPrice },
												{ label: 'Hourly Cap', value: BudgetType.HourlyCap },
											]}
											value={role.budget_type}
											onChange={(v) => {
												const newRoles = [...stage.staffing_roles];
												newRoles[rIndex] = { ...newRoles[rIndex], budget_type: v as BudgetType };
												updateStage('staffing_roles', newRoles);
											}}
											searchable={false}
											multiple={false}
											floating
										/>
										<MoneyField
											label='Budget Amount'
											value={role.budget_amount_cents}
											onChange={(v) => {
												const newRoles = [...stage.staffing_roles];
												newRoles[rIndex] = { ...newRoles[rIndex], budget_amount_cents: v };
												updateStage('staffing_roles', newRoles);
											}}
											floating
										/>
									</div>
								</div>
							))}
							<button
								type='button'
								onClick={() => {
									const newRoles = [...stage.staffing_roles, {
										role_title: '',
										quantity: 1,
										budget_type: BudgetType.FixedPrice,
										budget_amount_cents: 0,
										allow_proposals: true,
									}];
									updateStage('staffing_roles', newRoles);
								}}
								style={{
									width: '100%',
									padding: '0.5rem',
									border: '1px dashed var(--gray-300)',
									background: 'none',
									cursor: 'pointer',
									color: 'var(--primary-500)',
								}}
							>
								+ Add Role
							</button>
						</div>
					)
					: (
						<div className='open-seats-config'>
							<TextField
								label='Description of Need'
								value={stage.open_seats[0]?.description_of_need || ''}
								onChange={(v) => {
									const seat = stage.open_seats[0] || { require_proposals: true };
									updateStage('open_seats', [{ ...seat, description_of_need: v }]);
								}}
								multiline
								rows={2}
								floating
							/>
							<div style={{ display: 'flex', gap: '1rem' }}>
								<MoneyField
									label='Min Budget'
									value={stage.open_seats[0]?.budget_min_cents || 0}
									onChange={(v) => {
										const seat = stage.open_seats[0] ||
											{ require_proposals: true, description_of_need: '' };
										updateStage('open_seats', [{ ...seat, budget_min_cents: v }]);
									}}
									floating
								/>
								<MoneyField
									label='Max Budget'
									value={stage.open_seats[0]?.budget_max_cents || 0}
									onChange={(v) => {
										const seat = stage.open_seats[0] ||
											{ require_proposals: true, description_of_need: '' };
										updateStage('open_seats', [{ ...seat, budget_max_cents: v }]);
									}}
									floating
								/>
							</div>
						</div>
					)}
			</div>

			<hr />

			<div className='stage-section'>
				<h4>Timeline Configuration</h4>
				<SelectField
					name={`start-trigger-${id}`}
					label='Start Trigger'
					options={startTriggers}
					value={stage.start_trigger_type}
					onChange={(v) => updateStage('start_trigger_type', v as string)}
					searchable={false}
					multiple={false}
					floating
				/>

				{stage.start_trigger_type === StartTriggerType.FixedDate && (
					<DateField
						label='Start Date'
						value={stage.fixed_start_date
							? new DateTime(stage.fixed_start_date.toString())
							: undefined}
						onChange={(v) => {
							if (v instanceof DateTime) {
								updateStage('fixed_start_date', v);
							} else {
								updateStage('fixed_start_date', undefined);
							}
						}}
						format='dd/MM/yyyy'
						floating
					/>
				)}

				<div className='type-specific-config' style={{ marginTop: '1rem' }}>
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

			<hr />

			<div className='stage-section'>
				<h4>Overrides</h4>
				<SelectField
					name={`ip-override-${id}`}
					label='IP Ownership Override'
					options={[
						{ label: 'Default', value: 'default' },
						{ label: 'Exclusive Transfer', value: 'exclusive_transfer' },
						{ label: 'Licensed Use', value: 'licensed_use' },
					]}
					value={stage.ip_ownership_override || 'default'}
					onChange={(v) => updateStage('ip_ownership_override', v as string)}
					searchable={false}
					multiple={false}
					floating
				/>
			</div>
		</div>
	);
}
