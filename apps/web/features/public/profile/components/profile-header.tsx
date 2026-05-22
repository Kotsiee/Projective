// #region Imports
import { Skeleton } from '@projective/ui';
import { useProfileContext } from '../contexts/ProfileContext.tsx';
import {
	ProfileActionConnect,
	ProfileActionFollow,
	ProfileActionInvite,
	ProfileActionMessage,
	ProfileActionSave,
	ProfileActionShare,
	ProfileActionUnfollow,
} from './profile-actions.tsx';
import '../styles/components/profile-header.css';
// #endregion

export interface ProfileHeaderProps {
	showAvatar?: boolean;
	showActions?: boolean;
}

export default function ProfileHeader({ showAvatar, showActions }: ProfileHeaderProps) {
	const { data, isLoading } = useProfileContext();

	// #region Render Helpers
	const renderPrimaryActions = () => {
		const type = data.value?.type || 'user';
		const isConnected = data.value?.viewerConnectionStatus === 'connected';

		switch (type) {
			case 'freelancer':
				return (
					<>
						<ProfileActionInvite />
						{isConnected ? <ProfileActionUnfollow /> : <ProfileActionFollow />}
						<ProfileActionMessage />
						<ProfileActionConnect />
					</>
				);
			case 'user':
				return (
					<>
						{isConnected ? <ProfileActionUnfollow /> : <ProfileActionFollow />}
						<ProfileActionMessage />
						<ProfileActionConnect />
					</>
				);
			case 'team':
			case 'business':
				return (
					<>
						{isConnected ? <ProfileActionUnfollow /> : <ProfileActionFollow />}
						<ProfileActionMessage />
					</>
				);
			default:
				return null;
		}
	};

	const renderActions = () => {
		if (isLoading.value) {
			return (
				<>
					<Skeleton variant='button' width='40px' />
					<Skeleton variant='button' width='40px' />
					{showActions && <Skeleton variant='button' width='100px' />}
				</>
			);
		}

		return (
			<>
				{/* Secondary Actions (Always visible in header) */}
				<ProfileActionShare />
				<ProfileActionSave />

				{/* Primary Actions (Only visible when scrolled past banner/sidebar) */}
				{showActions && (
					<>
						<div className='profile-header__actions-divider' />
						<div className='profile-header__migrated-actions profile-header__migrated-actions--visible'>
							{renderPrimaryActions()}
						</div>
					</>
				)}
			</>
		);
	};
	// #endregion

	const displayName = data.value?.name || data.value?.handle || 'Unknown';
	const fallbackChar = displayName.charAt(0).toUpperCase();

	return (
		<div className='profile-header'>
			<div className='profile-header__name'>
				{isLoading.value
					? (
						<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
							<Skeleton variant='text' width='250px' height='2rem' />
							<Skeleton variant='text' width='120px' height='1.25rem' />
						</div>
					)
					: (
						<div className='profile-header__name-wrapper'>
							{showAvatar && (
								data.value?.avatarUrl
									? (
										<img
											src={data.value.avatarUrl}
											className='profile-header__avatar'
											alt='Avatar'
										/>
									)
									: (
										<div className='profile-header__avatar profile-header__avatar--fallback'>
											{fallbackChar}
										</div>
									)
							)}

							<div className='profile-header__text-stack'>
								<p className='profile-header__type'>
									{data.value?.type ? data.value.type.toUpperCase() : 'PROFILE'}
								</p>
								<h1 className='profile-header__title'>{displayName}</h1>
								<span className='profile-header__subtitle'>@{data.value?.handle || 'unknown'}</span>
							</div>
						</div>
					)}
			</div>

			<div className='profile-header__actions'>
				{renderActions()}
			</div>
		</div>
	);
}
