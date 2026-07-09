import { ComponentChildren, CSSProperties } from 'preact';
import '../../styles/components/glass-panel.css';

export interface GlassPanelProps {
	/** Optional eyebrow / section title rendered in the panel header. */
	title?: ComponentChildren;
	/** Secondary text under the title. */
	subtitle?: ComponentChildren;
	/** Trailing header slot (buttons, counts, filters). */
	actions?: ComponentChildren;
	/** Elevation + frost intensity. `strong` reads as a primary surface. @default 'panel' */
	tone?: 'panel' | 'strong';
	/** Removes body padding for edge-to-edge content (lists, tables). */
	flush?: boolean;
	class?: string;
	className?: string;
	style?: CSSProperties;
	children?: ComponentChildren;
}

/**
 * @function GlassPanel
 * @description The workspace's base glassmorphism surface: a frosted, hairline-bordered
 * container with a soft premium sheen. All colours are palette tokens so it tracks
 * light/dark automatically. Compose the roster, activity feed, quick actions, and metric
 * grid on top of it.
 */
export function GlassPanel(props: GlassPanelProps) {
	const {
		title,
		subtitle,
		actions,
		tone = 'panel',
		flush = false,
		class: klass,
		className,
		style,
		children,
	} = props;

	const classes = [
		'glass-panel',
		`glass-panel--${tone}`,
		flush && 'glass-panel--flush',
		klass,
		className,
	].filter(Boolean).join(' ');

	const hasHeader = title || subtitle || actions;

	return (
		<section class={classes} style={style}>
			{hasHeader && (
				<header class='glass-panel__header'>
					<div class='glass-panel__heading'>
						{title && <h2 class='glass-panel__title'>{title}</h2>}
						{subtitle && <p class='glass-panel__subtitle'>{subtitle}</p>}
					</div>
					{actions && <div class='glass-panel__actions'>{actions}</div>}
				</header>
			)}
			<div class='glass-panel__body'>{children}</div>
		</section>
	);
}

export default GlassPanel;
