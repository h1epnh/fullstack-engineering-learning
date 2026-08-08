import type { FromSchema } from 'json-schema-to-ts';
export declare const updateFeatureStrategySchema: {
    readonly $id: "#/components/schemas/updateFeatureStrategySchema";
    readonly type: "object";
    readonly description: "Update a strategy configuration in a feature";
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly description: "The name of the strategy type";
        };
        readonly sortOrder: {
            readonly type: "number";
            readonly description: "The order of the strategy in the list in feature environment configuration";
        };
        readonly constraints: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/components/schemas/constraintSchema";
            };
            readonly description: "A list of the constraints attached to the strategy. See https://docs.getunleash.io/reference/activation-strategies#constraints";
        };
        readonly title: {
            readonly type: "string";
            readonly nullable: true;
            readonly description: "A descriptive title for the strategy";
            readonly example: "Gradual Rollout 25-Prod";
        };
        readonly disabled: {
            readonly type: "boolean";
            readonly description: "A toggle to disable the strategy. defaults to true. Disabled strategies are not evaluated or returned to the SDKs";
            readonly example: false;
            readonly nullable: true;
        };
        readonly parameters: {
            readonly $ref: "#/components/schemas/parametersSchema";
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
            readonly parametersSchema: {
                readonly $id: "#/components/schemas/parametersSchema";
                readonly type: "object";
                readonly description: "A list of parameters for a strategy";
                readonly additionalProperties: {
                    readonly type: "string";
                };
                readonly components: {};
            };
        };
    };
};
export type UpdateFeatureStrategySchema = FromSchema<typeof updateFeatureStrategySchema>;
//# sourceMappingURL=update-feature-strategy-schema.d.ts.map