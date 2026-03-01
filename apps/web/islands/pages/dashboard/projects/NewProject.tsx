import {
	IconCalendarStats,
	IconCheck,
	IconCoin,
	IconFileDescription,
	IconListCheck,
	IconUpload,
} from '@tabler/icons-preact';

import {
	Splitter,
	SplitterPane,
	Step,
	Stepper,
	StepperHeader,
	toast,
	WizardFooter,
	WizardForm,
	WizardLayout,
	WizardPreview,
	WizardStage,
} from '@projective/ui';

import ProjectDetails from '@components/dashboard/projects/new/ProjectDetails.tsx';
import ProjectLegal from '@components/dashboard/projects/new/ProjectLegal.tsx';
import ProjectStages from '@components/dashboard/projects/new/ProjectStages.tsx';
import ProjectTimeline from '@components/dashboard/projects/new/ProjectTimeline.tsx';
import ProjectTimelineControls from '@components/dashboard/projects/new/timeline/ProjectTimelineControls.tsx';
import ProjectBudget from '@components/dashboard/projects/new/ProjectBudget.tsx';
import ProjectPublish from '@components/dashboard/projects/new/ProjectPublish.tsx';

import {
	PublishButton,
	SaveDraftButton,
} from '@components/dashboard/projects/new/ProjectActions.tsx';
import {
	ProjectFormProvider,
	useNewProjectContext,
	validateProjectStep,
} from '@contexts/NewProjectContext.tsx';

function ProjectWizardContent() {
	const state = useNewProjectContext();

	const renderStepContent = (index: number) => {
		switch (index) {
			case 0:
				return <ProjectDetails />;
			case 1:
				return <ProjectLegal />;
			case 2:
				return <ProjectStages />;
			case 3:
				return <ProjectTimeline />;
			case 4:
				return <ProjectBudget />;
			case 5:
				return <ProjectPublish />;
			default:
				return null;
		}
	};

	const renderPreviewContent = (index: number) => {
		switch (index) {
			case 3:
				return <ProjectTimelineControls />;
			default:
				return (
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
						}}
					>
						Project Preview
					</div>
				);
		}
	};

	const handleBeforeStepChange = (current: number, next: number) => {
		if (next > current) {
			const errors = validateProjectStep(current, state);
			if (errors.length > 0) {
				errors.forEach((err) => toast.error(err));
				return false;
			}
		}
		return true;
	};

	return (
		<Stepper
			activeStep={state.currentStep.value - 1}
			onStepChange={(s) => {
				state.currentStep.value = s + 1;
			}}
			beforeStepChange={handleBeforeStepChange}
			linear
			orientation='horizontal'
			className='wizard__stepper'
		>
			<div className='wizard__stepper-header'>
				<StepperHeader>
					<Step label='Details' description='Basic Info' icon={<IconFileDescription size={20} />} />
					<Step label='Legal' description='IP & Screening' icon={<IconCheck size={20} />} />
					<Step label='Stages' description='Scope' icon={<IconListCheck size={20} />} />
					<Step label='Timeline' description='When' icon={<IconCalendarStats size={20} />} />
					<Step label='Budget' description='Staffing' icon={<IconCoin size={20} />} />
					<Step label='Publish' description='Final Review' icon={<IconUpload size={20} />} />
				</StepperHeader>
			</div>

			<WizardStage>
				<Splitter
					direction='horizontal'
					initialSizes={[65, 35]}
					minPaneSize={25}
					style={{ height: '100%', width: '100%' }}
				>
					<SplitterPane>
						<WizardForm>
							{renderStepContent(state.currentStep.value - 1)}
						</WizardForm>
					</SplitterPane>

					<SplitterPane>
						<WizardPreview>
							{renderPreviewContent(state.currentStep.value - 1)}
						</WizardPreview>
					</SplitterPane>
				</Splitter>
			</WizardStage>

			<WizardFooter
				finalAction={<PublishButton />}
				secondaryAction={<SaveDraftButton />}
			/>
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
