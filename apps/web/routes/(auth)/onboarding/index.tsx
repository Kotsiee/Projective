import { Head } from 'fresh/runtime';
import OnboardingIslandWrapper from '../(_islands)/OnboardingIslandWrapper.tsx';

export default function Onboarding() {
	return (
		<>
			<Head>
				<title>Onboarding</title>
			</Head>

			<OnboardingIslandWrapper />
		</>
	);
}
