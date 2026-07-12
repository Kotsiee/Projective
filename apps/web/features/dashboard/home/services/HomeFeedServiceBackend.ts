/**
 * @file HomeFeedServiceBackend.ts
 * @description Server-side assembly for the persona-adaptive `/home` feed. It resolves recommendation
 * pools from the live discovery engine (`SearchEngineServiceBackend` federated search → ranked
 * `ScoredEntity` rows → `scoredToExplore` → `EntityCardModel`) and backfills any empty bucket from the
 * curated seed, so the feed is always rich even when the ranking engine is cold or the local dev SSR
 * path is degraded. Persona then shapes which pools become reels vs. standard cards, and the
 * mixed-media rule engine interleaves reels + sponsored + text.
 *
 * Islands never call this — the `/home` route (first paint) and the `/api/v1/home/feed` route
 * (infinite-scroll pages) delegate here. State flows one way (see apps/web/CLAUDE.md).
 */

import type { SupabaseClient } from 'supabaseClient';
import type {
	EntityCardModel,
	EntityCardVariant,
	GlobalSearchResponse,
	HomeFeedPage,
	HomeHighlight,
	HomeInsights,
	Persona,
} from '@projective/types';
import { SearchEngineServiceBackend } from '@features/public/explore/services/SearchEngineServiceBackend.ts';
import { scoredToExplore } from '@features/public/explore/services/scoredToExplore.ts';
import { buildFeedPage, type FeedPools, type FeedReel } from '../rules/mixedMedia.ts';
import {
	personaHighlights,
	personaInsights,
	SEED_PROJECTS,
	SEED_SERVICES,
	SEED_TALENT,
	SEED_TEAMS,
	SPONSORED_POOL,
	TEXT_POOL_CLIENT,
	TEXT_POOL_FREELANCER,
} from '../data/homeSeed.ts';

type Deps = { getClient: () => Promise<SupabaseClient> };

interface EntityPools {
	projects: EntityCardModel[];
	services: EntityCardModel[];
	talent: EntityCardModel[];
	teams: EntityCardModel[];
}

const REASONS = [
	'Matches your skills',
	'Trending in your field',
	'Recommended for you',
	'Fresh this week',
];

/**
 * Resolve the four recommendation buckets. Tries the live federated ranking engine first; any bucket
 * that comes back empty (or the whole call failing) is backfilled from the seed so reels never render
 * empty. Best-effort by design — a discovery outage degrades to seed, never to a broken feed.
 */
async function loadEntityPools(deps: Deps): Promise<EntityPools> {
	let projects: EntityCardModel[] = [];
	let services: EntityCardModel[] = [];
	let talent: EntityCardModel[] = [];
	let teams: EntityCardModel[] = [];

	try {
		const res = await SearchEngineServiceBackend.search(
			{ query: '', entityType: '', sort: 'recommended', filters: {}, limit: 24, offset: 0 },
			deps,
		);
		if (res.ok && res.data.mode === 'global') {
			const s = (res.data as GlobalSearchResponse).sections;
			projects = s.projects.map(scoredToExplore);
			services = s.services.map(scoredToExplore);
			const profiles = s.profiles.map(scoredToExplore);
			talent = profiles.filter((p) => p.entity_type !== 'team' && p.entity_type !== 'business');
			teams = profiles.filter((p) => p.entity_type === 'team' || p.entity_type === 'business');
		}
	} catch (_) {
		// Discovery unavailable — fall through to seed backfill below.
	}

	return {
		projects: projects.length ? projects : SEED_PROJECTS,
		services: services.length ? services : SEED_SERVICES,
		talent: talent.length ? talent : SEED_TALENT,
		teams: teams.length ? teams : SEED_TEAMS,
	};
}

/** Zip two card pools alternately, tagging each with a rotating "why you see this" reason. */
function interleave(
	a: EntityCardModel[],
	av: EntityCardVariant,
	b: EntityCardModel[],
	bv: EntityCardVariant,
): FeedPools['standard'] {
	const out: FeedPools['standard'] = [];
	const max = Math.max(a.length, b.length);
	for (let i = 0; i < max; i++) {
		if (i < a.length) {
			out.push({ entity: a[i], variant: av, reason: REASONS[out.length % REASONS.length] });
		}
		if (i < b.length) {
			out.push({ entity: b[i], variant: bv, reason: REASONS[out.length % REASONS.length] });
		}
	}
	return out;
}

/**
 * Shape persona-specific pools. Freelancers are steered toward projects to join, open collaborative
 * teams, and roles that match them; clients toward premium services, top-rated talent, and their
 * active projects.
 */
function buildPools(persona: Persona, pools: EntityPools): FeedPools {
	let reels: FeedReel[];
	let standard: FeedPools['standard'];

	if (persona === 'freelancer') {
		reels = [
			{
				eyebrow: 'For you',
				title: 'Projects looking for you',
				subtitle: 'Open roles matched to your skills',
				entities: pools.projects,
				variant: 'project',
			},
			{
				eyebrow: 'Momentum',
				title: 'Teams gaining momentum',
				subtitle: 'Collectives hiring collaborators now',
				entities: pools.teams,
				variant: 'profile',
			},
			{
				eyebrow: 'Top rated',
				title: 'Live portfolio highlights',
				subtitle: 'Talent setting the bar this week',
				entities: pools.talent,
				variant: 'profile',
			},
		];
		standard = interleave(pools.projects, 'project', pools.services, 'service');
	} else {
		reels = [
			{
				eyebrow: 'For you',
				title: 'Premium services to hire',
				subtitle: 'Hand-picked, top-rated delivery',
				entities: pools.services,
				variant: 'service',
			},
			{
				eyebrow: 'Top rated',
				title: 'Top-rated independent talent',
				subtitle: 'Available specialists, ranked for you',
				entities: pools.talent,
				variant: 'profile',
			},
			{
				eyebrow: 'Your work',
				title: 'Projects to revisit',
				subtitle: 'Active briefs and where they stand',
				entities: pools.projects,
				variant: 'project',
			},
		];
		standard = interleave(pools.services, 'service', pools.talent, 'profile');
	}

	return {
		standard,
		reels: reels.filter((r) => r.entities.length > 0),
		sponsored: SPONSORED_POOL,
		text: persona === 'freelancer' ? TEXT_POOL_FREELANCER : TEXT_POOL_CLIENT,
	};
}

export interface HomeFeedResult {
	persona: Persona;
	insights: HomeInsights;
	highlights: HomeHighlight[];
	feed: HomeFeedPage;
}

export class HomeFeedServiceBackend {
	/** First-paint payload: pools + insights + highlights + the first mixed-media page. */
	static async getHomeData(persona: Persona, deps: Deps): Promise<HomeFeedResult> {
		const pools = await loadEntityPools(deps);
		const feedPools = buildPools(persona, pools);
		return {
			persona,
			insights: personaInsights(persona),
			highlights: personaHighlights(persona),
			feed: buildFeedPage(0, feedPools),
		};
	}

	/** A single infinite-scroll page (offset ≥ 1). Returns `nextOffset: null` when exhausted. */
	static async getFeedPage(persona: Persona, offset: number, deps: Deps): Promise<HomeFeedPage> {
		const pools = await loadEntityPools(deps);
		const feedPools = buildPools(persona, pools);
		return buildFeedPage(offset, feedPools);
	}
}
