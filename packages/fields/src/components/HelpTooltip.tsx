import { JSX } from 'preact';
import { IconHelp } from '@tabler/icons-preact';
import '../styles/components/help-tooltip.css';

export interface HelpTooltipProps {
	/** The content to show in the tooltip */
	content: string | JSX.Element;
	/** Optional link to navigate to on click */
	href?: string;
	/** Optional override for the icon */
	icon?: JSX.Element;
	className?: string;
	style?: JSX.CSSProperties;
}

export function HelpTooltip({ content, href, icon, className, style }: HelpTooltipProps) {
	const Icon = icon || <IconHelp size={16} />;

	// If it's a link, we render an anchor tag
	if (href) {
		return (
			<a
				href={href}
				target='_blank'
				rel='noopener noreferrer'
				className={`help-tooltip ${className || ''}`}
				style={style}
				onClick={(e) => e.stopPropagation()} // Prevent triggering parent label clicks
			>
				<span className='help-tooltip__icon'>{Icon}</span>
				<span className='help-tooltip__popup'>
					{content}
					<span className='help-tooltip__arrow' />
				</span>
			</a>
		);
	}

	// Otherwise, just a span
	return (
		<span className={`help-tooltip ${className || ''}`} style={style}>
			<span className='help-tooltip__icon'>{Icon}</span>
			<span className='help-tooltip__popup'>
				{content}
				<span className='help-tooltip__arrow' />
			</span>
		</span>
	);
}
