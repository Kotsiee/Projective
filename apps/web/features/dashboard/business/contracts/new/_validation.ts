import { z } from 'zod';

const QuillDeltaSchema = z.object({
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

export const CreateBusinessSchema = z.object({
	id: z.uuid().optional(),

	name: z.string()
		.min(2, 'Business name must be at least 2 characters')
		.max(100, 'Business name is too long'),

	slug: z.string()
		.min(3, 'Handle must be at least 3 characters')
		.max(50, 'Handle is too long')
		.regex(/^[a-z0-9-]+$/, 'Handle can only contain lowercase letters, numbers, and hyphens'),

	// --- Low-friction creation ---
	// Only `name` + `slug` are required to reserve a business. Everything below is
	// optional and completed later on the (locked) settings page; until then the
	// entity lives as a Draft/Unverified record. See migration 20260709120000.
	headline: z.string().max(100).optional(),
	description: QuillDeltaSchema.optional(),

	logo_url: z.string().url().optional().or(z.literal('')),
	banner_url: z.string().url().optional().or(z.literal('')),

	legal_name: z.string().optional(),
	billing_email: z.string().email('Invalid billing email').optional().or(z.literal('')),
	country: z.string().optional(),
	address_line_1: z.string().optional(),
	address_city: z.string().optional(),
	address_zip: z.string().optional(),
	tax_id: z.string().optional(),

	default_currency: z.enum(['USD', 'GBP', 'EUR', 'AUD', 'CAD'])
		.default('USD'),
});

export type CreateBusinessInput = z.infer<typeof CreateBusinessSchema>;
