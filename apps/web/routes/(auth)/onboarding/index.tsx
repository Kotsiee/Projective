import { Head } from 'fresh/runtime';
import OnboardingIsland from '@islands/pages/auth/Onboarding.tsx';

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
