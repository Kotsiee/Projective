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
	spin = false,
	className,
	style = {},
	...rest
}: IconProps) {
	const sizeStr = typeof size === 'number' ? `${size}px` : size;

	return (
		<span
			className={`icon-wrapper icon-wrapper--${color} ${spin ? 'icon-wrapper--spin' : ''} ${
				className || ''
			}`}
			style={{
				width: sizeStr,
				height: sizeStr,
				fontSize: sizeStr,
				...(style as CSSProperties),
			}}
			aria-hidden='true'
			{...rest}
		>
			{children}
		</span>
	);
}
