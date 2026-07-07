/**
 * @file ResetPasswordForm.island.tsx
 * @description Interactive new-password form (recovery). Uses the recovery session
 * established by /api/v1/auth/confirm to update the password.
 */

import { Icon, toast } from '@projective/ui';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { IconLock } from '@tabler/icons-preact';
import { TextField } from '@projective/fields';
import { validatePassword } from 'packages/backend/src/core/validation/email.ts';
import { ResetPasswordService } from '@features/auth/services/ResetPasswordService.ts';

export default function ResetPasswordForm() {
	const password = useSignal('');
	const confirm = useSignal('');
	const isLoading = useSignal(false);

	useEffect(() => {
		const params = new URLSearchParams(globalThis.location?.search ?? '');
		const err = params.get('error');
		if (err) toast.error(err);
	}, []);

	const psv = validatePassword(password.value || '');
	const matches = password.value.length > 0 && password.value === confirm.value;
	const canSubmit = psv.isValid && matches && !isLoading.value;

	const handleSubmit = async () => {
		if (!canSubmit) return;
		isLoading.value = true;
		try {
			const redirectTo = await ResetPasswordService.updatePassword(password.value);
			toast.success('Password updated. Redirecting…');
			setTimeout(() => (globalThis.location.href = redirectTo), 800);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Could not reset password.');
			isLoading.value = false;
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') handleSubmit();
	};

	const req = (ok: boolean, label: string) => (
		<li class={ok ? 'met' : 'unmet'}>
			<span class='tick'>{ok ? '✓' : '•'}</span> {label}
		</li>
	);

	return (
		<>
			<a class='auth-backlink' href='/login'>
				<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'>
					<path d='m15 18-6-6 6-6' />
				</svg>
				Back to log in
			</a>

			<div class='auth-head'>
				<div class='auth-icon'>
					<Icon>
						<IconLock />
					</Icon>
				</div>
				<span class='auth-kicker'>Reset password</span>
				<h1 class='auth-title'>Choose a new password</h1>
				<p class='auth-sub'>Your new password must be different from previous passwords.</p>
			</div>

			<div class='auth-form'>
				{password.value && !psv.isValid && (
					<ul class='auth-reqs' aria-live='polite'>
						<li class='auth-reqs__title' style='color:var(--text-muted)'>Password must have:</li>
						{req(psv.hasMinLength, 'At least 8 characters')}
						{req(psv.hasUppercase, 'An uppercase letter')}
						{req(psv.hasLowercase, 'A lowercase letter')}
						{req(psv.hasSymbol, 'A symbol or special character')}
						{!psv.hasNoSpaces && req(false, 'No spaces')}
						{!psv.isNotCommonSequence && req(false, 'No common sequences')}
					</ul>
				)}

				<TextField
					id='reset-password'
					variant='glass'
					label='New password'
					type='password'
					value={password.value}
					onInput={(e) => (password.value = (e.target as HTMLInputElement).value)}
					onKeyDown={handleKeyDown}
					floatingRule='auto'
					autoComplete='new-password'
					required
					disabled={isLoading.value}
				/>

				<TextField
					id='reset-confirm'
					variant='glass'
					label='Confirm new password'
					type='password'
					value={confirm.value}
					onInput={(e) => (confirm.value = (e.target as HTMLInputElement).value)}
					onKeyDown={handleKeyDown}
					floatingRule='auto'
					autoComplete='new-password'
					required
					disabled={isLoading.value}
				/>

				{confirm.value.length > 0 && !matches && (
					<p class='auth-fieldnote' role='alert'>Passwords do not match.</p>
				)}

				<button
					class='auth-cta'
					type='button'
					onClick={handleSubmit}
					disabled={!canSubmit}
				>
					{isLoading.value ? 'Updating…' : 'Update password'}
				</button>
			</div>
		</>
	);
}
