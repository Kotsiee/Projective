import { IconCheck, IconUsers, IconWallet } from '@tabler/icons-preact';
import { useNewTeamContext } from '@contexts/NewTeamContext.tsx';

export default function TeamReview() {
	const state = useNewTeamContext();
	const inviteCount = state.invites.value.filter((i) => i.email).length;

	return (
		<div className='project-publish'>
			{/* Reuse publish styling */}
			<div className='project-publish__header'>
				<h3>Review Team</h3>
				<p>Ready to launch your agency?</p>
			</div>

			<div className='project-publish__grid'>
				{/* Overview */}
				<div className='project-publish__card'>
					<h4 className='project-publish__card-title'>Identity</h4>
					<div className='project-publish__row'>
						<span className='project-publish__label'>Name</span>
						<span className='project-publish__value'>{state.name.value}</span>
					</div>
					<div className='project-publish__row'>
						<span className='project-publish__label'>Handle</span>
						<span className='project-publish__value'>@{state.slug.value}</span>
					</div>
					<div className='project-publish__row'>
						<span className='project-publish__label'>Visibility</span>
						<span className='project-publish__value' style={{ textTransform: 'capitalize' }}>
							{state.visibility.value}
						</span>
					</div>
				</div>

				{/* Configuration */}
				<div className='project-publish__card'>
					<h4 className='project-publish__card-title'>Configuration</h4>
					<div className='project-publish__row'>
						<span className='project-publish__label'>Payout Model</span>
						<span className='project-publish__value'>
							<IconWallet size={14} className='inline mr-1' />
							{state.payoutModel.value === 'smart_split' ? 'Smart Split' : 'Manager Discretion'}
						</span>
					</div>
					<div className='project-publish__row'>
						<span className='project-publish__label'>Invites</span>
						<span className='project-publish__value'>
							<IconUsers size={14} className='inline mr-1' />
							{inviteCount} Pending
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
