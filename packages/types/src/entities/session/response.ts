import { z } from 'zod';
import { CohortStatus, SessionEventStatus, WaitlistStatus } from './enums.ts';
import { IdentifiableSchema, TimestampedSchema } from '../../core/base-response.ts';

export const CohortResponseSchema = IdentifiableSchema
	.extend(TimestampedSchema)
	.extend({
		project_id: z.string().uuid(),
		name: z.string().min(1),
		max_seats: z.number().int().positive(),
		status: z.enum(Object.values(CohortStatus) as [string, ...string[]]),
	});
export type CohortResponse = z.infer<typeof CohortResponseSchema>;

export const CohortMembershipResponseSchema = IdentifiableSchema.extend({
	cohort_id: z.string().uuid(),
	user_id: z.string().uuid(),
	status: z.string().min(1),
	joined_at: z.string().datetime({}),
});
export type CohortMembershipResponse = z.infer<typeof CohortMembershipResponseSchema>;

export const SessionEventResponseSchema = IdentifiableSchema
	.extend(TimestampedSchema)
	.extend({
		cohort_id: z.string().uuid(),
		title: z.string().min(1),
		start_time: z.string().datetime({}),
		end_time: z.string().datetime({}),
		status: z.enum(Object.values(SessionEventStatus) as [string, ...string[]]),
	});
export type SessionEventResponse = z.infer<typeof SessionEventResponseSchema>;

export const SessionAttendanceResponseSchema = IdentifiableSchema.extend({
	session_event_id: z.string().uuid(),
	user_id: z.string().uuid(),
	joined_at: z.string().datetime({}),
});
export type SessionAttendanceResponse = z.infer<typeof SessionAttendanceResponseSchema>;

export const WaitlistResponseSchema = IdentifiableSchema
	.extend(TimestampedSchema)
	.extend({
		service_blueprint_id: z.string().uuid(),
		user_id: z.string().uuid(),
		status: z.enum(Object.values(WaitlistStatus) as [string, ...string[]]),
	});
export type WaitlistResponse = z.infer<typeof WaitlistResponseSchema>;
