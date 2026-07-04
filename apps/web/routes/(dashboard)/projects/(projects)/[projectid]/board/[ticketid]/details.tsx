/**
 * @file details.tsx
 * @description Direct-navigation entry for a ticket's Details view. Renders the standard board
 * canvas with the full-screen Ticket Modal pre-opened over it (spec §3, direct navigation entry).
 */
import { define } from '@utils';
import ProjectBoardIsland from '@features/dashboard/projects/islands/project/Board.tsx';

export default define.page(function TicketDetailsRoute(ctx) {
	return (
		<ProjectBoardIsland
			initialTicketId={ctx.params.ticketid}
			initialTab='details'
		/>
	);
});
