import '@styles/components/dashboard/teams/new/team-details.css';
import { IconPhoto, IconUpload } from '@tabler/icons-preact';
import { FileDrop, RichTextField, SelectField, TextField } from '@projective/fields';
import { FileWithMeta, SelectOption, Visibility } from '@projective/types';
import { useNewTeamContext } from '@contexts/NewTeamContext.tsx';

export default function TeamDetails() {
	const state = useNewTeamContext();

	const visibilityOptions: SelectOption<string>[] = [{
		label: 'Public (Visible in search)',
		value: Visibility.Public,
	}, {
		label: 'Invite Only (Hidden)',
		value: Visibility.InviteOnly,
	}];

	const handleAvatarDrop = (files: FileWithMeta[]) => {
		if (files.length > 0) state.avatar.value = files[files.length - 1];
	};

	const handleBannerDrop = (files: FileWithMeta[]) => {
		if (files.length > 0) state.banner.value = files[files.length - 1];
	};

	return (
		<div className='team-details'>
			<div className='team-details__header'>
				<h2>Team Identity</h2>
				<p className='team-details__subtitle'>Establish your agency's brand and presence.</p>
			</div>

			{/* Branding Grid */}
			<div className='team-details__branding-grid'>
				{/* Avatar */}
				<div className='team-details__avatar-section'>
					<label className='team-details__label'>Team Avatar</label>
					{state.avatar.value
						? (
							<div className='team-details__avatar-preview'>
								<img
									src={URL.createObjectURL(state.avatar.value.file)}
									className='team-details__avatar-img'
									alt='Avatar'
								/>
								<button
									type='button'
									onClick={() => state.avatar.value = undefined}
									className='team-details__avatar-remove'
								>
									Remove
								</button>
							</div>
						)
						: (
							<div style={{ maxWidth: '300px' }}>
								<FileDrop
									dropzoneLabel={(
										<div className='team-details__dropzone-content'>
											<IconUpload size={24} />
											<span className='team-details__dropzone-label'>Upload Logo</span>
										</div>
									) as any}
									accept='.png,.jpg,.jpeg,.webp'
									maxFiles={1}
									onChange={handleAvatarDrop}
								/>
							</div>
						)}
				</div>

				{/* Banner */}
				<div className='team-details__banner-section'>
					<label className='team-details__label'>Team Banner</label>
					{state.banner.value
						? (
							<div className='team-details__banner-preview'>
								<img
									src={URL.createObjectURL(state.banner.value.file)}
									className='team-details__banner-img'
									alt='Banner'
									style={{
										width: '100%',
										height: '120px',
										objectFit: 'cover',
										borderRadius: 'var(--border-radius)',
									}}
								/>
								<button
									type='button'
									onClick={() => state.banner.value = undefined}
									className='team-details__avatar-remove'
								>
									Remove
								</button>
							</div>
						)
						: (
							<div style={{ width: '100%' }}>
								<FileDrop
									dropzoneLabel={(
										<div className='team-details__dropzone-content'>
											<IconPhoto size={24} />
											<span className='team-details__dropzone-label'>Upload Banner</span>
										</div>
									) as any}
									accept='.png,.jpg,.jpeg,.webp'
									maxFiles={1}
									onChange={handleBannerDrop}
								/>
							</div>
						)}
				</div>
			</div>

			<div className='team-details__row'>
				<TextField
					label='Team Name'
					value={state.name}
					onChange={(v) => {
						state.name.value = v;
						state.slug.value = v.toLowerCase().replace(/[^a-z0-9]/g, '-');
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
					hint={`projective.co/${state.slug.value}`}
				/>
			</div>

			{/* NEW: Headline Input */}
			<TextField
				label='Headline'
				value={state.headline}
				onChange={(v) => state.headline.value = v}
				placeholder='e.g. Building the future of digital experiences'
				floating
				hint='A short tagline appearing on your profile card'
			/>

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
