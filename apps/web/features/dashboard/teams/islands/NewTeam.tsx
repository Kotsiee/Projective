import { useSignal } from '@preact/signals';
import { IconBuildingStore, IconCoin, IconRocket, IconUsers } from '@tabler/icons-preact';

import {
	Step,
	Stepper,
	StepperHeader,
	WizardFooter,
	WizardForm,
	WizardLayout,
	WizardPreview,
	WizardStage,
} from '@projective/ui';

import { TeamFormProvider } from '../contexts/NewTeamContext.tsx';
import { CreateTeamButton, SaveDraftButton } from '../components/new/TeamActions.tsx';
import TeamFinancials from '../components/new/TeamFinancials.tsx';
import TeamDetails from '../components/new/TeamDetails.tsx';
import TeamMembers from '../components/new/TeamMembers.tsx';
import TeamReview from '../components/new/TeamReview.tsx';

export default function NewTeamIsland() {
	const activeStep = useSignal(0);

	const renderStepContent = (index: number) => {
		switch (index) {
			case 0:
				return <TeamDetails />;
			case 1:
				return <TeamMembers />;
			case 2:
				return <TeamFinancials />;
			case 3:
				return <TeamReview />;
			default:
				return null;
		}
	};

	return (
		<TeamFormProvider>
			<WizardLayout
				title='Create New Team'
				backHref='/teams'
			>
				<Stepper
					activeStep={activeStep.value}
					onStepChange={(s) => activeStep.value = s}
					linear
					orientation='horizontal'
					// 'wizard__stepper' class is defined in wizard.css (imported by Layout)
					className='wizard__stepper'
				>
					<div className='wizard__stepper-header'>
						<StepperHeader>
							<Step
								label='Identity'
								description='Basic Info'
								icon={<IconBuildingStore size={20} />}
							/>
							<Step label='Members' description='Invite Team' icon={<IconUsers size={20} />} />
							<Step label='Finance' description='Payouts' icon={<IconCoin size={20} />} />
							<Step label='Review' description='Launch' icon={<IconRocket size={20} />} />
						</StepperHeader>
					</div>

					<WizardStage>
						{/* Left Side: Scrollable Form */}
						<WizardForm>
							{renderStepContent(activeStep.value)}
						</WizardForm>

						{/* Right Side: Preview Pane */}
						<WizardPreview>
							<div
								style={{
									height: '100%',
									width: '100%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: 'var(--text-disabled)',
									background: 'var(--input-bg)',
									borderRadius: 'var(--border-radius)',
									border: '1px dashed var(--border-color)',
									flexDirection: 'column',
									gap: '1rem',
								}}
							>
								<strong>Team Preview</strong>
								<span style={{ fontSize: '0.875rem' }}>Visual updates as you type</span>
							</div>
						</WizardPreview>
					</WizardStage>

					<WizardFooter
						finalAction={<CreateTeamButton />}
						secondaryAction={<SaveDraftButton />}
					/>
				</Stepper>
			</WizardLayout>
		</TeamFormProvider>
	);
}
