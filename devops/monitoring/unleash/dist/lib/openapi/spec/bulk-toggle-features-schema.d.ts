import type { FromSchema } from 'json-schema-to-ts';
export declare const bulkToggleFeaturesSchema: {
    readonly $id: "#/components/schemas/bulkToggleFeaturesSchema";
    readonly type: "object";
    readonly required: readonly ["features"];
    readonly description: "The feature list used for bulk toggle operations";
    readonly properties: {
        readonly features: {
            readonly type: "array";
            readonly description: "The features that we want to bulk toggle";
            readonly items: {
                readonly type: "string";
                readonly description: "The feature name we want to toggle";
            };
            readonly example: readonly ["feature-a", "feature-b"];
        };
    };
    readonly components: {};
};
export type BulkToggleFeaturesSchema = FromSchema<typeof bulkToggleFeaturesSchema>;
//# sourceMappingURL=bulk-toggle-features-schema.d.ts.map