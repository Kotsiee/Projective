/**
 * @file StageBreakdownList.tsx
 * @description Interactive Stage Breakdown for a ticket (spec §3/§4). Resolves the ticket's
 * `required_stages` against the parent project, renders each as a {@link StageNodeRow}, and layers
 * conditional pointer-drag reordering with structural ghost placeholders plus a per-stage dot-menu
 * removal.
 *
 * Drag mechanism: the platform's shared native-pointer reorder logic (the same approach used by
 * NewTicketModal) is applied directly to the stage cards. This is deliberately isolated from the
 * board's `@projective/charts` Kanban DnD, whose drag state is a module-global signal — driving the
 * modal list through it would cross-talk with the live board behind the overlay. The spec permits
 * "packages/charts or shared logic"; this is the shared logic, extended with drop-index ghosts.
 *
 * Gesture bounds (client authority): only stages that are completely unstarted (`open`) AND on an
 * unclaimed ticket may be reordered or removed; active/claimed records render as static nodes.
 */

// #region Imports
import '../../../styles/components/new/stage-node.css';
import { useSignal } from '@preact/signals';
import type { FullProjectResponse, TicketResponse } from '@projective/types';
import { StageNodeRow } from './StageNodeRow.tsx';
// #endregion

// #region Types
export interface StageBreakdownListProps {
	/** The ticket whose `required_stages` are displayed. */
	ticket: TicketResponse;
	/** Parent project, used to resolve stage names / status / installment costs. */
	project: FullProjectResponse | null;
	/** Whether the viewer has client authority to reorder/remove stages. */
	editable: boolean;
	/** Persist a new stage ordering (array of stage ids in the desired order). */
	onReorder: (orderedStageIds: string[]) => void;
	/** Purge a single stage id from the ticket requirements array. */
	onRemoveStage: (stageId: string) => void;
}

interface ResolvedRow {
	stageId: string;
	order: number;
	name: string;
	status: string;
	statusLabel: string;
	claimantLabel: string;
	costLabel: string;
	updatedLabel: string;
	locked: boolean;
}
// #endregion

// #region Helpers
const STAGE_STATUS_LABELS: Record<string, string> = {
	open: 'Not Started',
	assigned: 'Awaiting Funding',
	in_progress: 'In Progress',
	submitted: 'In Review',
	approved: 'Approved',
	revisions: 'Revisions',
	paid: 'Completed',
};

/** Formats integer minor units (cents) into a major-unit currency string. */
function formatCents(cents: number | null | undefined): string {
	if (cents == null) return 'No installment set';
	return `$${(cents / 100).toFixed(2)}`;
}

