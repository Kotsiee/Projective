import { IconArrowUpRight } from '@tabler/icons-preact';
import '../../styles/components/feed-cards.css';

/* #region Types */
export interface SponsoredCardProps {
	/** Disclosure pill text. @default 'Sponsored' */
	label?: string;
	title: string;
	body: string;
	ctaLabel: string;
	ctaHref: string;
	sponsorName: string;
	sponsorAvatar?: string | null;
	/** CSS background value (gradient string or `url("…")`) for the media panel. */
	media?: string | null;
	/** Accent token suffix, e.g. `gold` / `violet`. @default 'gold' */
	accent?: string;
	class?: string;
	className?: string;
}
/* #endregion */

/**
 * @function SponsoredCard
 * @description A beautifully framed placeholder for a future ad network — a clearly-disclosed
 * "Sponsored Partner Post". Gold-tinted luxe frame, glass body, media panel, sponsor identity, and a
 * single CTA. Inserted into the feed every 5–7 items by the mixed-media rule engine.
 */
export function SponsoredCard(props: SponsoredCardProps) {
	const {
		label = 'Sponsored',
		title,
		body,
		ctaLabel,
		ctaHref,
		sponsorName,
		sponsorAvatar,
		media,
		accent = 'gold',
		class: klass,
		className,
	} = props;

	const classes = ['feed-sponsored', `accent-${accent}`, klass, className].filter(Boolean).join(
		' ',
	);

	return (
		<article class={classes}>
			<div class='feed-sponsored__frame'>
				<div
					class='feed-sponsored__media'
					style={media ? { background: media } : undefined}
					aria-hidden='true'
				>
					<span class='feed-sponsored__badge'>{label}</span>
				</div>
				<div class='feed-sponsored__body'>
					<div class='feed-sponsored__sponsor'>
						<span class='feed-sponsored__avatar' aria-hidden='true'>
							{sponsorAvatar
								? <img src={sponsorAvatar} alt='' loading='lazy' />
								: <span>{(sponsorName[0] ?? 'S').toUpperCase()}</span>}
						</span>
						<span class='feed-sponsored__sponsor-name'>{sponsorName}</span>
					</div>
					<h3 class='feed-sponsored__title'>{title}</h3>
					<p class='feed-sponsored__text'>{body}</p>
					<a class='feed-sponsored__cta' href={ctaHref}>
						{ctaLabel}
						<IconArrowUpRight size={16} stroke={2} />
					</a>
				</div>
			</div>
		</article>
	);
}

export default SponsoredCard;
