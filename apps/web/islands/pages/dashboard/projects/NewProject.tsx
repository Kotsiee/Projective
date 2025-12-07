import { useSignal } from '@preact/signals';
import {
	IconArrowLeft,
	IconCheck,
	IconDeviceFloppy,
	IconFileDescription,
	IconListCheck,
	IconSettings,
} from '@tabler/icons-preact';

// Components
import { Step, Stepper, StepperFooter, StepperHeader, useStepperContext } from '@projective/fields';
import ProjectDetails from '@components/dashboard/projects/new/ProjectDetails.tsx';
import ProjectStages from '@components/dashboard/projects/new/ProjectStages.tsx';

// --- Wrapper to bridge custom footer with Stepper Logic ---
function ProjectStepperFooter() {
	// We access the context inside the provider to hook up our custom buttons
	const { next, back, activeStep, totalSteps } = useStepperContext();
	const isFirst = activeStep.value === 0;
	const isLast = activeStep.value === totalSteps.value - 1;

	return (
		<div className='new-project__actions'>
			<button type='button' className='btn btn--secondary btn-save'>
				<IconDeviceFloppy size={18} /> <span>Save Draft</span>
			</button>

			<div className='new-project__nav-buttons'>
				<button
					type='button'
					className='btn btn--secondary'
					onClick={back}
					disabled={isFirst}
				>
					Back
				</button>
				<button
					type='button'
					className='btn btn--primary'
					onClick={next}
				>
					{isLast ? 'Create Project' : 'Next Step'}
				</button>
			</div>
		</div>
	);
}

export default function NewProjectIsland() {
	const activeStep = useSignal(0);

	// This handles switching content based on the active step
	// Using a map or switch is cleaner than conditional rendering sprawl
	const renderStepContent = (index: number) => {
		switch (index) {
			case 0:
				return <ProjectDetails />;
			case 1:
				return <ProjectStages />;
			case 2:
				return (
					<div style={{ textAlign: 'center', padding: '4rem' }}>
						<h3>Review & Settings</h3>
						<p style={{ color: 'var(--gray-500)' }}>
							Configure final project settings before launch.
						</p>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div className='new-project'>
			<div className='new-project__header'>
				<h1 className='new-project__title'>
					<IconArrowLeft style={{ cursor: 'pointer' }} />
					Create New Project
				</h1>
			</div>

			<div className='new-project__content'>
				{/* Stepper controls the state flow */}
				<Stepper
					activeStep={activeStep.value}
					onStepChange={(s) => activeStep.value = s}
					onComplete={() => console.log('Project Created!')}
					linear={true}
					orientation='horizontal'
					style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
				>
					{/* 1. Header Navigation */}
					<div className='new-project__stepper-container'>
						<StepperHeader>
							<Step
								label='Details'
								description='Basic Info'
								icon={<IconFileDescription size={20} />}
							/>
							<Step
								label='Stages'
								description='Workflow'
								icon={<IconListCheck size={20} />}
							/>
							<Step
								label='Settings'
								description='Finalize'
								icon={<IconSettings size={20} />}
							/>
						</StepperHeader>
					</div>

					{/* 2. Main Content Area */}
					<div className='new-project__content__stage'>
						<div className='new-project__edit'>
							{/* Render active step content */}
							{renderStepContent(activeStep.value)}
						</div>

						{/* Static Preview Sidebar (Persistent across steps) */}
						<div className='new-project__preview'>
							Live Preview Area
						</div>
					</div>

					{/* 3. Footer Actions */}
					<ProjectStepperFooter />
				</Stepper>
			</div>
		</div>
	);
}
