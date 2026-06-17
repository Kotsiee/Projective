import { ComponentChildren, HTMLAttributes } from 'preact';

export type IconColor =
	| 'primary'
	| 'secondary'
	| 'danger'
	| 'success'
	| 'warning'
	| 'muted'
	| 'inherit';

export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
	children?: ComponentChildren;
	size?: number | string;
	color?: IconColor;
	strokeColor?: string;
	fillColor?: string;
	spin?: boolean;
}
