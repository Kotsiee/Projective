/**
 * @file /api/v1/public/search
 * @description The Unified Explore & Discovery Engine search endpoint. Serves BOTH the global
 * multi-entity view and specialized single-entity queries from one handler:
 *
 *   • Global (no `type`, or `type=all`)  → categorized rows {recommended, services, profiles,
 *     projects}. Advanced sorting/filtering is DISABLED by contract (ignored here; the ranking RPC
 *     only applies filters in single-entity mode).
 *   • Single entity (`type=service|project|freelancer|team|business|person`) → one ranked list with
 *     entity-specific filters + sort UNLOCKED (skills, budget/price range, rating, availability).
 *
 * All scoring, weighting, pgvector similarity and telemetry live in Postgres (SECURITY DEFINER RPCs
 * search.fn_search_*), so this route stays a thin HTTP adapter — parse → delegate → envelope.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 * SYSTEM RECOMMENDATION — production embedding models to adopt next for pgvector
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 * Embeddings are currently MOCKED (search.fn_mock_embedding). Before launch, wire a real model into
 * the sync triggers + query path. Top 3 production-grade options, ranked for this workload:
 *
 *   1. OpenAI `text-embedding-3-small` (1536-d) — DEFAULT. Our index columns are already vector(1536),
 *      so adoption is drop-in (no re-migration). Best cost/quality balance (~$0.02/1M tokens),
 *      strong retrieval benchmarks, `dimensions` param supports later downscaling. Use `-3-large`
 *      (3072-d) only if quality demands it (needs a column dimension change + re-embed).
 *   2. Cohere `embed-v3` (1024-d, e.g. embed-english-v3.0 / embed-multilingual-v3.0) — best-in-class
 *      multilingual + a native `input_type` (search_document vs search_query) that measurably lifts
 *      asymmetric search relevance. Pick this if the marketplace goes multi-locale.
 *   3. Hugging Face open-source `BAAI/bge-large-en-v1.5` (1024-d) or `intfloat/e5-large-v2` — self-hostable,
 *      zero per-token cost, no data egress. Best when cost control / data residency outweigh ops overhead;
 *      serve via Text-Embeddings-Inference (TEI) and normalize embeddings for cosine.
 *
 * Migration path: keep the 1536-d columns for option (1) → no schema change; for (2)/(3) add a new
 * `embedding_v2 vector(1024)` column, backfill, then swap the HNSW index + RPC operand.
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 */

import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { SearchEngineServiceBackend } from '@features/public/explore/services/SearchEngineServiceBackend.ts';
import type { ExploreSort } from '@projective/types';

const SORTS: ExploreSort[] = ['recommended', 'rating', 'recent', 'price', 'popularity'];

function parseFilters(url: URL): Record<string, unknown> {
	// Prefer a JSON blob (?filters=...), else assemble from discrete params.
	const raw = url.searchParams.get('filters');
	if (raw) {
		try {
			return JSON.parse(raw);
		} catch {
			/* fall through */
		}
	}
	const f: Record<string, unknown> = {};
	const p = url.searchParams;
	if (p.get('min_rating')) f.min_rating = Number(p.get('min_rating'));
	if (p.get('budget_min_cents')) f.budget_min_cents = Number(p.get('budget_min_cents'));
	if (p.get('budget_max_cents')) f.budget_max_cents = Number(p.get('budget_max_cents'));
	if (p.get('availability')) f.availability = p.get('availability');
	const skills = p.getAll('skill');
	if (skills.length) f.skills = skills;
	return f;
}

export const handler = define.handlers({
	async GET(ctx) {
		const url = new URL(ctx.req.url);
		const p = url.searchParams;

		const sortParam = (p.get('sort') || 'recommended') as ExploreSort;
		const params = {
			query: (p.get('q') ?? p.get('query') ?? '').trim(),
			entityType: (p.get('type') ?? 'all').toLowerCase(),
			sort: SORTS.includes(sortParam) ? sortParam : 'recommended',
			filters: parseFilters(url),
			limit: Math.min(Math.max(parseInt(p.get('limit') || '24', 10), 1), 60),
			offset: Math.max(parseInt(p.get('offset') || '0', 10), 0),
		};

		try {
			const getClient = () =>
				// deno-lint-ignore no-explicit-any
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await SearchEngineServiceBackend.search(params, { getClient });

			if (!res.ok) {
				return new Response(JSON.stringify({ error: res.error }), {
					status: res.error.status,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify(res.data), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					// Public, cacheable at the edge — results are RLS-scoped to public listings.
					'Cache-Control': 'public, max-age=30, stale-while-revalidate=120',
				},
			});
		} catch (e) {
			console.error('[api/search] error:', e);
			return new Response(JSON.stringify({ error: { message: 'Failed to execute search' } }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
});
