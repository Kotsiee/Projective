/**
 * @file publish.ts
 * @description API route controller for processing project creation requests and files.
 */

// #region Imports
import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { CreateProjectSchema } from '@features/dashboard/projects/contracts/new/_validation.ts';
import { ProjectsBackendService } from '@features/dashboard/projects/services/ProjectsServiceBackend.ts';
// #endregion

export const handler = define.handlers({
	async POST(ctx) {
		try {
			const contentType = ctx.req.headers.get('content-type') || '';
			// deno-lint-ignore no-explicit-any
			let body: any = {};
			const attachmentFiles: File[] = [];

			// Parse multipart/form-data for attachments
			if (contentType.includes('multipart/form-data')) {
				const formData = await ctx.req.formData();
				const payloadStr = formData.get('payload')?.toString();

				if (!payloadStr) {
					return new Response(JSON.stringify({ error: 'Missing payload' }), { status: 400 });
				}
				body = JSON.parse(payloadStr);

				const rawAttachments = formData.getAll('attachments');
				rawAttachments.forEach((entry) => {
					if (entry instanceof File) attachmentFiles.push(entry);
				});
			} else {
				body = await ctx.req.json();
			}

			// Validate the payload shape against our Zod SSOT
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

			// Dependency injection wrapper for the Supabase client
			// deno-lint-ignore no-explicit-any
			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			// Execute the business logic through the service
			const res = await ProjectsBackendService.createProject(
				validation.data,
				'active',
				{
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
		} catch (e: unknown) {
			console.error('Publish Error:', e);
			return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400 });
		}
	},
});
