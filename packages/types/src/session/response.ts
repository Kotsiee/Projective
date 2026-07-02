import { z } from 'zod';
import { CohortStatus, SessionEventStatus, WaitlistStatus } from './enums.ts';
import { IdentifiableSchema, TimestampedSchema } from '../core/base-response.ts';

export const CohortResponseSchema = IdentifiableSchema
	.extend(TimestampedSchema.shape)
	.extend({
		project_id: z.uuid(),
		name: z.string().min(1),
		max_seats: z.number().int().positive(),
		status: z.enum(Object.values(CohortStatus) as [string, ...string[]]),
	});
export type CohortResponse = z.infer<typeof CohortResponseSchema>;

export const CohortMembershipResponseSchema = IdentifiableSchema.extend({
	cohort_id: z.uuid(),
	user_id: z.uuid(),
	status: z.string().min(1),
	joined_at: z.iso.datetime({}),
});
export type CohortMembershipResponse = z.infer<typeof CohortMembershipResponseSchema>;

export const SessionEventResponseSchema = IdentifiableSchema
	.extend(TimestampedSchema.shape)
	.extend({
		cohort_id: z.uuid(),
		title: z.string().min(1),
		start_time: z.iso.datetime({}),
		end_time: z.iso.datetime({}),
		status: z.enum(Object.values(SessionEventStatus) as [string, ...string[]]),
	});
export type SessionEventResponse = z.infer<typeof SessionEventResponseSchema>;

export const SessionAttendanceResponseSchema = IdentifiableSchema.extend({
	session_event_id: z.uuid(),
	user_id: z.uuid(),
	joined_at: z.iso.datetime({}),
});
export type SessionAttendanceResponse = z.infer<typeof SessionAttendanceResponseSchema>;

export const WaitlistResponseSchema = IdentifiableSchema
	.extend(TimestampedSchema.shape)
	.extend({
		service_blueprint_id: z.uuid(),
		user_id: z.uuid(),
		status: z.enum(Object.values(WaitlistStatus) as [string, ...string[]]),
	});
export type WaitlistResponse = z.infer<typeof WaitlistResponseSchema>;
