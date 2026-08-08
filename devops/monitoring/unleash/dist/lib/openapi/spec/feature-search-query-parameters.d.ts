import type { FromQueryParams } from '../util/from-query-params';
export declare const featureSearchQueryParameters: readonly [{
    readonly name: "query";
    readonly schema: {
        readonly type: "string";
        readonly example: "feature_a";
    };
    readonly description: "The search query for the feature name or tag";
    readonly in: "query";
}, {
    readonly name: "project";
    readonly schema: {
        readonly type: "string";
        readonly example: "IS:default";
        readonly pattern: "^(IS|IS_NOT|IS_ANY_OF|IS_NONE_OF):(.*?)(,([a-zA-Z0-9_]+))*$";
    };
    readonly description: "Id of the project where search and filter is performed. The project id can be specified with an operator. The supported operators are IS, IS_NOT, IS_ANY_OF, IS_NONE_OF.";
    readonly in: "query";
}, {
    readonly name: "state";
    readonly schema: {
        readonly type: "string";
        readonly example: "IS:active";
        readonly pattern: "^(IS|IS_NOT|IS_ANY_OF|IS_NONE_OF):(.*?)(,([a-zA-Z0-9_]+))*$";
    };
    readonly description: "The state of the feature active/stale. The state can be specified with an operator. The supported operators are IS, IS_NOT, IS_ANY_OF, IS_NONE_OF.";
    readonly in: "query";
}, {
    readonly name: "type";
    readonly schema: {
        readonly type: "string";
        readonly example: "IS:release";
        readonly pattern: "^(IS|IS_NOT|IS_ANY_OF|IS_NONE_OF):(.*?)(,([a-zA-Z0-9_]+))*$";
    };
    readonly description: "The feature flag type to filter by. The type can be specified with an operator. The supported operators are IS, IS_NOT, IS_ANY_OF, IS_NONE_OF.";
    readonly in: "query";
}, {
    readonly name: "createdBy";
    readonly schema: {
        readonly type: "string";
        readonly example: "IS:1";
        readonly pattern: "^(IS|IS_NOT|IS_ANY_OF|IS_NONE_OF):(.*?)(,([a-zA-Z0-9_]+))*$";
    };
    readonly description: "The feature flag creator to filter by. The creators can be specified with an operator. The supported operators are IS, IS_NOT, IS_ANY_OF, IS_NONE_OF.";
    readonly in: "query";
}, {
    readonly name: "tag";
    readonly schema: {
        readonly type: "string";
        readonly pattern: "^(INCLUDE|DO_NOT_INCLUDE|INCLUDE_ALL_OF|INCLUDE_ANY_OF|EXCLUDE_IF_ANY_OF|EXCLUDE_ALL):([^:,]+:.+?)(,\\s*[^:,]+:.+?)*$";
        readonly example: "INCLUDE:simple:my_tag";
    };
    readonly description: "The list of feature tags to filter by. Feature tag has to specify a type and a value joined with a colon.";
    readonly in: "query";
}, {
    readonly name: "segment";
    readonly schema: {
        readonly type: "string";
        readonly pattern: "^(INCLUDE|DO_NOT_INCLUDE|INCLUDE_ALL_OF|INCLUDE_ANY_OF|EXCLUDE_IF_ANY_OF|EXCLUDE_ALL):(.*?)(,([a-zA-Z0-9_]+))*$";
        readonly example: "INCLUDE:pro-users";
    };
    readonly description: "The list of segments with operators to filter by. The segment valid operators are INCLUDE, DO_NOT_INCLUDE, INCLUDE_ALL_OF, INCLUDE_ANY_OF, EXCLUDE_IF_ANY_OF, EXCLUDE_ALL.";
    readonly in: "query";
}, {
    readonly name: "status";
    readonly schema: {
        readonly type: "array";
        readonly items: {
            readonly type: "string";
            readonly example: "production:enabled";
        };
    };
    readonly description: "The list of feature environment status to filter by. Feature environment has to specify a name and a status joined with a colon.";
    readonly in: "query";
}, {
    readonly name: "offset";
    readonly schema: {
        readonly type: "string";
        readonly example: "50";
    };
    readonly description: "The number of features to skip when returning a page. By default it is set to 0.";
    readonly in: "query";
}, {
    readonly name: "limit";
    readonly schema: {
        readonly type: "string";
        readonly example: "50";
    };
    readonly description: "The number of feature environments to return in a page. By default it is set to 50.";
    readonly in: "query";
}, {
    readonly name: "sortBy";
    readonly schema: {
        readonly type: "string";
        readonly example: "type";
    };
    readonly description: "The field to sort the results by. By default it is set to \"createdAt\".";
    readonly in: "query";
}, {
    readonly name: "sortOrder";
    readonly schema: {
        readonly type: "string";
        readonly enum: any;
        readonly example: "desc";
    };
    readonly description: "The sort order for the sortBy. By default it is det to \"asc\".";
    readonly in: "query";
}, {
    readonly name: "favoritesFirst";
    readonly schema: {
        readonly type: "string";
        readonly example: "true";
    };
    readonly description: "The flag to indicate if the favorite features should be returned first. By default it is set to false.";
    readonly in: "query";
}, {
    readonly name: "archived";
    readonly schema: {
        readonly type: "string";
        readonly example: "IS:true";
    };
    readonly description: "Whether to get results for archived feature flags or active feature flags. If `true`, Unleash will return only archived flags. If `false`, it will return only active flags.";
    readonly in: "query";
}, {
    readonly name: "createdAt";
    readonly schema: {
        readonly type: "string";
        readonly example: "IS_ON_OR_AFTER:2023-01-28";
        readonly pattern: "^(IS_BEFORE|IS_ON_OR_AFTER):\\d{4}-\\d{2}-\\d{2}$";
    };
    readonly description: "The date the feature was created. The date can be specified with an operator. The supported operators are IS_BEFORE, IS_ON_OR_AFTER.";
    readonly in: "query";
}];
export type FeatureSearchQueryParameters = Partial<FromQueryParams<typeof featureSearchQueryParameters>>;
//# sourceMappingURL=feature-search-query-parameters.d.ts.map