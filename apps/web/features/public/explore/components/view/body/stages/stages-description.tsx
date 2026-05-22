import { useMemo } from 'preact/hooks';
import { Skeleton } from '@projective/ui';
import { MarkdownParser } from '@projective/utils'; // Adjust import path if needed
import { useViewContext } from '../../../../contexts/ViewContext.tsx';
import '../../../../styles/components/view/body/view-description.css';

export default function ViewStagesDescription({ stage }: { stage: any }) {
	const { isLoading } = useViewContext();

	// Parse the Quill Delta JSON into renderable HTML
	const htmlContent = useMemo(() => {
		if (!stage) return '';

		const desc = stage.description || stage.description_text;
		if (!desc) return '';

		try {
			const parser = new MarkdownParser();
			// If it's already a string (fallback), it handles it. If it's a Delta, it converts to HTML.
			if (typeof desc === 'string') {
				return parser.markdownToHtml(desc);
			}
			return parser.deltaToHtml(desc);
		} catch (err) {
			console.error('[ViewStagesDescription] Failed to parse description delta:', err);
			// Safely fallback to raw text if parsing entirely fails
			return typeof desc === 'string' ? desc : '';
		}
	}, [stage]);

	// 1. Loading State (Skeletons)
	if (isLoading.value) {
		return (
			<div className='view-description'>
				<Skeleton variant='text' width='150px' height='1.75rem' className='view__section-title' />
				<div
					className='view-description__content'
					style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}
				>
					<Skeleton variant='text' width='100%' height='1rem' />
					<Skeleton variant='text' width='95%' height='1rem' />
					<Skeleton variant='text' width='90%' height='1rem' />
					<Skeleton variant='text' width='60%' height='1rem' />
				</div>
			</div>
		);
	}

	// 2. Empty State (If the stage has no description)
	if (!htmlContent) return null;

	// 3. Loaded State
	return (
		<div className='view-description'>
			<h3 className='view-description__title view__section-title'>Description</h3>
			<div
				className='view-description__content ql-editor'
				dangerouslySetInnerHTML={{ __html: htmlContent }}
			/>
		</div>
	);
}
