import '@styles/components/dashboard/teams/new/team-financials.css';

import { SelectField, TextField } from '@projective/fields';
import { useNewTeamContext } from '@contexts/NewTeamContext.tsx';

export default function TeamFinancials() {
	const state = useNewTeamContext();

	const payoutOptions = [
		{ label: 'Manager Discretion (Manual)', value: 'manager_discretion' },
		{ label: 'Smart Split (Automated)', value: 'smart_split' },
	];

	return (
		<div className='team-financials'>
			<div className='team-financials__header'>
				<h2>Financial Model</h2>
				<p className='team-financials__subtitle'>How should project earnings be distributed?</p>
			</div>

			<SelectField
				name='payout_model'
				label='Payout Model'
				options={payoutOptions}
				value={state.payoutModel.value}
				onChange={(v) => state.payoutModel.value = v as string}
				searchable={false}
				multiple={false}
				floating
				required
			/>

			<div className='team-financials__info-box'>
				{state.payoutModel.value === 'manager_discretion'
					? (
						<p>
							<strong>Manager Discretion:</strong>{' '}
							100% of earnings go to the Team Wallet. Admins manually distribute funds to members
							after payment clearance.
						</p>
					)
					: (
						<p>
							<strong>Smart Split:</strong>{' '}
							Earnings are automatically split per project based on pre-defined percentages enforced
							by the platform escrow.
						</p>
					)}
			</div>

			{state.payoutModel.value === 'smart_split' && (
				<div className='team-financials__rules-section'>
					<h4 className='team-financials__section-title'>Default Rules</h4>
					<div style={{ maxWidth: '50%' }}>
						<TextField
							label='Team Treasury Cut (%)'
							type='number'
							value={state.treasuryPercent.value.toString()}
							onChange={(v) => state.treasuryPercent.value = Number(v)}
							floating
							hint='Percentage taken for team overhead before member splits.'
						/>
					</div>
				</div>
			)}
		</div>
	);
}
