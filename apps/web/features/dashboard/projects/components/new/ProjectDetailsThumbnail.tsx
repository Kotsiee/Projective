import { computed, Signal } from '@preact/signals';
import { FileWithMeta } from '@projective/types';
import { FileDrop } from '@projective/fields';

interface ProjectDetailsThumbnailProps {
	value: Signal<FileWithMeta | undefined>;
	onChange?: (file?: FileWithMeta) => void;
}

export default function ProjectDetailsThumbnail({ value, onChange }: ProjectDetailsThumbnailProps) {
	// Adapter: Convert the Single Value Signal -> Array Signal for FileDrop
	const fileListSignal = computed(() => value.value ? [value.value] : []);

	// Adapter: Convert Array -> Single Value for State Update
	const handleFileChange = (files: FileWithMeta[]) => {
		const latest = files.length > 0 ? files[files.length - 1] : undefined;
		value.value = latest;
		onChange?.(latest);
	};

	const handleLibraryOpen = () => {
		console.log('TODO: Open Library Modal for Thumbnail');
	};

	return (
		<div className='project-thumbnail-section'>
			<p className='project-thumbnail-section__title'>Thumbnail</p>
			<p className='project-thumbnail-section__subtitle'>
				Set a thumbnail that stands out and draws attention.
			</p>

			<div style={{ maxWidth: '30rem' }}>
				<FileDrop
					value={fileListSignal}
					onChange={handleFileChange}
					variant='split'
					multiple={false}
					maxFiles={1}
					accept='.png,.jpg,.jpeg,.webp'
					listPosition='none'
					actionPosition='below'
					onLibraryClick={handleLibraryOpen}
				/>
			</div>
		</div>
	);
}
