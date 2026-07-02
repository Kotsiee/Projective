/**
 * @file penalty.ts
 * @description Zod schema and inferred type for the enforcement/reputation ledger. Mirrors
 * `security.penalties`, the SSOT that feeds the denormalized discovery/trust caches via
 * `security.fn_recalc_penalty_aggregates`.
 */

import { z } from 'zod';
import { IdentifiableSchema } from '../core/base-response.ts';

/** @description Entity a penalty applies to. */
export const PenaltySubjectTypeSchema = z.enum(['freelancer', 'business', 'user', 'team']);
export type PenaltySubjectType = z.infer<typeof PenaltySubjectTypeSchema>;

/** @description Kind of penalty applied. `discovery_rank` lowers search visibility. */
export const PenaltyTypeSchema = z.enum([
	'discovery_rank',
	'trust_score',
	'monetary_fee',
	'suspension',
]);
export type PenaltyType = z.infer<typeof PenaltyTypeSchema>;

/** @description Originating event for a penalty. */
export const PenaltySourceTypeSchema = z.enum([
	'workload_report',
	'dispute',
	'no_show',
	'pii_violation',
	'manual',
]);
export type PenaltySourceType = z.infer<typeof PenaltySourceTypeSchema>;

/**
 * @description A single penalty record. Mirrors `security.penalties`. `severity` magnitudes are
 * configured via `security.platform_params` and default to 0 until tuned.
 */
export const PenaltySchema = IdentifiableSchema.extend({
	subject_type: PenaltySubjectTypeSchema,
	subject_id: z.uuid(),
	penalty_type: PenaltyTypeSchema,
	source_type: PenaltySourceTypeSchema,
	source_id: z.uuid().nullable(),
	severity: z.number().default(0),
	amount_cents: z.number().int().nullable(),
	currency: z.string().nullable(),
	reason: z.string().nullable(),
	status: z.enum(['active', 'expired', 'reversed']).default('active'),
	issued_by: z.uuid().nullable(),
	issued_at: z.iso.datetime({}),
	expires_at: z.iso.datetime({}).nullable(),
	reversed_at: z.iso.datetime({}).nullable(),
});
export type Penalty = z.infer<typeof PenaltySchema>;
