import { JSX } from 'preact';

interface RgbColor {
	r: number;
	g: number;
	b: number;
	a: number;
}

/**
 * Parses Hex, RGB, and HSL strings into an RGBA object.
 * Ignores CSS named colors (e.g., 'red', 'green').
 */
export function parseColorToRgb(color: string): RgbColor | null {
	const c = color.trim().toLowerCase();

	// 1. Hex
	if (c.startsWith('#')) {
		let hex = c.slice(1);
		if (hex.length === 3) hex = hex.split('').map((char) => char + char).join('');
		if (hex.length === 6 || hex.length === 8) {
			return {
				r: parseInt(hex.slice(0, 2), 16),
				g: parseInt(hex.slice(2, 4), 16),
				b: parseInt(hex.slice(4, 6), 16),
				a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
			};
		}
	}

	// 2. RGB(A)
	const rgbMatch = c.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
	if (rgbMatch) {
		return {
			r: parseInt(rgbMatch[1], 10),
			g: parseInt(rgbMatch[2], 10),
			b: parseInt(rgbMatch[3], 10),
			a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
		};
	}

	// 3. HSL(A)
	const hslMatch = c.match(/^hsla?\((\d+),\s*([\d.]+)%,\s*([\d.]+)%(?:,\s*([\d.]+))?\)$/);
	if (hslMatch) {
		const h = parseInt(hslMatch[1], 10) / 360;
		const s = parseFloat(hslMatch[2]) / 100;
		const l = parseFloat(hslMatch[3]) / 100;
		const a = hslMatch[4] ? parseFloat(hslMatch[4]) : 1;

		let r, g, b;
		if (s === 0) {
			r = g = b = l; // Achromatic
		} else {
			const hue2rgb = (p: number, q: number, t: number) => {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1 / 6) return p + (q - p) * 6 * t;
				if (t < 1 / 2) return q;
				if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
				return p;
			};
			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}
		return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a };
	}

	return null;
}

/**
 * Calculates relative luminance for contrast checking.
 */
export function getLuminance(r: number, g: number, b: number): number {
	const [R, G, B] = [r, g, b].map((c) => {
		c /= 255;
		return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Generates an inline style object for a given custom color and variant.
 */
export function generateTagTheme(
	color: string,
	variant: 'solid' | 'transparent',
): JSX.CSSProperties {
	const rgb = parseColorToRgb(color);
	if (!rgb) return {}; // Fall back to CSS defaults if invalid string

	if (variant === 'solid') {
		// Calculate contrast: if background is bright (luminance > 0.179), use black text, otherwise white.
		const isLight = getLuminance(rgb.r, rgb.g, rgb.b) > 0.179;
		const textColor = isLight ? '#000000' : '#ffffff';

		return {
			backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
			color: textColor,
			borderColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
		};
	} else {
		// Transparent mode: lowered opacity fill, slightly stronger border, solid text
		return {
			backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`,
			color: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
			borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
		};
	}
}
