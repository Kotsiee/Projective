/**
 * @file TicketActionsMenu.tsx
 * @description The ticket header's `…` context menu (spec §3). A Popover exposing: copy ticket link,
 * reassign (roster lookup), force-complete current stage, force-complete ticket, and delete. All
 * mutations run through the frontend {@link TicketsService}; the parent handles refresh via callbacks.
 */

// #region Imports
import { useSignal } from '@preact/signals';
import { Popover, toast } from '@projective/ui';
import {
	IconArrowRight,
	IconCircleCheck,
	IconDots,
	IconLink,
	IconTrash,
	IconUser,
	IconUserOff,
} from '@tabler/icons-preact';
import {
	RosterMember,
	TicketsService,
} from '@features/dashboard/projects/services/TicketsService.ts';
// #endregion

interface TicketActionsMenuProps {
	projectId: string;
	ticketId: string;
	/** Whether the ticket currently has an assignee (drives copy on the reassign action). */
	isClaimed: boolean;
	/** Called after any mutation that changes board/finance state, so the parent can reload. */
	onMutated?: () => void | Promise<void>;
	/** Opens the destructive delete/cancel confirmation (owned by the modal). */
	onRequestDelete: () => void;
}

/** Builds the clean, shareable ticket path (no query params). */
function ticketLink(projectId: string, ticketId: string): string {
	const origin = typeof globalThis !== 'undefined' && globalThis.location
		? globalThis.location.origin
		: '';
	return `${origin}/projects/${projectId}/board/${ticketId}/details`;
}

/** First initial for the fallback avatar. */
const initial = (name: string): string => (name.trim()[0] ?? '?').toUpperCase();

export function TicketActionsMenu(
	{ projectId, ticketId, isClaimed, onMutated, onRequestDelete }: TicketActionsMenuProps,
) {
	const isOpen = useSignal(false);
	const reassignOpen = useSignal(false);
	const busy = useSignal(false);

	// Roster picker state — fetched lazily the first time the reassign panel is opened.
	const roster = useSignal<RosterMember[] | null>(null);
	const rosterLoading = useSignal(false);
	const rosterError = useSignal<string | null>(null);
	const search = useSignal('');

	const close = () => {
		isOpen.value = false;
		reassignOpen.value = false;
		search.value = '';
	};

	const run = async (fn: () => Promise<unknown>, successMsg: string) => {
		if (busy.value) return;
		busy.value = true;
		try {
			await fn();
			toast.success(successMsg);
			await onMutated?.();
			close();
			// deno-lint-ignore no-explicit-any
		} catch (err: any) {
			toast.error(err?.message || 'Action failed.');
		} finally {
			busy.value = false;
		}
	};

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(ticketLink(projectId, ticketId));
			toast.success('Ticket link copied.');
			// deno-lint-ignore no-explicit-any
		} catch (_err: any) {
			toast.error('Could not copy the link.');
		}
		close();
	};

	/** Toggle the roster panel, lazily loading the roster on first open. */
	const toggleReassign = async () => {
		reassignOpen.value = !reassignOpen.value;
		if (!reassignOpen.value || roster.value !== null || rosterLoading.value) return;

		rosterLoading.value = true;
		rosterError.value = null;
		try {
			roster.value = await TicketsService.getProjectRoster(projectId);
			// deno-lint-ignore no-explicit-any
		} catch (err: any) {
			rosterError.value = err?.message || 'Could not load the roster.';
		} finally {
			rosterLoading.value = false;
		}
	};

	const reassignTo = (profileId: string | null) =>
		run(
			() => TicketsService.reassign(projectId, ticketId, profileId),
			profileId ? 'Ticket reassigned.' : 'Freelancer released; ticket returned to New.',
		);

	const query = search.value.trim().toLowerCase();
	const filtered = (roster.value ?? []).filter((m) => m.name.toLowerCase().includes(query));

	const menu = (
		<div class='tkt-menu'>
			<button type='button' class='tkt-menu__item' onClick={handleCopyLink}>
				<IconLink size={16} /> Copy ticket link
			</button>

			{/* Reassign — expands into a roster/assignee lookup. */}
			<button
				type='button'
				class='tkt-menu__item'
				aria-expanded={reassignOpen.value}
				onClick={toggleReassign}
			>
				<IconUser size={16} /> {isClaimed ? 'Reassign' : 'Assign'}
			</button>
			{reassignOpen.value && (
				<div class='tkt-menu__roster'>
					<input
						class='tkt-menu__reassign-input'
						type='text'
						placeholder='Search people…'
						value={search.value}
						onInput={(e) => (search.value = (e.target as HTMLInputElement).value)}
					/>

					{rosterLoading.value && <p class='tkt-menu__roster-status'>Loading roster…</p>}
					{rosterError.value && (
						<p class='tkt-menu__roster-status tkt-menu__roster-status--error'>
							{rosterError.value}
						</p>
					)}
					{!rosterLoading.value && !rosterError.value && filtered.length === 0 && (
						<p class='tkt-menu__roster-status'>
							{roster.value && roster.value.length > 0 ? 'No matches.' : 'No one to assign yet.'}
						</p>
					)}

					{filtered.length > 0 && (
						<div class='tkt-menu__roster-list'>
							{filtered.map((m) => (
								<button
									key={m.profile_id}
									type='button'
									class='tkt-menu__roster-item'
									disabled={busy.value}
									onClick={() => reassignTo(m.profile_id)}
								>
									<span class='tkt-menu__avatar'>{initial(m.name)}</span>
									<span class='tkt-menu__roster-name'>{m.name}</span>
									{m.role && <span class='tkt-menu__roster-role'>{m.role}</span>}
								</button>
							))}
						</div>
					)}

					{isClaimed && (
						<button
							type='button'
							class='tkt-menu__roster-item tkt-menu__roster-item--unassign'
							disabled={busy.value}
							onClick={() => reassignTo(null)}
						>
							<span class='tkt-menu__avatar tkt-menu__avatar--empty'>
								<IconUserOff size={14} />
							</span>
							<span class='tkt-menu__roster-name'>Unassign &amp; return to New</span>
						</button>
					)}
				</div>
			)}

			<div class='tkt-menu__divider' />

			<button
				type='button'
				class='tkt-menu__item'
				disabled={busy.value}
				onClick={() =>
					run(
						() => TicketsService.forceCompleteStage(projectId, ticketId),
						'Current stage completed.',
					)}
			>
				<IconArrowRight size={16} /> Force complete current stage
			</button>

			<button
				type='button'
				class='tkt-menu__item'
				disabled={busy.value}
				onClick={() =>
					run(
						() => TicketsService.forceCompleteTicket(projectId, ticketId),
						'Ticket completed; balances released.',
					)}
			>
				<IconCircleCheck size={16} /> Force complete ticket
			</button>

			<div class='tkt-menu__divider' />

			<button
				type='button'
				class='tkt-menu__item tkt-menu__item--danger'
				onClick={() => {
					close();
					onRequestDelete();
				}}
			>
				<IconTrash size={16} /> Delete ticket
			</button>
		</div>
	);

	return (
		<Popover
			isOpen={isOpen.value}
			onClose={close}
			position='bottom-right'
			trigger={
				<button
					type='button'
					class='tkt__icon-btn'
					aria-label='Ticket actions'
					aria-haspopup='menu'
					onClick={() => (isOpen.value = !isOpen.value)}
				>
					<IconDots size={20} />
				</button>
			}
			content={menu}
		/>
	);
}
