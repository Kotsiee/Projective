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

	// Identity
	name: z.string()
		.min(2, 'Business name must be at least 2 characters')
		.max(100, 'Business name is too long'),

	slug: z.string()
		.min(3, 'Handle must be at least 3 characters')
		.max(50, 'Handle is too long')
		.regex(/^[a-z0-9-]+$/, 'Handle can only contain lowercase letters, numbers, and hyphens'),

	headline: z.string().max(100).optional(),
	description: QuillDeltaSchema.optional(),

	logo_url: z.string().url().optional().or(z.literal('')),
	banner_url: z.string().url().optional().or(z.literal('')), // NEW

	// Legal & Billing
	legal_name: z.string()
		.min(2, 'Legal Name is required for invoicing'),

	billing_email: z.string().email('Invalid billing email'),

	country: z.string().min(2, 'Country is required'),

	address_line_1: z.string().min(5, 'Street address is required'),
	address_city: z.string().min(2, 'City is required'),
	address_zip: z.string().min(2, 'Postal code is required'),

	tax_id: z.string().optional(),

	// Finance
	default_currency: z.enum(['USD', 'GBP', 'EUR', 'AUD', 'CAD'])
		.default('USD'),
});

export type CreateBusinessInput = z.infer<typeof CreateBusinessSchema>;
