import '@styles/components/dashboard/projects/new-project-legal.css';
import { SelectOption } from '@projective/types';
import { SelectField, TagInput, TextField } from '@projective/fields';
import { IconTrash } from '@tabler/icons-preact';
import { IPOptionMode, PortfolioDisplayRights } from '@enums/project.ts';
import { useProjectContext } from '@contexts/ProjectContext.tsx';

export default function ProjectLegal() {
	const state = useProjectContext();

	const ipOptions: SelectOption<string>[] = [
		{ label: 'Exclusive Transfer', value: IPOptionMode.ExclusiveTransfer },
		{ label: 'Licensed Use', value: IPOptionMode.LicensedUse },
		{ label: 'Shared Ownership', value: IPOptionMode.SharedOwnership },
		{ label: 'Projective Partner', value: IPOptionMode.ProjectivePartner },
	];

	const portfolioOptions: SelectOption<string>[] = [
		{ label: 'Allowed', value: PortfolioDisplayRights.Allowed },
		{ label: 'Forbidden', value: PortfolioDisplayRights.Forbidden },
		{ label: 'Embargoed', value: PortfolioDisplayRights.Embargoed },
	];

	const booleanOptions: SelectOption<string>[] = [
		{ label: 'Yes', value: 'true' },
		{ label: 'No', value: 'false' },
	];

	// Handlers for Screening Questions (now modifying Context state)
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
		<div className='new-project__legal'>
			<h2>Legal & Screening</h2>

			<div className='field-group'>
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
					label='NDA Required'
					options={booleanOptions}
					value={state.ndaRequired.value}
					onChange={(v) => state.ndaRequired.value = v as string}
					searchable={false}
					multiple={false}
					floating
					required
				/>
			</div>

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

			<div className='field-group'>
				<TextField
					label='Location Restriction'
					value={state.locationRestriction}
					onChange={(v) => state.locationRestriction.value = v}
					placeholder='e.g. US Only, Europe'
					floating
				/>

				<TextField
					label='Language Requirement'
					value={state.languageRequirement}
					onChange={(v) => state.languageRequirement.value = v}
					placeholder='e.g. English (Native)'
					floating
				/>
			</div>

			<TagInput
				name='skills'
				label='Required Skills'
				value={state.skills}
				onChange={(v) => state.skills.value = v}
				placeholder='Add skills...'
				floating
			/>

			<div className='screening-questions'>
				<div className='screening-questions__header'>
					<h4>Screening Questions</h4>
				</div>

				<div className='screening-questions__list'>
					{state.screeningQuestions.value.map((question, index) => (
						<div key={index} className='screening-questions__item'>
							<div style={{ flex: 1 }}>
								<TextField
									label={`Question ${index + 1}`}
									value={question}
									onChange={(v) =>
										updateQuestion(index, v)}
									floating
								/>
							</div>
							{state.screeningQuestions.value.length > 1 && (
								<button
									type='button'
									className='btn-remove'
									onClick={() => removeQuestion(index)}
									title='Remove Question'
								>
									<IconTrash size={18} />
								</button>
							)}
						</div>
					))}
				</div>

				<button type='button' className='btn-add' onClick={addQuestion}>
					+ Add Question
				</button>
			</div>
		</div>
	);
}
