import { PageProps } from 'fresh';
import { mockProfile } from '@features/public/profile/data/mockProfile.ts';
import ProfileWrapper from './(_islands)/Profile.island.tsx';

/**
 * @function ProfileRoute
 * @description Server-side controller for `/[profile]`. Resolves the profile
 * (currently the frontend seed) plus the viewer relationship and delegates to
 * the island. Own-profile / editor mode is driven by query flags for now:
 *   ?me=1    → view as the profile owner (Editor Mode available)
 *   ?edit=1  → open straight into Editor Mode
 */
export default function ProfileRoute(req: PageProps) {
	const handle = req.params.profile;
	const params = req.url.searchParams;

	const startInEdit = params.get('edit') !== null;
	const isSelf = startInEdit || params.get('me') !== null;

	// Only one seeded profile exists today; a real lookup would key off `handle`.
	const profile = { ...mockProfile, handle: mockProfile.handle || handle };

	return <ProfileWrapper profile={profile} isSelf={isSelf} startInEdit={startInEdit} />;
}
