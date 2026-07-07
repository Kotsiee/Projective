/**
 * @file ProjectLifecycleService.ts
 * @description Frontend Service layer for Project Lifecycle transitions (spec §3). Islands stay dumb
 * and call this over `fetch`; it hits the `/status` route which delegates to the guarded RPC. Errors
 * emitted by the telemetry engine are surfaced verbatim so client error boundaries can log them.
 */
// deno-lint-ignore-file no-explicit-any
import { getCsrfToken } from '@projective/utils';

export type ProjectStatus = 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export interface StatusHistoryEntry {
	id: string;
	from_status: ProjectStatus | null;
	to_status: ProjectStatus;
	reason: string | null;
	actor_user_id: string;
	created_at: string;
}

export class ProjectLifecycleService {
	/**
	 * Transitions a project to a new lifecycle status. Rejects (throws) on illegal transitions with
	 * the RPC's descriptive error (e.g. "A project needs at least one stage before it can be activated").
	 */
	static async setStatus(
		projectId: string,
		status: ProjectStatus,
		reason: string | null = null,
	): Promise<{ status: ProjectStatus }> {
		console.log(`[PROJECT_LIFECYCLE_CLIENT] setStatus project=${projectId} to=${status}`);
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/status`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
			body: JSON.stringify({ status, reason }),
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({} as any));
			const msg = err?.error?.message || err?.error || `Failed to change project status`;
			console.error(
				`[PROJECT_LIFECYCLE_CLIENT] setStatus FAILED project=${projectId} to=${status} msg=${msg}`,
			);
			throw new Error(msg);
		}
		return await res.json();
	}

	/** Loads the project's lifecycle transition history. */
	static async getStatusHistory(projectId: string): Promise<StatusHistoryEntry[]> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/status`);
		if (!res.ok) {
			const err = await res.json().catch(() => ({} as any));
			throw new Error(err?.error?.message || err?.error || `Failed to load status history`);
		}
		return await res.json();
	}
}
