import { z } from 'zod';
import { IdentifiableSchema, ProfileTypeSchema, TimestampedSchema } from '../core/base-response.ts';

export const ProfileStatsResponseSchema = z.object({
	rating_as_freelancer: z.number().min(0).max(5),
	reviews_as_freelancer: z.number().int().nonnegative(),
	rating_as_client: z.number().min(0).max(5),
	reviews_as_client: z.number().int().nonnegative(),
	active_projects: z.number().int().nonnegative(),
	total_projects: z.number().int().nonnegative(),
	service_count: z.number().int().nonnegative(),
	product_count: z.number().int().nonnegative(),
});
export type ProfileStatsResponse = z.infer<typeof ProfileStatsResponseSchema>;

export const FullProfileResponseSchema = IdentifiableSchema
	.extend(TimestampedSchema.shape)
	.extend({
		entity_type: ProfileTypeSchema,
		handle: z.string().min(1),
		name: z.string().min(1),
		headline: z.string().default(''),
		bio: z.string().nullable(),
		avatar_url: z.url().nullable(),
		banner_url: z.url().nullable(),
		country: z.string().nullable(),
		timezone: z.string().nullable(),
		languages: z.array(z.string()).default([]),
		skills: z.array(z.string()).default([]),
		stats: ProfileStatsResponseSchema,
		is_freelancer: z.boolean(),
		availability_status: z.enum(['available', 'busy', 'unavailable']).optional(),
	});
export type FullProfileResponse = z.infer<typeof FullProfileResponseSchema>;
