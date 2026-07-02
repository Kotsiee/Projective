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
