/**
 * @file wallet.ts
 * @description Zod schemas and inferred types for wallets, ledger transactions, and per-member
 * spending caps. Mirrors `finance.wallets`, `finance.transactions`, and `finance.spending_limits`.
 */

import { z } from 'zod';
import { IdentifiableSchema } from '../core/base-response.ts';

// #region Wallets & ledger

/**
 * @description A vault holding funds for a user, business, or team. Mirrors `finance.wallets`.
 */
export const WalletSchema = IdentifiableSchema.extend({
	owner_type: z.string().min(1),
	owner_id: z.uuid(),
	currency: z.string().min(1),
	balance_cents: z.number().int().nonnegative(),
	created_at: z.iso.datetime({}),
});
export type Wallet = z.infer<typeof WalletSchema>;

/**
 * @description A single immutable ledger movement against a wallet. Mirrors `finance.transactions`.
 */
export const TransactionSchema = IdentifiableSchema.extend({
	wallet_id: z.uuid(),
	direction: z.enum(['credit', 'debit']),
	amount_cents: z.number().int().positive(),
	currency: z.string().min(1),
	reason: z.string().min(1),
	ref_table: z.string().nullable(),
	ref_id: z.uuid().nullable(),
	balance_after_cents: z.number().int(),
	created_at: z.iso.datetime({}),
});
export type Transaction = z.infer<typeof TransactionSchema>;

/**
 * @description A per-member spending cap on a pooled (business) wallet. Mirrors
 * `finance.spending_limits`; enforced by `finance.fn_check_spending_limit`.
 */
export const SpendingLimitSchema = IdentifiableSchema.extend({
	wallet_id: z.uuid(),
	member_user_id: z.uuid(),
	cap_cents: z.number().int().nonnegative(),
	period_interval: z.enum(['weekly', 'monthly', 'total']),
	spent_cents: z.number().int().nonnegative().default(0),
	resets_at: z.iso.datetime({}).nullable(),
});
export type SpendingLimit = z.infer<typeof SpendingLimitSchema>;

// #endregion
