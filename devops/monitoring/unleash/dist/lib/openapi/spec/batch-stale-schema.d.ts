import type { FromSchema } from 'json-schema-to-ts';
export declare const batchStaleSchema: {
    readonly $id: "#/components/schemas/batchStaleSchema";
    readonly type: "object";
    readonly description: "A list of features to operate on and whether they should be marked as stale or as not stale.";
    readonly required: readonly ["features", "stale"];
    readonly properties: {
        readonly features: {
            readonly type: "array";
            readonly description: "A list of features to mark as (not) stale";
            readonly example: readonly ["my-feature-1", "my-feature-2", "my-feature-3"];
            readonly items: {
                readonly type: "string";
                readonly description: "A feature name";
                readonly example: "my-feature-5";
            };
        };
        readonly stale: {
            readonly type: "boolean";
            readonly example: true;
            readonly description: "Whether the list of features should be marked as stale or not stale. If `true`, the features will be marked as stale. If `false`, the features will be marked as not stale.";
        };
    };
    readonly components: {
        readonly schemas: {};
    };
};
export type BatchStaleSchema = FromSchema<typeof batchStaleSchema>;
//# sourceMappingURL=batch-stale-schema.d.ts.map