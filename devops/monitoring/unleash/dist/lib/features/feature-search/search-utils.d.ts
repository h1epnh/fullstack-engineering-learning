import type { Knex } from 'knex';
import type { IQueryParam } from '../feature-toggle/types/feature-toggle-strategies-store-type';
export interface NormalizeParamsDefaults {
    limitDefault: number;
    maxLimit?: number;
    typeDefault?: string;
}
export type SearchParams = {
    query?: string;
    offset?: string | number;
    limit?: string | number;
    sortOrder?: 'asc' | 'desc';
};
export type NormalizedSearchParams = {
    normalizedQuery?: string[];
    normalizedLimit: number;
    normalizedOffset: number;
    normalizedSortOrder: 'asc' | 'desc';
};
export declare const applySearchFilters: (qb: Knex.QueryBuilder, searchParams: string[] | undefined, columns: string[]) => void;
export declare const applyGenericQueryParams: (query: Knex.QueryBuilder, queryParams: IQueryParam[]) => void;
export declare const normalizeQueryParams: (params: SearchParams, defaults: NormalizeParamsDefaults) => NormalizedSearchParams;
export declare const parseSearchOperatorValue: (field: string, value: string) => IQueryParam | null;
//# sourceMappingURL=search-utils.d.ts.map