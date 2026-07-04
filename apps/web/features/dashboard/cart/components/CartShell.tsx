import '../styles/cart.css';

/** Static placeholder line items — replaced by real basket contents in Phase 2. */
const PLACEHOLDER_ITEMS = Array.from({ length: 3 });

/**
 * @component CartShell
 * @description Zero-logic structural shell for the centralized checkout/cart
 * layout. Presents a line-item checklist alongside a summary panel; totals and
 * checkout behaviour are wired up in Phase 2.
 *
 * @returns {preact.JSX.Element} The cart layout scaffold.
 */
export default function CartShell() {
	return (
		<section class='cart'>
			<header class='cart__header'>
				<h1 class='cart__title'>Your cart</h1>
				<p class='cart__subtitle'>Review services before checkout.</p>
			</header>

			<div class='cart__layout'>
				<ul class='cart__items'>
					{PLACEHOLDER_ITEMS.map((_, i) => (
						<li key={i} class='cart__item'>
							<span class='cart__item-thumb' aria-hidden='true' />
							<div class='cart__item-body'>
								<span class='cart__item-title'>Placeholder service</span>
								<span class='cart__item-text'>
									Structural line item — checkout logic lands in Phase 2.
								</span>
							</div>
							<span class='cart__item-price'>—</span>
						</li>
					))}
				</ul>

				<aside class='cart__summary'>
					<h2 class='cart__summary-title'>Summary</h2>
					<div class='cart__summary-row'>
						<span>Subtotal</span>
						<span>—</span>
					</div>
					<div class='cart__summary-row'>
						<span>Fees</span>
						<span>—</span>
					</div>
					<div class='cart__summary-row cart__summary-row--total'>
						<span>Total</span>
						<span>—</span>
					</div>
					<button type='button' class='cart__checkout' disabled>Checkout</button>
				</aside>
			</div>
		</section>
	);
}
