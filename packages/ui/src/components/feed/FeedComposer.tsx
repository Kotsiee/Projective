import { ComponentChildren } from 'preact';
import { IconArticle, IconPhoto, IconSparkles } from '@tabler/icons-preact';
import '../../styles/components/feed-composer.css';

/* #region Types */
export interface FeedComposerAction {
	key: string;
	label: string;
	icon?: ComponentChildren;
}

export interface FeedComposerProps {
	avatarUrl?: string | null;
	displayName?: string | null;
	/** @default 'Share an insight or update…' */
	placeholder?: string;
	/**
	 * Un-activated by default — this lays the visual ground for the upcoming article/post feature
	 * without wiring anything up. When true the surface is inert and shows the "coming soon" tag.
	 * @default true
	 */
	disabled?: boolean;
	/** Inert affordance chips. Defaults to Write / Media / Insight. */
	actions?: FeedComposerAction[];
	/** @default 'Coming soon' */
	comingSoonLabel?: string;
	class?: string;
	className?: string;
}
/* #endregion */

const DEFAULT_ACTIONS: FeedComposerAction[] = [
	{ key: 'write', label: 'Write', icon: <IconArticle size={16} stroke={1.9} /> },
	{ key: 'media', label: 'Media', icon: <IconPhoto size={16} stroke={1.9} /> },
	{ key: 'insight', label: 'Insight', icon: <IconSparkles size={16} stroke={1.9} /> },
];

/**
 * @function FeedComposer
 * @description The premium, intentionally un-activated "Share an insight or update…" header box that
 * sits atop the feed to foreshadow the LinkedIn-style article/post layer. Renders the composer chrome
 * — avatar, faux input, action chips, a "coming soon" tag — but is inert (aria-disabled) so it reads
 * as a promise, not a broken control.
 */
export function FeedComposer(props: FeedComposerProps) {
	const {
		avatarUrl,
		displayName,
		placeholder = 'Share an insight or update…',
		disabled = true,
		actions = DEFAULT_ACTIONS,
		comingSoonLabel = 'Coming soon',
		class: klass,
		className,
	} = props;

	const initial = (displayName?.trim()?.[0] ?? '?').toUpperCase();
	const classes = [
		'feed-composer',
		disabled && 'feed-composer--disabled',
		klass,
		className,
	].filter(Boolean).join(' ');

	return (
		<div class={classes} aria-disabled={disabled ? 'true' : undefined}>
			<div class='feed-composer__top'>
				<span class='feed-composer__avatar' aria-hidden='true'>
					{avatarUrl ? <img src={avatarUrl} alt='' /> : <span>{initial}</span>}
				</span>
				<div class='feed-composer__field' role='textbox' aria-readonly='true' tabIndex={-1}>
					<span class='feed-composer__placeholder'>{placeholder}</span>
				</div>
				{disabled && <span class='feed-composer__soon'>{comingSoonLabel}</span>}
			</div>
			<div class='feed-composer__actions'>
				{actions.map((a) => (
					<span key={a.key} class='feed-composer__chip' aria-hidden='true'>
						{a.icon}
						<span>{a.label}</span>
					</span>
				))}
			</div>
		</div>
	);
}

export default FeedComposer;
