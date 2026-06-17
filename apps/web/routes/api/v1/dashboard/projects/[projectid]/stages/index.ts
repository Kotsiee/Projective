/**
 * @file index.ts
 * @description API route controller for adding new stages to an existing project.
 */

// #region Imports
import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { ProjectsBackendService } from '@features/dashboard/projects/services/ProjectsServiceBackend.ts';
import { z } from 'zod';
// #endregion

// #region Validation
const CreateStageSchema = z.object({
	name: z.string().min(1, 'Stage name is required'),
	description: z.any().optional(),
	skills: z.array(z.string()).optional(),
	file_upload_required: z.boolean().optional(),
	default_tasks: z.array(z.string()).optional(),
	start_date: z.string().optional().nullable(),
	end_date: z.string().optional().nullable(),
	ip_ownership_override: z.string().optional().nullable(),
	nda_required: z.boolean().optional(), // Accepted but ignored in DB insert contextually
});
// #endregion

// #region Handlers
export const handler = define.handlers({
	async POST(ctx) {
		try {
			const projectId = ctx.params.projectid;
			if (!projectId) {
				return new Response(JSON.stringify({ error: { message: 'Missing project ID' } }), {
					status: 400,
				});
			}

			const body = await ctx.req.json();
			const validation = CreateStageSchema.safeParse(body);

			if (!validation.success) {
				return new Response(
					JSON.stringify({
						error: { message: 'Invalid stage data', details: validation.error.flatten() },
					}),
					{ status: 400, headers: { 'Content-Type': 'application/json' } },
				);
			}

			// Dependency injection wrapper for the Supabase client
			const getClient = () =>
				// deno-lint-ignore no-explicit-any
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await ProjectsBackendService.createStage(
				projectId,
				validation.data,
				{ getClient },
			);

			if (!res.ok) {
				return new Response(JSON.stringify({ error: res.error }), {
					status: res.error.status ?? 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify({ ok: true, data: res.data }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (e: unknown) {
			console.error('Create Stage Error:', e);
			return new Response(
				JSON.stringify({ error: { message: 'Bad Request' } }),
				{ status: 400 },
			);
		}
	},
});
// #endregion
