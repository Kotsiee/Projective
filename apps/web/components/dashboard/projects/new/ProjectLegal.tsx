import '@styles/components/dashboard/projects/new-project-legal.css';
import { useSignal } from '@preact/signals';
import { SelectOption } from '@projective/types';
import { SelectField, TagInput, TextField } from '@projective/fields';
import { IconTrash } from '@tabler/icons-preact';
import { IPOptionMode, PortfolioDisplayRights } from '@enums/project.ts';

export default function ProjectLegal() {
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

	// State
	const ipMode = useSignal<string>(IPOptionMode.ExclusiveTransfer);
	const ndaRequired = useSignal<string>('false');
	const portfolioRights = useSignal<string>(PortfolioDisplayRights.Allowed);
	const locationRestriction = useSignal('');
	const languageRequirement = useSignal('');
	const skills = useSignal<string[]>([]); // Note: These are strings, need mapping to UUIDs on backend

	const screeningQuestions = useSignal<string[]>(['']);

	const addQuestion = () => {
		screeningQuestions.value = [...screeningQuestions.value, ''];
	};

	const removeQuestion = (index: number) => {
		screeningQuestions.value = screeningQuestions.value.filter((_, i) => i !== index);
	};

	const updateQuestion = (index: number, value: string) => {
		const newQuestions = [...screeningQuestions.value];
		newQuestions[index] = value;
		screeningQuestions.value = newQuestions;
	};

	return (
		<div className='new-project__legal'>
			<h2>Legal & Screening</h2>

			<div className='field-group'>
				<SelectField
					name='ip_ownership'
					label='IP Ownership Mode'
					options={ipOptions}
					value={ipMode.value}
					onChange={(v) => ipMode.value = v as string}
					searchable={false}
					multiple={false}
					floating
					required
				/>

				<SelectField
					name='nda_required'
					label='NDA Required'
					options={booleanOptions}
					value={ndaRequired.value}
					onChange={(v) => ndaRequired.value = v as string}
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
				value={portfolioRights.value}
				onChange={(v) => portfolioRights.value = v as string}
				searchable={false}
				multiple={false}
				floating
				required
			/>

			<div className='field-group'>
				<TextField
					label='Location Restriction'
					value={locationRestriction}
					onChange={(v) => locationRestriction.value = v}
					placeholder='e.g. US Only, Europe'
					floating
				/>

				<TextField
					label='Language Requirement'
					value={languageRequirement}
					onChange={(v) => languageRequirement.value = v}
					placeholder='e.g. English (Native)'
					floating
				/>
			</div>

			<TagInput
				name='skills'
				label='Required Skills'
				value={skills}
				onChange={(v) => skills.value = v}
				placeholder='Add skills...'
				floating
			/>

			<div className='screening-questions'>
				<div className='screening-questions__header'>
					<h4>Screening Questions</h4>
				</div>

				<div className='screening-questions__list'>
					{screeningQuestions.value.map((question, index) => (
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
							{screeningQuestions.value.length > 1 && (
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
