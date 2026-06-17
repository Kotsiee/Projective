import { IconProps } from '../../types/components/icon.ts';
import '../../styles/components/icon.css';
import { CSSProperties } from 'preact';

/**
 * @function Icon
 * @description A unified wrapper for vector graphics. Normalizes sizing, colors,
 * and handles custom SVGs or Tabler icons identically.
 */
export function Icon({
	children,
	size = 24,
	color = 'inherit',
	strokeColor,
	fillColor,
	spin = false,
	className,
	style = {},
	...rest
}: IconProps) {
	const sizeStr = typeof size === 'number' ? `${size}px` : size;

	// Inject the custom colors as CSS variables if they are provided
	const customStyles = {
		width: sizeStr,
		height: sizeStr,
		fontSize: sizeStr,
		...(strokeColor ? { '--icon-stroke': strokeColor } : {}),
		...(fillColor ? { '--icon-fill': fillColor } : {}),
		...(style as Record<string, any>),
	} as CSSProperties;

	return (
		<span
			className={`icon-wrapper icon-wrapper--${color} ${spin ? 'icon-wrapper--spin' : ''} ${
				className || ''
			}`}
			style={customStyles}
			aria-hidden='true'
			{...rest}
		>
			{children}
		</span>
	);
}
