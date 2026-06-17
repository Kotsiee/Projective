import '../../styles/pages/board.css';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { Button, ToggleButton, ToggleButtonGroup } from '@projective/ui';
import { IconLayoutKanban, IconList } from '@tabler/icons-preact';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import { NewTicketModal } from '@features/dashboard/projects/components/new/NewTicketModal.tsx';
import {
	BoardDataView,
	BoardTicket,
} from '@features/dashboard/projects/components/project/board/BoardDataView.tsx';
import { BoardHeader } from '@features/dashboard/projects/components/project/board/BoardHeader.tsx';

// Assuming global context or props supply the data
export interface ProjectBoardIslandProps {
	initialData?: any;
	isOwnerOrAdmin?: boolean; // Hydrated via server
}

export default function ProjectBoardIsland(
	{ initialData, isOwnerOrAdmin = true }: ProjectBoardIslandProps,
) {
	const { setMiddleNav } = useNavigationContext();

	// #region State Signals
	const viewType = useSignal<'stages' | 'status'>('stages');
	const displayMode = useSignal<'kanban' | 'list'>('kanban');
	const isNewTicketOpen = useSignal(false);
	const isNewStageOpen = useSignal(false); // Used when triggering field add in pipeline
	// #endregion

	// #region Fallback Data
	const data = initialData || {
		title: 'Alpha Platform Build',
		format: 'pipeline',
		fiduciary: { totalBudgetCents: 1500000, tvlEscrowCents: 500000, releasedBalanceCents: 1000000 },
		capacity: { backlogQueueSize: 12, cumulativeWi: 28.5, accuracyPercentage: 94.2 },
		tickets: [
			{
				id: '1',
				title: 'Setup DB',
				stageId: 's1',
				stageName: 'Backend',
				status: 'Completed',
				assigneeName: 'Alice',
				workloadIntensity: 2.5,
				revisionsRequested: 0,
				attachmentsScanned: true,
				createdAt: new Date().toISOString(),
			},
			{
				id: '2',
				title: 'Design API',
				stageId: 's1',
				stageName: 'Backend',
				status: 'In Progress',
				assigneeName: 'Alice',
				workloadIntensity: 3.0,
				revisionsRequested: 1,
				attachmentsScanned: false,
				createdAt: new Date().toISOString(),
			},
		] as BoardTicket[],
		availableStages: [{ label: 'Backend', value: 's1' }, { label: 'Frontend', value: 's2' }],
	};
	// #endregion

	// #region Navigation Footer Injection
	useEffect(() => {
		// Define the footer contents reacting to signal changes
		const footerContent = (
			<div class='project-board__footer-wrapper'>
				<div>
					<ToggleButtonGroup
						value={viewType.value}
						onChange={(v) => viewType.value = v as any}
						optional={false}
					>
						<ToggleButton value='stages'>Pipeline View</ToggleButton>
						<ToggleButton value='status'>Status View</ToggleButton>
					</ToggleButtonGroup>

					{isOwnerOrAdmin && (
						<Button
							variant='secondary'
							onClick={() => isNewTicketOpen.value = true}
						>
							Add New Ticket
						</Button>
					)}
				</div>

				<div>
					<ToggleButtonGroup
						value={displayMode.value}
						onChange={(v) => displayMode.value = v as any}
						optional={false}
					>
						<ToggleButton value='kanban' aria-label='Kanban'>
							<IconLayoutKanban size={18} />
						</ToggleButton>
						<ToggleButton value='list' aria-label='List'>
							<IconList size={18} />
						</ToggleButton>
					</ToggleButtonGroup>

					<Button variant='primary'>Batch Checkout</Button>
				</div>
			</div>
		);

		setMiddleNav({
			footerHeight: '64px',
			footerContent,
		});

		// Cleanup on unmount
		return () => {
			setMiddleNav({ footerHeight: '0px', footerContent: null });
		};
	}, [viewType.value, displayMode.value, isOwnerOrAdmin, setMiddleNav]);
	// #endregion

	// #region Handlers
	const handleAddTicket = (payload: any) => {
		console.log('[New Ticket Payload]', payload);
		// Dispatch API controller logic here
	};

	const handleAddStageTrigger = () => {
		// Called by Kanban when a user clicks the "Add Column" ghost button
		console.log('Open Add Stage Modal');
		isNewStageOpen.value = true;
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
				<BoardDataView
					tickets={data.tickets}
					viewType={viewType.value}
					displayMode={displayMode.value}
					isOwnerOrAdmin={isOwnerOrAdmin}
					onCardClick={(id) => console.log('Ticket clicked:', id)}
					onFieldMove={(src, tgt, before) => console.log('Reorder', src, tgt, before)}
					onAddStage={handleAddStageTrigger}
				/>
			</main>

			<NewTicketModal
				isOpen={isNewTicketOpen.value}
				onClose={() => isNewTicketOpen.value = false}
				availableStages={data.availableStages}
				onSubmit={handleAddTicket}
			/>

			{/* Placeholder for NewStageModal */}
			{isNewStageOpen.value && <div style={{ display: 'none' }}>Stage Modal Mount Point</div>}
		</div>
	);
}
