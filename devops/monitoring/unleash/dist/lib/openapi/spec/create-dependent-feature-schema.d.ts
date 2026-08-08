import type { FromSchema } from 'json-schema-to-ts';
export declare const createDependentFeatureSchema: {
    readonly $id: "#/components/schemas/createDependentFeatureSchema";
    readonly type: "object";
    readonly description: "Feature dependency on a parent feature in write model";
    readonly required: readonly ["feature"];
    readonly properties: {
        readonly feature: {
            readonly type: "string";
            readonly description: "The name of the feature we depend on.";
            readonly example: "parent_feature";
        };
        readonly enabled: {
            readonly type: "boolean";
            readonly description: "Whether the parent feature should be enabled. When `false` variants are ignored. `true` by default.";
            readonly example: false;
        };
        readonly variants: {
            readonly type: "array";
            readonly description: "The list of variants the parent feature should resolve to. Leave empty when you only want to check the `enabled` status.";
            readonly items: {
                readonly type: "string";
            };
            readonly example: readonly ["variantA", "variantB"];
        };
    };
    readonly components: {};
};
export type CreateDependentFeatureSchema = FromSchema<typeof createDependentFeatureSchema>;
//# sourceMappingURL=create-dependent-feature-schema.d.ts.map