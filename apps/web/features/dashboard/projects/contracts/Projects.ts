import { ProjectPermission, StagePermission, StageType } from '@projective/types';
import { Signal } from '@preact/signals';
import { VNode } from 'preact';

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

export type StageRole = 'owner' | 'assignee' | 'viewer';

export interface StageDetails {
	stage_id: string;
	project_id: string;
	channel_id: string;
	title: string;
	description: string;
	sort_order: number;

	status:
		| 'open'
		| 'assigned'
		| 'in_progress'
		| 'submitted'
		| 'approved'
		| 'revisions'
		| 'paid';
	stage_type: StageType;
	ip_mode:
		| 'exclusive_transfer'
		| 'licensed_use'
		| 'internal_only'
		| 'template_only';
	due_date: string | null;

	budget: {
		type: 'fixed' | 'hourly_cap' | 'free';
		amount_cents: number;
		currency: string;
	} | null;

	assignee: {
		profile_id: string;
		name: string;
		avatar_url: string | null;
		type: 'freelancer' | 'team';
		status: 'invited' | 'accepted';
	} | null;

	latest_submission: {
		id: string;
		submitted_at: string;
		notes: string;
		files: Array<{ name: string; url: string }>;
	} | null;

	viewer_context: {
		role: StageRole;
		permissions: StagePermission[];
	};
}

export interface StageState {
	stage_id: Signal<string | undefined>;
	stage: Signal<StageDetails | null>;
	isLoading: Signal<boolean>;
	error: Signal<string | null>;
	refresh: () => void;
	footer: Signal<VNode | null>;
}
