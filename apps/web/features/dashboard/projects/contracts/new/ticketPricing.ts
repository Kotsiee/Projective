/**
 * @file ticketPricing.ts
 * @description Pure, deterministic cost model powering the Ticket / Stage creation cost preview
 * (spec §2A). The backend currently only persists a single `unit_price_cents` per stage (see
 * packages/types/src/projects/response.ts) — there is no schema for revision surcharges or
 * deadline bonuses. Those concepts are frontend-only enrichments (see the
 * `stage-submissions-frontend-mock` memory), so this module derives plausible, STABLE figures from
 * the stage identity where the backend has none. Everything here is a pure function of its inputs,
 * so the preview never flickers between renders.
 */

// #region Workload intensity tiers
/** The three workload-intensity tiers surfaced in the modal selector (spec §2A). */
export const WI_TIERS = [
	{ key: 'Low', label: 'Low', multiplier: 0.5 },
	{ key: 'Medium', label: 'Medium', multiplier: 1.0 },
	{ key: 'High', label: 'High', multiplier: 2.0 },
] as const;

export type WiKey = typeof WI_TIERS[number]['key'];

/** Resolves a tier key to its escrow multiplier (defaults to Medium/1.0×). */
export function multiplierFor(key: WiKey): number {
	return WI_TIERS.find((t) => t.key === key)?.multiplier ?? 1.0;
}

/** Maps a raw multiplier back to a tier key (used when hydrating from a persisted value). */
export function tierForMultiplier(multiplier: number): WiKey {
	return WI_TIERS.find((t) => t.multiplier === multiplier)?.key ?? 'Medium';
}
// #endregion

// #region Deterministic seeding
/** A tiny, stable string hash so seeded figures never change between renders. */
function hash(input: string): number {
	let h = 2166136261;
	for (let i = 0; i < input.length; i++) {
		h ^= input.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return Math.abs(h);
}

/** Minimal shape this model needs from a project stage (a subset of ProjectStageResponse). */
export interface PricedStageLike {
	id?: string;
	name?: string | null;
	unit_price_cents?: number | null;
}

function seedKey(stage: PricedStageLike): string {
	return stage.id || stage.name || 'stage';
}
// #endregion

// #region Per-stage cost primitives (minor units / cents)
/**
 * The standard baseline cost for a stage at 1.0× intensity. Uses the real `unit_price_cents` when
 * present; otherwise seeds a stable value in the £140–£480 band to match the design mock.
 */
export function stageBaseCents(stage: PricedStageLike): number {
	if (stage.unit_price_cents && stage.unit_price_cents > 0) return stage.unit_price_cents;
	const steps = hash(seedKey(stage)) % 9; // 0..8
	return (140 + steps * 40) * 100; // £140 … £460
}

/** The per-stage revision surcharge rate (30–40%), stable per stage. */
function stageRevisionRate(stage: PricedStageLike): number {
	return 0.3 + (hash(seedKey(stage) + ':rev') % 3) * 0.05; // 0.30 / 0.35 / 0.40
}

/** True when a stage carries an (early-/on-time delivery) deadline bonus in the preview. */
export function stageHasBonus(stage: PricedStageLike): boolean {
	return stageBaseCents(stage) >= 30000; // ≥ £300 stages advertise a bonus
}

/** The deadline-bonus amount for a stage (0 when it does not qualify), rounded to £10. */
export function stageBonusCents(stage: PricedStageLike): number {
	if (!stageHasBonus(stage)) return 0;
	const raw = stageBaseCents(stage) * 0.25;
	return Math.round(raw / 1000) * 1000; // nearest £10
}
// #endregion

// #region Resolved cost bundle
export interface StageCost {
	/** Baseline cost at 1.0× intensity. */
	baseCents: number;
	/** Baseline cost scaled by the active workload-intensity multiplier. */
	adjustedCents: number;
	/** Max additional cost if every allowed revision is consumed on this stage. */
	revisionCents: number;
	/** Early/on-time delivery bonus advertised for this stage (0 when none). */
	bonusCents: number;
}

/** Resolves the full cost bundle for a single stage at a given intensity multiplier. */
export function computeStageCost(stage: PricedStageLike, multiplier: number): StageCost {
	const baseCents = stageBaseCents(stage);
	const adjustedCents = Math.round(baseCents * multiplier);
	return {
		baseCents,
		adjustedCents,
		revisionCents: Math.round(adjustedCents * stageRevisionRate(stage)),
		bonusCents: stageBonusCents(stage),
	};
}

export interface TicketCostSummary {
	/** Number of stages folded into the totals. */
	stageCount: number;
	/** Sum of intensity-adjusted baselines — the low (standard) estimate. */
	standardCents: number;
	/** Sum of revision surcharges — the overhead added to reach the high estimate. */
	revisionOverheadCents: number;
	/** standard + overhead — the high estimate. */
	maxCents: number;
	/** Sum of advertised deadline bonuses across the folded stages. */
	bonusCents: number;
}

/** Aggregates a set of stages into the ticket-level standard/max cost range (spec §2A). */
export function summarizeTicketCost(
	stages: PricedStageLike[],
	multiplier: number,
): TicketCostSummary {
	let standardCents = 0;
	let revisionOverheadCents = 0;
	let bonusCents = 0;
	for (const stage of stages) {
		const cost = computeStageCost(stage, multiplier);
		standardCents += cost.adjustedCents;
		revisionOverheadCents += cost.revisionCents;
		bonusCents += cost.bonusCents;
	}
	return {
		stageCount: stages.length,
		standardCents,
		revisionOverheadCents,
		maxCents: standardCents + revisionOverheadCents,
		bonusCents,
	};
}
// #endregion

// #region Formatting
/**
 * Formats minor units (cents) as a whole-unit currency string, e.g. `£1,160`. Defaults to GBP to
 * match the platform mock; pass a 3-letter ISO code to localize. Fractional pennies are only shown
 * when the amount is not a whole unit.
 */
export function formatMoney(cents: number, currency = 'GBP'): string {
	const units = cents / 100;
	const hasFraction = Math.round(units) !== units;
	try {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency,
			minimumFractionDigits: hasFraction ? 2 : 0,
			maximumFractionDigits: hasFraction ? 2 : 0,
		}).format(units);
	} catch {
		// Unknown currency code — fall back to a plain prefixed number.
		return `${currency} ${units.toFixed(hasFraction ? 2 : 0)}`;
	}
}
// #endregion
