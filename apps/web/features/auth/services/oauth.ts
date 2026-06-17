/**
 * @file oauth.ts
 * @description Frontend Service for initiating OAuth handshakes.
 */

import { supabaseClient } from '@projective/backend';

export type OAuthProvider = 'google' | 'github';
export type OAuthIntent = 'login' | 'register';

export async function getProviderRedirectUrl(
	provider: OAuthProvider,
	intent: OAuthIntent,
	requestUrl: URL,
	next = '/',
): Promise<string> {
	// Point to the new dedicated callback route
	const callbackUrl = new URL('/api/v1/auth/callback', requestUrl);

	if (next && next !== '/') {
		callbackUrl.searchParams.set('next', next);
	}
	callbackUrl.searchParams.set('intent', intent);

	const sb = await supabaseClient();
	const { data, error } = await sb.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: callbackUrl.toString(),
			skipBrowserRedirect: true,
		} as any,
	});

	if (error || !data?.url) {
		throw new Error(error?.message || 'OAuth init failed');
	}
	return data.url;
}
