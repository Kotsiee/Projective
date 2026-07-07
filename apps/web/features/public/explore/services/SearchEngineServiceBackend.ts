/**
 * @file SearchEngineServiceBackend.ts
 * @description Server-side service for the Unified Explore & Discovery Engine. Thin orchestration
 * over the Postgres ranking RPCs (search.fn_search_*) — all scoring, weighting, pgvector similarity
 * and telemetry live in the database (see supabase/migrations/0213-0216). Islands never touch these
 * tables directly; they call the /api/v1/public/search route which delegates here.
 */

import type { SupabaseClient } from 'supabaseClient';
import type {
	ExploreSort,
	GlobalSearchResponse,
	ScoredEntity,
	SingleSearchResponse,
} from '@projective/types';

type Deps = { getClient: () => Promise<SupabaseClient> };

type ServiceResult<T> =
	| { ok: true; data: T }
	| { ok: false; error: { code: string; message: string; status: number } };

export interface SearchParams {
	query: string;
	/** '' | 'all' → federated; a concrete entity type → single-entity view. */
	entityType: string;
	sort: ExploreSort;
	filters: Record<string, unknown>;
	limit: number;
	offset: number;
}

const FEDERATED = new Set(['', 'all', 'everything']);

// PostgREST returns numeric/bigint as string to preserve precision — coerce defensively.
function num(v: unknown): number {
	const n = typeof v === 'string' ? Number(v) : (v as number);
	return Number.isFinite(n) ? n : 0;
}

function coerce(row: Record<string, unknown>): ScoredEntity {
	return {
		id: String(row.id),
		entity_type: row.entity_type as ScoredEntity['entity_type'],
		title: (row.title as string) ?? '',
		subtitle: (row.subtitle as string) ?? null,
		description: (row.description as string) ?? null,
		owner_id: (row.owner_id as string) ?? null,
		owner_name: (row.owner_name as string) ?? null,
		owner_type: (row.owner_type as string) ?? null,
		rating_average: num(row.rating_average),
		rating_count: num(row.rating_count),
		price_cents: row.price_cents == null ? null : num(row.price_cents),
		location: (row.location as string) ?? null,
		availability: (row.availability as string) ?? null,
		tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
		is_sponsored: Boolean(row.is_sponsored),
		score: num(row.score),
		score_breakdown: (row.score_breakdown as Record<string, number>) ?? null,
	};
}

export class SearchEngineServiceBackend {
	/**
	 * Contextual entry point. Global (no/`all` entity) → categorized rows with sorting/filtering
	 * DISABLED by contract. A concrete entity type → a single ranked list with sort + filters UNLOCKED.
	 * Query execution telemetry is recorded via fn_log_query on every call.
	 */
	static async search(
		params: SearchParams,
		deps: Deps,
	): Promise<ServiceResult<GlobalSearchResponse | SingleSearchResponse>> {
		const client = await deps.getClient();
		const isFederated = FEDERATED.has(params.entityType.toLowerCase());
		const started = Date.now();

		if (isFederated) {
			const { data, error } = await client
				.schema('search')
				.rpc('fn_search_global', { p_query: params.query, p_limit: params.limit });

			if (error) return SearchEngineServiceBackend.fail(error);

			const s = (data ?? {}) as Record<string, Record<string, unknown>[]>;
			const sections = {
				recommended: (s.recommended ?? []).map(coerce),
				services: (s.services ?? []).map(coerce),
				profiles: (s.profiles ?? []).map(coerce),
				projects: (s.projects ?? []).map(coerce),
			};
			const total = Object.values(sections).reduce((n, arr) => n + arr.length, 0);
			await SearchEngineServiceBackend.log(client, params, total, Date.now() - started);

			return { ok: true, data: { mode: 'global', query: params.query, sections } };
		}

		// Single-entity: sorting + filters unlocked.
		const { data, error } = await client
			.schema('search')
			.rpc('fn_search_entities', {
				p_entity_type: params.entityType,
				p_query: params.query,
				p_filters: params.filters ?? {},
				p_sort: params.sort,
				p_limit: params.limit,
				p_offset: params.offset,
			});

		if (error) return SearchEngineServiceBackend.fail(error);

		const items = ((data ?? []) as Record<string, unknown>[]).map(coerce);
		await SearchEngineServiceBackend.log(client, params, items.length, Date.now() - started);

		return {
			ok: true,
			data: {
				mode: 'single',
				query: params.query,
				entity_type: params.entityType,
				sort: params.sort,
				items,
				meta: { count: items.length, offset: params.offset, limit: params.limit },
			},
		};
	}

	/** Record a behavioural interest event (click / impression / save …). Guest-safe. */
	static async trackInterest(
		event: { event_type: string; entity_id?: string; entity_type?: string; query?: string; session_id?: string },
		deps: Deps,
	): Promise<ServiceResult<null>> {
		const client = await deps.getClient();
		const { error } = await client.schema('search').from('interest_events').insert({
			event_type: event.event_type,
			entity_id: event.entity_id ?? null,
			entity_type: event.entity_type ?? null,
			query: event.query ?? null,
			session_id: event.session_id ?? null,
		});
		if (error) return SearchEngineServiceBackend.fail(error);
		return { ok: true, data: null };
	}

	// #region Admin
	static async getWeights(deps: Deps): Promise<ServiceResult<unknown[]>> {
		const client = await deps.getClient();
		const { data, error } = await client.schema('search').rpc('fn_get_weights');
		if (error) return SearchEngineServiceBackend.fail(error);
		return { ok: true, data: (data ?? []) as unknown[] };
	}

	static async setWeight(key: string, weight: number, deps: Deps): Promise<ServiceResult<unknown>> {
		const client = await deps.getClient();
		const { data, error } = await client
			.schema('search')
			.rpc('fn_set_weight', { p_key: key, p_weight: weight });
		if (error) return SearchEngineServiceBackend.fail(error);
		return { ok: true, data };
	}

	static async getAnalytics(windowHours: number, deps: Deps): Promise<ServiceResult<unknown>> {
		const client = await deps.getClient();
		const { data, error } = await client
			.schema('search')
			.rpc('fn_search_analytics', { p_window_hours: windowHours });
		if (error) return SearchEngineServiceBackend.fail(error);
		return { ok: true, data };
	}
	// #endregion

	// #region Helpers
	private static async log(
		client: SupabaseClient,
		params: SearchParams,
		resultCount: number,
		durationMs: number,
	): Promise<void> {
		// Fire-and-forget telemetry; never fail a search because logging failed.
		try {
			await client.schema('search').rpc('fn_log_query', {
				p_query: params.query,
				p_entity_type: FEDERATED.has(params.entityType.toLowerCase()) ? null : params.entityType,
				p_filters: params.filters ?? {},
				p_result_count: resultCount,
				p_duration_ms: durationMs,
				p_candidate_pool: null,
			});
		} catch (_) {
			// swallow
		}
	}

	// Map a Postgres error to an HTTP-friendly result. is_admin() raises SQLSTATE 42501 → 403.
	private static fail(error: { code?: string; message?: string }): ServiceResult<never> {
		const status = error.code === '42501' || /forbidden/i.test(error.message ?? '') ? 403 : 400;
		return {
			ok: false,
			error: { code: error.code ?? 'search_error', message: error.message ?? 'Search failed', status },
		};
	}
	// #endregion
}
