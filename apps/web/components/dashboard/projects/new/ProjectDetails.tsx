import '@styles/components/dashboard/projects/new/new-project-details.css';
import { DateTime, SelectOption, TimelinePreset, Visibility } from '@projective/types';
import { DateField, RichTextField, SelectField, TagInput, TextField } from '@projective/fields';
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
		{ label: 'Public', value: Visibility.Public },
		{ label: 'Invite Only', value: Visibility.InviteOnly },
		{ label: 'Unlisted', value: Visibility.Unlisted },
	];

	const currencyOptions: SelectOption<string>[] = [
		{ label: 'USD', value: 'USD' },
		{ label: 'GBP', value: 'GBP' },
	];

	const timelinePresetOptions: SelectOption<string>[] = [
		{ label: 'Sequential (Waterfall)', value: TimelinePreset.Sequential },
		{ label: 'Simultaneous (All at once)', value: TimelinePreset.Simultaneous },
		{ label: 'Staggered (Overlapping)', value: TimelinePreset.Staggered },
		{ label: 'Custom', value: TimelinePreset.Custom },
	];

	return (
		<div className='new-project__details'>
			<h2>Project Details</h2>

			<ProjectDetailsThumbnail
				value={state.thumbnail}
			/>

			<TextField
				label='Title'
				value={state.title}
				onChange={(v) => state.title.value = v}
				showCount
				maxLength={100}
				floating
				required
			/>

			<RichTextField
				label='Description'
				value={state.description}
				onChange={(v) => state.description.value = v as string}
				minHeight='120px'
				toolbar='basic'
				placeholder='Describe the project goals and requirements...'
				variant='framed'
				outputFormat='delta'
				required
			/>

			<ProjectDetailsAttachments
				files={state.attachments}
			/>

			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
				<SelectField
					name='currency'
					label='Currency'
					options={currencyOptions}
					value={state.currency.value}
					onChange={(v) => state.currency.value = v as string}
					searchable={false}
					multiple={false}
					floating
					required
				/>

				<DateField
					label='Target Start Date'
					value={state.targetStartDate.value}
					onChange={(v) => state.targetStartDate.value = v}
					minDate={new DateTime()}
					format='dd/MM/yyyy'
					floating
					required
				/>
			</div>

			<SelectField
				name='timeline_preset'
				label='Timeline Preset'
				options={timelinePresetOptions}
				value={state.timelinePreset.value}
				onChange={(v) => state.timelinePreset.value = v as string}
				searchable={false}
				multiple={false}
				floating
				hint='Used to apply bulk settings initially.'
				required
			/>

			<TagInput
				name='tags'
				label='Tags'
				value={state.tags}
				onChange={(v) => state.tags.value = v}
				placeholder='Add tags...'
				floating
			/>
		</div>
	);
}
