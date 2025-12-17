import { Result } from '@server/core/http/result.ts';

// Re-export your result helpers
export type Ok<T> = { ok: true; data: T };
export type Fail = { ok: false; error: { code: string; message: string; status?: number } };

export function ok<T>(data: T): Ok<T> {
	return { ok: true, data };
}
export function fail(code: string, message: string, status?: number): Fail {
	return { ok: false, error: { code, message, status } };
}

// Enhanced Supabase Mock
export function createMockSupabase(overrides: any = {}) {
	// Standard response for DB operations
	const dbResponse = Promise.resolve({
		data: overrides.updateData || null,
		error: overrides.updateError || null,
	});

	// Mock Builder: Handles chaining like .eq().single().update()
	// It is "thenable" so it can be awaited directly, or chained.
	const mockBuilder: any = {
		eq: () => mockBuilder,
		single: () => mockBuilder,
		select: () => mockBuilder,
		update: () => mockBuilder,
		from: () => mockBuilder,
		// When 'await' is called on this object, it resolves to dbResponse
		then: (resolve: any, reject: any) => dbResponse.then(resolve, reject),
	};

	const mockFrom = () => mockBuilder;

	const mockSchema = () => ({
		from: mockFrom,
	});

	return {
		auth: {
			getUser: () =>
				Promise.resolve({
					data: { user: overrides.user === undefined ? { id: 'test-user-id' } : overrides.user },
					error: overrides.authError || null,
				}),
		},
		rpc: () =>
			Promise.resolve({
				data: overrides.rpcData || 'test-project-id',
				error: overrides.rpcError || null,
			}),
		schema: mockSchema,
		from: mockFrom, // Fallback if code uses top-level from
		...overrides,
	};
}

// Mock Context for Handlers (matches Deno/Fresh ctx)
export function createMockContext(body: any, state: any = {}) {
	return {
		req: {
			json: () => Promise.resolve(body),
			headers: new Headers(),
		},
		state, // Inject state here
	} as any;
}
