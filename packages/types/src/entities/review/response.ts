import { z } from 'zod';
import { IdentifiableSchema, TimestampedSchema } from '../../core/base-response.ts';

export const ReviewTargetTypeSchema = z.enum([
	'user',
	'freelancer',
	'business',
	'team',
	'service_blueprint',
]);
export type ReviewTargetType = z.infer<typeof ReviewTargetTypeSchema>;

export const ReviewResponseSchema = IdentifiableSchema
	.merge(TimestampedSchema)
	.extend({
		target_entity_id: z.string().uuid(),
		target_entity_type: ReviewTargetTypeSchema,
		reviewer_user_id: z.string().uuid(),
		project_id: z.string().uuid().nullable(),
		rating: z.number().min(1).max(5),
		comment: z.string().default(''),
		reply_comment: z.string().nullable(),
		replied_at: z.string().datetime({}).nullable(),
	});
export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;
