import { JSX } from 'preact';
import '../styles/wrappers/adornment-wrapper.css';

export interface AdornmentWrapperProps extends JSX.HTMLAttributes<HTMLDivElement> {
	children?: JSX.Element | string;
	position: 'prefix' | 'suffix';
}

export function AdornmentWrapper(props: AdornmentWrapperProps) {
	const { children, position, className, onClick, ...rest } = props;

	if (!children) return null;

	const classes = [
		'field-adornment',
		`field-adornment--${position}`,
		(onClick || rest.onPointerDown) && 'field-adornment--interactive',
		className,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={classes} onClick={onClick} {...rest}>
			{children}
		</div>
	);
}
