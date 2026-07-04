/**
 * @file NewStageModal.tsx
 * @description The Stage configuration modal (spec §3). In a **pipeline** project it is a blueprint
 * authoring form (a reusable stage template: core data, legal/compliance, timeline dependency,
 * deliverable gate, incentive). In a **one-off** project — where tickets do not exist — the same
 * modal is programmatically upgraded to inherit ALL ticket-level properties (workload intensity,
 * base cost + max revision, master due date, an attachment zone and the live cost preview), since
 * the single stage carries the whole engagement (spec §1).
 *
 * Minimum-viable validation: only Title is required to create (spec §1). The write contract remains
 * byte-compatible with the existing `POST /stages` route (name, description, skills, default_tasks,
 * file_upload_required, start/end date, ip_ownership_override, nda_required); richer controls that
 * have no backend yet drive the preview/UX only.
 */

// #region Imports
import '../../styles/components/new/stage-create.css';
import { useComputed, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { Button, Modal, toast } from '@projective/ui';
import {
	DateField,
	FileDrop,
	RichTextField,
	SelectField,
	type SelectOption,
	TagInput,
	TextField,
} from '@projective/fields';
import { DateTime, type FileWithMeta, IPOptionMode } from '@projective/types';
import { IconChartBar, IconInfoCircle, IconPlus, IconTrophy, IconX } from '@tabler/icons-preact';
import { useProjectContext } from '../../contexts/ProjectContext.tsx';
import { StagesService } from '../../services/StagesService.ts';
import { ToggleSwitch } from '../common/ToggleSwitch.tsx';
import { TicketCostPreview } from '../project/ticket/TicketCostPreview.tsx';
import {
	formatMoney,
	multiplierFor,
	WI_TIERS,
	type WiKey,
} from '../../contracts/new/ticketPricing.ts';
// #endregion

// #region Props
export interface NewStageModalProps {
	isOpen: boolean;
	onClose: () => void;
	projectId: string;
	projectFormat?: 'one_off' | 'pipeline' | string;
	/** Existing project stages, powering the "this stage follows" dependency dropdown (spec §3). */
	existingStages?: { id: string; name: string }[];
}
// #endregion

export default function NewStageModal(
	{ isOpen, onClose, projectId, projectFormat, existingStages = [] }: NewStageModalProps,
) {
	const { refresh } = useProjectContext();
	const isOneOff = projectFormat === 'one_off';
	const currency = 'GBP';

	// #region Core form state
	const name = useSignal('');
	const description = useSignal('');
	const skills = useSignal<string[]>(['UI design', 'Prototyping']);

	// Legal & compliance
	const ipMode = useSignal<string>(IPOptionMode.ExclusiveTransfer);
	const ndaRequired = useSignal(false);
	const ndaFiles = useSignal<FileWithMeta[]>([]);

	// Deliverable
	const filesRequired = useSignal(true);

	// Timeline dependency ('none' = anchor at root, else a predecessor stage id)
	const followsStage = useSignal<string>('none');

	// Incentive
	const bonusEnabled = useSignal(false);
	const bonusAmount = useSignal(''); // major units, £
	const bonusBy = useSignal<DateTime | null>(null);

	// One-off inherited ticket properties
	const intensity = useSignal<WiKey>('Medium');
	const baseCost = useSignal('360'); // major units, £
	const maxRevision = useSignal('140'); // major units, £
	const dueDate = useSignal<DateTime | null>(null);
	const attachments = useSignal<FileWithMeta[]>([]);

	const isSubmitting = useSignal(false);
	// #endregion

	// #region Reset on open
	useEffect(() => {
		if (!isOpen) return;
		name.value = '';
		description.value = '';
		skills.value = ['UI design', 'Prototyping'];
		ipMode.value = IPOptionMode.ExclusiveTransfer;
		ndaRequired.value = false;
		ndaFiles.value = [];
		filesRequired.value = true;
		followsStage.value = 'none';
		bonusEnabled.value = false;
		bonusAmount.value = '';
		bonusBy.value = null;
		intensity.value = 'Medium';
		baseCost.value = '360';
		maxRevision.value = '140';
		dueDate.value = null;
		attachments.value = [];
	}, [isOpen]);
	// #endregion

	// #region Options
	const ipOptions: SelectOption<string>[] = [
		{ label: 'Inherit from project', value: 'none' },
		{ label: 'Client owns all assets on release', value: IPOptionMode.ExclusiveTransfer },
		{ label: 'Client licenses the work', value: IPOptionMode.LicensedUse },
		{ label: 'Shared ownership', value: IPOptionMode.SharedOwnership },
		{ label: 'Projective partner terms', value: IPOptionMode.ProjectivePartner },
	];

	const followsOptions: SelectOption<string>[] = [
		{ label: 'None — anchor as a starting milestone', value: 'none' },
		...existingStages.map((s) => ({ label: `After ${s.name}`, value: s.id })),
	];

	const skillSuggestions = ['Illustration', 'Motion', 'Copywriting', 'SEO', '3D'];
	// #endregion

	// #region One-off cost preview
	const oneOffSummary = useComputed(() => {
		const base = Math.round((parseFloat(baseCost.value) || 0) * 100);
		const overhead = Math.round((parseFloat(maxRevision.value) || 0) * 100);
		const standard = Math.round(base * multiplierFor(intensity.value));
		return {
			stageCount: 1,
			standardCents: standard,
			revisionOverheadCents: overhead,
			maxCents: standard + overhead,
			bonusCents: 0,
		};
	});
	// #endregion

	// #region Submit
	const handleSubmit = async () => {
		if (!projectId) {
			toast.error('Unable to locate Project ID.');
			return;
		}
		if (!name.value.trim()) {
			toast.error('Stage title is required.');
			return;
		}

		isSubmitting.value = true;
		try {
			const payload = {
				name: name.value,
				description: description.value,
				skills: skills.value,
				default_tasks: [] as string[],
				file_upload_required: filesRequired.value,
				// One-off carries master timeline dates; blueprint stages inherit them from the project.
				start_date: null,
				end_date: isOneOff && dueDate.value ? dueDate.value.toISO() : null,
				ip_ownership_override: ipMode.value !== 'none' ? ipMode.value : null,
				nda_required: ndaRequired.value,
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
	// #endregion

	// #region Shared form body (identical for both modes)
	const coreForm = (
		<>
			<div class='sc__field'>
				<label class='sc__label'>
					Stage title <span class='sc__req'>*</span>{' '}
					<span class='sc__hint'>— only field required to create</span>
				</label>
				<TextField
					value={name}
					onChange={(v) => (name.value = v)}
					placeholder='e.g. Motion & interaction'
				/>
			</div>

			<div class='sc__field'>
				<label class='sc__label'>Description</label>
				<RichTextField
					value={description}
					onChange={(v) => (description.value = v as string)}
					outputFormat='delta'
					toolbar='basic'
					variant='framed'
					minHeight='110px'
					placeholder='What this stage delivers, its acceptance criteria…'
				/>
			</div>

			<div class='sc__field'>
				<label class='sc__label'>Preferred freelancer skills</label>
				<TagInput
					value={skills.value}
					onChange={(v) => (skills.value = v)}
					placeholder='Add skill…'
				/>
				<div class='sc__chips'>
					{skillSuggestions.map((s) => (
						<button
							key={s}
							type='button'
							class='sc__chip'
							disabled={skills.value.includes(s)}
							onClick={() => (skills.value = [...skills.value, s])}
						>
							<IconPlus size={12} /> {s}
						</button>
					))}
				</div>
			</div>

			{/* Compliance & legal */}
			<div class='sc__section'>
				<span class='sc__section-title'>Compliance & legal</span>
				<div class='sc__field'>
					<label class='sc__label'>IP ownership on release</label>
					<SelectField<string>
						options={ipOptions}
						value={ipMode.value}
						onChange={(v) => (ipMode.value = v as string)}
						multiple={false}
						searchable={false}
					/>
				</div>
				<div class='sc__panel'>
					<ToggleSwitch
						checked={ndaRequired.value}
						onChange={(v) => (ndaRequired.value = v)}
						label='NDA required'
						description='Freelancers must accept before claiming work'
					/>
					{ndaRequired.value && (
						<div class='sc__nda-upload'>
							<FileDrop
								id='stage-nda'
								label='Bind NDA document'
								value={ndaFiles}
								onChange={(f) => (ndaFiles.value = f)}
								variant='split'
								multiple={false}
								maxFiles={1}
							/>
						</div>
					)}
				</div>
			</div>

			{/* Deliverable */}
			<div class='sc__section'>
				<span class='sc__section-title'>Deliverable</span>
				<label class='sc__flag'>
					<input
						type='checkbox'
						checked={filesRequired.value}
						onChange={(e) => (filesRequired.value = e.currentTarget.checked)}
					/>
					<span>File uploads required to clear this stage</span>
				</label>
			</div>

			{/* Timeline engine */}
			<div class='sc__section'>
				<span class='sc__section-title'>Timeline engine</span>
				<div class='sc__field'>
					<label class='sc__label'>This stage follows</label>
					<SelectField<string>
						options={followsOptions}
						value={followsStage.value}
						onChange={(v) => (followsStage.value = v as string)}
						multiple={false}
						searchable={false}
					/>
				</div>
				{followsStage.value !== 'none' && (
					<div class='sc__notice'>
						<IconInfoCircle size={16} />
						<span>
							Simultaneous starts will be flagged on project-level Kanban boards and individual
							ticket views.
						</span>
					</div>
				)}
			</div>

			{/* Incentive */}
			<div class='sc__section'>
				<span class='sc__section-title'>Incentive</span>
				<div class='sc__panel'>
					<ToggleSwitch
						checked={bonusEnabled.value}
						onChange={(v) => (bonusEnabled.value = v)}
						label='Enable deadline bonus'
						description='Reward early or on-time completion'
					/>
					{bonusEnabled.value && (
						<div class='sc__bonus'>
							<div class='sc__field'>
								<label class='sc__label'>Bonus amount</label>
								<TextField
									type='number'
									value={bonusAmount}
									onChange={(v) => (bonusAmount.value = v)}
									prefix={<span>£</span>}
									placeholder='0'
								/>
							</div>
							<div class='sc__field'>
								<label class='sc__label'>If delivered by</label>
								<DateField
									value={bonusBy.value}
									onChange={(v) => (bonusBy.value = v as DateTime | null)}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
	// #endregion

	// #region One-off ticket-inherited rail
	const oneOffRail = (
		<div class='sc__rail'>
			<TicketCostPreview
				summary={oneOffSummary.value}
				currency={currency}
				intensityLabel={intensity.value}
				oneOff
			/>

			<div class='sc__field'>
				<label class='sc__label'>Workload intensity</label>
				<div class='sc__intensity'>
					{WI_TIERS.map((tier) => (
						<button
							key={tier.key}
							type='button'
							class={`sc__intensity-opt ${
								intensity.value === tier.key ? 'sc__intensity-opt--active' : ''
							}`}
							onClick={() => (intensity.value = tier.key)}
						>
							<IconChartBar size={18} />
							<span>{tier.label}</span>
						</button>
					))}
				</div>
			</div>

			<div class='sc__cost-grid'>
				<div class='sc__field'>
					<label class='sc__label'>Base cost</label>
					<TextField
						type='number'
						value={baseCost}
						onChange={(v) => (baseCost.value = v)}
						prefix={<span>£</span>}
						placeholder='0'
					/>
				</div>
				<div class='sc__field'>
					<label class='sc__label'>Max revision</label>
					<TextField
						type='number'
						value={maxRevision}
						onChange={(v) => (maxRevision.value = v)}
						prefix={<span>£</span>}
						placeholder='0'
					/>
				</div>
			</div>

			<div class='sc__field'>
				<label class='sc__label'>Due date</label>
				<DateField value={dueDate.value} onChange={(v) => (dueDate.value = v as DateTime | null)} />
			</div>

			<div class='sc__field'>
				<label class='sc__label'>Attachments</label>
				<FileDrop
					id='stage-attachments'
					value={attachments}
					onChange={(f) => (attachments.value = f)}
					variant='split'
					multiple
					maxFiles={10}
				/>
			</div>
		</div>
	);
	// #endregion

	const width = isOneOff ? 1000 : 720;
	const footerLabel = isOneOff
		? `${formatMoney(oneOffSummary.value.standardCents, currency)}–${
			formatMoney(oneOffSummary.value.maxCents, currency)
		}`
		: null;

	return (
		<Modal isOpen={isOpen} onClose={onClose} width={width} className='sc-modal'>
			<div class={`sc ${isOneOff ? 'sc--oneoff' : ''}`}>
				{/* #region Header */}
				<header class='sc__header'>
					<div class='sc__heading'>
						<h1 class='sc__title'>{isOneOff ? 'New stage' : 'New blueprint stage'}</h1>
						<p class='sc__subtitle'>
							{isOneOff
								? 'One-off project — no tickets, so this stage inherits all ticket options'
								: 'Adds a reusable stage template to this pipeline'}
						</p>
					</div>
					<button type='button' class='sc__close' aria-label='Close' onClick={onClose}>
						<IconX size={20} />
					</button>
				</header>
				{/* #endregion */}

				<div class={`sc__body ${isOneOff ? 'sc__body--split' : ''}`}>
					<div class='sc__form'>{coreForm}</div>
					{isOneOff && oneOffRail}
				</div>

				{/* #region Footer */}
				<footer class='sc__footer'>
					{footerLabel && <span class='sc__footer-summary'>1 stage · {footerLabel}</span>}
					<div class='sc__footer-actions'>
						<Button variant='secondary' ghost onClick={onClose} disabled={isSubmitting.value}>
							Cancel
						</Button>
						<Button
							variant='primary'
							startIcon={isOneOff ? <IconPlus size={16} /> : <IconTrophy size={16} />}
							onClick={handleSubmit}
							loading={isSubmitting.value}
							disabled={!name.value.trim()}
						>
							{isOneOff ? 'Create stage' : 'Create blueprint'}
						</Button>
					</div>
				</footer>
				{/* #endregion */}
			</div>
		</Modal>
	);
}
