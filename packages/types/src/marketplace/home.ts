/**
 * @file home.ts
 * @description Presentation contracts for the persona-adaptive `/home` engagement feed (the
 * ultra-premium discovery surface that replaced the business-only `/dashboard`). These are plain
 * interfaces — no Zod — because the feed is assembled server-side from live discovery results
 * (`ExploreEntity`, structurally assignable to `EntityCardModel`) plus curated seed fallback, then
 * streamed to the client for infinite scroll. VNode/handler concerns stay in the app + UI layers.
 *
 * The feed is a discriminated union (`HomeFeedItem`) so the "Mixed-Media Layout Rule Engine" can
 * alternate templates — standard cards, horizontal reels, sponsored slots, and text cards — without
 * the renderer branching on ad-hoc shape checks.
 */

import type { EntityCardModel, EntityCardVariant } from './cards.ts';
import type { Accent } from './discovery.ts';

// #region Persona

/**
 * The two audiences the `/home` feed adapts to. Derived server-side from the session context:
 * `freelancer` when acting as a freelancer profile or inside a team; otherwise `client` (a
 * hiring client / operator / business persona).
 */
export type Persona = 'freelancer' | 'client';

/**
 * Accent token suffix for the feed's non-entity templates (sponsored / text cards). Widens the
 * discovery `Accent` with the luxury-only tokens (`gold`, `champagne`) that exist as CSS variables
 * but never apply to a marketplace entity.
 */
export type FeedAccent = Accent | 'gold' | 'champagne';

// #endregion

// #region Profile setup completeness

/** One actionable row in the "finish setting up your profile" checklist. */
export interface ProfileSetupStep {
	/** Stable key (also selects the checklist icon in the UI). */
	key: string;
	label: string;
	description: string;
	done: boolean;
	/** Deep-link to the relevant profile-edit section (e.g. `/nadia?edit=1#details`). */
	href: string;
}

/**
 * A public "go-live" threshold partway along the completeness bar. Reaching it means the profile
 * carries enough baseline data to be made public — to sell premium services and apply to project
 * workspaces — even before overall completeness hits 100%. Rendered as a distinct marker on the
 * progress bar (see the UI `ProgressMeter`). Only present for personas the threshold applies to
 * (freelancers); a pure hiring client has no public go-live gate, so `milestone` is omitted.
 */
export interface ProfileSetupMilestone {
	/** Position of the marker along the bar, as a whole-number percent (0–100) of total weight. */
	percent: number;
	/** Whether every baseline step gating the threshold is complete (the profile can go public). */
	reached: boolean;
	/** Short marker caption, e.g. "Go-live". */
	label: string;
	/** One-line explanation of what unlocking the milestone grants. */
	description: string;
}

/**
 * A completeness snapshot shared by every surface that renders the tracker (home hero, nav profile
 * dropdown, profile side rail) so they never disagree. `percent` is a whole number 0–100 with a
 * baseline floor for simply having created the account.
 */
export interface ProfileSetupSummary {
	percent: number;
	completed: number;
	total: number;
	steps: ProfileSetupStep[];
	/** Optional public go-live threshold marker (freelancer personas only). */
	milestone?: ProfileSetupMilestone;
}

// #endregion

// #region Mixed-media feed items

/** A standard recommended card (uses the shared luxury `EntityCard`). */
export interface HomeFeedCardItem {
	kind: 'card';
	id: string;
	entity: EntityCardModel;
	variant?: EntityCardVariant;
	/** Optional "why you're seeing this" eyebrow (e.g. "Matches your React skill"). */
	reason?: string;
}

/** A named horizontal reel — a touch/drag carousel of cards skimmed inline. */
export interface HomeFeedReelItem {
	kind: 'reel';
	id: string;
	eyebrow?: string;
	title: string;
	subtitle?: string;
	entities: EntityCardModel[];
	variant?: EntityCardVariant;
}

/** A sponsored / advert slot — a beautifully framed placeholder for a future ad network. */
export interface HomeFeedSponsoredItem {
	kind: 'sponsored';
	id: string;
	label: string;
	title: string;
	body: string;
	ctaLabel: string;
	ctaHref: string;
	sponsorName: string;
	sponsorAvatar?: string | null;
	accent?: FeedAccent;
	/** A CSS background value (gradient string or `url("…")`) for the media panel. */
	media?: string | null;
}

/** A text card — insight / quote / prompt / milestone — breaking up the card rhythm. */
export interface HomeFeedTextItem {
	kind: 'text';
	id: string;
	tone: 'insight' | 'quote' | 'prompt' | 'milestone';
	eyebrow?: string;
	title: string;
	body?: string;
	author?: { name: string; handle?: string; avatar?: string | null };
	ctaLabel?: string;
	ctaHref?: string;
	accent?: FeedAccent;
}

export type HomeFeedItem =
	| HomeFeedCardItem
	| HomeFeedReelItem
	| HomeFeedSponsoredItem
	| HomeFeedTextItem;

/** One streamed page of feed items. `nextOffset` is null when the feed is exhausted. */
export interface HomeFeedPage {
	items: HomeFeedItem[];
	nextOffset: number | null;
}

// #endregion

// #region Insights + highlights

/** A single micro-analytics readout in the personal-insights column. */
export interface HomeInsightMetric {
	key: string;
	label: string;
	value: string;
	/** Signed percentage delta vs the previous period (e.g. +18 = up 18%). */
	delta?: number;
	/** A tiny series for an inline sparkline. */
	spark?: number[];
}

/** The personal-insights sidebar payload (profile glance + light dials + cash micro-graph). */
export interface HomeInsights {
	headline: string;
	/** 0–100 for the profile-visibility dial. */
	visibilityPercent: number;
	visibilityLabel: string;
	metrics: HomeInsightMetric[];
	/** Earnings/spending micro-graph points (cents), plotted with the charts area chart. */
	cashSeries?: { t: string; value_cents: number }[];
	cashLabel?: string;
	cashCurrency?: string;
}

/** A single row in the floating highlights strip (deadlines, updates, inbox snippets). */
export interface HomeHighlight {
	id: string;
	kind: 'deadline' | 'update' | 'inbox' | 'milestone';
	title: string;
	meta?: string;
	href?: string;
	/** ISO datetime powering a live countdown when `kind === 'deadline'`. */
	deadlineIso?: string;
	accent?: Accent;
}

// #endregion

// #region Aggregate

/** The full server-resolved payload for a first paint of `/home`. */
export interface HomeData {
	persona: Persona;
	greeting: string;
	displayName: string | null;
	profileSetup: ProfileSetupSummary;
	insights: HomeInsights;
	highlights: HomeHighlight[];
	feed: HomeFeedPage;
}

// #endregion
