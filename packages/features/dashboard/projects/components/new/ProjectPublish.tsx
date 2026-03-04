import '../../styles/components/new/new-project-publish.css';
import { useNewProjectContext } from '../../contexts/NewProjectContext.tsx';
import {
	IconBriefcase,
	IconCalendarStats,
	IconCheck,
	IconCoin,
	IconEdit,
	IconFileDescription,
	IconListCheck,
} from '@tabler/icons-preact';
import { DateTime, IPOptionMode, Visibility } from '@projective/types';

export default function ProjectPublish() {
	const state = useNewProjectContext();

	// #region Helper Formatting Functions
	const formatCurrency = (cents: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: state.currency.value,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(cents / 100);
	};

	const calculateEstimatedBudget = () => {
		let min = 0;
		let max = 0;

		state.stages.value.forEach((stage) => {
			if (stage._ui_model_type === 'defined_roles') {
				stage.staffing_roles.forEach((role) => {
					min += role.budget_amount_cents * role.quantity;
					max += role.budget_amount_cents * role.quantity;
				});
			} else if (stage._ui_model_type === 'open_seats' && stage.open_seats[0]) {
				min += stage.open_seats[0].budget_min_cents || 0;
				max += stage.open_seats[0].budget_max_cents || 0;
			}
		});

		if (min === max) return formatCurrency(min);
		return `${formatCurrency(min)} - ${formatCurrency(max)}`;
	};

	const formatVisibility = (v: string) => {
		if (v === Visibility.Public) return 'Public Marketplace';
		if (v === Visibility.InviteOnly) return 'Invite Only';
		return 'Unlisted Link';
	};

	const formatIPMode = (mode: string) => {
		if (mode === IPOptionMode.ExclusiveTransfer) return 'Exclusive Transfer';
		if (mode === IPOptionMode.LicensedUse) return 'Licensed Use';
		if (mode === IPOptionMode.SharedOwnership) return 'Shared Ownership';
		return mode;
	};
	// #endregion

	const jumpToStep = (stepNumber: number) => {
		state.currentStep.value = stepNumber;
	};

	return (
		<div className='project-publish'>
			<div className='project-publish__header'>
				<h2>Final Review</h2>
				<p className='project-publish__subtitle'>
					Please review the details of your project below. If everything looks correct, you can
					publish it to the marketplace.
				</p>
			</div>

			<div className='publish-summary-list'>
				{/* --- STEP 1: DETAILS --- */}
				<section className='publish-section'>
					<div className='publish-section__header'>
						<div className='publish-section__title-group'>
							<IconFileDescription size={20} className='publish-section__icon' />
							<h3>Project Details</h3>
						</div>
						<button type='button' className='btn-edit-step' onClick={() => jumpToStep(1)}>
							<IconEdit size={16} /> Edit
						</button>
					</div>
					<div className='publish-section__content'>
						<div className='summary-grid'>
							<div className='summary-item summary-item--full'>
								<span className='summary-item__label'>Project Title</span>
								<span className='summary-item__value summary-item__value--large'>
									{state.title.value || 'Untitled Project'}
								</span>
							</div>
							<div className='summary-item'>
								<span className='summary-item__label'>Visibility</span>
								<span className='summary-item__value'>
									{formatVisibility(state.visibility.value)}
								</span>
							</div>
							<div className='summary-item'>
								<span className='summary-item__label'>Tags</span>
								<span className='summary-item__value'>
									{state.tags.value.length > 0 ? state.tags.value.join(', ') : 'None'}
								</span>
							</div>
						</div>
					</div>
				</section>

				{/* --- STEP 2: LEGAL --- */}
				<section className='publish-section'>
					<div className='publish-section__header'>
						<div className='publish-section__title-group'>
							<IconCheck size={20} className='publish-section__icon' />
							<h3>Legal & Screening</h3>
						</div>
						<button type='button' className='btn-edit-step' onClick={() => jumpToStep(2)}>
							<IconEdit size={16} /> Edit
						</button>
					</div>
					<div className='publish-section__content'>
						<div className='summary-grid'>
							<div className='summary-item'>
								<span className='summary-item__label'>Global IP Ownership</span>
								<span className='summary-item__value'>{formatIPMode(state.ipMode.value)}</span>
							</div>
							<div className='summary-item'>
								<span className='summary-item__label'>NDA Required</span>
								<span className='summary-item__value'>
									{state.ndaRequired.value === 'true' ? 'Yes' : 'No'}
								</span>
							</div>
							<div className='summary-item summary-item--full'>
								<span className='summary-item__label'>Screening Questions</span>
								<span className='summary-item__value'>
									{state.screeningQuestions.value.filter((q) => q.trim().length > 0).length}{' '}
									custom questions defined
								</span>
							</div>
						</div>
					</div>
				</section>

				{/* --- STEP 3 & 4: STAGES AND TIMELINE --- */}
				<section className='publish-section'>
					<div className='publish-section__header'>
						<div className='publish-section__title-group'>
							<IconListCheck size={20} className='publish-section__icon' />
							<h3>Scope & Timeline</h3>
						</div>
						<div className='publish-section__actions'>
							<button type='button' className='btn-edit-step' onClick={() => jumpToStep(3)}>
								<IconBriefcase size={16} /> Stages
							</button>
							<button type='button' className='btn-edit-step' onClick={() => jumpToStep(4)}>
								<IconCalendarStats size={16} /> Timeline
							</button>
						</div>
					</div>
					<div className='publish-section__content'>
						<div
							className='summary-grid'
							style={{
								marginBottom: '1rem',
								paddingBottom: '1rem',
								borderBottom: '1px solid var(--border-color)',
							}}
						>
							<div className='summary-item'>
								<span className='summary-item__label'>Target Start Date</span>
								<span className='summary-item__value'>
									{state.targetStartDate.value
										? (state.targetStartDate.value as DateTime).toFormat('dd MMM yyyy')
										: 'Not Set'}
								</span>
							</div>
							<div className='summary-item'>
								<span className='summary-item__label'>Timeline Mode</span>
								<span className='summary-item__value' style={{ textTransform: 'capitalize' }}>
									{state.timelinePreset.value || 'Custom'}
								</span>
							</div>
						</div>

						<div className='publish-stage-list'>
							{state.stages.value.map((stage, idx) => (
								<div key={idx} className='summary-stage-row'>
									<div className='summary-stage-row__index'>{idx + 1}</div>
									<div className='summary-stage-row__details'>
										<span className='summary-stage-row__title'>
											{stage.title || 'Untitled Stage'}
										</span>
										<span className='summary-stage-row__type'>
											{stage.stage_type.replace('_', ' ')}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* --- STEP 5: BUDGET --- */}
				<section className='publish-section'>
					<div className='publish-section__header'>
						<div className='publish-section__title-group'>
							<IconCoin size={20} className='publish-section__icon' />
							<h3>Estimated Budget</h3>
						</div>
						<button type='button' className='btn-edit-step' onClick={() => jumpToStep(5)}>
							<IconEdit size={16} /> Edit
						</button>
					</div>
					<div className='publish-section__content publish-section__content--highlight'>
						<div className='summary-budget-total'>
							<span className='summary-budget-total__label'>Total Estimated Value</span>
							<span className='summary-budget-total__value'>{calculateEstimatedBudget()}</span>
						</div>
						<p className='summary-budget-note'>
							This is an estimate based on your defined roles and minimum/maximum budgets for open
							seats. Final costs may vary based on accepted proposals.
						</p>
					</div>
				</section>
			</div>
		</div>
	);
}
