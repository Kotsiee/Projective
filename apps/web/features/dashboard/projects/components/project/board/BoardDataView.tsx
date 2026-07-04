/**
 * @file BoardDataView.tsx
 * @description Shared renderer for mapping tickets and stages to either a Kanban or Table view.
 */

// #region Imports
import { useEffect, useMemo } from 'preact/hooks';
import { Kanban, KanbanFieldProps } from '@projective/charts';
import { ColumnDef, DataDisplay } from '@projective/data';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import { TicketStatus } from '@projective/types';
// #endregion

// #region Interfaces
export interface BoardTicket {
	id: string;
	title: string;
	/** Plain-text summary of the ticket brief, shown as the card body. */
	description?: string;
	stageId: string;
	stageName: string;
	status: TicketStatus;
	assigneeId: string | null;
	assigneeName: string | null;
	workloadIntensity: number;
	revisionsRequested: number;
	attachmentsScanned: boolean;
	/** Number of attachments on the ticket (paperclip count in the footer). */
	attachmentCount?: number;
	createdAt: string;
	/** Last-updated timestamp — drives recency ordering in non-backlog columns (spec §1). */
	updatedAt: string;
	/** Manual backlog ordering (only meaningful in the New column). */
	sortOrder?: number | null;
	/** Workload-dispute countdown target; when in the future the card is frozen (spec §4). */
	hiddenUntil?: string | null;
}

interface BoardDataViewProps {
	tickets: BoardTicket[];
	stages: { label: string; value: string }[];
	viewType: 'stages' | 'status';
	displayMode: 'kanban' | 'list';
	isOwnerOrAdmin: boolean;
	/**
	 * Which board this is (spec §1). 'project' allows loose drag within the movement rules; 'stage'
	 * disables all dragging except — for the Client — cards in the New column.
	 */
	level?: 'project' | 'stage';
	/** Whether the viewer is the project Client (only relevant at the 'stage' level). */
	isClient?: boolean;
	onCardClick: (ticketId: string) => void;
	onCardMove: (
		cardId: string,
		sourceFieldId: string,
		targetFieldId: string,
		insertBeforeCardId: string | null,
	) => void;
	onFieldMove: (sourceId: string, targetId: string, insertBefore: boolean) => void;
	onAddStage: () => void;
	onAddTicket?: (stageId: string | null) => void;
}

/** A backlog/New column id in either view (stages view uses 'New', status view uses Backlog). */
const isNewColumnId = (fieldId: string): boolean =>
	fieldId === 'New' || fieldId === TicketStatus.Backlog;

/** A ticket is frozen while its workload-dispute window is still open. */
const isTicketFrozen = (t: BoardTicket): boolean =>
	!!t.hiddenUntil && new Date(t.hiddenUntil).getTime() > Date.now();

/** Short human-facing ticket reference for the card header, e.g. "#a1b2c3". */
const shortTicketRef = (id: string): string => `#${id.replace(/-/g, '').slice(0, 6)}`;

/**
 * Maps the workload-intensity tier to the footer priority pill (spec §2). The tiers are
 * 0.5× (Low) / 1.0× (Medium) / 2.0× (High); anything heavier still reads as High.
 */
const workloadPriority = (
	wi: number,
): { label: string; level: 'low' | 'medium' | 'high' } => {
	if (wi <= 0.75) return { label: 'Low', level: 'low' };
	if (wi <= 1.5) return { label: 'Medium', level: 'medium' };
	return { label: 'High', level: 'high' };
};

/** New/backlog columns are manually ordered; every other column auto-sorts by recency (spec §1). */
const columnSortMode = (fieldId: string): 'manual' | 'recency' =>
	isNewColumnId(fieldId) ? 'manual' : 'recency';
// #endregion

const tableColumns: ColumnDef<BoardTicket>[] = [
	{ id: 'title', field: 'title', label: 'Ticket Title', sortable: true, width: 250 },
	{ id: 'stage', field: 'stageName', label: 'Stage', sortable: true, width: 150 },
	{ id: 'status', field: 'status', label: 'Status', sortable: true, width: 120 },
	{
		id: 'assignee',
		field: (t) => t.assigneeName || 'Unassigned',
		label: 'Assignee',
		sortable: true,
		width: 150,
	},
	{
		id: 'wi',
		field: (t) => t.workloadIntensity,
		label: 'Intensity (Wi)',
		sortable: true,
		width: 100,
		align: 'right',
	},
	{
		id: 'revisions',
		field: 'revisionsRequested',
		label: 'Revisions',
		sortable: true,
		width: 100,
		align: 'right',
	},
	{
		id: 'secured',
		field: (t) => t.attachmentsScanned ? 'Yes' : '-',
		label: 'Secured',
		width: 80,
		align: 'center',
	},
];

