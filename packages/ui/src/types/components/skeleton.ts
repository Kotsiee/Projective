import { CSSProperties } from 'preact';

/* #region 1. Definitions */
/**
 * Defines the structural shape and semantic purpose of the skeleton.
 */
export type SkeletonVariant =
	| 'text'
	| 'multiline'
	| 'avatar'
	| 'image'
	| 'button'
	| 'badge'
	| 'icon';

/**
 * Defines the loading animation style.
 */
export type SkeletonAnimation = 'pulse' | 'wave' | 'none';
/* #endregion */

/* #region 2. Props Interface */
/**
 * Properties for the Skeleton component.
 */
export interface SkeletonProps {
	/**
	 * The visual variant of the skeleton.
	 * @default 'text'
	 */
	variant?: SkeletonVariant;

	/**
	 * The animation style to indicate loading.
	 * @default 'pulse'
	 */
	animation?: SkeletonAnimation;

	/**
	 * Explicit width (e.g., '100%', '50px', 100).
	 * Defaults to appropriate values based on the variant.
	 */
	width?: string | number;

	/**
	 * Explicit height (e.g., '100%', '50px', 100).
	 * Defaults to appropriate values based on the variant.
	 */
	height?: string | number;

	/**
	 * Number of text lines to generate.
	 * Only applicable when `variant="multiline"`.
	 * @default 3
	 */
	lines?: number;

	/**
	 * Optional class name for custom overrides.
	 */
	className?: string;

	/**
	 * Inline style overrides.
	 */
	style?: CSSProperties;
}
/* #endregion */
