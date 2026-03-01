// deno-lint-ignore-file no-explicit-any
import '@styles/components/dashboard/projects/new/new-project-budget.css';
import { useNewProjectContext } from '@contexts/NewProjectContext.tsx';
import { MoneyField, SelectField, TextField } from '@projective/fields';
import { BudgetType, SelectOption } from '@projective/types';
import { IconBriefcase, IconCoin, IconPlus, IconTrash, IconUserPlus } from '@tabler/icons-preact';
import { StageOpenSeat, StageStaffingRole } from '@contracts/dashboard/projects/new/Stage.ts';

export default function ProjectBudget() {
	const state = useNewProjectContext();

	// #region Options
	const budgetTypeOptions: SelectOption<string>[] = [
		{ label: 'Fixed Price', value: BudgetType.FixedPrice },
		{ label: 'Hourly Cap', value: BudgetType.HourlyCap },
	];
	// #endregion

	// #region Handlers
	const updateStageMode = (index: number, mode: 'defined_roles' | 'open_seats') => {
		const newStages = [...state.stages.value];
		newStages[index]._ui_model_type = mode;

		// Initialize default arrays if switching modes and they are empty
		if (mode === 'defined_roles' && newStages[index].staffing_roles.length === 0) {
			newStages[index].staffing_roles = [createDefaultRole()];
		} else if (mode === 'open_seats' && newStages[index].open_seats.length === 0) {
			newStages[index].open_seats = [createDefaultSeat()];
		}

		state.stages.value = newStages;
	};

	const createDefaultRole = (): StageStaffingRole => ({
		role_title: '',
		quantity: 1,
		budget_type: BudgetType.FixedPrice,
		budget_amount_cents: 0,
		allow_proposals: true,
	});

	const createDefaultSeat = (): StageOpenSeat => ({
		description_of_need: '',
		require_proposals: true,
	});

	const addRole = (stageIndex: number) => {
		const newStages = [...state.stages.value];
		newStages[stageIndex].staffing_roles.push(createDefaultRole());
		state.stages.value = newStages;
	};

	const removeRole = (stageIndex: number, roleIndex: number) => {
		const newStages = [...state.stages.value];
		newStages[stageIndex].staffing_roles = newStages[stageIndex].staffing_roles.filter((_, i) =>
			i !== roleIndex
		);
		state.stages.value = newStages;
	};

	const updateRole = (
		stageIndex: number,
		roleIndex: number,
		field: keyof StageStaffingRole,
		value: any,
	) => {
		const newStages = [...state.stages.value];
		newStages[stageIndex].staffing_roles[roleIndex] = {
			...newStages[stageIndex].staffing_roles[roleIndex],
			[field]: value,
		};
		state.stages.value = newStages;
	};

	const updateSeat = (stageIndex: number, field: keyof StageOpenSeat, value: any) => {
		const newStages = [...state.stages.value];
		if (!newStages[stageIndex].open_seats[0]) {
			newStages[stageIndex].open_seats[0] = createDefaultSeat();
		}
		newStages[stageIndex].open_seats[0] = {
			...newStages[stageIndex].open_seats[0],
			[field]: value,
		};
		state.stages.value = newStages;
	};
	// #endregion

	return (
		<div className='project-budget'>
			<div className='project-budget__header'>
				<h2>Budget & Staffing</h2>
				<p className='project-budget__subtitle'>
					Assign budgets and define the team required for each stage. Currency is fixed to{' '}
					<strong>{state.currency.value}</strong>.
				</p>
			</div>

			<div className='project-budget__stage-list'>
				{state.stages.value.map((stage, stageIndex) => (
					<div key={stageIndex.toString()} className='budget-card'>
						<div className='budget-card__header'>
							<h3 className='budget-card__title'>{stage.title || `Stage ${stageIndex + 1}`}</h3>
							<div className='budget-card__mode-toggle'>
								<button
									type='button'
									className={`mode-btn ${
										stage._ui_model_type === 'defined_roles' ? 'mode-btn--active' : ''
									}`}
									onClick={() =>
										updateStageMode(stageIndex, 'defined_roles')}
								>
									<IconBriefcase size={16} /> Defined Roles
								</button>
								<button
									type='button'
									className={`mode-btn ${
										stage._ui_model_type === 'open_seats' ? 'mode-btn--active' : ''
									}`}
									onClick={() =>
										updateStageMode(stageIndex, 'open_seats')}
								>
									<IconUserPlus size={16} /> Seeking Talent
								</button>
							</div>
						</div>

						{/* --- DEFINED ROLES UI --- */}
						{stage._ui_model_type === 'defined_roles' && (
							<div className='budget-card__content'>
								{stage.staffing_roles.map((role, roleIndex) => (
									<div key={roleIndex.toString()} className='staffing-role-row'>
										<div className='staffing-role-row__main'>
											<TextField
												label='Role Title'
												value={role.role_title}
												onChange={(v) =>
													updateRole(stageIndex, roleIndex, 'role_title', v)}
												placeholder='e.g. Senior Frontend Engineer'
												floating
												required
											/>
											<div className='staffing-role-row__grid'>
												<TextField
													label='Quantity'
													type='number'
													value={role.quantity.toString()}
													onChange={(v) =>
														updateRole(stageIndex, roleIndex, 'quantity', parseInt(v))}
													floating
													required
												/>
												<SelectField
													name={`budget_type_${stageIndex}_${roleIndex}`}
													label='Budget Type'
													options={budgetTypeOptions}
													value={role.budget_type}
													onChange={(v) =>
														updateRole(stageIndex, roleIndex, 'budget_type', v as string)}
													searchable={false}
													multiple={false}
													floating
													required
												/>
												<MoneyField
													label={`Budget (${state.currency.value})`}
													value={role.budget_amount_cents}
													onChange={(v) =>
														updateRole(stageIndex, roleIndex, 'budget_amount_cents', v)}
													currency={state.currency.value}
													floating
													required
												/>
											</div>
										</div>
										{stage.staffing_roles.length > 1 && (
											<button
												type='button'
												className='btn-remove-role'
												onClick={() => removeRole(stageIndex, roleIndex)}
												title='Remove Role'
											>
												<IconTrash size={20} />
											</button>
										)}
									</div>
								))}
								<button type='button' className='btn-add-role' onClick={() => addRole(stageIndex)}>
									<IconPlus size={16} /> Add Another Role
								</button>
							</div>
						)}

						{/* --- OPEN SEATS UI --- */}
						{stage._ui_model_type === 'open_seats' && stage.open_seats[0] && (
							<div className='budget-card__content'>
								<p className='budget-card__helper'>
									Describe what you need done and let agencies or freelancers propose the team
									structure and cost.
								</p>
								<TextField
									label='Description of Need'
									value={stage.open_seats[0].description_of_need}
									onChange={(v) => updateSeat(stageIndex, 'description_of_need', v)}
									placeholder='e.g. We need a team to handle the full mobile app development...'
									floating
									required
								/>
								<div className='staffing-role-row__grid'>
									<MoneyField
										label={`Minimum Budget (${state.currency.value})`}
										value={stage.open_seats[0].budget_min_cents || 0}
										onChange={(v) => updateSeat(stageIndex, 'budget_min_cents', v)}
										currency={state.currency.value}
										floating
										hint='Optional lower bound'
									/>
									<MoneyField
										label={`Maximum Budget (${state.currency.value})`}
										value={stage.open_seats[0].budget_max_cents || 0}
										onChange={(v) => updateSeat(stageIndex, 'budget_max_cents', v)}
										currency={state.currency.value}
										floating
										hint='Optional upper bound'
									/>
								</div>
							</div>
						)}

						{/* Global Stage Toggle for Proposals */}
						<div className='budget-card__footer'>
							<label className='toggle-label'>
								<IconCoin size={18} color='var(--text-muted)' />
								<div>
									<span className='toggle-label__title'>Allow Market Proposals</span>
									<span className='toggle-label__desc'>
										Allow freelancers to submit counter-offers on the budget instead of accepting a
										fixed rate.
									</span>
								</div>
							</label>
							<div className='toggle-switch'>
								<input
									type='checkbox'
									id={`allow-proposals-${stageIndex}`}
									checked={stage._ui_model_type === 'defined_roles'
										? stage.staffing_roles[0]?.allow_proposals !== false
										: stage.open_seats[0]?.require_proposals !== false}
									onChange={(e) => {
										const val = e.currentTarget.checked;
										if (stage._ui_model_type === 'defined_roles') {
											stage.staffing_roles.forEach((_, rIdx) =>
												updateRole(stageIndex, rIdx, 'allow_proposals', val)
											);
										} else {
											updateSeat(stageIndex, 'require_proposals', val);
										}
									}}
								/>
								<label htmlFor={`allow-proposals-${stageIndex}`}></label>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
