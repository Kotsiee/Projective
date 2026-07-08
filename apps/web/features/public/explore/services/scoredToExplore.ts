/**
 * @file scoredToExplore.ts
 * @description Adapter bridging the ranking engine's `ScoredEntity` rows (returned by
 * `/api/v1/public/search`) to the presentation-layer `ExploreEntity` the discovery cards consume.
 * The ranking RPCs return normalized, denormalized-light rows; this fills the display sugar the cards
 * need (a deterministic gradient banner + accent, a derived owner handle, price unit) so live results
 * render identically to the seed. Deterministic by `id` so a card's banner never flickers on refetch.
 */

import type { Accent, EntityType, ExploreEntity, ScoredEntity } from '@projective/types';

const ACCENTS: Accent[] = [
	'mint',
	'violet',
	'amber',
	'ocean',
	'ember',
	'forest',
	'primary',
	'neutral',
];

/** Mirror of the seed gradient palette so live + seeded cards look identical. */
const BANNERS: string[] = [
	'linear-gradient(135deg, #0b3b34 0%, #10b981 55%, #34f5c5 100%)',
	'linear-gradient(135deg, #2a1b52 0%, #7c3aed 55%, #a78bfa 100%)',
	'linear-gradient(135deg, #43290a 0%, #f59e0b 55%, #fcd34d 100%)',
	'linear-gradient(135deg, #082f49 0%, #0284c7 55%, #38bdf8 100%)',
	'linear-gradient(135deg, #3b0764 0%, #db2777 55%, #fb7185 100%)',
	'linear-gradient(135deg, #052e16 0%, #16a34a 55%, #86efac 100%)',
	'linear-gradient(135deg, #0f172a 0%, #334155 50%, #64748b 100%)',
	'linear-gradient(135deg, #18181b 0%, #3f3f46 60%, #52525b 100%)',
];

const OWNER_TYPE: Record<EntityType, ExploreEntity['owner_type']> = {
	person: 'freelancer',
	team: 'team',
	business: 'business',
	service: 'freelancer',
	product: 'freelancer',
	project: 'business',
};

/** Stable 32-bit string hash → deterministic banner/accent selection. */
function hash(s: string): number {
	let h = 0;
	for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
	return h;
}

function handleFrom(name: string | null, id: string): string {
	if (!name) return id;
	const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '');
	return slug || id;
}

const AVAILABILITIES = new Set(['available', 'busy', 'unavailable']);

export function scoredToExplore(s: ScoredEntity): ExploreEntity {
	const h = hash(s.id);
	const availability = s.availability && AVAILABILITIES.has(s.availability)
		? (s.availability as ExploreEntity['availability'])
		: null;

	return {
		id: s.id,
		entity_type: s.entity_type,
		created_at: '2026-01-01T00:00:00.000Z',
		updated_at: '2026-06-01T00:00:00.000Z',
		rating_average: s.rating_average,
		rating_count: s.rating_count,
		owner_id: s.owner_id ?? `owner-${s.id}`,
		owner_type: OWNER_TYPE[s.entity_type] ?? 'freelancer',
		display_title: s.title,
		display_description: s.description,
		display_image: null,
		tags: s.tags ?? [],
		is_sponsored: s.is_sponsored,
		featured_rank: null,
		taxonomy: null,
		owner_name: s.owner_name ?? s.title,
		owner_handle: handleFrom(s.owner_name, s.id),
		owner_avatar: null,
		banner: BANNERS[h % BANNERS.length],
		accent: ACCENTS[h % ACCENTS.length],
		price_cents: s.price_cents,
		price_unit: s.price_cents != null ? 'from' : null,
		currency: 'USD',
		availability,
		location: s.location,
		scope: null,
	};
}
