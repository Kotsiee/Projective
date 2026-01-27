import { SelectField, TextField } from '@projective/fields';
import { useNewTeamContext } from '@contexts/NewTeamContext.tsx';

export default function TeamFinancials() {
	const state = useNewTeamContext();

	const payoutOptions = [
		{ label: 'Manager Discretion (Manual)', value: 'manager_discretion' },
		{ label: 'Smart Split (Automated)', value: 'smart_split' },
	];

	return (
		<div className='new-project__details'>
			<h2>Financial Model</h2>
			<p className='text-gray-500 mb-6'>How should project earnings be distributed?</p>

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

			<div className='mt-4 p-4 bg-gray-50 rounded border border-gray-200 text-sm text-gray-600'>
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
				<div className='mt-6'>
					<h4 className='text-base font-medium mb-2'>Default Rules</h4>
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
