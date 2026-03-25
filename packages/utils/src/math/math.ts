export function clamp(val: number, min: number, max: number): number {
	return Math.min(Math.max(val, min), max);
}

export function roundToStep(val: number, step: number): number {
	if (step <= 0) return val;
	const inverse = 1 / step;
	return Math.round(val * inverse) / inverse;
}

export function snapToClosest(val: number, points: number[]): number {
	if (!points.length) return val;
	return points.reduce((prev, curr) => Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev);
}

// --- Linear Scale ---

export function valueToPercent(val: number, min: number, max: number): number {
	if (max === min) return 0;
	const pct = ((val - min) / (max - min)) * 100;
	return clamp(pct, 0, 100);
}

export function percentToValue(percent: number, min: number, max: number): number {
	const val = min + (percent / 100) * (max - min);
	return clamp(val, min, max);
}

// --- Logarithmic Scale ---

export function valueToPercentLog(val: number, min: number, max: number): number {
	// Log scale cannot handle <= 0. Clamp to 1 if needed or handle logic higher up.
	const safeMin = min <= 0 ? 1 : min;
	const safeVal = val <= safeMin ? safeMin : val;

	const minLog = Math.log(safeMin);
	const maxLog = Math.log(max);
	const valLog = Math.log(safeVal);

	const pct = ((valLog - minLog) / (maxLog - minLog)) * 100;
	return clamp(pct, 0, 100);
}

export function percentToValueLog(percent: number, min: number, max: number): number {
	const safeMin = min <= 0 ? 1 : min;
	const minLog = Math.log(safeMin);
	const maxLog = Math.log(max);

	const scale = (maxLog - minLog) / 100;
	const val = Math.exp(minLog + scale * percent);
	return clamp(val, safeMin, max);
}
