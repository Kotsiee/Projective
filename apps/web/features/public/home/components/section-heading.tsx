import { ComponentChildren } from 'preact';
import { IconArrowRight } from '@tabler/icons-preact';

export interface SectionHeadingProps {
	eyebrow?: string;
	title: ComponentChildren;
	sub?: string;
	href?: string;
	linkLabel?: string;
	/** Trailing slot (e.g. carousel nav buttons) rendered opposite the text. */
	aside?: ComponentChildren;
}

/**
 * @component SectionHeading
 * @description Shared eyebrow + title + optional "view all" link used across every home showcase.
 * Presentational only — safe in both static partials and islands.
 */
export default function SectionHeading(props: SectionHeadingProps) {
	const { eyebrow, title, sub, href, linkLabel = 'View all', aside } = props;
	return (
		<div class='home-section__head'>
			<div class='home-section__head-text'>
				{eyebrow && <span class='home-eyebrow'>{eyebrow}</span>}
				<h2 class='home-section__title'>{title}</h2>
				{sub && <p class='home-section__sub'>{sub}</p>}
			</div>
			{aside ?? (href && (
				<a class='home-section__link' href={href}>
					{linkLabel}
					<IconArrowRight size={16} />
				</a>
			))}
		</div>
	);
}
