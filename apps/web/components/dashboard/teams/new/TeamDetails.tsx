import { IconPhoto, IconUpload } from '@tabler/icons-preact';
import { FileDrop, RichTextField, SelectField, TextField } from '@projective/fields';
import { FileWithMeta, SelectOption, Visibility } from '@projective/types';
import { useNewTeamContext } from '@contexts/NewTeamContext.tsx';

export default function TeamDetails() {
	const state = useNewTeamContext();

	const visibilityOptions: SelectOption<string>[] = [
		{ label: 'Public (Visible in search)', value: Visibility.Public },
		{ label: 'Invite Only (Hidden)', value: Visibility.InviteOnly },
	];

	const handleAvatarDrop = (files: FileWithMeta[]) => {
		if (files.length > 0) state.avatar.value = files[files.length - 1];
	};

	return (
		<div className='new-project__details'>
			{/* Reusing class for consistent styling */}
			<h2>Team Identity</h2>
			<p className='text-gray-500 mb-6'>Establish your agency's brand and presence.</p>

			{/* Avatar Section (Matches ProjectDetailsThumbnail) */}
			<div className='project-thumbnail-section'>
				<p className='project-thumbnail-section__title'>Team Avatar</p>

				{state.avatar.value
					? (
						<div
							className='action-card'
							style={{
								border: '1px solid var(--field-border)',
								padding: 0,
								overflow: 'hidden',
								maxWidth: '120px',
								borderRadius: '50%',
							}}
						>
							<img
								src={URL.createObjectURL(state.avatar.value.file)}
								style={{ width: '120px', height: '120px', objectFit: 'cover' }}
								alt='Avatar'
							/>
							<button
								type='button'
								onClick={() => state.avatar.value = undefined}
								className='w-full text-xs text-red-500 font-medium py-1 bg-gray-50 border-t'
							>
								Remove
							</button>
						</div>
					)
					: (
						<div
							className='action-grid-container'
							style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
						>
							<FileDrop
								dropzoneLabel={(
									<div class='action-card__content'>
										<IconUpload size={24} class='action-card__icon' />
										<span class='action-card__label'>Upload Logo</span>
									</div>
								) as any}
								accept='.png,.jpg,.jpeg'
								maxFiles={1}
								onChange={handleAvatarDrop}
							/>
						</div>
					)}
			</div>

			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
				<TextField
					label='Team Name'
					value={state.name}
					onChange={(v) => {
						state.name.value = v;
						// Auto-slugify if slug is empty
						if (!state.slug.value) {
							state.slug.value = v.toLowerCase().replace(/[^a-z0-9]/g, '-');
						}
					}}
					placeholder='e.g. Acme Digital'
					floating
					required
				/>

				<TextField
					label='Team Handle (Slug)'
					value={state.slug}
					onChange={(v) => state.slug.value = v.toLowerCase().replace(/[^a-z0-9-]/g, '')}
					placeholder='e.g. acme-digital'
					floating
					required
					hint='projective.co/team/...'
				/>
			</div>

			<RichTextField
				label='Team Bio'
				value={state.description}
				onChange={(v) => state.description.value = v as string}
				minHeight='120px'
				toolbar='basic'
				placeholder='Describe your agency, specialties, and culture...'
				variant='framed'
				outputFormat='delta'
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
	);
}