/** Formats an ISO timestamp into a short date token; em dash when absent. */
function formatDate(iso: string | null | undefined): string {
	if (!iso) return '—';
	const d = new Date(iso);
	return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

/** Shortens a UUID assignee id into a readable claimant token. */
function claimant(assigneeId: string | null | undefined): string {
	if (!assigneeId) return 'Unclaimed';
	return `Claimed · ${assigneeId.slice(0, 8)}`;
}
// #endregion

/**
 * @function StageBreakdownList
 * @description Renders the reorderable, removable stage-node breakdown for a ticket.
 * @param {StageBreakdownListProps} props - Ticket/project data and persistence callbacks.
 * @returns {import('preact').JSX.Element}
 */
export function StageBreakdownList(
	{ ticket, project, editable, onReorder, onRemoveStage }: StageBreakdownListProps,
) {
	// #region Drag state (live order override + ghost slot)
	/** Stage id currently being dragged, or null. */
	const draggingId = useSignal<string | null>(null);
	/** Live working order during a drag; null when idle (falls back to the ticket order). */
	const orderOverride = useSignal<string[] | null>(null);
	// #endregion

	const ticketClaimed = !!ticket.current_assignee_id;

	/** A stage may be reordered/removed only when it is unstarted AND the ticket is unclaimed. */
	const isLocked = (status: string): boolean => !editable || ticketClaimed || status !== 'open';

	// #region Row resolution
	const baseRows: ResolvedRow[] = (ticket.required_stages ?? [])
		.slice()
		.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
		.map((rs) => {
			const stage = project?.stages?.find((s) => s.id === rs.stage_id);
			const status = stage?.status ?? 'open';
			return {
				stageId: rs.stage_id,
				order: 0, // assigned after any drag-order override is applied
				name: stage?.name ?? 'Unknown stage',
				status,
				statusLabel: STAGE_STATUS_LABELS[status] ?? status,
				claimantLabel: claimant(ticket.current_assignee_id),
				costLabel: formatCents(stage?.unit_price_cents),
				updatedLabel: formatDate(stage?.end_date ?? ticket.updated_at),
				locked: isLocked(status),
			};
		});

	// Apply a live drag-order override (if any), then stamp 1-based display order.
	const byId = new Map(baseRows.map((r) => [r.stageId, r]));
	const displayIds = orderOverride.value ?? baseRows.map((r) => r.stageId);
	const rows: ResolvedRow[] = displayIds
		.map((id) => byId.get(id))
		.filter((r): r is ResolvedRow => !!r)
		.map((r, i) => ({ ...r, order: i + 1 }));
	// #endregion

	// #region Native pointer-drag handlers
	const handleDragStart = (stageId: string, locked: boolean) => (e: DragEvent) => {
		if (locked) {
			e.preventDefault();
			return;
		}
		draggingId.value = stageId;
		orderOverride.value = rows.map((r) => r.stageId);
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', stageId);
		}
	};

	/** Live-reorders the working list so the dragged node slots ahead of the hovered node. */
	const handleDragOver = (overStageId: string, overLocked: boolean) => (e: DragEvent) => {
		e.preventDefault();
		const dragged = draggingId.value;
		if (!dragged || dragged === overStageId || overLocked) return;

		const list = [...(orderOverride.value ?? rows.map((r) => r.stageId))];
		const from = list.indexOf(dragged);
		const to = list.indexOf(overStageId);
		if (from === -1 || to === -1) return;

		list.splice(from, 1);
		list.splice(to, 0, dragged);
		orderOverride.value = list;
	};

	const commit = () => {
		const finalOrder = orderOverride.value;
		const original = baseRows.map((r) => r.stageId);
		draggingId.value = null;
		orderOverride.value = null;
		// Only persist when the order actually changed.
		if (finalOrder && finalOrder.join('|') !== original.join('|')) {
			onReorder(finalOrder);
		}
	};
	// #endregion

	if (rows.length === 0) {
		return (
			<div class='stage-breakdown'>
				<p class='stage-breakdown__empty'>This ticket is not associated with any stages.</p>
			</div>
		);
	}

	return (
		<div class='stage-breakdown'>
			<div class='stage-breakdown__list'>
				{rows.map((r) => (
					<StageNodeRow
						key={r.stageId}
						stageId={r.stageId}
						order={r.order}
						name={r.name}
						status={r.status}
						statusLabel={r.statusLabel}
						claimantLabel={r.claimantLabel}
						costLabel={r.costLabel}
						updatedLabel={r.updatedLabel}
						locked={r.locked}
						dragging={draggingId.value === r.stageId}
						onRemove={() => onRemoveStage(r.stageId)}
						onDragStart={handleDragStart(r.stageId, r.locked)}
						onDragOver={handleDragOver(r.stageId, r.locked)}
						onDragEnd={commit}
						onDrop={(e) => {
							e.preventDefault();
							commit();
						}}
					/>
				))}
			</div>
			{editable && !ticketClaimed && (
				<p class='stage-breakdown__hint'>
					Drag unstarted stages to reorder. Active or claimed stages are locked.
				</p>
			)}
		</div>
	);
}
