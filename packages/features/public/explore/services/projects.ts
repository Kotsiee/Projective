/**
 * @file projects.ts
 * @description Service layer for Project Dashboard interactions.
 * Handles API calls to /api/v1/dashboard/projects/*
 */

import { ProjectDetails } from '@contracts/dashboard/projects/Projects.ts';

export class ProjectsService {
	/**
	 * Fetches full details for a specific project.
	 * @param projectId - The UUID of the project.
	 * @returns Promise<ProjectDetails>
	 */
	static async getProjectDetails(projectId: string): Promise<ProjectDetails> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}`);

		if (!res.ok) {
			// You can expand this to handle 403 Forbidden / 404 Not Found specifically
			throw new Error(`Failed to fetch project: ${res.statusText}`);
		}

		const data = await res.json();
		return data as ProjectDetails;
	}

	/**
	 * (Optional) Example of another method you might need later
	 * Updates the project status (e.g., Active -> Completed)
	 */
	static async updateStatus(projectId: string, status: string): Promise<void> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/status`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status }),
		});

		if (!res.ok) {
			throw new Error(`Failed to update status: ${res.statusText}`);
		}
	}
}
