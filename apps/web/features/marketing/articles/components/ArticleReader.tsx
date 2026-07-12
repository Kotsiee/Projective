/**
 * @file ArticleReader.tsx
 * @description A premium editorial reader for `/articles/[slug]`. Server-rendered (no interactivity),
 * seeded from the shared `PARTNER_STORIES` content so the freelancer-story cards on `/become-partner`
 * link out to a real, styled publication page. Unknown slugs render a graceful "coming soon" state
 * rather than a hard 404. Its CSS is global (server-rendered markup — see the CSS-loading gotcha).
 */

import { Button } from '@projective/ui';
import { IconArrowLeft, IconArrowRight, IconSparkles } from '@tabler/icons-preact';
import type { PartnerStory } from '@features/marketing/become-partner/data/content.ts';

export interface ArticleReaderProps {
	story: PartnerStory | null;
	slug: string;
}

export function ArticleReader({ story, slug }: ArticleReaderProps) {
	if (!story) {
		return (
			<article class='article article--empty'>
				<a class='article__back' href='/become-partner'>
					<IconArrowLeft size={16} stroke={2} /> Back to talent
				</a>
				<div class='article__empty-card'>
					<span class='partner-eyebrow'>
						<span class='partner-eyebrow__dot' />
						Freelancer stories
					</span>
					<h1 class='article__empty-title'>This story is still being written.</h1>
					<p class='article__empty-sub'>
						“{slug}” isn’t published yet. In the meantime, see why independents are unlocking their
						freelancer suite.
					</p>
					<Button
						href='/become-partner'
						variant='premium'
						size='large'
						rounded
						endIcon={<IconArrowRight size={18} stroke={2} />}
					>
						Explore becoming a partner
					</Button>
				</div>
			</article>
		);
	}

	return (
		<article class='article'>
			<a class='article__back' href='/become-partner'>
				<IconArrowLeft size={16} stroke={2} /> Back to talent
			</a>

			<header class='article__head'>
				<span class='article__kicker'>{story.kicker}</span>
				<h1 class='article__title'>{story.title}</h1>
				<p class='article__standfirst'>{story.excerpt}</p>
				<div class='article__byline'>
					<div class='article__byline-avatar' aria-hidden='true' />
					<div>
						<span class='article__byline-name'>{story.author}</span>
						<span class='article__byline-role'>{story.role} · {story.readMins} min read</span>
					</div>
				</div>
			</header>

			<div class='article__cover' style={{ background: story.cover }} aria-hidden='true' />

			<div class='article__body'>
				{story.body.map((para, i) => (
					<p key={i} class={i === 0 ? 'article__lead' : undefined}>{para}</p>
				))}
			</div>

			<aside class='article__cta'>
				<span class='article__cta-icon'>
					<IconSparkles size={22} stroke={1.75} />
				</span>
				<div class='article__cta-copy'>
					<h2 class='article__cta-title'>Ready to write your own?</h2>
					<p class='article__cta-sub'>
						Unlock your freelancer suite — free, on top of the account you already have.
					</p>
				</div>
				<Button
					href='/become-partner'
					variant='premium'
					size='large'
					rounded
					endIcon={<IconArrowRight size={18} stroke={2} />}
				>
					Begin your journey
				</Button>
			</aside>
		</article>
	);
}
