import { ComponentChildren, JSX } from 'preact';
import { Signal } from '@preact/signals';

export type SplitterDirection = 'horizontal' | 'vertical';

export interface SplitterProps {
	children: ComponentChildren;
	direction?: SplitterDirection;
	initialSizes?: number[];
	minPaneSize?: number;
	breakpoint?: number;
	className?: string;
	style?: JSX.CSSProperties;
	onResizeEnd?: (sizes: number[]) => void;
	onCollapse?: (index: number, collapsed: boolean) => void;
}

export interface SplitterPaneProps {
	children: ComponentChildren;
	className?: string;
	style?: JSX.CSSProperties;
	minSize?: number;
	maxSize?: number;
	collapsible?: boolean;
	defaultCollapsed?: boolean;
	ariaLabel?: string;
}

export interface SplitterGutterProps {
	index: number;
	direction: SplitterDirection;
}

export interface SplitterContextValue {
	direction: SplitterDirection;
	sizes: Signal<number[]>;
	startResize: (index: number, clientX: number, clientY: number) => void;
	// New: Generalized move handler for keyboard
	moveSplitter: (index: number, deltaPercent: number) => void;
	toggleCollapse: (index: number) => void;
	isResizing: Signal<boolean>;
}
