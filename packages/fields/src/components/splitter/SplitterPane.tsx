import { SplitterPaneProps } from '../../types/components/splitter.ts';

export function SplitterPane({ children, className, style }: SplitterPaneProps) {
	return (
		<div className={`splitter__pane ${className || ''}`} style={style}>
			{children}
		</div>
	);
}
