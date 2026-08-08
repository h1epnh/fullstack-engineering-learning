import type { FromSchema } from 'json-schema-to-ts';
export declare const validateFeatureSchema: {
    readonly $id: "#/components/schemas/validateFeatureSchema";
    readonly type: "object";
    readonly required: readonly ["name"];
    readonly description: "Data used to validate a feature flag's name.";
    readonly properties: {
        readonly name: {
            readonly description: "The feature name to validate.";
            readonly type: "string";
            readonly example: "my-feature-3";
        };
        readonly projectId: {
            readonly description: "The id of the project that the feature flag will belong to. If the target project has a feature naming pattern defined, the name will be validated against that pattern.";
            readonly nullable: true;
            readonly type: "string";
            readonly example: "project-y";
        };
    };
    readonly components: {};
};
export type ValidateFeatureSchema = FromSchema<typeof validateFeatureSchema>;
//# sourceMappingURL=validate-feature-schema.d.ts.map