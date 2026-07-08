import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import {
	getBusinessAdminProfile,
	updateBusiness,
} from '@features/dashboard/business/services/update.ts';
import { UpdateBusinessSettingsSchema } from '@features/dashboard/business/contracts/settings/_validation.ts';

export const handler = define.handlers({
	/** GET — admin profile for the settings form (US-008 AC2). */
	async GET(ctx) {
		try {
			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await getBusinessAdminProfile(ctx.params.id, { getClient });
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
			console.error('Get business API error:', err);
			return new Response(JSON.stringify({ error: 'Failed to load business' }), { status: 500 });
		}
	},

	/** PATCH — update legal/display name, billing email and administrative logo (US-008 AC2). */
	async PATCH(ctx) {
		try {
			const contentType = ctx.req.headers.get('content-type') || '';
			let body: any = {};
			let logoFile: File | undefined;

			if (contentType.includes('multipart/form-data')) {
				const formData = await ctx.req.formData();
				const payloadStr = formData.get('payload')?.toString();
				if (payloadStr) {
					try {
						body = JSON.parse(payloadStr);
					} catch {
						return new Response(JSON.stringify({ error: 'Invalid JSON in payload' }), {
							status: 400,
							headers: { 'Content-Type': 'application/json' },
						});
					}
				}
				const logo = formData.get('logo');
				if (logo instanceof File) logoFile = logo;
			} else {
				body = await ctx.req.json();
			}

			const validation = UpdateBusinessSettingsSchema.safeParse(body);
			if (!validation.success) {
				return new Response(
					JSON.stringify({
						error: {
							code: 'validation_error',
							message: 'Invalid business settings',
							details: validation.error.flatten(),
						},
					}),
					{ status: 400, headers: { 'Content-Type': 'application/json' } },
				);
			}

			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await updateBusiness(
				ctx.params.id,
				validation.data,
				{ logo: logoFile },
				{ getClient },
			);

			if (!res.ok) {
				return new Response(JSON.stringify({ error: res.error }), {
					status: res.error.status ?? 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify({ ok: true, id: res.data.id }), {
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err) {
			console.error('Update business API error:', err);
			return new Response(JSON.stringify({ error: 'Failed to update business' }), { status: 500 });
		}
	},
});
