import '../../styles/components/new/new-ticket-modal.css';
import { useSignal } from '@preact/signals';
import { Button, Modal, ModalLayout, ToggleButton, ToggleButtonGroup } from '@projective/ui';
import { DateField, TextField } from '@projective/fields';
import { DateTime } from '@projective/types';
import { IconGripVertical } from '@tabler/icons-preact';
import { useEffect } from 'preact/hooks';

interface NewTicketModalProps {
	isOpen: boolean;
	onClose: () => void;
	availableStages: { label: string; value: string }[];
	onSubmit: (payload: any) => void;
}

interface DraggableStage {
	id: string;
	label: string;
	selected: boolean;
}

export function NewTicketModal(
	{ isOpen, onClose, availableStages, onSubmit }: NewTicketModalProps,
) {
	// Form State Signals
	const title = useSignal('');
	const description = useSignal('');
	const intensityTier = useSignal<'Low' | 'Standard' | 'High'>('Standard');
	const dueDate = useSignal<DateTime | null>(null);

	// Drag & Drop Stages State
	const stagesList = useSignal<DraggableStage[]>([]);
	const draggedIndex = useSignal<number | null>(null);

	// Initialize list when modal opens
	useEffect(() => {
		if (isOpen) {
			stagesList.value = availableStages.map((stage) => ({
				id: stage.value,
				label: stage.label,
				selected: true, // Enabled by default
			}));
		}
	}, [isOpen, availableStages]);

	const handleSubmit = () => {
		// Map only the selected stages, maintaining their new sorted order
		const required_stages = stagesList.value
			.filter((s) => s.selected)
			.map((s, index) => ({
				stage_id: s.id,
				order: index,
			}));

		onSubmit({
			title: title.value,
			description: description.value,
			required_stages,
			intensityTier: intensityTier.value,
			dueDate: dueDate.value,
		});
		onClose();
	};

	// #region Local Drag & Drop Handlers
	const handleDragStart = (e: DragEvent, index: number) => {
		draggedIndex.value = index;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			// Required for Firefox
			e.dataTransfer.setData('text/plain', index.toString());
		}
	};

	const handleDragOver = (e: DragEvent, index: number) => {
		e.preventDefault(); // Necessary to allow dropping
		if (draggedIndex.value === null || draggedIndex.value === index) return;

		const list = [...stagesList.value];
		const draggedItem = list[draggedIndex.value];

		// Swap the items
		list.splice(draggedIndex.value, 1);
		list.splice(index, 0, draggedItem);

		draggedIndex.value = index;
		stagesList.value = list;
	};

	const handleDrop = () => {
		draggedIndex.value = null;
	};

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
						<DateField
							label='Due Date'
							value={dueDate.value}
							onChange={(v) => dueDate.value = v}
						/>
					</div>
				</div>
			</ModalLayout>
		</Modal>
	);
}
