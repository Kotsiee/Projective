import '@styles/components/navigation/nav-bar-user.css';
import { IconBell } from '@tabler/icons-preact';
import NavBarUserProfile from './profile/NavBarUserProfile.tsx';

export default function NavBarUser() {
	return (
		<div class='nav-bar-user'>
			<div class='nav-bar-user__logo'>
				<img class='nav-bar-user__logo__svg' src='/logo.svg' alt='Logo' />
				<h1>Projective</h1>
			</div>
			<div class='nav-bar-user__search'>
				<h1>Logo</h1>
			</div>
			<div class='nav-bar-user__actions'>
				<IconBell />
				<NavBarUserProfile />
			</div>
		</div>
	);
}
