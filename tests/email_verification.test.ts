/**
 * @file email_verification.test.ts
 * @description US-001 · Multi-Persona Onboarding — the live email-verification subscription and the
 * "return to where I was" redirect context added alongside migration 0312.
 *
 * Layer 1 (always runs): the `safeReturnTo` open-redirect guard that every hop of the redirect
 * chain (create-account → confirmation email → confirm.ts → complete-onboarding → /verify poll)
 * funnels the untrusted return target through. This is the security boundary — an attacker who
 * controls `?redirectTo=` must never be able to bounce a confirmed session off-site.
 *
 * Layer 2 (PJV_TEST_DB=1): asserts the deployed schema — `public.handle_email_confirmed` and the
 * `on_auth_user_confirmed` trigger wired to `auth.users` — so `org.user_emails.verified_at` is kept
 * in lockstep with GoTrue confirmation (the value the /verify poll endpoint reads).
 */

import { assert, assertEquals } from '@std/assert';
import { safeReturnTo } from '@projective/backend';
import { isLiveDbEnabled, withRolledBackTx } from './support/live_db.ts';

// #region UNIT — safeReturnTo open-redirect guard (redirect context security)
Deno.test('US-001 · safeReturnTo keeps same-origin relative paths', () => {
	assertEquals(safeReturnTo('/explore'), '/explore');
	assertEquals(safeReturnTo('/explore?type=service&q=x'), '/explore?type=service&q=x');
	assertEquals(safeReturnTo('/profile/acme#reviews'), '/profile/acme#reviews');
	assertEquals(safeReturnTo('/'), '/');
});

Deno.test('US-001 · safeReturnTo rejects absolute + protocol-relative URLs', () => {
	const fb = '/home';
	assertEquals(safeReturnTo('https://evil.com'), fb);
	assertEquals(safeReturnTo('http://evil.com/path'), fb);
	assertEquals(safeReturnTo('//evil.com'), fb); // protocol-relative
	assertEquals(safeReturnTo('javascript:alert(1)'), fb);
	assertEquals(safeReturnTo('mailto:x@y.com'), fb);
});

Deno.test('US-001 · safeReturnTo rejects backslash + control-char host tricks', () => {
	const fb = '/home';
	assertEquals(safeReturnTo('/\\evil.com'), fb); // /\ normalises to // in some browsers
	assertEquals(safeReturnTo('/foo\\bar'), fb);
	assertEquals(safeReturnTo('/foo\r\nSet-Cookie: x'), fb); // header/host injection
	assertEquals(safeReturnTo('/foo\tbar'), fb);
});

Deno.test('US-001 · safeReturnTo falls back on empty / non-path input', () => {
	assertEquals(safeReturnTo(undefined), '/home');
	assertEquals(safeReturnTo(null), '/home');
	assertEquals(safeReturnTo(''), '/home');
	assertEquals(safeReturnTo('explore'), '/home'); // not root-relative
	// Custom fallback is honoured.
	assertEquals(safeReturnTo(undefined, '/join'), '/join');
});
// #endregion

// #region LIVE DB — verified_at sync trigger (mig 0312)
Deno.test({
	name: 'US-001 · [db] on_auth_user_confirmed syncs email_confirmed_at → user_emails.verified_at',
	ignore: !isLiveDbEnabled(),
	fn: async () => {
		await withRolledBackTx(async (sql) => {
			// deno-lint-ignore no-explicit-any
			const s = sql as any;

			const [fn] = await s`
				SELECT 1 AS ok FROM pg_proc
				WHERE proname = 'handle_email_confirmed' AND prosecdef = true`;
			assert(fn?.ok === 1, 'public.handle_email_confirmed (SECURITY DEFINER) must exist');

			const [trg] = await s`
				SELECT tgname, tgrelid::regclass::text AS on_table
				FROM pg_trigger
				WHERE tgname = 'on_auth_user_confirmed' AND NOT tgisinternal`;
			assert(trg, 'on_auth_user_confirmed trigger must be deployed');
			assertEquals(trg.on_table, 'auth.users', 'trigger must fire on auth.users');
		});
	},
});
// #endregion
