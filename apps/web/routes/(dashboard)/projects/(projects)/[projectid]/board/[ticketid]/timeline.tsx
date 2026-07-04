/**
 * @file timeline.tsx
 * @description Direct-navigation entry for a ticket's Timeline view. Renders the standard board
 * canvas with the Ticket Modal pre-opened on the Timeline tab (spec §2, direct navigation entry).
 */
import { define } from '@utils';
import ProjectBoardIsland from '@features/dashboard/projects/islands/project/Board.tsx';

export default define.page(function TicketTimelineRoute(ctx) {
	return (
		<ProjectBoardIsland
			initialTicketId={ctx.params.ticketid}
			initialTab='timeline'
		/>
	);
});
