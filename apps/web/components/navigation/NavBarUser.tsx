import '@styles/components/navigation/nav-bar-user.css';
import { IconBell } from '@tabler/icons-preact';
import NavBarUserProfile from './profile/NavBarUserProfile.tsx';

export default function NavBarUser() {
	return (
		<div class='nav-bar-user'>
			<div class='nav-bar-user__logo'>
				<a href='/'>
					<img class='nav-bar-user__logo__svg' src='/logo.svg' alt='Logo' />
				</a>
			</div>
			<div class='nav-bar-user__search'>
			</div>
			<div class='nav-bar-user__actions'>
				{/* <IconBell /> */}
				<NavBarUserProfile />
			</div>
		</div>
	);
}
