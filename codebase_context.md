# Selected Codebase Context

> Included paths: ./apps/web/features/auth, ./apps/web/routes/(auth)

## Project Tree (Selected)

```text
./apps/web/features/auth/
  auth/
  components/
  onboarding/
  actions/
  SSOActions.tsx
  displays/
  GlassDisplayCard.tsx
  inputs/
  AccountInput.tsx
  IdentityInput.tsx
  ObjectiveInput.tsx
  TagInput.tsx
  contracts/
  context.ts
  login.ts
  onboading.ts
  register.ts
  islands/
  index.ts
  LoginCanvas.island.tsx
  OnboardingWizard.island.tsx
  Verify.tsx
  middleware/
  verify_guard.ts
  services/
  claims.ts
  context.ts
  email/
  login.ts
  register.ts
  finalise-login.ts
  oauth.ts
  onboarding.ts
  refresh.ts
  resend.ts
  session-context-service.ts
  styles/
  components/
  onboarding/
  pages/
  onboarding-layout.css
./apps/web/routes/(auth)/
  (auth)/
  forgot-password.tsx
  login.tsx
  onboarding.tsx
  reset/
  [token].tsx
  verify/
  index.tsx
  _middleware.ts
```

## File Contents

### File: apps\web\features\auth\components\onboarding\actions\SSOActions.tsx

```tsx
import { Button, Icon } from '@projective/ui';
import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-preact';

export function SSOActions() {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					color: 'var(--text-muted)',
					fontSize: '0.75rem',
					marginBottom: '0.5rem',
				}}
			>
				<div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
				<span style={{ padding: '0 1rem' }}>OR</span>
				<div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
			</div>

			<Button
				variant='secondary'
				fullWidth
				onClick={() => window.location.href = '/api/v1/auth/google'}
			>
				<Icon>
					<IconBrandGoogle />
				</Icon>{' '}
				Continue with Google
			</Button>
			<Button
				variant='secondary'
				fullWidth
				onClick={() => window.location.href = '/api/v1/auth/github'}
			>
				<Icon>
					<IconBrandGithub />
				</Icon>{' '}
				Continue with GitHub
			</Button>
		</div>
	);
}

```

### File: apps\web\features\auth\components\onboarding\displays\GlassDisplayCard.tsx

```tsx
import { Icon, useWizardContext } from '@projective/ui';
import { IconCode } from '@tabler/icons-preact';

export function GlassDisplayCard() {
	const { currentStep } = useWizardContext();

	// We rotate the card mathematically based on whether the step is even or odd.
	const isFlipped = currentStep.value % 2 === 0;

	return (
		<div class={`glass-display ${isFlipped ? 'glass-display--flipped' : ''}`}>
			{/* Front Face (Odd Steps: 1, 3) */}
			<div class='glass-display__face'>
				<Icon size={48} color='primary'>
					<IconCode />
				</Icon>
				<h3 style={{ marginTop: '1rem', color: 'var(--text-main)' }}>
					Step {currentStep.value} Placeholder
				</h3>
				<p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
					This is the front of the card.
				</p>
			</div>

			{/* Back Face (Even Steps: 2, 4) */}
			<div class='glass-display__face glass-display__face--back'>
				<h3 style={{ color: 'var(--text-main)' }}>Step {currentStep.value} Placeholder</h3>
				<p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
					This is the back of the card.
				</p>
			</div>
		</div>
	);
}

```

### File: apps\web\features\auth\components\onboarding\inputs\AccountInput.tsx

