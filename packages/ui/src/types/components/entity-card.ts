/**
 * @file entity-card.ts
 * @description Prop contracts for the Unified Card Component Architecture. The pure-data
 * `EntityCardModel` lives in `@projective/types`; the interactive/VNode-bearing prop types live
 * here in the UI layer so the types package stays framework-agnostic.
 */

import type { VNode } from 'preact';
import type { EntityCardModel, EntityCardVariant } from '@projective/types';

/** A single entry in a card's kebab (⋮) menu — the only home for secondary/destructive actions. */
export interface EntityCardMenuItem {
	label: string;
	icon?: VNode;
	/** Renders the item in the danger tone (e.g. "Report Listing", "Leave team"). */
	danger?: boolean;
	onSelect: () => void;
}

/**
 * Props for the master `EntityCard` (and, minus `variant`, its `Service/Profile/Project/Product`
 * wrappers). Navigation is decoupled from app routes: activating the card calls `onSelect` when
 * provided (split-pane inspector), otherwise navigates to `href` (supplied by the consumer).
 */
export interface EntityCardProps {
	entity: EntityCardModel;
	variant?: EntityCardVariant;
	/** Whole-card navigation target, used when `onSelect` is not provided. */
	href?: string;
	/** When provided, activating the card selects it (inspector) instead of navigating. */
	onSelect?: (entity: EntityCardModel) => void;
	/** Highlights the card as the active selection (inspector pick / current workspace). */
	active?: boolean;
	onTagClick?: (tag: string) => void;
	/** Controlled saved state; falls back to internal state when omitted. */
	saved?: boolean;
	onSave?: (saved: boolean) => void;
	/** Kebab menu items. Defaults to a single "Report Listing" entry when omitted. */
	menuItems?: EntityCardMenuItem[];
	/** Explicit share URL; defaults to `href`. */
	shareUrl?: string;
	/**
	 * Toggles the Save·Share·kebab face cluster. Defaults to `true`. Set `false` on compact
	 * switcher rows where those actions are meaningless.
	 */
	actions?: boolean;
}

/** Convenience props for the entity-specific wrappers (variant is fixed by the wrapper). */
export type EntityCardVariantProps = Omit<EntityCardProps, 'variant'>;
