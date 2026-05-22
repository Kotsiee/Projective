import { PageProps } from 'fresh';
import ProfileWrapper from './(_islands)/ProfileWrapper.tsx';

export default function Profile(req: PageProps) {
	// The middleware handles the '@' stripping and populates slugs
	const username = req.state?.slugs?.profile || 'Unknown User';

	return <ProfileWrapper id={username} />;
}
