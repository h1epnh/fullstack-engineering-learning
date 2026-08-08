import type { FromSchema } from 'json-schema-to-ts';
export declare const updateFeatureSchema: {
    readonly $id: "#/components/schemas/updateFeatureSchema";
    readonly type: "object";
    readonly description: "Data used for updating a feature flag";
    readonly properties: {
        readonly description: {
            readonly type: "string";
            readonly example: "Controls disabling of the comments section in case of an incident";
            readonly description: "Detailed description of the feature";
        };
        readonly type: {
            readonly enum: readonly ["experiment", "kill-switch", "release", "operational", "permission"];
            readonly example: "kill-switch";
            readonly description: "Type of the flag e.g. experiment, kill-switch, release, operational, permission";
        };
        readonly stale: {
            readonly type: "boolean";
            readonly example: true;
            readonly description: "`true` if the feature is archived";
        };
        readonly archived: {
            readonly type: "boolean";
            readonly example: true;
            readonly description: "If `true` the feature flag will be moved to the [archive](https://docs.getunleash.io/reference/feature-toggles#archive-a-feature-flag) with a property `archivedAt` set to current time";
        };
        readonly impressionData: {
            readonly type: "boolean";
            readonly example: false;
            readonly description: "`true` if the impression data collection is enabled for the feature";
        };
    };
    readonly components: {
        readonly schemas: {
            readonly constraintSchema: {
                readonly type: "object";
                readonly required: readonly ["contextName", "operator"];
                readonly description: "A strategy constraint. For more information, refer to [the strategy constraint reference documentation](https://docs.getunleash.io/reference/activation-strategies#constraints)";
                readonly properties: {
                    readonly contextName: {
                        readonly description: "The name of the context field that this constraint should apply to.";
                        readonly example: "appName";
                        readonly type: "string";
                    };
                    readonly operator: {
                        readonly description: "The operator to use when evaluating this constraint. For more information about the various operators, refer to [the strategy constraint operator documentation](https://docs.getunleash.io/reference/activation-strategies#constraint-operators).";
                        readonly type: "string";
                        readonly enum: readonly ["NOT_IN", "IN", "STR_ENDS_WITH", "STR_STARTS_WITH", "STR_CONTAINS", "NUM_EQ", "NUM_GT", "NUM_GTE", "NUM_LT", "NUM_LTE", "DATE_AFTER", "DATE_BEFORE", "SEMVER_EQ", "SEMVER_GT", "SEMVER_LT"];
                        readonly example: "IN";
                    };
                    readonly caseInsensitive: {
                        readonly description: "Whether the operator should be case sensitive or not. Defaults to `false` (being case sensitive).";
                        readonly type: "boolean";
                        readonly default: false;
                    };
                    readonly inverted: {
                        readonly description: "Whether the result should be negated or not. If `true`, will turn a `true` result into a `false` result and vice versa.";
                        readonly type: "boolean";
                        readonly default: false;
                    };
                    readonly values: {
                        readonly type: "array";
                        readonly description: "The context values that should be used for constraint evaluation. Use this property instead of `value` for properties that accept multiple values.";
                        readonly items: {
                            readonly type: "string";
                        };
                        readonly example: readonly ["my-app", "my-other-app"];
                    };
                    readonly value: {
                        readonly description: "The context value that should be used for constraint evaluation. Use this property instead of `values` for properties that only accept single values.";
                        readonly type: "string";
                        readonly example: "my-app";
                    };
                };
                readonly components: {};
                readonly $id: "#/components/schemas/constraintSchema";
                readonly additionalProperties: false;
            };
        };
    };
};
export type UpdateFeatureSchema = FromSchema<typeof updateFeatureSchema>;
//# sourceMappingURL=update-feature-schema.d.ts.map