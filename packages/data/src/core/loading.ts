import type { Range } from './types.ts';

/**
 * Merges overlapping or adjacent ranges to reduce API calls.
 * e.g., [100, 110] + [105, 120] -> [100, 120]
 */
export function mergeRanges(ranges: Range[]): Range[] {
	if (ranges.length === 0) return [];

	// Sort by start index
	const sorted = [...ranges].sort((a, b) => a.start - b.start);
	const merged: Range[] = [];

	let current = sorted[0];

	for (let i = 1; i < sorted.length; i++) {
		const next = sorted[i];

		// If overlaps or touches (next.start <= current.end + 1)
		if (next.start <= (current.start + current.length)) {
			// Extend current
			const newEnd = Math.max(
				current.start + current.length,
				next.start + next.length,
			);
			current.length = newEnd - current.start;
		} else {
			merged.push(current);
			current = next;
		}
	}
	merged.push(current);

	return merged;
}

/**
 * Calculates what is missing from the dataset.
 */
export function findGaps(
	neededStart: number,
	neededEnd: number,
	loadedOrder: Array<string | undefined>,
): Range[] {
	const gaps: Range[] = [];
	let currentStart = -1;

	for (let i = neededStart; i <= neededEnd; i++) {
		const isLoaded = loadedOrder[i] !== undefined;

		if (!isLoaded) {
			if (currentStart === -1) currentStart = i;
		} else {
			if (currentStart !== -1) {
				gaps.push({ start: currentStart, length: i - currentStart });
				currentStart = -1;
			}
		}
	}

	// Close final gap
	if (currentStart !== -1) {
		gaps.push({ start: currentStart, length: neededEnd - currentStart + 1 });
	}

	return gaps;
}
