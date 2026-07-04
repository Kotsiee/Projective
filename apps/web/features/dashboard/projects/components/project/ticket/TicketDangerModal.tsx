/**
 * @file TicketDangerModal.tsx
 * @description High-contrast force-majeure confirmation overlay for ticket cancellation/deletion
 * (spec §5). Before the destructive payload runs, it spells out the legal and financial effects,
 * which differ by claim state:
 *   • Unclaimed ticket  -> a clean, immediate purge (no escrow, no charge).
 *   • Claimed ticket    -> an emergency escrow-release protocol pays 100% of the committed
 *     sub-escrow balance to the freelancer to compensate for blocked velocity bandwidth, leaving
 *     the client with zero active charges.
 *
 * The actual purge + escrow release is executed server-side by `projects.delete_ticket`
 * (0115_ticket_lifecycle_rpcs.sql) via `TicketsService.deleteTicket`; this component only confirms.
 */

// #region Imports
import '../../../styles/components/new/ticket-danger.css';
import { Button, Modal, ModalLayout } from '@projective/ui';
import { IconAlertTriangle } from '@tabler/icons-preact';
// #endregion

// #region Types
export interface TicketDangerModalProps {
	isOpen: boolean;
	/** Ticket display title, for the confirmation copy. */
	ticketTitle: string;
	/** Whether a freelancer has claimed the ticket (drives the escrow-release warning). */
	isClaimed: boolean;
	/** Disables the actions while the destructive request is in flight. */
	busy?: boolean;
	onClose: () => void;
	/** Execute the purge (async; parent calls the delete service and closes on success). */
	onConfirm: () => void;
}
// #endregion

/**
 * @function TicketDangerModal
 * @description Renders the claim-aware destructive confirmation overlay.
 * @param {TicketDangerModalProps} props - Open state, ticket context and confirm/cancel handlers.
 * @returns {import('preact').JSX.Element}
 */
export function TicketDangerModal(
	{ isOpen, ticketTitle, isClaimed, busy = false, onClose, onConfirm }: TicketDangerModalProps,
) {
	const heading = isClaimed ? 'Cancel this claimed ticket?' : 'Delete this ticket?';
	const confirmLabel = isClaimed ? 'Release escrow & cancel' : 'Delete ticket';

	return (
		<Modal isOpen={isOpen} onClose={onClose} title='Force Majeure Confirmation'>
			<ModalLayout
				footer={
					<>
						<Button variant='secondary' ghost onClick={onClose} disabled={busy}>
							Keep ticket
						</Button>
						<Button variant='danger' onClick={onConfirm} disabled={busy}>
							{busy ? 'Processing…' : confirmLabel}
						</Button>
					</>
				}
			>
				<div class={`ticket-danger ${isClaimed ? 'ticket-danger--escrow' : ''}`}>
					<div class='ticket-danger__icon' aria-hidden='true'>
						<IconAlertTriangle size={28} />
					</div>

					<h2 class='ticket-danger__title'>{heading}</h2>
					<p class='ticket-danger__lead'>
						You are about to remove{' '}
						<strong>“{ticketTitle}”</strong>. Review the effects below — this action cannot be
						undone.
					</p>

					{isClaimed
						? (
							<div class='ticket-danger__effect ticket-danger__effect--warn'>
								<span class='ticket-danger__effect-title'>
									Emergency escrow release protocol
								</span>
								<ul class='ticket-danger__list'>
									<li>
										A freelancer has already <strong>claimed</strong> this ticket.
									</li>
									<li>
										Canceling now releases{' '}
										<strong>
											100% of the committed sub-escrow installment balance
										</strong>{' '}
										to the freelancer, compensating them for the blocked velocity bandwidth.
									</li>
									<li>
										The ticket is then purged. You are left with{' '}
										<strong>zero active charges</strong> — no further installments will be billed.
									</li>
								</ul>
							</div>
						)
						: (
							<div class='ticket-danger__effect'>
								<span class='ticket-danger__effect-title'>Clean purge</span>
								<ul class='ticket-danger__list'>
									<li>
										This ticket is <strong>unclaimed</strong>, so no escrow is held against it.
									</li>
									<li>
										It will be <strong>purged immediately</strong>{' '}
										with no financial effect and no charge to your account.
									</li>
								</ul>
							</div>
						)}
				</div>
			</ModalLayout>
		</Modal>
	);
}
