import { Icon, IconButton, Logo } from '@projective/ui';
import { IconMenu2, IconSearch } from '@tabler/icons-preact';
import { useUserContext } from '../../contexts/UserContext.tsx';
import '../../styles/components/header/header.mobile.css';

export default function NavigationMobileHeader() {
	const { isAuthenticated, user } = useUserContext();

	if (!isAuthenticated.value) {
		return (
			<header class='navigation__mobile__header--guest'>
				<IconButton
					variant='secondary'
					ghost
					className='navigation__mobile__menu-btn'
					rounded
					aria-label='Menu'
				>
					<IconMenu2 size={24} stroke={1.5} />
				</IconButton>

				<div class='navigation__mobile__logo'>
					<Icon class='navigation__mobile__logo-icon' size={24}>
						<Logo color='var(--primary)' />
					</Icon>
					<span class='navigation__mobile__logo-text'>projective</span>
				</div>

				<a href='/join' class='navigation__mobile__join'>
					Join
				</a>
			</header>
		);
	}

	return (
		<header class='navigation__mobile__header--user'>
			<div class='navigation__mobile__avatar'>
				<img
					src={user.value?.avatarUrl ||
						'https://www.mamp.one/wp-content/uploads/2024/09/image-resources2.jpg'}
					alt='User Avatar'
				/>
			</div>

			<div class='navigation__mobile__search'>
				<IconSearch class='navigation__mobile__search-icon' size={20} stroke={1.5} />
				<input
					type='text'
					class='navigation__mobile__search-input'
					placeholder='Find anything'
				/>
			</div>

			<a href='/' aria-label='Home' class='navigation__mobile__logo-user'>
				<Icon size={24}>
					<Logo />
				</Icon>
			</a>
		</header>
	);
}
