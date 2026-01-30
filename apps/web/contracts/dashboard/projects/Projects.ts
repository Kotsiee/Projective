import { ProjectPermission } from '@projective/types';
import { Signal } from '@preact/signals';

export interface ProjectItem {
	project_id: string;
	title: string;
	status: 'active' | 'draft' | 'completed' | 'archived';
	banner_url: string | null;
	owner_name: string;
	owner_avatar_url: string | null;
	is_starred: boolean;
	is_archived: boolean;
	is_unread: boolean;
	last_updated_at: string;
	total_count: number;
}

export interface ProjectsFilterParams {
	category?: string;
	categoryId?: string;
	search?: string;
	sortBy?: string;
	sortDir?: string;
	limit?: number;
	offset?: number;
}

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
