// #region Imports
import { useEffect, useMemo } from 'preact/hooks';
import { Skeleton } from '@projective/ui';
import { StringModifier } from '@projective/utils';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import { ProfileStats, ProfileTab } from '../../contracts/Profile.ts';
import '../../styles/components/tabs/profile-tabs.css';
// #endregion

// #region Logic & Configuration
/**
 * Master order dictating how tabs should flow visually left-to-right.
 */
const TAB_ORDER: ProfileTab[] = [
	'services',
	'projects',
	'products',
	'portfolio',
	'teams',
	'businesses',
	'members',
	'reviews',
];

/**
 * Access control matrix for which entity types CAN theoretically get which tabs.
 */
const ENTITY_TABS_MAP: Record<string, ProfileTab[]> = {
	user: ['projects', 'reviews', 'businesses'],
	freelancer: ['services', 'projects', 'products', 'portfolio', 'teams', 'businesses', 'reviews'],
	team: ['services', 'projects', 'products', 'portfolio', 'members', 'reviews'],
	business: ['projects', 'members', 'reviews'],
};

/**
 * Validation rules to check if a tab actually has content to display.
 */
const TAB_VISIBILITY_CHECKS: Record<ProfileTab, (stats: ProfileStats) => boolean> = {
	services: (s) => s.serviceCount > 0,
	projects: (s) => s.totalProjects > 0,
	products: (s) => s.productCount > 0,
	portfolio: (s) => s.portfolioCount > 0,
	teams: (s) => s.teamCount > 0,
	businesses: (s) => s.businessCount > 0,
	members: (s) => s.memberCount > 0,
	reviews: () => true, // Reviews are always visible to allow users to leave one
};
// #endregion

export default function ProfileTabs() {
	const { entityType, activeTab, setTab, isLoading, data: profileData } = useProfileContext();

	// #region Derived State
	/**
	 * Computes the correct intersection of allowed tabs for the current entity type,
	 * verifies they have content, and maintains strict sort order.
	 */
	const availableTabs = useMemo(() => {
		if (!entityType.value || !profileData.value?.stats) return [];

		const allowedTabs = ENTITY_TABS_MAP[entityType.value] || [];
		const stats = profileData.value.stats;

		return TAB_ORDER.filter((tab) => {
			const isAllowed = allowedTabs.includes(tab);
			const hasData = TAB_VISIBILITY_CHECKS[tab](stats);
			return isAllowed && hasData;
		});
	}, [entityType.value, profileData.value?.stats]);
	// #endregion

	// #region Lifecycle
	/**
	 * Ensures a valid tab is always selected.
	 * If the activeTab isn't in the available array (or is null), default to the first available index.
	 */
	useEffect(() => {
		if (availableTabs.length > 0) {
			if (!activeTab.value || !availableTabs.includes(activeTab.value)) {
				setTab(availableTabs[0]);
			}
		}
	}, [availableTabs, activeTab.value, setTab]);
	// #endregion

	// #region Loading State
	if (isLoading.value) {
		return (
			<div className='profile-tabs-container'>
				<div className='profile-tabs'>
					<Skeleton variant='text' width='80px' height='1rem' style={{ margin: '1.25rem 0' }} />
					<Skeleton variant='text' width='100px' height='1rem' style={{ margin: '1.25rem 0' }} />
					<Skeleton variant='text' width='70px' height='1rem' style={{ margin: '1.25rem 0' }} />
				</div>
			</div>
		);
	}
	// #endregion

	if (availableTabs.length === 0) return null;

	return (
		<div className='profile-tabs-container'>
			<nav className='profile-tabs' aria-label='Profile section navigation'>
				{availableTabs.map((tab) => {
					const isActive = activeTab.value === tab;

					return (
						<button
							key={tab}
							className={`profile-tabs__button ${isActive ? 'profile-tabs__button--active' : ''}`}
							onClick={() => setTab(tab)}
							aria-current={isActive ? 'page' : undefined}
						>
							{StringModifier.titleCase(tab)}
						</button>
					);
				})}
			</nav>
		</div>
	);
}
