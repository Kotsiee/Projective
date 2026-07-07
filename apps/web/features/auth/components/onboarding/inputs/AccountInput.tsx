import { useWizardContext } from '@projective/ui';
import { TextField } from '@projective/fields';
import { SSOActions } from '../actions/SSOActions.tsx';
import { useOnboardingContext } from '../../../contexts/OnboardingContext.tsx';
import { Signal, useSignal } from '@preact/signals';
import { isLikelyEmail, validatePassword } from 'packages/backend/src/core/validation/email.ts';

export function AccountInput() {
	const { next } = useWizardContext();
	const { email, password } = useOnboardingContext();
	const emailError = useSignal('');

	const psv = validatePassword(password.value || '');
	const isFormValid = isLikelyEmail(email.value || '') && psv.isValid;

	const validateEmail = () => {
		emailError.value = email.value && !isLikelyEmail(email.value)
			? 'Enter a valid email address.'
			: '';
	};

	const req = (ok: boolean, label: string) => (
		<li class={ok ? 'met' : 'unmet'}>
			<span class='tick'>{ok ? '✓' : '•'}</span> {label}
		</li>
	);

	return (
		<div class='auth-form'>
			{password.value && !psv.isValid && (
				<ul class='auth-reqs' aria-live='polite'>
					<li class='auth-reqs__title'>Password must have:</li>
					{req(psv.hasMinLength, 'At least 8 characters')}
					{req(psv.hasUppercase, 'An uppercase letter')}
					{req(psv.hasLowercase, 'A lowercase letter')}
					{req(psv.hasSymbol, 'A symbol or special character')}
					{!psv.hasNoSpaces && req(false, 'No spaces')}
					{!psv.isNotCommonSequence && req(false, 'No common sequences')}
				</ul>
			)}

			<TextField
				id='join-email'
				variant='glass'
				label='Email address'
				type='email'
				value={email as Signal<string>}
				floatingRule='auto'
				autoComplete='email'
				required
				error={emailError.value}
				onBlur={validateEmail}
				onInput={() => {
					if (emailError.value) emailError.value = '';
				}}
			/>

			<TextField
				id='join-password'
				variant='glass'
				label='Password'
				type='password'
				value={password as Signal<string>}
				floatingRule='auto'
				autoComplete='new-password'
				required
			/>

			<button
				class='auth-cta'
				type='button'
				onClick={next}
				disabled={!isFormValid}
			>
				Continue
			</button>

			<SSOActions intent='register' />
		</div>
	);
}
