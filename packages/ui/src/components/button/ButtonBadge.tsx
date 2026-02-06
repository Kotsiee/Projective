import { ButtonBadgeProps } from '../../types/components/button.ts';

/**
 * @function ButtonBadge
 * @description A small visual indicator for counts or status within buttons.
 */
export function ButtonBadge({ children, variant = 'primary', className }: ButtonBadgeProps) {
	return (
		<span className={`btn__badge btn__badge--${variant} ${className || ''}`}>
			{children}
		</span>
	);
}
