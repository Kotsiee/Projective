import '@styles/components/navigation/nav-bar-user-profile-dropdown.css';
import { IconArrowsLeftRight, IconUser } from '@tabler/icons-preact';
import NavBarUserProfileDropdownActions from './NavBarUserProfileDropdownActions.tsx';
import NavBarUserProfileDropdownSwitch from './NavBarUserProfileDropdownSwitch.tsx';
import { signal } from '@preact/signals';

const switchView = signal(true);

export default function NavBarUserProfileDropdown() {
	return (
		<div class='nav-bar-user__profile__dropdown'>
			<div class='nav-bar-user__profile__dropdown__current'>
				<div class='nav-bar-user__profile__dropdown__current__profile'>
					<img src='https://placehold.co/50x50' />
					<div class='nav-bar-user__profile__dropdown__current__profile__name'>
						<p class='nav-bar-user__profile__dropdown__current__profile__name__name'>bla</p>
						<p class='nav-bar-user__profile__dropdown__current__profile__name__username'>bla</p>
					</div>
				</div>
				<button
					type='button'
					class='nav-bar-user__profile__dropdown__current__switch'
					data-tooltip={switchView.value ? 'Switch Account' : 'Account Actions'}
					onClick={() => switchView.value = !switchView.value}
				>
					{switchView.value ? <IconArrowsLeftRight /> : <IconUser />}
				</button>
			</div>
			<div>
				{switchView.value
					? <NavBarUserProfileDropdownActions />
					: <NavBarUserProfileDropdownSwitch />}
			</div>
		</div>
	);
}
