/**
 * @file index.tsx
 * @description `/articles/[slug]` — the premium publication reader the freelancer-story cards on
 * `/become-partner` link out to. Server-side controller: resolves the story from the shared seed
 * (a real lookup would key off a CMS) and hands it to the static reader. Unknown slugs render a
 * graceful "coming soon" state, not a 404.
 */

import { PageProps } from 'fresh';
import { PARTNER_STORIES } from '@features/marketing/become-partner/data/content.ts';
import { ArticleReader } from '@features/marketing/articles/components/ArticleReader.tsx';

export default function ArticleRoute(req: PageProps) {
	const slug = req.params.slug;
	const story = PARTNER_STORIES.find((s) => s.slug === slug) ?? null;
	return <ArticleReader story={story} slug={slug} />;
}
