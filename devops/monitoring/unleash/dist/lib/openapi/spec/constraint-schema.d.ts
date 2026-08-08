import type { FromSchema } from 'json-schema-to-ts';
export declare const constraintSchemaBase: {
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
};
export declare const constraintSchema: {
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
export type ConstraintSchema = FromSchema<typeof constraintSchema>;
//# sourceMappingURL=constraint-schema.d.ts.map