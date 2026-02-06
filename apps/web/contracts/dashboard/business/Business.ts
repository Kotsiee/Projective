export interface DashboardBusiness {
	id: string;
	owner_user_id: string;
	name: string;
	slug: string;
	logo_url: string | null;
	banner_url: string | null;
	country: string | null;
	default_currency: string | null;
	created_at: string;
	active_projects_count: number;
	total_count: number;
}

export interface BusinessFilterParams {
	search?: string;
	sortBy?: 'created_at' | 'name';
	sortDir?: 'asc' | 'desc';
	limit?: number;
	offset?: number;
}
