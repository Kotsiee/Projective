import '@styles/components/dashboard/projects/new/new-project-details.css';
import { SelectOption, Visibility } from '@projective/types';
import { RichTextField, SelectField, TagInput, TextField } from '@projective/fields';
import ProjectDetailsThumbnail from './ProjectDetailsThumbnail.tsx';
import ProjectDetailsAttachments from './ProjectDetailsAttachments.tsx';
import { useNewProjectContext } from '@contexts/NewProjectContext.tsx';

export default function ProjectDetails() {
	const state = useNewProjectContext();

	const categoryOptions: SelectOption<string>[] = [
		{ label: 'Web Development', value: 'befe48ee-4c71-4e8f-b8e6-01b6602eea6c' },
		{ label: 'Design', value: 'bf332d34-e262-4b4e-978b-bec8114ecb59' },
		{ label: 'Marketing', value: '6f39bcc2-22da-4cef-8663-3e9770046508' },
	];

	const visibilityOptions: SelectOption<string>[] = [
		{ label: 'Public - Visible on Marketplace', value: Visibility.Public },
		{ label: 'Invite Only - Hidden from searches', value: Visibility.InviteOnly },
		{ label: 'Unlisted - Anyone with link can view', value: Visibility.Unlisted },
	];

	const currencyOptions: SelectOption<string>[] = [
		{ label: 'USD ($)', value: 'USD' },
		{ label: 'GBP (£)', value: 'GBP' },
		{ label: 'EUR (€)', value: 'EUR' },
	];

	return (
		<div className='new-project__details'>
			<div className='new-project__header'>
				<h2>Project Details</h2>
				<p className='new-project__subtitle'>
					Define the core information, categorize your project, and upload essential briefs.
				</p>
			</div>

			<ProjectDetailsThumbnail
				value={state.thumbnail}
			/>

			<div className='new-project__row'>
				<TextField
					label='Project Title'
					value={state.title}
					onChange={(v) => state.title.value = v}
					showCount
					maxLength={150}
					floating
					required
				/>
			</div>

			<div className='new-project__row'>
				<RichTextField
					label='Description'
					value={state.description}
					onChange={(v) => state.description.value = v as string}
					minHeight='180px'
					toolbar='basic'
					placeholder='Describe the project goals, requirements, and background...'
					variant='framed'
					outputFormat='delta'
					required
				/>
			</div>

			<div className='new-project__grid'>
				<SelectField
					name='industry_category'
					label='Industry Category'
					options={categoryOptions}
					value={state.category.value}
					onChange={(v) => state.category.value = v as string}
					searchable
					multiple={false}
					floating
					required
				/>

				<SelectField
					name='visibility'
					label='Visibility'
					options={visibilityOptions}
					value={state.visibility.value}
					onChange={(v) => state.visibility.value = v as string}
					searchable={false}
					multiple={false}
					floating
					required
				/>
			</div>

			<div className='new-project__grid'>
				<SelectField
					name='currency'
					label='Currency'
					options={currencyOptions}
					value={state.currency.value}
					onChange={(v) => state.currency.value = v as string}
					searchable={false}
					multiple={false}
					floating
					hint='Budgets across all stages will use this currency.'
					required
				/>

				<TagInput
					name='tags'
					label='Tags'
					value={state.tags}
					onChange={(v) => state.tags.value = v}
					placeholder='Add tags (e.g., UI/UX, React)...'
					floating
				/>
			</div>

			<div className='new-project__row'>
				<ProjectDetailsAttachments
					files={state.attachments}
				/>
			</div>
		</div>
	);
}
