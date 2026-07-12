/**
 * @file VerifyForm.island.tsx
 * @description Interactive email-verification page — the only hydrated part of
 * /verify. Two responsibilities:
 *   1. Resend the confirmation email (with a cooldown).
 *   2. LIVE-SUBSCRIBE to verification: it polls
 *      /api/v1/auth/verification-status and transitions the instant the email is
 *      confirmed — no manual refresh. Same-browser confirmations auto-log-in and
 *      redirect to the captured return target; cross-device confirmations show a
 *      "Verified ✓" state with a Continue-to-login prompt (we never mint a
 *      session from an email alone).
 */

import { Icon, toast } from '@projective/ui';
import { useSignal } from '@preact/signals';
import { IconCircleCheck, IconMail } from '@tabler/icons-preact';
import { useEffect } from 'preact/hooks';
import { TextField } from '@projective/fields';
import { ResendService } from '@features/auth/services/ResendService.ts';
import { VerificationStatusService } from '@features/auth/services/VerificationStatusService.ts';

/** Poll cadence and ceiling (~10 min, matching the verify_email cookie lifetime). */
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 200;

export default function VerifyForm({ initialEmail }: { initialEmail?: string }) {
	const email = useSignal(initialEmail ?? '');
	const countdown = useSignal(0);
	const isLoading = useSignal(false);

	// Subscription state.
	const verified = useSignal(false); // email confirmed (this or another device)
	const redirecting = useSignal(false); // session landed on THIS device → auto login
	const next = useSignal('/home'); // captured return target

	// Resend cooldown ticker.
	useEffect(() => {
		let timer: number;
		if (countdown.value > 0) {
			timer = setInterval(() => {
				countdown.value--;
			}, 1000);
		}
		return () => clearInterval(timer);
	}, [countdown.value]);

	// Live verification subscription (lightweight poll).
	useEffect(() => {
		let stopped = false;
		let attempts = 0;
		let timer: number | undefined;
		const controller = new AbortController();

		const schedule = () => {
			if (stopped || attempts >= MAX_POLLS) return;
			timer = setTimeout(poll, POLL_INTERVAL_MS);
		};

		const poll = async () => {
			if (stopped) return;
			attempts++;
			try {
				const status = await VerificationStatusService.check(controller.signal);
				next.value = status.next || '/home';

				// This device is signed in → automatic login, land on the return target.
				if (status.authenticated) {
					stopped = true;
					redirecting.value = true;
					globalThis.location.href = status.next || '/home';
					return;
				}

				// Confirmed elsewhere → show success; keep polling briefly in case the
				// session cookie lands here next (same-browser sequencing).
				if (status.verified) verified.value = true;
			} catch {
				/* transient (offline / aborted) — just try again next tick */
			}
			schedule();
		};

		timer = setTimeout(poll, POLL_INTERVAL_MS);
		return () => {
			stopped = true;
			controller.abort();
			if (timer !== undefined) clearTimeout(timer);
		};
	}, []);

	const handleResend = async () => {
		if (!email.value || countdown.value > 0 || isLoading.value) return;
		isLoading.value = true;
		try {
			await ResendService.resendEmail(email.value);
			toast.success('Verification email sent! Please check your inbox.');
			countdown.value = 60;
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : 'An unexpected error occurred while resending.',
			);
		} finally {
			isLoading.value = false;
		}
	};

	// --- Verified (cross-device) / signing-in states ---
	if (verified.value || redirecting.value) {
		const continueHref = `/login?next=${encodeURIComponent(next.value || '/home')}`;
		return (
			<>
				<div class='auth-head'>
					<div class='auth-icon auth-icon--success'>
						<Icon>
							<IconCircleCheck />
						</Icon>
					</div>
					<span class='auth-kicker'>Email verified</span>
					<h1 class='auth-title'>You're all set</h1>
					<p class='auth-sub'>
						{redirecting.value
							? 'Signing you in…'
							: 'Your email is confirmed. Continue to finish signing in on this device.'}
					</p>
				</div>

				{!redirecting.value && (
					<div class='auth-form'>
						<a class='auth-cta' href={continueHref}>Continue</a>
					</div>
				)}
			</>
		);
	}

	// --- Default: waiting for confirmation ---
	return (
		<>
			<div class='auth-head'>
				<div class='auth-icon'>
					<Icon>
						<IconMail />
					</Icon>
				</div>
				<span class='auth-kicker'>Verify email</span>
				<h1 class='auth-title'>Check your inbox</h1>
				<p class='auth-sub'>
					We sent a confirmation link{email.value
						? (
							<>
								{' '}to <b>{email.value}</b>
							</>
						)
						: ''}. Click it to activate your account — it works from any device.
				</p>
				<p class='auth-waiting' aria-live='polite'>
					<span class='auth-waiting__dot'></span>
					Waiting for confirmation… this page updates automatically.
				</p>
			</div>

			<div class='auth-form'>
				<TextField
					id='verify-email'
					variant='glass'
					label='Email address'
					type='email'
					value={email.value}
					onInput={(e) => (email.value = (e.target as HTMLInputElement).value)}
					floatingRule='auto'
					autoComplete='email'
					disabled={countdown.value > 0 || isLoading.value}
				/>

				<button
					class='auth-cta'
					type='button'
					onClick={handleResend}
					disabled={!email.value || countdown.value > 0 || isLoading.value}
				>
					{isLoading.value
						? 'Sending…'
						: countdown.value > 0
						? `Resend available in ${countdown.value}s`
						: 'Resend verification email'}
				</button>
			</div>
		</>
	);
}
