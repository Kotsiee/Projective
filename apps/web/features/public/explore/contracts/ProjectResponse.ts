export interface ProjectResponse {
	project_id: string;
	title: string;
	description: string | null;
	thumbnail_url: string;
	status: 'active' | 'inactive' | string; // Adjusted to include literal types if known
	is_active: boolean;
	industry_category_id: string;
	target_project_start_date: string; // ISO Date string
	created_at: string;
	owner: Owner;
	nda_required: boolean;
	ip_ownership_mode: 'exclusive_transfer' | string;
	languages: string[];
	locations: string[];
	skills: string[]; // Based on the empty array in the example
	stages: ProjectStage[];
	roles: ProjectRole[];
}

export interface Owner {
	id: string;
	type: 'user' | 'business' | string;
	name: string;
	username: string;
	avatar_url: string | null;
}

export interface ProjectStage {
	id: string;
	name: string;
	type: 'file_based' | 'session_based' | 'maintenance_based' | string;
	status: 'open' | 'closed' | string;
	end_date: string | null;
	start_date: string | null;
}

export interface ProjectRole {
	quantity: number;
	role_title: string;
	budget_type: 'fixed_price' | 'hourly' | string;
	budget_amount_cents: number;
}
