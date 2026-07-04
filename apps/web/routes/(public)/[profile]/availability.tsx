import { PageProps } from 'fresh';
import { mockProfile } from '@features/public/profile/data/mockProfile.ts';
import AvailabilityWrapper from './(_islands)/Availability.island.tsx';

/**
 * @function AvailabilityRoute
 * @description Server controller for `/[profile]/availability` — the standalone
 * MS-Teams-style scheduling page. Resolves the (mock) profile and viewer
 * relationship, then delegates to the island. `?me=1` views as the owner.
 */
export default function AvailabilityRoute(req: PageProps) {
	const handle = req.params.profile;
	const isSelf = req.url.searchParams.get('me') !== null;
	const profile = { ...mockProfile, handle: mockProfile.handle || handle };

	return <AvailabilityWrapper profile={profile} isSelf={isSelf} />;
}
