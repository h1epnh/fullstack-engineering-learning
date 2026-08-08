import type { FromSchema } from 'json-schema-to-ts';
export declare const projectEnvironmentSchema: {
    readonly $id: "#/components/schemas/projectEnvironmentSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "Add an environment to a project, optionally also sets if change requests are enabled for this environment on the project";
    readonly required: readonly ["environment"];
    readonly properties: {
        readonly environment: {
            readonly type: "string";
            readonly description: "The environment to add to the project";
            readonly example: "development";
        };
        readonly changeRequestsEnabled: {
            readonly type: "boolean";
            readonly description: "Whether change requests should be enabled or for this environment on the project or not";
            readonly example: true;
        };
        readonly defaultStrategy: {
            readonly $ref: "#/components/schemas/createFeatureStrategySchema";
            readonly description: "A default strategy to create for this environment on the project.";
        };
    };
    readonly components: {
        readonly schemas: {
            readonly createFeatureStrategySchema: {
                readonly $id: "#/components/schemas/createFeatureStrategySchema";
                readonly type: "object";
                readonly required: readonly ["name"];
                readonly description: "Create a strategy configuration in a feature";
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly description: "The name of the strategy type";
                        readonly example: "flexibleRollout";
                    };
                    readonly title: {
                        readonly type: "string";
                        readonly nullable: true;
                        readonly description: "A descriptive title for the strategy";
                        readonly example: "Gradual Rollout 25-Prod";
                    };
                    readonly disabled: {
                        readonly type: "boolean";
                        readonly description: "A toggle to disable the strategy. defaults to false. Disabled strategies are not evaluated or returned to the SDKs";
                        readonly example: false;
                        readonly nullable: true;
                    };
                    readonly sortOrder: {
                        readonly type: "number";
                        readonly description: "The order of the strategy in the list";
                        readonly example: 9999;
                    };
                    readonly constraints: {
                        readonly type: "array";
                        readonly description: "A list of the constraints attached to the strategy. See https://docs.getunleash.io/reference/activation-strategies#constraints";
                        readonly example: readonly [{
                            readonly values: readonly ["1", "2"];
                            readonly inverted: false;
                            readonly operator: "IN";
                            readonly contextName: "appName";
                            readonly caseInsensitive: false;
                        }];
                        readonly items: {
                            readonly $ref: "#/components/schemas/constraintSchema";
                        };
                    };
                    readonly variants: {
                        readonly type: "array";
                        readonly description: "Strategy level variants";
                        readonly items: {
                            readonly $ref: "#/components/schemas/createStrategyVariantSchema";
                        };
                    };
                    readonly parameters: {
                        readonly description: "An object containing the parameters for the strategy";
                        readonly example: {
                            readonly groupId: "some_new";
                            readonly rollout: "25";
                            readonly stickiness: "sessionId";
                        };
                        readonly $ref: "#/components/schemas/parametersSchema";
                    };
                    readonly segments: {
                        readonly type: "array";
                        readonly description: "Ids of segments to use for this strategy";
                        readonly example: readonly [1, 2];
                        readonly items: {
                            readonly type: "number";
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
                        readonly parametersSchema: {
                            readonly $id: "#/components/schemas/parametersSchema";
                            readonly type: "object";
                            readonly description: "A list of parameters for a strategy";
                            readonly additionalProperties: {
                                readonly type: "string";
                            };
                            readonly components: {};
                        };
                        readonly createStrategyVariantSchema: {
                            readonly $id: "#/components/schemas/createStrategyVariantSchema";
                            readonly type: "object";
                            readonly description: "This is an experimental property. It may change or be removed as we work on it. Please don't depend on it yet. A strategy variant allows you to attach any data to strategies instead of only returning `true`/`false`. Strategy variants take precedence over feature variants.";
                            readonly required: readonly ["name", "weight", "weightType", "stickiness"];
                            readonly properties: {
                                readonly name: {
                                    readonly type: "string";
                                    readonly description: "The variant name. Must be unique for this feature flag";
                                    readonly example: "blue_group";
                                };
                                readonly weight: {
                                    readonly type: "integer";
                                    readonly description: "The weight is the likelihood of any one user getting this variant. It is an integer between 0 and 1000. See the section on [variant weights](https://docs.getunleash.io/reference/feature-toggle-variants#variant-weight) for more information";
                                    readonly minimum: 0;
                                    readonly maximum: 1000;
                                };
                                readonly weightType: {
                                    readonly description: "Set to `fix` if this variant must have exactly the weight allocated to it. If the type is `variable`, the weight will adjust so that the total weight of all variants adds up to 1000. Refer to the [variant weight documentation](https://docs.getunleash.io/reference/feature-toggle-variants#variant-weight).";
                                    readonly type: "string";
                                    readonly example: "fix";
                                    readonly enum: readonly ["variable", "fix"];
                                };
                                readonly stickiness: {
                                    readonly type: "string";
                                    readonly description: "The [stickiness](https://docs.getunleash.io/reference/feature-toggle-variants#variant-stickiness) to use for distribution of this variant. Stickiness is how Unleash guarantees that the same user gets the same variant every time";
                                    readonly example: "custom.context.field";
                                };
                                readonly payload: {
                                    readonly type: "object";
                                    readonly required: readonly ["type", "value"];
                                    readonly description: "Extra data configured for this variant";
                                    readonly properties: {
                                        readonly type: {
                                            readonly description: "The type of the value. Commonly used types are string, number, json and csv.";
                                            readonly type: "string";
                                            readonly enum: readonly ["json", "csv", "string", "number"];
                                        };
                                        readonly value: {
                                            readonly description: "The actual value of payload";
                                            readonly type: "string";
                                        };
                                    };
                                    readonly example: {
                                        readonly type: "json";
                                        readonly value: "{\"color\": \"red\"}";
                                    };
                                };
                            };
                            readonly components: {};
                        };
                    };
                };
            };
            readonly createStrategyVariantSchema: {
                readonly $id: "#/components/schemas/createStrategyVariantSchema";
                readonly type: "object";
                readonly description: "This is an experimental property. It may change or be removed as we work on it. Please don't depend on it yet. A strategy variant allows you to attach any data to strategies instead of only returning `true`/`false`. Strategy variants take precedence over feature variants.";
                readonly required: readonly ["name", "weight", "weightType", "stickiness"];
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly description: "The variant name. Must be unique for this feature flag";
                        readonly example: "blue_group";
                    };
                    readonly weight: {
                        readonly type: "integer";
                        readonly description: "The weight is the likelihood of any one user getting this variant. It is an integer between 0 and 1000. See the section on [variant weights](https://docs.getunleash.io/reference/feature-toggle-variants#variant-weight) for more information";
                        readonly minimum: 0;
                        readonly maximum: 1000;
                    };
                    readonly weightType: {
                        readonly description: "Set to `fix` if this variant must have exactly the weight allocated to it. If the type is `variable`, the weight will adjust so that the total weight of all variants adds up to 1000. Refer to the [variant weight documentation](https://docs.getunleash.io/reference/feature-toggle-variants#variant-weight).";
                        readonly type: "string";
                        readonly example: "fix";
                        readonly enum: readonly ["variable", "fix"];
                    };
                    readonly stickiness: {
                        readonly type: "string";
                        readonly description: "The [stickiness](https://docs.getunleash.io/reference/feature-toggle-variants#variant-stickiness) to use for distribution of this variant. Stickiness is how Unleash guarantees that the same user gets the same variant every time";
                        readonly example: "custom.context.field";
                    };
                    readonly payload: {
                        readonly type: "object";
                        readonly required: readonly ["type", "value"];
                        readonly description: "Extra data configured for this variant";
                        readonly properties: {
                            readonly type: {
                                readonly description: "The type of the value. Commonly used types are string, number, json and csv.";
                                readonly type: "string";
                                readonly enum: readonly ["json", "csv", "string", "number"];
                            };
                            readonly value: {
                                readonly description: "The actual value of payload";
                                readonly type: "string";
                            };
                        };
                        readonly example: {
                            readonly type: "json";
                            readonly value: "{\"color\": \"red\"}";
                        };
                    };
                };
                readonly components: {};
            };
        };
    };
};
export type ProjectEnvironmentSchema = FromSchema<typeof projectEnvironmentSchema>;
//# sourceMappingURL=project-environment-schema.d.ts.map