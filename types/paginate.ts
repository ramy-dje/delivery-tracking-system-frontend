

export interface IPaginatedResponse<T> {
    items: T[];
    totalCount: number,
    pageNumber: number,
    pageSize: number,
    totalPages: number,
    hasPreviousPage: boolean,
    hasNextPage: boolean
}

export interface IBaseFilter {
    pageNumber: number;
    pageSize: number;
    descending?: boolean;
    sortBy?: string;
}
