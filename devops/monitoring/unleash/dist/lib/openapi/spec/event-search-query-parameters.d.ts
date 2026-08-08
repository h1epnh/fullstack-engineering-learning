import type { FromQueryParams } from '../util/from-query-params';
export declare const eventSearchQueryParameters: readonly [{
    readonly name: "query";
    readonly schema: {
        readonly type: "string";
        readonly example: "admin@example.com";
    };
    readonly description: "Find events by a free-text search query. The query will be matched against the event data payload (if any).";
    readonly in: "query";
}, {
    readonly name: "feature";
    readonly schema: {
        readonly type: "string";
        readonly example: "IS:myfeature";
        readonly pattern: "^(IS|IS_ANY_OF):(.*?)(,([a-zA-Z0-9_]+))*$";
    };
    readonly description: "Filter by feature name using supported operators: IS, IS_ANY_OF";
    readonly in: "query";
}, {
    readonly name: "project";
    readonly schema: {
        readonly type: "string";
        readonly example: "IS:default";
        readonly pattern: "^(IS|IS_ANY_OF):(.*?)(,([a-zA-Z0-9_]+))*$";
    };
    readonly description: "Filter by projects ID using supported operators: IS, IS_ANY_OF.";
    readonly in: "query";
}, {
    readonly name: "type";
    readonly schema: {
        readonly type: "string";
        readonly example: "IS:change-added";
        readonly pattern: "^(IS|IS_ANY_OF):(.*?)(,([a-zA-Z0-9_]+))*$";
    };
    readonly description: "Filter by event type using supported operators: IS, IS_ANY_OF.";
    readonly in: "query";
}, {
    readonly name: "createdBy";
    readonly schema: {
        readonly type: "string";
        readonly example: "IS:2";
        readonly pattern: "^(IS|IS_ANY_OF):(.*?)(,([a-zA-Z0-9_]+))*$";
    };
    readonly description: "Filter by the ID of the event creator, using supported operators: IS, IS_ANY_OF.";
    readonly in: "query";
}, {
    readonly name: "from";
    readonly schema: {
        readonly type: "string";
        readonly example: "IS:2024-01-01";
        readonly pattern: "^(IS):\\d{4}-\\d{2}-\\d{2}$";
    };
    readonly description: "The starting date of the creation date range in IS:yyyy-MM-dd format";
    readonly in: "query";
}, {
    readonly name: "to";
    readonly schema: {
        readonly type: "string";
        readonly example: "IS:2024-01-31";
        readonly pattern: "^(IS):\\d{4}-\\d{2}-\\d{2}$";
    };
    readonly description: "The ending date of the creation date range in IS:yyyy-MM-dd format";
    readonly in: "query";
}, {
    readonly name: "offset";
    readonly schema: {
        readonly type: "string";
        readonly example: "50";
        readonly default: "0";
    };
    readonly description: "The number of features to skip when returning a page. By default it is set to 0.";
    readonly in: "query";
}, {
    readonly name: "limit";
    readonly schema: {
        readonly type: "string";
        readonly example: "50";
        readonly default: "50";
    };
    readonly description: "The number of feature environments to return in a page. By default it is set to 50. The maximum is 1000.";
    readonly in: "query";
}];
export type EventSearchQueryParameters = Partial<FromQueryParams<typeof eventSearchQueryParameters>>;
//# sourceMappingURL=event-search-query-parameters.d.ts.map