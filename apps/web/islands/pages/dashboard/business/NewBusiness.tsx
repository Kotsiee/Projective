import { useSignal } from '@preact/signals';
import { IconBuildingStore, IconGavel, IconRocket } from '@tabler/icons-preact';
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

import BusinessIdentity from '@components/dashboard/business/new/BusinessIdentity.tsx';
import BusinessLegal from '@components/dashboard/business/new/BusinessLegal.tsx';
import BusinessReview from '@components/dashboard/business/new/BusinessReview.tsx';
import { CreateBusinessButton } from '@components/dashboard/business/new/BusinessActions.tsx';
import { BusinessFormProvider } from '@contexts/NewBusinessContext.tsx';
import '@styles/pages/dashboard/business/new-business.css';

export default function NewBusinessIsland() {
	const activeStep = useSignal(0);

	const renderStepContent = (index: number) => {
		switch (index) {
			case 0:
				return <BusinessIdentity />;
			case 1:
				return <BusinessLegal />;
			case 2:
				return <BusinessReview />;
			default:
				return null;
		}
	};

	return (
		<BusinessFormProvider>
			<WizardLayout
				title='Establish New Business'
				backHref='/business'
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
								label='Identity'
								description='Profile'
								icon={<IconBuildingStore size={20} />}
							/>
							<Step
								label='Legal'
								description='Entity & Billing'
								icon={<IconGavel size={20} />}
							/>
							<Step
								label='Review'
								description='Launch'
								icon={<IconRocket size={20} />}
							/>
						</StepperHeader>
					</div>

					<WizardStage>
						{/* Left Side: Form */}
						<WizardForm>
							{renderStepContent(activeStep.value)}
						</WizardForm>

						{/* Right Side: Preview */}
						<WizardPreview>
							<div className='new-business__preview-placeholder'>
								<strong>Entity Preview</strong>
								<span>Visual updates as you type</span>
							</div>
						</WizardPreview>
					</WizardStage>

					<WizardFooter
						finalAction={<CreateBusinessButton />}
						// Optional: Add Save Draft later
						secondaryAction={null}
					/>
				</Stepper>
			</WizardLayout>
		</BusinessFormProvider>
	);
}
