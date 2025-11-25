export interface ISearchRequest<Q> {
	query: Q;
	page: number;
	pageSize: number;
}

export type SortOrder = 'asc' | 'desc';

export interface ISearchRequestWithSort<Q, S> extends ISearchRequest<Q> {
	sortBy: S;
	sortOrder: SortOrder;
}

export interface ISearchRequestWithFilter<Q, F> extends ISearchRequest<Q> {
	filters: F;
}

export interface ISearchRequestWithSortAndFilter<Q, F, S>
	extends ISearchRequestWithSort<Q, S>, ISearchRequestWithFilter<Q, F> {}

export type IFilterTypes = 'string' | 'number' | 'boolean' | 'date' | 'range' | 'array';

export interface ISearchRequestFilterDefinition<T> {
	type: IFilterTypes;
	values?: T[];
	min?: number;
	max?: number;
}
