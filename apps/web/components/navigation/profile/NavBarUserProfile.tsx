import '@styles/components/navigation/nav-bar-user-profile.css';
import NavBarUserProfileDropdown from './NavBarUserProfileDropdown.tsx';
import { signal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';

const open = signal(false);

export default function NavBarUserProfile() {
	const rootRef = useRef<HTMLDivElement | null>(null);

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
		console.log('huh');
		event.stopPropagation();
		open.value = !open.value;
	};

	return (
		<div class='nav-bar-user__profile' ref={rootRef}>
			<button
				type='button'
				class='nav-bar-user__profile__btn'
				onClick={handleButtonClick}
			>
				<div class='nav-bar-user__profile__btn__img'>
					<img src='https://placehold.co/50x50' />
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
