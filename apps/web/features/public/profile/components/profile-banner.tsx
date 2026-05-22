// #region Imports
import { IconButton, Skeleton } from '@projective/ui';
import { IconCamera, IconPhotoEdit, IconTrash } from '@tabler/icons-preact';
import { useProfileContext } from '../contexts/ProfileContext.tsx';
import '../styles/components/profile-banner.css';
// #endregion

export default function ProfileBanner() {
	const { data, isLoading, isOwnerOrAdmin } = useProfileContext();

	// #region Action Handlers
	const handleEditMedia = (type: 'banner' | 'avatar') => {
		console.log(`[Future feature] Open side-popup media picker for: ${type}`);
	};

	const handleRemoveMedia = (type: 'banner' | 'avatar') => {
		console.log(`[Future feature] Removing ${type}`);
	};
	// #endregion

	// #region Loading State
	if (isLoading.value) {
		return (
			<div className='profile-banner profile-banner--loading'>
				<Skeleton variant='image' className='profile-banner__background' />
				<div className='profile-banner__avatar-container profile-banner__avatar-container--skeleton'>
					<Skeleton variant='avatar' width='120px' height='120px' style={{ borderRadius: '50%' }} />
				</div>
			</div>
		);
	}
	// #endregion

	if (!data.value) return null;

	const { bannerUrl, avatarUrl, handle } = data.value;
	const displayName = data.value.name || handle || '?';
	const fallbackChar = displayName.charAt(0).toUpperCase();

	// Generate the placehold.co fallback if no banner URL exists
	const activeBannerUrl = bannerUrl ||
		`https://placehold.co/1440x200/333333/1a1a1a?text=${
			encodeURIComponent(displayName + ' Banner')
		}`;

	return (
		<div className='profile-banner'>
			{/* --- Banner Image Area --- */}
			<div className='profile-banner__background'>
				<img
					src={activeBannerUrl}
					alt={`${displayName}'s banner`}
					className='profile-banner__image'
				/>

				{/* Banner Edit Controls */}
				{isOwnerOrAdmin.value && (
					<div className='profile-banner__controls profile-banner__controls--bg'>
						<IconButton
							variant='secondary'
							onClick={() => handleEditMedia('banner')}
							aria-label='Update banner image'
						>
							<IconPhotoEdit size={20} />
						</IconButton>
						{bannerUrl && (
							<IconButton
								variant='danger'
								onClick={() => handleRemoveMedia('banner')}
								aria-label='Remove banner image'
							>
								<IconTrash size={20} />
							</IconButton>
						)}
					</div>
				)}
			</div>

			{/* --- Avatar Overlap Area --- */}
			<div className='profile-banner__avatar-container'>
				<div className='profile-banner__avatar'>
					{avatarUrl
						? <img src={avatarUrl} alt={displayName} className='profile-banner__avatar-image' />
						: (
							<div className='profile-banner__avatar-fallback'>
								{fallbackChar}
							</div>
						)}

					{/* Avatar Edit Controls (Hover/Focus Overlay) */}
					{isOwnerOrAdmin.value && (
						<div className='profile-banner__avatar-overlay'>
							<button
								className='profile-banner__avatar-edit-btn'
								onClick={() => handleEditMedia('avatar')}
								aria-label='Edit profile picture'
							>
								<IconCamera size={24} />
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
