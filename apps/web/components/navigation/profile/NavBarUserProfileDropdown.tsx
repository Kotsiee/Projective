import '@styles/components/navigation/nav-bar-user-profile-dropdown.css';
import { IconArrowsLeftRight, IconLogout, IconUser } from '@tabler/icons-preact';
import NavBarUserProfileDropdownActions from './NavBarUserProfileDropdownActions.tsx';
import NavBarUserProfileDropdownSwitch from './NavBarUserProfileDropdownSwitch.tsx';
import { signal } from '@preact/signals';
import { useUserContext } from '@contexts/UserContext.tsx';

// Signal kept outside to persist state across re-renders if desired,
// or move inside if you want it to reset every time dropdown opens.
const switchView = signal(false); // Default to Actions view

export default function NavBarUserProfileDropdown() {
	const { user, logout } = useUserContext();

	if (!user.value) return null;

	return (
		<div class='nav-bar-user__profile__dropdown'>
			<div class='nav-bar-user__profile__dropdown__current'>
				<div class='nav-bar-user__profile__dropdown__current__profile'>
					{/* User Avatar */}
					{user.value.avatarUrl
						? <img src={user.value.avatarUrl} alt={user.value.username || 'User'} />
						: (
							<div class='nav-bar-user__profile__dropdown__avatar-placeholder'>
								<IconUser size={20} />
							</div>
						)}

					<div class='nav-bar-user__profile__dropdown__current__profile__name'>
						<p class='nav-bar-user__profile__dropdown__current__profile__name__name'>
							{user.value.displayName || 'No Name'}
						</p>
						<p class='nav-bar-user__profile__dropdown__current__profile__name__username'>
							@{user.value.username}
						</p>
					</div>
				</div>

				<button
					type='button'
					class='nav-bar-user__profile__dropdown__current__switch'
					data-tooltip={switchView.value ? 'My Account' : 'Switch Context'}
					onClick={() => switchView.value = !switchView.value}
				>
					{switchView.value ? <IconUser size={18} /> : <IconArrowsLeftRight size={18} />}
				</button>
			</div>

			<div class='nav-bar-user__profile__dropdown__content'>
				{switchView.value
					? <NavBarUserProfileDropdownSwitch />
					: <NavBarUserProfileDropdownActions />}
			</div>
		</div>
	);
}
