import type { FromQueryParams } from '../util/from-query-params';
export declare const exportQueryParameters: readonly [{
    readonly name: "format";
    readonly schema: {
        readonly type: "string";
        readonly enum: readonly ["json", "yaml"];
        readonly default: "json";
    };
    readonly description: "Desired export format. Must be either `json` or `yaml`.";
    readonly in: "query";
}, {
    readonly name: "download";
    readonly schema: {
        readonly default: false;
        readonly anyOf: readonly [{
            readonly type: "boolean";
        }, {
            readonly type: "string";
            readonly minLength: 1;
        }, {
            readonly type: "number";
        }];
    };
    readonly description: "Whether exported data should be downloaded as a file.";
    readonly in: "query";
}, {
    readonly name: "strategies";
    readonly schema: {
        readonly default: true;
        readonly anyOf: readonly [{
            readonly type: "boolean";
        }, {
            readonly type: "string";
            readonly minLength: 1;
        }, {
            readonly type: "number";
        }];
    };
    readonly description: "Whether strategies should be included in the exported data.";
    readonly in: "query";
}, {
    readonly name: "featureToggles";
    readonly schema: {
        readonly anyOf: readonly [{
            readonly type: "boolean";
        }, {
            readonly type: "string";
            readonly minLength: 1;
        }, {
            readonly type: "number";
        }];
        readonly default: true;
    };
    readonly description: "Whether feature flags should be included in the exported data.";
    readonly in: "query";
}, {
    readonly name: "projects";
    readonly schema: {
        readonly anyOf: readonly [{
            readonly type: "boolean";
        }, {
            readonly type: "string";
            readonly minLength: 1;
        }, {
            readonly type: "number";
        }];
        readonly default: true;
    };
    readonly description: "Whether projects should be included in the exported data.";
    readonly in: "query";
}, {
    readonly name: "tags";
    readonly schema: {
        readonly anyOf: readonly [{
            readonly type: "boolean";
        }, {
            readonly type: "string";
            readonly minLength: 1;
        }, {
            readonly type: "number";
        }];
        readonly default: true;
    };
    readonly description: "Whether tag types, tags, and feature_tags should be included in the exported data.";
    readonly in: "query";
}, {
    readonly name: "environments";
    readonly schema: {
        readonly anyOf: readonly [{
            readonly type: "boolean";
        }, {
            readonly type: "string";
            readonly minLength: 1;
        }, {
            readonly type: "number";
        }];
        readonly default: true;
    };
    readonly description: "Whether environments should be included in the exported data.";
    readonly in: "query";
}];
export type ExportQueryParameters = FromQueryParams<typeof exportQueryParameters>;
//# sourceMappingURL=export-query-parameters.d.ts.map