/**
 * @file StageTasks.island.tsx
 * @description Stage-level Tasks board. Reuses the shared {@link BoardDataView} in `level='stage'`
 * mode (spec §1): all drag movement is disabled except — for the project Client — cards in the New
 * column. Tickets are the project-wide set (from ProjectContext) filtered to the current stage.
 */

// #region Imports
import { useComputed } from '@preact/signals';
import { toast } from '@projective/ui';
import { IS_BROWSER } from 'fresh/runtime';
import { useProjectContext } from '@features/dashboard/projects/contexts/ProjectContext.tsx';
import { useStageContext } from '@features/dashboard/projects/contexts/StageContext.tsx';
import {
	BoardDataView,
	BoardTicket,
} from '@features/dashboard/projects/components/project/board/BoardDataView.tsx';
import { TicketStatus } from '@projective/types';
// #endregion

export interface StageTasksIslandProps {
	/**
	 * Whether the viewer is the project Client — the only role allowed to move stage-level tasks, and
	 * only within the New column (spec §1). Resolved server-side in a full deployment; defaults to the
	 * same permissive MVP stance as the project board's `isOwnerOrAdmin`.
	 */
	isClient?: boolean;
}

// #region Component
export default function ProjectTasksIsland({ isClient = true }: StageTasksIslandProps) {
	const { project, tickets, moveTicket } = useProjectContext();
	const { stage_id } = useStageContext();

	const activeProjectId = project.value?.id;

	/** Project tickets scoped to this stage, mapped to the board's ticket shape. */
	const stageTickets = useComputed<BoardTicket[]>(() => {
		const sid = stage_id.value;
		const stage = project.value?.stages.find((s) => s.id === sid);
		return (tickets.value ?? [])
			.filter((t) => t.current_stage_id === sid)
			.map((t) => ({
				id: t.id,
				title: t.title,
				description: t.text_description || undefined,
				stageId: t.current_stage_id || 'new',
				stageName: stage ? stage.name : 'Stage',
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
			}));
	});

	/** Stage-level movement is status-based; the gate itself is enforced in BoardDataView. */
	const handleCardMove = async (cardId: string, _sourceFieldId: string, targetFieldId: string) => {
		try {
			await moveTicket(cardId, undefined, targetFieldId as TicketStatus);
			// deno-lint-ignore no-explicit-any
		} catch (err: any) {
			toast.error(err.message || 'Could not move the task.');
		}
	};

	/** Opens the ticket in the project board's shallow-routed modal. */
	const openTicket = (ticketId: string) => {
		if (IS_BROWSER && activeProjectId) {
			globalThis.location.href = `/projects/${activeProjectId}/board/${ticketId}/details`;
		}
	};

	return (
		<div class='project-tasks-island' style={{ height: 'calc(100vh - var(--header-height))' }}>
			<BoardDataView
				tickets={stageTickets.value}
				stages={[]}
				viewType='status'
				displayMode='kanban'
				isOwnerOrAdmin={isClient}
				level='stage'
				isClient={isClient}
				onCardClick={openTicket}
				onCardMove={handleCardMove}
				onFieldMove={() => {}}
				onAddStage={() => {}}
			/>
		</div>
	);
}
// #endregion
