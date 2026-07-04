/**
 * @file EducationTab.tsx
 * @description The "Education" panel — a thin wrapper around the shared vertical
 * Timeline, fed the profile's education history.
 */

import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import { Timeline } from './Timeline.tsx';

export default function EducationTab() {
	const { profile } = useProfileContext();

	return (
		<section class='profile-education'>
			<header class='tab-head'>
				<h2 class='tab-head__title'>Education</h2>
			</header>
			<Timeline entries={profile.value.education} />
		</section>
	);
}
