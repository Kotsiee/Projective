/**
 * @file StageNodeRow.tsx
 * @description A single row in the ticket Stage Breakdown (spec §3/§4). Renders the semantic status
 * dot-matrix indicator, the stage metadata strings (name, claimant, installment cost, last-updated),
 * a drag handle for pointer reordering, and a contextual dot-menu that can purge the stage from the
 * ticket's `required_stages` array — but only while the stage is unstarted and the ticket unclaimed.
 *
 * Purely presentational: all drag/remove intent is delegated upward to
 * {@link StageBreakdownList} (see documentation/business/brain2.md — dumb components / fat services).
 */

// #region Imports
import { useSignal } from '@preact/signals';
import { Popover } from '@projective/ui';
import { IconDotsVertical, IconGripVertical, IconTrash } from '@tabler/icons-preact';
// #endregion

// #region Types
export interface StageNodeRowProps {
	/** Project-stage id this row represents. */
	stageId: string;
	/** 1-based display order within the ticket breakdown. */
	order: number;
	/** Human-readable stage name. */
	name: string;
	/** Raw stage status enum value — drives the `--[status]` indicator modifier. */
	status: string;
	/** Capitalized status label for the trailing tag. */
	statusLabel: string;
	/** Pre-formatted claimant/assignee string (or an "Unclaimed" fallback). */
	claimantLabel: string;
	/** Pre-formatted installment currency cost. */
	costLabel: string;
	/** Pre-formatted last-updated timestamp token. */
	updatedLabel: string;
	/** When true the row is static: no reordering gesture, no destructive menu action. */
	locked: boolean;
	/** True while this row is the one actively being dragged (ghost styling). */
	dragging: boolean;
	/** Purge this stage from the ticket requirements array. */
	onRemove: () => void;
	// Native pointer drag wiring (owned by the parent list).
	onDragStart: (e: DragEvent) => void;
	onDragOver: (e: DragEvent) => void;
	onDragEnd: (e: DragEvent) => void;
	onDrop: (e: DragEvent) => void;
}
// #endregion

/**
 * @function StageNodeRow
 * @description Renders one stage node with its status indicator, metadata, drag handle and dot-menu.
 * @param {StageNodeRowProps} props - Row content, lock state and drag/remove handlers.
 * @returns {import('preact').JSX.Element}
 */
export function StageNodeRow(props: StageNodeRowProps) {
	const menuOpen = useSignal(false);

	return (
		<div
			class={`stage-node ${props.locked ? 'stage-node--locked' : ''} ${
				props.dragging ? 'stage-node--dragging' : ''
			}`}
			data-stage-id={props.stageId}
			draggable={!props.locked}
			onDragStart={props.onDragStart}
			onDragOver={props.onDragOver}
			onDragEnd={props.onDragEnd}
			onDrop={props.onDrop}
		>
			{/* #region Drag handle */}
			<span
				class='stage-node__handle'
				aria-hidden='true'
				title={props.locked ? 'Locked: stage is active or claimed' : 'Drag to reorder'}
			>
				<IconGripVertical size={16} />
			</span>
			{/* #endregion */}

			{/* #region Status dot-matrix indicator */}
			<span
				class={`stage-node__indicator stage-node__indicator--${props.status}`}
				role='img'
				aria-label={`Status: ${props.statusLabel}`}
			/>
			<span class='stage-node__order'>{props.order}</span>
			{/* #endregion */}

			{/* #region Metadata strings */}
			<div class='stage-node__body'>
				<div class='stage-node__name'>{props.name}</div>
				<div class='stage-node__meta'>
					<span class='stage-node__meta-item'>{props.claimantLabel}</span>
					<span class='stage-node__meta-item stage-node__meta-item--cost'>{props.costLabel}</span>
					<span class='stage-node__meta-item'>Updated {props.updatedLabel}</span>
				</div>
			</div>

			<span class={`stage-node__status stage-node__status--${props.status}`}>
				{props.statusLabel}
			</span>
			{/* #endregion */}

			{/* #region Contextual dot-menu */}
			<Popover
				isOpen={menuOpen.value}
				onClose={() => (menuOpen.value = false)}
				position='bottom-right'
				trigger={
					<button
						type='button'
						class='stage-node__menu-btn'
						aria-label='Stage actions'
						aria-haspopup='menu'
						onClick={() => (menuOpen.value = !menuOpen.value)}
					>
						<IconDotsVertical size={16} />
					</button>
				}
				content={
					<div class='stage-node-menu' role='menu'>
						{props.locked
							? (
								<span class='stage-node-menu__empty'>
									No actions — this stage is active or claimed.
								</span>
							)
							: (
								<button
									type='button'
									role='menuitem'
									class='stage-node-menu__item stage-node-menu__item--danger'
									onClick={() => {
										menuOpen.value = false;
										props.onRemove();
									}}
								>
									<IconTrash size={14} />
									Remove stage from ticket
								</button>
							)}
					</div>
				}
			/>
			{/* #endregion */}
		</div>
	);
}
