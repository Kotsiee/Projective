// #region Imports
import { OverlayProps } from '../../types/components/overlay.ts';
import { useIsMobile } from '../../hooks/useIsMobile.ts';
import { Modal } from './Modal.tsx';
import { Side } from './Side.tsx';
import { Mobile } from './Mobile.tsx';
// #endregion

/**
 * @function Overlay
 * @description The Polymorphic Controller for all popups.
 * Intelligently routes the unified OverlayProps to the correct presentation
 * style based on viewport, device overrides, and developer intents.
 */
export function Overlay(props: OverlayProps) {
	const {
		type = 'modal',
		forceMobile = false,
		preventAutoSwitch = false,
		...rest
	} = props;

	// The standard boundary for mobile swapping in the Projective design system
	const isMobile = useIsMobile(768);

	// #region 1. The Smart Switch Logic
	let renderType = type;

	if (forceMobile) {
		renderType = 'mobile';
	} else if (isMobile && !preventAutoSwitch) {
		renderType = 'mobile';
	}
	// #endregion

	// #region 2. Dynamic Rendering
	switch (renderType) {
		case 'mobile':
			// Automatically injects the iOS-style bottom sheet
			return (
				<Mobile
					type={type}
					forceMobile={forceMobile}
					preventAutoSwitch={preventAutoSwitch}
					{...rest}
				/>
			);
		case 'side':
			// Reverts to the Side Drawer
			return (
				<Side
					type={type}
					forceMobile={forceMobile}
					preventAutoSwitch={preventAutoSwitch}
					{...rest}
				/>
			);
		case 'modal':
		default:
			// The desktop standard
			return (
				<Modal
					type={type}
					forceMobile={forceMobile}
					preventAutoSwitch={preventAutoSwitch}
					{...rest}
				/>
			);
	}
	// #endregion
}
