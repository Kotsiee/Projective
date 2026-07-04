import { effect, signal } from '@preact/signals';

// #region Types & Constants
/** The two concrete themes the document can resolve to. */
export type ThemeName = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const SYSTEM_QUERY = '(prefers-color-scheme: dark)';
// #endregion

// #region Reactive State
/**
 * The currently applied theme. An `effect` mirrors this onto
 * `document.documentElement[data-theme]`, so any consumer can simply read/write
 * `theme.value` and the DOM stays in sync.
 *
 * Initial value is `'dark'` to match SSR output; on the client it is immediately
 * reconciled to either the persisted override or the OS preference below.
 */
export const theme = signal<ThemeName>('dark');

/**
 * Tracks whether the user has *explicitly* chosen a theme. While `false`, the app
 * transparently follows the OS `prefers-color-scheme`; the first explicit choice
 * (via {@link setTheme}/{@link toggleTheme}) latches this to `true` and persists.
 */
let userOverride = false;
// #endregion

// #region Public API
/**
 * Resolve the OS-level colour scheme.
 * @returns {ThemeName} `'dark'` when the system prefers dark, otherwise `'light'`.
 */
export function systemTheme(): ThemeName {
	if (typeof globalThis !== 'undefined' && typeof globalThis.matchMedia === 'function') {
		return globalThis.matchMedia(SYSTEM_QUERY).matches ? 'dark' : 'light';
	}
	return 'dark';
}

/**
 * Explicitly set (and persist) the active theme, marking it as a user override so
 * the app stops following the OS preference.
 * @param {ThemeName} next - The theme to apply.
 */
export function setTheme(next: ThemeName): void {
	userOverride = true;
	theme.value = next;
	try {
		localStorage.setItem(STORAGE_KEY, next);
	} catch {
		// Storage may be unavailable (private mode / SSR) — ignore.
	}
}

/**
 * Toggle between light and dark, latching the result as an explicit override.
 */
export function toggleTheme(): void {
	setTheme(theme.value === 'light' ? 'dark' : 'light');
}

/**
 * Clear any explicit override and revert to following the OS preference.
 */
export function matchSystemTheme(): void {
	userOverride = false;
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// ignore
	}
	theme.value = systemTheme();
}
// #endregion

// #region Client Bootstrap
if (typeof window !== 'undefined') {
	// 1. Seed from an explicit override if present, else the OS preference.
	const saved = localStorage.getItem(STORAGE_KEY);
	if (saved === 'light' || saved === 'dark') {
		userOverride = true;
		theme.value = saved;
	} else {
		theme.value = systemTheme();
	}

	// 2. Reflect the signal onto the document reactively.
	effect(() => {
		document.documentElement.setAttribute('data-theme', theme.value);
	});

	// 3. Follow live OS changes until the user makes an explicit choice.
	globalThis.matchMedia(SYSTEM_QUERY).addEventListener('change', (e) => {
		if (!userOverride) theme.value = e.matches ? 'dark' : 'light';
	});
}
// #endregion
