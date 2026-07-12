/**
 * @file BecomePartnerShell.tsx
 * @description The ultra-luxury `/become-partner` conversion page — a server-rendered editorial
 * shell (deep glassmorphism, razor-thin gold hairlines, luxe transitions) with two atomic islands
 * (the conversion CTA and the FAQ accordion) hydrated inside it. Its CSS lives in the global sheet
 * (server-rendered markup — see the CSS-loading gotcha in apps/web + island-refactor notes).
 *
 * Sections: value-prop hero → proposition grid → banner CTA → freelancer stories (link out to
 * `/articles/[slug]`) → embedded-video placeholder → FAQ → closing CTA. High-conversion `Button`
 * CTAs (via PartnerCta) are scattered throughout with context-varied phrasing.
 */

import { Button } from '@projective/ui';
import {
	IconArrowRight,
	IconCompass,
	IconLock,
	IconPlayerPlayFilled,
	IconShieldCheck,
	IconSparkles,
} from '@tabler/icons-preact';
import { PARTNER_FAQS, PARTNER_STORIES, PARTNER_VALUE_PROPS } from '../data/content.ts';
import PartnerCta from '../islands/PartnerCta.island.tsx';
import PartnerFaq from '../islands/PartnerFaq.island.tsx';

/** Resolve a value-prop's icon key to its Tabler glyph (kept off the data module, which stays pure). */
function ValueIcon({ iconKey }: { iconKey: string }) {
	switch (iconKey) {
		case 'compass':
			return <IconCompass size={20} stroke={1.75} />;
		case 'vault':
			return <IconLock size={20} stroke={1.75} />;
		case 'shield':
			return <IconShieldCheck size={20} stroke={1.75} />;
		default:
			return <IconSparkles size={20} stroke={1.75} />;
	}
}

export interface BecomePartnerShellProps {
	/** The viewer already holds a freelancer profile — soften the pitch, point CTAs at the suite. */
	alreadyPartner: boolean;
	displayName: string | null;
}

