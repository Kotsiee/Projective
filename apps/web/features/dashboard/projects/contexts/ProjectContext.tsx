import { createContext } from 'preact';
import { useContext, useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { ComponentChildren } from 'preact';
import { ProjectDetails, ProjectState } from '../contracts/Projects.ts';
import { ProjectsService } from '../services/ProjectsService.ts';

const ProjectContext = createContext<ProjectState | null>(null);

export function ProjectProvider(
	{ id, children }: { id: string | undefined; children: ComponentChildren },
) {
	const projectId = useSignal(id);
	const project = useSignal<ProjectDetails | null>(null);
	const isLoading = useSignal(false);
	const error = useSignal<string | null>(null);

	if (projectId.value !== id) {
		projectId.value = id;
		project.value = null;
		error.value = null;
	}

	const fetchProject = async () => {
		if (!projectId.value) return;

		isLoading.value = true;
		error.value = null;

		try {
			const data = await ProjectsService.getProjectDetails(projectId.value);
			project.value = data;
			// deno-lint-ignore no-explicit-any
		} catch (err: any) {
			console.error('Project Fetch Error:', err);
			error.value = err.message || 'An unexpected error occurred.';
		} finally {
			isLoading.value = false;
		}
	};

	useEffect(() => {
		if (projectId.value) {
			fetchProject();
		}
	}, [projectId.value]);

	return (
		<ProjectContext.Provider
			value={{
				project_id: projectId,
				project,
				isLoading,
				error,
				refresh: fetchProject,
			}}
		>
			{children}
		</ProjectContext.Provider>
	);
}

export function useProjectContext() {
	const ctx = useContext(ProjectContext);
	if (!ctx) throw new Error('useProjectContext must be used within ProjectProvider');
	return ctx;
}
