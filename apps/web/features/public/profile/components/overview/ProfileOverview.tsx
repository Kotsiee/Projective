/**
 * @file ProfileOverview.tsx
 * @description The structural split under the header: a left column (about +
 * skills) and the isolated right meta container.
 */

import ProfileAbout from './ProfileAbout.tsx';
import ProfileSkills from './ProfileSkills.tsx';
import ProfileMetaSidebar from './ProfileMetaSidebar.tsx';

export default function ProfileOverview() {
	return (
		<div class='profile__overview'>
			<div class='profile__overview-main'>
				<ProfileAbout />
				<ProfileSkills />
			</div>
			<ProfileMetaSidebar />
		</div>
	);
}
