/**
 * @file AvailabilityIsland.tsx
 * @description Standalone Availability page island. The MS-Teams-style calendar
 * engine now lives on its own route (`/[profile]/availability`) rather than in
 * the profile tabs. It reuses the profile provider (for services + availability
 * data + the booking flow) and projects the shared side-nav action core with
 * "Availability" marked active.
 */

import '../styles/islands/profile.css';

import { useEffect } from 'preact/hooks';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import { ProfileContext, ProfileProvider, useProfileContext } from '../contexts/ProfileContext.tsx';
import type { ProfileData } from '../contracts/Profile.ts';
import { mockProfile } from '../data/mockProfile.ts';

import ProfileSideRail from '../components/rail/ProfileSideRail.tsx';
import ProfileEditFooter from '../components/edit/ProfileEditFooter.tsx';
import AvailabilityCalendar from '../components/availability/AvailabilityCalendar.tsx';

function AvailabilityInner() {
	const state = useProfileContext();
	const { setMiddleNav } = useNavigationContext();
	const { isEditing, isOwn, railCollapsed } = state;

	useEffect(() => {
		const wrap = (node: preact.ComponentChildren) => (
			<ProfileContext.Provider value={state}>{node}</ProfileContext.Provider>
		);
		const editing = isEditing.value && isOwn.value;

		setMiddleNav({
			show: true,
			headerHeight: '0px',
			headerContent: null,
			sideWidth: railCollapsed.value ? '68px' : '248px',
			sideContent: wrap(<ProfileSideRail activePage='availability' />),
			footerHeight: editing ? '72px' : '0px',
			footerContent: editing ? wrap(<ProfileEditFooter />) : null,
		});
	}, [isEditing.value, isOwn.value, railCollapsed.value]);

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

	return (
		<div class='profile-availability-page'>
			<AvailabilityCalendar />
		</div>
	);
}

export interface AvailabilityIslandProps {
	profile?: ProfileData;
	isSelf?: boolean;
}

export default function AvailabilityIsland(
	{ profile, isSelf = false }: AvailabilityIslandProps,
) {
	const data = profile ?? mockProfile;
	return (
		<ProfileProvider profile={data} isSelf={isSelf}>
			<AvailabilityInner />
		</ProfileProvider>
	);
}
