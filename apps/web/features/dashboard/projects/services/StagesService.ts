/**
 * @file StagesService.ts
 * @description Frontend Service layer for Project Stages.
 */
// deno-lint-ignore-file no-explicit-any
import { getCsrfToken } from '@projective/utils';

export class StagesService {
	static async createStage(projectId: string, data: any): Promise<any> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/stages`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error(`Failed to create stage: ${res.statusText}`);
		return await res.json();
	}

	static async updateStage(projectId: string, stageId: string, data: any): Promise<any> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/stages/${stageId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error(`Failed to update stage: ${res.statusText}`);
		return await res.json();
	}

	static async reorderStages(projectId: string, orderedStageIds: string[]): Promise<void> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/stages/reorder`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
			body: JSON.stringify({ orderedIds: orderedStageIds }),
		});
		if (!res.ok) throw new Error(`Failed to reorder stages: ${res.statusText}`);
	}

	static async deleteStage(projectId: string, stageId: string): Promise<void> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/stages/${stageId}`, {
			method: 'DELETE',
			headers: { 'X-CSRF': getCsrfToken() || '' },
		});
		if (!res.ok) throw new Error(`Failed to delete stage: ${res.statusText}`);
	}

	// #region Assignment routing (spec §"Assignment Modes")
	/** Sets how the stage distributes work (owner-only, SQL-enforced). */
	static async setAssignmentMode(
		projectId: string,
		stageId: string,
		mode: 'open_pull' | 'round_robin' | 'manual' | 'parallel_stream',
	): Promise<any> {
		const res = await fetch(
			`/api/v1/dashboard/projects/${projectId}/stages/${stageId}/assignment-mode`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
				body: JSON.stringify({ mode }),
			},
		);
		if (!res.ok) {
			const err = await res.json().catch(() => ({} as any));
			throw new Error(err?.error?.message || err?.error || 'Failed to set assignment mode');
		}
		return await res.json();
	}

	/** Runs the stage's automatic routing pass (round-robin: next ticket; parallel-stream: fan out). */
	static async autoAssign(
		projectId: string,
		stageId: string,
		mode: 'round_robin' | 'parallel_stream',
	): Promise<{ mode: string; assigned: any }> {
		const res = await fetch(
			`/api/v1/dashboard/projects/${projectId}/stages/${stageId}/auto-assign`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
				body: JSON.stringify({ mode }),
			},
		);
		if (!res.ok) {
			const err = await res.json().catch(() => ({} as any));
			throw new Error(err?.error?.message || err?.error || 'Failed to auto-assign');
		}
		return await res.json();
	}
	// #endregion

	// #region Finance — fund / approve / fair-exit (US-005, US-007)
	static async getStageFinance(projectId: string, stageId: string): Promise<any> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/stages/${stageId}/finance`);
		if (!res.ok) {
			const err = await res.json().catch(() => ({} as any));
			throw new Error(err?.error?.message || err?.error || 'Failed to load stage finance');
		}
		return await res.json();
	}

	static async fundStage(projectId: string, stageId: string): Promise<any> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/stages/${stageId}/fund`, {
			method: 'POST',
			headers: { 'X-CSRF': getCsrfToken() || '' },
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({} as any));
			throw new Error(err?.error?.message || err?.error || 'Failed to fund stage');
		}
		return await res.json();
	}

	static async approveStage(projectId: string, stageId: string): Promise<any> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/stages/${stageId}/approve`, {
			method: 'POST',
			headers: { 'X-CSRF': getCsrfToken() || '' },
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({} as any));
			throw new Error(err?.error?.message || err?.error || 'Failed to approve stage');
		}
		return await res.json();
	}

	static async cancelStageFairExit(projectId: string, stageId: string, tier: number): Promise<any> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/stages/${stageId}/cancel`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
			body: JSON.stringify({ tier }),
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({} as any));
			throw new Error(err?.error?.message || err?.error || 'Failed to cancel stage');
		}
		return await res.json();
	}
	// #endregion
}
