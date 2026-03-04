/**
 * @file projects.ts
 * @description Frontend Service layer for Project Dashboard interactions.
 * Handles API calls to /api/v1/dashboard/projects/*
 */

import { ProjectDetails, ProjectsFilterParams } from '../contracts/Projects.ts';

export class ProjectsService {
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
		// Construct query params safely
		const queryParams = new URLSearchParams(params as any).toString();
		const res = await fetch(`/api/v1/dashboard/projects?${queryParams}`);

		if (!res.ok) throw new Error(`Failed to fetch dashboard projects: ${res.statusText}`);
		return await res.json();
	}

	/**
	 * Fetches details for a specific project stage.
	 */
	static async getStage(projectId: string, stageId: string): Promise<any> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/stages/${stageId}`);
		if (!res.ok) throw new Error(`Failed to fetch project stage: ${res.statusText}`);
		return await res.json();
	}

	/**
	 * Creates a new project with optional files.
	 */
	static async createProject(
		data: any,
		targetStatus: string,
		files?: { thumbnail?: File; attachments?: File[] },
	): Promise<any> {
		// Since you are uploading files, you likely need a FormData payload rather than standard JSON
		const formData = new FormData();
		formData.append('data', JSON.stringify(data));
		formData.append('targetStatus', targetStatus);

		if (files?.thumbnail) {
			formData.append('thumbnail', files.thumbnail);
		}

		if (files?.attachments) {
			files.attachments.forEach((file) => {
				formData.append('attachments', file);
			});
		}

		const res = await fetch(`/api/v1/dashboard/projects`, {
			method: 'POST',
			body: formData, // Notice: Don't set Content-Type header manually when using FormData
		});

		if (!res.ok) throw new Error(`Failed to create project: ${res.statusText}`);
		return await res.json();
	}

	/**
	 * Updates the project status (e.g., Active -> Completed)
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
