import '../../../../styles/components/view/body/stages/view-stages-seats.css';

export default function ViewStagesSeats({ stage, roles }: { stage: any; roles: any[] }) {
	// Filter roles belonging to this stage.
	// (Assumes backend populates project_stage_id. Adjust fallback if not).
	const stageRoles = roles.filter((r) =>
		r.project_stage_id === stage.id || r.stage_id === stage.id
	);

	if (stageRoles.length === 0) return null;

	const totalSeats = stageRoles.reduce((acc, r) => acc + (r.quantity || 1), 0);
	const availableSeats = stageRoles.reduce((acc, r) => acc + (r.available_quantity || 1), 0);

	const formatCurrency = (cents: number) => {
		if (!cents) return 'Unpaid / TBD';
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
			cents / 100,
		);
	};

	// Formats snake_case enums into Title Case (e.g. 'hourly_rate' -> 'Hourly Rate')
	const formatBudgetType = (type: string) => {
		if (!type) return 'Fixed';
		return type.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
	};

	return (
		<div className='view-stages-seats'>
			<div className='view-stages-seats__header'>
				<h5 className='view-stages-seats__title'>Staffing & Seats</h5>
				<span className='view-stages-seats__badge'>
					{availableSeats} of {totalSeats} Available
				</span>
			</div>

			<div className='view-stages-seats__list'>
				{stageRoles.map((role: any) => (
					<div key={role.id} className='view-stages-seats__row'>
						<div className='view-stages-seats__info'>
							<span className='view-stages-seats__name'>{role.role_title || 'Team Member'}</span>
							<span className='view-stages-seats__qty'>x{role.quantity || 1}</span>
						</div>

						<div className='view-stages-seats__budget'>
							<span className='view-stages-seats__budget-type'>
								{formatBudgetType(role.budget_type)}
							</span>
							<span className='view-stages-seats__budget-amount'>
								{formatCurrency(role.budget_amount_cents)}
								{role.budget_type === 'hourly_rate' && (
									<span
										style={{ fontSize: '0.85em', color: 'var(--text-muted)', marginLeft: '2px' }}
									>
										/hr
									</span>
								)}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
