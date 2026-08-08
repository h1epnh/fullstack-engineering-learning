import type { FromSchema } from 'json-schema-to-ts';
export declare const updateFeatureTypeLifetimeSchema: {
    readonly $id: "#/components/schemas/updateFeatureTypeLifetimeSchema";
    readonly type: "object";
    readonly required: readonly ["lifetimeDays"];
    readonly description: "Data used when updating the lifetime of a [feature flag type](https://docs.getunleash.io/reference/feature-toggles#feature-flag-types).";
    readonly properties: {
        readonly lifetimeDays: {
            readonly description: "The new lifetime (in days) that you want to assign to the feature flag type. If the value is `null` or `0`, then the feature flags of that type will never be marked as potentially stale. Otherwise, they will be considered potentially stale after the number of days indicated by this property.";
            readonly example: 7;
            readonly type: "integer";
            readonly nullable: true;
            readonly minimum: 0;
            readonly maximum: 2147483647;
        };
    };
    readonly components: {};
};
export type UpdateFeatureTypeLifetimeSchema = FromSchema<typeof updateFeatureTypeLifetimeSchema>;
//# sourceMappingURL=update-feature-type-lifetime-schema.d.ts.map