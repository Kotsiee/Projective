import { createContext } from 'preact';
import { useContext, useEffect } from 'preact/hooks';
import { Signal, useSignal } from '@preact/signals';
import { ComponentChildren } from 'preact';
import { ProjectPermission } from '@projective/types';

export type ProjectRole = 'owner' | 'collaborator' | 'viewer';

export interface ProjectStageSummary {
	id: string;
	name: string;
	status: string;
	stage_type: string;
	unread: boolean;
	last_updated?: string;
}

export interface ProjectDetails {
	project_id: string;
	title: string;
	status: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled';
	banner_url: string | null;
	is_starred: boolean;

	owner: {
		id: string;
		name: string;
		avatar_url: string | null;
		type: 'business' | 'freelancer';
	};

	stages: ProjectStageSummary[];

	viewer_context: {
		role: ProjectRole;
		permissions: ProjectPermission[];
	};
}

export interface ProjectState {
	project_id: Signal<string | undefined>;
	project: Signal<ProjectDetails | null>;
	isLoading: Signal<boolean>;
	error: Signal<string | null>;
	refresh: () => void;
}

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
			const res = await fetch(`/api/v1/dashboard/projects/${projectId.value}`);
			if (!res.ok) throw new Error(`Error ${res.status}`);
			project.value = await res.json();
			// deno-lint-ignore no-explicit-any
		} catch (err: any) {
			console.error('Project Fetch Error:', err);
			error.value = err.message;
		} finally {
			isLoading.value = false;
		}
	};

	useEffect(() => {
		fetchProject();
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
