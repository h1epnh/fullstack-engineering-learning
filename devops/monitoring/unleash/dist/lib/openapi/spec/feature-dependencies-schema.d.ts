import type { FromSchema } from 'json-schema-to-ts';
export declare const featureDependenciesSchema: {
    readonly $id: "#/components/schemas/featureDependenciesSchema";
    readonly type: "object";
    readonly description: "Feature dependency connection between a child feature and its dependencies";
    readonly required: readonly ["feature", "dependencies"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly feature: {
            readonly type: "string";
            readonly description: "The name of the child feature.";
            readonly example: "child_feature";
        };
        readonly dependencies: {
            readonly type: "array";
            readonly description: "List of parent features for the child feature";
            readonly items: {
                readonly $ref: "#/components/schemas/dependentFeatureSchema";
            };
        };
    };
    readonly components: {
        readonly schemas: {
            readonly dependentFeatureSchema: {
                readonly $id: "#/components/schemas/dependentFeatureSchema";
                readonly type: "object";
                readonly description: "Feature dependency on a parent feature in read model";
                readonly required: readonly ["feature"];
                readonly additionalProperties: false;
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
        };
    };
};
export type FeatureDependenciesSchema = FromSchema<typeof featureDependenciesSchema>;
//# sourceMappingURL=feature-dependencies-schema.d.ts.map