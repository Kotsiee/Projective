/**
 * @file pkce.ts
 * @description Server-side PKCE handshake support for OAuth.
 *
 * The OAuth PKCE flow spans two independent HTTP requests: the *initiate* request
 * (where Supabase generates a `code_verifier`) and the *callback* request (where
 * that verifier is required to exchange the returned `code` for a session).
 *
 * Because our Supabase clients run server-side with `persistSession: false`, the
 * verifier has nowhere to live between those requests. This module bridges the gap
 * with a tiny storage adapter that captures the verifier on initiate and re-seeds
 * it on callback, persisted in-between via a short-lived HttpOnly cookie.
 *
 * This keeps token handling entirely server-side (islands never touch Supabase) —
 * see apps/web/CLAUDE.md.
 */

// #region Imports
import { createClient, type SupabaseClient } from 'supabaseClient';
import { deleteCookie, getCookies, setCookie } from '@std/http/cookie';
import { Config } from '../config.ts';
import { isLocalhostHost } from '../cookies.ts';
// #endregion

// #region Constants
/** Suffix Supabase appends to its storageKey when persisting the PKCE verifier. */
const CODE_VERIFIER_SUFFIX = '-code-verifier';

/** Short-lived HttpOnly cookie carrying the PKCE verifier across the handshake. */
export const PKCE_COOKIE = 'pjv-pkce';

/** Handshake window — the user must return from the provider within this time. */
const PKCE_MAX_AGE = 60 * 10; // 10 minutes

export type OAuthProvider = 'google' | 'github';
// #endregion

// #region Storage adapter
/** Minimal synchronous storage compatible with Supabase's `SupportedStorage`. */
interface SimpleStorage {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
}

/**
 * In-memory storage that intercepts the PKCE verifier so it can be lifted out
 * (on initiate) or injected (on callback). Matched by key suffix so it stays
 * agnostic to the project-ref-derived storageKey.
 */
function createPkceStorage(seedVerifier?: string) {
	const mem = new Map<string, string>();
	let verifier: string | null = seedVerifier ?? null;

	const storage: SimpleStorage = {
		getItem(key) {
			if (key.endsWith(CODE_VERIFIER_SUFFIX)) return verifier;
			return mem.get(key) ?? null;
		},
		setItem(key, value) {
			if (key.endsWith(CODE_VERIFIER_SUFFIX)) verifier = value;
			else mem.set(key, value);
		},
		removeItem(key) {
			if (key.endsWith(CODE_VERIFIER_SUFFIX)) verifier = null;
			else mem.delete(key);
		},
	};

	return { storage, getVerifier: () => verifier };
}

/** Fresh (never cached) PKCE-enabled anon client bound to the given storage. */
function createPkceClient(storage: SimpleStorage): SupabaseClient {
	if (!Config.SUPABASE_URL || !Config.SUPABASE_ANON_KEY) {
		throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
	}
	return createClient(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY, {
		auth: {
			flowType: 'pkce',
			// Must be true: gotrue only routes the PKCE verifier through a custom
			// `storage` adapter when session persistence is on. Our adapter is a
			// throwaway per-request Map, so nothing actually persists server-side.
			persistSession: true,
			detectSessionInUrl: false,
			autoRefreshToken: false,
			// deno-lint-ignore no-explicit-any
			storage: storage as any,
		},
	});
}

/** URL-safe, cookie-safe encoding for the (JSON-wrapped) verifier value. */
function b64urlEncode(s: string): string {
	return btoa(String.fromCharCode(...new TextEncoder().encode(s)))
		.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s: string): string {
	const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
	return new TextDecoder().decode(
		Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)),
	);
}
// #endregion

// #region Handshake helpers
export interface OAuthInitResult {
	/** Provider authorization URL the browser should be redirected to. */
	url: string;
	/** PKCE verifier to persist (via `setPkceCookie`) for the callback. */
	verifier: string;
}

/**
 * Begins an OAuth PKCE handshake. Returns the provider URL plus the verifier the
 * caller must persist with {@link setPkceCookie} before redirecting.
 */
export async function initiateOAuth(
	provider: OAuthProvider,
	redirectTo: string,
): Promise<OAuthInitResult> {
	const { storage, getVerifier } = createPkceStorage();
	const client = createPkceClient(storage);

	const { data, error } = await client.auth.signInWithOAuth({
		provider,
		options: { redirectTo, skipBrowserRedirect: true },
	});

	const verifier = getVerifier();
	if (error || !data?.url || !verifier) {
		throw new Error(error?.message || 'OAuth initialisation failed');
	}

	return { url: data.url, verifier };
}

/**
 * Completes the handshake by exchanging the provider `code` for a session using
 * the previously persisted `verifier`. Returns the exchange result along with the
 * authenticated client so callers can reuse its session for follow-up queries.
 */
export async function exchangeOAuthCode(code: string, verifier: string) {
	const { storage } = createPkceStorage(verifier);
	const client = createPkceClient(storage);
	const { data, error } = await client.auth.exchangeCodeForSession(code);
	return { client, data, error };
}
// #endregion

// #region Verifier cookie
export function setPkceCookie(headers: Headers, verifier: string, requestUrl: URL) {
	const isSecureOrigin = requestUrl.protocol === 'https:';
	const isLocal = isLocalhostHost(requestUrl.hostname);
	setCookie(headers, {
		name: PKCE_COOKIE,
		value: b64urlEncode(verifier),
		httpOnly: true,
		sameSite: 'Lax', // sent on the top-level GET redirect back from the provider
		secure: isSecureOrigin && !isLocal,
		path: '/',
		maxAge: PKCE_MAX_AGE,
	});
}

export function getPkceCookie(req: Request): string | undefined {
	const raw = getCookies(req.headers)[PKCE_COOKIE];
	if (!raw) return undefined;
	try {
		return b64urlDecode(raw);
	} catch {
		return undefined;
	}
}

export function clearPkceCookie(headers: Headers, requestUrl: URL) {
	const isSecureOrigin = requestUrl.protocol === 'https:';
	const isLocal = isLocalhostHost(requestUrl.hostname);
	deleteCookie(headers, PKCE_COOKIE, {
		path: '/',
		secure: isSecureOrigin && !isLocal,
	});
}
// #endregion
