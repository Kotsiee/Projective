import '@styles/components/dashboard/projects/new-project-details.css';
import { useSignal } from '@preact/signals';
import { DateTime, FileWithMeta, SelectOption } from '@projective/types';
import { DateField, RichTextField, SelectField, TagInput, TextField } from '@projective/fields';
import ProjectDetailsThumbnail from './ProjectDetailsThumbnail.tsx';
import ProjectDetailsAttachments from './ProjectDetailsAttachments.tsx';
import { Visibility } from '@enums/core.ts';
import { TimelinePreset } from '@enums/project.ts';

export default function ProjectDetails() {
	const categoryOptions: SelectOption<string>[] = [
		{ label: 'Web Development', value: 'web' },
		{ label: 'Design', value: 'design' },
		{ label: 'Marketing', value: 'marketing' },
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

	// State
	const title = useSignal('');
	// Initialize as an empty Quill Delta
	const brief = useSignal<any>({ ops: [{ insert: '\n' }] });
	const tags = useSignal<string[]>(['Design', 'Development']);

	const category = useSignal<string | undefined>(undefined);
	const visibility = useSignal<string>(Visibility.Public);
	const currency = useSignal<string>('USD');
	const timelinePreset = useSignal<string | undefined>(undefined);
	const targetStartDate = useSignal<DateTime | undefined>(undefined);

	const thumbnail = useSignal<FileWithMeta | undefined>(undefined);
	const attachments = useSignal<FileWithMeta[]>([]);

	return (
		<div className='new-project__details'>
			<h2>Project Details</h2>

			<ProjectDetailsThumbnail
				value={thumbnail}
			/>

			<TextField
				label='Title'
				value={title}
				onChange={(v) => title.value = v}
				showCount
				maxLength={100}
				floating
				required
			/>

			<RichTextField
				label='Description'
				value={brief}
				onChange={(v) => brief.value = v}
				minHeight='120px'
				toolbar='basic'
				placeholder='Describe the project goals and requirements...'
				variant='framed'
				outputFormat='delta' // Returns JSON object { ops: [...] }
				required
			/>

			<ProjectDetailsAttachments
				files={attachments}
			/>

			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
				<SelectField
					name='industry_category'
					label='Industry Category'
					options={categoryOptions}
					value={category.value}
					onChange={(v) => category.value = v as string}
					searchable
					multiple={false}
					floating
					required
				/>

				<SelectField
					name='visibility'
					label='Visibility'
					options={visibilityOptions}
					value={visibility.value}
					onChange={(v) => visibility.value = v as string}
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
					value={currency.value}
					onChange={(v) => currency.value = v as string}
					searchable={false}
					multiple={false}
					floating
					required
				/>

				<DateField
					label='Target Start Date'
					value={targetStartDate.value}
					onChange={(v) => targetStartDate.value = v}
					minDate={new DateTime()}
					format='dd/MM/yyyy'
					floating
				/>
			</div>

			<SelectField
				name='timeline_preset'
				label='Timeline Preset'
				options={timelinePresetOptions}
				value={timelinePreset.value}
				onChange={(v) => timelinePreset.value = v as string}
				searchable={false}
				multiple={false}
				floating
				hint='Used to apply bulk settings initially.'
			/>

			<TagInput
				name='tags'
				label='Tags'
				value={tags}
				onChange={(v) => tags.value = v}
				placeholder='Add tags...'
				floating
			/>
		</div>
	);
}
