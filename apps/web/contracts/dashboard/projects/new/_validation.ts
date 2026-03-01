import { z } from 'zod';
import {
	BudgetType,
	IPOptionMode,
	PortfolioDisplayRights,
	StageType,
	StartTriggerType,
	TimelinePreset,
	Visibility,
} from '@projective/types';

export const QuillDeltaSchema = z.object({
	ops: z.array(
		z.object({
			insert: z.union([
				z.string(),
				z.record(z.string(), z.any()),
			]),
			attributes: z.record(z.string(), z.any()).optional(),
		}),
	),
});

export const LegalAndScreeningSchema = z.object({
	ip_ownership_mode: z.nativeEnum(IPOptionMode),
	nda_required: z.boolean(),
	portfolio_display_rights: z.nativeEnum(PortfolioDisplayRights),
	screening_questions: z.array(z.string().min(1, 'Question cannot be empty')),
	location_restriction: z.array(z.string()),
	language_requirement: z.array(z.string()),
});

export const StageStaffingRoleSchema = z.object({
	role_title: z.string().min(1, 'Role title is required').max(100),
	quantity: z.number().int().min(1),
	budget_type: z.nativeEnum(BudgetType),

	budget_amount_cents: z.number().int().min(0, 'Budget cannot be negative'),
	allow_proposals: z.boolean(),
});

export const StageOpenSeatSchema = z.object({
	description_of_need: z.string().min(
		10,
		'Please describe the need in detail',
	).max(500),
	budget_min_cents: z.number().int().min(0).optional(),
	budget_max_cents: z.number().int().min(0).optional(),
	require_proposals: z.boolean(),
});

export const StageSchema = z.object({
	id: z.uuid().optional(),

	title: z.string().min(1, 'Stage title is required').max(100),
	description: z.union([z.string(), QuillDeltaSchema]),
	stage_type: z.nativeEnum(StageType),
	status: z.string().default('open'),
	sort_order: z.number().int().min(0),

	start_trigger_type: z.nativeEnum(StartTriggerType),
	fixed_start_date: z.coerce.date().optional(),

	start_dependency_stage_id: z.string().optional(),

	start_dependency_lag_days: z.number().int().optional(),
	hire_trigger_active: z.boolean().optional(),

	file_revisions_allowed: z.number().int().min(0).optional(),
	file_duration_mode: z.enum([
		'fixed_deadline',
		'relative_duration',
		'no_due_date',
	]).optional(),
	file_duration_days: z.number().int().min(1).optional(),
	file_due_date: z.coerce.date().optional(),
	file_extensions_allowed: z.array(z.string()).optional(),
	file_max_size_mb: z.number().int().min(1).optional(),
	file_max_count: z.number().int().min(1).optional(),

	session_duration_minutes: z.number().int().min(1).optional(),
	session_count: z.number().int().min(1).optional(),
	session_preferred_days: z.array(z.string()).optional(),
	session_end_date: z.coerce.date().optional(),

	management_contract_mode: z.enum(['fixed_dates', 'duration_from_start']).optional(),
	maintenance_cycle_interval: z.enum(['weekly', 'monthly']).optional(),

	ip_ownership_override: z.string().optional(),

	staffing_roles: z.array(StageStaffingRoleSchema),
	open_seats: z.array(StageOpenSeatSchema),
}).refine((data) => {
	if (
		data.start_trigger_type === StartTriggerType.FixedDate &&
		!data.fixed_start_date
	) {
		return false;
	}
	return true;
}, {
	message: "Fixed start date is required when trigger type is 'Fixed Date'",
	path: ['fixed_start_date'],
});

export const CreateProjectSchema = z.object({
	client_business_id: z.uuid().optional(),

	title: z.string().min(5, 'Title must be at least 5 characters').max(150),
	description: QuillDeltaSchema,
	industry_category_id: z.string().uuid({
		message: 'Please select an industry category',
	}),

	visibility: z.nativeEnum(Visibility),
	currency: z.string().length(3).regex(
		/^[A-Z]{3}$/,
		'Must be a 3-letter currency code',
	),

	timeline_preset: z.nativeEnum(TimelinePreset),
	target_project_start_date: z.coerce.date(),

	legal_and_screening: LegalAndScreeningSchema,

	stages: z.array(StageSchema).min(1, 'Project must have at least one stage'),

	global_attachments: z.array(z.uuid()).optional(),

	tags: z.array(z.string()).max(10, 'Too many tags').optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type StageInput = z.infer<typeof StageSchema>;
