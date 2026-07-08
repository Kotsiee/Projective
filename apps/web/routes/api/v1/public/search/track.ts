/**
 * @file /api/v1/public/search/track
 * @description Records a behavioural interest event (impression / click / save / …) that feeds the
 * "history of user interest" + popularity ranking signals. Guest-safe: anonymous sessions may post
 * events (RLS allows user_id NULL); no PII is required.
 */

import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { SearchEngineServiceBackend } from '@features/public/explore/services/SearchEngineServiceBackend.ts';
import { z } from 'zod';

const TrackSchema = z.object({
	event_type: z.enum(['impression', 'click', 'search', 'save', 'hire', 'apply', 'message']),
	entity_id: z.string().uuid().optional(),
	entity_type: z.string().optional(),
	query: z.string().optional(),
	session_id: z.string().optional(),
});

export const handler = define.handlers({
	async POST(ctx) {
		let body: unknown;
		try {
			body = await ctx.req.json();
		} catch {
			return new Response(JSON.stringify({ error: { message: 'Invalid JSON body' } }), {
				status: 400,
			});
		}

		const parsed = TrackSchema.safeParse(body);
		if (!parsed.success) {
			return new Response(
				JSON.stringify({ error: { message: 'Invalid event', details: parsed.error.flatten() } }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } },
			);
		}

		const getClient = () =>
			// deno-lint-ignore no-explicit-any
			Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

		const res = await SearchEngineServiceBackend.trackInterest(parsed.data, { getClient });
		if (!res.ok) {
			return new Response(JSON.stringify({ error: res.error }), {
				status: res.error.status,
				headers: { 'Content-Type': 'application/json' },
			});
		}
		return new Response(JSON.stringify({ ok: true }), {
			status: 202,
			headers: { 'Content-Type': 'application/json' },
		});
	},
});
