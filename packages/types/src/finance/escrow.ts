/**
 * @file escrow.ts
 * @description Zod schemas and inferred types for escrow holds and team payout distribution.
 * Mirrors `finance.escrows`, `finance.contribution_agreements`, and `finance.payout_splits`.
 */

import { z } from 'zod';
import { IdentifiableSchema } from '../core/base-response.ts';

/**
 * @description Escrow status. Extends the original `'funded'` with the ticket-lifecycle states
 * written by the `finance.fn_*_ticket_escrow` helpers.
 */
export const EscrowStatusSchema = z.enum([
	'funded',
	'held',
	'released',
	'refunded',
	'disputed',
]);
export type EscrowStatus = z.infer<typeof EscrowStatusSchema>;

/**
 * @description A held stake for a stage/ticket. Mirrors `finance.escrows`. `ticket_id` links the
 * hold to a pipeline ticket (JIT claim). Payout = `amount_cents` + `deadline_bonus_cents` −
 * `platform_fee_cents`.
 */
export const EscrowSchema = IdentifiableSchema.extend({
	project_stage_id: z.uuid(),
	ticket_id: z.uuid().nullable(),
	payer_business_id: z.uuid(),
	payee_type: z.enum(['freelancer', 'team']),
	payee_id: z.uuid(),
	amount_cents: z.number().int().positive(),
	platform_fee_cents: z.number().int().nonnegative().default(0),
	deadline_bonus_cents: z.number().int().nonnegative().default(0),
	currency: z.string().min(1),
	status: EscrowStatusSchema,
	created_at: z.iso.datetime({}),
});
export type Escrow = z.infer<typeof EscrowSchema>;

/**
 * @description A team member's share (basis points) of team payouts. Mirrors
 * `finance.contribution_agreements`.
 */
export const ContributionAgreementSchema = IdentifiableSchema.extend({
	team_id: z.uuid(),
	member_user_id: z.uuid(),
	percent_bp: z.number().int().min(0).max(10000),
});
export type ContributionAgreement = z.infer<typeof ContributionAgreementSchema>;

/**
 * @description A concrete split recorded when a team escrow is released. Mirrors
 * `finance.payout_splits`.
 */
export const PayoutSplitSchema = IdentifiableSchema.extend({
	escrow_id: z.uuid(),
	member_user_id: z.uuid(),
	amount_cents: z.number().int().nonnegative(),
	currency: z.string().min(1),
	created_at: z.iso.datetime({}),
});
export type PayoutSplit = z.infer<typeof PayoutSplitSchema>;
