import { useViewContext } from '../../contexts/ViewContext.tsx';
import { Skeleton } from '@projective/ui'; // Ensure this path matches your UI package exports
import '../../styles/components/view/view-header.css';
import {
	ViewActionFollow,
	ViewActionJoin,
	ViewActionMessage,
	ViewActionPurchase,
	ViewActionSave,
	ViewActionShare,
	ViewActionUnfollow,
} from './view-actions.tsx';

export default function ViewHeader({ showAvatar }: { showAvatar?: boolean }) {
	const { entityType, data, isLoading, displayData } = useViewContext();

	const title = () => {
		switch (entityType.value) {
			case 'project':
				return data.value?.title || 'Unnamed Project';
			case 'service':
			case 'product':
				return data.value?.title || 'Unnamed Service';
			case 'person':
				return data.value?.name || 'Unnamed Person';
			case 'business':
			case 'team':
				return data.value?.name || 'Unnamed Organization';
			default:
				return 'Entity';
		}
	};

	const subtitle = () => {
		switch (entityType.value) {
			case 'project':
			case 'service':
			case 'product':
				return data.value?.owner?.username_or_slug || 'unknown';
			case 'person':
			case 'business':
			case 'team':
				return data.value?.username_or_slug || 'unknown';
			default:
				return 'Entity';
		}
	};

	const renderActions = () => {
		// 1. Loading State
		if (isLoading.value) {
			return (
				<>
					<Skeleton variant='button' width='80px' />
					<Skeleton variant='button' width='80px' />
					<Skeleton variant='button' width='120px' />
				</>
			);
		}

		// 2. Interactive State
		// Mock state for Follow/Unfollow toggle - replace with real state later
		const isFollowing = false;

		switch (entityType.value) {
			case 'person':
				return (
					<>
						<ViewActionShare />
						<ViewActionMessage />
						{isFollowing ? <ViewActionUnfollow /> : <ViewActionFollow />}
					</>
				);
			case 'project':
				return (
					<>
						<ViewActionShare />
						<ViewActionSave />
						<ViewActionJoin />
					</>
				);
			case 'service':
			case 'product':
				return (
					<>
						<ViewActionShare />
						<ViewActionSave />
						<ViewActionPurchase />
					</>
				);
			case 'team':
				return (
					<>
						<ViewActionShare />
						<ViewActionSave />
						{isFollowing ? <ViewActionUnfollow /> : <ViewActionFollow />}
						<ViewActionJoin />
					</>
				);
			case 'business':
				return (
					<>
						<ViewActionShare />
						<ViewActionSave />
						{isFollowing ? <ViewActionUnfollow /> : <ViewActionFollow />}
					</>
				);
			default:
				return null;
		}
	};

	return (
		<div className='view-header'>
			<div className='view-header__name'>
				{isLoading.value
					? (
						<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
							<Skeleton variant='text' width='250px' height='2rem' />
							<Skeleton variant='text' width='120px' height='1.25rem' />
						</div>
					)
					: (
						<div className='view-header__name-wrapper'>
							{/* Animated Avatar Injection */}
							{showAvatar && (
								displayData.value.avatar
									? (
										<img
											src={displayData.value.avatar}
											className='view-header__avatar'
											alt='Avatar'
										/>
									)
									: (
										<div className='view-header__avatar view-header__avatar--fallback'>
											{displayData.value.fallback}
										</div>
									)
							)}

							<div className='view-header__text-stack'>
								<p className='view-header__type'>{entityType.value?.toUpperCase()}</p>
								<h1 className='view-header__title'>{title()}</h1>
								{entityType.value === 'person'
									? <span className='view-header__subtitle'>@{subtitle()}</span>
									: <a className='view-header__subtitle' href={`/@${subtitle()}`}>@{subtitle()}</a>}
							</div>
						</div>
					)}
			</div>

			<div
				className='view-header__actions'
				style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
			>
				{renderActions()}
			</div>
		</div>
	);
}
