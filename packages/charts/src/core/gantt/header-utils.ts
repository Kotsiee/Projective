import { DateTime } from '@projective/types';

// #region Interfaces

export type HeaderUnit = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface HeaderTier {
	top: HeaderUnit;
	bottom: HeaderUnit;
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

export function getHeaderTier(visibleDays: number): HeaderTier {
	if (visibleDays <= 3) {
		return {
			top: 'day',
			bottom: 'hour',
			formatTop: (d) => d.toFormat('ddd d MMM yyyy'),
			formatBottom: (d) => d.toFormat('HH:mm'),
		};
	} else if (visibleDays <= 14) {
		return {
			top: 'month',
			bottom: 'day',
			formatTop: (d) => d.toFormat('MMMM yyyy'),
			formatBottom: (d) => d.toFormat('dd'),
		};
	} else if (visibleDays <= 45) {
		return {
			top: 'month',
			bottom: 'day',
			formatTop: (d) => d.toFormat('MMMM yyyy'),
			formatBottom: (d) => d.toFormat('dd'),
		};
	} else if (visibleDays <= 365) {
		return {
			top: 'year',
			bottom: 'month',
			formatTop: (d) => d.toFormat('yyyy'),
			formatBottom: (d) => d.toFormat('MMM'),
		};
	} else {
		return {
			top: 'year',
			bottom: 'quarter',
			formatTop: (d) => d.toFormat('yyyy'),
			formatBottom: (d) => `Q${Math.ceil(d.getMonth() / 3)}`,
		};
	}
}

// #endregion

// #region Generators

export function generateHeaderBlocks(
	start: DateTime,
	end: DateTime,
	unit: HeaderUnit,
	dateToX: (ms: number) => number,
): HeaderBlock[] {
	const blocks: HeaderBlock[] = [];
	// Always start at the beginning of the unit (e.g., Feb 1st)
	// even if the view starts at Feb 25th.
	let current = start.startOf(unit === 'quarter' ? 'month' : unit);
	const endTime = end.getTime();
	const pluralUnit = toPlural(unit);

	let safety = 0;
	while (current.getTime() < endTime && safety < 5000) {
		let next: DateTime;
		if (unit === 'quarter') {
			next = current.add(3, 'months');
		} else {
			next = current.add(1, pluralUnit);
		}

		const xStart = dateToX(current.getTime());
		const xEnd = dateToX(next.getTime());

		// Important: We allow xStart to be negative here (e.g. Feb 1st is before Feb 25th).
		// The renderer will handle the clamping to ensure the text stays visible.
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
