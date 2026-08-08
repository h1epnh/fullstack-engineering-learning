import type { FromSchema } from 'json-schema-to-ts';
export declare const exportResultSchema: {
    readonly $id: "#/components/schemas/exportResultSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "The result of the export operation, providing you with the feature flag definitions, strategy definitions and the rest of the elements relevant to the features (tags, environments etc.)";
    readonly required: readonly ["features", "featureStrategies", "tagTypes"];
    readonly properties: {
        readonly features: {
            readonly type: "array";
            readonly description: "All the exported features.";
            readonly example: readonly [{
                readonly name: "my-feature";
                readonly description: "best feature ever";
                readonly type: "release";
                readonly project: "default";
                readonly stale: false;
                readonly impressionData: false;
                readonly archived: false;
            }];
            readonly items: {
                readonly $ref: "#/components/schemas/featureSchema";
            };
        };
        readonly featureStrategies: {
            readonly type: "array";
            readonly description: "All strategy instances that are used by the exported features in the `features` list.";
            readonly example: readonly [{
                readonly name: "flexibleRollout";
                readonly id: "924974d7-8003-43ee-87eb-c5f887c06fd1";
                readonly featureName: "my-feature";
                readonly title: "Rollout 50%";
                readonly parameters: {
                    readonly groupId: "default";
                    readonly rollout: "50";
                    readonly stickiness: "random";
                };
                readonly constraints: readonly [];
                readonly disabled: false;
                readonly segments: readonly [1];
            }];
            readonly items: {
                readonly $ref: "#/components/schemas/featureStrategySchema";
            };
        };
        readonly featureEnvironments: {
            readonly type: "array";
            readonly description: "Environment-specific configuration for all the features in the `features` list. Includes data such as whether the feature is enabled in the selected export environment, whether there are any variants assigned, etc.";
            readonly example: readonly [{
                readonly enabled: true;
                readonly featureName: "my-feature";
                readonly environment: "development";
                readonly variants: readonly [{
                    readonly name: "a";
                    readonly weight: 500;
                    readonly overrides: readonly [];
                    readonly stickiness: "random";
                    readonly weightType: "variable";
                }, {
                    readonly name: "b";
                    readonly weight: 500;
                    readonly overrides: readonly [];
                    readonly stickiness: "random";
                    readonly weightType: "variable";
                }];
                readonly name: "variant-testing";
            }];
            readonly items: {
                readonly $ref: "#/components/schemas/featureEnvironmentSchema";
            };
        };
        readonly contextFields: {
            readonly type: "array";
            readonly description: "A list of all the context fields that are in use by any of the strategies in the `featureStrategies` list.";
            readonly example: readonly [{
                readonly name: "appName";
                readonly description: "Allows you to constrain on application name";
                readonly stickiness: false;
                readonly sortOrder: 2;
                readonly legalValues: readonly [];
            }];
            readonly items: {
                readonly $ref: "#/components/schemas/contextFieldSchema";
            };
        };
        readonly featureTags: {
            readonly type: "array";
            readonly description: "A list of all the tags that have been applied to any of the features in the `features` list.";
            readonly example: readonly [{
                readonly featureName: "my-feature";
                readonly tagType: "simple";
                readonly tagValue: "user-facing";
            }];
            readonly items: {
                readonly $ref: "#/components/schemas/featureTagSchema";
            };
        };
        readonly segments: {
            readonly type: "array";
            readonly description: "A list of all the segments that are used by the strategies in the `featureStrategies` list.";
            readonly example: readonly [{
                readonly id: 1;
                readonly name: "new-segment-name";
            }];
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["id", "name"];
                readonly properties: {
                    readonly id: {
                        readonly type: "number";
                    };
                    readonly name: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly tagTypes: {
            readonly type: "array";
            readonly description: "A list of all of the tag types that are used in the `featureTags` list.";
            readonly example: readonly [{
                readonly name: "simple";
                readonly description: "Used to simplify filtering of features";
                readonly icon: "#";
            }];
            readonly items: {
                readonly $ref: "#/components/schemas/tagTypeSchema";
            };
        };
        readonly dependencies: {
            readonly type: "array";
            readonly description: "A list of all the dependencies for features in `features` list.";
            readonly items: {
                readonly $ref: "#/components/schemas/featureDependenciesSchema";
            };
        };
    };
    readonly components: {
        readonly schemas: {
            readonly featureSchema: {
                readonly $id: "#/components/schemas/featureSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["name"];
                readonly description: "A feature flag definition";
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly example: "disable-comments";
                        readonly description: "Unique feature name";
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly example: "kill-switch";
                        readonly description: "Type of the flag e.g. experiment, kill-switch, release, operational, permission";
                    };
                    readonly description: {
                        readonly type: "string";
                        readonly nullable: true;
                        readonly example: "Controls disabling of the comments section in case of an incident";
                        readonly description: "Detailed description of the feature";
                    };
                    readonly archived: {
                        readonly type: "boolean";
                        readonly example: true;
                        readonly description: "`true` if the feature is archived";
                    };
                    readonly project: {
                        readonly type: "string";
                        readonly example: "dx-squad";
                        readonly description: "Name of the project the feature belongs to";
                    };
                    readonly enabled: {
                        readonly type: "boolean";
                        readonly example: true;
                        readonly description: "`true` if the feature is enabled, otherwise `false`.";
                    };
                    readonly stale: {
                        readonly type: "boolean";
                        readonly example: false;
                        readonly description: "`true` if the feature is stale based on the age and feature type, otherwise `false`.";
                    };
                    readonly favorite: {
                        readonly type: "boolean";
                        readonly example: true;
                        readonly description: "`true` if the feature was favorited, otherwise `false`.";
                    };
                    readonly impressionData: {
                        readonly type: "boolean";
                        readonly example: false;
                        readonly description: "`true` if the impression data collection is enabled for the feature, otherwise `false`.";
                    };
                    readonly createdAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly nullable: true;
                        readonly example: "2023-01-28T15:21:39.975Z";
                        readonly description: "The date the feature was created";
                    };
                    readonly createdBy: {
                        readonly type: "object";
                        readonly description: "User who created the feature flag";
                        readonly additionalProperties: false;
                        readonly required: readonly ["id", "name", "imageUrl"];
                        readonly properties: {
                            readonly id: {
                                readonly description: "The user id";
                                readonly type: "integer";
                                readonly example: 123;
                            };
                            readonly name: {
                                readonly description: "Name of the user";
                                readonly type: "string";
                                readonly example: "User";
                            };
                            readonly imageUrl: {
                                readonly description: "URL used for the user profile image";
                                readonly type: "string";
                                readonly example: "https://example.com/242x200.png";
                            };
                        };
                    };
                    readonly archivedAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly nullable: true;
                        readonly example: "2023-01-29T15:21:39.975Z";
                        readonly description: "The date the feature was archived";
                    };
                    readonly lastSeenAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly nullable: true;
                        readonly deprecated: true;
                        readonly example: "2023-01-28T16:21:39.975Z";
                        readonly description: "The date when metrics where last collected for the feature. This field was deprecated in v5, use the one in featureEnvironmentSchema";
                    };
                    readonly environments: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "#/components/schemas/featureEnvironmentSchema";
                        };
                        readonly description: "The list of environments where the feature can be used";
                    };
                    readonly variants: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "#/components/schemas/variantSchema";
                        };
                        readonly description: "The list of feature variants";
                        readonly deprecated: true;
                    };
                    readonly strategies: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                        };
                        readonly description: "This was deprecated in v5 and will be removed in a future major version";
                        readonly deprecated: true;
                    };
                    readonly tags: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "#/components/schemas/tagSchema";
                        };
                        readonly nullable: true;
                        readonly description: "The list of feature tags";
                    };
                    readonly children: {
                        readonly type: "array";
                        readonly description: "The list of child feature names. This is an experimental field and may change.";
                        readonly items: {
                            readonly type: "string";
                            readonly example: "some-feature";
                        };
                    };
                    readonly lifecycle: {
                        readonly type: "object";
                        readonly description: "Current lifecycle stage of the feature";
                        readonly additionalProperties: false;
                        readonly required: readonly ["stage", "enteredStageAt"];
                        readonly properties: {
                            readonly stage: {
                                readonly description: "The name of the current lifecycle stage";
                                readonly type: "string";
                                readonly enum: readonly ["initial", "pre-live", "live", "completed", "archived"];
                                readonly example: "initial";
                            };
                            readonly enteredStageAt: {
                                readonly description: "When the feature entered this stage";
                                readonly type: "string";
                                readonly format: "date-time";
                                readonly example: "2023-01-28T15:21:39.975Z";
                            };
                        };
                    };
                    readonly dependencies: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly required: readonly ["feature"];
                            readonly properties: {
                                readonly feature: {
                                    readonly description: "The name of the parent feature";
                                    readonly type: "string";
                                    readonly example: "some-feature";
                                };
                                readonly enabled: {
                                    readonly description: "Whether the parent feature is enabled or not";
                                    readonly type: "boolean";
                                    readonly example: true;
                                };
                                readonly variants: {
                                    readonly description: "The list of variants the parent feature should resolve to. Only valid when feature is enabled.";
                                    readonly type: "array";
                                    readonly items: {
                                        readonly example: "some-feature-blue-variant";
                                        readonly type: "string";
                                    };
                                };
                            };
                        };
                        readonly description: "The list of parent dependencies. This is an experimental field and may change.";
                    };
                    readonly collaborators: {
                        readonly type: "object";
                        readonly required: readonly ["users"];
                        readonly description: "Information related to users who have made changes to this feature flage.";
                        readonly properties: {
                            readonly users: {
                                readonly description: "Users who have made any changes to this feature flags. The list is sorted in reverse chronological order (most recent changes first)";
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "object";
                                    readonly required: readonly ["id", "name", "imageUrl"];
                                    readonly description: "A simple representation of a user.";
                                    readonly properties: {
                                        readonly id: {
                                            readonly description: "The user's id";
                                            readonly type: "integer";
                                            readonly example: 123;
                                        };
                                        readonly name: {
                                            readonly description: "The user's name, username, or email (prioritized in that order). If none of those are present, this property will be set to the string `unknown`";
                                            readonly type: "string";
                                            readonly example: "User";
                                        };
                                        readonly imageUrl: {
                                            readonly description: "The URL to the user's profile image";
                                            readonly type: "string";
                                            readonly example: "https://example.com/242x200.png";
                                        };
                                    };
                                };
                            };
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
                        readonly featureEnvironmentSchema: {
                            readonly $id: "#/components/schemas/featureEnvironmentSchema";
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly required: readonly ["name", "enabled"];
                            readonly description: "A detailed description of the feature environment";
                            readonly properties: {
                                readonly name: {
                                    readonly type: "string";
                                    readonly example: "my-dev-env";
                                    readonly description: "The name of the environment";
                                };
                                readonly featureName: {
                                    readonly type: "string";
                                    readonly example: "disable-comments";
                                    readonly description: "The name of the feature";
                                };
                                readonly environment: {
                                    readonly type: "string";
                                    readonly example: "development";
                                    readonly description: "The name of the environment";
                                };
                                readonly type: {
                                    readonly type: "string";
                                    readonly example: "development";
                                    readonly description: "The type of the environment";
                                };
                                readonly enabled: {
                                    readonly type: "boolean";
                                    readonly example: true;
                                    readonly description: "`true` if the feature is enabled for the environment, otherwise `false`.";
                                };
                                readonly sortOrder: {
                                    readonly type: "number";
                                    readonly example: 3;
                                    readonly description: "The sort order of the feature environment in the feature environments list";
                                };
                                readonly variantCount: {
                                    readonly type: "number";
                                    readonly description: "The number of defined variants";
                                };
                                readonly strategies: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly $ref: "#/components/schemas/featureStrategySchema";
                                    };
                                    readonly description: "A list of activation strategies for the feature environment";
                                };
                                readonly variants: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly $ref: "#/components/schemas/variantSchema";
                                    };
                                    readonly description: "A list of variants for the feature environment";
                                };
                                readonly lastSeenAt: {
                                    readonly type: "string";
                                    readonly format: "date-time";
                                    readonly nullable: true;
                                    readonly example: "2023-01-28T16:21:39.975Z";
                                    readonly description: "The date when metrics where last collected for the feature environment";
                                };
                                readonly hasStrategies: {
                                    readonly type: "boolean";
                                    readonly description: "Whether the feature has any strategies defined.";
                                };
                                readonly hasEnabledStrategies: {
                                    readonly type: "boolean";
                                    readonly description: "Whether the feature has any enabled strategies defined.";
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
                                };
                            };
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
                        readonly tagSchema: {
                            readonly $id: "#/components/schemas/tagSchema";
                            readonly type: "object";
                            readonly description: "Representation of a [tag](https://docs.getunleash.io/reference/feature-toggles#tags)";
                            readonly additionalProperties: false;
                            readonly required: readonly ["value", "type"];
                            readonly properties: {
                                readonly value: {
                                    readonly type: "string";
                                    readonly description: "The value of the tag.";
                                    readonly minLength: 2;
                                    readonly maxLength: 50;
                                    readonly example: "a-tag-value";
                                };
                                readonly type: {
                                    readonly type: "string";
                                    readonly minLength: 2;
                                    readonly maxLength: 50;
                                    readonly description: "The [type](https://docs.getunleash.io/reference/feature-toggles#tags) of the tag";
                                    readonly example: "simple";
                                };
                                readonly color: {
                                    readonly type: "string";
                                    readonly description: "The hexadecimal color code for the tag type.";
                                    readonly example: "#FFFFFF";
                                    readonly pattern: "^#[0-9A-Fa-f]{6}$";
                                    readonly nullable: true;
                                };
                            };
                            readonly components: {};
                        };
                    };
                };
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
            readonly featureEnvironmentSchema: {
                readonly $id: "#/components/schemas/featureEnvironmentSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["name", "enabled"];
                readonly description: "A detailed description of the feature environment";
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly example: "my-dev-env";
                        readonly description: "The name of the environment";
                    };
                    readonly featureName: {
                        readonly type: "string";
                        readonly example: "disable-comments";
                        readonly description: "The name of the feature";
                    };
                    readonly environment: {
                        readonly type: "string";
                        readonly example: "development";
                        readonly description: "The name of the environment";
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly example: "development";
                        readonly description: "The type of the environment";
                    };
                    readonly enabled: {
                        readonly type: "boolean";
                        readonly example: true;
                        readonly description: "`true` if the feature is enabled for the environment, otherwise `false`.";
                    };
                    readonly sortOrder: {
                        readonly type: "number";
                        readonly example: 3;
                        readonly description: "The sort order of the feature environment in the feature environments list";
                    };
                    readonly variantCount: {
                        readonly type: "number";
                        readonly description: "The number of defined variants";
                    };
                    readonly strategies: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "#/components/schemas/featureStrategySchema";
                        };
                        readonly description: "A list of activation strategies for the feature environment";
                    };
                    readonly variants: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "#/components/schemas/variantSchema";
                        };
                        readonly description: "A list of variants for the feature environment";
                    };
                    readonly lastSeenAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly nullable: true;
                        readonly example: "2023-01-28T16:21:39.975Z";
                        readonly description: "The date when metrics where last collected for the feature environment";
                    };
                    readonly hasStrategies: {
                        readonly type: "boolean";
                        readonly description: "Whether the feature has any strategies defined.";
                    };
                    readonly hasEnabledStrategies: {
                        readonly type: "boolean";
                        readonly description: "Whether the feature has any enabled strategies defined.";
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
                    };
                };
            };
            readonly contextFieldSchema: {
                readonly $id: "#/components/schemas/contextFieldSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly description: "A representation of a [context field](https://docs.getunleash.io/reference/unleash-context).";
                readonly required: readonly ["name"];
                readonly properties: {
                    readonly name: {
                        readonly description: "The name of the context field";
                        readonly type: "string";
                        readonly example: "userId";
                    };
                    readonly description: {
                        readonly description: "The description of the context field.";
                        readonly type: "string";
                        readonly nullable: true;
                        readonly example: "Used to uniquely identify users";
                    };
                    readonly stickiness: {
                        readonly description: "Does this context field support being used for [stickiness](https://docs.getunleash.io/reference/stickiness) calculations";
                        readonly type: "boolean";
                        readonly example: true;
                    };
                    readonly sortOrder: {
                        readonly description: "Used when sorting a list of context fields. Is also used as a tiebreaker if a list of context fields is sorted alphabetically.";
                        readonly type: "integer";
                        readonly example: 900;
                    };
                    readonly createdAt: {
                        readonly description: "When this context field was created";
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly nullable: true;
                        readonly example: "2023-06-29T10:19:00.000Z";
                    };
                    readonly usedInFeatures: {
                        readonly type: "integer";
                        readonly description: "Number of projects where this context field is used in";
                        readonly example: 3;
                        readonly nullable: true;
                        readonly minimum: 0;
                    };
                    readonly usedInProjects: {
                        readonly type: "integer";
                        readonly description: "Number of projects where this context field is used in";
                        readonly example: 2;
                        readonly nullable: true;
                        readonly minimum: 0;
                    };
                    readonly legalValues: {
                        readonly description: "Allowed values for this context field schema. Can be used to narrow down accepted input";
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "#/components/schemas/legalValueSchema";
                        };
                    };
                };
                readonly components: {
                    readonly schemas: {
                        readonly legalValueSchema: {
                            readonly $id: "#/components/schemas/legalValueSchema";
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly description: "Describes a legal value. Typically used to limit possible values for contextFields or strategy properties";
                            readonly required: readonly ["value"];
                            readonly properties: {
                                readonly value: {
                                    readonly description: "The valid value";
                                    readonly type: "string";
                                    readonly example: "#c154c1";
                                };
                                readonly description: {
                                    readonly description: "Describes this specific legal value";
                                    readonly type: "string";
                                    readonly example: "Deep fuchsia";
                                };
                            };
                            readonly components: {};
                        };
                    };
                };
            };
            readonly featureTagSchema: {
                readonly $id: "#/components/schemas/featureTagSchema";
                readonly type: "object";
                readonly description: "Describes a tag applied to a feature";
                readonly additionalProperties: false;
                readonly required: readonly ["featureName", "tagValue"];
                readonly properties: {
                    readonly featureName: {
                        readonly type: "string";
                        readonly example: "my-feature";
                        readonly description: "The name of the feature this tag is applied to";
                    };
                    readonly tagType: {
                        readonly type: "string";
                        readonly example: "simple";
                        readonly description: "The [type](https://docs.getunleash.io/reference/feature-toggles#tags tag types) of the tag";
                    };
                    readonly tagValue: {
                        readonly type: "string";
                        readonly example: "my-tag";
                        readonly description: "The value of the tag";
                    };
                    readonly type: {
                        readonly deprecated: true;
                        readonly type: "string";
                        readonly description: "The [type](https://docs.getunleash.io/reference/feature-toggles#tags tag types) of the tag. This property is deprecated and will be removed in a future version of Unleash. Superseded by the `tagType` property.";
                    };
                    readonly value: {
                        readonly deprecated: true;
                        readonly type: "string";
                        readonly description: "The value of the tag. This property is deprecated and will be removed in a future version of Unleash. Superseded by the `tagValue` property.";
                    };
                    readonly createdByUserId: {
                        readonly type: "number";
                        readonly nullable: true;
                        readonly example: 1;
                        readonly description: "The id of the user who created this tag";
                    };
                };
                readonly components: {};
            };
            readonly variantsSchema: {
                readonly $id: "#/components/schemas/variantsSchema";
                readonly type: "array";
                readonly description: "A list of variants";
                readonly items: {
                    readonly $ref: "#/components/schemas/variantSchema";
                };
                readonly components: {
                    readonly schemas: {
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
                    };
                };
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
            readonly legalValueSchema: {
                readonly $id: "#/components/schemas/legalValueSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly description: "Describes a legal value. Typically used to limit possible values for contextFields or strategy properties";
                readonly required: readonly ["value"];
                readonly properties: {
                    readonly value: {
                        readonly description: "The valid value";
                        readonly type: "string";
                        readonly example: "#c154c1";
                    };
                    readonly description: {
                        readonly description: "Describes this specific legal value";
                        readonly type: "string";
                        readonly example: "Deep fuchsia";
                    };
                };
                readonly components: {};
            };
            readonly tagTypeSchema: {
                readonly $id: "#/components/schemas/tagTypeSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly description: "A tag type.";
                readonly required: readonly ["name"];
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly description: "The name of the tag type.";
                        readonly example: "color";
                    };
                    readonly description: {
                        readonly type: "string";
                        readonly description: "The description of the tag type.";
                        readonly example: "A tag type for describing the color of a tag.";
                    };
                    readonly icon: {
                        readonly type: "string";
                        readonly nullable: true;
                        readonly description: "The icon of the tag type.";
                        readonly example: "not-really-used";
                    };
                    readonly color: {
                        readonly type: "string";
                        readonly nullable: true;
                        readonly description: "The hexadecimal color code for the tag type.";
                        readonly example: "#FFFFFF";
                        readonly pattern: "^#[0-9A-Fa-f]{6}$";
                    };
                };
                readonly components: {};
            };
            readonly featureDependenciesSchema: {
                readonly $id: "#/components/schemas/featureDependenciesSchema";
                readonly type: "object";
                readonly description: "Feature dependency connection between a child feature and its dependencies";
                readonly required: readonly ["feature", "dependencies"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly feature: {
                        readonly type: "string";
                        readonly description: "The name of the child feature.";
                        readonly example: "child_feature";
                    };
                    readonly dependencies: {
                        readonly type: "array";
                        readonly description: "List of parent features for the child feature";
                        readonly items: {
                            readonly $ref: "#/components/schemas/dependentFeatureSchema";
                        };
                    };
                };
                readonly components: {
                    readonly schemas: {
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
            readonly tagSchema: {
                readonly $id: "#/components/schemas/tagSchema";
                readonly type: "object";
                readonly description: "Representation of a [tag](https://docs.getunleash.io/reference/feature-toggles#tags)";
                readonly additionalProperties: false;
                readonly required: readonly ["value", "type"];
                readonly properties: {
                    readonly value: {
                        readonly type: "string";
                        readonly description: "The value of the tag.";
                        readonly minLength: 2;
                        readonly maxLength: 50;
                        readonly example: "a-tag-value";
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly minLength: 2;
                        readonly maxLength: 50;
                        readonly description: "The [type](https://docs.getunleash.io/reference/feature-toggles#tags) of the tag";
                        readonly example: "simple";
                    };
                    readonly color: {
                        readonly type: "string";
                        readonly description: "The hexadecimal color code for the tag type.";
                        readonly example: "#FFFFFF";
                        readonly pattern: "^#[0-9A-Fa-f]{6}$";
                        readonly nullable: true;
                    };
                };
                readonly components: {};
            };
        };
    };
};
export type ExportResultSchema = FromSchema<typeof exportResultSchema>;
//# sourceMappingURL=export-result-schema.d.ts.map