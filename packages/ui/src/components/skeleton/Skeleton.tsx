/* #region Imports */
import '../../styles/components/skeleton.css';
import { SkeletonProps } from '../../types/components/skeleton.ts';
/* #endregion */

/**
 * @function Skeleton
 * @description A placeholder component used to indicate loading states.
 * Supports various shapes and animations mapping to common UI primitives.
 */
export function Skeleton(props: SkeletonProps) {
	// #region 1. Logic & Destructuring
	const {
		variant = 'text',
		animation = 'pulse',
		width,
		height,
		lines = 3,
		className,
		style,
		...rest
	} = props;

	const classes = [
		'skeleton',
		variant !== 'multiline' && `skeleton--${variant}`,
		animation !== 'none' && `skeleton--${animation}`,
		className,
	].filter(Boolean).join(' ');

	// Convert numeric dimensions to pixels
	const parseDimension = (val?: string | number) => typeof val === 'number' ? `${val}px` : val;

	const inlineStyle = {
		...style,
		width: parseDimension(width),
		height: parseDimension(height),
	};
	// #endregion

	// #region 2. Renderers
	if (variant === 'multiline') {
		return (
			<div
				className={`skeleton-group ${className || ''}`}
				style={style}
				aria-hidden='true'
				{...rest}
			>
				{Array.from({ length: Math.max(1, lines) }).map((_, i) => {
					// Make the last line naturally shorter unless a specific width was enforced
					const isLast = i === lines - 1;
					const lineWidth = isLast && !width ? '70%' : '100%';

					return (
						<div
							key={i}
							className={[
								'skeleton',
								'skeleton--text',
								animation !== 'none' && `skeleton--${animation}`,
							].filter(Boolean).join(' ')}
							style={{
								height: parseDimension(height),
								width: parseDimension(width) || lineWidth,
								marginBottom: isLast ? 0 : '0.5em',
							}}
						/>
					);
				})}
			</div>
		);
	}

	return (
		<div
			className={classes}
			style={inlineStyle}
			aria-hidden='true'
			{...rest}
		/>
	);
	// #endregion
}
