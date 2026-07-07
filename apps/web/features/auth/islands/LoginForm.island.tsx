/**
 * @file LoginForm.island.tsx
 * @description Interactive login form (the only hydrated part of the login page).
 * Inline field + form-level validation with ARIA; toasts are kept for the
 * page-load messages forwarded by auth callbacks (?error=/?message=).
 */

// #region Imports
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { toast } from '@projective/ui';
import { TextField } from '@projective/fields';
import { isLikelyEmail } from 'packages/backend/src/core/validation/email.ts';
import { SSOActions } from '../components/onboarding/actions/SSOActions.tsx';
import { LoginService } from '../services/LoginService.ts';
// #endregion

// #region Component
export default function LoginForm() {
	const email = useSignal('');
	const password = useSignal('');
	const emailError = useSignal('');
	const formError = useSignal('');
	const isLoading = useSignal(false);

	// Surface callback error/success params, then clean the URL.
	useEffect(() => {
		const params = new URLSearchParams(globalThis.location.search);
		const error = params.get('error');
		const message = params.get('message');
		if (error) toast.error(error);
		if (message) toast.success(message);
		if (error || message) {
			globalThis.history.replaceState(null, document.title, globalThis.location.pathname);
		}
	}, []);

	const validateEmail = () => {
		emailError.value = email.value && !isLikelyEmail(email.value)
			? 'Enter a valid email address.'
			: '';
	};

	const handleLogin = async () => {
		if (isLoading.value) return;
		if (!email.value || !isLikelyEmail(email.value)) {
			emailError.value = 'Enter a valid email address.';
			return;
		}
		if (!password.value) return;

		formError.value = '';
		isLoading.value = true;
		try {
			const res = await LoginService.loginWithEmail({
				email: email.value.trim().toLowerCase(),
				password: password.value,
			});
			if (res.redirectTo) globalThis.location.href = res.redirectTo;
		} catch (err) {
			formError.value = err instanceof Error
				? err.message
				: 'An unexpected error occurred during login.';
		} finally {
			isLoading.value = false;
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') handleLogin();
	};

	return (
		<>
			<div class='auth-head'>
				<span class='auth-kicker'>Log in</span>
				<h1 class='auth-title'>Welcome back</h1>
				<p class='auth-sub'>Good to see you again. Let's get to work.</p>
			</div>

			<div class='auth-form'>
				{formError.value && (
					<div class='auth-alert auth-alert--error' role='alert'>{formError.value}</div>
				)}

				<TextField
					id='login-email'
					variant='glass'
					label='Email address'
					type='email'
					value={email}
					floatingRule='auto'
					autoComplete='email'
					required
					error={emailError.value}
					disabled={isLoading.value}
					onBlur={validateEmail}
					onInput={() => {
						if (emailError.value) emailError.value = '';
					}}
					onKeyDown={handleKeyDown}
				/>

				<TextField
					id='login-password'
					variant='glass'
					label='Password'
					type='password'
					value={password}
					floatingRule='auto'
					autoComplete='current-password'
					required
					disabled={isLoading.value}
					onKeyDown={handleKeyDown}
				/>

				<div class='auth-row'>
					<a href='/forgot-password' class='auth-link'>Forgot password?</a>
				</div>

				<button
					class='auth-cta'
					type='button'
					onClick={handleLogin}
					disabled={!email.value || !password.value || isLoading.value}
				>
					{isLoading.value ? 'Authenticating…' : 'Log in'}
				</button>

				<SSOActions intent='login' />
			</div>

			<p class='auth-foot'>
				Don't have an account? <a href='/join'>Sign up</a>
			</p>
		</>
	);
}
// #endregion
