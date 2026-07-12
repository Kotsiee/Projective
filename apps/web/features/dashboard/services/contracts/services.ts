/**
 * @file services.ts
 * @description Contracts + pure helpers for the independent Services management suite
 * (`/services`). This is a listings/pricing/analytics workspace — NOT a project workspace — so the
 * vocabulary is listings, tiers and performance metrics. Everything here is presentation-layer;
 * today the shapes are filled by frontend seed (`data/servicesSeed.ts`) behind
 * `ServicesServiceBackend`, and map 1:1 onto a future `services.*` backend.
 */

import type { PipelinePoint } from '@projective/types';
import type { AreaLineSeries } from '@projective/charts/finance';

export type ServiceStatus = 'active' | 'draft' | 'paused' | 'archived';

/** MetricCard accents we allow on the KPI rail (subset of the shared `MetricAccent`). */
export type ServiceAccent = 'primary' | 'mint' | 'violet' | 'amber';

/** One pricing tier within a listing (e.g. Essential / Signature / Flagship). */
export interface ServiceTier {
	id: string;
	name: string;
	priceCents: number;
	/** Turnaround in days. */
	deliveryDays: number;
	/** Included revisions; `-1` means unlimited. */
	revisions: number;
	blurb: string;
	features: string[];
	/** Highlighted as the recommended tier. */
	featured?: boolean;
}

/** Rolled-up performance for a single listing. */
export interface ServiceListingStats {
	views30d: number;
	inquiries30d: number;
	/** Inquiry → won conversion, whole percent. */
	conversionPct: number;
	activeClients: number;
	pipelineValueCents: number;
}

/** A sellable service listing with its pricing ladder + performance. */
export interface ServiceListing {
	id: string;
	title: string;
	summary: string;
	category: string;
	/** The service's custom asset thumbnail (its own image — not a person). Null → gradient tile. */
	thumbnailUrl: string | null;
	status: ServiceStatus;
	tiers: ServiceTier[];
	stats: ServiceListingStats;
	updatedAt: string;
}

/** One headline KPI on the analytics rail. */
export interface ServiceKpi {
	key: string;
	label: string;
	/** Preformatted display value, e.g. "12.4K", "6.8%", "$182K". */
	value: string;
	sublabel?: string;
	/** Signed percent change vs the prior period. */
	delta: number;
	/** Tiny trend series for the inline sparkline. */
	spark: number[];
	accent: ServiceAccent;
}

/** Legend/colour mapping for the performance scatter. */
export interface ServiceCategoryStyle {
	category: string;
	label: string;
	color: string;
}

/** The executive analytics block feeding the charts + KPI rail. */
export interface ServiceAnalytics {
	currency: string;
	kpis: ServiceKpi[];
	/** Monetary trend (value_cents) — pipeline vs won, over the trailing weeks. */
	pipelineSeries: AreaLineSeries[];
	/** Per-listing performance nodes for the Pipeline Flow scatter. */
	performance: PipelinePoint[];
	categories: ServiceCategoryStyle[];
}

/** The whole `/services` payload resolved server-side and handed to the island as `initialData`. */
export interface ServicesOverview {
	currency: string;
	listings: ServiceListing[];
	analytics: ServiceAnalytics;
}

// #region Pure helpers

const STATUS_TONE: Record<ServiceStatus, 'success' | 'neutral' | 'warning' | 'danger'> = {
	active: 'success',
	draft: 'neutral',
	paused: 'warning',
	archived: 'danger',
};

export function serviceStatusTone(status: ServiceStatus) {
	return STATUS_TONE[status];
}

export function serviceStatusLabel(status: ServiceStatus): string {
	return status.charAt(0).toUpperCase() + status.slice(1);
}

/** Compact money format from cents. Falls back gracefully when Intl is unavailable. */
export function formatMoney(cents: number, currency = 'USD', compact = false): string {
	const amount = cents / 100;
	try {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency,
			maximumFractionDigits: compact ? 1 : 0,
			notation: compact ? 'compact' : 'standard',
		}).format(amount);
	} catch {
		return `$${Math.round(amount).toLocaleString()}`;
	}
}

/** Compact count format, e.g. 12400 → "12.4K". */
export function formatCount(n: number): string {
	try {
		return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
			.format(n);
	} catch {
		return `${n}`;
	}
}

/** The lowest tier price across a listing, for the "from $X" label. */
export function startingPriceCents(listing: ServiceListing): number {
	if (listing.tiers.length === 0) return 0;
	return Math.min(...listing.tiers.map((t) => t.priceCents));
}

/** Revisions label: `-1` → "Unlimited". */
export function revisionsLabel(revisions: number): string {
	return revisions < 0 ? 'Unlimited' : `${revisions}`;
}

// #endregion
