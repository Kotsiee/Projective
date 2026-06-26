/**
 * @file StagesServiceBackend.ts
 * @description Backend service layer for Stage operations.
 */
import { supabaseClient } from '@projective/backend';

export class StagesServiceBackend {
	static async createStage(projectId: string, data: any) {
		const supabase = await supabaseClient();

		// 1. Find the highest sort_order
		const { data: stages } = await supabase
			.schema('projects')
			.from('project_stages')
			.select('sort_order')
			.eq('project_id', projectId)
			.order('sort_order', { ascending: false })
			.limit(1);

		const nextSortOrder = (stages?.[0]?.sort_order ?? -1) + 1;

		// 2. Insert
		const { data: newStage, error } = await supabase
			.schema('projects')
			.from('project_stages')
			.insert({
				project_id: projectId,
				name: data.name,
				sort_order: nextSortOrder,
				// ... map other stage fields ...
			})
			.select()
			.single();

		if (error) throw error;
		return newStage;
	}

	static async reorderStages(projectId: string, orderedIds: string[]) {
		const supabase = await supabaseClient();
		// Supabase doesn't support bulk upsert easily with standard clients without an RPC.
		// For safety, iterate and update.
		for (let i = 0; i < orderedIds.length; i++) {
			await supabase
				.schema('projects')
				.from('project_stages')
				.update({ sort_order: i })
				.eq('id', orderedIds[i])
				.eq('project_id', projectId);
		}
		return { success: true };
	}

	static async deleteStage(projectId: string, stageId: string) {
		const supabase = await supabaseClient();

		// 1. Release escrow for any tickets CURRENTLY in this stage
		const { data: activeTickets } = await supabase
			.schema('projects')
			.from('tickets')
			.select('id, current_assignee_id')
			.eq('current_stage_id', stageId)
			.not('current_assignee_id', 'is', null);

		if (activeTickets && activeTickets.length > 0) {
			// Trigger Finance Escrow Release Logic Here
			// e.g., FinanceServiceBackend.releaseEscrows(activeTickets.map(t => t.id));
		}

		// 2. Remove this stage from the JSONB required_stages array of ALL tickets in the project
		// Note: In production, this is best done via a Postgres Trigger or RPC function for performance.

		// 3. Delete the stage
		const { error } = await supabase
			.schema('projects')
			.from('project_stages')
			.delete()
			.eq('id', stageId)
			.eq('project_id', projectId);

		if (error) throw error;
		return { success: true };
	}
}
