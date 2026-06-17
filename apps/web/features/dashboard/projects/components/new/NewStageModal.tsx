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
