import { z } from 'zod';

// #region 1. Enums & Constants

/**
 * Defines the granularity of the timeline view.
 */
export enum ZoomLevel {
	Hour = 'hour',
	Day = 'day',
	Week = 'week',
	Month = 'month',
	Quarter = 'quarter',
	Year = 'year',
}

/**
 * Defines the relationship type between two tasks.
 */
export enum DependencyType {
	FS = 'FS',
	SS = 'SS',
	FF = 'FF',
	SF = 'SF',
}

/**
 * Visual style of the row in the left grid.
 */
export enum RowType {
	Task = 'task',
	Group = 'group',
	Milestone = 'milestone',
	Divider = 'divider',
}

// #endregion

// #region 2. Zod Schemas

/**
 * Schema for a visual dependency link between tasks.
 * Corrected nativeEnum to avoid deprecated signature.
 */
export const DependencyLinkSchema = z.object({
	id: z.uuid(),
	fromTaskId: z.uuid(),
	toTaskId: z.uuid(),
	type: z.nativeEnum(DependencyType).default(DependencyType.FS),
	lagMs: z.number().default(0),
	style: z.record(z.string(), z.string()).optional(), // Fixed: Explicit key and value types
});

/**
 * Schema for a specific marker (vertical line, flag, etc.).
 */
export const MarkerSchema = z.object({
	id: z.uuid(),
	type: z.enum(['verticalLine', 'point', 'range', 'flag']),
	scope: z.enum(['global', 'row', 'task']),
	at: z.number().optional(), // Timestamp
	startAt: z.number().optional(), // For ranges
	endAt: z.number().optional(), // For ranges
	label: z.string(),
	color: z.string().optional(),
});

/**
 * Schema for a task rendered as a bar on the timeline.
 */
export const GanttTaskSchema = z.object({
	id: z.uuid(),
	rowId: z.uuid(),
	name: z.string(),
	startAt: z.number(), // Timestamp (ms)
	endAt: z.number(), // Timestamp (ms)
	progress: z.number().min(0).max(100).default(0),
	status: z.string().default('todo'),
	assignees: z.array(z.string()).default([]), // User IDs

	// Relationships
	dependencies: z.array(z.uuid()).default([]), // IDs of DependencyLinks

	// Configuration
	isMilestone: z.boolean().default(false),
	baseline: z.object({
		startAt: z.number(),
		endAt: z.number(),
	}).optional(),

	// Constraints & Metadata
	constraints: z.object({
		lockStart: z.boolean().optional(),
		lockEnd: z.boolean().optional(),
		allowMove: z.boolean().default(true),
		allowResize: z.boolean().default(true),
	}).optional(),
	meta: z.record(z.string(), z.any()).default({}), // Fixed: Explicit key and value types
});

/**
 * Schema for a row in the "Left Table".
 */
export const GanttRowSchema = z.object({
	id: z.uuid(),
	type: z.enum(RowType).default(RowType.Task),
	parentId: z.uuid().nullable().optional(),
	orderIndex: z.number(),
	collapsed: z.boolean().default(false),

	// Display Fields
	label: z.string(),
	height: z.number().optional(),
	style: z.record(z.string(), z.string()).optional(), // Fixed: Explicit key and value types

	// Data Payload (Projective specific)
	data: z.record(z.string(), z.any()).default({}), // Fixed: Explicit key and value types
});

/**
 * Schema for the Project context.
 */
export const GanttProjectSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	timezone: z.string().default('UTC'),
	workingDays: z.array(z.number()).default([1, 2, 3, 4, 5]), // Mon-Fri
	holidays: z.array(z.number()).default([]), // Array of timestamps
});

// #endregion

// #region 3. TypeScript Interfaces

export type DependencyLink = z.infer<typeof DependencyLinkSchema>;
export type GanttMarker = z.infer<typeof MarkerSchema>;
export type GanttTask = z.infer<typeof GanttTaskSchema>;
export type GanttRow = z.infer<typeof GanttRowSchema>;
export type GanttProject = z.infer<typeof GanttProjectSchema>;

// #endregion
