import '../../styles/components/body/profile-body.css';
import ProfileHeadline from './body-headline.tsx';
import ProfileBodyMeta from './body-meta.tsx';
import ProfileBio from './body-bio.tsx';
import ProfileBodySkills from './body-skills.tsx';

export default function ProfileBody() {
	return (
		<div className='profile-body'>
			<ProfileBodyMeta />
			<ProfileHeadline />
			<ProfileBio />
			<ProfileBodySkills />
		</div>
	);
}
