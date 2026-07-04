/**
 * @file chatGrouping.ts
 * @description Pure burst-grouping utilities for chat message lists.
 *
 * Consecutive messages sent by the same author within a short window are
 * rendered as a single visual "burst": the avatar, author name and header are
 * shown once on the first message, and following messages stack tightly beneath
 * it. These helpers operate on the minimal shape shared by every chat message
 * (`sender.id` + ISO `timestamp`) so any renderer can reuse them without
 * depending on a concrete message schema.
 */

/** Minimal message shape required to reason about grouping. */
export interface GroupableMessage {
	sender: { id: string };
	/** ISO 8601 timestamp. */
	timestamp: string;
}

/** Default window (in minutes) within which same-sender messages group together. */
export const DEFAULT_BURST_WINDOW_MINUTES = 3;

/**
 * Returns true when `curr` belongs to the same burst as the immediately
 * preceding `prev` message — i.e. same sender and within `windowMinutes`.
 */
export function isSameBurst(
	prev: GroupableMessage | null | undefined,
	curr: GroupableMessage | null | undefined,
	windowMinutes: number = DEFAULT_BURST_WINDOW_MINUTES,
): boolean {
	// Either side may be absent at the list boundaries — treat as a break.
	if (!prev || !curr) return false;
	if (prev.sender?.id == null || curr.sender?.id == null) return false;
	if (prev.sender.id !== curr.sender.id) return false;

	const prevTime = new Date(prev.timestamp).getTime();
	const currTime = new Date(curr.timestamp).getTime();
	if (Number.isNaN(prevTime) || Number.isNaN(currTime)) return false;

	return Math.abs(currTime - prevTime) <= windowMinutes * 60_000;
}

/** Where a message sits within its burst — drives header/avatar/spacing decisions. */
export interface BurstPosition {
	/** First message of a burst → render the avatar + author header. */
	isFirstInBurst: boolean;
	/** Last message of a burst → apply the trailing spacing / bubble tail. */
	isLastInBurst: boolean;
}

/**
 * Resolves the burst position of `items[index]` by comparing it against its
 * neighbours. Safe for out-of-range indices (treats missing neighbours as
 * burst boundaries).
 */
export function getBurstPosition(
	items: GroupableMessage[],
	index: number,
	windowMinutes: number = DEFAULT_BURST_WINDOW_MINUTES,
): BurstPosition {
	const curr = items[index];
	if (!curr) return { isFirstInBurst: true, isLastInBurst: true };

	return {
		isFirstInBurst: !isSameBurst(items[index - 1], curr, windowMinutes),
		isLastInBurst: !isSameBurst(curr, items[index + 1], windowMinutes),
	};
}
