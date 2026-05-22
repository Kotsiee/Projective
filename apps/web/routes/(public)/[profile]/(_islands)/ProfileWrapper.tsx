import { ProfileProvider } from '@features/public/profile/contexts/ProfileContext.tsx';
import ProfileIsland from '@features/public/profile/islands/ProfileIsland.tsx';

export default function ProfileWrapper({ id }: { id: string }) {
	return (
		<ProfileProvider initialId={id} initialType='user'>
			<ProfileIsland />
		</ProfileProvider>
	);
}
