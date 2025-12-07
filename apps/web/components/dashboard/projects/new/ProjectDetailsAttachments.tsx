import { Signal } from '@preact/signals';
import { IconPhoto, IconTrash, IconUpload } from '@tabler/icons-preact';
import { FileWithMeta } from '@projective/types';
import { FileDrop } from '@projective/fields';

interface ProjectDetailsAttachmentsProps {
	files: Signal<FileWithMeta[]>;
}

export default function ProjectDetailsAttachments({ files }: ProjectDetailsAttachmentsProps) {
	const handleAdd = (newFiles: FileWithMeta[]) => {
		files.value = newFiles;
	};

	const handleRemove = (id: string) => {
		files.value = files.value.filter((f) => f.id !== id);
	};

	const getExt = (name: string) => {
		const parts = name.split('.');
		return parts.length > 1 ? `.${parts.pop()}` : '';
	};

	const getNameNoExt = (name: string) => {
		const parts = name.split('.');
		if (parts.length > 1) parts.pop();
		return parts.join('.');
	};

	return (
		<div className='project-attachments-section'>
			{/* <LabelWrapper label='Attachments' /> */}
			<p class='project-thumbnail-section__title'>Attachments</p>
			<p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>
				Add resources freelancers can use to help with their work.
			</p>

			{/* 1. List of existing files */}
			{files.value.length > 0 && (
				<div
					className='attachment-list'
					style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
				>
					{files.value.map((file) => (
						<div
							key={file.id}
							className='attachment-row'
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '0.75rem',
								padding: '0.5rem',
								border: '1px solid var(--field-border)',
								borderRadius: 'var(--field-radius)',
								background: 'var(--field-bg)',
							}}
						>
							{/* Thumb */}
							<div
								style={{
									width: '2.5rem',
									height: '2.5rem',
									borderRadius: '4px',
									overflow: 'hidden',
									background: 'var(--gray-100)',
									flexShrink: 0,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								{file.file.type.startsWith('image/')
									? (
										<img
											src={URL.createObjectURL(file.file)}
											alt=''
											style={{ width: '100%', height: '100%', objectFit: 'cover' }}
										/>
									)
									: <span style={{ fontSize: '0.6rem', color: 'var(--gray-500)' }}>FILE</span>}
							</div>

							<div style={{ flex: 1, minWidth: 0 }}>
								<div
									style={{
										fontSize: '0.875rem',
										fontWeight: 500,
										whiteSpace: 'nowrap',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
									}}
								>
									{getNameNoExt(file.file.name)}
								</div>
								<div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
									{getExt(file.file.name).toUpperCase()} • {(file.file.size / 1024).toFixed(0)}KB
								</div>
							</div>

							<div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
								<select
									style={{
										fontSize: '0.75rem',
										padding: '0.25rem',
										borderRadius: '4px',
										border: '1px solid var(--field-border)',
										background: 'transparent',
									}}
								>
									<option>Public</option>
									<option>Project</option>
									<option>Agreement</option>
								</select>

								<button
									type='button'
									onClick={() => handleRemove(file.id)}
									style={{
										border: 'none',
										background: 'transparent',
										color: 'var(--text-disabled)',
										cursor: 'pointer',
										padding: '4px',
										display: 'flex',
									}}
								>
									<IconTrash size={18} />
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* 2. Action Grid (Matches Thumbnail Section) */}
			<div className='action-grid-container'>
				{/* Upload Box */}
				<FileDrop
					value={files.value}
					dropzoneLabel={(
						<div class='action-card__content'>
							<IconUpload size={24} class='action-card__icon' />
							<span class='action-card__label'>Upload</span>
						</div>
					) as any}
					onChange={handleAdd}
					multiple
				/>

				{/* Library Box */}
				<button
					type='button'
					className='action-card__library-button'
					onClick={() => console.log('Open Library')}
				>
					<div class='action-card__content'>
						<IconPhoto size={24} class='action-card__icon' />
						<span class='action-card__label'>Choose from Library</span>
					</div>
				</button>
			</div>
		</div>
	);
}
