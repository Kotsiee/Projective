/**
 * @file invoice.ts
 * @description Zod schemas and inferred types for per-stage and consolidated (intervaled) invoices
 * and their line items. Mirrors `finance.invoices` and `finance.invoice_line_items`.
 */

import { z } from 'zod';
import { IdentifiableSchema } from '../core/base-response.ts';

/**
 * @description An invoice header. A `consolidated_monthly` invoice spans many stages and leaves
 * `project_stage_id` null. Mirrors `finance.invoices`.
 */
export const InvoiceSchema = IdentifiableSchema.extend({
	project_stage_id: z.uuid().nullable(),
	issue_to_business_id: z.uuid(),
	issue_from_profile: z.uuid(),
	invoice_type: z.enum(['per_stage', 'consolidated_monthly']).default('per_stage'),
	billing_period_start: z.iso.datetime({}).nullable(),
	billing_period_end: z.iso.datetime({}).nullable(),
	amount_cents: z.number().int().positive(),
	subtotal_cents: z.number().int().nonnegative().default(0),
	platform_fee_cents: z.number().int().nonnegative().default(0),
	tax_cents: z.number().int().nonnegative().default(0),
	total_cents: z.number().int().nonnegative().default(0),
	currency: z.string().min(1),
	status: z.enum(['draft', 'issued', 'paid', 'overdue', 'void']).default('draft'),
	due_date: z.iso.datetime({}).nullable(),
	paid_at: z.iso.datetime({}).nullable(),
	pdf_file_id: z.uuid().nullable(),
	created_at: z.iso.datetime({}),
});
export type Invoice = z.infer<typeof InvoiceSchema>;

/**
 * @description A single itemized entry inside a consolidated statement. Mirrors
 * `finance.invoice_line_items`.
 */
export const InvoiceLineItemSchema = IdentifiableSchema.extend({
	invoice_id: z.uuid(),
	ref_type: z.enum(['escrow', 'bonus', 'platform_fee', 'refund', 'tax']),
	ref_id: z.uuid().nullable(),
	description: z.string().min(1),
	amount_cents: z.number().int(),
	currency: z.string().min(1),
});
export type InvoiceLineItem = z.infer<typeof InvoiceLineItemSchema>;
