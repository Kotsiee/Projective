/**
 * @file finance.tsx
 * @description Direct-navigation entry for a ticket's finances. The financial breakdown is now the
 * always-on Installment Monitor sidebar (spec §2), so this legacy path simply opens the ticket modal
 * on its Details tab — the escrow breakdown is visible alongside regardless of tab.
 */
import { define } from '@utils';
import ProjectBoardIsland from '@features/dashboard/projects/islands/project/Board.tsx';

export default define.page(function TicketFinanceRoute(ctx) {
	return (
		<ProjectBoardIsland
			initialTicketId={ctx.params.ticketid}
			initialTab='details'
		/>
	);
});
