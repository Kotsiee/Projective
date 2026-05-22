import { useSignal } from '@preact/signals';
import { Button, Icon, Step, Stepper } from '@projective/ui';
import { TextField } from '@projective/fields';
import { IconBriefcase, IconCode } from '@tabler/icons-preact';
import AuthLayout from './AuthLayout.tsx';
import '../styles/pages/register.css';

export default function RegisterWizardIsland() {
	const currentStep = useSignal(1);

	const email = useSignal('');
	const password = useSignal('');
	const firstName = useSignal('');
	const lastName = useSignal('');
	const username = useSignal('');
	const persona = useSignal<'client' | 'freelancer' | null>(null);

	const handleNext = () => currentStep.value++;
	const handleBack = () => currentStep.value--;
	const handleSubmit = async () => window.location.href = '/dashboard';

	const renderPreview = () => {
		if (currentStep.value === 1) {
			return (
				<div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
					<Icon size={48} color='primary'><IconCode /></Icon>
					<h3 style={{ marginTop: '1rem', color: 'var(--text-main)' }}>Secure by Design</h3>
					<p>Your credentials are encrypted and securely stored.</p>
				</div>
			);
		}
		if (currentStep.value === 2) {
			return (
				<div class="wizard-avatar-card">
					<div class="wizard-avatar-card__icon" />
					<div class="wizard-avatar-card__name">
						{firstName.value || lastName.value ? `${firstName.value} ${lastName.value}` : 'Your Name'}
					</div>
					<div style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>
						@{username.value || 'username'}
					</div>
				</div>
			);
		}
		return (
			<div style={{ textAlign: 'center' }}>
				<h3 style={{ color: 'var(--text-main)' }}>
					{persona.value === 'client' ? 'Pipeline Architecture' : 'Global Kanbans'}
				</h3>
				<p style={{ color: 'var(--text-muted)' }}>
					{persona.value === 'client'
						? 'Deploy capital into secure escrow.'
						: 'Track workload intensity in real-time.'}
				</p>
			</div>
		);
	};

	const anchor = (
		<>
			<div class='wizard-header'>
				<h2 style={{ margin: '0 0 2rem 0' }}>Join Projective.</h2>
				{/* Make sure your Stepper component uses 'orientation' or 'direction' based on your ui mod.ts */}
				<Stepper activeStep={currentStep.value} orientation='vertical'>
					<Step label='Account Details' description='Secure your access' />
					<Step label='Public Identity' description='How the network sees you' />
					<Step label='Your Objective' description='Hire teams or find work' />
				</Stepper>
			</div>
			<div class='wizard-preview'>
				{renderPreview()}
			</div>
		</>
	);

	return (
		<AuthLayout anchorContent={anchor} anchorRatio="45">
			{currentStep.value === 1 && (
				<div class="wizard-step-pane">
					<h2>Create Account</h2>
					<TextField label='Email Address' type='email' value={email} floatingRule='auto' />
					<TextField label='Password' type='password' value={password} floatingRule='auto' help='Minimum 8 characters' />
					<Button variant='primary' fullWidth onClick={handleNext} disabled={!email.value || !password.value}>
						Continue
					</Button>
				</div>
			)}

			{currentStep.value === 2 && (
				<div class="wizard-step-pane">
					<h2>Identity</h2>
					<div style={{ display: 'flex', gap: '1rem' }}>
						<TextField label='First Name' value={firstName} floatingRule='auto' />
						<TextField label='Last Name' value={lastName} floatingRule='auto' />
					</div>
					<TextField label='Username' value={username} floatingRule='auto' prefix='@' />
					<div class="wizard-step-actions">
						<Button ghost onClick={handleBack}>Back</Button>
						<Button variant='primary' style={{ flex: 1 }} onClick={handleNext} disabled={!firstName.value || !username.value}>
							Continue
						</Button>
					</div>
				</div>
			)}

			{currentStep.value === 3 && (
				<div class="wizard-step-pane">
					<h2>What brings you here?</h2>
					<p style={{ color: 'var(--text-muted)' }}>This sets up your dashboard experience. You can switch later.</p>
					
					<div class={`wizard-card-button ${persona.value === 'client' ? 'wizard-card-button--active' : ''}`} onClick={() => persona.value = 'client'}>
						<Icon size={24} color={persona.value === 'client' ? 'primary' : 'muted'}><IconBriefcase /></Icon>
						<span style={{ fontWeight: 600, fontSize: '1.1rem' }}>I want to hire talent</span>
						<span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Create businesses and fund projects.</span>
					</div>

					<div class={`wizard-card-button ${persona.value === 'freelancer' ? 'wizard-card-button--active' : ''}`} onClick={() => persona.value = 'freelancer'}>
						<Icon size={24} color={persona.value === 'freelancer' ? 'primary' : 'muted'}><IconCode /></Icon>
						<span style={{ fontWeight: 600, fontSize: '1.1rem' }}>I want to build & earn</span>
						<span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Create teams and claim project stages.</span>
					</div>

					<div class="wizard-step-actions">
						<Button ghost onClick={handleBack}>Back</Button>
						<Button variant='primary' style={{ flex: 1 }} onClick={handleSubmit} disabled={!persona.value}>
							Complete Setup
						</Button>
					</div>
				</div>
			)}
		</AuthLayout>
	);
}