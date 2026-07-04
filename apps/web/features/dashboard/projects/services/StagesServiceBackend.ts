/**
 * @file StagesServiceBackend.ts
 * @description Backend service layer for Stage operations. Clients can create, rename, edit,
 * reorder and delete stages natively (spec §2D). Reorders preserve each column's internal ticket
 * array/order; deletions release escrow for running tickets and clear dependency references via
 * the `projects.delete_stage` RPC (0115_ticket_lifecycle_rpcs.sql).
 *
 * A request is threaded through so writes run under the caller's identity (RLS + auth.uid()).
 */
import { supabaseClient } from '@projective/backend';

export class StagesServiceBackend {
	// #region Create / Update
	/**
	 * Creates a stage, appended to the end of the pipeline.
	 *
	 * @param projectId - Owning project id.
	 * @param data - Stage payload (at minimum `name`).
	 * @param req - Caller request, for user-scoped RLS.
	 * @returns The newly created stage row.
	 */
	// deno-lint-ignore no-explicit-any
	static async createStage(projectId: string, data: any, req?: Request) {
		const supabase = await supabaseClient(req);

		const { data: stages } = await supabase
			.schema('projects')
			.from('project_stages')
			.select('sort_order')
			.eq('project_id', projectId)
			.order('sort_order', { ascending: false })
			.limit(1);

		const nextSortOrder = (stages?.[0]?.sort_order ?? -1) + 1;

		const { data: newStage, error } = await supabase
			.schema('projects')
			.from('project_stages')
			.insert({
				project_id: projectId,
				name: data.name,
				sort_order: nextSortOrder,
				description: data.description ?? {},
				description_text: data.description_text ?? '',
				skills: data.skills ?? [],
				file_upload_required: data.file_upload_required ?? false,
			})
			.select()
			.single();

		if (error) throw error;
		return newStage;
	}

	/**
	 * Renames or edits a stage's attributes in place.
	 *
	 * @param projectId - Owning project id.
	 * @param stageId - Stage to update.
	 * @param data - Partial stage patch (e.g. `{ name }`).
	 * @param req - Caller request, for user-scoped RLS.
	 * @returns The updated stage row.
	 */
	// deno-lint-ignore no-explicit-any
	static async updateStage(projectId: string, stageId: string, data: any, req?: Request) {
		const supabase = await supabaseClient(req);
		const { data: updated, error } = await supabase
			.schema('projects')
			.from('project_stages')
			.update(data)
			.eq('id', stageId)
			.eq('project_id', projectId)
			.select()
			.single();

		if (error) throw error;
		return updated;
	}
	// #endregion

	// #region Reorder
	/**
	 * Reorders stages atomically via `projects.reorder_stages`. Ticket sort order is independent
	 * of stage order, so each column's internal ticket array/order is preserved (spec §2D).
	 *
	 * @param projectId - Owning project id.
	 * @param orderedIds - Stage ids in their new left-to-right order.
	 * @param req - Caller request, for user-scoped RLS.
	 */
	static async reorderStages(projectId: string, orderedIds: string[], req?: Request) {
		const supabase = await supabaseClient(req);
		const { error } = await supabase
			.schema('projects')
			.rpc('reorder_stages', { p_project_id: projectId, p_ordered_ids: orderedIds });
		if (error) throw error;
		return { success: true };
	}
	// #endregion

	// #region Delete
	/**
	 * Deletes a stage via `projects.delete_stage` (spec §2D):
	 *   • Releases escrow for every actively-claimed ticket in the stage.
	 *   • Returns those tickets to the backlog pool.
	 *   • Clears the stage from all tickets' `required_stages` dependency arrays and from any
	 *     sibling stage's start-dependency reference.
	 *
	 * A stage that carries escrow history cannot be hard-deleted (finance audit trail is
	 * `ON DELETE RESTRICT`); the RPC releases funds and raises a clear error asking the caller to
	 * archive it instead.
	 *
	 * @param projectId - Owning project id.
	 * @param stageId - Stage to delete.
	 * @param req - Caller request, for user-scoped RLS.
	 */
	static async deleteStage(projectId: string, stageId: string, req?: Request) {
		const supabase = await supabaseClient(req);
		const { error } = await supabase
			.schema('projects')
			.rpc('delete_stage', { p_project_id: projectId, p_stage_id: stageId });
		if (error) throw error;
		return { success: true };
	}
	// #endregion
}
