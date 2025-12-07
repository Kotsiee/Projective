import { Signal } from '@preact/signals';
import '../styles/wrappers/skeleton-wrapper.css';

interface SkeletonWrapperProps {
	loading?: boolean | Signal<boolean>;
	variant?: 'rect' | 'circle' | 'pill';
	width?: string | number;
	height?: string | number;
	className?: string;
}

export function SkeletonWrapper(props: SkeletonWrapperProps) {
	const isLoading = props.loading instanceof Signal ? props.loading.value : props.loading;

	if (!isLoading) return null;

	const classes = [
		'field-skeleton',
		'field-skeleton--pulse',
		`field-skeleton--${props.variant || 'rect'}`,
		props.className,
	]
		.filter(Boolean)
		.join(' ');

	const style = {
		width: props.width,
		height: props.height,
	};

	return <div className={classes} style={style} aria-hidden='true' />;
}
