/**
 * @file ProjectsService.ts
 * @description Frontend Service layer for Project Dashboard interactions.
 * Handles API calls to /api/v1/dashboard/projects/*
 */

// #region Imports
// deno-lint-ignore-file no-explicit-any
import { ProjectDetails, ProjectsFilterParams } from '../contracts/Projects.ts';
import { getCsrfToken } from '@projective/utils'; // Assumed import path for your CSRF utility
// #endregion

export class ProjectsService {
	// #region Query Operations
	/**
	 * Fetches full details for a specific project.
	 */
	static async getProjectDetails(projectId: string): Promise<ProjectDetails> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}`);
		if (!res.ok) throw new Error(`Failed to fetch project: ${res.statusText}`);
		return (await res.json()) as ProjectDetails;
	}

	/**
	 * Fetches a list of dashboard projects based on filters.
	 */
	static async getDashboardProjects(params: ProjectsFilterParams): Promise<any> {
		const queryParams = new URLSearchParams(params as any).toString();
		const res = await fetch(`/api/v1/dashboard/projects?${queryParams}`);

		if (!res.ok) throw new Error(`Failed to fetch dashboard projects: ${res.statusText}`);
		return await res.json();
	}
	// #endregion

	// #region Mutations
	/**
	 * Creates a new project in a draft/scoping state.
	 */
	static async createProject(data: any, files?: { attachments?: File[] }): Promise<any> {
		const formData = new FormData();
		formData.append('payload', JSON.stringify(data));

		if (files?.attachments) {
			files.attachments.forEach((file) => {
				formData.append('attachments', file);
			});
		}

		const csrf = getCsrfToken();
		if (!csrf) console.warn('[Projective] CSRF token is missing from the client environment.');

		const res = await fetch(`/api/v1/dashboard/projects/new/publish`, {
			method: 'POST',
			headers: {
				'X-CSRF': csrf || '',
			},
			body: formData,
		});

		if (!res.ok) {
			const errData = await res.json().catch(() => ({}));
			throw new Error(errData.error?.message || `Failed to create project: ${res.statusText}`);
		}

		return await res.json();
	}

	/**
	 * Updates the project status (e.g., draft -> active)
	 */
	static async updateStatus(projectId: string, status: string): Promise<void> {
		const csrf = getCsrfToken();

		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/status`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRF': csrf || '',
			},
			body: JSON.stringify({ status }),
		});

		if (!res.ok) throw new Error(`Failed to update project status: ${res.statusText}`);
	}
	// #endregion

	/**
	 * Creates a new stage within an existing project.
	 */
	static async createStage(projectId: string, data: any): Promise<any> {
		const csrf = getCsrfToken();

		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/stages`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRF': csrf || '',
			},
			body: JSON.stringify(data),
		});

		if (!res.ok) {
			const errData = await res.json().catch(() => ({}));
			throw new Error(errData.error?.message || `Failed to create stage: ${res.statusText}`);
		}

		return await res.json();
	}
}
