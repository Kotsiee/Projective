import '../../styles/components/new/ticket-modal.css';

export function TicketModal() {
	return (
		<div class='ticket-modal'>
			<div class='ticket-modal__header'>
				<div class='ticket-modal__header-status'>
				</div>
				<div class='ticket-modal__header-title'>
				</div>
				<div class='ticket-modal__header-meta'>
					Created, Created By, (if multiple project owners i.e., a business), Updated, Updated By,
					Due (if any), Total Cost, Workload Intensity
				</div>
			</div>

			<div class='ticket-modal__body'>
				<div class='ticket-modal__body-view-mode'>
					Details Attachments Financial Breakdown (Client only) - Shows full breakdown of costs,
					including internal costs, profit margins, and any other financial details relevant to the
					ticket.
				</div>

				<div class='ticket-modal__content'>
					<div class='ticket-modal__content-description'>
					</div>
					<div class='ticket-modal__content-stages'>
						Stage breakdown showing all stages, their current status, and any relevant details or
						notes for each stage. This section provides a clear overview / timeline of the ticket's
						progress through its lifecycle. Details include: Stage name, status, assigned team
						members, start and end dates, and cost.
					</div>
				</div>
			</div>
		</div>
	);
}
