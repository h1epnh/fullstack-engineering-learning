import type { FromQueryParams } from '../util/from-query-params';
export declare const projectApplicationsQueryParameters: readonly [{
    readonly name: "query";
    readonly schema: {
        readonly type: "string";
        readonly example: "first_app";
    };
    readonly description: "The search query for the application name, sdk, environment";
    readonly in: "query";
}, {
    readonly name: "offset";
    readonly schema: {
        readonly type: "string";
        readonly example: "50";
    };
    readonly description: "The number of applications to skip when returning a page. By default it is set to 0.";
    readonly in: "query";
}, {
    readonly name: "limit";
    readonly schema: {
        readonly type: "string";
        readonly example: "50";
    };
    readonly description: "The number of applications to return in a page. By default it is set to 50.";
    readonly in: "query";
}, {
    readonly name: "sortBy";
    readonly schema: {
        readonly type: "string";
        readonly example: "type";
    };
    readonly description: "The field to sort the results by. By default it is set to \"appName\".";
    readonly in: "query";
}, {
    readonly name: "sortOrder";
    readonly schema: {
        readonly type: "string";
        readonly example: "desc";
    };
    readonly description: "The sort order for the sortBy. By default it is det to \"asc\".";
    readonly in: "query";
}];
export type ProjectApplicationsQueryParameters = Partial<FromQueryParams<typeof projectApplicationsQueryParameters>>;
//# sourceMappingURL=project-applications-query-parameters.d.ts.map