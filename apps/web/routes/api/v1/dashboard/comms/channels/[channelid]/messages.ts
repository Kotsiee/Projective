import { define } from '@utils';
import { supabaseClient } from '@server/core/clients/supabase.ts';
import { getMessages } from '@server/dashboard/comms/getMessages.ts';
import { sendMessage } from '@server/dashboard/comms/sendMessage.ts';

export const handler = define.handlers({
	async GET(ctx) {
		const { channelid } = ctx.params;
		const url = new URL(ctx.req.url);

		const start = parseInt(url.searchParams.get('start') || '0');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const countOnly = url.searchParams.get('countOnly') === 'true';
		const type = url.searchParams.get('type') as 'dm' | 'channel';

		if (!type || (type !== 'dm' && type !== 'channel')) {
			return new Response(JSON.stringify({ error: 'Invalid type' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		try {
			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await getMessages(channelid, {
				start,
				limit,
				countOnly,
				type,
			}, {
				getClient,
			});

			if (!res.ok) {
				return new Response(JSON.stringify({ error: res.error }), {
					status: res.error.status ?? 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify(res.data), {
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err) {
			console.error('API Error:', err);
			return new Response(JSON.stringify({ error: 'Failed to fetch messages' }), {
				status: 500,
			});
		}
	},

	async POST(ctx) {
		const { channelid } = ctx.params;
		const url = new URL(ctx.req.url);

		const type = url.searchParams.get('type') as 'dm' | 'channel';

		const body = await ctx.req.json().catch(() => ({}));
		const { message, attachments, targetUserId } = body;

		if (!message || typeof message !== 'string') {
			return new Response(JSON.stringify({ error: 'Missing or invalid message' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		if (!type || (type !== 'dm' && type !== 'channel')) {
			return new Response(JSON.stringify({ error: 'Invalid type' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		try {
			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await sendMessage(channelid, {
				type,
				message,
				attachments,
				targetUserId,
			}, {
				getClient,
			});

			if (!res.ok) {
				return new Response(JSON.stringify({ error: res.error }), {
					status: res.error.status ?? 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify(res.data), {
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err) {
			console.error('API Error:', err);
			return new Response(JSON.stringify({ error: 'Failed to send message' }), {
				status: 500,
			});
		}
	},
});
