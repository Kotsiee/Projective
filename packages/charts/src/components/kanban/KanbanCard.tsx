import type { KanbanCardProps } from '../../types/kanban.ts';
import { useDraggable, useDropzone } from '../../hooks/useKanbanDnD.ts';
import { useEffect, useState } from 'preact/hooks';
import {
	IconAlertHexagon,
	IconCalendar,
	IconClock,
	IconLock,
	IconPaperclip,
} from '@tabler/icons-preact';
import '../../styles/kanban/kanban-card.css';

interface ExtendedCardProps extends KanbanCardProps {
	fieldId: string;
	onClick?: () => void;
}

const DEFAULT_FROZEN_MESSAGE = 'Client must respond or both take penalties';

/** Pads a number to two digits for the HH:MM:SS countdown. */
const pad = (n: number): string => String(n).padStart(2, '0');

/**
 * Live countdown to `untilIso`, formatted HH:MM:SS (hours are not capped at 24, matching the
 * design's 48h dispute window). Ticks once per second and clamps at zero once elapsed.
 */
function useCountdown(untilIso: string): string {
	const target = new Date(untilIso).getTime();
	const [remaining, setRemaining] = useState(() => Math.max(0, target - Date.now()));

	useEffect(() => {
		const tick = () => setRemaining(Math.max(0, new Date(untilIso).getTime() - Date.now()));
		tick();
		const handle = setInterval(tick, 1000);
		return () => clearInterval(handle);
	}, [untilIso]);

	const totalSeconds = Math.floor(remaining / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** The striped warning overlay + live countdown shown on a frozen (workload-dispute) card. */
function FrozenOverlay({ until, message }: { until: string; message?: string }) {
	const countdown = useCountdown(until);
	return (
		<div class='kanban-card__frozen' role='status'>
			<span class='kanban-card__frozen-icon'>
				<IconAlertHexagon size={16} stroke={2} />
			</span>
			<div class='kanban-card__frozen-text'>
				<span class='kanban-card__frozen-countdown'>{countdown}</span>
				<span class='kanban-card__frozen-message'>{message ?? DEFAULT_FROZEN_MESSAGE}</span>
			</div>
		</div>
	);
}

export function KanbanCard({
	fieldId,
	id,
	displayId,
	title,
	description,
	priority,
	attachmentCount,
	dateLabel,
	tags,
	takenBy,
	frozen,
	permissions,
	onClick,
	...rest
}: ExtendedCardProps) {
	const isLocked = permissions?.canReorder !== true;
	const draggableProps = useDraggable(
		'card',
		{
			id,
			displayId,
			title,
			description,
			priority,
			attachmentCount,
			dateLabel,
			tags,
			takenBy,
			frozen,
			permissions,
			...rest,
		},
		fieldId,
		isLocked,
	);
	const dropzoneProps = useDropzone('card', id);

	const isFrozen = !!frozen;
	// A locked-but-not-frozen card reads as "claimed": a small lock glyph sits top-right.
	const cornerIcon = isFrozen
		? null
		: isLocked
		? <IconLock size={14} class='kanban-card__corner-icon' />
		: <IconClock size={14} class='kanban-card__corner-icon' />;

	const priorityLevel = priority?.level ?? 'none';

	return (
		<div
			class={`kanban-card${isFrozen ? ' kanban-card--frozen' : ''}${
				isLocked ? ' kanban-card--locked' : ''
			}`}
			{...dropzoneProps}
			{...draggableProps}
			onClick={onClick}
			role='button'
			tabIndex={0}
		>
			{/* Top line: #ID + claim/frozen affordance on the left, status glyph on the right. */}
			<div class='kanban-card__topline'>
				<div class='kanban-card__ident'>
					{displayId && <span class='kanban-card__id'>{displayId}</span>}
					{isFrozen && (
						<span class='kanban-card__frozen-pill'>
							<IconLock size={11} stroke={2.5} /> FROZEN
						</span>
					)}
				</div>
				{cornerIcon}
			</div>

			<h4 class='kanban-card__title'>{title}</h4>

			{description && <p class='kanban-card__desc'>{description}</p>}

			{isFrozen && <FrozenOverlay until={frozen!.until} message={frozen!.message} />}

			<div class='kanban-card__footer'>
				<div class='kanban-card__meta-row'>
					{dateLabel && (
						<span class='kanban-card__meta-chip'>
							<IconCalendar size={13} stroke={1.9} />
							{dateLabel}
						</span>
					)}
					{typeof attachmentCount === 'number' && attachmentCount > 0 && (
						<span class='kanban-card__meta-chip'>
							<IconPaperclip size={13} stroke={1.9} />
							{attachmentCount}
						</span>
					)}
					{priority && (
						<span class={`kanban-card__priority kanban-card__priority--${priorityLevel}`}>
							{priority.label}
						</span>
					)}
					{!priority && tags?.slice(0, 1).map((tag) => (
						<span
							key={tag.id}
							class='kanban-card__priority kanban-card__priority--none'
							style={tag.color ? { color: tag.color } : {}}
						>
							{tag.label}
						</span>
					))}
				</div>

				{takenBy
					? (
						takenBy.avatarUrl
							? <img src={takenBy.avatarUrl} alt={takenBy.name} class='kanban-card__avatar-img' />
							: (
								<div class='kanban-card__avatar' title={takenBy.name}>
									{takenBy.name.charAt(0).toUpperCase()}
								</div>
							)
					)
					: <div class='kanban-card__avatar kanban-card__avatar--empty' aria-hidden='true' />}
			</div>
		</div>
	);
}
