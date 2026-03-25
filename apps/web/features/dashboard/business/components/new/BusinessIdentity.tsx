import { IconPhoto, IconUpload } from '@tabler/icons-preact';
import { FileDrop, RichTextField, TextField } from '@projective/fields';
import { FileWithMeta } from '@projective/types';
import { useNewBusinessContext } from '../../contexts/NewBusinessContext.tsx';

export default function BusinessIdentity() {
	const state = useNewBusinessContext();

	const handleLogoDrop = (files: FileWithMeta[]) => {
		if (files.length > 0) state.logo.value = files[files.length - 1];
	};

	const handleBannerDrop = (files: FileWithMeta[]) => {
		if (files.length > 0) state.banner.value = files[files.length - 1];
	};

	return (
		<div className='team-details'>
			<div className='team-details__header'>
				<h2>Brand Identity</h2>
				<p className='team-details__subtitle'>How this business appears in the marketplace.</p>
			</div>

			{/* Grid for Logo + Banner */}
			<div className='team-details__branding-grid'>
				{/* Logo Section */}
				<div className='team-details__avatar-section'>
					<label className='team-details__label'>Business Logo</label>
					{state.logo.value
						? (
							<div className='team-details__avatar-preview'>
								<img
									src={URL.createObjectURL(state.logo.value.file)}
									className='team-details__avatar-img'
									alt='Logo'
								/>
								<button
									type='button'
									onClick={() => state.logo.value = undefined}
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
									onChange={handleLogoDrop}
								/>
							</div>
						)}
				</div>

				{/* Banner Section */}
				<div className='team-details__banner-section'>
					<label className='team-details__label'>Profile Banner</label>
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
					label='Business Name'
					value={state.name}
					onChange={(v) => {
						state.name.value = v;
						state.slug.value = v.toLowerCase().replace(/[^a-z0-9]/g, '-');
						if (!state.legalName.value) state.legalName.value = v;
					}}
					placeholder='e.g. Acme Corp'
					floating
					required
				/>
				<TextField
					label='Business Handle'
					value={state.slug}
					onChange={(v) => state.slug.value = v.toLowerCase().replace(/[^a-z0-9-]/g, '')}
					placeholder='e.g. acme-corp'
					floating
					required
					hint='projective.co/business/...'
				/>
			</div>

			<TextField
				label='Headline'
				value={state.headline}
				onChange={(v) => state.headline.value = v}
				placeholder='e.g. Building the future of widgets.'
				floating
			/>

			<RichTextField
				label='About'
				value={state.description}
				onChange={(v) => state.description.value = v as string}
				minHeight='120px'
				toolbar='basic'
				placeholder='Describe your company...'
				variant='framed'
				outputFormat='delta'
			/>
		</div>
	);
}
