import { QuillDelta } from "@projective/utils";
import {
	BudgetType,
	DateTime,
	StageType,
	StartTriggerType,
} from "@projective/types";

// Corresponds to table: projects.stage_staffing_roles
export interface StageStaffingRole {
	id?: string;
	role_title: string;
	quantity: number;
	budget_type: BudgetType;
	budget_amount_cents: number;
	allow_proposals: boolean;
}

// Corresponds to table: projects.stage_open_seats
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

	// Basics
	title: string;
	description: string | QuillDelta; // JSONB
	stage_type: StageType;
	status: string;
	sort_order: number;

	// Timeline (General)
	start_trigger_type: StartTriggerType;
	fixed_start_date?: DateTime | string;
	start_dependency_stage_id?: string;

	// --- Type Specific Configuration ---

	// File Based
	file_revisions_allowed?: number;
	file_duration_mode?: "fixed_deadline" | "relative_duration" | "no_due_date";
	file_duration_days?: number; // Used if mode is relative_duration
	file_due_date?: DateTime | string; // Used if mode is fixed_deadline

	// Session Based
	session_duration_minutes?: number;
	session_count?: number; // How many sessions included

	// Management Based
	management_contract_mode?: "fixed_dates" | "duration_from_start";

	// Maintenance Based
	maintenance_cycle_interval?: "weekly" | "monthly";

	// Overrides
	ip_ownership_override?: string;

	// Relationships (Loaded via joins)
	staffing_roles: StageStaffingRole[];
	open_seats: StageOpenSeat[];
}
