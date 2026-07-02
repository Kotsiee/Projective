/**
 * @file request.ts
 * @description Canonical Zod schemas and inferred types for project-related API requests.
 */

import { z } from 'zod';
import {
	IPOptionMode,
	ProjectFormat,
	ProjectStatus,
	StructureVariation,
	TicketStatus,
	TimelinePreset,
} from './enums.ts';

// #region 1. PROJECT REQUESTS

/**
 * @description Schema for creating a new project.
 */
export const CreateProjectRequestSchema = z.object({
	title: z.string().min(1),
	description: z.record(z.string(), z.any()).default({}),
	description_text: z.string().default(''),
	format: z.enum(Object.values(ProjectFormat) as [string, ...string[]]).default(
		ProjectFormat.Pipeline,
	),
	industry_category_id: z.uuid().optional(),
	currency: z.string().default('USD'),
	timeline_preset: z.enum(Object.values(TimelinePreset) as [string, ...string[]]).default(
		TimelinePreset.Sequential,
	),
	structure_variation: z.enum(Object.values(StructureVariation) as [string, ...string[]])
		.default(StructureVariation.Standard),
	nda_required: z.boolean().default(false),
	ip_ownership_mode: z.enum(Object.values(IPOptionMode) as [string, ...string[]]).default(
		IPOptionMode.ProjectivePartner,
	),
});

export type CreateProjectRequest = z.infer<typeof CreateProjectRequestSchema>;

/**
 * @description Schema for updating an existing project.
 */
export const UpdateProjectRequestSchema = CreateProjectRequestSchema.partial().extend({
	status: z.enum(Object.values(ProjectStatus) as [string, ...string[]]).optional(),
});

export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequestSchema>;

// #endregion

// #region 2. TICKET REQUESTS

/**
 * @description Schema for creating a new ticket on the project board.
 */
export const CreateTicketRequestSchema = z.object({
	project_id: z.uuid(),
	current_stage_id: z.uuid().nullable().optional(),
	title: z.string().min(1),
	description: z.record(z.string(), z.any()).default({}),
	text_description: z.string().default(''),
	status: z.enum(Object.values(TicketStatus) as [string, ...string[]]).default(
		TicketStatus.Backlog,
	),
	// FIX: Added previously missing fields to the schema so they aren't stripped or rejected
	required_stages: z.array(z.object({
		stage_id: z.string().uuid(),
		order: z.number().int().nonnegative(),
	})).optional(),
	workload_intensity: z.number().positive().optional(),
	due_date: z.string().nullable().optional(),
	unit_price_cents: z.number().int().nonnegative().nullable().optional(),
	sort_order: z.number().int().nullable().optional(),
});

export type CreateTicketRequest = z.infer<typeof CreateTicketRequestSchema>;

/**
 * @description Schema for updating an existing ticket, specifically for board column movements.
 */
export const UpdateTicketRequestSchema = CreateTicketRequestSchema.partial().extend({
	current_assignee_id: z.uuid().nullable().optional(),
});

export type UpdateTicketRequest = z.infer<typeof UpdateTicketRequestSchema>;

// #endregion

// #region 3. WORKLOAD REPORT REQUESTS

/**
 * @description Schema for a freelancer filing a workload-intensity mismatch report against a ticket.
 */
export const CreateWorkloadReportRequestSchema = z.object({
	ticket_id: z.uuid(),
	claimed_intensity: z.number().optional(),
	reported_intensity: z.number().optional(),
	reason: z.string().min(1),
});

export type CreateWorkloadReportRequest = z.infer<typeof CreateWorkloadReportRequestSchema>;

// #endregion
