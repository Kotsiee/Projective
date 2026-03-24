// #region Interfaces
/**
 * Configuration parameters for the masonry layout calculation.
 */
export interface MasonryConfig {
	/** The absolute width of the parent bounding container in pixels */
	containerWidth: number;
	/** The spacing between rows and columns in pixels */
	gap: number;
	/** The target minimum width of a column. Used to calculate responsive column counts */
	columnWidth?: number;
	/** An explicit number of columns. If provided, overrides columnWidth */
	columns?: number;
}

/**
 * Spatial coordinates and dimensions for a single masonry brick.
 */
export interface MasonryPosition {
	/** Absolute horizontal offset from the container's left edge */
	x: number;
	/** Absolute vertical offset from the container's top edge */
	y: number;
	/** The calculated width of the item */
	width: number;
	/** The height of the item (passed in originally) */
	height: number;
	/** The index of the column this item was placed in */
	columnIndex: number;
}

/**
 * The calculated result of a full masonry layout pass.
 */
export interface MasonryLayoutResult {
	/** Ordered array of spatial coordinates matching the input heights array */
	positions: MasonryPosition[];
	/** The absolute maximum height of the tallest column (used to size the parent container) */
	totalHeight: number;
	/** The final calculated number of columns */
	columns: number;
	/** The final calculated width of each column */
	columnWidth: number;
}
// #endregion

// #region Layout Engine
/*
 * Pure functions for calculating 2D spatial layouts.
 * Separating this from the DOM/React layer allows us to run layout calculations
 * in Web Workers or Server-Side Rendering environments if necessary.
 */

/**
 * Calculates absolute X/Y coordinates for an array of items using a "Shortest Column First" algorithm.
 * * @param itemHeights - An array of measured or estimated heights for each item.
 * @param config - Layout constraints including container width and gaps.
 * @returns A fully calculated spatial layout mapping.
 */
export function calculateMasonryLayout(
	itemHeights: number[],
	config: MasonryConfig,
): MasonryLayoutResult {
	const { containerWidth, gap, columnWidth, columns: explicitColumns } = config;

	let columns = 1;
	let actualColumnWidth = containerWidth;

	if (explicitColumns !== undefined && explicitColumns > 0) {
		columns = explicitColumns;
		actualColumnWidth = (containerWidth - (columns - 1) * gap) / columns;
	} else if (columnWidth !== undefined && columnWidth > 0) {
		columns = Math.max(1, Math.floor((containerWidth + gap) / (columnWidth + gap)));
		actualColumnWidth = (containerWidth - (columns - 1) * gap) / columns;
	}

	const colHeights = new Array(columns).fill(0);
	const positions: MasonryPosition[] = [];

	for (let i = 0; i < itemHeights.length; i++) {
		const height = itemHeights[i];

		let shortestColIndex = 0;
		let minHeight = colHeights[0];

		for (let c = 1; c < columns; c++) {
			if (colHeights[c] < minHeight) {
				minHeight = colHeights[c];
				shortestColIndex = c;
			}
		}

		const x = shortestColIndex * (actualColumnWidth + gap);
		const y = colHeights[shortestColIndex];

		positions.push({
			x,
			y,
			width: actualColumnWidth,
			height,
			columnIndex: shortestColIndex,
		});

		colHeights[shortestColIndex] += height + gap;
	}

	const tallestColHeight = Math.max(...colHeights);
	const totalHeight = Math.max(0, tallestColHeight - gap);

	return {
		positions,
		totalHeight,
		columns,
		columnWidth: actualColumnWidth,
	};
}
// #endregion
