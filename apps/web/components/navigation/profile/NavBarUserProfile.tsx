import '@styles/components/navigation/nav-bar-user-profile.css';
import NavBarUserProfileDropdown from './NavBarUserProfileDropdown.tsx';
import { signal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { IconUser } from '@tabler/icons-preact';
import { useUserContext } from '@contexts/UserContext.tsx';

const open = signal(false);

export default function NavBarUserProfile() {
	const rootRef = useRef<HTMLDivElement | null>(null);
	const { user } = useUserContext();

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const root = rootRef.current;
			if (!root) return;
			if (root.contains(event.target as Node)) return;
			open.value = false;
		};

		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	const handleButtonClick = (event: MouseEvent) => {
		event.stopPropagation();
		open.value = !open.value;
	};

	// Don't render if not logged in (optional, depending on your auth flow)
	if (!user.value) return null;

	return (
		<div class='nav-bar-user__profile' ref={rootRef}>
			<button
				type='button'
				class={`nav-bar-user__profile__btn ${open.value ? 'active' : ''}`}
				onClick={handleButtonClick}
			>
				<div class='nav-bar-user__profile__btn__img'>
					{user.value.avatarUrl
						? <img src={user.value.avatarUrl} alt='Profile' />
						: (
							<div class='nav-bar-user__profile__btn__placeholder'>
								<IconUser size={20} />
							</div>
						)}
				</div>
			</button>

			{open.value && (
				<div
					class='nav-bar-user__profile__dropdown-wrapper'
					tabIndex={0}
					onClick={(event: MouseEvent) => event.stopPropagation()}
				>
					<NavBarUserProfileDropdown />
				</div>
			)}
		</div>
	);
}