export function BecomePartnerShell({ alreadyPartner, displayName }: BecomePartnerShellProps) {
	const firstName = displayName?.trim().split(/\s+/)[0] ?? null;

	return (
		<div class='partner'>
			{/* ---- Already-a-partner reassurance strip ---- */}
			{alreadyPartner && (
				<div class='partner__note'>
					<IconSparkles size={16} stroke={2} />
					<span>
						You’re already part of the talent network{firstName ? `, ${firstName}` : ''}. Everything
						below is your suite — jump back in any time.
					</span>
				</div>
			)}

			{/* ---- Hero ---- */}
			<section class='partner-hero'>
				<div class='partner-hero__glass'>
					<div class='partner-hero__copy'>
						<span class='partner-eyebrow'>
							<span class='partner-eyebrow__dot' />
							Projective for Talent
						</span>
						<h1 class='partner-hero__title'>
							Turn the account you hire with<br />
							into the profile that <em>sells for you</em>.
						</h1>
						<p class='partner-hero__lede'>
							Unlock a freelancer suite on top of your existing identity. Publish premium services,
							apply to funded workspaces, and get paid from escrow — all from one page the
							marketplace already trusts.
						</p>
						<div class='partner-hero__actions'>
							<PartnerCta label='Begin Your Journey' alreadyPartner={alreadyPartner} />
							<Button
								href='/explore'
								variant='secondary'
								size='large'
								ghost
								endIcon={<IconArrowRight size={18} stroke={2} />}
							>
								Explore the marketplace
							</Button>
						</div>
						<dl class='partner-hero__stats'>
							<div>
								<dt>Escrow-first</dt>
								<dd>Funded before you start</dd>
							</div>
							<div>
								<dt>0 fees</dt>
								<dd>To unlock your suite</dd>
							</div>
							<div>
								<dt>One identity</dt>
								<dd>Hire and be hired</dd>
							</div>
						</dl>
					</div>

					{/* Abstract editorial illustration — a stylised identity card catching the light. */}
					<div class='partner-hero__art' aria-hidden='true'>
						<div class='partner-hero__card'>
							<div class='partner-hero__card-sheen' />
							<div class='partner-hero__card-avatar' />
							<div class='partner-hero__card-line partner-hero__card-line--lg' />
							<div class='partner-hero__card-line' />
							<div class='partner-hero__card-chips'>
								<span />
								<span />
								<span />
							</div>
						</div>
						<div class='partner-hero__orb partner-hero__orb--gold' />
						<div class='partner-hero__orb partner-hero__orb--violet' />
					</div>
				</div>
			</section>

			{/* ---- Value proposition grid ---- */}
			<section class='partner-section'>
				<header class='partner-section__head'>
					<span class='partner-eyebrow'>
						<span class='partner-eyebrow__dot' />
						Why unlock it
					</span>
					<h2 class='partner-section__title'>
						A suite built to make independence feel inevitable.
					</h2>
				</header>

				<div class='partner-grid'>
					{PARTNER_VALUE_PROPS.map((v) => (
						<article class='partner-card' key={v.title}>
							<div class='partner-card__art' style={{ background: v.art }} aria-hidden='true' />
							<span class='partner-card__icon'>
								<ValueIcon iconKey={v.iconKey} />
							</span>
							<span class='partner-card__eyebrow'>{v.eyebrow}</span>
							<h3 class='partner-card__title'>{v.title}</h3>
							<p class='partner-card__body'>{v.body}</p>
						</article>
					))}
				</div>
			</section>

			{/* ---- Banner CTA #1 ---- */}
			<section class='partner-banner'>
				<div class='partner-banner__glow' aria-hidden='true' />
				<div class='partner-banner__copy'>
					<h2 class='partner-banner__title'>Your baseline is closer than you think.</h2>
					<p class='partner-banner__sub'>
						A photo, a headline, your story and your skills — that’s the go-live milestone. Cross it
						and your profile can go public and start selling, long before it’s “finished”.
					</p>
				</div>
				<PartnerCta label='Apply as Talent' size='large' alreadyPartner={alreadyPartner} />
			</section>

			{/* ---- Freelancer stories → /articles/[slug] ---- */}
			<section class='partner-section'>
				<header class='partner-section__head'>
					<span class='partner-eyebrow'>
						<span class='partner-eyebrow__dot' />
						Freelancer stories
					</span>
					<h2 class='partner-section__title'>Read how partners built something of their own.</h2>
				</header>

				<div class='partner-stories'>
					{PARTNER_STORIES.map((s) => (
						<a class='partner-story' href={`/articles/${s.slug}`} key={s.slug}>
							<div class='partner-story__cover' style={{ background: s.cover }} aria-hidden='true'>
								<span class='partner-story__kicker'>{s.kicker}</span>
							</div>
							<div class='partner-story__body'>
								<h3 class='partner-story__title'>{s.title}</h3>
								<p class='partner-story__excerpt'>{s.excerpt}</p>
								<div class='partner-story__meta'>
									<span class='partner-story__author'>{s.author}</span>
									<span class='partner-story__read'>{s.readMins} min read</span>
								</div>
								<span class='partner-story__link'>
									Read the story <IconArrowRight size={15} stroke={2} />
								</span>
							</div>
						</a>
					))}
				</div>
			</section>

			{/* ---- Embedded video placeholder ---- */}
			<section class='partner-section'>
				<header class='partner-section__head'>
					<span class='partner-eyebrow'>
						<span class='partner-eyebrow__dot' />
						A film about the craft
					</span>
					<h2 class='partner-section__title'>Ninety seconds inside the partner experience.</h2>
				</header>

				<div class='partner-video' role='img' aria-label='Video presentation coming soon'>
					<div class='partner-video__scrim' aria-hidden='true' />
					<button type='button' class='partner-video__play' aria-label='Play presentation'>
						<IconPlayerPlayFilled size={26} />
					</button>
					<span class='partner-video__tag'>Presentation · coming soon</span>
				</div>
			</section>

			{/* ---- FAQ ---- */}
			<section class='partner-section partner-section--faq'>
				<header class='partner-section__head'>
					<span class='partner-eyebrow'>
						<span class='partner-eyebrow__dot' />
						Before you decide
					</span>
					<h2 class='partner-section__title'>The questions everyone asks first.</h2>
				</header>

				<PartnerFaq items={PARTNER_FAQS} />

				<div class='partner-faq__cta'>
					<div>
						<h3 class='partner-faq__cta-title'>Still weighing it up?</h3>
						<p class='partner-faq__cta-sub'>
							Unlocking is free and reversible in spirit — you keep your client account either way.
						</p>
					</div>
					<PartnerCta label='Unlock Freelancer Suite' alreadyPartner={alreadyPartner} />
				</div>
			</section>
		</div>
	);
}
