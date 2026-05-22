/**
 * @file ProjectsService.ts
 * @description Frontend Service layer for Project Dashboard interactions.
 * Handles API calls to /api/v1/dashboard/projects/*
 */

// #region Imports
import { ProjectDetails, ProjectsFilterParams } from '../contracts/Projects.ts';
// #endregion

// #region Service Definition
export class ProjectsService {
	/**
	 * Fetches full details for a specific project.
	 * @param {string} projectId The UUID of the project.
	 * @returns {Promise<ProjectDetails>} The full project details.
	 */
	static async getProjectDetails(projectId: string): Promise<ProjectDetails> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}`);
		if (!res.ok) throw new Error(`Failed to fetch project: ${res.statusText}`);
		return (await res.json()) as ProjectDetails;
	}

	/**
	 * Fetches a list of dashboard projects based on filters.
	 * @param {ProjectsFilterParams} params The filtering and pagination parameters.
	 * @returns {Promise<any>} The paginated list of projects.
	 */
	// deno-lint-ignore no-explicit-any
	static async getDashboardProjects(params: ProjectsFilterParams): Promise<any> {
		const queryParams = new URLSearchParams(params as any).toString();
		const res = await fetch(`/api/v1/dashboard/projects?${queryParams}`);

		if (!res.ok) throw new Error(`Failed to fetch dashboard projects: ${res.statusText}`);
		return await res.json();
	}

	/**
	 * Fetches details for a specific project stage.
	 * @param {string} projectId The UUID of the project.
	 * @param {string} stageId The UUID of the stage.
	 * @returns {Promise<any>} The stage details.
	 */
	// deno-lint-ignore no-explicit-any
	static async getStage(projectId: string, stageId: string): Promise<any> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/stages/${stageId}`);
		if (!res.ok) throw new Error(`Failed to fetch project stage: ${res.statusText}`);
		return await res.json();
	}

	/**
	 * Creates a new project with optional files.
	 * @param {any} data The JSON payload containing the project configuration.
	 * @param {string} targetStatus The intended status upon creation (e.g., 'active' or 'draft').
	 * @param {Object} [files] Optional file attachments.
	 * @param {File[]} [files.attachments] Global project attachments.
	 * @returns {Promise<any>} The created project response.
	 */
	static async createProject(
		// deno-lint-ignore no-explicit-any
		data: any,
		targetStatus: string,
		files?: { attachments?: File[] },
	): Promise<any> {
		const formData = new FormData();
		formData.append('data', JSON.stringify(data));
		formData.append('targetStatus', targetStatus);

		if (files?.attachments) {
			files.attachments.forEach((file) => {
				formData.append('attachments', file);
			});
		}

		const res = await fetch(`/api/v1/dashboard/projects`, {
			method: 'POST',
			body: formData,
		});

		if (!res.ok) throw new Error(`Failed to create project: ${res.statusText}`);
		return await res.json();
	}

	/**
	 * Updates the project status (e.g., Active -> Completed)
	 * @param {string} projectId The UUID of the project.
	 * @param {string} status The new status string.
	 * @returns {Promise<void>}
	 */
	static async updateStatus(projectId: string, status: string): Promise<void> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/status`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status }),
		});

		if (!res.ok) throw new Error(`Failed to update status: ${res.statusText}`);
	}
}
// #endregion
