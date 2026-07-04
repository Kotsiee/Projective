import CartShell from '@features/dashboard/cart/components/CartShell.tsx';

/**
 * Route: /dashboard/services/cart
 * Thin entry point for the centralized checkout/cart layout. Renders inside the
 * shared `(dashboard)` layout; all structure lives in {@link CartShell}.
 */
export default function CartPage() {
	return <CartShell />;
}