```tsx
import { Signal } from '@preact/signals';
import { Button, useWizardContext } from '@projective/ui';
import { TextField } from '@projective/fields';
import { SSOActions } from '../actions/SSOActions.tsx';

interface AccountInputProps {
	email: Signal<string>;
	password: Signal<string>;
}

export function AccountInput({ email, password }: AccountInputProps) {
	const { next } = useWizardContext();

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '1.25rem',
				animation: 'fadeIn 0.3s ease',
			}}
		>
			<div style={{ marginBottom: '1rem' }}>
				<h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
					Join Projective
				</h1>
				<p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>
					Already have an account?{' '}
					<a href='/login' style={{ color: 'var(--primary)', textDecoration: 'none' }}>Log in</a>
				</p>
			</div>

			<TextField
				label='Email Address'
				type='email'
				value={email}
				floatingRule='auto'
			/>

			<TextField
				label='Password'
				type='password'
				value={password}
				floatingRule='auto'
			/>

			<Button
				variant='primary'
				fullWidth
				onClick={next}
				disabled={!email.value || !password.value}
			>
				Continue
			</Button>

			<SSOActions />
		</div>
	);
}

```

### File: apps\web\features\auth\components\onboarding\inputs\IdentityInput.tsx

```tsx

```

### File: apps\web\features\auth\components\onboarding\inputs\ObjectiveInput.tsx

```tsx

```

### File: apps\web\features\auth\components\onboarding\inputs\TagInput.tsx

```tsx

```

### File: apps\web\features\auth\contracts\context.ts

```ts
export interface SwitchProfileRequest {
	profileId: string;
	type: 'freelancer' | 'business';
}

export interface SwitchTeamRequest {
	teamId: string;
}

export interface ContextSwitchResult {
	success: boolean;
	newContext: {
		type: 'personal' | 'business' | 'team';
		id: string;
	};
}

```

### File: apps\web\features\auth\contracts\login.ts

```ts
export interface LoginWithEmailRequest {
	email: string;
	password: string;
}

```

### File: apps\web\features\auth\contracts\onboading.ts

```ts
export interface OnboardingRequest {
	firstName: string;
	lastName: string;
	username: string;
	dob: string;
	type: 'freelancer' | 'client';
}

```

### File: apps\web\features\auth\contracts\register.ts

```ts
export interface RegisterWithEmailRequest {
	email: string;
	password: string;
}

export interface RegisterWithEmailResponse {
	data: {
		user: {
			id: string;
			aud: string;
			role: string;
			email: string;
			email_confirmed_at: string;
			phone: string;
			last_sign_in_at: string;
			app_metadata: {
				provider: string;
				providers: string[];
			};
			user_metadata: {};
			identities: [
				{
					identity_id: string;
					id: string;
					user_id: string;
					identity_data: {
						email: string;
						email_verified: string;
						phone_verified: string;
						sub: string;
					};
					provider: string;
					last_sign_in_at: string;
					created_at: string;
					updated_at: string;
					email: string;
				},
			];
			created_at: string;
			updated_at: string;
		};
		session: {
			access_token: string;
			token_type: string;
			expires_in: number;
			expires_at: number;
			refresh_token: string;
			user: {
				id: string;
				aud: string;
				role: string;
				email: string;
				email_confirmed_at: string;
				phone: string;
				last_sign_in_at: string;
				app_metadata: {
					provider: string;
					providers: string[];
				};
				user_metadata: {};
				identities: [
					{
						identity_id: string;
						id: string;
						user_id: string;
						identity_data: {
							email: string;
							email_verified: false;
							phone_verified: false;
							sub: string;
						};
						provider: string;
						last_sign_in_at: string;
						created_at: string;
						updated_at: string;
						email: string;
					},
				];
				created_at: string;
				updated_at: string;
			};
		};
	};
	error: string | null;
}

```

### File: apps\web\features\auth\islands\index.ts

```ts
// export * from './Login.tsx';
export * from './Verify.tsx';
export * from './OnboardingWizard.island.tsx';

```

### File: apps\web\features\auth\islands\LoginCanvas.island.tsx

