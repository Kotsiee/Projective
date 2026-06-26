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
		id: 'proj_123',
		title: 'Project Title',
		format: 'pipeline',
		fiduciary: {},
		capacity: {},
		stages: [],
		tickets: [],
	};

	const availableStages = useSignal(data.stages);
	const tickets = useSignal<BoardTicket[]>(data.tickets);

	// Calculate unpaid tickets for the checkout button
	const unpaidTicketsCount =
		tickets.value.filter((t) => (t as any).payment_status === 'unpaid').length;

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

					<Button variant='primary' href={`/checkout?project=${data.id}`}>
						<IconBasket /> Checkout
						{unpaidTicketsCount > 0 && (
							<div
								style={{
									position: 'absolute',
									top: '-6px',
									right: '-6px',
									backgroundColor: 'var(--danger)',
									color: 'white',
									borderRadius: '50%',
									width: '20px',
									height: '20px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: '0.7rem',
									fontWeight: 'bold',
								}}
							>
								{unpaidTicketsCount}
							</div>
						)}
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
				const stage = availableStages.value.find((s: any) => s.value === targetFieldId);
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
				// projectId={data.id}
				projectTitle={data.title}
				projectFormat={data.format}
				fiduciary={data.fiduciary}
				capacity={data.capacity}
				// unpaidTicketsCount={unpaidTicketsCount}
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
