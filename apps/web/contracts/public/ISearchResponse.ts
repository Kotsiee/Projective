export interface ISearchResponse<T> {
	results: T[];
	totalCount: number;
	page: number;
	pageSize: number;
}
