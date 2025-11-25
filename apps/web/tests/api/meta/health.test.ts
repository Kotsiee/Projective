import { assert, assertEquals } from '../../_helpers/asserts.ts';
import * as Health from '../../../routes/api/v1/meta/health.ts';

const GET = (Health as unknown as {
	GET?: (r: Request) => Promise<Response>;
	handler?: { GET: (r: Request) => Promise<Response> };
}).GET ??
	(Health as unknown as { handler?: { GET: (r: Request) => Promise<Response> } }).handler?.GET;

const HEAD = (Health as unknown as {
	HEAD?: (r: Request) => Promise<Response>;
	handler?: { HEAD: (r: Request) => Promise<Response> };
}).HEAD ??
	(Health as unknown as { handler?: { HEAD: (r: Request) => Promise<Response> } }).handler?.HEAD;

if (typeof GET !== 'function') {
	throw new Error('Health GET handler not found (expected export GET or handler.GET).');
}
if (typeof HEAD !== 'function') {
	throw new Error('Health HEAD handler not found (expected export HEAD or handler.HEAD).');
}

Deno.test({
	name: 'GET /api/v1/meta/health returns a valid payload',
	sanitizeOps: true,
	sanitizeResources: true,
	sanitizeExit: true,
	async fn() {
		const req = new Request('http://localhost/api/v1/meta/health', { method: 'GET' });
		const res = await GET(req);

		assertEquals(res.status, 200);
		assert(res.headers.get('content-type')?.includes('application/json'));

		const json = await res.json() as {
			status: string;
			service: string;
			version: string;
			uptime_ms: number;
			started_at: string;
			commit?: string;
			env: string;
		};

		assertEquals(json.status, 'ok');
		assert(typeof json.service === 'string' && json.service.length > 0);
		assert(typeof json.version === 'string');
		assert(Number.isFinite(json.uptime_ms) && json.uptime_ms >= 0);
		assert(!Number.isNaN(Date.parse(json.started_at)));
		assert(typeof json.env === 'string');
	},
});

Deno.test({
	name: 'HEAD /api/v1/meta/health is fast and empty',
	sanitizeOps: true,
	sanitizeResources: true,
	sanitizeExit: true,
	async fn() {
		const req = new Request('http://localhost/api/v1/meta/health', { method: 'HEAD' });
		const res = await HEAD(req);

		assertEquals(res.status, 200);
		const body = await res.text();
		assertEquals(body, '');
		assert(res.headers.get('cache-control')?.includes('no-store'));
	},
});
