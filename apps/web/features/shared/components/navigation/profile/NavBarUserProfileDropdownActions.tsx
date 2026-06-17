import '../../../styles/components/navigation/nav-bar-user-profile-dropdown-actions.css';
import {
	IconHelp,
	IconLogout,
	IconSettings,
	IconUserCircle,
	IconWallet,
} from '@tabler/icons-preact';
import { useUserContext } from '@features/navigation/contexts/UserContext.tsx';

export default function NavBarUserProfileDropdownActions() {
	const { logout, user } = useUserContext();

	const handleLogout = async (e: Event) => {
		e.preventDefault();
		await logout();
	};

	return (
		<div class='nav-bar-user__profile__dropdown__actions'>
			<a href={`/${user.value?.username || 'profile'}`}>
				<IconUserCircle size={18} stroke={1.5} style={{ marginRight: '8px' }} />
				View Public Profile
			</a>

			<a href='/wallet'>
				<IconWallet size={18} stroke={1.5} style={{ marginRight: '8px' }} />
				My Wallet
			</a>

			<a href='/settings'>
				<IconSettings size={18} stroke={1.5} style={{ marginRight: '8px' }} />
				Account Settings
			</a>

			<a href='/help'>
				<IconHelp size={18} stroke={1.5} style={{ marginRight: '8px' }} />
				Help & Support
			</a>

			{/* Divider (You might need to add a quick CSS rule for this: border-top: 1px solid var(--border-color); margin: 4px 0;) */}
			<hr
				style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '0.25rem 0' }}
			/>

			<a class='action--logout' onClick={handleLogout}>
				<IconLogout size={18} stroke={1.5} style={{ marginRight: '8px' }} />
				Log Out
			</a>
		</div>
	);
}
