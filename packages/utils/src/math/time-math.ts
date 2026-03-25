/**
 * Converts polar coordinates (angle) to clock values.
 * * @param x Pointer X relative to center
 * @param y Pointer Y relative to center
 * @param steps Total steps (12 for hours, 60 for minutes)
 */
export function getAngleValue(x: number, y: number, steps: number): number {
	// 1. Calculate angle in degrees (0 = 12 o'clock / top)
	// Math.atan2(y, x) returns angle from X-axis.
	// We offset by -90deg (PI/2) to make Top 0deg.
	let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;

	// Normalize negative angles (0 to 360)
	if (angle < 0) angle += 360;

	// 2. Snap to step
	const stepDeg = 360 / steps;
	const snappedAngle = Math.round(angle / stepDeg) * stepDeg;

	// 3. Convert to value
	let value = Math.round(snappedAngle / stepDeg);

	// Handle wrap-around (0 is usually max value in clocks, e.g. 60 min or 12 hours)
	if (value === 0) value = steps;

	return value;
}

/**
 * Get coordinates for a number on the clock face.
 */
export function getPosition(value: number, steps: number, radius: number) {
	const angle = (value * (360 / steps) - 90) * (Math.PI / 180);
	return {
		x: Math.cos(angle) * radius,
		y: Math.sin(angle) * radius,
	};
}
