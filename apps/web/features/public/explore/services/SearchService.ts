/**
 * @file SearchService.ts
 * @description Frontend Service layer for the Unified Explore & Discovery Engine. Keeps islands thin:
 * it calls the live ranking endpoint `/api/v1/public/search` (federated + single-entity), then adapts
 * the returned `ScoredEntity` rows into presentation-ready `ExploreEntity` records via
 * {@link scoredToExplore}. All scoring/filtering/telemetry live in Postgres behind that route.
 */

import type {
	EntityType,
	ExploreEntity,
	ExploreFilters,
	ExploreSort,
	GlobalSearchResponse,
	SingleSearchResponse,
} from '@projective/types';
import type { EntityFilter } from '../contracts/Explore.ts';
import { scoredToExplore } from './scoredToExplore.ts';

export interface LiveSearchParams {
	query: string;
	/** `'all'` → federated; a concrete `EntityType` → single-entity (sort + filters unlocked). */
	type: EntityFilter;
	sort: ExploreSort;
	filters: ExploreFilters;
	limit?: number;
	offset?: number;
}

/** Federated result — a recommended row plus fixed per-type sections (all `ExploreEntity`). */
export interface LiveGlobalResult {
	mode: 'global';
	recommended: ExploreEntity[];
	sections: Record<'service' | 'person' | 'project', ExploreEntity[]>;
}

/** Single-entity result — one ranked, filtered list. */
export interface LiveSingleResult {
	mode: 'single';
	items: ExploreEntity[];
	count: number;
}

export type LiveSearchResult = LiveGlobalResult | LiveSingleResult;

export class SearchService {
	/**
	 * Query the live ranking engine. Federated when `type === 'all'`; otherwise a single ranked list
	 * with the advanced filters serialized into discrete query params (the guardrail — filters only
	 * apply in single-entity mode). Throws on a non-2xx response so callers can fall back to the seed.
	 */
	static async query(p: LiveSearchParams): Promise<LiveSearchResult> {
		const usp = new URLSearchParams();
		if (p.query) usp.set('q', p.query);
		usp.set('type', p.type);
		usp.set('sort', p.sort);
		usp.set('limit', String(p.limit ?? 30));
		usp.set('offset', String(p.offset ?? 0));

		if (p.type !== 'all') {
			const f = p.filters;
			if (f.min_rating > 0) usp.set('min_rating', String(f.min_rating));
			if (f.budget_min_cents > 0) usp.set('budget_min_cents', String(f.budget_min_cents));
			if (f.budget_max_cents < 1_000_000) usp.set('budget_max_cents', String(f.budget_max_cents));
			if (f.availability) usp.set('availability', f.availability);
			for (const skill of f.skills) usp.append('skill', skill);
		}

		const res = await fetch(`/api/v1/public/search?${usp.toString()}`, {
			headers: { Accept: 'application/json' },
		});
		if (!res.ok) throw new Error(`Search failed: ${res.status}`);

		const data = await res.json() as GlobalSearchResponse | SingleSearchResponse;

		if (data.mode === 'global') {
			return {
				mode: 'global',
				recommended: data.sections.recommended.map(scoredToExplore),
				sections: {
					service: data.sections.services.map(scoredToExplore),
					person: data.sections.profiles.map(scoredToExplore),
					project: data.sections.projects.map(scoredToExplore),
				},
			};
		}

		return {
			mode: 'single',
			items: data.items.map(scoredToExplore),
			count: data.meta.count,
		};
	}

	/** Fire-and-forget behavioural telemetry (guest-safe). Never throws into the UI. */
	static track(event: {
		event_type: string;
		entity_id?: string;
		entity_type?: EntityType;
		query?: string;
	}): void {
		try {
			fetch('/api/v1/public/search/track', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(event),
				keepalive: true,
			}).catch(() => {});
		} catch (_) {
			// ignore
		}
	}
}
