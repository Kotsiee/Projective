import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { subscribeMessages } from '@server/dashboard/comms/subscribeMessages.ts';
import { getAuthCookies } from '@projective/backend';

export const handler = define.handlers({
	async GET(ctx) {
		const { channelid } = ctx.params;
		const url = new URL(ctx.req.url);

		const type = (url.searchParams.get('type') as 'dm' | 'channel') || 'channel';

		const { accessToken } = getAuthCookies(ctx.req);
		const token = accessToken || url.searchParams.get('token');

		if (!token) {
			console.error('[SSE] No access token provided for subscription');
			return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
		}

		if (type !== 'dm' && type !== 'channel') {
			return new Response(JSON.stringify({ error: 'Invalid type' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const getClient = () => supabaseClient(ctx.req);

		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();

				const pingInterval = setInterval(() => {
					try {
						controller.enqueue(encoder.encode(': ping\n\n'));
					} catch (e) {
						clearInterval(pingInterval);
					}
				}, 15000);

				const result = await subscribeMessages(
					channelid,
					{
						type,
						accessToken: token,
						onMessage: (data) => {
							const chunk = `data: ${JSON.stringify(data)}\n\n`;
							controller.enqueue(encoder.encode(chunk));
						},
					},
					{ getClient },
				);

				if (!result.ok) {
					console.error('[SSE] Subscription failed:', result.error);
					clearInterval(pingInterval);
					controller.enqueue(
						encoder.encode(`event: error\ndata: ${JSON.stringify(result.error)}\n\n`),
					);
					controller.close();
					return;
				}

				const { unsubscribe } = result.data;

				ctx.req.signal.addEventListener('abort', async () => {
					clearInterval(pingInterval);
					await unsubscribe();
				});
			},
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive',
				'X-Accel-Buffering': 'no',
			},
		});
	},
});
