/**
 * Global cache to prevent DOM thrashing during 60FPS PIXI renders.
 * Keys are formatted as `${themeMode}:${varName}` to support dynamic theme toggling.
 */
const colorCache = new Map<string, number>();

/**
 * Resolves a CSS variable (e.g., "--primary") to a Hex number (0xffffff).
 * Uses a hidden DOM element to force the browser to evaluate nested var() and calc()
 * statements, safely converting them into absolute RGB values.
 */
export function getThemeColor(varName: string): number {
	if (typeof window === 'undefined') return 0x000000;

	// Determine current theme to invalidate cache correctly if user switches to Dark Mode
	const theme = document.documentElement.getAttribute('data-theme') || 'light';
	const cacheKey = `${theme}:${varName}`;

	if (colorCache.has(cacheKey)) {
		return colorCache.get(cacheKey)!;
	}

	// Create a temporary element to force browser CSS evaluation
	const tempEl = document.createElement('div');
	tempEl.style.color = `var(${varName})`;
	tempEl.style.display = 'none';
	document.body.appendChild(tempEl);

	// The browser automatically resolves hsl() and var() into standard rgb() format for the 'color' property
	const computedColor = getComputedStyle(tempEl).color;

	// Cleanup
	document.body.removeChild(tempEl);

	let result = 0x22d3ee; // Default cyan fallback

	// Parse the clean rgb(r, g, b) string
	if (computedColor.startsWith('rgb')) {
		const match = computedColor.match(/\d+/g);
		if (match && match.length >= 3) {
			const [r, g, b] = match.map(Number);
			result = (r << 16) + (g << 8) + b;
		}
	}

	// Cache the hex value so subsequent render frames are instant
	colorCache.set(cacheKey, result);

	return result;
}
