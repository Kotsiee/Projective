/**
 * @file attachments.tsx
 * @description Direct-navigation entry for a ticket's Attachments view. Renders the standard board
 * canvas with the full-screen Ticket Modal pre-opened on the Attachments tab (spec §3).
 */
import { define } from '@utils';
import ProjectBoardIsland from '@features/dashboard/projects/islands/project/Board.tsx';

export default define.page(function TicketAttachmentsRoute(ctx) {
	return (
		<ProjectBoardIsland
			initialTicketId={ctx.params.ticketid}
			initialTab='attachments'
		/>
	);
});
