import '../../styles/components/shared/banner.css';
import { Button } from '@projective/ui';
import { IconArrowRight, IconSparkles } from '@tabler/icons-preact';
import type { Accent } from '@projective/types';

const ACCENT_GRADIENT: Record<Accent, string> = {
	mint: 'linear-gradient(120deg, #052e2b 0%, #0f766e 55%, #2dd4bf 120%)',
	violet: 'linear-gradient(120deg, #1e1247 0%, #6d28d9 55%, #a78bfa 120%)',
	amber: 'linear-gradient(120deg, #3a2408 0%, #b45309 55%, #fbbf24 120%)',
	ocean: 'linear-gradient(120deg, #06283d 0%, #0369a1 55%, #38bdf8 120%)',
	ember: 'linear-gradient(120deg, #3b0764 0%, #be185d 55%, #fb7185 120%)',
	forest: 'linear-gradient(120deg, #052e16 0%, #15803d 55%, #4ade80 120%)',
	primary: 'linear-gradient(120deg, #072a2f 0%, #0e7490 55%, #22d3ee 120%)',
	neutral: 'linear-gradient(120deg, #18181b 0%, #3f3f46 60%, #71717a 120%)',
};

export interface ExploreBannerProps {
	eyebrow?: string;
	title: string;
	text: string;
	ctaLabel: string;
	ctaHref?: string;
	onCta?: () => void;
	accent?: Accent;
	/** Layout footprint: 'full' spans the row; 'split' is a half-width text/asset block. */
	size?: 'full' | 'split';
	sponsored?: boolean;
	/** Big glyph/emoji rendered in the asset half. */
	glyph?: string;
}

/**
 * @function ExploreBanner
 * @description Dynamic feature / sponsored-spotlight banner. Full-width for section breaks and
 * half-width (text + asset) for the side-by-side spotlight pair.
 */
export default function ExploreBanner(props: ExploreBannerProps) {
	const {
		eyebrow,
		title,
		text,
		ctaLabel,
		ctaHref,
		onCta,
		accent = 'violet',
		size = 'full',
		sponsored,
		glyph = '✦',
	} = props;

	return (
		<div
			class={`explore-banner explore-banner--${size} accent-${accent}`}
			style={{ background: ACCENT_GRADIENT[accent] }}
		>
			<div class='explore-banner__grain' />
			<div class='explore-banner__content'>
				{(eyebrow || sponsored) && (
					<span class='explore-banner__eyebrow'>
						{sponsored && <IconSparkles size={13} />}
						{sponsored ? 'Sponsored Spotlight' : eyebrow}
					</span>
				)}
				<h3 class='explore-banner__title'>{title}</h3>
				<p class='explore-banner__text'>{text}</p>
				<div class='explore-banner__cta'>
					<Button
						variant='secondary'
						rounded
						href={ctaHref}
						onClick={onCta}
						endIcon={<IconArrowRight size={16} />}
					>
						{ctaLabel}
					</Button>
				</div>
			</div>
			<div class='explore-banner__asset' aria-hidden='true'>
				<span class='explore-banner__glyph'>{glyph}</span>
			</div>
		</div>
	);
}
