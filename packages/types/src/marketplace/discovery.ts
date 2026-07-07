/**
 * @file discovery.ts
 * @description Contracts for the Unified Explore & Discovery Engine. Extends the normalized
 * `PartialEntityResponse` with discovery-only presentation concerns (sponsorship, taxonomy
 * flags, denormalized owner identity, and entity-specific density metadata) plus the shared
 * category taxonomy and the advanced filter parameter set consumed by the search workspace.
 */

import { z } from 'zod';
import { EntityTypeSchema, PartialEntityResponseSchema } from '../core/base-response.ts';

// #region 1. TAXONOMY & AVAILABILITY

/**
 * A highly-visible taxonomy flag surfaced on profile-family cards so Freelancers, Teams, and
 * Businesses can share one card foundation while still being instantly distinguishable.
 */
export const EntityTaxonomySchema = z.enum([
	'solo',
	'agency',
	'team',
	'business',
	'studio',
]);
export type EntityTaxonomy = z.infer<typeof EntityTaxonomySchema>;

export const AvailabilitySchema = z.enum(['available', 'busy', 'unavailable']);
export type Availability = z.infer<typeof AvailabilitySchema>;

/** Accent identities used to tint category pills and sponsored/feature banners. */
export const AccentSchema = z.enum([
	'mint',
	'violet',
	'amber',
	'ocean',
	'ember',
	'forest',
	'primary',
	'neutral',
]);
export type Accent = z.infer<typeof AccentSchema>;

// #endregion

// #region 2. ENTITY-SPECIFIC DENSITY METADATA

/** High-density scope details rendered on wide project cards and in the inspector. */
export const ProjectScopeSchema = z.object({
	role_count: z.number().int().nonnegative(),
	stage_count: z.number().int().nonnegative(),
	duration_weeks: z.number().int().nonnegative(),
	budget_min_cents: z.number().int().nonnegative(),
	budget_max_cents: z.number().int().nonnegative(),
	format: z.enum(['one_off', 'pipeline', 'session']),
});
export type ProjectScope = z.infer<typeof ProjectScopeSchema>;

// #endregion

// #region 3. EXPLORE ENTITY (Discovery presentation DTO)

/**
 * The presentation-layer entity consumed by every discovery surface (home hub, federated search,
 * single-entity matrices, inspector). Extends the canonical `PartialEntityResponse` so it remains
 * compatible with normalized search results while carrying denormalized display sugar.
 */
export const ExploreEntitySchema = PartialEntityResponseSchema.extend({
	/** Native-styled sponsored placement — rendered with a soft accent indicator + micro-border frame. */
	is_sponsored: z.boolean().default(false),
	/** Non-null when the entity is an editorial/trending feature; lower rank sorts first. */
	featured_rank: z.number().int().nonnegative().nullable().default(null),
	/** Profile-family taxonomy flag (Solo / Agency / Business …). Null for non-profile entities. */
	taxonomy: EntityTaxonomySchema.nullable().default(null),

	/** Denormalized owner identity so cards render without a second lookup. */
	owner_name: z.string().min(1),
	owner_handle: z.string().min(1),
	owner_avatar: z.string().nullable().default(null),

	/** Flat display banner (gradient string or image URL) — avoids resolving `display_image` variants. */
	banner: z.string().nullable().default(null),
	accent: AccentSchema.default('primary'),

	/** Pricing (services / products). Null when not priced. */
	price_cents: z.number().int().nonnegative().nullable().default(null),
	price_unit: z.enum(['fixed', 'per_seat', 'per_hour', 'from']).nullable().default(null),
	currency: z.string().default('USD'),

	/** Profile availability + location for filtering and inspector metadata. */
	availability: AvailabilitySchema.nullable().default(null),
	location: z.string().nullable().default(null),

	/** Wide-card scope block (projects only). */
	scope: ProjectScopeSchema.nullable().default(null),
});
export type ExploreEntity = z.infer<typeof ExploreEntitySchema>;

// #endregion

// #region 4. CATEGORY TAXONOMY

export const CategorySchema = z.object({
	id: z.string(),
	name: z.string().min(1),
	slug: z.string().min(1),
	/** Tabler icon component name (e.g. 'IconCode') or an emoji glyph. */
	icon: z.string().nullable().default(null),
	accent: AccentSchema.default('neutral'),
});
export type Category = z.infer<typeof CategorySchema>;

// #endregion

// #region 5. ADVANCED FILTER PARAMETERS

/**
 * The advanced filter parameter set. Sorting/filtering is guard-railed off in the multi-entity
 * (federated) view — these parameters only take effect once a single `entity_type` is isolated.
 */
export const ExploreFiltersSchema = z.object({
	entity_type: EntityTypeSchema.nullable().default(null),
	/** Inclusive budget window in cents. */
	budget_min_cents: z.number().int().nonnegative().default(0),
	budget_max_cents: z.number().int().nonnegative().default(1_000_000),
	availability: AvailabilitySchema.nullable().default(null),
	min_rating: z.number().min(0).max(5).default(0),
	skills: z.array(z.string()).default([]),
	locations: z.array(z.string()).default([]),
	languages: z.array(z.string()).default([]),
});
export type ExploreFilters = z.infer<typeof ExploreFiltersSchema>;

export const ExploreSortSchema = z.enum(['recommended', 'rating', 'recent', 'price', 'popularity']);
export type ExploreSort = z.infer<typeof ExploreSortSchema>;

// #endregion

// #region 6. RANKING RESULTS (server → client)

/** A single scored row returned by the `search.fn_search_entities` ranking RPC. */
export const ScoredEntitySchema = z.object({
	id: z.string(),
	entity_type: EntityTypeSchema,
	title: z.string(),
	subtitle: z.string().nullable(),
	description: z.string().nullable(),
	owner_id: z.string().nullable(),
	owner_name: z.string().nullable(),
	owner_type: z.string().nullable(),
	rating_average: z.number(),
	rating_count: z.number().int(),
	price_cents: z.number().int().nullable(),
	location: z.string().nullable(),
	availability: z.string().nullable(),
	tags: z.array(z.string()),
	is_sponsored: z.boolean(),
	score: z.number(),
	/** Per-factor score contributions, for admin transparency / debugging. */
	score_breakdown: z.record(z.string(), z.number()).nullable(),
});
export type ScoredEntity = z.infer<typeof ScoredEntitySchema>;

/** Federated (multi-entity) response: fixed, unsortable/unfilterable category rows. */
export interface GlobalSearchResponse {
	mode: 'global';
	query: string;
	sections: {
		recommended: ScoredEntity[];
		services: ScoredEntity[];
		profiles: ScoredEntity[];
		projects: ScoredEntity[];
	};
}

/** Single-entity response: one ranked, sortable, filterable list. */
export interface SingleSearchResponse {
	mode: 'single';
	query: string;
	entity_type: string;
	sort: ExploreSort;
	items: ScoredEntity[];
	meta: { count: number; offset: number; limit: number };
}

export type SearchResponse = GlobalSearchResponse | SingleSearchResponse;

// #endregion
