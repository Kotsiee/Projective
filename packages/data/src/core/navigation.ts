/**
 * @file navigation.ts
 * @description Client-navigation awareness for data-backed views.
 *
 * Fresh's partial / client-side navigation swaps only the matched `<Partial>` region and — by design
 * — keeps the state of islands that live OUTSIDE that region intact (the top navigation, the
 * middle-nav sidebar, etc. — see https://fresh.deno.dev "Island state is kept intact"). That is great
 * for preserving scroll position and form input, but it means a data list mounted in one of those
 * persistent regions never re-runs its mount effects on navigation. A `DataManager` created once via
 * `useMemo` therefore keeps its first-load snapshot forever and looks stale/empty until a full page
 * refresh rebuilds the whole tree.
 *
 * To close that gap we listen for every client navigation — Fresh drives them through
 * `history.pushState` / `history.replaceState`, and browser back/forward fires `popstate` — and let
 * subscribers revalidate. `useDataManager` subscribes so that ALL network-backed `DataDisplay` lists
 * refetch cleanly across SPA navigation, no hard refresh required.
 */

const NAV_EVENT = 'projective:navigate';
let patched = false;

/**
 * Monkey-patch `history.pushState` / `replaceState` (idempotently) so that programmatic client-side
 * navigations — the kind Fresh performs — emit a DOM event we can subscribe to. Guarded for SSR.
 */
function ensurePatched(): void {
	if (patched) return;
	if (typeof history === 'undefined' || typeof globalThis.dispatchEvent !== 'function') return;
	patched = true;

	const fire = () => globalThis.dispatchEvent(new Event(NAV_EVENT));

	for (const method of ['pushState', 'replaceState'] as const) {
		const original = history[method];
		if (typeof original !== 'function') continue;
		// deno-lint-ignore no-explicit-any
		history[method] = function (this: History, ...args: any[]) {
			const result = original.apply(this, args as any);
			fire();
			return result;
			// deno-lint-ignore no-explicit-any
		} as any;
	}
}

/**
 * Subscribe to client-side navigations. Returns an unsubscribe function.
 *
 * Safe to call unconditionally inside an island effect: during SSR (or any environment without
 * `history` / `addEventListener`) it is a no-op that returns a no-op cleanup.
 */
export function onNavigate(callback: () => void): () => void {
	if (typeof globalThis === 'undefined' || typeof globalThis.addEventListener !== 'function') {
		return () => {};
	}
	ensurePatched();
	globalThis.addEventListener(NAV_EVENT, callback);
	globalThis.addEventListener('popstate', callback);
	return () => {
		globalThis.removeEventListener(NAV_EVENT, callback);
		globalThis.removeEventListener('popstate', callback);
	};
}
