import { useSignal } from '@preact/signals';
import { IconCheck, IconFileDescription, IconListCheck, IconUpload } from '@tabler/icons-preact';

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

import ProjectDetails from '@components/dashboard/projects/new/ProjectDetails.tsx';
import ProjectLegal from '@components/dashboard/projects/new/ProjectLegal.tsx';
import ProjectStages from '@components/dashboard/projects/new/ProjectStages.tsx';
import ProjectPublish from '@components/dashboard/projects/new/ProjectPublish.tsx';
import {
	PublishButton,
	SaveDraftButton,
} from '@components/dashboard/projects/new/ProjectActions.tsx';
import { ProjectFormProvider } from '@contexts/NewProjectContext.tsx';

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
			<WizardLayout
				title='Create New Project'
				backHref='/projects'
			>
				<Stepper
					activeStep={activeStep.value}
					onStepChange={(s) => activeStep.value = s}
					linear
					orientation='horizontal'
					className='wizard__stepper'
				>
					<div className='wizard__stepper-header'>
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

					<WizardStage>
						{/* Left Side: Form */}
						<WizardForm>
							{renderStepContent(activeStep.value)}
						</WizardForm>

						{/* Right Side: Preview (Placeholder for now) */}
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
								}}
							>
								Project Preview
							</div>
						</WizardPreview>
					</WizardStage>

					<WizardFooter
						finalAction={<PublishButton />}
						secondaryAction={<SaveDraftButton />}
					/>
				</Stepper>
			</WizardLayout>
		</ProjectFormProvider>
	);
}
