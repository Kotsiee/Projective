import { DateTime } from '@projective/types';

// #region Interfaces

export interface TimeScaleConfig {
	visibleDays: number;
	width: number;
	startDate: number; // Timestamp
}

// #endregion

/**
 * Manages the "Time Domain" -> "Pixel Range" mapping.
 * Calculates coordinates based on a specific number of visible days.
 */
export class GanttTimeScale {
	private _visibleDays: number;
	private _width: number;
	private _start: number;
	private _msPerPixel: number;

	constructor(config: TimeScaleConfig) {
		this._visibleDays = config.visibleDays;
		this._width = config.width;
		this._start = config.startDate;

		this._msPerPixel = this.calculateRatio();
	}

	/**
	 * Recalculates the ratio of milliseconds per pixel.
	 * Total MS in View / Total Pixels
	 */
	private calculateRatio(): number {
		const totalMs = this._visibleDays * 86400000; // days * 24 * 60 * 60 * 1000
		return totalMs / (this._width || 1);
	}

	/**
	 * Updates the configuration and recalculates ratio.
	 */
	public update(visibleDays: number, width: number, startDate: number) {
		this._visibleDays = visibleDays;
		this._width = width;
		this._start = startDate;
		this._msPerPixel = this.calculateRatio();
	}

	/**
	 * Converts a timestamp to a generic X pixel coordinate.
	 * @param date Timestamp in ms
	 */
	public dateToX(date: number): number {
		const diffMs = date - this._start;
		return diffMs / this._msPerPixel;
	}

	/**
	 * Converts an X pixel coordinate back to a timestamp.
	 * @param x Pixel coordinate
	 */
	public xToDate(x: number): number {
		const msToAdd = x * this._msPerPixel;
		return this._start + msToAdd;
	}

	/**
	 * Returns the Date object for the right-most edge of the view.
	 */
	public getEndDate(): DateTime {
		const start = new DateTime(new Date(this._start));
		return start.add(this._visibleDays, 'days');
	}

	/**
	 * Returns the visible width of a single day in pixels.
	 */
	public getDayWidth(): number {
		return this._width / this._visibleDays;
	}
}
