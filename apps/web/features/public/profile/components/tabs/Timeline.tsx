/**
 * @file Timeline.tsx
 * @description A high-fidelity vertical timeline with a left rail and node dots.
 * Shared by the Experience and Education tabs; `current` entries are highlighted
 * with the primary accent.
 */

import '../../styles/components/timeline.css';

import { Tag } from '@projective/ui';
import { IconBuildingCommunity } from '@tabler/icons-preact';
import type { TimelineEntry } from '../../contracts/Profile.ts';

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
	if (entries.length === 0) {
		return <div class='tab-empty'>Nothing here yet.</div>;
	}

	return (
		<ol class='tl'>
			{entries.map((e) => (
				<li key={e.id} class='tl-entry' data-current={!!e.current}>
					<span class='tl-entry__node' aria-hidden='true' />

					<div class='tl-entry__card'>
						<div class='tl-entry__head'>
							<h3 class='tl-entry__title'>{e.title}</h3>
							<span class='tl-entry__period'>{e.period}</span>
						</div>

						<span class='tl-entry__org'>
							<IconBuildingCommunity size={14} /> {e.organisation}
							{e.current && <span class='tl-entry__now'>Current</span>}
						</span>

						<p class='tl-entry__desc'>{e.description}</p>

						{e.tags.length > 0 && (
							<div class='tl-entry__tags'>
								{e.tags.map((t) => (
									<Tag key={t} size='small' color='neutral' variant='subtle' rounded>{t}</Tag>
								))}
							</div>
						)}
					</div>
				</li>
			))}
		</ol>
	);
}
