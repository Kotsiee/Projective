/**
 * @file NavBarUserProfileDropdownSwitch.tsx
 * @description Context switcher between "Teams" and "Business" views within the profile dropdown.
 */
import '@styles/components/navigation/nav-bar-user-profile-dropdown-switch.css';
import { signal } from '@preact/signals';
import NavBarUserProfileDropdownTeams from './NavBarUserProfileDropdownTeams.tsx';
import NavBarUserProfileDropdownBusiness from './NavBarUserProfileDropdownBusiness.tsx';

// False = Teams, True = Business
const switchView = signal(false);

export default function NavBarUserProfileDropdownSwitch() {
	return (
		<div class='nav-bar-user__profile__dropdown__switch'>
			<div class='nav-bar-user__profile__dropdown__switch__controls'>
				<label class='nav-bar-user__profile__dropdown__switch__label'>
					<input
						type='radio'
						name='context-switch'
						value='teams'
						onInput={() => switchView.value = false}
						checked={switchView.value === false}
						class='visually-hidden'
					/>
					<span class='nav-bar-user__profile__dropdown__switch__pill'>Teams</span>
				</label>

				<label class='nav-bar-user__profile__dropdown__switch__label'>
					<input
						type='radio'
						name='context-switch'
						value='business'
						onInput={() => switchView.value = true}
						checked={switchView.value === true}
						class='visually-hidden'
					/>
					<span class='nav-bar-user__profile__dropdown__switch__pill'>Business</span>
				</label>
			</div>

			<div class='nav-bar-user__profile__dropdown__switch__content'>
				{!switchView.value
					? <NavBarUserProfileDropdownTeams />
					: <NavBarUserProfileDropdownBusiness />}
			</div>
		</div>
	);
}
