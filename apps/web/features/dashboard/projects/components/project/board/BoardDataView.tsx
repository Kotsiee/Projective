import { useComputed } from '@preact/signals';
import { Kanban, KanbanCardProps, KanbanFieldProps } from '@projective/charts';
import { ColumnDef, DataDisplay } from '@projective/data';

export interface BoardTicket {
	id: string;
	title: string;
	stageId: string;
	stageName: string;
	status: 'Backlog' | 'Todo' | 'In Progress' | 'In Review' | 'Completed' | 'Cancelled';
	assigneeId: string | null;
	assigneeName: string | null;
	workloadIntensity: number;
	revisionsRequested: number;
	attachmentsScanned: boolean;
	createdAt: string;
}

interface BoardDataViewProps {
	tickets: BoardTicket[];
	viewType: 'stages' | 'status';
	displayMode: 'kanban' | 'list';
	isOwnerOrAdmin: boolean;
	onCardClick: (ticketId: string) => void;
	onFieldMove: (sourceId: string, targetId: string, insertBefore: boolean) => void;
	onAddStage: () => void;
}

// Columns for the DataDisplay Table
const tableColumns: ColumnDef<BoardTicket>[] = [
	{ id: 'title', field: 'title', label: 'Ticket Title', sortable: true, width: 250 },
	{ id: 'stage', field: 'stageName', label: 'Stage', sortable: true, width: 150 },
	{
		id: 'status',
		field: 'status',
		label: 'Status',
		sortable: true,
		width: 120,
		// In a real scenario, DataDisplay can accept a custom renderer or we format in standard text.
		// For standard DataDisplay as defined, it strings the field, but we can return string formats here or extend component renderer.
	},
	{
		id: 'assignee',
		field: (t) => t.assigneeName || 'Unassigned',
		label: 'Assignee',
		sortable: true,
		width: 150,
	},
	{
		id: 'wi',
		field: (t) => t.workloadIntensity.toFixed(1),
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
	viewType,
	displayMode,
	isOwnerOrAdmin,
	onCardClick,
	onFieldMove,
	onAddStage,
}: BoardDataViewProps) {
	// Kanban Field Generation
	const kanbanFields = useComputed<KanbanFieldProps[]>(() => {
		const fieldsMap = new Map<string, KanbanFieldProps>();

		if (viewType === 'stages') {
			// Pipeline Layout: "New" and "Done" are static and unmovable.
			fieldsMap.set('New', {
				id: 'New',
				title: 'New',
				order: 0,
				cards: [],
				permissions: { canReorder: false },
			});

			let orderCounter = 1;
			tickets.forEach((t) => {
				if (!fieldsMap.has(t.stageId)) {
					fieldsMap.set(t.stageId, {
						id: t.stageId,
						title: t.stageName,
						order: orderCounter++,
						cards: [],
						// Admin can move STAGES, but not New/Done.
						permissions: { canReorder: isOwnerOrAdmin },
					});
				}
			});

			fieldsMap.set('Done', {
				id: 'Done',
				title: 'Done',
				order: 999,
				cards: [],
				permissions: { canReorder: false },
			});

			tickets.forEach((t) => {
				const targetField = t.status === 'Completed'
					? 'Done'
					: (t.status === 'Backlog' ? 'New' : t.stageId);
				const field = fieldsMap.get(targetField);
				if (field) field.cards.push(mapTicketToCard(t));
			});
		} else {
			// Status Layout
			const statuses = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Completed', 'Cancelled'];
			statuses.forEach((status, idx) => {
				fieldsMap.set(status, {
					id: status,
					title: status,
					order: idx,
					cards: [],
					permissions: { canReorder: false },
				});
			});

			tickets.forEach((t) => {
				const field = fieldsMap.get(t.status);
				if (field) field.cards.push(mapTicketToCard(t));
			});
		}

		return Array.from(fieldsMap.values()).sort((a, b) => a.order - b.order);
	});

	const mapTicketToCard = (t: BoardTicket): KanbanCardProps => ({
		id: t.id,
		title: t.title,
		description: `Wi: ${t.workloadIntensity.toFixed(1)} | Revisions: ${t.revisionsRequested}`,
		created: t.createdAt,
		takenBy: t.assigneeName || undefined,
		order: 0,
		permissions: { canReorder: false }, // Absolute Work Rule enforced
		tags: t.attachmentsScanned ? ['Secured'] : [],
	});

	if (displayMode === 'kanban') {
		return (
			<Kanban
				fields={kanbanFields.value}
				mode='container'
				onCardClick={(card) => onCardClick(card.id)}
				onFieldMove={onFieldMove}
				onAddField={viewType === 'stages' && isOwnerOrAdmin ? onAddStage : undefined}
				permissions={{ canAddField: viewType === 'stages' && isOwnerOrAdmin }}
			/>
		);
	}

	return (
		<div style={{ height: '100%', width: '100%' }}>
			<DataDisplay
				mode='table'
				columns={tableColumns}
				dataSource={tickets}
				renderItem={() => <></>} // Ignored by table mode, but required by prop contract
				onSelectionChange={() => {}}
				interactive
			/>
		</div>
	);
}
