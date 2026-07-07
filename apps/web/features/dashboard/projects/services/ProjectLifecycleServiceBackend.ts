/**
 * @file ProjectLifecycleServiceBackend.ts
 * @description Backend service layer for Project Lifecycle state transitions (spec §3 "Project
 * Mutations Handler"). Wraps the guarded `projects.set_project_status` RPC (0119) which enforces the
 * rigid activation/completion pre-conditions and records the transition to the status-history ledger.
 *
 * The `finance`/state-machine logic lives in SQL; this layer parses, threads the caller request for
 * RLS, and — per the telemetry mandate — emits structured `[PROJECT_LIFECYCLE_SVC]` checkpoints
 * (timestamp, project id, old→new state, duration) around every mutation.
 */
import { supabaseClient } from '@projective/backend';

/** Lifecycle states a project can be driven to (mirrors the `project_status` enum). */
export type ProjectStatus = 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export class ProjectLifecycleServiceBackend {
	/**
	 * Transitions a project to a new lifecycle status. Delegates validation + history logging to
	 * `projects.set_project_status`; the RPC rejects illegal transitions (e.g. activating a project
	 * with no stages, or completing one with open tickets / unsettled escrow).
	 *
	 * @param projectId - Project being transitioned.
	 * @param toStatus - Target lifecycle status.
	 * @param reason - Optional human-readable reason recorded on the history ledger.
	 * @param req - Caller request, for user-scoped RLS (owner check runs inside the RPC).
	 * @returns `{ status }` — the applied status.
	 */
	static async setStatus(
		projectId: string,
		toStatus: ProjectStatus,
		reason: string | null,
		req?: Request,
	) {
		const startedAt = Date.now();
		const supabase = await supabaseClient(req);

		// Capture the prior state purely for the telemetry checkpoint (RLS-scoped read).
		const { data: before } = await supabase
			.schema('projects')
			.from('projects')
			.select('status')
			.eq('id', projectId)
			.single();

		console.log(
			`[PROJECT_LIFECYCLE_SVC] setStatus begin ts=${
				new Date().toISOString()
			} project=${projectId} from=${before?.status ?? 'unknown'} to=${toStatus} reason=${
				reason ?? '-'
			}`,
		);

		const { data, error } = await supabase
			.schema('projects')
			.rpc('set_project_status', {
				p_project_id: projectId,
				p_to_status: toStatus,
				p_reason: reason,
			});

		if (error) {
			console.error(
				`[PROJECT_LIFECYCLE_SVC] setStatus FAILED project=${projectId} to=${toStatus} code=${
					error.code ?? '-'
				} msg=${error.message} duration_ms=${Date.now() - startedAt}`,
			);
			throw error;
		}

		console.log(
			`[PROJECT_LIFECYCLE_SVC] setStatus ok project=${projectId} from=${
				before?.status ?? 'unknown'
			} -> ${data} duration_ms=${Date.now() - startedAt}`,
		);
		return { status: data as ProjectStatus };
	}

	/**
	 * Returns the ordered transition history for a project (closure/audit surface).
	 *
	 * @param projectId - Project whose history is requested.
	 * @param req - Caller request, for user-scoped RLS.
	 */
	static async getStatusHistory(projectId: string, req?: Request) {
		const startedAt = Date.now();
		const supabase = await supabaseClient(req);

		console.log(`[PROJECT_LIFECYCLE_SVC] getStatusHistory project=${projectId}`);

		const { data, error } = await supabase
			.schema('projects')
			.from('project_status_history')
			.select('id, from_status, to_status, reason, actor_user_id, created_at')
			.eq('project_id', projectId)
			.order('created_at', { ascending: false });

		if (error) {
			console.error(
				`[PROJECT_LIFECYCLE_SVC] getStatusHistory FAILED project=${projectId} msg=${error.message} duration_ms=${
					Date.now() - startedAt
				}`,
			);
			throw error;
		}

		console.log(
			`[PROJECT_LIFECYCLE_SVC] getStatusHistory ok project=${projectId} rows=${
				data?.length ?? 0
			} duration_ms=${Date.now() - startedAt}`,
		);
		return data ?? [];
	}
}