```tsx
// import { useSignal } from '@preact/signals';
// import { Button, Icon } from '@projective/ui';
// import { TextField } from '@projective/fields';
// import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-preact';
// import '../styles/pages/login.css';
// import { useCallback } from 'preact/hooks';

// export default function LoginCanvas() {
// 	const email = useSignal('');
// 	const password = useSignal('');
// 	const isLoading = useSignal(false);

// 	const handleLogin = async (e: Event) => {
// 		e.preventDefault();
// 		isLoading.value = true;
// 		try {
// 			const res = await fetch('/api/v1/auth/login', {
// 				method: 'POST',
// 				headers: { 'Content-Type': 'application/json' },
// 				body: JSON.stringify({ email: email.value, password: password.value }),
// 			});
// 			if (res.ok) window.location.href = '/dashboard';
// 		} finally {
// 			isLoading.value = false;
// 		}
// 	};

// 	const handleLoginWithGoogle = useCallback(() => {
// 		// if (loading) return;
// 		// setErr(null);
// 		// setLoading(true);

// 		try {
// 			const params = new URLSearchParams({
// 				next: '/',
// 			});
// 			const startUrl = `/api/v1/auth/google/google-login?${params.toString()}`;

// 			globalThis.location.assign(startUrl);
// 		} catch (e) {
// 			const msg = e instanceof Error ? e.message : 'Unknown error starting OAuth';
// 			console.error('OAuth start exception', e);
// 			globalThis.dispatchEvent(
// 				new CustomEvent('auth:error', { detail: { stage: 'oauth_start', error: String(msg) } }),
// 			);
// 		}
// 	}, []);

// 	const anchorGraphic = (
// 		<>
// 			<div class='login-graphic'>
// 				<div class='login-graphic__pipeline'>
// 					<div class='login-graphic__block' />
// 				</div>
// 			</div>
// 			<div style={{ position: 'absolute', bottom: '3rem', left: '3rem' }}>
// 				<h2 style={{ fontSize: '1.5rem', fontWeight: 500, margin: '0 0 0.5rem 0' }}>
// 					High-Trust Workflows.
// 				</h2>
// 				<p style={{ color: 'var(--text-muted)', margin: 0 }}>
// 					Log in to access your escrow timelines and team pipelines.
// 				</p>
// 			</div>
// 		</>
// 	);

// 	return (
// 		<AuthLayout anchorContent={anchorGraphic} anchorRatio='50'>
// 			<div style={{ textAlign: 'center', marginBottom: '1rem' }}>
// 				<h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
// 					Welcome Back
// 				</h1>
// 				<p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>
// 					Don't have an account?{' '}
// 					<a href='/register' style={{ color: 'var(--primary)', textDecoration: 'none' }}>
// 						Sign up
// 					</a>
// 				</p>
// 			</div>

// 			<form
// 				onSubmit={handleLogin}
// 				style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
// 			>
// 				<TextField label='Email Address' type='email' value={email} required floatingRule='auto' />
// 				<TextField label='Password' type='password' value={password} required floatingRule='auto' />

// 				<a
// 					href='/reset'
// 					style={{
// 						textAlign: 'right',
// 						fontSize: '0.75rem',
// 						color: 'var(--primary)',
// 						textDecoration: 'none',
// 						marginTop: '-0.75rem',
// 						fontWeight: 500,
// 					}}
// 				>
// 					Forgot password?
// 				</a>

// 				<Button variant='primary' loading={isLoading.value} fullWidth>
// 					Log In
// 				</Button>
// 			</form>

// 			<div
// 				style={{
// 					display: 'flex',
// 					alignItems: 'center',
// 					margin: '1.5rem 0',
// 					color: 'var(--text-muted)',
// 					fontSize: '0.75rem',
// 				}}
// 			>
// 				<div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
// 				<span style={{ padding: '0 1rem', fontWeight: 500 }}>OR</span>
// 				<div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
// 			</div>

// 			<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
// 				<Button
// 					variant='secondary'
// 					fullWidth
// 					onClick={() => handleLoginWithGoogle()}
// 				>
// 					<Icon>
// 						<IconBrandGoogle />
// 					</Icon>
// 					Continue with Google
// 				</Button>
// 				<Button
// 					variant='secondary'
// 					fullWidth
// 					onClick={() => window.location.href = '/api/v1/auth/github'}
// 				>
// 					<Icon>
// 						<IconBrandGithub />
// 					</Icon>
// 					Continue with GitHub
// 				</Button>
// 			</div>
// 		</AuthLayout>
// 	);
// }

```

