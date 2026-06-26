/**
 * @file TicketsServiceBackend.ts
 * @description Backend service layer for Ticket operations.
 */
import { supabaseClient } from '@projective/backend';

export class TicketsServiceBackend {
	static async createTicket(projectId: string, data: { title: string; description?: any }) {
		const supabase = await supabaseClient();

		const { data: newTicket, error } = await supabase
			.schema('projects')
			.from('tickets')
			.insert({
				project_id: projectId,
				title: data.title,
				description: data.description || {},
				status: 'backlog',
				// Purchase blocked flags can be computed fields: if description == {}, purchasable = false
			})
			.select()
			.single();

		if (error) throw error;
		return newTicket;
	}

	static async updateTicket(projectId: string, ticketId: string, data: any) {
		const supabase = await supabaseClient();

		// 1. Check if claimed
		const { data: currentTicket } = await supabase
			.schema('projects')
			.from('tickets')
			.select('current_assignee_id')
			.eq('id', ticketId)
			.single();

		if (currentTicket?.current_assignee_id) {
			throw new Error('Cannot edit a ticket that has already been claimed by a freelancer.');
		}

		// 2. Update
		const { data: updated, error } = await supabase
			.schema('projects')
			.from('tickets')
			.update({
				...data,
				updated_at: new Date().toISOString(),
			})
			.eq('id', ticketId)
			.select()
			.single();

		if (error) throw error;
		return updated;
	}

	static async deleteTicket(projectId: string, ticketId: string) {
		const supabase = await supabaseClient();

		const { data: ticket } = await supabase
			.schema('projects')
			.from('tickets')
			.select('current_assignee_id, status')
			.eq('id', ticketId)
			.single();

		if (ticket?.current_assignee_id) {
			// Freelancer has claimed it. Delete releases escrow to Freelancer.
			// Client's payment has already been taken out, so they don't get a refund here.
			// await FinanceServiceBackend.releaseTicketEscrowToFreelancer(ticketId);
		} else {
			// Ticket not claimed. Delete and potentially refund/void invoice.
			// await FinanceServiceBackend.refundTicketEscrow(ticketId);
		}

		const { error } = await supabase.schema('projects').from('tickets').delete().eq('id', ticketId);
		if (error) throw error;
		return { success: true };
	}

	static async reportTicket(projectId: string, ticketId: string) {
		const supabase = await supabaseClient();

		// Sets a dispute flag that hides it from the UI for 48 hours
		const { error } = await supabase
			.schema('projects')
			.from('tickets')
			.update({
				status: 'disputed', // or custom flag 'workload_dispute_active: true'
				// update internal timestamp for 48hr penalty timer
			})
			.eq('id', ticketId);

		if (error) throw error;
		return { success: true };
	}

	static async purchaseTicket(projectId: string, ticketId: string, method: string) {
		const supabase = await supabaseClient();

		// 1. Verify description exists
		const { data: ticket } = await supabase
			.schema('projects')
			.from('tickets')
			.select('description')
			.eq('id', ticketId)
			.single();

		if (!ticket?.description || Object.keys(ticket.description).length === 0) {
			throw new Error('A detailed description is required before purchasing a ticket.');
		}

		// 2. Route to finance mechanisms (Basket / Buy Now / Invoice)
		// await FinanceServiceBackend.initiateTicketPurchase(ticketId, method);

		return { success: true, method };
	}
}
