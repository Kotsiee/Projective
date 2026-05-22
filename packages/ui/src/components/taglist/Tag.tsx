// apps/web/packages/ui/components/Tag.tsx

// #region Imports
import { CSSProperties } from 'preact';
import '../../styles/components/tag.css';
// #endregion

export interface TagProps {
	children: preact.ComponentChildren;
	size?: 'small' | 'medium' | 'large';
	color?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'neutral';
	variant?: 'solid' | 'outline' | 'subtle';
	rounded?: boolean; // New Prop
	fontSize?: string;
	className?: string;
	onClick?: (e: MouseEvent) => void;
	style?: CSSProperties;
}

export function Tag(props: TagProps) {
	const {
		children,
		size = 'medium',
		color = 'secondary',
		variant = 'subtle',
		rounded = false,
		fontSize,
		className,
		onClick,
		style,
		...rest
	} = props;

	const classes = [
		'tag',
		`tag--${size}`,
		`tag--color-${color}`,
		`tag--variant-${variant}`,
		rounded && 'tag--rounded',
		onClick && 'tag--interactive',
		className,
	].filter(Boolean).join(' ');

	const inlineStyle = fontSize ? { ...style, fontSize } : style;

	return (
		<span
			className={classes}
			style={inlineStyle}
			onClick={onClick}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
			{...rest}
		>
			<span className='tag__label'>{children}</span>
		</span>
	);
}
