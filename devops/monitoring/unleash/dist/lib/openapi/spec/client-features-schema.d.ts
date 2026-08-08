import type { FromSchema } from 'json-schema-to-ts';
export declare const clientFeaturesSchema: {
    readonly $id: "#/components/schemas/clientFeaturesSchema";
    readonly type: "object";
    readonly required: readonly ["version", "features"];
    readonly description: "Configuration data for server-side SDKs for evaluating feature flags.";
    readonly properties: {
        readonly version: {
            readonly type: "number";
            readonly description: "A version number for the format used in the response. Most Unleash instances now return version 2, which includes segments as a separate array";
            readonly example: 2;
            readonly minimum: 0;
        };
        readonly features: {
            readonly description: "A list of feature flags with their configuration";
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/components/schemas/clientFeatureSchema";
            };
        };
        readonly segments: {
            readonly description: "A list of [Segments](https://docs.getunleash.io/reference/segments) configured for this Unleash instance";
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/components/schemas/clientSegmentSchema";
            };
        };
        readonly query: {
            readonly description: "A summary of filters and parameters sent to the endpoint. Used by the server to build the features and segments response";
            readonly $ref: "#/components/schemas/clientFeaturesQuerySchema";
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
            readonly clientFeatureSchema: {
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
            readonly environmentSchema: {
                readonly $id: "#/components/schemas/environmentSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["name", "type", "enabled", "protected", "sortOrder"];
                readonly description: "A definition of the project environment";
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly example: "my-dev-env";
                        readonly description: "The name of the environment";
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly example: "development";
                        readonly description: "The [type of environment](https://docs.getunleash.io/reference/environments#environment-types).";
                    };
                    readonly enabled: {
                        readonly type: "boolean";
                        readonly example: true;
                        readonly description: "`true` if the environment is enabled for the project, otherwise `false`.";
                    };
                    readonly protected: {
                        readonly type: "boolean";
                        readonly example: true;
                        readonly description: "`true` if the environment is protected, otherwise `false`. A *protected* environment can not be deleted.";
                    };
                    readonly sortOrder: {
                        readonly type: "integer";
                        readonly example: 3;
                        readonly description: "Priority of the environment in a list of environments, the lower the value, the higher up in the list the environment will appear. Needs to be an integer";
                    };
                    readonly projectCount: {
                        readonly type: "integer";
                        readonly nullable: true;
                        readonly minimum: 0;
                        readonly example: 10;
                        readonly description: "The number of projects with this environment";
                    };
                    readonly apiTokenCount: {
                        readonly type: "integer";
                        readonly nullable: true;
                        readonly minimum: 0;
                        readonly example: 6;
                        readonly description: "The number of API tokens for the project environment";
                    };
                    readonly enabledToggleCount: {
                        readonly type: "integer";
                        readonly nullable: true;
                        readonly minimum: 0;
                        readonly example: 10;
                        readonly description: "The number of enabled toggles for the project environment";
                    };
                    readonly requiredApprovals: {
                        readonly type: "integer";
                        readonly nullable: true;
                        readonly description: "Experimental field. The number of approvals required before a change request can be applied in this environment.";
                        readonly minimum: 1;
                        readonly example: 3;
                    };
                };
                readonly components: {};
            };
            readonly clientSegmentSchema: {
                readonly $id: "#/components/schemas/clientSegmentSchema";
                readonly type: "object";
                readonly description: "Represents a client API segment of users defined by a set of constraints.";
                readonly additionalProperties: false;
                readonly required: readonly ["id", "constraints"];
                readonly properties: {
                    readonly id: {
                        readonly type: "number";
                        readonly description: "The segment's id.";
                    };
                    readonly name: {
                        readonly type: "string";
                        readonly description: "The name of the segment.";
                        readonly example: "segment A";
                    };
                    readonly constraints: {
                        readonly type: "array";
                        readonly description: "List of constraints that determine which users are part of the segment";
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
            readonly clientFeaturesQuerySchema: {
                readonly $id: "#/components/schemas/clientFeaturesQuerySchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly description: "Query parameters active for a client features request";
                readonly properties: {
                    readonly tag: {
                        readonly type: "array";
                        readonly description: "Features tagged with one of these tags are included";
                        readonly items: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        };
                        readonly example: readonly [readonly ["simple:payment", "simple:stripejourney"]];
                    };
                    readonly project: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                        readonly description: "Features that are part of these projects are included in this response. This is now handled by API tokens and was marked as deprecated in v5";
                        readonly example: readonly ["new.payment.flow"];
                        readonly deprecated: true;
                    };
                    readonly namePrefix: {
                        readonly description: "Features are filtered to only include features whose name starts with this prefix";
                        readonly type: "string";
                        readonly example: "payment";
                    };
                    readonly environment: {
                        readonly type: "string";
                        readonly description: "Strategies for the feature flag configured for this environment are included. This is now handled by API tokens and was marked as deprecated in v5";
                        readonly deprecated: true;
                    };
                    readonly inlineSegmentConstraints: {
                        readonly description: "Set to true if requesting client does not support Unleash-Client-Specification 4.2.2 or newer. Modern SDKs will have this set to false, since they will be able to merge constraints and segments themselves";
                        readonly type: "boolean";
                        readonly example: true;
                    };
                };
                readonly components: {};
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
export type ClientFeaturesSchema = FromSchema<typeof clientFeaturesSchema>;
//# sourceMappingURL=client-features-schema.d.ts.map