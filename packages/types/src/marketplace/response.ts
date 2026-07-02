import { z } from 'zod';
import { PricingModel } from '../session/enums.ts';
import { IdentifiableSchema, TimestampedSchema } from '../core/base-response.ts';

export const ServiceBlueprintResponseSchema = IdentifiableSchema
	.extend(TimestampedSchema.shape)
	.extend({
		freelancer_profile_id: z.string().uuid(),
		title: z.string().min(1),
		description: z.record(z.string(), z.any()),
		description_text: z.string(),
		pricing_model: z.enum(Object.values(PricingModel) as [string, ...string[]]),
		price_cents: z.number().int().nonnegative(),
		currency: z.string().min(1),
		requires_upfront_escrow: z.boolean(),
		max_seats_per_cohort: z.number().int().positive(),
		allow_continuous_enrollment: z.boolean(),
		enrollment_window_days: z.number().int().nonnegative(),
		session_template_rules: z.record(z.string(), z.any()),
		is_published: z.boolean(),
	});

export type ServiceBlueprintResponse = z.infer<typeof ServiceBlueprintResponseSchema>;
