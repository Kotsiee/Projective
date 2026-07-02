/**
 * @file Board.tsx
 * @description The main interactive Kanban/List island for managing project stages and tickets.
 */

// #region Imports
import '../../styles/pages/board.css';
import { useComputed, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { Button, toast, ToggleButton, ToggleButtonGroup } from '@projective/ui';
import { IconBasket, IconLayoutKanban, IconList } from '@tabler/icons-preact';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import { useProjectContext } from '@features/dashboard/projects/contexts/ProjectContext.tsx';
import { NewTicketModal } from '@features/dashboard/projects/components/modals/NewTicketModal.tsx';
import NewStageModal from '@features/dashboard/projects/components/modals/NewStageModal.tsx';
import {
	BoardDataView,
	BoardTicket,
} from '@features/dashboard/projects/components/project/board/BoardDataView.tsx';
import { BoardHeader } from '@features/dashboard/projects/components/project/board/BoardHeader.tsx';
import { TicketStatus } from '@projective/types';
import { TicketsService } from '@features/dashboard/projects/services/TicketsService.ts';
import { StagesService } from '@features/dashboard/projects/services/StagesService.ts';
// #endregion

export interface ProjectBoardIslandProps {
	isOwnerOrAdmin?: boolean;
}

export default function ProjectBoardIsland({ isOwnerOrAdmin = true }: ProjectBoardIslandProps) {
	const { setMiddleNav } = useNavigationContext();
	const { project, tickets, loadTickets, refresh, moveTicket, isLoading } = useProjectContext();

	// Safely resolve the active Project ID regardless of backend serialization nuances
	// deno-lint-ignore no-explicit-any
	const activeProjectId = project.value?.id || (project.value as any)?.projectId ||
		(project.value as any)?.project_id;

	// #region State Signals
	const viewType = useSignal<'stages' | 'status'>('stages');
	const displayMode = useSignal<'kanban' | 'list'>('kanban');

	const isNewTicketOpen = useSignal(false);
	const selectedStageForNewTicket = useSignal<string | null>(null);

	const isNewStageOpen = useSignal(false);
	// #endregion

	// #region Computed Data
	const availableStages = useComputed(() => {
		if (!project.value) return [];
		return project.value.stages
			.map((s) => ({ label: s.name, value: s.id }))
			.sort((a, b) => {
				const s1 = project.value!.stages.find((s) => s.id === a.value)?.sort_order || 0;
				const s2 = project.value!.stages.find((s) => s.id === b.value)?.sort_order || 0;
				return s1 - s2;
			});
	});

	const mappedTickets = useComputed<BoardTicket[]>(() => {
		if (!tickets.value) return [];
		return tickets.value.map((t) => {
			const stage = project.value?.stages.find((s) => s.id === t.current_stage_id);
			return {
				id: t.id,
				title: t.title,
				stageId: t.current_stage_id || 'new',
				stageName: stage ? stage.name : 'Backlog',
				status: t.status as TicketStatus,
				assigneeId: t.current_assignee_id,
				assigneeName: t.current_assignee_id ? 'Assigned' : null,
				workloadIntensity: t.workload_intensity,
				revisionsRequested: 0,
				attachmentsScanned: t.attachment_count > 0,
				createdAt: t.created_at,
			};
		});
	});

	const unpaidTicketsCount = useComputed(() => {
		// deno-lint-ignore no-explicit-any
		return tickets.value.filter((t: any) => t.payment_status === 'unpaid').length;
	});
	// #endregion

	// #region Navigation Footer Injection
	useEffect(() => {
		const footerContent = (
			<div class='project-board__footer-wrapper'>
				<div class='project-board__footer-right'>
					<ToggleButtonGroup
						value={viewType.value}
						// deno-lint-ignore no-explicit-any
						onChange={(v) => viewType.value = v as any}
						optional={false}
						variant='secondary'
					>
						<ToggleButton value='stages'>Pipeline</ToggleButton>
						<ToggleButton value='status'>Status</ToggleButton>
					</ToggleButtonGroup>

					{isOwnerOrAdmin && (
						<div style={{ display: 'flex', gap: '0.5rem' }}>
							<Button variant='secondary' onClick={() => isNewStageOpen.value = true}>
								+ Add Stage
							</Button>
							<Button
								variant='secondary'
								onClick={() => {
									selectedStageForNewTicket.value = null;
									isNewTicketOpen.value = true;
								}}
							>
								+ Add New Ticket
							</Button>
						</div>
					)}
				</div>

				<div class='project-board__footer-left'>
					<ToggleButtonGroup
						value={displayMode.value}
						// deno-lint-ignore no-explicit-any
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

					<Button
						variant='primary'
						href={`/checkout?project=${activeProjectId}`}
						disabled={!activeProjectId}
					>
						<IconBasket /> Checkout
						{unpaidTicketsCount.value > 0 && (
							<div class='project-board__unpaid-badge'>
								{unpaidTicketsCount.value}
							</div>
						)}
					</Button>
				</div>
			</div>
		);

		setMiddleNav({ footerHeight: '64px', footerContent });
		return () => setMiddleNav({ footerHeight: '0px', footerContent: null });
	}, [
		viewType.value,
		displayMode.value,
		isOwnerOrAdmin,
		unpaidTicketsCount.value,
		activeProjectId,
		setMiddleNav,
	]);
	// #endregion

	// #region Handlers
	// deno-lint-ignore no-explicit-any
	const handleAddTicket = async (payload: any) => {
		if (!activeProjectId) {
			toast.error('Project ID is missing. Cannot create ticket.');
			return;
		}
		try {
			await TicketsService.createTicket(activeProjectId, payload);
			await loadTickets(activeProjectId);
			isNewTicketOpen.value = false;
			toast.success('Ticket created successfully');
		} catch (err: any) {
			console.error('Failed to create ticket', err);
			// Surfacing the Zod validation failure directly to the user
			toast.error(err.message || 'Failed to create ticket. Check your inputs.');
		}
	};

	const handleAddTicketTrigger = (stageId: string | null) => {
		selectedStageForNewTicket.value = stageId;
		isNewTicketOpen.value = true;
	};

	const handleAddStageTrigger = () => {
		isNewStageOpen.value = true;
	};

	const handleCardMove = async (cardId: string, sourceFieldId: string, targetFieldId: string) => {
		let newStatus: TicketStatus;
		let newStageId: string | null = targetFieldId;

		if (viewType.value === 'stages') {
			if (targetFieldId === 'New') {
				newStatus = TicketStatus.Backlog;
				newStageId = null;
			} else if (targetFieldId === 'Done') {
				newStatus = TicketStatus.Completed;
				newStageId = null;
			} else {
				newStatus = TicketStatus.InProgress;
			}
		} else {
			newStatus = targetFieldId as TicketStatus;
			const existingTicket = tickets.value.find((t) => t.id === cardId);
			newStageId = existingTicket?.current_stage_id || null;
		}

		await moveTicket(cardId, newStageId, newStatus);
	};

	const handleFieldMove = async (sourceId: string, targetId: string, insertBefore: boolean) => {
		if (!activeProjectId) return;

		const currentStages = [...availableStages.value];
		const sourceIndex = currentStages.findIndex((s) => s.value === sourceId);
		const targetIndex = currentStages.findIndex((s) => s.value === targetId);

		if (sourceIndex === -1 || targetIndex === -1) return;

		const [movedStage] = currentStages.splice(sourceIndex, 1);
		const adjustedTargetIndex = currentStages.findIndex((s) => s.value === targetId);

		if (insertBefore) {
			currentStages.splice(adjustedTargetIndex, 0, movedStage);
		} else {
			currentStages.splice(adjustedTargetIndex + 1, 0, movedStage);
		}

		const orderedIds = currentStages.map((s) => s.value);
		try {
			await StagesService.reorderStages(activeProjectId, orderedIds);
			await refresh();
		} catch (err: any) {
			console.error('Failed to reorder stages', err);
			toast.error(err.message || 'Failed to reorder stages.');
		}
	};
	// #endregion

	if (isLoading.value && !project.value) {
		return <div class='project-board__loading'>Loading board...</div>;
	}

	return (
		<div class='project-board'>
			<BoardHeader
				projectTitle={project.value?.title || 'Loading...'}
				projectFormat={project.value?.format || 'pipeline'}
				fiduciary={{ totalBudgetCents: 0, tvlEscrowCents: 0, releasedBalanceCents: 0 }}
				capacity={{
					backlogQueueSize: tickets.value.length,
					cumulativeWi: 0,
					accuracyPercentage: 100,
				}}
			/>

			<main class='project-board__content'>
				<BoardDataView
					tickets={mappedTickets.value}
					stages={availableStages.value}
					viewType={viewType.value}
					displayMode={displayMode.value}
					isOwnerOrAdmin={isOwnerOrAdmin}
					onCardClick={(id) => console.log('Ticket clicked:', id)}
					onCardMove={handleCardMove}
					onFieldMove={handleFieldMove}
					onAddStage={handleAddStageTrigger}
					onAddTicket={handleAddTicketTrigger}
				/>
			</main>

			<NewTicketModal
				isOpen={isNewTicketOpen.value}
				onClose={() => isNewTicketOpen.value = false}
				availableStages={availableStages.value}
				preselectedStageId={selectedStageForNewTicket.value}
				onSubmit={handleAddTicket}
			/>

			<NewStageModal
				isOpen={isNewStageOpen.value}
				onClose={() => isNewStageOpen.value = false}
				projectId={activeProjectId || ''}
				projectFormat={project.value?.format as 'pipeline' | 'one_off' | undefined}
			/>
		</div>
	);
}
