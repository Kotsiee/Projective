// #region Imports
import { Skeleton } from '@projective/ui';
import {
	IconBriefcase,
	IconFolderOpen,
	IconPackage,
	IconStarFilled,
	IconUsers,
	IconUserStar,
} from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import '../../styles/components/body/profile-body-meta.css';
// #endregion

export default function ProfileBodyMeta() {
	const { data, isLoading } = useProfileContext();

	// #region 1. Loading State
	if (isLoading.value) {
		return (
			<div className='profile-body-meta profile-body-meta--loading'>
				<Skeleton variant='text' width='120px' height='1.25rem' />
				<Skeleton variant='text' width='100px' height='1.25rem' />
				<Skeleton variant='text' width='90px' height='1.25rem' />
			</div>
		);
	}
	// #endregion

	// #region 2. Empty Guard
	if (!data.value) return null;
	// #endregion

	// #region 3. Data Extraction & Formatting
	const { type, stats } = data.value;
	// Safely access memberCount if it's added to the payload later, default to 0
	const memberCount = (data.value as any).stats?.memberCount || 0;

	interface MetaItem {
		key: string;
		icon: preact.JSX.Element;
		label: preact.JSX.Element | string;
	}

	const metaItems: MetaItem[] = [];

	console.log('Profile Stats:', stats); // Debugging line to inspect stats structure

	// A. Freelancer/Team Rating
	if (type === 'freelancer' || type === 'team') {
		if (stats.reviewsAsFreelancer && stats.reviewsAsFreelancer > 0) {
			metaItems.push({
				key: 'rating-freelancer',
				icon: (
					<IconStarFilled
						size={16}
						className='profile-body-meta__icon profile-body-meta__icon--star'
					/>
				),
				label: (
					<span>
						<strong>{stats.ratingAsFreelancer}</strong> ({stats.reviewsAsFreelancer})
					</span>
				),
			});
		}
	}

	// B. Client Rating
	if (stats.reviewsAsClient && stats.reviewsAsClient > 0) {
		metaItems.push({
			key: 'rating-client',
			icon: <IconUserStar size={16} className='profile-body-meta__icon' />,
			label: (
				<span>
					<strong>{stats.ratingAsClient}</strong> ({stats.reviewsAsClient} Client Reviews)
				</span>
			),
		});
	}

	// C. Services
	if (stats.serviceCount > 0) {
		metaItems.push({
			key: 'services',
			icon: <IconBriefcase size={16} className='profile-body-meta__icon' />,
			label: `${stats.serviceCount} Service${stats.serviceCount === 1 ? '' : 's'}`,
		});
	}

	// D. Active Projects
	if (stats.activeProjects > 0) {
		metaItems.push({
			key: 'projects',
			icon: <IconFolderOpen size={16} className='profile-body-meta__icon' />,
			label: `${stats.activeProjects} Active Project${stats.activeProjects === 1 ? '' : 's'}`,
		});
	}

	// E. Team/Business Members
	if ((type === 'team' || type === 'business') && memberCount > 0) {
		metaItems.push({
			key: 'members',
			icon: <IconUsers size={16} className='profile-body-meta__icon' />,
			label: `${memberCount} Member${memberCount === 1 ? '' : 's'}`,
		});
	}

	// F. Products
	if (stats.productCount > 0) {
		metaItems.push({
			key: 'products',
			icon: <IconPackage size={16} className='profile-body-meta__icon' />,
			label: `${stats.productCount} Product${stats.productCount === 1 ? '' : 's'}`,
		});
	}
	// #endregion

	// #region 4. Render Guard
	if (metaItems.length === 0) return null;
	// #endregion

	return (
		<div className='profile-body-meta'>
			{metaItems.map((item, index) => (
				<div key={item.key} className='profile-body-meta__item-wrapper'>
					<div className='profile-body-meta__item'>
						{item.icon}
						<span className='profile-body-meta__label'>{item.label}</span>
					</div>
					{/* Render a bullet divider for all but the last item */}
					{index < metaItems.length - 1 && (
						<span className='profile-body-meta__divider' aria-hidden='true'>&middot;</span>
					)}
				</div>
			))}
		</div>
	);
}
