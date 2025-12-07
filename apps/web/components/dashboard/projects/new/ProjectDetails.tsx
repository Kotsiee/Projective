import '@styles/components/dashboard/projects/new-project-details.css';
import { useSignal } from '@preact/signals';
import { FileWithMeta, SelectOption } from '@projective/types';
import { ComboboxField, SelectField, TagInput, TextField } from '@projective/fields';
import ProjectDetailsThumbnail from './ProjectDetailsThumbnail.tsx';
import ProjectDetailsAttachments from './ProjectDetailsAttachments.tsx';

export default function ProjectDetails() {
	const ipOptions: SelectOption<string>[] = [
		{ label: 'Full Transfer', value: 'transfer' },
		{ label: 'License Only', value: 'license' },
	];

	const categoryOptions: SelectOption<string>[] = [
		{ label: 'Web Development', value: 'web' },
		{ label: 'Design', value: 'design' },
		{ label: 'Marketing', value: 'marketing' },
	];

	// State
	const title = useSignal('');
	const brief = useSignal('');
	const tags = useSignal<string[]>(['Design', 'Development']);

	const category = useSignal<string | undefined>(undefined);
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
				maxLength={120}
				floating
				required
			/>

			<TextField
				label='Brief'
				className='field--filled'
				value={brief}
				onChange={(v) => brief.value = v}
				multiline
				rows={4}
				floating
				required
			/>

			<ProjectDetailsAttachments
				files={attachments}
			/>

			<TagInput
				name='tags'
				label='Tags'
				value={tags}
				onChange={(v) => tags.value = v}
				placeholder='Add tags...'
				floating
			/>

			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
				<SelectField
					name='project-ip-ownership'
					label='IP Ownership Mode'
					options={ipOptions}
					searchable={false}
					multiple={false}
					floating
				/>
			</div>
		</div>
	);
}