### File: apps\web\features\auth\islands\OnboardingWizard.island.tsx

```tsx
import { signal } from '@preact/signals';
import { Icon, IconButton, useWizardContext, WizardProvider } from '@projective/ui';
import { IconArrowLeft } from '@tabler/icons-preact';

import { GlassDisplayCard } from '../components/onboarding/displays/GlassDisplayCard.tsx';
import { AccountInput } from '../components/onboarding/inputs/AccountInput.tsx';
import '../styles/pages/onboarding-layout.css';

// --- Shared Payload State ---
export const onboardingPayload = {
	email: signal(''),
	password: signal(''),
	// ... we will add the rest in the next prompt
};

// --- Orchestrator for the Right Side Inputs ---
function WizardInputOrchestrator() {
	const { currentStep } = useWizardContext();

	return (
		<>
			{currentStep.value === 1 && (
				<AccountInput email={onboardingPayload.email} password={onboardingPayload.password} />
			)}
			{/* Future steps will be orchestrated here */}
			{currentStep.value === 2 && <div>Step 2 Inputs Pending...</div>}
		</>
	);
}

// --- Main Island Composer ---
export default function OnboardingWizardIsland() {
	return (
		<WizardProvider totalSteps={4}>
			<div class='onboarding-canvas' data-theme='dark'>
				<div class='onboarding-canvas__ambient' />

				<div class='onboarding-card'>
					{/* Global Escape to Public Site */}
					<a href='/explore' class='onboarding-card__back-global' aria-label='Return to site'>
						<IconButton aria-label='Back' ghost>
							<Icon>
								<IconArrowLeft />
							</Icon>
						</IconButton>
					</a>

					{/* Left Pane: Rotating 3D Display */}
					<div class='onboarding-card__left'>
						<GlassDisplayCard />
					</div>

					{/* Right Pane: Interactive Forms */}
					<div class='onboarding-card__right'>
						<WizardInputOrchestrator />

						{/* Horizontal Tracker will go here at the bottom */}
					</div>
				</div>
			</div>
		</WizardProvider>
	);
}

```

### File: apps\web\features\auth\islands\Verify.tsx

```tsx
// import { useEffect, useState } from 'preact/hooks';

// type Props = {
// 	email: string | undefined;
// };

// export default function VerifyIsland({ email }: Props) {
// 	const [status, setStatus] = useState<'parsing' | 'verifying' | 'awaiting' | 'done' | 'error'>(
// 		'parsing',
// 	);
// 	const [err, setErr] = useState<string | null>(null);

// 	useEffect(() => {
// 		const params = new URLSearchParams(globalThis.location.hash.replace(/^#/, ''));
// 		const access_token = params.get('access_token');
// 		const refresh_token = params.get('refresh_token');

// 		if (access_token && refresh_token) {
// 			setStatus('verifying');
// 			fetch('/api/v1/auth/callback', {
// 				method: 'POST',
// 				headers: { 'content-type': 'application/json' },
// 				body: JSON.stringify({ access_token, refresh_token }),
// 			})
// 				.then(async (r) => {
// 					if (!r.ok) throw new Error((await r.json()).error?.message ?? 'Failed to set session');

// 					setStatus('done');
// 					globalThis.location.href = '/onboarding';
// 				})
// 				.catch((e) => {
// 					setErr(e.message);
// 					setStatus('error');
// 				});
// 		} else {
// 			setStatus('awaiting');
// 		}
// 	}, []);

// 	return (
// 		<main class='mx-auto max-w-md p-6'>
// 			<h1 class='text-2xl font-semibold mb-4'>Verify your email</h1>

// 			{status === 'parsing' && <p>Preparing…</p>}
// 			{status === 'verifying' && <p>Signing you in…</p>}
// 			{status === 'done' && <p>Redirecting…</p>}

// 			{status === 'awaiting' && (
// 				<section>
// 					<p class='mb-3'>We’ve sent a verification link to your email. Click it to continue.</p>
// 					<p>{email}</p>
// 					<ResendButton email={email} />
// 				</section>
// 			)}

// 			{status === 'error' && (
// 				<section class='text-red-600'>
// 					<p class='mb-2'>We couldn’t verify your session.</p>
// 					<p class='mb-4 text-sm'>{err}</p>
// 					<a class='underline' href='/verify'>Try again</a>
// 				</section>
// 			)}
// 		</main>
// 	);
// }

```

