// #region Imports
import { Skeleton } from '@projective/ui';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import '../../styles/components/body/profile-headline.css';
// #endregion

export default function ProfileHeadline() {
	const { data, isLoading } = useProfileContext();

	// #region Loading State
	if (isLoading.value) {
		return (
			<Skeleton
				variant='text'
				width='100%'
				height='1.5rem'
				className='profile-headline profile-headline--loading'
			/>
		);
	}
	// #endregion

	// #region Empty Guard
	if (!data.value?.headline) return null;
	// #endregion

	return (
		<h2 className='profile-headline'>
			{data.value.headline}
		</h2>
	);
}
