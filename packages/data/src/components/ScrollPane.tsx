import { forwardRef } from 'preact/compat';
import type { CSSProperties, HTMLAttributes, Signalish } from 'preact';
import '../styles/scroll-pane.css';

export type ScrollPaneMode = 'container' | 'window';

interface ScrollPaneProps extends HTMLAttributes<HTMLDivElement> {
	children: preact.ComponentChildren;
	mode?: ScrollPaneMode;
}

export const ScrollPane = forwardRef<HTMLDivElement, ScrollPaneProps>(
	({ children, style, className, mode = 'container', ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={`scroll-pane scroll-pane--${mode} ${className ?? ''}`}
				style={style as Signalish<CSSProperties>}
				{...props}
			>
				{children}
			</div>
		);
	},
);
