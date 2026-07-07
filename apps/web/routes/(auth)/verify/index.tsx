import { Head } from 'fresh/runtime';
import { State } from '@utils';
import { getCookies } from '@std/http/cookie';
import { RenderableProps } from 'preact';
import { PageProps } from 'fresh';
import { AuthShell } from '@features/auth/components/shared/AuthShell.tsx';
import VerifyForm from '@features/auth/islands/VerifyForm.island.tsx';

// deno-lint-ignore no-explicit-any
export default function Verify(ctx: RenderableProps<PageProps<never, State>, any>) {
	const cookies = getCookies(ctx.req.headers);
	const email = cookies['verify_email'] ? decodeURIComponent(cookies['verify_email']) : undefined;

	return (
		<>
			<Head>
				<title>Verify your email · Projective</title>
			</Head>

			<AuthShell
				visual={
					<>
						<div class='auth-orbit'>
							<div class='auth-orbit__ring'>
								<span class='auth-orbit__sat'></span>
							</div>
							<div class='auth-orbit__ring two'></div>
							<div class='auth-orbit__core'>
								<svg viewBox='0 0 24 24'>
									<path d='M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z' />
									<path d='m3.5 7 8.5 6 8.5-6' />
								</svg>
							</div>
						</div>
						<div class='auth-visual__body'>
							<span class='auth-eyebrow'>Almost there</span>
							<h1>
								One tap<br />
								<span class='auth-grad'>and you're in.</span>
							</h1>
							<p class='auth-lede'>
								We sent a secure link to your inbox. Confirm it from any device — it just works.
							</p>
						</div>
					</>
				}
			>
				<VerifyForm initialEmail={email} />
			</AuthShell>
		</>
	);
}
