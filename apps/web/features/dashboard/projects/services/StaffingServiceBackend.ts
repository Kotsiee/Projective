/**
 * @file StaffingServiceBackend.ts
 * @description Backend service layer for US-004 · Stage Staffing & Assignment. Replaces the former
 * frontend-only open-seat / applications mock with real persistence via the `projects.*` staffing
 * RPCs (0307):
 *   • get_stage_staffing        — read the seats (+ required skills + applicants) and assignments.
 *   • create_stage_open_seat    — the client defines an open seat and its required skills (AC1).
 *   • apply_to_seat             — a freelancer or (lead-gated) team submits an application (AC2/AC3).
 *   • assign_from_application    — the client atomically accepts an application → stage_assignment,
 *                                  guarded against double-booking overlapping slots (AC4/AC5/AC6).
 *
 * Thin routes / fat service: all authority + conflict logic lives in SQL. Per the telemetry mandate
 * every path emits structured `[STAFFING_SVC]` checkpoints.
 */
import { supabaseClient } from '@projective/backend';

// #region Types
export interface CreateSeatInput {
	stageId: string;
	description: string;
	budgetMinCents?: number | null;
	budgetMaxCents?: number | null;
	requireProposals?: boolean;
	/** Ids of `org.skills` rows required for the seat. */
	skillIds?: string[];
}

export type ApplicantType = 'freelancer' | 'team';

export interface ApplyToSeatInput {
	seatId: string;
	applicantType: ApplicantType;
	/** The freelancer user id, or the team id, depending on applicantType. */
	applicantProfileId: string;
	message?: string | null;
}
// #endregion

export class StaffingServiceBackend {
	/**
	 * Reads the staffing surface for a stage — seats (with required skills + applicants) and the
	 * current assignments. Guarded by has_project_access inside the RPC.
	 */
	static async getStageStaffing(projectId: string, stageId: string, req?: Request) {
		const startedAt = Date.now();
		const supabase = await supabaseClient(req);

		console.log(`[STAFFING_SVC] getStageStaffing begin project=${projectId} stage=${stageId}`);

		const { data, error } = await supabase
			.schema('projects')
			.rpc('get_stage_staffing', { p_project_id: projectId, p_stage_id: stageId });

		if (error) {
			console.error(
				`[STAFFING_SVC] getStageStaffing FAILED project=${projectId} stage=${stageId} msg=${error.message} duration_ms=${
					Date.now() - startedAt
				}`,
			);
			throw error;
		}

		console.log(
			`[STAFFING_SVC] getStageStaffing ok project=${projectId} stage=${stageId} duration_ms=${
				Date.now() - startedAt
			}`,
		);
		return data;
	}

	/**
	 * Defines an open seat (+ required skills) on a stage. Owner-only (enforced in SQL). (AC1)
	 */
	static async createSeat(projectId: string, input: CreateSeatInput, req?: Request) {
		const startedAt = Date.now();
		const supabase = await supabaseClient(req);

		console.log(
			`[STAFFING_SVC] createSeat begin project=${projectId} stage=${input.stageId} skills=${
				input.skillIds?.length ?? 0
			}`,
		);

		const { data, error } = await supabase
			.schema('projects')
			.rpc('create_stage_open_seat', {
				p_stage_id: input.stageId,
				p_description: input.description,
				p_budget_min_cents: input.budgetMinCents ?? null,
				p_budget_max_cents: input.budgetMaxCents ?? null,
				p_require_proposals: input.requireProposals ?? true,
				p_skill_ids: input.skillIds ?? [],
			});

		if (error) {
			console.error(
				`[STAFFING_SVC] createSeat FAILED project=${projectId} stage=${input.stageId} code=${
					error.code ?? '-'
				} msg=${error.message} duration_ms=${Date.now() - startedAt}`,
			);
			throw error;
		}

		console.log(
			`[STAFFING_SVC] createSeat ok project=${projectId} stage=${input.stageId} duration_ms=${
				Date.now() - startedAt
			}`,
		);
		return data;
	}

	/**
	 * Submits an application to an open seat. A team application is gated to team leads in SQL;
	 * a freelancer application must be for the caller's own profile. (AC2/AC3)
	 */
	static async apply(projectId: string, input: ApplyToSeatInput, req?: Request) {
		const startedAt = Date.now();
		const supabase = await supabaseClient(req);

		console.log(
			`[STAFFING_SVC] apply begin project=${projectId} seat=${input.seatId} type=${input.applicantType}`,
		);

		const { data, error } = await supabase
			.schema('projects')
			.rpc('apply_to_seat', {
				p_seat_id: input.seatId,
				p_applicant_type: input.applicantType,
				p_applicant_profile_id: input.applicantProfileId,
				p_message: input.message ?? null,
			});

		if (error) {
			console.error(
				`[STAFFING_SVC] apply FAILED project=${projectId} seat=${input.seatId} code=${
					error.code ?? '-'
				} msg=${error.message} duration_ms=${Date.now() - startedAt}`,
			);
			throw error;
		}

		console.log(
			`[STAFFING_SVC] apply ok project=${projectId} seat=${input.seatId} duration_ms=${
				Date.now() - startedAt
			}`,
		);
		return data;
	}

	/**
	 * Atomically accepts an application and binds the applicant to the seat's stage. Owner-only;
	 * rejects double-booking of overlapping active slots (enforced in SQL). (AC4/AC5/AC6)
	 */
	static async assignFromApplication(projectId: string, applicationId: string, req?: Request) {
		const startedAt = Date.now();
		const supabase = await supabaseClient(req);

		console.log(`[STAFFING_SVC] assign begin project=${projectId} application=${applicationId}`);

		const { data, error } = await supabase
			.schema('projects')
			.rpc('assign_from_application', { p_application_id: applicationId });

		if (error) {
			console.error(
				`[STAFFING_SVC] assign FAILED project=${projectId} application=${applicationId} code=${
					error.code ?? '-'
				} msg=${error.message} duration_ms=${Date.now() - startedAt}`,
			);
			throw error;
		}

		console.log(
			`[STAFFING_SVC] assign ok project=${projectId} application=${applicationId} duration_ms=${
				Date.now() - startedAt
			}`,
		);
		return data;
	}
}
