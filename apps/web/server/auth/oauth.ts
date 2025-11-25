import { supabaseClient } from '../core/clients/supabase.ts';

export type OAuthProvider = 'google' | 'github';
export type OAuthIntent = 'login' | 'register';

export async function getProviderRedirectUrl(
	provider: OAuthProvider,
	intent: OAuthIntent,
	requestUrl: URL,
	next = '/',
): Promise<string> {
	const verifyUrl = new URL('/verify', requestUrl);
	if (next && next !== '/') {
		verifyUrl.searchParams.set('next', next);
	}
	verifyUrl.searchParams.set('intent', intent);

	const sb = await supabaseClient();
	const { data, error } = await sb.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: verifyUrl.toString(),
			skipBrowserRedirect: true,
		} as any,
	});

	console.log({ provider, url: data?.url }, error);

	if (error || !data?.url) {
		throw new Error(error?.message || 'OAuth init failed');
	}
	return data.url;
}
