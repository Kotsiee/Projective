import { Head } from 'fresh/runtime';
import OnboardingIsland from '@features/auth/islands/Onboarding.island.tsx';

export default function Onboarding() {
	return (
		<>
			<Head>
				<title>Join Projective</title>
			</Head>
			<OnboardingIsland />
		</>
	);
}
