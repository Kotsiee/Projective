import { SplitterPaneProps } from '../../types/components/splitter';

export function SplitterPane(
	{ children, className, style }: SplitterPaneProps,
) {
	return (
		<div className={`splitter__pane ${className || ''}`} style={style}>
			{children}
		</div>
	);
}
