import type { FromSchema } from 'json-schema-to-ts';
export declare const upsertSegmentSchema: {
    readonly $id: "#/components/schemas/upsertSegmentSchema";
    readonly type: "object";
    readonly description: "Data used to create or update a segment";
    readonly required: readonly ["name", "constraints"];
    readonly properties: {
        readonly name: {
            readonly description: "The name of the segment";
            readonly example: "beta-users";
            readonly type: "string";
        };
        readonly description: {
            readonly type: "string";
            readonly nullable: true;
            readonly description: "A description of what the segment is for";
            readonly example: "Users willing to help us test and build new features.";
        };
        readonly project: {
            readonly type: "string";
            readonly nullable: true;
            readonly description: "The project the segment belongs to if any.";
            readonly example: "red-vista";
        };
        readonly constraints: {
            readonly type: "array";
            readonly description: "The list of constraints that make up this segment";
            readonly items: {
                readonly $ref: "#/components/schemas/constraintSchema";
            };
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
export type UpsertSegmentSchema = FromSchema<typeof upsertSegmentSchema>;
//# sourceMappingURL=upsert-segment-schema.d.ts.map