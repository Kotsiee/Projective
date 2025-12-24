import { useSignal } from '@preact/signals';
import {
	IconArrowLeft,
	IconCheck,
	IconFileDescription,
	IconListCheck,
	IconUpload,
} from '@tabler/icons-preact';

import { Step, Stepper, StepperHeader, toast, useStepperContext } from '@projective/fields';
import ProjectDetails from '@components/dashboard/projects/new/ProjectDetails.tsx';
import ProjectLegal from '@components/dashboard/projects/new/ProjectLegal.tsx';
import ProjectStages from '@components/dashboard/projects/new/ProjectStages.tsx';
import ProjectPublish from '@components/dashboard/projects/new/ProjectPublish.tsx';
import {
	PublishButton,
	SaveDraftButton,
} from '@components/dashboard/projects/new/ProjectActions.tsx';
import { ProjectFormProvider } from '@contexts/NewProjectContext.tsx';

// --- Updated Footer ---
function ProjectStepperFooter() {
	const { next, back, activeStep, totalSteps } = useStepperContext();
	const isFirst = activeStep.value === 0;
	const isLast = activeStep.value === totalSteps.value - 1;

	const click = () => {
		toast.info('Test Message');
	};

	return (
		<div className='new-project__actions'>
			{/* Always available Save Draft */}
			<SaveDraftButton />
			<button type='button' onClick={() => click()}>Toast</button>

			<div className='new-project__nav-buttons'>
				<button
					type='button'
					className='btn btn--secondary'
					onClick={back}
					disabled={isFirst}
				>
					Back
				</button>

				{/* Logic Switch: Regular Next vs Publish Component */}
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
					: <PublishButton />}
			</div>
		</div>
	);
}

export default function NewProjectIsland() {
	const activeStep = useSignal(0);

	const renderStepContent = (index: number) => {
		switch (index) {
			case 0:
				return <ProjectDetails />;
			case 1:
				return <ProjectLegal />;
			case 2:
				return <ProjectStages />;
			case 3:
				return <ProjectPublish />;
			default:
				return null;
		}
	};

	return (
		<ProjectFormProvider>
			<div className='new-project'>
				<div className='new-project__header'>
					<h1 className='new-project__title'>
						<IconArrowLeft style={{ cursor: 'pointer' }} />
						Create New Project
					</h1>
				</div>

				<div className='new-project__content'>
					<Stepper
						activeStep={activeStep.value}
						onStepChange={(s) => activeStep.value = s}
						linear
						orientation='horizontal'
						style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
					>
						<div className='new-project__stepper-container'>
							<StepperHeader>
								<Step
									label='Details'
									description='Basic Info'
									icon={<IconFileDescription size={20} />}
								/>
								<Step label='Legal' description='IP & Screening' icon={<IconCheck size={20} />} />
								<Step label='Stages' description='Workflow' icon={<IconListCheck size={20} />} />
								<Step label='Publish' description='Finalize' icon={<IconUpload size={20} />} />
							</StepperHeader>
						</div>

						<div className='new-project__content__stage'>
							<div className='new-project__edit'>
								{renderStepContent(activeStep.value)}
							</div>
							<div className='new-project__preview'>
								Live Preview Area
							</div>
						</div>

						<ProjectStepperFooter />
					</Stepper>
				</div>
			</div>
		</ProjectFormProvider>
	);
}