### File: apps\web\features\auth\middleware\verify_guard.ts

```ts

```

### File: apps\web\features\auth\services\claims.ts

```ts
export type JwtClaims = {
	sub: string;
	exp?: number;
	active_profile_type?: 'freelancer' | 'business';
	active_profile_id?: string;
	active_team_id?: string | null;
} | null;

export function parseJwt(token?: string): JwtClaims {
	if (!token) return null;
	try {
		const [, b64] = token.split('.');
		if (!b64) return null;
		const json = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
		return JSON.parse(json);
	} catch {
		return null;
	}
}

export function isExpired(exp?: number, skewSec = 30) {
	if (!exp) return true;
	return exp <= Math.floor(Date.now() / 1000) + skewSec;
}

```

### File: apps\web\features\auth\services\context.ts

```ts
import {
	Deps,
	fail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
	supabaseClient,
} from '@projective/backend';
import { SwitchProfileRequest, SwitchTeamRequest } from '../contracts/context.ts';

/**
 * Switches the current user's active context to a specific TEAM.
 * STRICT: Clears active_profile_id and active_profile_type.
 */
export async function switchActiveTeam(
	{ teamId }: SwitchTeamRequest,
	deps: Deps = {},
): Promise<Result<{ activeTeamId: string }>> {
	if (!teamId) {
		return fail('bad_request', 'Team ID is required.', 400);
	}

	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data: { user }, error: authError } = await supabase.auth.getUser();

		if (authError || !user) {
			return fail('unauthorized', 'You must be signed in to switch teams.', 401);
		}

		// 1. Verify Membership (Security Guard)
		const { data: membership, error: memberError } = await supabase
			.schema('org')
			.from('team_memberships')
			.select('id, role')
			.eq('team_id', teamId)
			.eq('user_id', user.id)
			.eq('status', 'active')
			.single();

		if (memberError || !membership) {
			return fail('forbidden', 'You are not an active member of this team.', 403);
		}

		// 2. Update Session Context (Mutually Exclusive)
		const { error: updateError } = await supabase
			.schema('security')
			.from('session_context')
			.upsert(
				{
					user_id: user.id,
					active_team_id: teamId, // SET Team
					active_profile_id: null, // CLEAR Profile
					active_profile_type: null, // CLEAR Type
					updated_at: new Date().toISOString(),
				},
				{ onConflict: 'user_id' },
			);

		if (updateError) {
			const n = normaliseSupabaseError(updateError);
			return fail(n.code, n.message, n.status);
		}

		return ok({ activeTeamId: teamId });
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}

/**
 * Switches the current user's active context to a specific PROFILE (Freelancer or Business).
 * STRICT: Clears active_team_id.
 */
export async function switchActiveProfile(
	{ profileId, type }: SwitchProfileRequest,
	deps: Deps = {},
): Promise<Result<{ activeProfileId: string; type: string }>> {
	if (!profileId || !type) {
		return fail('bad_request', 'Profile ID and Type are required.', 400);
	}

	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data: { user }, error: authError } = await supabase.auth.getUser();

		if (authError || !user) {
			return fail('unauthorized', 'You must be signed in to switch profiles.', 401);
		}

		// 1. Verify Ownership (Security Guard)
		const table = type === 'freelancer' ? 'freelancer_profiles' : 'business_profiles';
		// Business = owner_user_id, Freelancer = user_id
		const ownerCol = type === 'freelancer' ? 'user_id' : 'owner_user_id';

		const { data: profile, error: profileError } = await supabase
			.schema('org')
			.from(table)
			.select('id')
			.eq('id', profileId)
			.eq(ownerCol, user.id)
			.single();

		if (profileError || !profile) {
			return fail('forbidden', 'You do not own this profile.', 403);
		}

		// 2. Update Session Context (Mutually Exclusive)
		const { error: updateError } = await supabase
			.schema('security')
			.from('session_context')
			.upsert(
				{
					user_id: user.id,
					active_profile_id: profileId, // SET Profile
					active_profile_type: type, // SET Type
					active_team_id: null, // CLEAR Team
					updated_at: new Date().toISOString(),
				},
				{ onConflict: 'user_id' },
			);

		if (updateError) {
			const n = normaliseSupabaseError(updateError);
			return fail(n.code, n.message, n.status);
		}

		return ok({ activeProfileId: profileId, type });
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}

```

