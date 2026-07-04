// #region Imports
import { createPortal } from 'preact/compat';
import { ComponentChildren } from 'preact';
import { useCallback, useRef, useState } from 'preact/hooks';
import '../../styles/components/tooltip.css';
// #endregion

// #region Types
/** Side of the trigger the tooltip bubble is anchored to. */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
	/** Text rendered inside the floating bubble. */
	label: string;
	/** Anchor side relative to the wrapped trigger. Defaults to `'top'`. */
	position?: TooltipPosition;
	/** When true the bubble never shows (e.g. an expanded sidebar with visible labels). */
	disabled?: boolean;
	/** The trigger element(s) the tooltip describes. */
	children: ComponentChildren;
	/** Optional extra class on the inline wrapper. */
	className?: string;
}

interface Coords {
	top: number;
	left: number;
}
// #endregion

/**
 * @function Tooltip
 * @description Accessible, portal-rendered tooltip. The bubble is teleported to
 * `document.body` and positioned with `position: fixed` from the trigger's live
 * bounding rect, so it can never be clipped by an ancestor's `overflow` (the exact
 * failure that hid collapsed side-nav tooltips) and layers cleanly via `--z-tooltip`.
 *
 * Positioning is computed lazily on `mouseenter`/`focusin` and torn down on
 * `mouseleave`/`focusout`, keeping the DOM free of an always-mounted bubble.
 *
 * @param {TooltipProps} props - Label, anchor side, disabled flag and trigger children.
 * @returns {preact.JSX.Element} The inline trigger wrapper plus a portaled bubble while active.
 */
export function Tooltip({
	label,
	position = 'top',
	disabled = false,
	children,
	className,
}: TooltipProps) {
	// #region State & Refs
	const triggerRef = useRef<HTMLSpanElement>(null);
	const [coords, setCoords] = useState<Coords | null>(null);
	// #endregion

	// #region Handlers
	const show = useCallback(() => {
		const el = triggerRef.current;
		if (!el || disabled) return;

		const rect = el.getBoundingClientRect();
		const gap = 8; // Breathing room between trigger and bubble.

		let top = 0;
		let left = 0;
		switch (position) {
			case 'right':
				top = rect.top + rect.height / 2;
				left = rect.right + gap;
				break;
			case 'left':
				top = rect.top + rect.height / 2;
				left = rect.left - gap;
				break;
			case 'top':
				top = rect.top - gap;
				left = rect.left + rect.width / 2;
				break;
			case 'bottom':
			default:
				top = rect.bottom + gap;
				left = rect.left + rect.width / 2;
				break;
		}

		setCoords({ top, left });
	}, [position, disabled]);

	const hide = useCallback(() => setCoords(null), []);
	// #endregion

	// #region Render
	const isVisible = !disabled && coords !== null && typeof document !== 'undefined';

	return (
		<span
			ref={triggerRef}
			className={`tooltip ${className ?? ''}`.trim()}
			onMouseEnter={show}
			onMouseLeave={hide}
			onFocusIn={show}
			onFocusOut={hide}
		>
			{children}
			{isVisible &&
				createPortal(
					<div
						role='tooltip'
						className={`tooltip__bubble tooltip__bubble--${position}`}
						style={{ top: `${coords!.top}px`, left: `${coords!.left}px` }}
					>
						{label}
					</div>,
					document.body,
				)}
		</span>
	);
	// #endregion
}
