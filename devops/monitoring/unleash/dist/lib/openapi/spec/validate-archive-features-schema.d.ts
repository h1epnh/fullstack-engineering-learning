import type { FromSchema } from 'json-schema-to-ts';
export declare const validateArchiveFeaturesSchema: {
    readonly $id: "#/components/schemas/validateArchiveFeaturesSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "Validation details for features archive operation";
    readonly required: readonly ["parentsWithChildFeatures", "hasDeletedDependencies"];
    readonly properties: {
        readonly parentsWithChildFeatures: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly description: "List of parent features that would orphan child features that are not part of the archive operation";
            readonly example: readonly ["my-feature-4", "my-feature-5", "my-feature-6"];
        };
        readonly hasDeletedDependencies: {
            readonly type: "boolean";
            readonly description: "Whether any dependencies will be deleted as part of archive";
            readonly example: true;
        };
    };
    readonly components: {
        readonly schemas: {};
    };
};
export type ValidateArchiveFeaturesSchema = FromSchema<typeof validateArchiveFeaturesSchema>;
//# sourceMappingURL=validate-archive-features-schema.d.ts.map