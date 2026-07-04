import { z } from 'zod';
import {
	BaseOwnerSchema,
	IdentifiableSchema,
	RatableSchema,
	TimestampedSchema,
} from '../core/base-response.ts';
import {
	BudgetType,
	IPOptionMode,
	PaymentStatus,
	ProjectFormat,
	ProjectStatus,
	StageStatus,
	StructureVariation,
	TicketStatus,
	WorkloadReportStatus,
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
	/** Pipeline per-ticket unit price (minor units); source amount for ticket escrow holds. */
	unit_price_cents: z.number().int().nonnegative().nullable(),
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
		format: z.enum(Object.values(ProjectFormat) as [string, ...string[]]),
		structure_variation: z.enum(Object.values(StructureVariation) as [string, ...string[]])
			.default(StructureVariation.Standard),
		status: z.enum(Object.values(ProjectStatus) as [string, ...string[]]),
		is_active: z.boolean(),
		industry_category_id: z.uuid(),
		target_project_start_date: z.iso.datetime({}),
		owner: BaseOwnerSchema,
		nda_required: z.boolean().default(false),
		/** When true the engagement has agreed to deadline-bonus terms; gates the ticket Due Date. */
		allow_deadline_bonuses: z.boolean().default(false),
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

		/** Escrow / installment tracking (minor units). */
		payment_status: z.enum(Object.values(PaymentStatus) as [string, ...string[]])
			.default(PaymentStatus.Unpaid),
		unit_price_cents: z.number().int().nonnegative().nullable(),
		total_amount_paid: z.number().int().nonnegative().default(0),

		/** Manual ordering is only honored while the ticket is in the backlog ("New") stage. */
		sort_order: z.number().int().nullable(),

		/** Lifecycle markers. `hidden_until` bounds the 48-hour workload-report suspension window. */
		claimed_at: z.iso.datetime({}).nullable(),
		hidden_until: z.iso.datetime({}).nullable(),
		workload_report_id: z.uuid().nullable(),
	});
export type TicketResponse = z.infer<typeof TicketResponseSchema>;

/**
 * @description Freelancer-filed workload-intensity mismatch report. Mirrors
 * `projects.ticket_workload_reports`. Filing one suspends active work until `hidden_until`.
 */
export const WorkloadReportResponseSchema = IdentifiableSchema
	.extend({
		ticket_id: z.uuid(),
		reporter_user_id: z.uuid(),
		claimed_intensity: z.number().nullable(),
		reported_intensity: z.number().nullable(),
		reason: z.string().min(1),
		status: z.enum(Object.values(WorkloadReportStatus) as [string, ...string[]]),
		hidden_until: z.iso.datetime({}).nullable(),
		created_at: z.iso.datetime({}),
		resolved_at: z.iso.datetime({}).nullable(),
	});
export type WorkloadReportResponse = z.infer<typeof WorkloadReportResponseSchema>;

// #endregion
