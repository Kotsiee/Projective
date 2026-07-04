import { computed, signal } from '@preact/signals';

// #region Types
/** Coarse lifecycle of the active order/basket, derived from item count. */
export type CartStatus = 'empty' | 'active';
// #endregion

// #region Signals
/**
 * Number of items currently in the user's basket. Module-level so any island in
 * the navigation shell (or elsewhere) can read/update the same reactive source.
 */
export const cartItemCount = signal<number>(0);

/**
 * Derived order status. `'empty'` when nothing is in the basket, otherwise
 * `'active'` — consumed by the basket header action to toggle its badge/emphasis.
 */
export const cartStatus = computed<CartStatus>(() => cartItemCount.value > 0 ? 'active' : 'empty');
// #endregion

// #region Actions
/**
 * Replace the basket item count (clamped at zero).
 * @param {number} count - The new item count.
 */
export function setCartCount(count: number): void {
	cartItemCount.value = Math.max(0, Math.floor(count));
}
// #endregion
