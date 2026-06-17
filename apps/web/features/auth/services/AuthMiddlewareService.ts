/**
 * @file AuthMiddlewareService.ts
 * @description Secure fat service layer executing edge-level request validation, rate limiting, token refreshing, and CSRF prevention.
 */

// #region Imports
import { maybeRefreshFromRequest } from '@features/auth/services/refresh.ts';
import {
	clearAuthCookies,
	getAuthCookies,
	rateLimitByIP,
	setAuthCookies,
	verifyCsrf,
} from '@projective/backend';
// #endregion

// #region Interfaces
export interface AuthStateResult {
	isAuthenticated: boolean;
	refreshedTokens: { access: string; refresh: string } | null;
	clearAuth: boolean;
}
// #endregion

// #region Service Definition
export class AuthMiddlewareService {
	/**
	 * System paths and extensions that should bypass all authentication and tracking middleware.
	 */
	private static EXCLUDED_PATHS = [
		'/_fresh',
		'/static',
		'/favicon.ico',
		'/logo.svg',
		'/styles.css',
		'/components',
	];

	/**
	 * Determines if a given request path is requesting a static asset that should bypass middleware.
	 */
	static shouldExclude(path: string): boolean {
		if (this.EXCLUDED_PATHS.some((p) => path.startsWith(p))) return true;
		if (path.match(/\.(css|js|png|jpg|jpeg|svg|ico|woff2?)$/)) return true;
		return false;
	}

	/**
	 * Evaluates the IP against the global rate limit policy.
	 */
	static checkRateLimit(req: Request): { allowed: boolean; ip: string } {
		const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];
		const { allowed } = rateLimitByIP(ip);
		return { allowed, ip };
	}

	/**
	 * Evaluates current auth cookies, calculates skew/expiration, and triggers secure refreshes if needed.
	 */
	static async processAuthState(req: Request): Promise<AuthStateResult> {
		const { accessToken, refreshToken } = getAuthCookies(req);
		const now = Math.floor(Date.now() / 1000);
		const skew = 60; // 60 seconds buffer before actual expiration

		const state: AuthStateResult = {
			isAuthenticated: !!accessToken,
			refreshedTokens: null,
			clearAuth: false,
		};

		let shouldRefresh = false;

		if (refreshToken) {
			if (!accessToken) {
				shouldRefresh = true;
			} else {
				const exp = this.jwtExp(accessToken);
				if (!exp || exp <= now + skew) shouldRefresh = true;
			}
		}

		// Trigger refresh handshake with identity provider
		if (shouldRefresh) {
			const refreshed = await maybeRefreshFromRequest(req);
			if (refreshed) {
				state.refreshedTokens = refreshed;
				state.isAuthenticated = true;
			} else {
				state.clearAuth = true;
				state.isAuthenticated = false;
			}
		}

		return state;
	}

	/**
	 * Guards state-changing HTTP requests against CSRF attacks, bypassing if Bearer token is provided.
	 */
	static validateCsrf(req: Request, isAuthenticated: boolean): boolean {
		const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
			req.method.toUpperCase(),
		);
		const hasBearer = !!req.headers.get('authorization')?.startsWith('Bearer ');

		if (isStateChanging && !hasBearer && isAuthenticated) {
			return verifyCsrf(req);
		}

		return true;
	}

	/**
	 * Injects the newly calculated auth states (either new tokens or cleared states) into the outgoing HTTP response.
	 */
	static applyAuthCookies(headers: Headers, requestUrl: URL, state: AuthStateResult): void {
		if (state.refreshedTokens) {
			setAuthCookies(headers, {
				accessToken: state.refreshedTokens.access,
				refreshToken: state.refreshedTokens.refresh,
				requestUrl,
			});
		}
		if (state.clearAuth) {
			clearAuthCookies(headers, requestUrl);
		}
	}

	// #region Private Helpers
	/**
	 * Safely decodes a JWT payload locally to extract the expiration timestamp without network latency.
	 */
	private static jwtExp(token: string): number | null {
		try {
			const payload = token.split('.')[1];
			if (!payload) return null;
			const json = JSON.parse(
				new TextDecoder().decode(
					Uint8Array.from(
						atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
						(c) => c.charCodeAt(0),
					),
				),
			);
			return typeof json.exp === 'number' ? json.exp : null;
		} catch {
			return null;
		}
	}
	// #endregion
}
// #endregion
