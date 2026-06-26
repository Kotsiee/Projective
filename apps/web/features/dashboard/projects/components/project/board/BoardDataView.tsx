import { useEffect, useMemo } from 'preact/hooks';
import { Kanban, KanbanCardProps, KanbanFieldProps } from '@projective/charts';
import { ColumnDef, DataDisplay } from '@projective/data';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';

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
	stages: { label: string; value: string }[];
	viewType: 'stages' | 'status';
	displayMode: 'kanban' | 'list';
	isOwnerOrAdmin: boolean;
	onCardClick: (ticketId: string) => void;
	onCardMove: (
		cardId: string,
		sourceFieldId: string,
		targetFieldId: string,
		insertBeforeCardId: string | null,
	) => void;
	onFieldMove: (sourceId: string, targetId: string, insertBefore: boolean) => void;
	onAddStage: () => void;
}

// Columns for the DataDisplay Table
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
	stages,
	viewType,
	displayMode,
	isOwnerOrAdmin,
	onCardClick,
	onCardMove,
	onFieldMove,
	onAddStage,
}: BoardDataViewProps) {
	const { setCustomScrollEnabled } = useNavigationContext();
	// 1. Define the mapper function FIRST so it's initialized before useMemo calls it.
	// deno-lint-ignore no-explicit-any
	const mapTicketToCard = (t: BoardTicket, orderIndex: number): any => {
		const tags = [];
		if (t.attachmentsScanned) {
			tags.push({ id: `sec-${t.id}`, label: 'Secured', variant: 'solid', color: 'var(--success)' });
		}
		if (t.revisionsRequested > 0) {
			tags.push({ id: `rev-${t.id}`, label: 'Revision', variant: 'text', color: 'var(--warning)' });
		}
		tags.push({
			id: `wi-${t.id}`,
			label: `Wi: ${t.workloadIntensity.toFixed(1)}`,
			variant: 'solid',
		});

		const dateString = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(
			new Date(t.createdAt),
		);

		return {
			id: t.id,
			title: t.title,
			description: `This ticket requires a workload intensity of ${
				t.workloadIntensity.toFixed(1)
			} and has ${t.revisionsRequested} revisions requested.`,
			meta: `Created: ${dateString}`,
			takenBy: t.assigneeName ? { name: t.assigneeName } : undefined,
			order: orderIndex,
			permissions: { canReorder: isOwnerOrAdmin },
			tags,
		};
	};

	// 2. Compute the fields safely using the initialized mapper.
	const kanbanFields = useMemo<KanbanFieldProps[]>(() => {
		const fieldsMap = new Map<string, KanbanFieldProps>();

		if (viewType === 'stages') {
			fieldsMap.set('New', {
				id: 'New',
				title: 'New',
				color: 'primary',
				order: 0,
				cards: [],
				permissions: { canReorder: false },
			});

			let orderCounter = 1;
			stages.forEach((s) => {
				fieldsMap.set(s.value, {
					id: s.value,
					title: s.label,
					color: 'secondary',
					order: orderCounter++,
					cards: [],
					permissions: { canReorder: isOwnerOrAdmin },
				});
			});

			fieldsMap.set('Done', {
				id: 'Done',
				title: 'Done',
				color: 'var(--success)',
				order: 999,
				cards: [],
				permissions: { canReorder: false },
			});

			tickets.forEach((t) => {
				const targetField = t.status === 'Completed'
					? 'Done'
					: (t.status === 'Backlog' ? 'New' : t.stageId);
				const field = fieldsMap.get(targetField);

				if (field) field.cards.push(mapTicketToCard(t, field.cards.length));
			});
		} else {
			const statuses = [
				{ id: 'Backlog', color: 'primary' },
				{ id: 'Todo', color: 'secondary' },
				{ id: 'In Progress', color: 'secondary' },
				{ id: 'In Review', color: 'secondary' },
				{ id: 'Completed', color: 'var(--success)' },
				{ id: 'Cancelled', color: 'var(--danger)' },
			];

			statuses.forEach((status, idx) => {
				fieldsMap.set(status.id, {
					id: status.id,
					title: status.id,
					color: status.color,
					order: idx,
					cards: [],
					permissions: { canReorder: false },
				});
			});

			tickets.forEach((t) => {
				const field = fieldsMap.get(t.status);
				if (field) field.cards.push(mapTicketToCard(t, field.cards.length));
			});
		}

		return Array.from(fieldsMap.values()).sort((a, b) => a.order - b.order);
	}, [tickets, stages, viewType, isOwnerOrAdmin]);

	useEffect(() => {
		if (displayMode === 'kanban') {
			setCustomScrollEnabled(true);
		} else {
			// Turn it off if they switch to the Table view
			setCustomScrollEnabled(false);
		}

		// Cleanup: Always disable it when leaving the page entirely
		return () => setCustomScrollEnabled(false);
	}, [displayMode, setCustomScrollEnabled]);

	if (displayMode === 'kanban') {
		return (
			<div class='project-board__kanban-wrapper'>
				<Kanban
					fields={kanbanFields}
					onCardClick={(card) => onCardClick(card.id)}
					onCardMove={onCardMove}
					onFieldMove={onFieldMove}
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
