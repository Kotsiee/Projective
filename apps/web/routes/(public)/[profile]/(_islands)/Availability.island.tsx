import AvailabilityIsland from '@features/public/profile/islands/AvailabilityIsland.tsx';
import type { ProfileData } from '@features/public/profile/contracts/Profile.ts';

export interface AvailabilityWrapperProps {
	profile: ProfileData;
	isSelf: boolean;
}

/** Island boundary for the standalone `/[profile]/availability` page. */
export default function AvailabilityWrapper({ profile, isSelf }: AvailabilityWrapperProps) {
	return <AvailabilityIsland profile={profile} isSelf={isSelf} />;
}
