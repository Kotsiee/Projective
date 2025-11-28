import { define } from '@utils';
import { Config } from '@projective/backend';

const startedAt = Date.now();

type HealthPayload = {
	status: 'ok';
	service: string;
	version: string;
	uptime_ms: number;
	started_at: string;
	commit?: string;
	env: 'development' | 'production' | 'test' | string;
};

function payload(): HealthPayload {
	const uptime = Math.max(0, Date.now() - startedAt);
	const env = Config.APP_ENV ? 'production' : 'development';
	return {
		status: 'ok',
		service: Deno.env.get('APP_NAME') ?? 'projective-api',
		version: Deno.env.get('APP_VERSION') ?? '0.0.0',
		uptime_ms: uptime,
		started_at: new Date(startedAt).toISOString(),
		commit: Deno.env.get('GIT_COMMIT') ?? undefined,
		env,
	};
}

export const handler = define.handlers({
	async GET() {
		return new Response(JSON.stringify(payload()), {
			status: 200,
			headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
		});
	},

	async HEAD() {
		return new Response(null, {
			status: 200,
			headers: { 'cache-control': 'no-store' },
		});
	},
});
