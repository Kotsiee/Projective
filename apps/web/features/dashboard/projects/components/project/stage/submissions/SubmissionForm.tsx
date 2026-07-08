/* #region Imports */
import { JSX } from 'preact';
import { ReadonlySignal, Signal, useSignal } from '@preact/signals';
import type { FileWithMeta } from '@projective/types';
import { Checkbox, ProgressBar, RichTextField, SelectField, TextField } from '@projective/fields';
import { Button, FileTypeIcon } from '@projective/ui';
import { formatFileSize } from '@projective/data';
import { UploadFileIsland } from '@projective/files';
import { IconAlertTriangle, IconCloudUpload, IconListCheck, IconX } from '@tabler/icons-preact';
import {
	type StageTicket,
	type SubmissionValidation,
	type TicketKind,
	ticketKind,
} from '../../../../contracts/Submissions.ts';
/* #endregion */

/* #region Model */
/** Draft signals owned by the island so the nav footer can submit the same state. */
export interface SubmissionFormModel {
	title: Signal<string>;
	ticketId: Signal<string | null>;
	description: Signal<string>;
	files: Signal<FileWithMeta[]>;
	checked: Signal<string[]>;
	/** Flips true on the first submit attempt so errors only show after. */
	submitAttempted: Signal<boolean>;
}

export interface SubmissionFormProps {
	tickets: StageTicket[];
	model: SubmissionFormModel;
	validation: ReadonlySignal<SubmissionValidation>;
	selectedTicket: ReadonlySignal<StageTicket | null>;
}
/* #endregion */

/* #region Helpers */
const KIND_LABEL: Record<TicketKind, string> = {
	file: 'File deliverable',
	checklist: 'Checklist',
	hybrid: 'Checklist + files',
};
/* #endregion */

/* #region Component */
/**
 * @function SubmissionForm
 * @description The freelancer submission compilation form. Title, ticket
 * association, an optional rich-text description, a live checklist, and the
 * packaged UploadFile picker for deliverables. Validation state is computed by
 * the island and surfaced inline here once a submit has been attempted.
 */
export function SubmissionForm(
	{ tickets, model, validation, selectedTicket }: SubmissionFormProps,
): JSX.Element {
	const uploadOpen = useSignal(false);

	const showErrors = model.submitAttempted.value;
	const errors = validation.value.errors;
	const ticket = selectedTicket.value;
	const kind = ticket ? ticketKind(ticket) : null;
	const hasChecklist = !!ticket && ticket.checklist.length > 0;
	const descriptionRequired = validation.value.partialDelivery;

	const toggleChecklistItem = (id: string) => {
		const set = new Set(model.checked.value);
		if (set.has(id)) set.delete(id);
		else set.add(id);
		model.checked.value = [...set];
	};

	const removeFile = (id?: string) => {
		model.files.value = model.files.value.filter((f) => f.id !== id);
	};

	return (
		<div class='submission-form'>
			<div class='submission-form__field'>
				<TextField label='Submission title' value={model.title} floatingRule='auto' />
			</div>

			<div class='submission-form__field'>
				<SelectField<string>
					label='Associated ticket'
					placeholder='Select a ticket…'
					value={model.ticketId.value ?? ''}
					onChange={(v) => (model.ticketId.value = (v as string) || null)}
					options={tickets.map((t) => ({ label: t.title, value: t.id }))}
				/>
				{kind && (
					<span class={`submission-chip submission-chip--${kind}`}>
						{KIND_LABEL[kind]}
					</span>
				)}
			</div>

			{hasChecklist && ticket && (
				<div class='submission-form__field'>
					<div class='submission-form__label'>
						<IconListCheck size={16} /> Checklist
						<span class='submission-form__count'>
							{model.checked.value.length}/{ticket.checklist.length} done
						</span>
					</div>
					<ProgressBar
						value={model.checked.value.length}
						max={ticket.checklist.length}
						tone='auto'
						size='sm'
						showValue
						valueFormat='fraction'
						ariaLabel='Checklist completion'
						className='submission-checklist__progress'
					/>
					<ul class='submission-checklist'>
						{ticket.checklist.map((item) => {
							const on = model.checked.value.includes(item.id);
							return (
								<li key={item.id} class={`submission-checklist__item${on ? ' is-checked' : ''}`}>
									<Checkbox
										checked={on}
										onChange={() =>
											toggleChecklistItem(item.id)}
										label={item.label}
										tone='success'
									/>
								</li>
							);
						})}
					</ul>
					{showErrors && errors.checklist && (
						<p class='submission-form__error'>{errors.checklist}</p>
					)}
				</div>
			)}

			{showErrors && descriptionRequired && (
				<div class='submission-warning'>
					<IconAlertTriangle size={18} />
					<div>
						<strong>Partial delivery.</strong>{' '}
						Not every checklist item is done — a description explaining what was delivered is
						required before you can submit.
					</div>
				</div>
			)}

			<div class='submission-form__field'>
				<div class='submission-form__label'>
					Work description
					{descriptionRequired
						? <span class='submission-form__req'>Required</span>
						: <span class='submission-form__opt'>Optional</span>}
				</div>
				<RichTextField
					value={model.description.value}
					onChange={(v) => (model.description.value = v)}
					outputFormat='html'
					toolbar='basic'
					placeholder='Describe the work delivered…'
					minHeight='140px'
				/>
				{showErrors && errors.description && (
					<p class='submission-form__error'>{errors.description}</p>
				)}
			</div>

			<div class='submission-form__field'>
				<div class='submission-form__label'>
					Deliverable files
					{kind === 'checklist'
						? <span class='submission-form__opt'>Optional</span>
						: <span class='submission-form__req'>Required</span>}
				</div>

				{model.files.value.length > 0 && (
					<ul class='submission-files'>
						{model.files.value.map((f) => (
							<li key={f.id} class='submission-files__pill'>
								<FileTypeIcon name={f.file.name} mimeType={f.file.type} size={16} />
								<span class='submission-files__name'>{f.file.name}</span>
								<span class='submission-files__size'>{formatFileSize(f.file.size)}</span>
								<button
									type='button'
									class='submission-files__remove'
									aria-label={`Remove ${f.file.name}`}
									onClick={() => removeFile(f.id)}
								>
									<IconX size={14} />
								</button>
							</li>
						))}
					</ul>
				)}

				<Button
					variant='secondary'
					startIcon={<IconCloudUpload size={18} />}
					onClick={() => (uploadOpen.value = true)}
				>
					{model.files.value.length > 0 ? 'Add more files' : 'Add deliverable files'}
				</Button>

				{showErrors && errors.files && <p class='submission-form__error'>{errors.files}</p>}
			</div>

			<UploadFileIsland
				isOpen={uploadOpen.value}
				onClose={() => (uploadOpen.value = false)}
				multiple
				onConfirm={(selected) => {
					const next = [...model.files.value];
					for (const file of selected) {
						if (!next.some((f) => f.id === file.id)) next.push(file);
					}
					model.files.value = next;
				}}
			/>
		</div>
	);
}
/* #endregion */
