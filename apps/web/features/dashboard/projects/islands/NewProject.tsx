import {
	IconCalendarStats,
	IconCheck,
	IconCoin,
	IconFileDescription,
	IconListCheck,
	IconUpload,
} from '@tabler/icons-preact';

import {
	Button,
	Step,
	Stepper,
	StepperContent,
	StepperFooter,
	StepperHeader,
	StepperPanel,
	toast,
	useStepperContext,
	WizardLayout,
} from '@projective/ui';

import ProjectDetails from '../components/new/ProjectDetails.tsx';
import ProjectLegal from '../components/new/ProjectLegal.tsx';
import ProjectStages from '../components/new/ProjectStages.tsx';
import ProjectTimeline from '../components/new/ProjectTimeline.tsx';
import ProjectBudget from '../components/new/ProjectBudget.tsx';
import ProjectPublish from '../components/new/ProjectPublish.tsx';

import { PublishButton, SaveDraftButton } from '../components/new/ProjectActions.tsx';
import {
	ProjectFormProvider,
	useNewProjectContext,
	validateProjectStep,
} from '../contexts/NewProjectContext.tsx';

// #region Helper Components
/**
 * Custom footer to inject the Save Draft and Publish buttons while
 * retaining the stepper's navigation context.
 */
function ProjectWizardFooter() {
	const { back, next, activeStep, totalSteps, isLoading } = useStepperContext();
	const isFirst = activeStep.value === 0;
	const isLast = activeStep.value === totalSteps.value - 1;

	return (
		<StepperFooter>
			<div
				style={{
					display: 'flex',
					width: '100%',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<div className='wizard__secondary-actions'>
					<SaveDraftButton />
				</div>
				<div style={{ display: 'flex', gap: '0.75rem' }}>
					<Button
						variant='secondary'
						onClick={back}
						disabled={isFirst || isLoading.value}
					>
						Back
					</Button>

					{!isLast
						? (
							<Button
								variant='primary'
								onClick={next}
								loading={isLoading.value}
							>
								Next Step
							</Button>
						)
						: <PublishButton />}
				</div>
			</div>
		</StepperFooter>
	);
}
// #endregion

function ProjectWizardContent() {
	const state = useNewProjectContext();

	// #region Event Handlers
	const handleBeforeStepChange = (current: number, next: number) => {
		// Only validate when moving FORWARD. We let them go back without validation errors.
		if (next > current) {
			const errors = validateProjectStep(current, state);
			if (errors.length > 0) {
				errors.forEach((err) => toast.error(err));
				return false;
			}
		}
		return true;
	};
	// #endregion

	return (
		<Stepper
			activeStep={state.currentStep.value - 1}
			onStepChange={(s) => {
				state.currentStep.value = s + 1;
			}}
			beforeStepChange={handleBeforeStepChange}
			linear
			orientation='vertical'
			className='project-wizard-stepper'
		>
			{/* LEFT SIDEBAR */}
			<StepperHeader>
				<Step label='Details' description='Basic Info' icon={<IconFileDescription size={20} />} />
				<Step label='Legal' description='IP & Screening' icon={<IconCheck size={20} />} />
				<Step label='Stages' description='Scope Definition' icon={<IconListCheck size={20} />} />
				<Step label='Timeline' description='Scheduling' icon={<IconCalendarStats size={20} />} />
				<Step label='Budget' description='Staffing & Cost' icon={<IconCoin size={20} />} />
				<Step label='Publish' description='Final Review' icon={<IconUpload size={20} />} />
			</StepperHeader>

			{/* MAIN CONTENT AREA */}
			<StepperContent>
				<StepperPanel index={0}>
					<ProjectDetails />
				</StepperPanel>
				<StepperPanel index={1}>
					<ProjectLegal />
				</StepperPanel>
				<StepperPanel index={2}>
					<ProjectStages />
				</StepperPanel>
				<StepperPanel index={3}>
					<ProjectTimeline />
				</StepperPanel>
				<StepperPanel index={4}>
					<ProjectBudget />
				</StepperPanel>
				<StepperPanel index={5}>
					<ProjectPublish />
				</StepperPanel>
			</StepperContent>

			<ProjectWizardFooter />
		</Stepper>
	);
}

export default function NewProjectIsland() {
	return (
		<ProjectFormProvider>
			<WizardLayout title='Create New Project' backHref='/projects'>
				<ProjectWizardContent />
			</WizardLayout>
		</ProjectFormProvider>
	);
}
