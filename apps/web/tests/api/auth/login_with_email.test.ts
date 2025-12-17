import { assert, assertEquals } from '../../_helpers/asserts.ts';
import { loginWithEmail } from '../../../server/auth/email/login.ts';
import { User } from 'supabaseClient';

type FakeAuthReturn =
	| { data: { user: unknown; session: unknown }; error: null }
	| { data: null; error: { message: string; code?: string; status?: number } };

function fakeClient(impl: (args: { email: string; password: string }) => Promise<FakeAuthReturn>) {
	return {
		auth: {
			signInWithPassword: ({ email, password }: { email: string; password: string }) =>
				impl({ email, password }),
		},
	} as unknown as {
		auth: {
			signInWithPassword: (a: { email: string; password: string }) => Promise<FakeAuthReturn>;
		};
	};
}

Deno.test({
	name: 'loginWithEmail: invalid email format -> bad_request',
	sanitizeOps: true,
	sanitizeResources: true,
	sanitizeExit: true,
	async fn() {
		const res = await loginWithEmail({ email: 'nope', password: 'whatever' });
		assert(!res.ok);
		assertEquals(res.error.code, 'bad_request');
	},
});

Deno.test({
	name: 'loginWithEmail: invalid credentials -> 401',
	sanitizeOps: true,
	sanitizeResources: true,
	sanitizeExit: true,
	async fn() {
		const client = fakeClient(async () => ({
			data: null,
			error: { message: 'Invalid login credentials', code: 'invalid_credentials', status: 401 },
		}));

		const res = await loginWithEmail(
			{ email: 'a@example.com', password: 'wrong' },
			{ getClient: async () => client as never },
		);

		assert(!res.ok);
		assertEquals(res.error.code, 'invalid_credentials');
		assertEquals(res.error.status, 401);
	},
});

Deno.test({
	name: 'loginWithEmail: success returns user+session',
	sanitizeOps: true,
	sanitizeResources: true,
	sanitizeExit: true,
	async fn() {
		const data = {
			user: { id: crypto.randomUUID(), email: 'a@example.com' },
			session: { access_token: 'token', expires_in: 3600 },
		};
		const client = fakeClient(async () => ({ data, error: null }));

		const res = await loginWithEmail(
			{ email: 'a@example.com', password: 'secret123!' },
			{ getClient: async () => client as never },
		);

		assert(res.ok);
		assertEquals(res.data.user, data.user as User);
		assertEquals(res.data.session, data.session);
	},
});
