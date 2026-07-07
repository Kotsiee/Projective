import '../../../styles/components/onboarding/actions/sso-actions.css';

type SSOIntent = 'login' | 'register';

interface SSOActionsProps {
	/** Whether the buttons should sign the user in or register a new account. */
	intent?: SSOIntent;
}

/**
 * OAuth provider buttons. Routes to the intent-specific provider endpoint, which
 * begins the PKCE handshake and redirects to the provider.
 *
 * NOTE: GitHub is intentionally hidden until provider credentials are configured
 * in Supabase (`[auth.external.github]`). Re-enable the block below once the
 * GITHUB_ secrets exist — it routes to `/api/v1/auth/github/github-${intent}`.
 */
export function SSOActions({ intent = 'login' }: SSOActionsProps) {
	return (
		<div class='ssoactions'>
			<div class='ssoactions__divider'>
				<span>or continue with</span>
			</div>

			<button
				type='button'
				class='ssoactions__button'
				onClick={() => globalThis.location.href = `/api/v1/auth/google/google-${intent}`}
			>
				<svg class='ssoactions__icon' viewBox='0 0 24 24' aria-hidden='true'>
					<path
						fill='#4285F4'
						d='M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.63h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.55z'
					/>
					<path
						fill='#34A853'
						d='M12 24c3.1 0 5.7-1.03 7.6-2.78l-3.72-2.89c-1.03.69-2.35 1.1-3.88 1.1-2.98 0-5.5-2.01-6.4-4.72H1.75v2.98A11.99 11.99 0 0 0 12 24z'
					/>
					<path
						fill='#FBBC05'
						d='M5.6 14.71a7.2 7.2 0 0 1 0-4.42V7.31H1.75a12 12 0 0 0 0 10.38z'
					/>
					<path
						fill='#EA4335'
						d='M12 4.75c1.68 0 3.19.58 4.38 1.72l3.29-3.29C17.7 1.2 15.1 0 12 0 7.32 0 3.28 2.69 1.75 7.31L5.6 10.3C6.5 7.58 9.02 4.75 12 4.75z'
					/>
				</svg>
				Continue with Google
			</button>
		</div>
	);
}
