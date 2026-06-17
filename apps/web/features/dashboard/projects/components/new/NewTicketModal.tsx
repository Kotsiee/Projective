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
