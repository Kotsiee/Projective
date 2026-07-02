import { ComponentChildren, CSSProperties } from 'preact';

// #region 1. Overlay Definitions
export type OverlayType = 'modal' | 'mobile' | 'side';
export type OverlaySidePosition = 'left' | 'right';
// #endregion

// #region 2. API Contract
/**
 * @interface OverlayProps
 * @description The unified contract for the Polymorphic Overlay controller and its sub-components.
 */
export interface OverlayProps {
	/** Controls the visibility of the overlay */
	isOpen: boolean;

	/** The intended base style. Defaults to 'modal' */
	type?: OverlayType;

	/** Positional alignment. Only applies if type is 'side' */
	side?: OverlaySidePosition;

	/** Text displayed in the header */
	title?: string;

	/** Explicit width of the overlay (Modal/Side primarily) */
	width?: string | number;

	/** Explicit height of the overlay (Modal/Side primarily) */
	height?: string | number;

	/** If true, the modal expands to fill the entire viewport */
	fullScreen?: boolean;

	/** If true, disables the automatic switch to the Mobile Drawer on small screens */
	preventAutoSwitch?: boolean;

	/** If true, forces the Mobile Drawer presentation regardless of viewport size */
	forceMobile?: boolean;

	/** Height stops for the Mobile Drawer (0.0 to 1.0). e.g., [0.5, 1] */
	snapPoints?: number[];

	/** Callback triggered by ESC key, backdrop click, or the close button */
	onClose?: () => void;

	/** If true, clicking the backdrop will NOT trigger onClose */
	isSticky?: boolean;

	children: ComponentChildren;
	className?: string;
	style?: CSSProperties;
}

/**
 * @interface OverlayPortalProps
 * @description Internal props for the base structural wrapper.
 */
export interface OverlayPortalProps {
	isOpen: boolean;
	onClose?: () => void;
	isSticky?: boolean;
	children: ComponentChildren;
	className?: string;
}
// #endregion
