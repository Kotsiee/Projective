import type { FetchMeta, Mapper, Range } from './types.ts';

/**
 * Result of a fetch operation.
 */
export interface FetchResult<Tin> {
	items: Tin[];
	meta?: FetchMeta;
	error?: Error;
}

/**
 * Configuration for a data source.
 * TOut: The shape the UI expects.
 * TIn: The shape the API returns (optional, defaults to unknown).
 */
export interface DataSourceConfig<TOut, TIn = unknown> {
	/** Function to extract a unique ID from a raw item */
	keyExtractor: (item: TIn) => string | number;

	/** Optional mapper to transform API shape to UI shape */
	mapper?: Mapper<TIn, TOut>;
}

/**
 * Abstract base class for all data sources.
 */
export abstract class DataSource<TOut, TIn = unknown> {
	protected config: DataSourceConfig<TOut, TIn>;

	constructor(config: DataSourceConfig<TOut, TIn>) {
		this.config = config;
	}

	/**
	 * The primary method the Virtualizer calls when it hits a gap.
	 */
	abstract fetch(range: Range): Promise<FetchResult<TIn>>;

	/**
	 * Helper to normalize a raw result using the config.
	 */
	public normalize(rawItem: TIn): { key: string; data: TOut } {
		const rawKey = this.config.keyExtractor(rawItem);
		const key = String(rawKey);

		// If a mapper is provided, use it. Otherwise cast raw as TOut.
		const data = this.config.mapper ? this.config.mapper(rawItem) : (rawItem as unknown as TOut);

		return { key, data };
	}
}