### File: apps\web\features\auth\services\email\login.ts

```ts
import {
	Deps,
	fail,
	isLikelyEmail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
	SignInData,
	supabaseClient,
} from '@projective/backend';
import { LoginWithEmailRequest } from '../../contracts/login.ts';

export async function loginWithEmail(
	{ email, password }: LoginWithEmailRequest,
	deps: Deps = {},
): Promise<Result<SignInData>> {
	const e = (email ?? '').trim().toLowerCase();
	const p = (password ?? '').trim();

	if (!e || !p) {
		return fail('bad_request', 'Email and password are required.', 400);
	}
	if (!isLikelyEmail(e)) {
		return fail('bad_request', 'Invalid email format.', 400);
	}

	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data, error } = await supabase.auth.signInWithPassword({
			email: e,
			password: p,
		});

		if (error) {
			const n = normaliseSupabaseError(error);
			return fail(n.code, n.message, n.status);
		}

		return ok(data);
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}

```

### File: apps\web\features\auth\services\email\register.ts

```ts
import {
	Deps,
	fail,
	isLikelyEmail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	RegisterOptions,
	Result,
	SignUpData,
	supabaseClient,
} from '@projective/backend';
import { Config } from '@projective/backend';
import { RegisterWithEmailRequest } from '../../contracts/register.ts';

export async function registerWithEmail(
	{ email, password }: RegisterWithEmailRequest,
	deps: Deps = {},
	opts: RegisterOptions = {},
): Promise<Result<SignUpData>> {
	const e = (email ?? '').trim().toLowerCase();
	const p = (password ?? '').trim();

	if (!e || !p) return fail('bad_request', 'Email and password are required.', 400);
	if (!isLikelyEmail(e)) return fail('bad_request', 'Invalid email format.', 400);
	if (p.length < 8) return fail('bad_request', 'Password must be at least 8 characters.', 400);

	try {
		const emailRedirectTo = `${Config.BASE_URL}/verify`;
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data, error } = await supabase.auth.signUp({
			email: e,
			password: p,
			options: {
				data: opts.metadata,
				emailRedirectTo,
				captchaToken: opts.captchaToken,
			},
		});

		if (error) {
			const n = normaliseSupabaseError(error);
			return fail(n.code, n.message, n.status);
		}

		return ok(data);
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}

```

### File: apps\web\features\auth\services\finalise-login.ts

```ts

```

### File: apps\web\features\auth\services\oauth.ts

```ts
import { supabaseClient } from '@projective/backend';

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

	if (error || !data?.url) {
		throw new Error(error?.message || 'OAuth init failed');
	}
	return data.url;
}

```

### File: apps\web\features\auth\services\onboarding.ts

