import type { FromSchema } from 'json-schema-to-ts';
export declare const adminSegmentSchema: {
    readonly $id: "#/components/schemas/adminSegmentSchema";
    readonly type: "object";
    readonly required: readonly ["id", "name", "constraints", "createdAt"];
    readonly description: "A description of a [segment](https://docs.getunleash.io/reference/segments)";
    readonly additionalProperties: false;
    readonly properties: {
        readonly id: {
            readonly type: "integer";
            readonly description: "The ID of this segment";
            readonly example: 2;
            readonly minimum: 0;
        };
        readonly name: {
            readonly type: "string";
            readonly description: "The name of this segment";
            readonly example: "ios-users";
        };
        readonly description: {
            readonly type: "string";
            readonly nullable: true;
            readonly description: "The description for this segment";
            readonly example: "IOS users segment";
        };
        readonly constraints: {
            readonly type: "array";
            readonly description: "The list of constraints that are used in this segment";
            readonly items: {
                readonly $ref: "#/components/schemas/constraintSchema";
            };
        };
        readonly usedInFeatures: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "The number of feature flags that use this segment. The number also includes the any flags with pending change requests that would add this segment.";
            readonly example: 3;
            readonly nullable: true;
        };
        readonly usedInProjects: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "The number of projects that use this segment. The number includes any projects with pending change requests that would add this segment.";
            readonly example: 2;
            readonly nullable: true;
        };
        readonly project: {
            readonly type: "string";
            readonly nullable: true;
            readonly example: "red-vista";
            readonly description: "The project the segment belongs to. Only present if the segment is a project-specific segment.";
        };
        readonly createdBy: {
            readonly description: "The creator's email or username";
            readonly example: "someone@example.com";
            readonly type: "string";
            readonly nullable: true;
        };
        readonly createdAt: {
            readonly type: "string";
            readonly format: "date-time";
            readonly description: "When the segment was created";
            readonly example: "2023-04-12T11:13:31.960Z";
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
export type AdminSegmentSchema = FromSchema<typeof adminSegmentSchema>;
//# sourceMappingURL=admin-segment-schema.d.ts.map