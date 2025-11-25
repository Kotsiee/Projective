import { assert, assertEquals } from '../../_helpers/asserts.ts';
import { registerWithEmail } from '../../../server/auth/email/register.ts';

type FakeAuthReturn =
	| { data: unknown; error: null }
	| { data: null; error: { message: string; code?: string; status?: number } };

function fakeClient(
	impl: (args: { email: string; password: string }) => Promise<FakeAuthReturn>,
) {
	return {
		auth: {
			signUp: ({ email, password }: { email: string; password: string }) =>
				impl({ email, password }),
		},
	} as unknown as {
		auth: { signUp: (a: { email: string; password: string }) => Promise<FakeAuthReturn> };
	};
}

Deno.test({
	name: 'registerWithEmail: missing email/password -> bad_request',
	sanitizeOps: true,
	sanitizeResources: true,
	sanitizeExit: true,
	async fn() {
		const res = await registerWithEmail({ email: '', password: '' } as unknown as {
			email: string;
			password: string;
		});

		assert(!res.ok);
		assertEquals(res.error.code, 'bad_request');
	},
});

Deno.test({
	name: 'registerWithEmail: invalid email format -> bad_request',
	sanitizeOps: true,
	sanitizeResources: true,
	sanitizeExit: true,
	async fn() {
		const res = await registerWithEmail({ email: 'not-an-email', password: 'secret123!' } as {
			email: string;
			password: string;
		});

		assert(!res.ok);
		assertEquals(res.error.code, 'bad_request');
	},
});

Deno.test({
	name: 'registerWithEmail: short password -> bad_request',
	sanitizeOps: true,
	sanitizeResources: true,
	sanitizeExit: true,
	async fn() {
		const res = await registerWithEmail({ email: 'a@example.com', password: 'short' } as {
			email: string;
			password: string;
		});

		assert(!res.ok);
		assertEquals(res.error.code, 'bad_request');
	},
});

Deno.test({
	name: 'registerWithEmail: propagates Supabase error (e.g., rate_limit 429)',
	sanitizeOps: true,
	sanitizeResources: true,
	sanitizeExit: true,
	async fn() {
		const client = fakeClient(async () => ({
			data: null,
			error: { message: 'Email rate limit exceeded', code: 'rate_limit', status: 429 },
		}));

		const res = await registerWithEmail(
			{ email: 'a@example.com', password: 'secret123!' },
			{ getClient: async () => client as never },
		);

		assert(!res.ok);
		assertEquals(res.error.code, 'rate_limit');
		assertEquals(res.error.status, 429);
	},
});

Deno.test({
	name: 'registerWithEmail: success returns ok and data',
	sanitizeOps: true,
	sanitizeResources: true,
	sanitizeExit: true,
	async fn() {
		const user = {
			user: { id: '00000000-0000-0000-0000-000000000000', email: 'a@example.com' },
			session: null,
		};
		const client = fakeClient(async () => ({ data: user, error: null }));

		const res = await registerWithEmail(
			{ email: 'a@example.com', password: 'secret123!' },
			{ getClient: async () => client as never },
		);

		assert(res.ok);
		assertEquals(res.data, user as unknown);
	},
});

Deno.test({
	name: 'registerWithEmail: thrown error -> unknown_error',
	sanitizeOps: true,
	sanitizeResources: true,
	sanitizeExit: true,
	async fn() {
		const res = await registerWithEmail(
			{ email: 'a@example.com', password: 'secret123!' },
			{
				getClient: async () => {
					throw new Error('boom');
				},
			},
		);

		assert(!res.ok);
		assertEquals(res.error.code, 'unknown_error');
	},
});
