import { useMemo } from 'preact/hooks';
import { Skeleton } from '@projective/ui';
import { MarkdownParser } from '@projective/utils';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import '../../styles/components/body/profile-bio.css';

export default function ProfileBio() {
	const { data, isLoading } = useProfileContext();

	const htmlContent = useMemo(() => {
		if (!data.value?.bio) return '';

		try {
			const parser = new MarkdownParser();
			if (typeof data.value.bio === 'string') {
				return parser.markdownToHtml(data.value.bio);
			}
			return parser.deltaToHtml(data.value.bio);
		} catch (err) {
			console.error('[ViewDescription] Failed to parse bio delta:', err);
			return '';
		}
	}, [data.value?.bio]);

	if (isLoading.value) {
		return (
			<div className='profile-bio'>
				<Skeleton variant='text' width='150px' height='1.75rem' className='view__section-title' />
				<div
					className='profile-bio__content'
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

	if (!data.value?.bio || !htmlContent || data.value?.bio.length === 0) return null;

	return (
		<div className='profile-bio'>
			<h3 className='profile-bio__title profile__section-title'>
				About {data.value?.type == 'user' || data.value.type == 'freelancer' ? 'Me' : 'Us'}
			</h3>
			<div
				className='profile-bio__content'
				dangerouslySetInnerHTML={{ __html: htmlContent }}
			/>
		</div>
	);
}
