/**
 * @file /api/v1/admin/search/weights
 * @description Admin weight management for the discovery ranking matrix.
 *   • GET   → list every tunable factor + its current weight/scope.
 *   • PATCH → live-adjust a single weight ({ key, weight }) with no redeploy.
 *
 * Defense in depth: the route requires an authenticated session, and the underlying RPCs
 * (search.fn_get_weights / fn_set_weight) independently enforce admin membership via
 * search.is_admin() — a non-admin call raises SQLSTATE 42501, surfaced here as 403.
 */

import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { SearchEngineServiceBackend } from '@features/public/explore/services/SearchEngineServiceBackend.ts';
import { z } from 'zod';

const PatchSchema = z.object({
	key: z.string().min(1),
	weight: z.number().min(0).max(100),
});

function unauthorized(): Response {
	return new Response(JSON.stringify({ error: { code: 'unauthorized', message: 'Sign in required' } }), {
		status: 401,
		headers: { 'Content-Type': 'application/json' },
	});
}

export const handler = define.handlers({
	async GET(ctx) {
		if (!ctx.state.isAuthenticated) return unauthorized();
		const getClient = () =>
			// deno-lint-ignore no-explicit-any
			Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

		const res = await SearchEngineServiceBackend.getWeights({ getClient });
		if (!res.ok) {
			return new Response(JSON.stringify({ error: res.error }), {
				status: res.error.status,
				headers: { 'Content-Type': 'application/json' },
			});
		}
		return new Response(JSON.stringify({ weights: res.data }), {
			status: 200,
			headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
		});
	},

	async PATCH(ctx) {
		if (!ctx.state.isAuthenticated) return unauthorized();

		let body: unknown;
		try {
			body = await ctx.req.json();
		} catch {
			return new Response(JSON.stringify({ error: { message: 'Invalid JSON body' } }), { status: 400 });
		}
		const parsed = PatchSchema.safeParse(body);
		if (!parsed.success) {
			return new Response(
				JSON.stringify({ error: { message: 'Invalid weight update', details: parsed.error.flatten() } }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } },
			);
		}

		const getClient = () =>
			// deno-lint-ignore no-explicit-any
			Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

		const res = await SearchEngineServiceBackend.setWeight(parsed.data.key, parsed.data.weight, { getClient });
		if (!res.ok) {
			return new Response(JSON.stringify({ error: res.error }), {
				status: res.error.status,
				headers: { 'Content-Type': 'application/json' },
			});
		}
		return new Response(JSON.stringify({ ok: true, weight: res.data }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	},
});
