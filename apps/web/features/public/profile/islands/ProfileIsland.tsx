/**
 * @file ProfileIsland.tsx
 * @description Root island for the profile page. Owns the scroll-driven header
 * mutation engine (an IntersectionObserver flips `isScrolled`) and projects the
 * chrome into the global `setMiddleNav` layout: a persistent side-nav action
 * core, a compressed sticky header on scroll, and the Editor-Mode Save/Discard
 * footer drawer.
 */

import '../styles/islands/profile.css';
import '../styles/components/header.css';
import '../styles/components/overview.css';
import '../styles/components/tabs.css';

import { useEffect, useRef } from 'preact/hooks';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import { ProfileContext, ProfileProvider, useProfileContext } from '../contexts/ProfileContext.tsx';
import type { ProfileData, ProfileTabKey } from '../contracts/Profile.ts';

import ProfileBanner from '../components/header/ProfileBanner.tsx';
import ProfileHeader from '../components/header/ProfileHeader.tsx';
import ProfileStickyHeader from '../components/header/ProfileStickyHeader.tsx';
import ProfileOverview from '../components/overview/ProfileOverview.tsx';

import ProfileTabs from '../components/tabs/ProfileTabs.tsx';
import ServicesTab from '../components/tabs/ServicesTab.tsx';
import ProjectsTab from '../components/tabs/ProjectsTab.tsx';
import PortfolioTab from '../components/tabs/PortfolioTab.tsx';
import ExperienceTab from '../components/tabs/ExperienceTab.tsx';
import EducationTab from '../components/tabs/EducationTab.tsx';
import TeamsTab from '../components/tabs/TeamsTab.tsx';
import ReviewsTab from '../components/tabs/ReviewsTab.tsx';

import ProfileSideRail from '../components/rail/ProfileSideRail.tsx';
import ProfileEditPanel from '../components/edit/ProfileEditPanel.tsx';
import ProfileEditFooter from '../components/edit/ProfileEditFooter.tsx';

// #region Tab panel switch
function ProfileTabPanel({ tab }: { tab: ProfileTabKey }) {
	switch (tab) {
		case 'services':
			return <ServicesTab />;
		case 'projects':
			return <ProjectsTab />;
		case 'portfolio':
			return <PortfolioTab />;
		case 'experience':
			return <ExperienceTab />;
		case 'education':
			return <EducationTab />;
		case 'teams':
			return <TeamsTab />;
		case 'reviews':
			return <ReviewsTab />;
		default:
			return null;
	}
}
// #endregion

// #region Inner — scroll + middle-nav engine
function ProfileInner() {
	const state = useProfileContext();
	const { setMiddleNav } = useNavigationContext();
	const { isScrolled, isEditing, isOwn, activeTab, railCollapsed } = state;

	const sentinelRef = useRef<HTMLDivElement>(null);

	// Header mutation: a 1px sentinel sits at the bottom edge of the banner.
	// Once it crosses above the app header line the main header morphs into the
	// sticky middle-nav header; it reverts cleanly the moment it comes back.
	// A single `isIntersecting` read (no rect maths) keeps the transition stable
	// in both directions with no flicker at the boundary.
	useEffect(() => {
		const el = sentinelRef.current;
		if (!el || typeof IntersectionObserver === 'undefined') return;

		const io = new IntersectionObserver(
			([entry]) => {
				isScrolled.value = !entry.isIntersecting;
			},
			{ threshold: 0, rootMargin: '-64px 0px 0px 0px' },
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	// Project the chrome into the global middle-nav layout.
	useEffect(() => {
		const wrap = (node: preact.ComponentChildren) => (
			<ProfileContext.Provider value={state}>{node}</ProfileContext.Provider>
		);

		const editing = isEditing.value && isOwn.value;
		const scrolled = isScrolled.value;

		// The side-nav action core is always present. The Save/Discard drawer only
		// slides out while editing; the compressed header appears on scroll.
		const showFooter = editing;
		const showHeader = scrolled && !editing;

		setMiddleNav({
			show: true,
			headerHeight: showHeader ? '60px' : '0px',
			headerContent: showHeader ? wrap(<ProfileStickyHeader />) : null,
			sideWidth: railCollapsed.value ? '68px' : '248px',
			sideContent: wrap(<ProfileSideRail activePage='profile' />),
			footerHeight: showFooter ? '72px' : '0px',
			footerContent: showFooter ? wrap(<ProfileEditFooter />) : null,
		});
	}, [isScrolled.value, isEditing.value, isOwn.value, activeTab.value, railCollapsed.value]);

	// Tear down chrome on unmount so it doesn't leak into other routes.
	useEffect(() => () => {
		setMiddleNav({
			show: false,
			headerHeight: '0px',
			sideWidth: '0px',
			footerHeight: '0px',
			headerContent: null,
			sideContent: null,
			footerContent: null,
		});
	}, []);

	const editing = isEditing.value && isOwn.value;

	return (
		<div class='profile'>
			<ProfileBanner />
			{/* Sits at the banner's bottom edge — drives the header mutation. */}
			<div ref={sentinelRef} class='profile__sentinel' aria-hidden='true' />
			<div class='profile__canvas'>
				<ProfileHeader />

				{editing ? <ProfileEditPanel /> : (
					<>
						<ProfileOverview />
						<ProfileTabs />
						<div class='profile__tab-panel'>
							<ProfileTabPanel tab={activeTab.value} />
						</div>
					</>
				)}
			</div>
		</div>
	);
}
// #endregion

// #region Public export
export interface ProfileIslandProps {
	/** Resolved by the server route (apps/web/CLAUDE.md — data flows Route → props → island). */
	profile: ProfileData;
	isSelf?: boolean;
	startInEdit?: boolean;
}

export default function ProfileIsland(
	{ profile, isSelf = false, startInEdit = false }: ProfileIslandProps,
) {
	return (
		<ProfileProvider profile={profile} isSelf={isSelf} startInEdit={startInEdit}>
			<ProfileInner />
		</ProfileProvider>
	);
}
// #endregion
