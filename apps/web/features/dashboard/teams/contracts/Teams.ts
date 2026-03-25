export interface TeamsFilterParams {
	search?: string;
	role?: 'all' | 'owner' | 'member' | 'admin';
	sortBy?: 'name' | 'last_updated' | 'member_count';
	sortDir?: 'asc' | 'desc';
	limit?: number;
	offset?: number;
}

export interface DashboardTeam {
	team_id: string;
	name: string;
	slug: string;
	avatar_url: string | null;
	banner_url: string | null;
	description: string;
	user_role: string;
	member_count: number;
	payout_model: string;
	created_at: string;
	updated_at: string;
	total_count: number;
}
