import { useSignal } from '@preact/signals';
import {
	IconArrowLeft,
	IconBuildingStore,
	IconCoin,
	IconRocket,
	IconUsers,
} from '@tabler/icons-preact';

import { Step, Stepper, StepperHeader, useStepperContext } from '@projective/ui';
import TeamDetails from '@components/dashboard/teams/new/TeamDetails.tsx';
import TeamMembers from '@components/dashboard/teams/new/TeamMembers.tsx';
import TeamFinancials from '@components/dashboard/teams/new/TeamFinancials.tsx';
import TeamReview from '@components/dashboard/teams/new/TeamReview.tsx';
import { CreateTeamButton, SaveDraftButton } from '@components/dashboard/teams/new/TeamActions.tsx';
import { TeamFormProvider } from '@contexts/NewTeamContext.tsx';

function TeamStepperFooter() {
	const { next, back, activeStep, totalSteps } = useStepperContext();
	const isFirst = activeStep.value === 0;
	const isLast = activeStep.value === totalSteps.value - 1;

	return (
		<div className='new-team__actions'>
			<SaveDraftButton />

			<div className='new-team__nav-buttons'>
				<button
					type='button'
					className='btn btn--secondary'
					onClick={back}
					disabled={isFirst}
				>
					Back
				</button>

				{!isLast
					? (
						<button
							type='button'
							className='btn btn--primary'
							onClick={next}
						>
							Next Step
						</button>
					)
					: <CreateTeamButton />}
			</div>
		</div>
	);
}

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
			<div className='new-team'>
				<div className='new-team__header'>
					<h1 className='new-team__title'>
						<IconArrowLeft />
						Create New Team
					</h1>
				</div>

				<div className='new-team__content'>
					<Stepper
						activeStep={activeStep.value}
						onStepChange={(s) => activeStep.value = s}
						linear
						orientation='horizontal'
						style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
					>
						<div className='new-team__stepper-container'>
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

						<div className='new-team__content__stage'>
							<div className='new-team__edit'>
								{renderStepContent(activeStep.value)}
							</div>
							<div className='new-team__preview'>
								<div
									style={{
										height: '100%',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										color: 'var(--gray-400)',
										background: 'var(--gray-50)',
										borderRadius: 'var(--radius-md)',
										border: '1px dashed var(--gray-200)',
									}}
								>
									Team Profile Preview
								</div>
							</div>
						</div>

						<TeamStepperFooter />
					</Stepper>
				</div>
			</div>
		</TeamFormProvider>
	);
}
