/**
 * @file oauth.ts
 * @description Backend-facing service for initiating OAuth PKCE handshakes.
 *
 * Builds the app callback URL (carrying `next`/`intent`) and delegates the PKCE
 * initiation to the backend, returning both the provider URL and the verifier the
 * route must persist in an HttpOnly cookie before redirecting.
 */

import { initiateOAuth, type OAuthInitResult, type OAuthProvider } from '@projective/backend';

export type { OAuthProvider };
export type OAuthIntent = 'login' | 'register';

export function getProviderRedirect(
	provider: OAuthProvider,
	intent: OAuthIntent,
	requestUrl: URL,
	next = '/',
): Promise<OAuthInitResult> {
	const callbackUrl = new URL('/api/v1/auth/callback', requestUrl);

	if (next && next !== '/') {
		callbackUrl.searchParams.set('next', next);
	}
	callbackUrl.searchParams.set('intent', intent);

	return initiateOAuth(provider, callbackUrl.toString());
}
