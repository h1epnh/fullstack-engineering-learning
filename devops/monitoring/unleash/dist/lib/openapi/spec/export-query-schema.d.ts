import type { FromSchema } from 'json-schema-to-ts';
export declare const exportQuerySchema: {
    readonly $id: "#/components/schemas/exportQuerySchema";
    readonly type: "object";
    readonly description: "Available query parameters for  the [deprecated export/import](https://docs.getunleash.io/reference/deploy/import-export) functionality.";
    readonly anyOf: readonly [{
        readonly required: readonly ["environment", "features"];
        readonly properties: {
            readonly features: {
                readonly type: "array";
                readonly example: readonly ["MyAwesomeFeature"];
                readonly items: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly description: "Selects features to export by name. If the list is empty all features are returned.";
            };
            readonly environment: {
                readonly type: "string";
                readonly example: "development";
                readonly description: "The environment to export from";
            };
            readonly downloadFile: {
                readonly type: "boolean";
                readonly example: true;
                readonly description: "Whether to return a downloadable file";
            };
        };
    }, {
        readonly required: readonly ["environment", "tag"];
        readonly properties: {
            readonly tag: {
                readonly type: "string";
                readonly example: "release";
                readonly description: "Selects features to export by tag.";
            };
            readonly environment: {
                readonly type: "string";
                readonly example: "development";
                readonly description: "The environment to export from";
            };
            readonly downloadFile: {
                readonly type: "boolean";
                readonly example: true;
                readonly description: "Whether to return a downloadable file";
            };
        };
    }, {
        readonly required: readonly ["environment", "project"];
        readonly properties: {
            readonly project: {
                readonly type: "string";
                readonly example: "my-project";
                readonly description: "Selects project to export the features from. Used when no tags or features are provided.";
            };
            readonly environment: {
                readonly type: "string";
                readonly example: "development";
                readonly description: "The environment to export from";
            };
            readonly downloadFile: {
                readonly type: "boolean";
                readonly example: true;
                readonly description: "Whether to return a downloadable file";
            };
        };
    }];
    readonly components: {
        readonly schemas: {};
    };
};
export type ExportQuerySchema = FromSchema<typeof exportQuerySchema>;
//# sourceMappingURL=export-query-schema.d.ts.map