/**
 * @file mixedMedia.ts
 * @description The "Mixed-Media Layout Rule Engine". Given persona-resolved entity pools + reels +
 * sponsored/text seeds, it deterministically assembles one page of the feed by alternating templates
 * so vertical scrolling never becomes monotonous:
 *   - standard cards (recommended items)
 *   - a horizontal reel (top-rated recommendations / live highlights)
 *   - a sponsored slot every ~5–7 items (advert-network placeholder)
 *   - the occasional text card (insight / prompt / quote)
 *
 * Every emitted item carries a feed-position-unique `id` (so the infinite-scroll list has stable keys
 * even though the underlying entity pool cycles), and the whole thing is a pure function of
 * `(offset, pools)` — the same page always rebuilds identically, which keeps SSR and client appends
 * in lockstep.
 */

import type {
	EntityCardModel,
	EntityCardVariant,
	HomeFeedItem,
	HomeFeedPage,
} from '@projective/types';
import type { SponsoredSeed, TextSeed } from '../data/homeSeed.ts';

export interface FeedReel {
	eyebrow?: string;
	title: string;
	subtitle?: string;
	entities: EntityCardModel[];
	variant?: EntityCardVariant;
}

export interface FeedPools {
	/** Flat pool of recommended items rendered as standard cards (cycled across pages). */
	standard: { entity: EntityCardModel; variant?: EntityCardVariant; reason?: string }[];
	/** Named horizontal reels, rotated one-per-page. */
	reels: FeedReel[];
	sponsored: SponsoredSeed[];
	text: TextSeed[];
}

/** Standard cards drawn per page. Combined with 1 reel + occasional text/sponsored → ~6–7 items. */
const CARDS_PER_PAGE = 4;
/** Graceful termination for the "infinite" feed. */
const MAX_PAGES = 8;

const at = <T>(arr: T[], i: number): T | undefined =>
	arr.length ? arr[((i % arr.length) + arr.length) % arr.length] : undefined;

/**
 * Build the feed page at `offset` (0-based). Returns items in render order plus the next offset
 * (null once the feed is exhausted).
 */
export function buildFeedPage(offset: number, pools: FeedPools): HomeFeedPage {
	const items: HomeFeedItem[] = [];
	const cardBase = offset * CARDS_PER_PAGE;

	// 1) Lead with a rotating reel so every screenful has a horizontal skim rail.
	const reel = at(pools.reels, offset);
	if (reel && reel.entities.length) {
		items.push({
			kind: 'reel',
			id: `reel-${offset}`,
			eyebrow: reel.eyebrow,
			title: reel.title,
			subtitle: reel.subtitle,
			entities: reel.entities,
			variant: reel.variant,
		});
	}

	// 2) A run of standard cards, cycling the pool so later pages surface fresh combinations.
	for (let i = 0; i < CARDS_PER_PAGE; i++) {
		const pick = at(pools.standard, cardBase + i);
		if (!pick) break;
		items.push({
			kind: 'card',
			id: `card-${offset}-${i}`,
			entity: pick.entity,
			variant: pick.variant,
			reason: pick.reason,
		});

		// 3) A text card mid-page on alternating pages breaks the card cadence.
		if (i === 1 && offset % 2 === 0) {
			const t = at(pools.text, Math.floor(offset / 2));
			if (t) {
				items.push({
					kind: 'text',
					id: `text-${offset}`,
					tone: t.tone,
					eyebrow: t.eyebrow,
					title: t.title,
					body: t.body,
					author: t.author,
					ctaLabel: t.ctaLabel,
					ctaHref: t.ctaHref,
					accent: t.accent,
				});
			}
		}
	}

	// 4) One sponsored slot per page → lands every ~6–7 items down the array.
	const sp = at(pools.sponsored, offset);
	if (sp) {
		items.push({
			kind: 'sponsored',
			id: `sp-${offset}`,
			label: sp.label,
			title: sp.title,
			body: sp.body,
			ctaLabel: sp.ctaLabel,
			ctaHref: sp.ctaHref,
			sponsorName: sp.sponsorName,
			accent: sp.accent,
			media: sp.media,
		});
	}

	return {
		items,
		nextOffset: offset + 1 < MAX_PAGES ? offset + 1 : null,
	};
}