```ts
import {
	Deps,
	fail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
	supabaseClient,
} from '@projective/backend';
import { OnboardingRequest } from '../contracts/onboading.ts';

export async function onboarding(
	{
		firstName,
		lastName,
		username,
		dob,
		type,
	}: OnboardingRequest,
	deps: Deps = {},
): Promise<Result<any>> {
	if (!firstName || !username || !dob) {
		return fail(
			'bad_request',
			'First name, Date of Birth and username are required.',
			400,
		);
	}

	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data: { user }, error: authError } = await supabase.auth
			.getUser();

		if (authError || !user) {
			return fail(
				'unauthorized',
				'You must be signed in to onboard.',
				401,
			);
		}

		const { error: userError } = await supabase.schema('org').rpc(
			'onboard_user',
			{
				p_first_name: firstName,
				p_last_name: lastName,
				p_username: username,
				p_dob: dob,
				p_profile_type: type,
			},
		);

		if (userError) {
			const n = normaliseSupabaseError(userError);
			return fail(n.code, n.message, n.status);
		}

		return ok<any>({});
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}

export async function isOnboarded(req: Request) {
	const supabase = await supabaseClient(req);
	const { data, error } = await supabase.auth.getUser();

	if (error || !data.user?.id) {
		return false;
	}

	// FIX: Explicitly check for returned rows
	const { data: userData } = await supabase
		.schema('org')
		.from('users_public')
		.select('user_id')
		.eq('user_id', data.user.id);

	// If array has items, user is onboarded
	if (userData && userData.length > 0) {
		return true;
	}

	return false;
}

```

### File: apps\web\features\auth\services\refresh.ts

```ts
import { getAuthCookies } from '@projective/backend';
import { supabaseClient } from '@projective/backend';

type RefreshResult = { access: string; refresh: string } | null;

export async function refreshWithToken(refreshToken: string): Promise<RefreshResult> {
	const sb = await supabaseClient();
	const { data, error } = await sb.auth.refreshSession({ refresh_token: refreshToken });

	if (error || !data?.session?.access_token || !data?.session?.refresh_token) {
		return null;
	}
	return {
		access: data.session.access_token,
		refresh: data.session.refresh_token,
	};
}

export async function maybeRefreshFromRequest(req: Request): Promise<RefreshResult> {
	const { refreshToken } = getAuthCookies(req);
	if (!refreshToken) return null;
	return await refreshWithToken(refreshToken);
}

```

### File: apps\web\features\auth\services\resend.ts

```ts
import {
	Config,
	fail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
} from '@projective/backend';
import { supabaseClient } from '@projective/backend';

export async function resendVerificationEmail(email: string): Promise<Result<{ sent: true }>> {
	if (!email) return fail('bad_request', 'Email is required.', 400);
	try {
		const emailRedirectTo = `${Config.BASE_URL}/verify`;
		const supabase = await supabaseClient();
		const { error } = await supabase.auth.resend({
			type: 'signup',
			email,
			options: {
				emailRedirectTo,
			},
		});
		if (error) {
			const n = normaliseSupabaseError(error);
			return fail(n.code, n.message, n.status);
		}
		return ok({ sent: true });
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}

```

### File: apps\web\features\auth\services\session-context-service.ts

```ts

```

### File: apps\web\features\auth\styles\pages\onboarding-layout.css

