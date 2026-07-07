import { define } from '@utils';
import { Partial } from 'fresh/runtime';
import { AuthBackground } from '@features/auth/components/shared/AuthBackground.tsx';
// NOTE: auth-shell.css is loaded globally via apps/web/styles/styles.css — a CSS
// import here (server component) is NOT bundled to the client, so it must not live here.

/**
 * Auth layout. Hosts the animated backdrop + centres the glass shell, and enables
 * Fresh Partials so moving between /login, /join, /forgot-password, /reset and
 * /verify swaps only the page content (no full reload). The `f-client-nav`
 * container + backdrop stay mounted; the `auth-page` Partial is what's replaced.
 *
 * `f-client-nav` isn't in Fresh's JSX attribute types yet, so it's applied via spread.
 */
export default define.layout(function AuthLayout({ Component }) {
	return (
		<div class='auth-root' {...{ 'f-client-nav': true }}>
			<AuthBackground />
			<Partial name='auth-page'>
				<Component />
			</Partial>
		</div>
	);
});
