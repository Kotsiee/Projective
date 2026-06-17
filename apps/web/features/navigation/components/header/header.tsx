import '../../styles/components/header/header.css';
import { Icon, IconButton, Logo } from '@projective/ui';
import { IconBell } from '@tabler/icons-preact';
import NavigationHeaderSearch from './search/search.tsx';
import NavigationHeaderUser from './user/user.tsx';

export default function NavigationHeader() {
	return (
		<header class='navigation__header'>
			<a href='/' aria-label='Home' class='navigation__logo'>
				<Icon class='navigation__logo__icon' size={32}>
					<Logo color='var(--primary)' />
				</Icon>
			</a>
			<div class='navigation__content'>
				<NavigationHeaderSearch />
				<div class='navigation__actions'>
					<IconButton
						aria-label='notifications'
						className='navigation__notification'
						rounded
						variant='secondary'
					>
						<IconBell />
					</IconButton>
					<NavigationHeaderUser />
				</div>
			</div>
		</header>
	);
}
