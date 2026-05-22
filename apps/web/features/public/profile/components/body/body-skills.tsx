// #region Imports
import { Skeleton, TagList } from '@projective/ui';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import '../../styles/components/body/profile-skills.css';
// #endregion

export default function ProfileBodySkills() {
	const { data, isLoading } = useProfileContext();

	// #region Loading State
	if (isLoading.value) {
		return (
			<div className='profile-skills profile-skills--loading'>
				<Skeleton
					variant='text'
					width='60px'
					height='1rem'
					className='profile-skills__heading-skeleton'
				/>
				<div className='profile-skills__list-skeleton'>
					<Skeleton
						variant='button'
						width='80px'
						height='1.75rem'
						style={{ borderRadius: 'var(--border-radius__small)' }}
					/>
					<Skeleton
						variant='button'
						width='120px'
						height='1.75rem'
						style={{ borderRadius: 'var(--border-radius__small)' }}
					/>
					<Skeleton
						variant='button'
						width='90px'
						height='1.75rem'
						style={{ borderRadius: 'var(--border-radius__small)' }}
					/>
				</div>
			</div>
		);
	}
	// #endregion

	// #region Empty Guard
	const skills = data.value?.skills;
	if (!skills || skills.length === 0) return null;
	// #endregion

	return (
		<div className='profile-skills'>
			<h3 className='profile-skills__title profile__section-title'>Skills</h3>
			<TagList
				tags={skills}
				mode='single'
				size='large'
				rounded
			/>
		</div>
	);
}
