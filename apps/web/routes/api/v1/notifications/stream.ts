/**
 * @file stream.ts
 * @description GET /api/v1/notifications/stream — a Server-Sent Events (SSE) endpoint that pushes
 * the authenticated user's new notifications live. It subscribes server-side to Supabase Realtime
 * on `comms.notifications` (filtered to the user, RLS-authorized via the caller's JWT) and relays
 * each INSERT as an SSE `notification` event.
 *
 * This keeps the islands boundary intact (apps/web/CLAUDE.md): the browser consumes the feed with
 * the native `EventSource` API and never touches the Supabase client directly. It is the live-push
 * half of the notifications pipeline — the durable write half is `comms.fn_notify` (migration 0305),
 * invoked by `projects.fund_stage` / `approve_stage` / `cancel_stage_fair_exit`.
 */

// #region IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { getAuthCookies, supabaseClient } from '@projective/backend';
// #endregion

const SSE_HEADERS = {
	'content-type': 'text/event-stream; charset=utf-8',
	'cache-control': 'no-store',
	'connection': 'keep-alive',
};

export const handler = define.handlers({
	async GET(ctx) {
		const { accessToken } = getAuthCookies(ctx.req);
		if (!accessToken) {
			return new Response(JSON.stringify({ error: { code: 'unauthorized' } }), {
				status: 401,
				headers: { 'content-type': 'application/json; charset=utf-8' },
			});
		}

		const supabase = await supabaseClient(ctx.req);
		const { data: { user }, error: userErr } = await supabase.auth.getUser();
		if (userErr || !user) {
			return new Response(JSON.stringify({ error: { code: 'unauthorized' } }), {
				status: 401,
				headers: { 'content-type': 'application/json; charset=utf-8' },
			});
		}
		const uid = user.id;

		// Authorize the realtime socket with the user's JWT so RLS on comms.notifications applies.
		supabase.realtime.setAuth(accessToken);

		let channel: any = null;
		let keepAlive: number | undefined;

		const stream = new ReadableStream({
			start(controller) {
				const enc = new TextEncoder();
				const send = (event: string, data: unknown) => {
					try {
						controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
					} catch {
						/* controller already closed */
					}
				};

				send('ready', { ok: true });

				channel = supabase
					.channel(`notifications:${uid}`)
					.on(
						'postgres_changes',
						{
							event: 'INSERT',
							schema: 'comms',
							table: 'notifications',
							filter: `user_id=eq.${uid}`,
						},
						(payload: any) => {
							const n = payload.new ?? {};
							send('notification', {
								id: n.id,
								type: n.type,
								title: n.title,
								body: n.body,
								readAt: n.read_at ?? null,
								createdAt: n.created_at,
							});
						},
					)
					.subscribe();

				// Comment frames keep idle connections alive through proxies.
				keepAlive = setInterval(() => {
					try {
						controller.enqueue(enc.encode(': keep-alive\n\n'));
					} catch {
						/* closed */
					}
				}, 25000);

				const cleanup = () => {
					if (keepAlive !== undefined) clearInterval(keepAlive);
					if (channel) supabase.removeChannel(channel);
					try {
						controller.close();
					} catch {
						/* already closed */
					}
				};
				ctx.req.signal.addEventListener('abort', cleanup);
			},
			cancel() {
				if (keepAlive !== undefined) clearInterval(keepAlive);
				if (channel) supabase.removeChannel(channel);
			},
		});

		return new Response(stream, { headers: SSE_HEADERS });
	},
});
