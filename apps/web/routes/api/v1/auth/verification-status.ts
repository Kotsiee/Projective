/**
 * @file verification-status.ts
 * @description GET /api/v1/auth/verification-status — the poll target for the
 * /verify "check your inbox" page. It answers two questions for the waiting
 * device without ever holding a token or logging anyone in insecurely:
 *
 *   • `verified`      — has this email been confirmed yet? (drives the UI state)
 *   • `authenticated` — does THIS device now hold a valid session? (drives auto-login)
 *   • `next`          — where to land once in (the captured redirect context)
 *
 * Same-browser flow: the user opens the confirmation link in another tab;
 * confirm.ts sets shared (path=/) auth cookies; the next poll here sees a live
 * session → `authenticated:true` → the island redirects to `next`. That is the
 * automatic login, done purely off httpOnly cookies with no token in JS.
 *
 * Cross-device flow: the waiting device has no session, so we fall back to a
 * service-role lookup of org.user_emails.verified_at (kept current by the
 * on_auth_user_confirmed trigger, mig 0312) for the email the visitor signed up
 * with. That flips `verified:true` for a "Verified ✓ — continue" prompt, but
 * NEVER `authenticated` — minting a session from just an email would be account
 * takeover.
 *
 * Islands boundary (apps/web/CLAUDE.md): the browser polls this route via fetch;
 * it never touches Supabase directly.
 */

// #region Imports
import { define } from '@utils';
import { getCookies } from '@std/http/cookie';
import {
	getAuthCookies,
	safeReturnTo,
	supabaseAdminClient,
	supabaseClient,
} from '@projective/backend';
// #endregion

const JSON_HEADERS = {
	'content-type': 'application/json; charset=utf-8',
	'cache-control': 'no-store',
};

interface VerificationStatus {
	verified: boolean;
	authenticated: boolean;
	next: string;
}

function json(body: VerificationStatus, status = 200): Response {
	return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

// #region Handlers
export const handler = define.handlers({
	async GET(ctx) {
		const cookies = getCookies(ctx.req.headers);
		const next = safeReturnTo(
			cookies['pjv_return_to'] ? decodeURIComponent(cookies['pjv_return_to']) : undefined,
		);

		// 1. Does this device already hold a session? (same-browser confirmation)
		const { accessToken } = getAuthCookies(ctx.req);
		if (accessToken) {
			const supabase = await supabaseClient(ctx.req);
			const { data: { user }, error } = await supabase.auth.getUser();
			if (!error && user && user.email_confirmed_at) {
				return json({ verified: true, authenticated: true, next });
			}
		}

		// 2. No session yet — check the app-owned verification mirror by the email
		//    the visitor signed up with (from the httpOnly verify_email cookie).
		const email = cookies['verify_email'] ? decodeURIComponent(cookies['verify_email']) : '';
		if (!email) {
			return json({ verified: false, authenticated: false, next });
		}

		try {
			const admin = supabaseAdminClient();
			const { data } = await admin
				.schema('org')
				.from('user_emails')
				.select('verified_at')
				.eq('email', email.toLowerCase())
				.not('verified_at', 'is', null)
				.limit(1)
				.maybeSingle();

			return json({ verified: !!data?.verified_at, authenticated: false, next });
		} catch (err) {
			console.error('[verification-status] lookup failed:', err);
			return json({ verified: false, authenticated: false, next });
		}
	},
});
// #endregion
