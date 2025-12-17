import { forwardRef } from 'preact/compat';
import type { CSSProperties, HTMLAttributes, JSX, Signalish } from 'preact';

interface ScrollPaneProps extends HTMLAttributes<HTMLDivElement> {
	children: preact.ComponentChildren;
}

export const ScrollPane = forwardRef<HTMLDivElement, ScrollPaneProps>(
	({ children, style, className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={`scroll-pane ${className ?? ''}`}
				style={{
					overflowY: 'auto',
					overflowX: 'hidden',
					position: 'relative',
					height: '100%', // Must fill parent to scroll
					width: '100%',
					contain: 'strict', // Browser optimization
					...style as Signalish<CSSProperties>,
				}}
				{...props}
			>
				{children}
			</div>
		);
	},
);
