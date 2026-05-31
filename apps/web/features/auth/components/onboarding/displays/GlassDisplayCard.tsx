import { useOnboardingContext } from '../../../contexts/OnboardingContext.tsx';
import '../../../styles/components/onboarding/displays/glass-display-card.css';
import { Logo, useWizardContext } from '@projective/ui';

export function GlassDisplayCard() {
	const { currentStep } = useWizardContext();

	const rotation = (currentStep.value - 1) * 180;
	const frontContent = currentStep.value >= 3 ? <CardObjective /> : <CardAccount />;

	const logos = Array.from({ length: 15 });

	return (
		<div class='glass-display-card'>
			<div
				class='glass-display-card__3d-wrapper'
				style={{ transform: `rotateY(${rotation}deg)` }}
			>
				<div class='glass-display-card__background'>
					{logos.map((_, index) => <Logo key={index} color='var(--primary)' size={80} />)}
				</div>

				<div class='glass-display-card__card face-front'>
					{frontContent}
				</div>

				<div class='glass-display-card__card face-back'>
					<CardIdentity />
				</div>
			</div>
		</div>
	);
}

function CardAccount() {
	return (
		<div class='card-account__layout'>
			<div class='card-account__quote'>
				<p>Everything you can imagine is real</p>
				<div class='card-account__divider'>
					<hr />
					<span>Pablo Picasso</span>
				</div>
			</div>
			<div class='card-account__slogan'>
				<h2>
					Build Together.<br />Deliver Better.
				</h2>
			</div>
		</div>
	);
}

function CardIdentity() {
	const { firstName, lastName, username } = useOnboardingContext();

	return (
		<div class='card-identity__layout'>
			<div class='card-identity__top-banner'>
				<Logo size={48} color='rgba(255,255,255,0.5)' />
			</div>

			<div class='card-identity__avatar'>
				<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'>
					<path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'></path>
					<circle cx='12' cy='7' r='4'></circle>
				</svg>
			</div>

			<div class='card-identity__details'>
				<h3>
					{firstName.value || 'Firstname'} {lastName.value || 'Surname'}
				</h3>
				<p>@{username.value || 'username'}</p>
			</div>
		</div>
	);
}

function CardObjective() {
	return (
		<div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
			{/* Placeholder for Step 3 */}
			<p style={{ color: 'white', opacity: 0.5 }}>Objective Design Pending</p>
		</div>
	);
}
