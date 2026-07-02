import { z } from 'zod';
import {
	BaseOwnerSchema,
	IdentifiableSchema,
	RatableSchema,
	TimestampedSchema,
} from '../../core/base-response.ts';
import {
	BudgetType,
	IPOptionMode,
	ProjectFormat,
	ProjectStatus,
	StageStatus,
	TicketStatus,
} from './enums.ts';

// #region 1. AUXILIARY / NESTED SCHEMAS

/**
 * @description Zod validation schema for staffing requirements and budgets per seat.
 */
export const ProjectRoleResponseSchema = IdentifiableSchema.extend({
	project_stage_id: z.uuid(),
	quantity: z.number().int().positive(),
	available_quantity: z.number().int().nonnegative(),
	role_title: z.string().min(1),
	budget_type: z.enum(Object.values(BudgetType) as [string, ...string[]]),
	budget_amount_cents: z.number().int().nonnegative(),
});
export type ProjectRoleResponse = z.infer<typeof ProjectRoleResponseSchema>;

/**
 * @description Zod validation schema for modular units of work within a project execution.
 */
export const ProjectStageResponseSchema = IdentifiableSchema.extend({
	name: z.string().min(1),
	description: z.union([z.record(z.string(), z.any()), z.string()]).nullable(),
	description_text: z.string().nullable(),
	skills: z.array(z.string()).default([]),
	status: z.enum(Object.values(StageStatus) as [string, ...string[]]),
	file_upload_required: z.boolean().default(false),
	default_tasks: z.array(z.record(z.string(), z.any())).default([]),
	start_date: z.iso.datetime({}).nullable(),
	end_date: z.iso.datetime({}).nullable(),
	sort_order: z.number().int().nonnegative().default(0),
});
export type ProjectStageResponse = z.infer<typeof ProjectStageResponseSchema>;

/**
 * @description Embedded required stage tracker inside pipeline units.
 */
export const TicketRequiredStageSchema = z.object({
	stage_id: z.uuid(),
	order: z.number().int().nonnegative(),
});

// #endregion

// #region 2. CORE ROOT ENTITIES

/**
 * @description Canonical schema representing the full project context payload.
 */
export const FullProjectResponseSchema = IdentifiableSchema
	.extend(TimestampedSchema.shape)
	.extend(RatableSchema.shape)
	.extend({
		title: z.string().min(1),
		description: z.union([z.record(z.string(), z.any()), z.string()]).nullable(),
		// FIX 3: Replaced z.nativeEnum with modern z.enum(Object.values(...)) patterns
		format: z.enum(Object.values(ProjectFormat) as [string, ...string[]]),
		status: z.enum(Object.values(ProjectStatus) as [string, ...string[]]),
		is_active: z.boolean(),
		industry_category_id: z.uuid(),
		target_project_start_date: z.iso.datetime({}),
		owner: BaseOwnerSchema,
		nda_required: z.boolean().default(false),
		ip_ownership_mode: z.enum(Object.values(IPOptionMode) as [string, ...string[]]),
		languages: z.array(z.string()).default([]),
		locations: z.array(z.string()).default([]),
		skills: z.array(z.string()).default([]),
		stages: z.array(ProjectStageResponseSchema).default([]),
		roles: z.array(ProjectRoleResponseSchema).default([]),
	});
export type FullProjectResponse = z.infer<typeof FullProjectResponseSchema>;

/**
 * @description Canonical schema for tracking atomic task components flowing across columns.
 */
export const TicketResponseSchema = IdentifiableSchema
	.extend(TimestampedSchema.shape)
	.extend({
		project_id: z.uuid(),
		current_stage_id: z.uuid().nullable(),
		current_assignee_id: z.uuid().nullable(),

		title: z.string().min(1),
		description: z.record(z.string(), z.any()),
		text_description: z.string().default(''),

		status: z.enum(Object.values(TicketStatus) as [string, ...string[]]),
		attachment_count: z.number().int().nonnegative().default(0),
		required_stages: z.array(TicketRequiredStageSchema).default([]),

		due_date: z.iso.datetime({}).nullable(),
		workload_intensity: z.number().positive().default(1.0),
	});
export type TicketResponse = z.infer<typeof TicketResponseSchema>;

// #endregion
