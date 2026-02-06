import '@styles/components/dashboard/teams/new/team-review.css';

import { IconUsers, IconWallet } from '@tabler/icons-preact';
import { useNewTeamContext } from '@contexts/NewTeamContext.tsx';

export default function TeamReview() {
	const state = useNewTeamContext();
	const inviteCount = state.invites.value.filter((i) => i.email).length;

	return (
		<div className='team-review'>
			<div className='team-review__header'>
				<h3>Review Team</h3>
				<p>Ready to launch your agency?</p>
			</div>

			<div className='team-review__grid'>
				{/* Overview */}
				<div className='team-review__card'>
					<h4 className='team-review__card-title'>Identity</h4>
					<div className='team-review__row'>
						<span className='team-review__label'>Name</span>
						<span className='team-review__value'>{state.name.value}</span>
					</div>
					<div className='team-review__row'>
						<span className='team-review__label'>Handle</span>
						<span className='team-review__value'>@{state.slug.value}</span>
					</div>
					<div className='team-review__row'>
						<span className='team-review__label'>Visibility</span>
						<span className='team-review__value' style={{ textTransform: 'capitalize' }}>
							{state.visibility.value}
						</span>
					</div>
				</div>

				{/* Configuration */}
				<div className='team-review__card'>
					<h4 className='team-review__card-title'>Configuration</h4>
					<div className='team-review__row'>
						<span className='team-review__label'>Payout Model</span>
						<span className='team-review__value'>
							<IconWallet size={14} className='team-review__icon' />
							{state.payoutModel.value === 'smart_split' ? 'Smart Split' : 'Manager Discretion'}
						</span>
					</div>
					<div className='team-review__row'>
						<span className='team-review__label'>Invites</span>
						<span className='team-review__value'>
							<IconUsers size={14} className='team-review__icon' />
							{inviteCount} Pending
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
