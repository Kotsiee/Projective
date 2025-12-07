import { createContext, toChildArray, VNode } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import {
	SplitterContextValue,
	SplitterPaneProps,
	SplitterProps,
} from '../../types/components/splitter.ts';
import { useSplitter } from '../../hooks/useSplitter.ts';
import { SplitterGutter } from './SplitterGutter.tsx';

const SplitterContext = createContext<SplitterContextValue | null>(null);

export function useSplitterContext() {
	const ctx = useContext(SplitterContext);
	if (!ctx) throw new Error('Splitter Sub-components must be within a <Splitter>');
	return ctx;
}

export function Splitter({
	children,
	direction = 'horizontal',
	initialSizes,
	minPaneSize = 10,
	breakpoint = 0,
	className,
	style,
	onResizeEnd,
}: SplitterProps) {
	// 1. Process Children to extract configs
	const validChildren = toChildArray(children).filter(Boolean) as VNode<SplitterPaneProps>[];
	const count = validChildren.length;

	// Extract constraints to pass to hook
	const paneConfigs = useMemo(() => {
		return validChildren.map((child) => ({
			minSize: child.props.minSize,
			maxSize: child.props.maxSize,
			collapsible: child.props.collapsible,
			defaultCollapsed: child.props.defaultCollapsed,
		}));
	}, [validChildren]);

	// 2. Hook
	const {
		sizes,
		isResizing,
		containerRef,
		startResize,
		moveSplitter, // <-- Now destructured
		toggleCollapse,
	} = useSplitter({
		count,
		direction,
		initialSizes,
		minPaneSize,
		paneConfigs,
		onResizeEnd,
	});

	// 3. Responsive Logic
	const [isResponsiveStack, setResponsiveStack] = useState(false);

	useEffect(() => {
		if (!breakpoint || !containerRef.current) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const width = entry.contentRect.width;
				setResponsiveStack(width < breakpoint);
			}
		});

		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, [breakpoint]);

	const activeDirection = isResponsiveStack ? 'vertical' : direction;

	return (
		<SplitterContext.Provider
			value={{
				direction: activeDirection,
				sizes,
				startResize,
				moveSplitter, // <-- Passed to context
				toggleCollapse,
				isResizing,
			}}
		>
			<div
				ref={containerRef}
				className={`splitter splitter--${activeDirection} ${
					isResizing.value ? 'splitter--resizing' : ''
				} ${className || ''}`}
				style={style}
			>
				{validChildren.map((child, index) => {
					const isLast = index === count - 1;
					// Force 100% size if stacked, else use calculated percentage
					const sizeStyle = isResponsiveStack
						? { flexBasis: 'auto', flexGrow: 1 }
						: { flexBasis: `${sizes.value[index]}%` };

					// Hide if collapsed (size 0)
					const isCollapsed = !isResponsiveStack && sizes.value[index] === 0;

					return (
						<>
							<div
								className={`splitter__pane-wrapper ${
									isCollapsed ? 'splitter__pane-wrapper--collapsed' : ''
								}`}
								style={sizeStyle}
							>
								{child}
							</div>

							{!isLast && !isResponsiveStack && (
								<SplitterGutter index={index} direction={activeDirection} />
							)}
							{/* In stack mode, we might want a simple border instead of a resize handle */}
							{!isLast && isResponsiveStack && <div className='splitter__divider-stack' />}
						</>
					);
				})}
			</div>
		</SplitterContext.Provider>
	);
}