```css
/* #region ONBOARDING CANVAS & BACKGROUND */
.onboarding-canvas {
	display: flex;
	min-height: 100vh;
	width: 100%;
	align-items: center;
	justify-content: center;
	background-color: var(--bg);
	position: relative;
	overflow: hidden;
}

/* Ambient animated background elements */
.onboarding-canvas__ambient {
	position: absolute;
	top: -10%;
	left: -10%;
	width: 120%;
	height: 120%;
	background:
		radial-gradient(
			circle at 20% 30%,
			hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.05) 0%,
			transparent 40%
		),
		radial-gradient(
		circle at 80% 70%,
		hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.08) 0%,
		transparent 50%
	);
	z-index: 0;
	pointer-events: none;
}
/* #endregion */

/* #region CENTERED GLASSMORPHISM CARD */
.onboarding-card {
	position: relative;
	z-index: 1;
	display: flex;
	width: 900px;
	height: 600px;
	max-width: 95vw;
	background: hsla(var(--card-hue), var(--card-saturation), var(--card-lightness), 0.6);
	backdrop-filter: blur(24px);
	-webkit-backdrop-filter: blur(24px);
	border: 1px solid var(--border-color);
	border-radius: var(--border-radius__xlarge);
	box-shadow: 0 24px 48px rgba(0, 0, 0, 0.1);
	overflow: hidden;
}

/* Global Escape Hatch */
.onboarding-card__back-global {
	position: absolute;
	top: 1.5rem;
	left: 1.5rem;
	z-index: 10;
	color: var(--text-muted);
	transition: color var(--fast) ease;
}

.onboarding-card__back-global:hover {
	color: var(--text-main);
}

.onboarding-card__left {
	flex: 1;
	padding: 2rem;
	display: flex;
	align-items: center;
	justify-content: center;
	perspective: 1000px; /* Required for the 3D flip effect */
}

.onboarding-card__right {
	flex: 1;
	padding: 4rem 3rem;
	display: flex;
	flex-direction: column;
	justify-content: center;
	background: var(--bg); /* Solid background for inputs to prevent text illegibility */
	border-left: 1px solid var(--border-color);
}
/* #endregion */

/* #region 3D FLIP DISPLAY PLACEHOLDER */
.glass-display {
	width: 100%;
	height: 100%;
	position: relative;
	transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
	transform-style: preserve-3d;
}

/* Modifier controlled by the active step */
.glass-display--flipped {
	transform: rotateY(180deg);
}

.glass-display__face {
	position: absolute;
	width: 100%;
	height: 100%;
	backface-visibility: hidden;
	border-radius: var(--border-radius__large);
	background: var(--input-bg);
	border: 1px solid var(--border-color);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	padding: 2rem;
}

.glass-display__face--back {
	transform: rotateY(180deg);
}
/* #endregion */

```

### File: apps\web\routes\(auth)\forgot-password.tsx

```tsx

```

### File: apps\web\routes\(auth)\login.tsx

```tsx
import { Head } from 'fresh/runtime';

export default function Login() {
	return (
		<>
			<Head>
				<title>Login - Projective</title>
			</Head>
			{/* <LoginCanvasIsland /> */}
		</>
	);
}

```

### File: apps\web\routes\(auth)\onboarding.tsx

```tsx
import { Head } from 'fresh/runtime';
import OnboardingWizardIsland from '@features/auth/islands/OnboardingWizard.island.tsx';

export default function Onboarding() {
	return (
		<>
			<Head>
				<title>Join Projective</title>
			</Head>
			<OnboardingWizardIsland />
		</>
	);
}

```

### File: apps\web\routes\(auth)\reset\[token].tsx

```tsx

```

### File: apps\web\routes\(auth)\verify\index.tsx

```tsx
import { Head } from 'fresh/runtime';
import { State } from '@utils';
import { getCookies } from '@std/http/cookie';
import { RenderableProps } from 'preact';
import { PageProps } from 'fresh';
// import VerifyIslandWrapper from '../(_islands)/VerifyIslandWrapper.tsx';

// deno-lint-ignore no-explicit-any
export default function Verify(ctx: RenderableProps<PageProps<never, State>, any>) {
	const cookies = getCookies(ctx.req.headers);
	const email = cookies['verify_email'] ? decodeURIComponent(cookies['verify_email']) : undefined;

	return (
		<>
			<Head>
				<title>Verify</title>
			</Head>

			{/* <VerifyIslandWrapper email={email} /> */}
		</>
	);
}

```

### File: apps\web\routes\(auth)\_middleware.ts

```ts
import { define } from '@utils';

export const handler = define.middleware(async (ctx) => {
	const url = new URL(ctx.req.url);

	if (ctx.state.isOnboarded && !url.pathname.includes('/logout')) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/dashboard',
			},
		});
	}

	if (ctx.state.isAuthenticated && !ctx.state.isOnboarded) {
		if (url.pathname === '/onboarding') {
			return await ctx.next();
		}

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/onboarding',
			},
		});
	}

	const res = await ctx.next();
	return res;
});

```

