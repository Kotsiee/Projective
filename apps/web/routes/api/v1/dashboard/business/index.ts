import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { getDashboardBusinesses } from '@features/dashboard/business/services/getBusinesses.ts';
import { CreateBusinessSchema } from '@features/dashboard/business/contracts/new/_validation.ts';
import { createBusiness } from '@features/dashboard/business/services/create.ts';

export const handler = define.handlers({
	async GET(ctx) {
		const url = new URL(ctx.req.url);
		const params = {
			search: url.searchParams.get('search') || '',
			sortBy: (url.searchParams.get('sortBy') as any) || 'created_at',
			sortDir: (url.searchParams.get('sortDir') as any) || 'desc',
			limit: parseInt(url.searchParams.get('limit') || '20'),
			offset: parseInt(url.searchParams.get('offset') || '0'),
			countOnly: url.searchParams.get('countOnly') === 'true',
		};

		try {
			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await getDashboardBusinesses(params, { getClient });

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
			return new Response(JSON.stringify({ error: 'Failed to fetch businesses' }), {
				status: 500,
			});
		}
	},
	async POST(ctx) {
		try {
			const contentType = ctx.req.headers.get('content-type') || '';
			let body: any = {};
			let logoFile: File | undefined;
			let bannerFile: File | undefined;

			if (contentType.includes('multipart/form-data')) {
				const formData = await ctx.req.formData();
				const payloadStr = formData.get('payload')?.toString();

				if (!payloadStr) {
					return new Response(
						JSON.stringify({ error: 'Missing payload data' }),
						{ status: 400, headers: { 'Content-Type': 'application/json' } },
					);
				}

				try {
					body = JSON.parse(payloadStr);
				} catch {
					return new Response(
						JSON.stringify({ error: 'Invalid JSON in payload' }),
						{ status: 400, headers: { 'Content-Type': 'application/json' } },
					);
				}

				const logo = formData.get('logo');
				if (logo instanceof File) logoFile = logo;

				const banner = formData.get('banner');
				if (banner instanceof File) bannerFile = banner;
			} else {
				body = await ctx.req.json();
			}

			const validation = CreateBusinessSchema.safeParse(body);

			if (!validation.success) {
				return new Response(
					JSON.stringify({
						error: {
							code: 'validation_error',
							message: 'Invalid business data',
							details: validation.error.flatten(),
						},
					}),
					{ status: 400, headers: { 'Content-Type': 'application/json' } },
				);
			}

			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await createBusiness(
				validation.data,
				{
					logo: logoFile,
					banner: bannerFile,
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
					businessId: res.data.businessId,
					redirectTo: `/business/${res.data.slug}/settings`,
				}),
				{
					status: 201,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		} catch (error) {
			console.error('Business creation error:', error);
			return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400 });
		}
	},
});
