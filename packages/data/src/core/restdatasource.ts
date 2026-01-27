import { DataSource, type DataSourceConfig, type FetchResult } from './datasource.ts';
import type { Range } from './types.ts';

interface RestDataSourceConfig<TOut, TIn> extends DataSourceConfig<TOut, TIn> {
	url: string;
	defaultParams?: Record<string, string>;
	cacheTtl?: number;
	fetchOptions?: RequestInit;
}

const GLOBAL_CACHE = new Map<string, { timestamp: number; response: Promise<any> }>();

export class RestDataSource<TOut, TIn extends { total_count?: number }>
	extends DataSource<TOut, TIn> {
	declare protected config: RestDataSourceConfig<TOut, TIn>;

	constructor(config: RestDataSourceConfig<TOut, TIn>) {
		super(config);
	}

	public async getMeta(): Promise<{ totalCount: number }> {
		const params = new URLSearchParams(this.config.defaultParams);
		params.set('countOnly', 'true');

		// FIX: Separate URL construction from Cache Key
		const fetchUrl = `${this.config.url}?${params.toString()}`;
		const cacheKey = `${fetchUrl}_meta`;

		// 1. Check Cache
		const now = Date.now();
		const ttl = this.config.cacheTtl ?? 5000;
		const cached = GLOBAL_CACHE.get(cacheKey);

		if (cached && (now - cached.timestamp < ttl)) {
			try {
				const data = await cached.response;
				return data.meta || { totalCount: 0 };
			} catch (e) {
				GLOBAL_CACHE.delete(cacheKey);
			}
		}

		// 2. Request
		const requestPromise = (async () => {
			const response = await fetch(fetchUrl, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					...(this.config.fetchOptions?.headers || {}),
				},
				credentials: this.config.fetchOptions?.credentials ?? 'same-origin',
				...this.config.fetchOptions,
			});

			if (!response.ok) return { totalCount: 0 };
			const data = await response.json();
			return data; // Return full response to cache
		})();

		GLOBAL_CACHE.set(cacheKey, { timestamp: now, response: requestPromise });

		try {
			const data = await requestPromise;
			return data.meta || { totalCount: 0 };
		} catch (error) {
			console.error('Meta fetch failed:', error);
			GLOBAL_CACHE.delete(cacheKey);
			return { totalCount: 0 };
		}
	}

	public async fetch(range: Range): Promise<FetchResult<TIn>> {
		const params = new URLSearchParams(this.config.defaultParams);
		params.set('offset', String(range.start));
		params.set('limit', String(range.length));

		// FIX: Use clean URL for fetch
		const fetchUrl = `${this.config.url}?${params.toString()}`;
		const cacheKey = fetchUrl; // For rows, URL is unique enough

		const ttl = this.config.cacheTtl ?? 5000;
		const now = Date.now();

		const cached = GLOBAL_CACHE.get(cacheKey);
		if (cached && (now - cached.timestamp < ttl)) {
			try {
				const data = await cached.response;
				return structuredClone(data);
			} catch (e) {
				GLOBAL_CACHE.delete(cacheKey);
			}
		}

		const requestPromise = (async () => {
			try {
				const response = await fetch(fetchUrl, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						...(this.config.fetchOptions?.headers || {}),
					},
					credentials: this.config.fetchOptions?.credentials ?? 'same-origin',
					...this.config.fetchOptions,
				});

				if (!response.ok) throw new Error(`HTTP Error: ${response.statusText}`);

				const data = await response.json();

				let items: TIn[] = [];
				if (Array.isArray(data)) {
					items = data;
				} else if (data && Array.isArray(data.items)) {
					items = data.items;
				}

				const totalCount = data.meta?.totalCount ?? (items.length > 0 ? items[0].total_count : 0);

				return {
					items,
					meta: { totalCount },
				};
			} catch (error) {
				console.error('Data Fetch Error:', error);
				throw error;
			}
		})();

		GLOBAL_CACHE.set(cacheKey, { timestamp: now, response: requestPromise });

		try {
			return await requestPromise;
		} catch (error) {
			GLOBAL_CACHE.delete(cacheKey);
			return { items: [], error: error as Error };
		}
	}

	public withParams(newParams: Record<string, string>): RestDataSource<TOut, TIn> {
		return new RestDataSource({
			...this.config,
			defaultParams: { ...this.config.defaultParams, ...newParams },
		});
	}
}
