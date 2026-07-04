/**
 * @file TicketInlineField.tsx
 * @description Read↔edit swap wrapper for the inline Ticket editor (spec §2). Renders a read-only
 * presentation of a value that, when clicked (and the viewer has edit authority), swaps into an
 * active editable field from `@projective/fields`. The wrapper is state-agnostic: the parent owns
 * the `editing` flag and the draft signal bound to the edit control, so a single Save/Cancel action
 * set can commit or revert every field's draft buffer at once.
 */

// #region Imports
import type { ComponentChildren } from 'preact';
import { IconPencil } from '@tabler/icons-preact';
// #endregion

// #region Types
export interface TicketInlineFieldProps {
	/** Field label shown above both the read and edit presentations. */
	label: string;
	/** Whether the active editable presentation is currently shown. */
	editing: boolean;
	/** Whether the viewer may enter edit mode (e.g. false once a freelancer has claimed the ticket). */
	editable: boolean;
	/** Enter edit mode for this field. */
	onEnterEdit: () => void;
	/** Read-only presentation (shown when not editing). */
	read: ComponentChildren;
	/** Active editable field (shown when editing). */
	edit: ComponentChildren;
	/** Optional helper text rendered beneath the field. */
	hint?: string;
}
// #endregion

/**
 * @function TicketInlineField
 * @description Swaps a read-only value for an editable field on click when editing is permitted.
 * @param {TicketInlineFieldProps} props - Label, edit state, and the read/edit presentations.
 * @returns {import('preact').JSX.Element}
 */
export function TicketInlineField(
	{ label, editing, editable, onEnterEdit, read, edit, hint }: TicketInlineFieldProps,
) {
	return (
		<div class={`ticket-inline ${editing ? 'ticket-inline--editing' : ''}`}>
			<span class='ticket-inline__label'>{label}</span>

			{editing ? <div class='ticket-inline__edit'>{edit}</div> : (
				<div
					class={`ticket-inline__read ${editable ? 'ticket-inline__read--editable' : ''}`}
					role={editable ? 'button' : undefined}
					tabIndex={editable ? 0 : undefined}
					aria-label={editable ? `Edit ${label}` : undefined}
					onClick={editable ? onEnterEdit : undefined}
					onKeyDown={editable
						? (e: KeyboardEvent) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								onEnterEdit();
							}
						}
						: undefined}
				>
					<div class='ticket-inline__value'>{read}</div>
					{editable && <IconPencil size={14} class='ticket-inline__pencil' aria-hidden='true' />}
				</div>
			)}

			{hint && <span class='ticket-inline__hint'>{hint}</span>}
		</div>
	);
}
