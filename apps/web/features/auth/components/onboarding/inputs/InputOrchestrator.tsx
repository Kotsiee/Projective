import { useWizardContext } from '@projective/ui';
import { useComputed } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { AccountInput } from './AccountInput.tsx';
import { IdentityInput } from './IdentityInput.tsx';
import { ObjectiveInput } from './ObjectiveInput.tsx';
import { useOnboardingContext } from '@features/auth/contexts/OnboardingContext.tsx';

const STEP_META: Record<number, { kicker: string; title: string; sub: string }> = {
	1: {
		kicker: 'Step 1 of 4 · Account',
		title: 'Create your account',
		sub: 'Start with your email and a secure password.',
	},
	2: {
		kicker: 'Step 2 of 4 · Identity',
		title: 'Make it yours',
		sub: "Tell us who you are — you'll see it come alive on the left.",
	},
	3: {
		kicker: 'Step 3 of 4 · Objective',
		title: 'What brings you here?',
		sub: 'Pick your path and the things you care about.',
	},
};

export function InputOrchestrator() {
	const { currentStep, next } = useWizardContext();
	const { email, firstName, lastName, username, profilePicture, oauthOnboarding } =
		useOnboardingContext();

	// #region SSO State Hydration
	// Detects if the user was redirected here from an OAuth callback requiring onboarding.
	// The callback (routes/api/v1/auth/callback.ts) has already established a session, so
	// this is an authenticated "finish onboarding" flow — flag it so the final submit
	// targets /complete-onboarding, and skip the email/password step.
	useEffect(() => {
		const match = document.cookie.match(/(?:^|; )sso_partial_data=([^;]*)/);
		if (match && match[1]) {
			try {
				const data = JSON.parse(decodeURIComponent(match[1]));
				oauthOnboarding.value = true;
				if (data.email) email.value = data.email;
				if (data.firstName) firstName.value = data.firstName;
				if (data.lastName) lastName.value = data.lastName;
				if (data.username) username.value = data.username;
				if (data.profilePicture) profilePicture.value = data.profilePicture;

				document.cookie = 'sso_partial_data=; Max-Age=0; path=/';

				if (currentStep.value === 1 && next) next();
			} catch (e) {
				console.error('Failed to parse SSO onboarding data', e);
			}
		}
	}, []);
	// #endregion

	const meta = useComputed(() => STEP_META[currentStep.value] ?? STEP_META[1]);

	return (
		<>
			<div class='auth-head'>
				<span class='auth-kicker'>{meta.value.kicker}</span>
				<h1 class='auth-title'>{meta.value.title}</h1>
				<p class='auth-sub'>{meta.value.sub}</p>
			</div>

			{currentStep.value === 1 && <AccountInput />}
			{currentStep.value === 2 && <IdentityInput />}
			{currentStep.value === 3 && <ObjectiveInput />}

			<p class='auth-foot'>
				Already have an account? <a href='/login'>Log in</a>
			</p>
		</>
	);
}
