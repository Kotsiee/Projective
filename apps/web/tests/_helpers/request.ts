type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type RouteHandler = (req: Request) => Promise<Response> | Response;

export async function call(handler: RouteHandler, init?: RequestInit) {
	const req = new Request('http://localhost/test', init);
	const res = await handler(req);
	const body = await res.text();
	const json = safeJson(body);
	return { res, body, json };
}

function safeJson(s: string) {
	try {
		return JSON.parse(s);
	} catch {
		return undefined;
	}
}

export function json(method: HttpMethod, data?: unknown, headers: HeadersInit = {}) {
	return {
		method,
		headers: { 'content-type': 'application/json', ...headers },
		body: data === undefined ? undefined : JSON.stringify(data),
	} satisfies RequestInit;
}
