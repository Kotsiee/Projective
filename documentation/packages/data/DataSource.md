# Data Core: DataSource Guide

The `DataSource` system provides a unified abstraction layer for fetching, mapping, and normalizing
data from any source—be it a REST API, a local array, or a real-time WebSocket stream. By decoupling
the UI from the specific data-fetching logic, the platform can maintain high-performance
virtualization and gap-detection regardless of where the data resides.

## 📂 Project Structure

```text
packages/data/
├── src/
│   └── core/
│       ├── datasource.ts      # Abstract base class and config
│       ├── restdatasource.ts  # Concrete REST implementation with caching
│       ├── normalization.ts   # Logic for merging new items into the dataset
│       └── types.ts           # Shared FetchResult and Range interfaces
```

## 🏗️ Implementing a Custom DataSource

To create a new data provider, you must extend the `DataSource` abstract class and implement the
`fetch` method.

```ts
import { DataSource, type FetchResult, type Range } from '@projective/data';

export class MyCustomSource extends DataSource<MyUIModel, MyRawAPIModel> {
	async fetch(range: Range): Promise<FetchResult<MyRawAPIModel>> {
		const response = await myApi.getData(range.start, range.length);

		return {
			items: response.data,
			meta: { totalCount: response.total },
		};
	}
}
```

## ⚙️ The RestDataSource

Projective provides a robust `RestDataSource` out of the box that handles common API patterns and
caching.

### Key Features

- **Built-in Normalization**: Automatically uses a `keyExtractor` and optional `mapper` to transform
  API response shapes into UI-ready models.
- **Intelligent Caching**: Uses a global `GLOBAL_CACHE` with a configurable TTL (Time-To-Live) to
  prevent redundant network requests for the same offsets.
- **Meta-Only Fetching**: Includes a `getMeta()` method to retrieve only the `totalCount`, allowing
  the virtualizer to set its scroll height before rows are loaded.

### Usage Example

```ts
const userSource = new RestDataSource({
	url: '/api/users',
	keyExtractor: (raw) => raw.user_id,
	mapper: (raw) => ({
		name: `${raw.first_name} ${raw.last_name}`,
		email: raw.email_address,
	}),
	defaultParams: { active: 'true' },
	cacheTtl: 10000, // 10 seconds
});
```

## 🕹️ Logic & Integration

- **Range Fetching**: The `DataManager` calculates "gaps" in the current view and requests specific
  `Range` objects (start/length) from the source.
- **Normalization Engine**: The `source.normalize()` method is called for every incoming raw item to
  ensure the UI only interacts with stable keys and mapped data.
- **Automatic Total Discovery**: If the API does not provide a `totalCount`, the `normalization`
  logic intelligently determines the end of the dataset if a fetch returns fewer items than
  requested.
- **Param Chaining**: Use `.withParams()` to create a new instance of a `RestDataSource` with merged
  parameters, which is ideal for filtering and searching without re-instantiating the entire config.

## 🧪 Advanced: RealtimeDataSource

Used specifically by components like `ChatList`, this interface extends the base source with
subscription capabilities.

```ts
interface RealtimeDataSource<T> extends DataSource<T> {
	getMeta(): Promise<{ totalCount: number }>;
	subscribe?: (cb: (item: T) => void) => () => void;
}
```
