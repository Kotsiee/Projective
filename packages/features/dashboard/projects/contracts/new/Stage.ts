import { QuillDelta } from '@projective/utils';
import { BudgetType, DateTime, StageType, StartTriggerType } from '@projective/types';

export interface StageStaffingRole {
	id?: string;
	role_title: string;
	quantity: number;
	budget_type: BudgetType;
	budget_amount_cents: number;
	allow_proposals: boolean;
}

export interface StageOpenSeat {
	id?: string;
	description_of_need: string;
	budget_min_cents?: number;
	budget_max_cents?: number;
	require_proposals: boolean;
}

export interface Stage {
	id?: string;
	project_id?: string;

	title: string;
	description: string | QuillDelta;
	stage_type: StageType;
	status: string;
	sort_order: number;

	start_trigger_type: StartTriggerType;
	fixed_start_date?: DateTime | string;
	start_dependency_stage_id?: string;
	start_dependency_lag_days?: number;
	file_revisions_allowed?: number;
	file_duration_mode?: 'fixed_deadline' | 'relative_duration' | 'no_due_date';
	file_duration_days?: number;
	file_due_date?: DateTime | string;
	file_extensions_allowed?: string[];
	file_max_size_mb?: number;
	file_max_count?: number;
	session_duration_minutes?: number;
	session_count?: number;
	session_preferred_days?: string[];
	management_contract_mode?: 'fixed_dates' | 'duration_from_start';
	maintenance_cycle_interval?: 'weekly' | 'monthly';
	ip_ownership_override?: string;
	staffing_roles: StageStaffingRole[];
	open_seats: StageOpenSeat[];
}
