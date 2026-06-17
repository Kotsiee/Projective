import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { Signal, useSignal } from '@preact/signals';
import { ComponentChildren } from 'preact';
import { DateTime } from '@projective/types';

export interface OnboardingState {
	email: Signal<string | undefined>;
	password: Signal<string | undefined>;
	firstName: Signal<string | undefined>;
	lastName: Signal<string | undefined>;
	username: Signal<string | undefined>;
	dob: Signal<DateTime | undefined>;
	isAdult: Signal<boolean | undefined>;
	profilePicture: Signal<string | undefined>;
	objective: Signal<'client' | 'seller' | undefined>;
	interests: Signal<string[] | undefined>;
	skills: Signal<string[] | undefined>;
}

const OnboardingContext = createContext<OnboardingState | null>(null);

export function OnboardingProvider(
	{ children }: { children: ComponentChildren },
) {
	const email = useSignal(undefined);
	const password = useSignal(undefined);
	const firstName = useSignal(undefined);
	const lastName = useSignal(undefined);
	const username = useSignal(undefined);
	const dob = useSignal(undefined);
	const isAdult = useSignal(undefined);
	const profilePicture = useSignal(undefined);
	const objective = useSignal(undefined);
	const interests = useSignal(undefined);
	const skills = useSignal(undefined);

	return (
		<OnboardingContext.Provider
			value={{
				email,
				password,
				firstName,
				lastName,
				username,
				dob,
				isAdult,
				profilePicture,
				objective,
				interests,
				skills,
			}}
		>
			{children}
		</OnboardingContext.Provider>
	);
}

export function useOnboardingContext() {
	const ctx = useContext(OnboardingContext);
	if (!ctx) throw new Error('useOnboardingContext must be used within OnboardingProvider');
	return ctx;
}
