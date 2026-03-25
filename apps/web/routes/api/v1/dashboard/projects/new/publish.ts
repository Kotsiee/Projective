import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { CreateProjectSchema } from '@features/dashboard/projects/contracts/new/_validation.ts';
import { ProjectsBackendService } from '@features/dashboard/projects/services/ProjectsServiceBackend.ts';

export const handler = define.handlers({
	async POST(ctx) {
		try {
			const contentType = ctx.req.headers.get('content-type') || '';
			let body: any = {};
			let thumbnailFile: File | undefined;
			const attachmentFiles: File[] = [];

			if (contentType.includes('multipart/form-data')) {
				const formData = await ctx.req.formData();
				const payloadStr = formData.get('payload')?.toString();

				if (!payloadStr) {
					return new Response(JSON.stringify({ error: 'Missing payload' }), { status: 400 });
				}
				body = JSON.parse(payloadStr);

				const thumb = formData.get('thumbnail');
				if (thumb instanceof File) thumbnailFile = thumb;

				const rawAttachments = formData.getAll('attachments');
				rawAttachments.forEach((entry) => {
					if (entry instanceof File) attachmentFiles.push(entry);
				});
			} else {
				body = await ctx.req.json();
			}

			const validation = CreateProjectSchema.safeParse(body);

			if (!validation.success) {
				console.error('[publish.ts] Zod Validation Error:', validation.error.flatten());

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

			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await ProjectsBackendService.createProject(
				validation.data,
				'active',
				{
					thumbnail: thumbnailFile,
					attachments: attachmentFiles,
				},
				{ getClient },
			);

			if (!res.ok) {
				return new Response(JSON.stringify({ error: res.error }), {
					status: res.error.status ?? 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(
				JSON.stringify({
					ok: true,
					projectId: res.data.projectId,
					redirectTo: `/projects/${res.data.projectId}`,
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		} catch (e: any) {
			console.error('Publish Error:', e);
			return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400 });
		}
	},
});
