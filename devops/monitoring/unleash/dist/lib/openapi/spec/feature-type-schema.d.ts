import type { FromSchema } from 'json-schema-to-ts';
export declare const featureTypeSchema: {
    readonly $id: "#/components/schemas/featureTypeSchema";
    readonly type: "object";
    readonly description: "A [feature flag type](https://docs.getunleash.io/reference/feature-toggles#feature-flag-types).";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "name", "description", "lifetimeDays"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly description: "The identifier of this feature flag type.";
            readonly example: "kill-switch";
        };
        readonly name: {
            readonly type: "string";
            readonly description: "The display name of this feature flag type.";
            readonly example: "Kill switch";
        };
        readonly description: {
            readonly type: "string";
            readonly description: "A description of what this feature flag type is intended to be used for.";
            readonly example: "Kill switch feature flags are used to quickly turn on or off critical functionality in your system.";
        };
        readonly lifetimeDays: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "How many days it takes before a feature flag of this typed is flagged as [potentially stale](https://docs.getunleash.io/reference/technical-debt#stale-and-potentially-stale-toggles) by Unleash. If this value is `null`, Unleash will never mark it as potentially stale.";
            readonly example: 40;
            readonly nullable: true;
        };
    };
    readonly components: {};
};
export type FeatureTypeSchema = FromSchema<typeof featureTypeSchema>;
//# sourceMappingURL=feature-type-schema.d.ts.map