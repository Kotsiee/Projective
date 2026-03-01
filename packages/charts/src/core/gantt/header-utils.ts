import { DateTime } from '@projective/types';

// #region Interfaces
export type HeaderUnit = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface HeaderTier {
	top: HeaderUnit;
	topStep: number;
	bottom: HeaderUnit;
	bottomStep: number;
	formatTop: (d: DateTime) => string;
	formatBottom: (d: DateTime) => string;
}

export interface HeaderBlock {
	key: string;
	label: string;
	x: number;
	width: number;
	date: DateTime;
}
// #endregion

// #region Helpers
function toPlural(unit: HeaderUnit): string {
	switch (unit) {
		case 'hour':
			return 'hours';
		case 'day':
			return 'days';
		case 'week':
			return 'weeks';
		case 'month':
			return 'months';
		case 'year':
			return 'years';
		case 'quarter':
			return 'months';
		default:
			return unit;
	}
}
// #endregion

// #region Configuration
export function getHeaderTier(visibleDays: number, containerWidth: number): HeaderTier {
	const pixelsPerDay = containerWidth / Math.max(1, visibleDays);

	// Reduced from 45. A two digit day ("24") only needs about 20-25px to render cleanly.
	const MIN_DAY_WIDTH = 25;

	if (pixelsPerDay >= 120) {
		const pixelsPerHour = pixelsPerDay / 24;
		const hourStepRaw = Math.ceil(MIN_DAY_WIDTH / pixelsPerHour);
		const validHourSteps = [1, 2, 3, 4, 6, 12];
		const hourStep = validHourSteps.find((s) => s >= hourStepRaw) || 12;

		return {
			top: 'day',
			topStep: 1,
			bottom: 'hour',
			bottomStep: hourStep,
			formatTop: (d) => d.toFormat('ddd d MMM yyyy'),
			formatBottom: (d) => d.toFormat('HH:mm'),
		};
	} else if (pixelsPerDay >= MIN_DAY_WIDTH) {
		// Single Days (If there is enough physical room, show every single day)
		return {
			top: 'month',
			topStep: 1,
			bottom: 'day',
			bottomStep: 1,
			formatTop: (d) => d.toFormat('MMMM yyyy'),
			formatBottom: (d) => d.toFormat('dd'),
		};
	} else {
		// Grouped Days
		const dayStepRaw = Math.ceil(MIN_DAY_WIDTH / pixelsPerDay);
		const validDaySteps = [2, 3, 4, 5, 7, 10, 14, 15];

		if (dayStepRaw <= 15) {
			const dayStep = validDaySteps.find((s) => s >= dayStepRaw) || 15;
			return {
				top: 'month',
				topStep: 1,
				bottom: 'day',
				bottomStep: dayStep,
				formatTop: (d) => d.toFormat('MMMM yyyy'),
				formatBottom: (d) => d.toFormat('dd'),
			};
		}

		// Months
		const pixelsPerMonth = pixelsPerDay * 30;
		if (pixelsPerMonth >= MIN_DAY_WIDTH) {
			const monthStepRaw = Math.ceil(MIN_DAY_WIDTH / pixelsPerMonth);
			const validMonthSteps = [1, 2, 3, 4, 6];
			const monthStep = validMonthSteps.find((s) => s >= monthStepRaw) || 6;

			return {
				top: 'year',
				topStep: 1,
				bottom: 'month',
				bottomStep: monthStep,
				formatTop: (d) => d.toFormat('yyyy'),
				formatBottom: (d) => d.toFormat('MMM'),
			};
		}

		// Quarters / Years
		return {
			top: 'year',
			topStep: 1,
			bottom: 'quarter',
			bottomStep: 1,
			formatTop: (d) => d.toFormat('yyyy'),
			formatBottom: (d) => `Q${Math.ceil((d.getMonth() + 1) / 3)}`,
		};
	}
}
// #endregion

// #region Generators
export function generateHeaderBlocks(
	start: DateTime,
	end: DateTime,
	unit: HeaderUnit,
	step: number,
	dateToX: (ms: number) => number,
): HeaderBlock[] {
	const blocks: HeaderBlock[] = [];

	// 1. ANCHOR TO EPOCH: Always snap to the absolute beginning of the relevant calendar unit.
	// This ensures that when scrolling, the math doesn't shift relative to the scrollbar.
	let current = new DateTime(new Date(start.getTime()));

	if (unit === 'hour') {
		current = current.startOf('day');
	} else if (unit === 'day') {
		current = current.startOf('month');
	} else if (unit === 'week') {
		const dayOfWeek = current.getDay();
		const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
		current = new DateTime(new Date(current.getTime() - diff * 86400000)).startOf('day');
	} else {
		current = current.startOf('year');
	}

	const startMs = start.getTime();
	const endTime = end.getTime();
	const pluralUnit = toPlural(unit);

	// 2. FAST FORWARD: Skip iterations until we reach the visible viewport
	let safety = 0;
	while (safety < 5000) {
		let next: DateTime;
		if (unit === 'quarter') {
			next = current.add(3 * step, 'months');
		} else {
			// @ts-ignore
			next = current.add(step, pluralUnit);
		}

		if (next.getTime() > startMs) break;

		current = next;
		safety++;
	}

	// 3. GENERATE RENDER BLOCKS
	safety = 0;
	while (current.getTime() < endTime && safety < 5000) {
		let next: DateTime;
		if (unit === 'quarter') {
			next = current.add(3 * step, 'months');
		} else {
			// @ts-ignore
			next = current.add(step, pluralUnit);
		}

		const xStart = dateToX(current.getTime());
		const xEnd = dateToX(next.getTime());

		if (xEnd > xStart) {
			blocks.push({
				key: `${unit}-${current.getTime()}`,
				label: '',
				x: xStart,
				width: xEnd - xStart,
				date: current.clone(),
			});
		}

		current = next;
		safety++;
	}

	return blocks;
}
// #endregion
