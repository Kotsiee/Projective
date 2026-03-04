import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import {
	CreateProjectSchema,
	ProjectsBackendService,
} from 'packages/features/dashboard/projects/index.ts';

export const handler = define.handlers({
	async POST(ctx) {
		try {
			// 1. Parse FormData instead of JSON to support file uploads
			const formData = await ctx.req.formData();

			const rawData = formData.get('data');
			const targetStatus = (formData.get('targetStatus') as 'draft' | 'active') || 'draft';

			if (!rawData || typeof rawData !== 'string') {
				return new Response(
					JSON.stringify({ error: 'Missing or invalid data payload' }),
					{ status: 400, headers: { 'Content-Type': 'application/json' } },
				);
			}

			// Parse the stringified JSON payload
			let body;
			try {
				body = JSON.parse(rawData);
			} catch (e) {
				return new Response(
					JSON.stringify({ error: 'Invalid JSON in data payload' }),
					{ status: 400, headers: { 'Content-Type': 'application/json' } },
				);
			}

			// 2. Validate Payload
			const validation = CreateProjectSchema.safeParse(body);

			if (!validation.success) {
				return new Response(
					JSON.stringify({
						error: {
							code: 'validation_error',
							message: 'Invalid project data',
							details: validation.error.flatten(),
						},
					}),
					{ status: 400, headers: { 'Content-Type': 'application/json' } },
				);
			}

			const thumbnail = formData.get('thumbnail') as File | null;
			const attachments = formData.getAll('attachments') as File[];

			const files = {
				...(thumbnail ? { thumbnail } : {}),
				...(attachments.length > 0 ? { attachments } : {}),
			};

			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await ProjectsBackendService.createProject(
				validation.data,
				targetStatus,
				files,
				{ getClient },
			);

			// 5. Response
			if (!res.ok) {
				return new Response(JSON.stringify({ error: res.error }), {
					status: res.error.status ?? 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify({ ok: true, projectId: res.data?.projectId }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err) {
			console.error('Project creation handler error:', err);
			return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400 });
		}
	},
});
