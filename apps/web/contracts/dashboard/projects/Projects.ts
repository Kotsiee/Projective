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
