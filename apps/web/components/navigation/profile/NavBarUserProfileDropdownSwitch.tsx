import '@styles/components/navigation/nav-bar-user-profile-dropdown-switch.css';
import { signal } from '@preact/signals';
import NavBarUserProfileDropdownTeams from './NavBarUserProfileDropdownTeams.tsx';
import NavBarUserProfileDropdownBusiness from './NavBarUserProfileDropdownBusiness.tsx';

const switchView = signal(false);

export default function NavBarUserProfileDropdownSwitch() {
	return (
		<div class='nav-bar-user__profile__dropdown__switch'>
			<div class='nav-bar-user__profile__dropdown__switch__switch'>
				<label class='nav-bar-user__profile__dropdown__switch__label'>
					<input
						type='radio'
						class='nav-bar-user__profile__dropdown__switch__input'
						name='nav-bar-user__profile__dropdown__switch__input'
						id='nav-bar-user__profile__dropdown__switch__input--teams'
						value='teams'
						onInput={() => switchView.value = false}
						checked={switchView.value == false}
						hidden
					/>
					Teams
				</label>
				<label class='nav-bar-user__profile__dropdown__switch__label'>
					<input
						type='radio'
						class='nav-bar-user__profile__dropdown__switch__input'
						name='nav-bar-user__profile__dropdown__switch__input'
						id='nav-bar-user__profile__dropdown__switch__input--business'
						value='business'
						onInput={() => switchView.value = true}
						checked={switchView.value == true}
						hidden
					/>
					Business
				</label>
			</div>
			<hr />
			<div class='nav-bar-user__profile__dropdown__switch__account-type'>
				{!switchView.value
					? <NavBarUserProfileDropdownTeams />
					: <NavBarUserProfileDropdownBusiness />}
			</div>
		</div>
	);
}
