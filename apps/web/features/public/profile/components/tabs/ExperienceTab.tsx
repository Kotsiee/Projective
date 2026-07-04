/**
 * @file ExperienceTab.tsx
 * @description The "Experience" panel — a thin wrapper around the shared
 * vertical Timeline, fed the profile's career history.
 */

import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import { Timeline } from './Timeline.tsx';

export default function ExperienceTab() {
	const { profile } = useProfileContext();

	return (
		<section class='profile-experience'>
			<header class='tab-head'>
				<h2 class='tab-head__title'>Career timeline</h2>
			</header>
			<Timeline entries={profile.value.experience} />
		</section>
	);
}
