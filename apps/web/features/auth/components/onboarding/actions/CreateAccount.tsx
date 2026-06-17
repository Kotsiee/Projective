/**
 * @file CreateAccount.tsx
 * @description Button component that orchestrates the final submission of the onboarding payload.
 */

// #region Imports
import { useSignal } from '@preact/signals';
import { Button, toast } from '@projective/ui';
import { useOnboardingContext } from '../../../contexts/OnboardingContext.tsx';
import { CreateAccountService } from '../../../services/CreateAccountService.ts';
// #endregion

// #region Component
export function CreateAccountButton({ enabled }: { enabled: boolean }) {
	const {
		email,
		password,
		firstName,
		lastName,
		username,
		dob,
		objective,
		skills,
		interests,
	} = useOnboardingContext();

	const isLoading = useSignal(false);

	const handleCreateAccount = async () => {
		if (!enabled || isLoading.value) return;

		isLoading.value = true;

		try {
			const payload = {
				email: email.value,
				password: password.value,
				firstName: firstName.value,
				lastName: lastName.value,
				username: username.value,
				dob: dob.value?.toISO(),
				objective: objective.value,
				skills: skills.value,
				interests: interests.value,
			};

			const res = await CreateAccountService.createAccount(payload);

			if (res.redirectTo) {
				globalThis.location.href = res.redirectTo;
			} else {
				globalThis.location.href = '/verify';
			}
		} catch (err: any) {
			toast.error(err.message || 'An unexpected error occurred during account creation.');
		} finally {
			isLoading.value = false;
		}
	};

	return (
		<Button
			className='objective-input__continue-button'
			variant='primary'
			disabled={!enabled || isLoading.value}
			loading={isLoading.value}
			onClick={handleCreateAccount}
		>
			{isLoading.value ? 'Creating...' : 'Create Account'}
		</Button>
	);
}
// #endregion
