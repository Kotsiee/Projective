import '../../styles/components/header/header.css';
import { Icon, Logo } from '@projective/ui';
import NavigationHeaderSearch from './search/search.tsx';
import NavigationHeaderUser from '../../islands/navigation-header-user.island.tsx';
import NavigationNotifications from '../../islands/navigation-notifications.island.tsx';
import NavigationBasket from '../../islands/navigation-basket.island.tsx';

/**
 * @component NavigationHeader
 * @description Desktop header shell. Hosts the logo, global search, and the live
 * header action islands: notifications hub, basket/cart action, and the user
 * account dropdown.
 *
 * @returns {preact.JSX.Element} The fixed desktop navigation header.
 */
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
					<NavigationNotifications />
					<NavigationBasket />
					<NavigationHeaderUser />
				</div>
			</div>
		</header>
	);
}
