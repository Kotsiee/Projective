import '../../styles/components/new/new-project-legal.css';
import { IPOptionMode, PortfolioDisplayRights, SelectOption } from '@projective/types';
import { SelectField, TagInput, TextField } from '@projective/fields';
import { IconPlus, IconTrash } from '@tabler/icons-preact';
import { useNewProjectContext } from '../../contexts/NewProjectContext.tsx';

export default function ProjectLegal() {
	const state = useNewProjectContext();

	const ipOptions: SelectOption<string>[] = [
		{ label: 'Exclusive Transfer (Client owns everything)', value: IPOptionMode.ExclusiveTransfer },
		{ label: 'Licensed Use (Creator retains ownership)', value: IPOptionMode.LicensedUse },
		{ label: 'Shared Ownership (Co-owned)', value: IPOptionMode.SharedOwnership },
		{ label: 'Projective Partner (Platform managed)', value: IPOptionMode.ProjectivePartner },
	];

	const portfolioOptions: SelectOption<string>[] = [
		{ label: 'Allowed (Freelancers can show in portfolio)', value: PortfolioDisplayRights.Allowed },
		{ label: 'Forbidden (Strictly private)', value: PortfolioDisplayRights.Forbidden },
		{ label: 'Embargoed (Allowed after a specific date)', value: PortfolioDisplayRights.Embargoed },
	];

	const booleanOptions: SelectOption<string>[] = [
		{ label: 'Yes, require a signed NDA', value: 'true' },
		{ label: 'No NDA required', value: 'false' },
	];

	// Handlers for Screening Questions
	const addQuestion = () => {
		state.screeningQuestions.value = [...state.screeningQuestions.value, ''];
	};

	const removeQuestion = (index: number) => {
		state.screeningQuestions.value = state.screeningQuestions.value.filter((_, i) => i !== index);
	};

	const updateQuestion = (index: number, value: string) => {
		const newQuestions = [...state.screeningQuestions.value];
		newQuestions[index] = value;
		state.screeningQuestions.value = newQuestions;
	};

	return (
		<div className='project-legal'>
			<div className='project-legal__header'>
				<h2>Legal & Screening</h2>
				<p className='project-legal__subtitle'>
					Define intellectual property rights, non-disclosure agreements, and freelancer
					requirements.
				</p>
			</div>

			<div className='project-legal__section'>
				<h3 className='project-legal__section-title'>Intellectual Property & Privacy</h3>
				<div className='project-legal__grid'>
					<SelectField
						name='ip_ownership'
						label='IP Ownership Mode'
						options={ipOptions}
						value={state.ipMode.value}
						onChange={(v) => state.ipMode.value = v as string}
						searchable={false}
						multiple={false}
						floating
						required
					/>

					<SelectField
						name='nda_required'
						label='Non-Disclosure Agreement (NDA)'
						options={booleanOptions}
						value={state.ndaRequired.value}
						onChange={(v) => state.ndaRequired.value = v as string}
						searchable={false}
						multiple={false}
						floating
						required
					/>
				</div>

				<div className='project-legal__row'>
					<SelectField
						name='portfolio_rights'
						label='Portfolio Display Rights'
						options={portfolioOptions}
						value={state.portfolioRights.value}
						onChange={(v) => state.portfolioRights.value = v as string}
						searchable={false}
						multiple={false}
						floating
						required
					/>
				</div>
			</div>

			<div className='project-legal__section'>
				<h3 className='project-legal__section-title'>Talent Screening & Restrictions</h3>
				<div className='project-legal__grid'>
					<TextField
						label='Location Restriction'
						value={state.locationRestriction}
						onChange={(v) => state.locationRestriction.value = v}
						placeholder='e.g. US Only, Europe, Remote'
						floating
						hint='Leave blank for worldwide'
					/>

					<TextField
						label='Language Requirement'
						value={state.languageRequirement}
						onChange={(v) => state.languageRequirement.value = v}
						placeholder='e.g. English (Native), Spanish'
						floating
						hint='Leave blank if not strictly required'
					/>
				</div>

				<div className='project-legal__row'>
					<TagInput
						name='skills'
						label='Required Skills'
						value={state.skills}
						onChange={(v) => state.skills.value = v}
						placeholder='Type a skill and press Enter...'
						floating
					/>
				</div>
			</div>

			<div className='project-legal__section project-legal__section--questions'>
				<div className='project-legal__questions-header'>
					<h3 className='project-legal__section-title'>Screening Questions</h3>
					<p className='project-legal__subtitle'>
						Ask applicants specific questions when they submit a proposal.
					</p>
				</div>

				<div className='project-legal__questions-list'>
					{state.screeningQuestions.value.map((question, index) => (
						<div key={index} className='project-legal__question-item'>
							<div className='project-legal__question-input'>
								<TextField
									label={`Question ${index + 1}`}
									value={question}
									onChange={(v) =>
										updateQuestion(index, v)}
									placeholder='e.g. Can you share a similar project you have worked on?'
									floating
								/>
							</div>
							{state.screeningQuestions.value.length > 1 && (
								<button
									type='button'
									className='project-legal__btn-remove'
									onClick={() => removeQuestion(index)}
									title='Remove Question'
								>
									<IconTrash size={20} />
								</button>
							)}
						</div>
					))}
				</div>

				<button type='button' className='project-legal__btn-add' onClick={addQuestion}>
					<IconPlus size={18} /> Add Another Question
				</button>
			</div>
		</div>
	);
}
