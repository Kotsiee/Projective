import ProfileIsland from '@features/public/profile/islands/ProfileIsland.tsx';
import type { ProfileData } from '@features/public/profile/contracts/Profile.ts';

export interface ProfileWrapperProps {
	profile: ProfileData;
	isSelf: boolean;
	startInEdit: boolean;
}

/**
 * Island boundary for the public profile page. The server route resolves the
 * profile (currently the frontend seed) and the viewer relationship, then hands
 * serialisable props to the interactive island.
 */
export default function ProfileWrapper({ profile, isSelf, startInEdit }: ProfileWrapperProps) {
	return <ProfileIsland profile={profile} isSelf={isSelf} startInEdit={startInEdit} />;
}
