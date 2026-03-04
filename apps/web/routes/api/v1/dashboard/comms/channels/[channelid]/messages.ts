import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
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
				Promise.resolve(
					(ctx.state as any).supabaseClient ??
						supabaseClient(ctx.req),
				);

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
			return new Response(
				JSON.stringify({ error: 'Failed to fetch messages' }),
				{
					status: 500,
				},
			);
		}
	},

	async POST(ctx) {
		const { channelid } = ctx.params;
		const url = new URL(ctx.req.url);

		const type = url.searchParams.get('type') as 'dm' | 'channel';

		if (!type || (type !== 'dm' && type !== 'channel')) {
			return new Response(JSON.stringify({ error: 'Invalid type' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		let message = '';
		let attachments: string[] = [];
		let files: File[] = [];
		let targetUserId: string | undefined;
		let targetStageId: string | undefined;

		const contentType = ctx.req.headers.get('content-type') || '';

		try {
			if (contentType.includes('multipart/form-data')) {
				const formData = await ctx.req.formData();
				message = formData.get('message')?.toString() || '';
				targetUserId = formData.get('targetUserId')?.toString();
				targetStageId = formData.get('targetStageId')?.toString();

				const formFiles = formData.getAll('files');
				files = formFiles.filter((f): f is File => f instanceof File);

				const formAttachmentIds = formData.getAll('attachments');
				attachments = formAttachmentIds.map((id) => id.toString());
			} else {
				const body = await ctx.req.json().catch(() => ({}));
				message = body.message || '';
				attachments = body.attachments || [];
				targetUserId = body.targetUserId;
				targetStageId = body.targetStageId;
			}
		} catch (e) {
			return new Response(
				JSON.stringify({ error: 'Invalid request body' }),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		if (
			(!message || !message.trim()) && files.length === 0 &&
			attachments.length === 0
		) {
			return new Response(
				JSON.stringify({ error: 'Message or attachment required' }),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		try {
			const getClient = () =>
				Promise.resolve(
					(ctx.state as any).supabaseClient ??
						supabaseClient(ctx.req),
				);

			const res = await sendMessage(channelid, {
				type,
				message,
				attachments,
				files,
				targetUserId,
				targetStageId,
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
			return new Response(
				JSON.stringify({ error: 'Failed to send message' }),
				{
					status: 500,
				},
			);
		}
	},
});
