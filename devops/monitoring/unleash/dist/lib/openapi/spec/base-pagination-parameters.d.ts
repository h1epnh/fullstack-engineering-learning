import type { FromQueryParams } from '../util/from-query-params';
export declare const basePaginationParameters: readonly [{
    readonly name: "limit";
    readonly schema: {
        readonly type: "string";
        readonly example: "50";
    };
    readonly description: "The number of results to return in a page. By default it is set to 50.";
    readonly in: "query";
}, {
    readonly name: "offset";
    readonly schema: {
        readonly type: "string";
        readonly example: "50";
    };
    readonly description: "The number of results to skip when returning a page. By default it is set to 0.";
    readonly in: "query";
}];
export type BasePaginationParameters = Partial<FromQueryParams<typeof basePaginationParameters>>;
//# sourceMappingURL=base-pagination-parameters.d.ts.map