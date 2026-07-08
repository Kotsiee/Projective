/**
 * @file Overview.ts
 * @description View-model contracts for the Business Administration dashboard (US-008). The finance
 * payload mirrors `org.get_business_finance` (migration 0309) and reuses the shared finance view
 * models from `@projective/types` so the dashboard, the charts and the ledger all speak one
 * vocabulary. Amounts stay in integer minor units (`*_cents`).
 */

import type {
	EscrowAllocation,
	TransactionLedgerItem,
	WalletBalanceSummary,
} from '@projective/types';

/** Aggregate counts surfaced in the admin header + shortcuts. */
export interface BusinessFinanceStats {
	active_project_count: number;
	total_project_count: number;
	member_count: number;
	active_escrow_count: number;
}

/** The full live finance snapshot returned by `org.get_business_finance`. */
export interface BusinessFinancePayload {
	currency: string;
	balances: WalletBalanceSummary;
	transactions: TransactionLedgerItem[];
	escrows: EscrowAllocation[];
	stats: BusinessFinanceStats;
}

/** A single organization member row (AC5), avatar already resolved to a public URL. */
export interface BusinessMember {
	user_id: string;
	name: string;
	username: string | null;
	avatarUrl: string | null;
	role: string;
	status: string;
	joined_at: string;
	is_owner: boolean;
}
