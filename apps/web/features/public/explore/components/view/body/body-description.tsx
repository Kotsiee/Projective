import { useMemo } from 'preact/hooks';

import { Skeleton } from '@projective/ui';

import { MarkdownParser } from '@projective/utils'; // Adjust import path if needed

import { useViewContext } from '../../../contexts/ViewContext.tsx';
import '../../../styles/components/view/body/view-description.css';

export default function ViewDescription() {
	const {
		data,
		isLoading,
	} = useViewContext();

	// Parse the Quill Delta JSON into renderable HTML
	const htmlContent = useMemo(() => {
		if (!data.value?.description) return '';

		try {
			const parser = new MarkdownParser();

			// If it's already a string (fallback), it handles it. If it's a Delta, it converts to HTML.
			if (typeof data.value.description === 'string') {
				return parser.markdownToHtml(data.value.description);
			}

			return parser.deltaToHtml(data.value.description);
		} catch (err) {
			console.error('[ViewDescription] Failed to parse description delta:', err);
			return '';
		}
	}, [data.value?.description]);

	// 1. Loading State (Skeletons)
	if (isLoading.value) {
		return (
			<div className='view-description'>
				<Skeleton variant='text' width='150px' height='1.75rem' className='view__section-title' />
				{' '}
				<div
					className='view-description__content'
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '0.75rem',
						marginTop: '1rem',
					}}
				>
					<Skeleton variant='text' width='100%' height='1rem' />{' '}
					<Skeleton variant='text' width='95%' height='1rem' />{' '}
					<Skeleton variant='text' width='90%' height='1rem' />{' '}
					<Skeleton variant='text' width='60%' height='1rem' />
				</div>
			</div>
		);
	}

	// 2. Empty State
	if (!data.value?.description) return null;

	// 3. Loaded State
	return (
		<div className='view-description'>
			<h3 className='view-description__title view__section-title'>Description</h3>{' '}
			<div
				className='view-description__content'
				dangerouslySetInnerHTML={{
					__html: htmlContent,
				}}
			/>
		</div>
	);
}
