import { IconButton } from '@projective/ui';
import { IconShoppingCart } from '@tabler/icons-preact';
import { cartItemCount, cartStatus } from '../state/cart.ts';
import '../styles/components/header/basket.css';

/**
 * @island NavigationBasket
 * @description Header basket/cart action. Reactively reads the shared
 * {@link cartItemCount}/{@link cartStatus} signals to render an unread-style
 * count badge, and routes to the centralized checkout layout on click.
 *
 * @returns {preact.JSX.Element} A basket icon button with an optional count badge.
 */
export default function NavigationBasket() {
	// #region Reactive reads
	const count = cartItemCount.value;
	const isActive = cartStatus.value === 'active';
	// #endregion

	// #region Handlers
	const goToCart = () => {
		globalThis.location.href = '/dashboard/services/cart';
	};
	// #endregion

	return (
		<div class='navigation__basket' data-status={cartStatus.value}>
			<IconButton
				aria-label='Basket'
				className='navigation__basket__button'
				rounded
				variant='secondary'
				onClick={goToCart}
			>
				<IconShoppingCart />
			</IconButton>
			{isActive && (
				<span class='navigation__basket__badge' aria-hidden='true'>
					{count > 99 ? '99+' : count}
				</span>
			)}
		</div>
	);
}
