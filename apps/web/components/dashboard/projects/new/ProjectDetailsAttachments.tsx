import { Signal } from '@preact/signals';
import { FileWithMeta } from '@projective/types';
import { FileDrop } from '@projective/fields';

interface ProjectDetailsAttachmentsProps {
	files: Signal<FileWithMeta[]>;
}

export default function ProjectDetailsAttachments({ files }: ProjectDetailsAttachmentsProps) {
	// Helper to handle the "Append" logic required for the FileDrop onChange
	const handleFilesChange = (newFiles: FileWithMeta[]) => {
		files.value = newFiles;
	};

	const handleLibraryOpen = () => {
		console.log('TODO: Open Library Modal');
	};

	return (
		<div className='project-files-section'>
			<p className='project-thumbnail-section__title'>Attachments</p>
			<p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>
				Add resources, briefs, or legal documents for freelancers (Max 10).
			</p>

			<FileDrop
				// Pass the Signal directly as FileDrop expects { value: ... }
				value={files}
				onChange={handleFilesChange}
				// Configuration
				variant='split'
				listPosition='top' // Shows the list before the dropzone
				multiple
				maxFiles={10}
				accept='.pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.mov,.mp4'
				// Actions
				onLibraryClick={handleLibraryOpen}
			/>
		</div>
	);
}
