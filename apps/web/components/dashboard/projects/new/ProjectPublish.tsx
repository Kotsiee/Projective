import '@styles/components/dashboard/projects/new/new-project-publish.css';
import { IconCheck, IconX } from '@tabler/icons-preact';
import { useNewProjectContext } from '@contexts/NewProjectContext.tsx';

export default function ProjectPublish() {
	const state = useNewProjectContext();

	// Helper to sum up budgets (rough estimate for display)
	const totalBudget = state.stages.value.reduce((acc, stage) => {
		const roles = stage.staffing_roles.reduce((rAcc, r) => rAcc + r.budget_amount_cents, 0);
		// Simplified: ignoring open seat ranges for specific total, just summing roles
		return acc + roles;
	}, 0);

	return (
		<div className='project-publish'>
			<div className='project-publish__header'>
				<h3>Review Project</h3>
				<p>Review your project details before publishing to the marketplace.</p>
			</div>

			<div className='project-publish__grid'>
				{/* Section 1: Core Details */}
				<div className='project-publish__card'>
					<h4 className='project-publish__card-title'>Overview</h4>
					<div className='project-publish__row'>
						<span className='project-publish__label'>Title</span>
						<span className='project-publish__value'>{state.title.value || 'Untitled'}</span>
					</div>
					<div className='project-publish__row'>
						<span className='project-publish__label'>Category</span>
						<span className='project-publish__value'>{state.category.value || 'None'}</span>
					</div>
					<div className='project-publish__row'>
						<span className='project-publish__label'>Visibility</span>
						<span className='project-publish__value' style={{ textTransform: 'capitalize' }}>
							{state.visibility.value}
						</span>
					</div>
					<div className='project-publish__row'>
						<span className='project-publish__label'>Start Date</span>
						<span className='project-publish__value'>
							{state.targetStartDate.value?.toFormat('dd MMM yyyy') || 'TBD'}
						</span>
					</div>
				</div>

				{/* Section 2: Legal & Requirements */}
				<div className='project-publish__card'>
					<h4 className='project-publish__card-title'>Legal & Requirements</h4>
					<div className='project-publish__row'>
						<span className='project-publish__label'>IP Ownership</span>
						<span className='project-publish__value' style={{ textTransform: 'capitalize' }}>
							{state.ipMode.value.replace('_', ' ')}
						</span>
					</div>
					<div className='project-publish__row'>
						<span className='project-publish__label'>NDA Required</span>
						<span className='project-publish__value'>
							{state.ndaRequired.value === 'true'
								? (
									<span className='tag tag--yes'>
										<IconCheck size={14} /> Yes
									</span>
								)
								: (
									<span className='tag tag--no'>
										<IconX size={14} /> No
									</span>
								)}
						</span>
					</div>
					<div className='project-publish__row'>
						<span className='project-publish__label'>Locations</span>
						<span className='project-publish__value'>
							{state.locationRestriction.value || 'Worldwide'}
						</span>
					</div>
				</div>

				{/* Section 3: Stages Breakdown */}
				<div className='project-publish__card project-publish__card--full'>
					<h4 className='project-publish__card-title'>
						Stages ({state.stages.value.length})
						<span className='project-publish__total'>
							Est. Total: {(totalBudget / 100).toLocaleString()} {state.currency.value}
						</span>
					</h4>

					<div className='project-publish__stages-list'>
						{state.stages.value.map((stage, idx) => (
							<div key={idx} className='project-publish__stage-item'>
								<div className='project-publish__stage-info'>
									<span className='project-publish__stage-number'>{idx + 1}</span>
									<div>
										<div className='project-publish__stage-name'>{stage.title}</div>
										<div className='project-publish__stage-type'>
											{stage.stage_type.replace('_', ' ')}
										</div>
									</div>
								</div>
								<div className='project-publish__stage-meta'>
									{stage.start_trigger_type.replace('_', ' ')}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
