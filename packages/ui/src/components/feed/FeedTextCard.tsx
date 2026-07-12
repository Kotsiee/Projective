import { ComponentChildren } from 'preact';
import { IconArrowRight, IconBulb, IconFlame, IconQuote, IconSparkles } from '@tabler/icons-preact';
import '../../styles/components/feed-cards.css';

/* #region Types */
export type FeedTextTone = 'insight' | 'quote' | 'prompt' | 'milestone';

export interface FeedTextCardProps {
	/** Content intent — selects the eyebrow icon + accent default. @default 'insight' */
	tone?: FeedTextTone;
	eyebrow?: string;
	title: ComponentChildren;
	body?: ComponentChildren;
	author?: { name: string; handle?: string; avatar?: string | null };
	ctaLabel?: string;
	ctaHref?: string;
	/** Accent token suffix, e.g. `mint` / `violet` / `amber`. @default tone-derived */
	accent?: string;
	class?: string;
	className?: string;
}
/* #endregion */

const TONE_ICON = {
	insight: IconBulb,
	quote: IconQuote,
	prompt: IconSparkles,
	milestone: IconFlame,
} as const;

const TONE_ACCENT: Record<FeedTextTone, string> = {
	insight: 'mint',
	quote: 'violet',
	prompt: 'teal',
	milestone: 'amber',
};

/**
 * @function FeedTextCard
 * @description A text card — insight / quote / prompt / milestone — that breaks the rhythm of
 * media cards in the feed. Crisp hairline, clean surface, a tone-coded eyebrow, and an optional
 * author footer or CTA. Purely presentational.
 */
export function FeedTextCard(props: FeedTextCardProps) {
	const {
		tone = 'insight',
		eyebrow,
		title,
		body,
		author,
		ctaLabel,
		ctaHref,
		accent,
		class: klass,
		className,
	} = props;

	const Icon = TONE_ICON[tone];
	const acc = accent ?? TONE_ACCENT[tone];
	const classes = [
		'feed-text',
		`feed-text--${tone}`,
		`accent-${acc}`,
		klass,
		className,
	].filter(Boolean).join(' ');

	return (
		<article class={classes}>
			{eyebrow && (
				<div class='feed-text__eyebrow'>
					<Icon size={15} stroke={2} />
					<span>{eyebrow}</span>
				</div>
			)}
			<h3 class='feed-text__title'>{title}</h3>
			{body && <p class='feed-text__body'>{body}</p>}

			{(author || (ctaLabel && ctaHref)) && (
				<div class='feed-text__foot'>
					{author && (
						<div class='feed-text__author'>
							<span class='feed-text__avatar' aria-hidden='true'>
								{author.avatar
									? <img src={author.avatar} alt='' loading='lazy' />
									: <span>{(author.name[0] ?? '?').toUpperCase()}</span>}
							</span>
							<span class='feed-text__author-meta'>
								<span class='feed-text__author-name'>{author.name}</span>
								{author.handle && <span class='feed-text__author-handle'>@{author.handle}</span>}
							</span>
						</div>
					)}
					{ctaLabel && ctaHref && (
						<a class='feed-text__cta' href={ctaHref}>
							{ctaLabel}
							<IconArrowRight size={15} stroke={2} />
						</a>
					)}
				</div>
			)}
		</article>
	);
}

export default FeedTextCard;
