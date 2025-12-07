import { JSX } from 'preact';
import '../styles/wrappers/adornment-wrapper.css';

interface AdornmentWrapperProps {
	children?: JSX.Element | string;
	position: 'prefix' | 'suffix';
	onClick?: (e: MouseEvent) => void;
	className?: string;
}

export function AdornmentWrapper(props: AdornmentWrapperProps) {
	if (!props.children) return null;

	const classes = [
		'field-adornment',
		`field-adornment--${props.position}`,
		props.onClick && 'field-adornment--interactive',
		props.className,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={classes} onClick={props.onClick}>
			{props.children}
		</div>
	);
}
