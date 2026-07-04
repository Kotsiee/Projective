/**
 * @file Board.tsx
 * @description The main interactive Kanban/List island for managing project stages and tickets.
 */

// #region Imports
import '../../styles/pages/board.css';
import { useComputed, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { IS_BROWSER } from 'fresh/runtime';
import { Button, toast, ToggleButton, ToggleButtonGroup } from '@projective/ui';
import { IconBasket, IconLayoutKanban, IconList } from '@tabler/icons-preact';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import { useProjectContext } from '@features/dashboard/projects/contexts/ProjectContext.tsx';
import { NewTicketModal } from '@features/dashboard/projects/components/modals/NewTicketModal.tsx';
import NewStageModal from '@features/dashboard/projects/components/modals/NewStageModal.tsx';
import {
	TicketModal,
	type TicketModalTab,
} from '@features/dashboard/projects/components/modals/TicketModal.tsx';
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
	/** Set when the board is entered directly at /board/[ticketid]/[tab] — opens the modal on load. */
	initialTicketId?: string | null;
	initialTab?: TicketModalTab;
}

export default function ProjectBoardIsland(
	{ isOwnerOrAdmin = true, initialTicketId = null, initialTab = 'details' }:
		ProjectBoardIslandProps,
) {
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

	// Ticket modal (shallow-routed). Initialized from props for direct navigation entry.
	const openTicketId = useSignal<string | null>(initialTicketId);
	const ticketTab = useSignal<TicketModalTab>(initialTab);
	// #endregion

	// #region Ticket Modal (shallow routing)
	/** The full ticket record currently shown in the modal, resolved from loaded board state. */
	const activeTicket = useComputed(() =>
		tickets.value.find((t) => t.id === openTicketId.value) ?? null
	);

	/** Builds the canonical modal URL for a ticket + tab. */
	const ticketUrl = (ticketId: string, tab: TicketModalTab) =>
		`/projects/${activeProjectId}/board/${ticketId}/${tab}`;

	/** Opens the modal and shallow-routes to the ticket URL without a full Fresh navigation. */
	const openTicket = (ticketId: string) => {
		openTicketId.value = ticketId;
		ticketTab.value = 'details';
		if (IS_BROWSER && activeProjectId) {
			history.pushState({ ticketId, tab: 'details' }, '', ticketUrl(ticketId, 'details'));
		}
	};

	/** Switches the active tab and reflects it in the URL. */
	const changeTicketTab = (tab: TicketModalTab) => {
		ticketTab.value = tab;
		if (IS_BROWSER && openTicketId.value && activeProjectId) {
			history.pushState(
				{ ticketId: openTicketId.value, tab },
				'',
				ticketUrl(openTicketId.value, tab),
			);
		}
	};

	/** Closes the modal and shallow-routes back to the base board. */
	const closeTicket = () => {
		openTicketId.value = null;
		if (IS_BROWSER && activeProjectId) {
			history.pushState({}, '', `/projects/${activeProjectId}/board`);
		}
	};

	// Sync modal state with browser back/forward (popstate) by re-deriving from the URL.
	useEffect(() => {
		if (!IS_BROWSER) return;
		const onPop = () => {
			const segments = globalThis.location.pathname.split('/').filter(Boolean);
			const boardIdx = segments.indexOf('board');
			const ticketId = boardIdx >= 0 ? segments[boardIdx + 1] ?? null : null;
			const tab = (boardIdx >= 0 ? segments[boardIdx + 2] : null) as TicketModalTab | null;
			openTicketId.value = ticketId;
			ticketTab.value = tab && ['details', 'attachments', 'timeline'].includes(tab)
				? tab
				: 'details';
		};
		globalThis.addEventListener('popstate', onPop);
		return () => globalThis.removeEventListener('popstate', onPop);
	}, []);
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
				description: t.text_description || undefined,
				stageId: t.current_stage_id || 'new',
				stageName: stage ? stage.name : 'Backlog',
				status: t.status as TicketStatus,
				assigneeId: t.current_assignee_id,
				assigneeName: t.current_assignee_id ? 'Assigned' : null,
				workloadIntensity: t.workload_intensity,
				revisionsRequested: 0,
				attachmentsScanned: t.attachment_count > 0,
				attachmentCount: t.attachment_count,
				createdAt: t.created_at,
				updatedAt: t.updated_at ?? t.created_at,
				sortOrder: t.sort_order,
				hiddenUntil: t.hidden_until,
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

	/**
	 * Relocates a ticket when its card is dropped on a column. Stage and lifecycle status are
	 * independent properties, so each view patches only what it owns:
	 *   • Pipeline (stages) view — dropping onto a stage assigns ONLY the `current_stage_id` and
	 *     leaves the status alone; a ticket stays "New"/backlog until the payment→claim lifecycle
	 *     advances it, and must never be forced into `in_progress` by a board move (doing so tripped
	 *     the description-required DB trigger and produced the "Persistence step failed" crash). The
	 *     "New" and "Done" columns are the backlog pool and the terminal completion action.
	 *   • Status view — columns ARE statuses, so a drop sets the status and leaves the stage intact.
	 *
	 * @param cardId - Ticket id being moved.
	 * @param _sourceFieldId - Origin column id (unused; drop target drives the mutation).
	 * @param targetFieldId - Destination column id (a stage id, a status, or 'New'/'Done').
	 */
	const handleCardMove = async (cardId: string, _sourceFieldId: string, targetFieldId: string) => {
		try {
			if (viewType.value === 'stages') {
				// Block re-entering a previously completed (earlier) stage (spec §1): a real stage
				// target whose pipeline position is behind the ticket's current stage is rejected.
				const isRealStage = targetFieldId !== 'New' && targetFieldId !== 'Done';
				if (isRealStage) {
					const ticket = tickets.value.find((t) => t.id === cardId);
					const order = availableStages.value.map((s) => s.value);
					const currentIdx = ticket?.current_stage_id ? order.indexOf(ticket.current_stage_id) : -1;
					const targetIdx = order.indexOf(targetFieldId);
					if (currentIdx >= 0 && targetIdx >= 0 && targetIdx < currentIdx) {
						toast.error('This ticket has already passed that stage — it cannot move backward.');
						return;
					}
				}

				if (targetFieldId === 'New') {
					// Unstage back into the backlog pool.
					await moveTicket(cardId, null, TicketStatus.Backlog);
				} else if (targetFieldId === 'Done') {
					// Terminal completion — releases held escrow to the payee, if any.
					await moveTicket(cardId, undefined, TicketStatus.Completed);
				} else {
					// Assign the stage only; status is orthogonal and left untouched.
					await moveTicket(cardId, targetFieldId);
				}
			} else {
				await moveTicket(cardId, undefined, targetFieldId as TicketStatus);
			}
		} catch (err: any) {
			toast.error(err.message || 'Could not move the ticket.');
		}
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
					onCardClick={(id) => openTicket(id)}
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

			<TicketModal
				isOpen={openTicketId.value !== null}
				ticket={activeTicket.value}
				project={project.value}
				isOwner={isOwnerOrAdmin}
				activeTab={ticketTab.value}
				onTabChange={changeTicketTab}
				onClose={closeTicket}
				onSaved={() => {
					if (activeProjectId) return loadTickets(activeProjectId);
				}}
				onDeleted={() => {
					closeTicket();
					if (activeProjectId) return loadTickets(activeProjectId);
				}}
			/>
		</div>
	);
}
