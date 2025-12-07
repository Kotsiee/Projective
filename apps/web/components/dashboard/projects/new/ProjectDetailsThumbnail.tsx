import { Signal } from '@preact/signals';
import { IconPhoto, IconUpload } from '@tabler/icons-preact';
import { FileWithMeta } from '@projective/types';
import { FileDrop } from '@projective/fields';

interface ProjectDetailsThumbnailProps {
	value: Signal<FileWithMeta | undefined>;
	onChange?: (file?: FileWithMeta) => void;
}

export default function ProjectDetailsThumbnail({ value, onChange }: ProjectDetailsThumbnailProps) {
	const handleDrop = (files: FileWithMeta[]) => {
		if (files.length > 0) {
			const latest = files[files.length - 1];
			value.value = latest;
			onChange?.(latest);
		}
	};

	return (
		<div class='project-thumbnail-section'>
			<p class='project-thumbnail-section__title'>Thumbnail</p>
			<p class='project-thumbnail-section__subtitle'>
				Set a thumbnail that stands out and draws attention.
			</p>

			{value.value
				? (
					<div
						class='action-card'
						style={{
							border: '1px solid var(--field-border)',
							borderRadius: 'var(--field-radius)',
							padding: 0,
							overflow: 'hidden',
							maxWidth: '30rem',
						}}
					>
						<img
							src={URL.createObjectURL(value.value.file)}
							alt='Thumbnail'
							style={{ width: '100%', height: '200px', objectFit: 'cover' }}
						/>
						<button
							type='button'
							onClick={() => {
								value.value = undefined;
								onChange?.(undefined);
							}}
							style={{
								padding: '0.75rem',
								width: '100%',
								border: 'none',
								borderTop: '1px solid var(--field-border)',
								background: 'var(--field-bg)',
								cursor: 'pointer',
								color: 'var(--error-500)',
								fontWeight: 500,
							}}
						>
							Remove & Change
						</button>
					</div>
				)
				: (
					<div class='action-grid-container'>
						{/* 1. Upload Box */}
						<FileDrop
							dropzoneLabel={(
								<div class='action-card__content'>
									<IconUpload size={24} class='action-card__icon' />
									<span class='action-card__label'>Upload</span>
								</div>
							) as any}
							accept='.png,.jpg,.jpeg'
							maxFiles={1}
							onChange={handleDrop}
						/>

						{/* 2. Library Box */}
						<button
							type='button'
							class='action-card__library-button'
							onClick={() => console.log('Open Library Modal')}
						>
							<div class='action-card__content'>
								<IconPhoto size={24} class='action-card__icon' />
								<span class='action-card__label'>Choose from Library</span>
							</div>
						</button>
					</div>
				)}
		</div>
	);
}
