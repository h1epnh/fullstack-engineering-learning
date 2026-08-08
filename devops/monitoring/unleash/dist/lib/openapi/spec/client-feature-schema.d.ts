import type { FromSchema } from 'json-schema-to-ts';
export declare const clientFeatureSchema: {
    readonly $id: "#/components/schemas/clientFeatureSchema";
    readonly type: "object";
    readonly required: readonly ["name", "enabled"];
    readonly description: "Feature flag configuration used by SDKs to evaluate state of a flag";
    readonly additionalProperties: false;
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly description: "The unique name of a feature flag. Is validated to be URL safe on creation";
            readonly example: "new.payment.flow.stripe";
        };
        readonly type: {
            readonly type: "string";
            readonly description: "What kind of feature flag is this. Refer to the documentation on [feature flag types](https://docs.getunleash.io/reference/feature-toggles#feature-flag-types) for more information";
            readonly example: "release";
        };
        readonly description: {
            readonly type: "string";
            readonly description: "A description of the flag";
            readonly nullable: true;
            readonly example: "No variants here";
        };
        readonly enabled: {
            readonly type: "boolean";
            readonly description: "Whether the feature flag is enabled for the current API key or not. This is ANDed with the evaluation results of the strategies list, so if this is false, the evaluation result will always be false";
            readonly example: true;
        };
        readonly stale: {
            readonly description: "If this is true Unleash believes this feature flag has been active longer than Unleash expects a flag of this type to be active";
            readonly type: "boolean";
            readonly example: false;
        };
        readonly impressionData: {
            readonly description: "Set to true if SDKs should trigger [impression events](https://docs.getunleash.io/reference/impression-data) when this flag is evaluated";
            readonly type: "boolean";
            readonly nullable: true;
            readonly example: false;
        };
        readonly project: {
            readonly description: "Which project this feature flag belongs to";
            readonly type: "string";
            readonly example: "new.payment.flow";
        };
        readonly strategies: {
            readonly type: "array";
            readonly description: "Evaluation strategies for this flag. Each entry in this list will be evaluated and ORed together";
            readonly items: {
                readonly $ref: "#/components/schemas/featureStrategySchema";
            };
        };
        readonly variants: {
            readonly type: "array";
            readonly description: "[Variants](https://docs.getunleash.io/reference/feature-toggle-variants#what-are-variants) configured for this flag";
            readonly items: {
                readonly $ref: "#/components/schemas/variantSchema";
            };
            readonly nullable: true;
        };
        readonly dependencies: {
            readonly type: "array";
            readonly description: "Feature dependencies for this flag";
            readonly items: {
                readonly $ref: "#/components/schemas/dependentFeatureSchema";
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
            readonly featureStrategySchema: {
                readonly $id: "#/components/schemas/featureStrategySchema";
                readonly description: "A single activation strategy configuration schema for a feature";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["name"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                        readonly description: "A uuid for the feature strategy";
                        readonly example: "6b5157cb-343a-41e7-bfa3-7b4ec3044840";
                    };
                    readonly name: {
                        readonly type: "string";
                        readonly description: "The name or type of strategy";
                        readonly example: "flexibleRollout";
                    };
                    readonly title: {
                        readonly type: "string";
                        readonly description: "A descriptive title for the strategy";
                        readonly example: "Gradual Rollout 25-Prod";
                        readonly nullable: true;
                    };
                    readonly disabled: {
                        readonly type: "boolean";
                        readonly description: "A toggle to disable the strategy. defaults to false. Disabled strategies are not evaluated or returned to the SDKs";
                        readonly example: false;
                        readonly nullable: true;
                    };
                    readonly featureName: {
                        readonly type: "string";
                        readonly description: "The name or feature the strategy is attached to";
                        readonly example: "myAwesomeFeature";
                    };
                    readonly sortOrder: {
                        readonly type: "number";
                        readonly description: "The order of the strategy in the list";
                        readonly example: 9999;
                    };
                    readonly segments: {
                        readonly type: "array";
                        readonly description: "A list of segment ids attached to the strategy";
                        readonly example: readonly [1, 2];
                        readonly items: {
                            readonly type: "number";
                        };
                    };
                    readonly constraints: {
                        readonly type: "array";
                        readonly description: "A list of the constraints attached to the strategy. See https://docs.getunleash.io/reference/activation-strategies#constraints";
                        readonly items: {
                            readonly $ref: "#/components/schemas/constraintSchema";
                        };
                    };
                    readonly variants: {
                        readonly type: "array";
                        readonly description: "Strategy level variants";
                        readonly items: {
                            readonly $ref: "#/components/schemas/strategyVariantSchema";
                        };
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
                        readonly strategyVariantSchema: {
                            readonly $id: "#/components/schemas/strategyVariantSchema";
                            readonly type: "object";
                            readonly additionalProperties: false;
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
            readonly strategyVariantSchema: {
                readonly $id: "#/components/schemas/strategyVariantSchema";
                readonly type: "object";
                readonly additionalProperties: false;
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
            readonly variantSchema: {
                readonly $id: "#/components/schemas/variantSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly description: "A variant allows for further separation of users into segments. See [our excellent documentation](https://docs.getunleash.io/reference/feature-toggle-variants#what-are-variants) for a more detailed description";
                readonly required: readonly ["name", "weight"];
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly description: "The variants name. Is unique for this feature flag";
                        readonly example: "blue_group";
                    };
                    readonly weight: {
                        readonly type: "number";
                        readonly description: "The weight is the likelihood of any one user getting this variant. It is a number between 0 and 1000. See the section on [variant weights](https://docs.getunleash.io/reference/feature-toggle-variants#variant-weight) for more information";
                        readonly minimum: 0;
                        readonly maximum: 1000;
                    };
                    readonly weightType: {
                        readonly description: "Set to fix if this variant must have exactly the weight allocated to it. If the type is variable, the weight will adjust so that the total weight of all variants adds up to 1000";
                        readonly type: "string";
                        readonly example: "variable";
                        readonly enum: readonly ["variable", "fix"];
                    };
                    readonly stickiness: {
                        readonly type: "string";
                        readonly description: "[Stickiness](https://docs.getunleash.io/reference/feature-toggle-variants#variant-stickiness) is how Unleash guarantees that the same user gets the same variant every time";
                        readonly example: "custom.context.field";
                    };
                    readonly payload: {
                        readonly type: "object";
                        readonly required: readonly ["type", "value"];
                        readonly description: "Extra data configured for this variant";
                        readonly additionalProperties: false;
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
                    readonly overrides: {
                        readonly description: "Overrides assigning specific variants to specific users. The weighting system automatically assigns users to specific groups for you, but any overrides in this list will take precedence.";
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "#/components/schemas/overrideSchema";
                        };
                    };
                };
                readonly components: {
                    readonly schemas: {
                        readonly overrideSchema: {
                            readonly $id: "#/components/schemas/overrideSchema";
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly required: readonly ["contextName", "values"];
                            readonly description: "An override for deciding which variant should be assigned to a user based on the context name";
                            readonly properties: {
                                readonly contextName: {
                                    readonly description: "The name of the context field used to determine overrides";
                                    readonly type: "string";
                                    readonly example: "userId";
                                };
                                readonly values: {
                                    readonly description: "Which values that should be overriden";
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                    readonly example: readonly ["red", "blue"];
                                };
                            };
                            readonly components: {};
                        };
                    };
                };
            };
            readonly overrideSchema: {
                readonly $id: "#/components/schemas/overrideSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["contextName", "values"];
                readonly description: "An override for deciding which variant should be assigned to a user based on the context name";
                readonly properties: {
                    readonly contextName: {
                        readonly description: "The name of the context field used to determine overrides";
                        readonly type: "string";
                        readonly example: "userId";
                    };
                    readonly values: {
                        readonly description: "Which values that should be overriden";
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                        readonly example: readonly ["red", "blue"];
                    };
                };
                readonly components: {};
            };
            readonly dependentFeatureSchema: {
                readonly $id: "#/components/schemas/dependentFeatureSchema";
                readonly type: "object";
                readonly description: "Feature dependency on a parent feature in read model";
                readonly required: readonly ["feature"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly feature: {
                        readonly type: "string";
                        readonly description: "The name of the feature we depend on.";
                        readonly example: "parent_feature";
                    };
                    readonly enabled: {
                        readonly type: "boolean";
                        readonly description: "Whether the parent feature should be enabled. When `false` variants are ignored. `true` by default.";
                        readonly example: false;
                    };
                    readonly variants: {
                        readonly type: "array";
                        readonly description: "The list of variants the parent feature should resolve to. Leave empty when you only want to check the `enabled` status.";
                        readonly items: {
                            readonly type: "string";
                        };
                        readonly example: readonly ["variantA", "variantB"];
                    };
                };
                readonly components: {};
            };
        };
    };
};
export type ClientFeatureSchema = FromSchema<typeof clientFeatureSchema>;
//# sourceMappingURL=client-feature-schema.d.ts.map