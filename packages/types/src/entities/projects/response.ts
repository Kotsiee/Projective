import { BaseOwner, Identifiable, Ratable, Timestamped } from '../../core/base-response.ts';
import {
	BudgetType,
	IPOptionMode,
	ProjectFormat,
	ProjectStatus,
	StageStatus,
	TicketStatus,
} from './enums.ts';

// #region 1. FULL PROJECT RESPONSE
/**
 * @interface FullProjectResponse
 * @description The complete data payload for the /view/project page, mapped to domain enums.
 */
export interface FullProjectResponse extends Identifiable, Timestamped, Ratable {
	title: string;
	description: Record<string, any> | string | null;
	format: ProjectFormat;
	status: ProjectStatus;
	is_active: boolean;
	industry_category_id: string;
	target_project_start_date: string;
	owner: BaseOwner;
	nda_required: boolean;
	ip_ownership_mode: IPOptionMode;
	languages: string[];
	locations: string[];
	skills: string[];
	stages: ProjectStageResponse[];
	roles: ProjectRoleResponse[];
}

/**
 * @interface ProjectStageResponse
 * @description Represents a modular unit of work within a project, unified via configuration flags.
 */
export interface ProjectStageResponse extends Identifiable {
	name: string;
	description: Record<string, any> | string | null;
	description_text: string | null;
	skills: string[];
	status: StageStatus;
	file_upload_required: boolean;
	default_tasks: Record<string, any>[];
	start_date: string | null;
	end_date: string | null;
}

/**
 * @interface ProjectRoleResponse
 * @description Defines staffing requirements and budget for a specific seat.
 */
export interface ProjectRoleResponse extends Identifiable {
	project_stage_id: string;
	quantity: number;
	available_quantity: number;
	role_title: string;
	budget_type: BudgetType;
	budget_amount_cents: number;
}
// #endregion

/**
 * @interface TicketResponse
 * @description Represents the atomic unit of work flowing through a project pipeline.
 */
export interface TicketResponse extends Identifiable, Timestamped {
	project_id: string;
	title: string;
	description: Record<string, any>;
	status: TicketStatus;
	required_stage_ids: string[];
	current_stage_id: string | null;
	assigned_to_user_id: string | null;
}
