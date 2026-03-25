import { Head } from 'fresh/runtime';
import OnboardingIsland from '@features/auth/islands/Onboarding.tsx';

export default function Onboarding() {
	return (
		<>
			<Head>
				<title>Onboarding</title>
			</Head>

			<OnboardingIsland />
		</>
	);
}
