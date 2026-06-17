// #region IMPORTS
import { useSignal } from '@preact/signals';
import { Kanban, KanbanFieldProps } from '@projective/charts';
// #endregion

// #region MOCK DATA
const MOCK_FIELDS: KanbanFieldProps[] = [
	{
		id: 'field-backlog',
		title: 'Backlog',
		color: 'var(--text-muted)',
		order: 0,
		addCardLabel: 'Add Backlog Item', // Customised add button label
		permissions: {
			canAddCard: true, // Hides unless true
			canReorder: true, // Disabled unless true
		},
		cards: [
			{
				id: 'card-1',
				title: 'Database Schema',
				description: 'Create ERD.',
				created: new Date().toISOString(),
				order: 0,
				permissions: { canReorder: true }, // Explicit opt-in
			},
			{
				id: 'card-2',
				title: 'Stripe Integration',
				description: 'Integrate Connect.',
				created: new Date().toISOString(),
				order: 1,
				permissions: { canReorder: true },
			},
		],
	},
	{
		id: 'field-in-progress',
		title: 'In Progress',
		color: 'var(--warning)',
		order: 1,
		limit: 5,
		addCardLabel: 'Add Sprint Task', // Customised add button label
		permissions: {
			canAddCard: true,
			canReorder: true,
		},
		cards: [
			{
				id: 'card-3',
				title: 'Kanban Component',
				description: 'Locked Ticket',
				created: new Date().toISOString(),
				order: 0,
				takenBy: 'Alice',
				permissions: { canReorder: false }, // Fixed card context
			},
		],
	},
	{
		id: 'field-done',
		title: 'Done',
		color: 'var(--success)',
		order: -1,
		permissions: {
			canAddCard: false, // Disables the add button completely
			canReorder: false, // Fixed layout structure
		},
		cards: [],
	},
];
// #endregion

// #region COMPONENT
/**
 * Renders the primary Project Tasks Island containing the updated custom pointer-event
 * driven Kanban system, passing tailored labels, configuration settings, and structural permissions.
 * * @returns {JSX.Element} The rendered project tasks framework island.
 */
export default function ProjectTasksIsland() {
	const fields = useSignal<KanbanFieldProps[]>(MOCK_FIELDS);

	/**
	 * Re-indexes array items sequentially to prevent internal collision artifacts.
	 * * @param {T[]} items - Array of sortable entities.
	 * @returns {T[]} Clean mapped sequence array.
	 */
	const reindexOrders = <T extends { order: number }>(items: T[]): T[] => {
		let counter = 0;
		return items.map((item) => item.order >= 0 ? { ...item, order: counter++ } : item);
	};

	/**
	 * Updates local signals when cards are repositioned dynamically across board vectors.
	 */
	const handleCardMove = (
		cardId: string,
		sourceFieldId: string,
		targetFieldId: string,
		insertBeforeCardId: string | null,
	) => {
		const currentFields = [...fields.value];

		const sIdx = currentFields.findIndex((f) => f.id === sourceFieldId);
		const tIdx = currentFields.findIndex((f) => f.id === targetFieldId);
		if (sIdx === -1 || tIdx === -1) return;

		const sourceCards = [...currentFields[sIdx].cards].sort((a, b) => a.order - b.order);
		const targetCards = sIdx === tIdx
			? sourceCards
			: [...currentFields[tIdx].cards].sort((a, b) => a.order - b.order);

		const cardIndex = sourceCards.findIndex((c) => c.id === cardId);
		if (cardIndex === -1) return;
		const [movedCard] = sourceCards.splice(cardIndex, 1);

		let insertIndex = targetCards.length;
		if (insertBeforeCardId) {
			const isAfter = insertBeforeCardId.endsWith('_after');
			const targetIdClean = isAfter ? insertBeforeCardId.replace('_after', '') : insertBeforeCardId;
			const targetIndex = targetCards.findIndex((c) => c.id === targetIdClean);
			if (targetIndex !== -1) insertIndex = isAfter ? targetIndex + 1 : targetIndex;
		}

		targetCards.splice(insertIndex, 0, movedCard);

		currentFields[sIdx] = { ...currentFields[sIdx], cards: reindexOrders(sourceCards) };
		currentFields[tIdx] = { ...currentFields[tIdx], cards: reindexOrders(targetCards) };

		fields.value = currentFields;
	};

	/**
	 * Updates local signals when fields are reordered across layout tracks.
	 */
	const handleFieldMove = (sourceFieldId: string, targetFieldId: string, insertBefore: boolean) => {
		const currentFields = [...fields.value].sort((a, b) => {
			if (a.order >= 0 && b.order >= 0) return a.order - b.order;
			if (a.order < 0 && b.order < 0) return b.order - a.order;
			if (a.order >= 0 && b.order < 0) return -1;
			return 1;
		});

		const sIdx = currentFields.findIndex((f) => f.id === sourceFieldId);
		if (sIdx === -1) return;
		const [movedField] = currentFields.splice(sIdx, 1);

		const tIdx = currentFields.findIndex((f) => f.id === targetFieldId);
		const insertIndex = insertBefore ? Math.max(0, tIdx) : tIdx + 1;

		currentFields.splice(insertIndex, 0, movedField);
		fields.value = reindexOrders(currentFields);
	};

	/**
	 * Creates new structured card entities using interactive browser dialog prompts.
	 */
	const handleAddCard = (fieldId: string) => {
		const title = globalThis.prompt('Enter new ticket title:');
		if (!title) return;

		const currentFields = [...fields.value];
		const fIdx = currentFields.findIndex((f) => f.id === fieldId);

		if (fIdx !== -1) {
			const cards = [...currentFields[fIdx].cards];
			cards.push({
				id: `card-new-${Date.now()}`,
				title,
				description: '',
				created: new Date().toISOString(),
				order: cards.length > 0 ? Math.max(...cards.map((c) => c.order)) + 1 : 0,
				permissions: { canReorder: true }, // Enabled on initial execution
			});
			currentFields[fIdx] = { ...currentFields[fIdx], cards };
			fields.value = currentFields;
		}
	};

	/**
	 * Creates new stage vectors dynamically inside the board array layout.
	 */
	const handleAddField = () => {
		const title = globalThis.prompt('Enter new stage title:');
		if (!title) return;

		const currentFields = [...fields.value];
		const newOrder = currentFields.length > 0
			? Math.max(...currentFields.filter((f) => f.order >= 0).map((f) => f.order)) + 1
			: 0;

		currentFields.push({
			id: `field-new-${Date.now()}`,
			title,
			color: 'var(--primary)',
			order: newOrder,
			addCardLabel: 'Add Ticket',
			permissions: {
				canAddCard: true,
				canReorder: true,
			},
			cards: [],
		});

		fields.value = reindexOrders(currentFields);
	};

	return (
		<div class='project-tasks-island' style={{ height: 'calc(100vh - var(--header-height))' }}>
			<Kanban
				mode='container' // Uses standard window body container scrollbar mapping natively
				fields={fields.value}
				permissions={{
					canAddField: true, // Passed down directly to structural context layout
				}}
				onCardMove={handleCardMove}
				onFieldMove={handleFieldMove}
				onAddCard={handleAddCard}
				onAddField={handleAddField}
			/>
		</div>
	);
}
// #endregion
