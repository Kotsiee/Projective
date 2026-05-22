import { useViewContext } from '../../contexts/ViewContext.tsx';
import { Skeleton } from '@projective/ui';
import '../../styles/components/view/view-banner.css';

export default function ViewBanner() {
	const { isLoading, displayData } = useViewContext();

	if (isLoading.value) {
		return (
			<div className='view-banner'>
				<Skeleton variant='image' className='view-banner__image' />
				<div className='view-banner__profile view-banner__profile--skeleton'>
					<Skeleton variant='avatar' width='100%' height='100%' />
				</div>
			</div>
		);
	}

	const { banner, avatar, fallback } = displayData.value;
	if (!banner) return null;

	return (
		<div className='view-banner'>
			<img className='view-banner__image' src={banner} alt='Banner' />
			{avatar
				? <img className='view-banner__profile' src={avatar} alt='Profile Avatar' />
				: (
					<div className='view-banner__profile view-banner__profile--fallback'>
						{fallback}
					</div>
				)}
		</div>
	);
}