export function BoardDataView({
	tickets,
	stages,
	viewType,
	displayMode,
	isOwnerOrAdmin,
	level = 'project',
	isClient = false,
	onCardClick,
	onCardMove,
	onFieldMove,
	onAddStage,
	onAddTicket,
}: BoardDataViewProps) {
	const { setCustomScrollEnabled } = useNavigationContext();

	/**
	 * Whether a card may be dragged, given the board level and the ticket's lifecycle (spec §1):
	 *   • project level — loose movement, but frozen once Claimed and only unlocked at New/Completed.
	 *   • stage level   — no dragging at all, except the Client acting on cards in the New column.
	 */
	const cardCanReorder = (t: BoardTicket, fieldId: string): boolean => {
		if (level === 'stage') {
			return isClient && isNewColumnId(fieldId);
		}
		return isOwnerOrAdmin &&
			(t.status === TicketStatus.Backlog || t.status === TicketStatus.Completed);
	};

	const mapTicketToCard = (t: BoardTicket, orderIndex: number, fieldId: string): any => {
		const dateString = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(
			new Date(t.createdAt),
		);

		return {
			id: t.id,
			displayId: shortTicketRef(t.id),
			title: t.title,
			description: t.description || undefined,
			dateLabel: dateString,
			attachmentCount: t.attachmentCount ?? 0,
			priority: workloadPriority(t.workloadIntensity),
			takenBy: t.assigneeName ? { name: t.assigneeName } : undefined,
			order: orderIndex,
			created: t.createdAt,
			updated: t.updatedAt,
			frozen: isTicketFrozen(t) ? { until: t.hiddenUntil! } : undefined,
			permissions: { canReorder: cardCanReorder(t, fieldId) },
		};
	};

	/**
	 * Orders a column's tickets (spec §1 reordering rule): the New/backlog column keeps the manual
	 * drag order (sort_order); every other column auto-sorts by most-recently-updated.
	 */
	const orderColumnTickets = (fieldId: string, list: BoardTicket[]): BoardTicket[] => {
		const sorted = [...list];
		if (isNewColumnId(fieldId)) {
			sorted.sort((a, b) =>
				(a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER) ||
				new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			);
		} else {
			sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
		}
		return sorted;
	};

	const kanbanFields = useMemo<KanbanFieldProps[]>(() => {
		const fieldsMap = new Map<string, KanbanFieldProps>();
		// Fields cannot be reordered at the stage level; at the project level only the pipeline stage
		// columns are reorderable (New/Done/status columns stay fixed).
		const stageColumnsReorderable = level === 'project' && isOwnerOrAdmin;
		// Bucket tickets by their target column first, so each column can be ordered independently.
		const buckets = new Map<string, BoardTicket[]>();
		const bucket = (fieldId: string, t: BoardTicket) => {
			if (!buckets.has(fieldId)) buckets.set(fieldId, []);
			buckets.get(fieldId)!.push(t);
		};

		if (viewType === 'stages') {
			fieldsMap.set('New', {
				id: 'New',
				title: 'New',
				color: 'primary',
				order: 0,
				cards: [],
				permissions: {
					canReorder: false,
					canAddCard: level === 'stage' ? isClient : isOwnerOrAdmin,
				},
				addCardLabel: 'New Ticket',
			});

			let orderCounter = 1;
			stages.forEach((s) => {
				fieldsMap.set(s.value, {
					id: s.value,
					title: s.label,
					color: 'secondary',
					order: orderCounter++,
					cards: [],
					permissions: { canReorder: stageColumnsReorderable },
				});
			});

			fieldsMap.set('Done', {
				id: 'Done',
				title: 'Done',
				color: 'var(--success)',
				order: 999,
				cards: [],
				permissions: { canReorder: false, canAddCard: false },
			});

			tickets.forEach((t) => {
				// A card's column follows its STAGE (current_stage_id), not its lifecycle status —
				// the two are independent, so a ticket can sit in a pipeline stage while still being
				// "New"/backlog (unpaid). `Completed` is the single terminal exception routed to the
				// Done column. A frozen ticket is pulled back to the New pool (spec §4), and a ticket
				// with no stage sits in the backlog "New" pool.
				const hasStage = !!t.stageId && t.stageId !== 'new';
				const targetField = t.status === TicketStatus.Completed
					? 'Done'
					: (isTicketFrozen(t) || !hasStage ? 'New' : t.stageId);
				if (fieldsMap.has(targetField)) bucket(targetField, t);
			});
		} else {
			const statuses = [
				{
					id: TicketStatus.Backlog,
					title: 'Backlog',
					color: 'primary',
					fields: { canAddCard: level === 'stage' ? isClient : isOwnerOrAdmin },
				},
				{ id: TicketStatus.Todo, title: 'Todo', color: 'secondary', fields: { canAddCard: false } },
				{
					id: TicketStatus.Claimed,
					title: 'Claimed',
					color: 'secondary',
					fields: { canAddCard: false },
				},
				{
					id: TicketStatus.InProgress,
					title: 'In Progress',
					color: 'var(--warning)',
					fields: { canAddCard: false },
				},
				{
					id: TicketStatus.InReview,
					title: 'Review',
					color: 'var(--primary)',
					fields: { canAddCard: false },
				},
				{
					id: TicketStatus.Completed,
					title: 'Completed',
					color: 'var(--success)',
					fields: { canAddCard: false },
				},
				{
					id: TicketStatus.Cancelled,
					title: 'Cancelled',
					color: 'var(--danger)',
					fields: { canAddCard: false },
				},
			];

			statuses.forEach((status, idx) => {
				fieldsMap.set(status.id, {
					id: status.id,
					title: status.title,
					color: status.color,
					order: idx,
					cards: [],
					permissions: { canReorder: false, canAddCard: status.fields.canAddCard },
					addCardLabel: status.id === TicketStatus.Backlog ? 'New Ticket' : 'Add Ticket',
				});
			});

			tickets.forEach((t) => {
				if (fieldsMap.has(t.status)) bucket(t.status, t);
			});
		}

		// Order each column's tickets per the reordering rule, then map to cards with a clean
		// sequential `order` so the charts layer preserves exactly this arrangement.
		for (const [fieldId, field] of fieldsMap) {
			const ordered = orderColumnTickets(fieldId, buckets.get(fieldId) ?? []);
			field.cards = ordered.map((t, i) => mapTicketToCard(t, i, fieldId));
			field.sortMode = columnSortMode(fieldId);
		}

		return Array.from(fieldsMap.values()).sort((a, b) => a.order - b.order);
	}, [tickets, stages, viewType, isOwnerOrAdmin, level, isClient]);

	useEffect(() => {
		if (displayMode === 'kanban') {
			setCustomScrollEnabled(true);
		} else {
			setCustomScrollEnabled(false);
		}
		return () => setCustomScrollEnabled(false);
	}, [displayMode, setCustomScrollEnabled]);

	const handleAddCardInternal = (fieldId: string) => {
		if (onAddTicket) {
			const sanitizedId = fieldId === 'New' || fieldId === TicketStatus.Backlog ? null : fieldId;
			onAddTicket(sanitizedId);
		}
	};

	if (displayMode === 'kanban') {
		return (
			<div class='project-board__kanban-wrapper'>
				<Kanban
					fields={kanbanFields}
					onCardClick={(card) => onCardClick(card.id)}
					onCardMove={onCardMove}
					onFieldMove={onFieldMove}
					onAddCard={handleAddCardInternal}
					onAddField={viewType === 'stages' && isOwnerOrAdmin ? onAddStage : undefined}
					permissions={{ canAddField: viewType === 'stages' && isOwnerOrAdmin }}
				/>
			</div>
		);
	}

	return (
		<div style={{ height: '100%', width: '100%' }}>
			<DataDisplay
				mode='table'
				columns={tableColumns}
				dataSource={tickets}
				renderItem={() => <></>}
				onSelectionChange={() => {}}
				interactive
			/>
		</div>
	);
}
