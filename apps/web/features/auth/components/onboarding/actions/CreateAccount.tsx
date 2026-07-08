/**
 * @file CreateAccount.tsx
 * @description Button component that orchestrates the final submission of the onboarding payload.
 */

// #region Imports
import { useSignal } from '@preact/signals';
import { toast } from '@projective/ui';
import { useOnboardingContext } from '../../../contexts/OnboardingContext.tsx';
import { CreateAccountService } from '../../../services/CreateAccountService.ts';
import { CompleteOnboardingService } from '../../../services/CompleteOnboardingService.ts';
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
		avatarFileId,
		oauthOnboarding,
	} = useOnboardingContext();

	const isLoading = useSignal(false);
	const isOAuth = oauthOnboarding.value;

	const handleCreateAccount = async () => {
		if (!enabled || isLoading.value) return;

		isLoading.value = true;

		try {
			if (isOAuth) {
				// Already authenticated (first-time OAuth sign-up finishing on /join):
				// provision the profile for the existing session — no signUp/verify.
				const res = await CompleteOnboardingService.complete({
					firstName: firstName.value,
					lastName: lastName.value,
					username: username.value,
					dob: dob.value?.toISO(),
					objective: objective.value,
					skills: skills.value,
					interests: interests.value,
					avatarFileId: avatarFileId.value,
				});

				globalThis.location.href = res.redirectTo ?? '/dashboard';
				return;
			}

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
		} catch (err) {
			toast.error(
				err instanceof Error
					? err.message
					: 'An unexpected error occurred during account creation.',
			);
		} finally {
			isLoading.value = false;
		}
	};

	return (
		<button
			type='button'
			class='auth-cta'
			disabled={!enabled || isLoading.value}
			onClick={handleCreateAccount}
		>
			{isLoading.value
				? (isOAuth ? 'Finishing…' : 'Creating…')
				: (isOAuth ? 'Finish setup' : 'Create account')}
		</button>
	);
}
// #endregion
