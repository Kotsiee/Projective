/**
 * @file LoginDisplay.tsx
 * @description The visual right-hand side of the login canvas.
 */

// #region Imports
import '../../styles/components/login/login-display.css';
import { Logo } from '@projective/ui';
// #endregion

// #region Component
export function LoginDisplay() {
	const logos = Array.from({ length: 15 });

	return (
		<div class='login-display'>
			<div class='login-display__background'>
				{logos.map((_, index) => <Logo key={index} color='var(--primary)' size={80} />)}
			</div>
			<div class='login-display__content'>
				<h1>
					Build Together.<br />Deliver Better.
				</h1>
				<p>Continue your journey and manage your projects.</p>
			</div>
		</div>
	);
}
// #endregion
