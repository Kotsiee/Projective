import { ComponentChildren } from 'preact';
import '../../styles/components/activity-feed.css';

export type ActivityTone = 'primary' | 'mint' | 'violet' | 'amber' | 'danger' | 'neutral';

export interface ActivityItem {
	id: string;
	/** Leading icon node. */
	icon?: ComponentChildren;
	/** Node dot / icon tint. @default 'neutral' */
	tone?: ActivityTone;
	/** Primary line — supports inline nodes for emphasised actors/entities. */
	title: ComponentChildren;
	/** Secondary muted line. */
	meta?: ComponentChildren;
	/** Right-aligned relative timestamp (e.g. "2h"). */
	timestamp?: string;
	/** Makes the whole row a link. */
	href?: string;
}

export interface ActivityFeedProps {
	items: ActivityItem[];
	/** Shown when `items` is empty. */
	emptyLabel?: string;
	className?: string;
}

function Row({ item }: { item: ActivityItem }) {
	const inner = (
		<>
			<span
				class={`activity-feed__node activity-feed__node--${item.tone ?? 'neutral'}`}
				aria-hidden='true'
			>
				{item.icon}
			</span>
			<span class='activity-feed__content'>
				<span class='activity-feed__title'>{item.title}</span>
				{item.meta && <span class='activity-feed__meta'>{item.meta}</span>}
			</span>
			{item.timestamp && <time class='activity-feed__time'>{item.timestamp}</time>}
		</>
	);

	if (item.href) {
		return <a class='activity-feed__row activity-feed__row--link' href={item.href}>{inner}</a>;
	}
	return <li class='activity-feed__row'>{inner}</li>;
}

/**
 * @function ActivityFeed
 * @description A cross-cutting, timeline-style activity log. Each item carries a
 * tinted node marker, a rich title line, muted meta, and a relative timestamp.
 * A continuous rail connects the nodes. Purely presentational — feed it an already
 * aggregated, sorted list.
 */
export function ActivityFeed(props: ActivityFeedProps) {
	const { items, emptyLabel = 'No recent activity yet.', className } = props;

	if (!items.length) {
		return (
			<div class={['activity-feed', 'activity-feed--empty', className].filter(Boolean).join(' ')}>
				{emptyLabel}
			</div>
		);
	}

	return (
		<ul class={['activity-feed', className].filter(Boolean).join(' ')}>
			{items.map((item) => <Row key={item.id} item={item} />)}
		</ul>
	);
}

export default ActivityFeed;
