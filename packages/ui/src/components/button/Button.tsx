/* #region Imports */
import { Signal } from '@preact/signals';
import { IconLoader2 } from '@tabler/icons-preact';

import '../../styles/components/button.css';
import { ButtonProps } from '../../types/components/button.ts';
import { useRipple } from '../../hooks/useRipple.ts';
import { ButtonBadge } from './ButtonBadge.tsx';
/* #endregion */

/**
 * @function Button
 * @description A multi-variant, accessible button component that supports polymorphism, loading states, and ripple effects.
 */
export function Button(props: ButtonProps) {
	// #region 1. Destructuring & Logic
	const {
		children,
		variant = 'primary',
		size = 'medium',
		loading = false,
		disabled = false,
		fullWidth = false,
		// Modifiers
		ghost = false,
		rounded = false,
		outlined = false,

		startIcon,
		endIcon,
		badge,
		id,
		className,
		style,
		href,
		'f-partial': fPartial,
		onClick,
		...rest
	} = props;

	const { ripples, addRipple } = useRipple();
	const isLoading = loading instanceof Signal ? loading.value : loading;
	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;

	const classes = [
		'btn',
		`btn--${variant}`,
		`btn--${size}`,
		// Modifiers
		outlined && 'btn--outline',
		ghost && 'btn--ghost',
		rounded && 'btn--rounded',
		// States
		isLoading && 'btn--loading',
		isDisabled && 'btn--disabled',
		fullWidth && 'btn--full-width',
		className,
	].filter(Boolean).join(' ');
	// #endregion

	// #region 2. Handlers
	const handleClick = (e: MouseEvent) => {
		if (isDisabled || isLoading) {
			e.preventDefault();
			return;
		}
		// Ghost/Link usually subtle, others need ripple
		if (variant !== 'link') addRipple(e);
		onClick?.(e);
	};
	// #endregion

	// #region 3. Render Helpers
	const renderContent = () => (
		<span className='btn__content'>
			{isLoading && <IconLoader2 className='btn__spinner' size={18} />}
			{!isLoading && startIcon && <span className='btn__icon'>{startIcon}</span>}
			<span className='btn__label'>{children}</span>
			{!isLoading && endIcon && <span className='btn__icon'>{endIcon}</span>}
			{badge && (
				<ButtonBadge variant={variant === 'danger' ? 'neutral' : 'primary'}>
					{badge}
				</ButtonBadge>
			)}
		</span>
	);

	const renderRipples = () => (
		ripples.value.map((r) => (
			<span key={r.id} className='btn__ripple' style={{ left: r.x, top: r.y }} />
		))
	);
	// #endregion

	// #region 4. Render (Polymorphic)
	if (href) {
		return (
			<a
				href={href}
				f-partial={fPartial}
				className={classes}
				style={style}
				onClick={handleClick}
				role='button'
				{...rest}
			>
				{renderContent()}
				{renderRipples()}
			</a>
		);
	}

	return (
		<button
			type={props.htmlType || 'button'}
			className={classes}
			style={style}
			disabled={isDisabled}
			onClick={handleClick}
			{...rest}
		>
			{renderContent()}
			{renderRipples()}
		</button>
	);
	// #endregion
}
