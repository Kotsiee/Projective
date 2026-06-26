/**
 * @file StagesService.ts
 * @description Frontend Service layer for Project Stages.
 */
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
}
