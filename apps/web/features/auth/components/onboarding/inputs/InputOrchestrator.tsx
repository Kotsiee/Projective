import '../../../styles/components/onboarding/inputs/input-orchestrator.css';
import { useWizardContext } from '@projective/ui';
import { useComputed } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { AccountInput } from './AccountInput.tsx';
import { IdentityInput } from './IdentityInput.tsx';
import { ObjectiveInput } from './ObjectiveInput.tsx';
import { useOnboardingContext } from '@features/auth/contexts/OnboardingContext.tsx';

export function InputOrchestrator() {
	const { currentStep, next } = useWizardContext();
	const { email, firstName, lastName, username, profilePicture } = useOnboardingContext();

	// #region SSO State Hydration
	// Detects if the user was redirected here from an OAuth callback requiring onboarding
	useEffect(() => {
		const match = document.cookie.match(/(?:^|; )sso_partial_data=([^;]*)/);
		if (match && match[1]) {
			try {
				const data = JSON.parse(decodeURIComponent(match[1]));

				// Hydrate Signals
				if (data.email) email.value = data.email;
				if (data.firstName) firstName.value = data.firstName;
				if (data.lastName) lastName.value = data.lastName;
				if (data.username) username.value = data.username;
				if (data.profilePicture) profilePicture.value = data.profilePicture;

				// Clear the cookie so this only happens once
				document.cookie = 'sso_partial_data=; Max-Age=0; path=/';

				// Automatically advance the user past the email/password step
				if (currentStep.value === 1 && next) {
					next();
				}
			} catch (e) {
				console.error('Failed to parse SSO onboarding data', e);
			}
		}
	}, []);
	// #endregion

	const currentStepTitle = useComputed(() => {
		switch (currentStep.value) {
			case 1:
				return 'Account';
			case 2:
				return 'Identity';
			case 3:
				return 'Objective';
		}
	});

	return (
		<div class='onboarding__input-orchestrator'>
			<div class='onboarding__input-orchestrator__content'>
				<h1 class='onboarding__input-orchestrator__title'>{currentStepTitle}</h1>

				{currentStep.value === 1 && <AccountInput />}
				{currentStep.value === 2 && <IdentityInput />}
				{currentStep.value === 3 && <ObjectiveInput />}

				<p class='onboarding__input-orchestrator__login'>
					Already have an account?
					<a href='/login'>Log in</a>
				</p>
			</div>
		</div>
	);
}
