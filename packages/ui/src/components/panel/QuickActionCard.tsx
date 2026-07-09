import { ComponentChildren } from 'preact';
import '../../styles/components/quick-action-card.css';
import { RippleSurface } from '../ripple/RippleSurface.tsx';

export interface QuickActionCardProps {
	/** Leading icon node (typically a `@tabler/icons-preact` element). */
	icon: ComponentChildren;
	title: string;
	description?: string;
	/** Accent tint for the icon chip + hover halo. @default 'primary' */
	accent?: 'primary' | 'mint' | 'violet' | 'amber';
	/** Renders as a link. Ignored when `onClick` is provided. */
	href?: string;
	onClick?: () => void;
	/** Dims + disables the action (e.g. gated behind a draft-completion step). */
	disabled?: boolean;
	className?: string;
}

/**
 * @function QuickActionCard
 * @description A compact, tap-to-ripple "action node" for operational shortcuts
 * (Invite Member, Quick-Project Draft…). Polymorphic — a link when `href` is set,
 * a button when `onClick` is. The premium ripple frame lights up on hover.
 */
export function QuickActionCard(props: QuickActionCardProps) {
	const { icon, title, description, accent = 'primary', href, onClick, disabled, className } =
		props;

	const classes = [
		'quick-action',
		`quick-action--${accent}`,
		disabled && 'quick-action--disabled',
		className,
	].filter(Boolean).join(' ');

	const body = (
		<>
			<span class='quick-action__icon' aria-hidden='true'>{icon}</span>
			<span class='quick-action__text'>
				<span class='quick-action__title'>{title}</span>
				{description && <span class='quick-action__desc'>{description}</span>}
			</span>
		</>
	);

	if (disabled) {
		return <div class={classes} aria-disabled='true'>{body}</div>;
	}

	return (
		<RippleSurface
			as={href ? 'a' : 'button'}
			href={href}
			premium
			class={classes}
			onClick={onClick}
			{...(href ? {} : { type: 'button' })}
		>
			{body}
		</RippleSurface>
	);
}

export default QuickActionCard;
