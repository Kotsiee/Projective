import { useSignal } from '@preact/signals';
import { useViewContext } from '../../../contexts/ViewContext.tsx';
import { Button, Skeleton } from '@projective/ui'; // Ensure path matches your library
import '../../../styles/components/view/body/view-tags.css';

export default function ViewTags() {
	const { data, isLoading } = useViewContext();
	const isExpanded = useSignal(false);

	// 1. Loading State (Skeletons)
	if (isLoading.value) {
		return (
			<div className='view-tags'>
				<Skeleton variant='text' width='80px' height='1.75rem' className='view__section-title' />
				<div
					className='view-tags__content'
					style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}
				>
					<Skeleton variant='button' width='80px' height='32px' />
					<Skeleton variant='button' width='110px' height='32px' />
					<Skeleton variant='button' width='70px' height='32px' />
					<Skeleton variant='button' width='90px' height='32px' />
				</div>
			</div>
		);
	}

	// Safely aggregate tags/skills depending on what the entity payload provides
	const tags: string[] = Array.from(
		new Set([
			...(data.value?.skills || []),
			...(data.value?.tags || []),
		]),
	);

	// 2. Empty State
	if (tags.length === 0) return null;

	// 3. Display Logic
	// Change this number to dictate how many tags show on the first line
	const INITIAL_LIMIT = 4;
	const shouldTruncate = tags.length > INITIAL_LIMIT;

	const visibleTags = isExpanded.value || !shouldTruncate ? tags : tags.slice(0, INITIAL_LIMIT);

	const hiddenCount = tags.length - INITIAL_LIMIT;

	// 4. Loaded State
	return (
		<div className='view-tags'>
			<h3 className='view-tags__title view__section-title'>Tags</h3>
			<div
				className='view-tags__content'
				style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}
			>
				{visibleTags.map((tag) => (
					<Button
						key={tag}
						variant='secondary'
						size='small'
						outlined
						rounded
						href={`/explore?q=${encodeURIComponent(tag)}`}
					>
						{tag}
					</Button>
				))}

				{/* The Expansion "+X" Tag */}
				{shouldTruncate && !isExpanded.value && (
					<Button
						variant='secondary'
						size='small'
						outlined
						rounded
						onClick={() => isExpanded.value = true}
					>
						+{hiddenCount}
					</Button>
				)}
			</div>
		</div>
	);
}
