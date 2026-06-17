/**
 * @file LoginInput.tsx
 * @description The main login form utilizing the LoginService to authenticate.
 */

// #region Imports
import '../../styles/components/login/login-input.css';
import { useSignal } from '@preact/signals';
import { Button, toast } from '@projective/ui';
import { TextField } from '@projective/fields';
import { SSOActions } from '../onboarding/actions/SSOActions.tsx';
import { LoginService } from '../../services/LoginService.ts';
// #endregion

// #region Component
export function LoginInput() {
	// #region State
	const email = useSignal('');
	const password = useSignal('');
	const isLoading = useSignal(false);
	// #endregion

	// #region Handlers
	const handleLogin = async () => {
		if (!email.value || !password.value || isLoading.value) return;

		isLoading.value = true;

		try {
			const payload = {
				email: email.value.trim().toLowerCase(),
				password: password.value,
			};

			const res = await LoginService.loginWithEmail(payload);

			if (res.redirectTo) {
				globalThis.location.href = res.redirectTo;
			}
		} catch (err: any) {
			toast.error(err.message || 'An unexpected error occurred during login.');
		} finally {
			isLoading.value = false;
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleLogin();
		}
	};
	// #endregion

	return (
		<div class='login-input'>
			<div class='login-input__content'>
				<h1 class='login-input__title'>Log In</h1>
				<p class='login-input__subtitle'>Welcome back to Projective.</p>

				<div class='login-input__form'>
					<TextField
						label='Email Address'
						type='email'
						value={email}
						floatingRule='auto'
						disabled={isLoading.value}
						onKeyDown={handleKeyDown}
					/>

					<TextField
						label='Password'
						type='password'
						value={password}
						floatingRule='auto'
						disabled={isLoading.value}
						onKeyDown={handleKeyDown}
					/>

					<a href='/forgot-password' class='login-input__forgot-password'>
						Forgot Password?
					</a>

					<Button
						variant='primary'
						fullWidth
						onClick={handleLogin}
						disabled={!email.value || !password.value || isLoading.value}
						loading={isLoading.value}
					>
						{isLoading.value ? 'Authenticating...' : 'Log In'}
					</Button>
				</div>

				<SSOActions />

				<p class='login-input__signup'>
					Don't have an account?
					<a href='/join'>Sign up</a>
				</p>
			</div>
		</div>
	);
}
// #endregion
