/**
 * @file wallet-ui.ts
 * @description Presentational view-models for the Multi-Persona Wallet & Financial Management Hub.
 *
 * Unlike the sibling `wallet.ts` / `escrow.ts` schemas (which mirror the `finance.*` Postgres
 * tables via Zod), these are plain client-side interfaces — the shapes the wallet islands,
 * D3 charts, and the dense ledger table consume. They follow the same "plain interface, no Zod"
 * precedent as `marketplace/cards.ts` (`EntityCardModel`) because they are UI models, not
 * request/response contracts. Amounts stay in integer minor units (`*_cents`) end-to-end.
 */

import type { EscrowStatus } from './escrow.ts';

/** Which workspace identity a wallet belongs to (mirrors the profile-switcher personas). */
export type PersonaKind = 'freelancer' | 'business' | 'team';

/** Discovery-accent keys reused for per-persona colour theming (see `colour.css`). */
export type WalletAccent = 'mint' | 'violet' | 'amber' | 'primary';

/**
 * A selectable wallet identity in the persona context selector. One person may operate a
 * freelancer wallet, one-or-more business wallets, and team wallets simultaneously.
 */
export interface WalletPersona {
	id: string;
	kind: PersonaKind;
	displayName: string;
	handle: string;
	avatarUrl: string | null;
	accent: WalletAccent;
	/** The persona's native settlement currency (ISO-4217), e.g. `GBP`. */
	currency: string;
}

/**
 * Aggregate balances for a persona wallet, split by settlement state. `in_escrow` is capital
 * committed to active stages; `pending` is cleared-but-not-yet-withdrawable; `available` is
 * withdrawable now; `lifetime` is gross earned/settled to date.
 */
export interface WalletBalanceSummary {
	available_cents: number;
	in_escrow_cents: number;
	pending_cents: number;
	lifetime_cents: number;
	currency: string;
}

/**
 * The active-persona wallet view. This is the `WalletContext` shape the shell exposes to every
 * page — the currently-selected persona, the display currency (which may differ from the
 * persona's native currency after a conversion), and the balances already expressed in that
 * display currency.
 */
export interface WalletContext {
	persona: WalletPersona;
	/** Display currency (ISO-4217) the UI is currently rendering in. */
	currency: string;
	balances: WalletBalanceSummary;
	/** ISO timestamp of the last balance refresh. */
	updatedAt: string;
}

/** The nature of a single ledger movement. `platform_fee` is the isolated 5% service charge. */
export type LedgerEntryKind =
	| 'payout'
	| 'platform_fee'
	| 'withdrawal'
	| 'topup'
	| 'refund'
	| 'bonus'
	| 'escrow_hold';

/** Settlement state of a ledger row, reused by the dense ledger table's status pill. */
export type LedgerEntryStatus = 'settled' | 'pending' | 'processing' | 'failed' | 'held';

/**
 * A single row in the in-depth transactions ledger. `gross_cents` is the headline amount,
 * `fee_cents` the platform's cut, `net_cents` what actually moved for/against the wallet.
 * `is_fee_line` marks the segmented 5%-service-charge rows the ledger table styles distinctly
 * from raw project payouts.
 */
export interface TransactionLedgerItem {
	id: string;
	/** ISO datetime the movement posted. */
	date: string;
	kind: LedgerEntryKind;
	direction: 'credit' | 'debit';
	description: string;
	counterparty: string;
	/** Human reference, e.g. an invoice or escrow id fragment. */
	reference: string;
	/** Originating project/stage label, when the movement is work-related. */
	project_label: string | null;
	gross_cents: number;
	fee_cents: number;
	net_cents: number;
	/** Running wallet balance immediately after this movement. */
	balance_after_cents: number;
	currency: string;
	status: LedgerEntryStatus;
	/** True for the isolated platform-fee lines (segmented styling in the ledger). */
	is_fee_line: boolean;
}

/**
 * A slice of capital held in escrow against a specific project stage, shown in the overview's
 * allocation panel. `status` reuses the finance-domain {@link EscrowStatus} enum so the UI and
 * the backend speak the same vocabulary.
 */
export interface EscrowAllocation {
	id: string;
	project_label: string;
	stage_label: string;
	status: EscrowStatus;
	amount_cents: number;
	platform_fee_cents: number;
	/** ISO date the hold is expected to release. */
	release_at: string;
	/** Stage completion 0–100, drives the allocation meter. */
	progress_pct: number;
	payee_name: string;
	currency: string;
}

/**
 * One datum on the Predictive Runway (potential-revenue) forecast. `value_cents` is the central
 * projection; `lower_cents`/`upper_cents` bound the confidence interval band.
 */
export interface ForecastingDataPoint {
	/** ISO date of the projected point. */
	t: string;
	value_cents: number;
	lower_cents: number;
	upper_cents: number;
}

/**
 * One node on the Pipeline Flow scatter (Velocity vs. ROI). High-density arrays of these feed
 * the Canvas renderer; `value_cents` sizes the node, `category` colours it.
 */
export interface PipelinePoint {
	id: string;
	label: string;
	/** Delivery velocity axis (x) — e.g. throughput index. */
	velocity: number;
	/** Return-on-investment axis (y) — e.g. margin %. */
	roi: number;
	/** Deal size, drives node radius. */
	value_cents: number;
	category: string;
	/** ISO date the deal/point belongs to (used by the timeline filter). */
	date: string;
}

/**
 * Static FX conversion table keyed by ISO-4217 code. Rates are expressed relative to a single
 * base unit (1 base = `rate` target). The wallet uses this for the mock live-conversion the
 * currency dropdown performs across every balance, ledger amount and chart value.
 */
export type FxRateTable = Record<string, number>;

/** Convenience: the ordered persona kinds for tab rendering. */
export const PERSONA_KINDS: readonly PersonaKind[] = ['freelancer', 'business', 'team'] as const;
