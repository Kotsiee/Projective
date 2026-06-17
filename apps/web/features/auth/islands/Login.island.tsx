/**
 * @file Login.island.tsx
 * @description The main login page layout, reversing the onboarding split to feature the form on the left.
 */

// #region Imports
import '../styles/pages/login.css';
import { Icon, IconButton, toast } from '@projective/ui';
import { IconArrowLeft } from '@tabler/icons-preact';
import { useEffect } from 'preact/hooks';
import { LoginInput } from '../components/login/LoginInput.tsx';
import { LoginDisplay } from '../components/login/LoginDisplay.tsx';
// #endregion

// #region Component
export default function LoginIsland() {
	// Intercept URL parameters for error or success messages from callbacks
	useEffect(() => {
		const params = new URLSearchParams(globalThis.location.search);
		const error = params.get('error');
		const message = params.get('message');

		if (error) toast.error(error);
		if (message) toast.success(message);

		// Clean up the URL to prevent repeating toasts on refresh
		if (error || message) {
			globalThis.history.replaceState(
				null,
				document.title,
				globalThis.location.pathname,
			);
		}
	}, []);

	return (
		<div class='login-canvas'>
			<div class='login-canvas__left'>
				<div class='login-canvas__header'>
					<IconButton className='login-canvas__back' href='/' aria-label='Back' ghost>
						<Icon>
							<IconArrowLeft />
						</Icon>
					</IconButton>
					<div class='login-canvas__logo'>Logo</div>
				</div>

				<LoginInput />
			</div>

			<div class='login-canvas__right'>
				<LoginDisplay />
			</div>
		</div>
	);
}
// #endregion
