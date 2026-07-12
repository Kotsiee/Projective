/**
 * @file FeedStream.island.tsx
 * @description The infinite-scroll feed island. Seeded server-side with the first mixed-media page
 * (`initialItems` + `initialNextOffset`) so the first paint is fully server-rendered and interactive
 * after hydration — no client fetch on mount. Subsequent pages stream from `/api/v1/home/feed` when an
 * IntersectionObserver sentinel nears the viewport; the observer re-arms after each append so short
 * pages chain smoothly, and a `seen` set guards against duplicate keys. Loading never blocks the main
 * thread — appends are async and rendered incrementally.
 */

import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import type { HomeFeedItem, HomeFeedPage, Persona } from '@projective/types';
import { FeedItem } from '../components/FeedItem.tsx';

interface FeedStreamProps {
	persona: Persona;
	initialItems: HomeFeedItem[];
	initialNextOffset: number | null;
}

export default function FeedStream(
	{ persona, initialItems, initialNextOffset }: FeedStreamProps,
) {
	const items = useSignal<HomeFeedItem[]>(initialItems);
	const nextOffset = useSignal<number | null>(initialNextOffset);
	const loading = useSignal(false);
	const errored = useSignal(false);

	const sentinel = useRef<HTMLDivElement>(null);
	const observer = useRef<IntersectionObserver | null>(null);
	const seen = useRef<Set<string>>(new Set(initialItems.map((i) => i.id)));

	const loadMore = async () => {
		if (loading.value || nextOffset.value == null) return;
		loading.value = true;
		errored.value = false;
		try {
			const res = await fetch(
				`/api/v1/home/feed?persona=${persona}&offset=${nextOffset.value}`,
			);
			if (!res.ok) throw new Error(`feed ${res.status}`);
			const page = (await res.json()) as HomeFeedPage;
			const fresh = page.items.filter((i) => !seen.current.has(i.id));
			fresh.forEach((i) => seen.current.add(i.id));
			items.value = [...items.value, ...fresh];
			nextOffset.value = page.nextOffset;
		} catch (_) {
			errored.value = true;
		} finally {
			loading.value = false;
			// Re-arm ONLY on success: if the sentinel is still in view (short page, tall viewport)
			// re-observing re-fires the callback and chains the next page until it scrolls out of range.
			// On error we must NOT re-arm — a still-intersecting sentinel would otherwise re-fire
			// loadMore immediately and hammer the endpoint in an unthrottled retry storm. A failure
			// waits for the user to press the retry control instead.
			const el = sentinel.current;
			if (el && observer.current && nextOffset.value != null && !errored.value) {
				observer.current.unobserve(el);
				observer.current.observe(el);
			}
		}
	};

	useEffect(() => {
		const el = sentinel.current;
		if (!el || typeof IntersectionObserver === 'undefined') return;
		const io = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) loadMore();
			},
			{ rootMargin: '700px 0px' },
		);
		io.observe(el);
		observer.current = io;
		return () => io.disconnect();
	}, []);

	// Re-sync the feed when the server hands us a fresh first page. `useSignal(initialItems)` only
	// captures its argument on the first mount; when a Fresh client-side (partial) navigation re-runs
	// the /home route and re-hydrates this island with new props, the signal would otherwise keep the
	// stale — or empty — page from the previous mount. Reseeding here makes the freshly navigated feed
	// render immediately, without a hard refresh. (Runs once on mount as a harmless no-op; only a real
	// prop change does work.)
	useEffect(() => {
		items.value = initialItems;
		nextOffset.value = initialNextOffset;
		seen.current = new Set(initialItems.map((i) => i.id));
		errored.value = false;
	}, [initialItems, initialNextOffset]);

	return (
		<div class='home-feed'>
			{items.value.map((item) => <FeedItem key={item.id} item={item} />)}

			{nextOffset.value != null && (
				<div ref={sentinel} class='home-feed__sentinel'>
					{loading.value && (
						<span class='home-feed__spinner' role='status' aria-label='Loading more' />
					)}
					{errored.value && !loading.value && (
						<button type='button' class='home-feed__retry' onClick={loadMore}>
							Couldn’t load more — retry
						</button>
					)}
				</div>
			)}

			{nextOffset.value == null && (
				<div class='home-feed__end'>
					<span class='home-feed__end-mark' aria-hidden='true'>✦</span>
					You’re all caught up
				</div>
			)}
		</div>
	);
}
