/**
 * @file cards.ts
 * @description The shared, presentation-layer contract for the Unified Card Component
 * Architecture (`@projective/ui` `EntityCard` + its `Service/Profile/Project/Product` variants).
 *
 * `EntityCardModel` is the render-relevant *data* subset every card consumes. It is deliberately a
 * plain interface (not a Zod schema) so it stays free of parsing/default concerns and so the rich
 * discovery DTO `ExploreEntity` is **structurally assignable to it** with no adapter — the Explore
 * surface passes its entities straight through. Non-discovery surfaces (profile tabs, workspace
 * switchers) build one via a small `*ToCardModel` adapter and lean on the optional fields below to
 * migrate their bespoke metadata losslessly.
 *
 * VNode-bearing concerns (menu icons, click handlers) intentionally live in the UI layer's prop
 * types, never here — this package stays presentation-framework agnostic.
 */

import type { EntityType } from '../core/base-response.ts';
import type { Accent, Availability, EntityTaxonomy, ProjectScope } from './discovery.ts';

// #region Variant + supporting shapes

/**
 * The semantic card layouts. Each maps to an entity family:
 * - `service`  → banner + dense meta (retains premium thumbnail)
 * - `profile`  → avatar canopy over a banner (Freelancers / Teams / Businesses)
 * - `project`  → banner-free, high-density metadata only
 * - `product`  → image-forward masonry poster
 * - `compact`  → horizontal list / dropdown row (e.g. nav workspace switcher)
 */
export type EntityCardVariant = 'service' | 'profile' | 'project' | 'product' | 'compact';

/** Tonal intent for a status pill (maps to accent tokens in the card stylesheet). */
export type EntityCardStatusTone = 'success' | 'neutral' | 'warning' | 'danger';

/** A status pill rendered on the project variant (e.g. active / completed / archived). */
export interface EntityCardStatus {
	label: string;
	tone: EntityCardStatusTone;
}

/**
 * A generic metadata stat for the project variant when there is no structured `scope`
 * (e.g. repo-style star / fork / member counts). `key` selects the icon via the card's internal
 * registry, keeping this contract free of any component/VNode reference.
 */
export type EntityCardStatKey = 'stars' | 'forks' | 'contributions' | 'members' | 'views' | 'clock';

export interface EntityCardStat {
	key: EntityCardStatKey;
	value: string | number;
}

// #endregion

// #region Card model

/**
 * The unified, presentation-layer data model consumed by every card. The first block mirrors the
 * fields `ExploreEntity` already exposes (so it is assignable with zero mapping); the second block
 * is optional presentational sugar used by adapters migrating legacy cards.
 */
export interface EntityCardModel {
	// --- Core (a superset of these lives on ExploreEntity) --------------------
	id: string;
	entity_type: EntityType;
	display_title: string;
	display_description: string | null;
	tags: string[];
	rating_average: number;
	rating_count: number;

	/** Denormalized owner identity so cards render without a second lookup. */
	owner_name: string;
	owner_handle: string;
	owner_avatar: string | null;

	/** Flat display banner — a CSS background value (gradient string or `url("…")`). */
	banner: string | null;
	accent: Accent;

	/** Pricing (services / products). Null when not priced. */
	price_cents: number | null;
	price_unit: 'fixed' | 'per_seat' | 'per_hour' | 'from' | null;

	/** Profile availability + location. */
	availability: Availability | null;
	location: string | null;

	/** Structured project scope (roles / stages / duration / budget). */
	scope: ProjectScope | null;

	/** Profile-family taxonomy flag (Solo / Agency / Business …). */
	taxonomy: EntityTaxonomy | null;
	is_sponsored: boolean;

	// --- Optional presentational sugar (adapters only) ------------------------
	/** Pre-formatted price string that overrides `price_cents`/`price_unit` when set. */
	price_label?: string;
	/** Secondary heading line (e.g. project affiliation / viewer role). */
	subtitle?: string;
	/** A timeline marker (e.g. "3-day delivery", "Updated Jun 2024", "6 wks"). */
	timeline_note?: string;
	/** Status pill for the project variant. */
	status?: EntityCardStatus;
	/** Generic metadata stats for the project variant when there is no `scope`. */
	stats?: EntityCardStat[];
	/** Member count for team / business profile cards. */
	member_count?: number;
	/** The viewer's role on a team / business (e.g. "Owner", "Admin"). */
	role_label?: string;
}

// #endregion
