import type { FromSchema } from 'json-schema-to-ts';
export declare const deprecatedProjectOverviewSchema: {
    readonly $id: "#/components/schemas/deprecatedProjectOverviewSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["version", "name"];
    readonly description: "A high-level overview of a project. It contains information such as project statistics, the name of the project, what members and what features it contains, etc.";
    readonly properties: {
        readonly stats: {
            readonly $ref: "#/components/schemas/projectStatsSchema";
            readonly description: "Project statistics";
        };
        readonly version: {
            readonly type: "integer";
            readonly example: 1;
            readonly description: "The schema version used to describe the project overview";
        };
        readonly name: {
            readonly type: "string";
            readonly example: "dx-squad";
            readonly description: "The name of this project";
        };
        readonly description: {
            readonly type: "string";
            readonly nullable: true;
            readonly example: "DX squad feature release";
            readonly description: "Additional information about the project";
        };
        readonly defaultStickiness: {
            readonly type: "string";
            readonly example: "userId";
            readonly description: "A default stickiness for the project affecting the default stickiness value for variants and Gradual Rollout strategy";
        };
        readonly mode: {
            readonly type: "string";
            readonly enum: readonly ["open", "protected", "private"];
            readonly example: "open";
            readonly description: "The project's [collaboration mode](https://docs.getunleash.io/reference/project-collaboration-mode). Determines whether non-project members can submit change requests or not.";
        };
        readonly featureLimit: {
            readonly type: "number";
            readonly nullable: true;
            readonly example: 100;
            readonly description: "A limit on the number of features allowed in the project. Null if no limit.";
        };
        readonly featureNaming: {
            readonly $ref: "#/components/schemas/createFeatureNamingPatternSchema";
        };
        readonly members: {
            readonly type: "number";
            readonly example: 4;
            readonly description: "The number of members this project has";
        };
        readonly health: {
            readonly type: "number";
            readonly example: 50;
            readonly description: "An indicator of the [project's health](https://docs.getunleash.io/reference/technical-debt#project-status) on a scale from 0 to 100";
        };
        readonly environments: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/components/schemas/projectEnvironmentSchema";
            };
            readonly example: readonly [{
                readonly environment: "development";
            }, {
                readonly environment: "production";
                readonly defaultStrategy: {
                    readonly name: "flexibleRollout";
                    readonly constraints: readonly [];
                    readonly parameters: {
                        readonly rollout: "50";
                        readonly stickiness: "customAppName";
                        readonly groupId: "stickytoggle";
                    };
                };
            }];
            readonly description: "The environments that are enabled for this project";
        };
        readonly features: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/components/schemas/featureSchema";
            };
            readonly description: "The full list of features in this project (excluding archived features)";
        };
        readonly updatedAt: {
            readonly type: "string";
            readonly format: "date-time";
            readonly nullable: true;
            readonly example: "2023-02-10T08:36:35.262Z";
            readonly description: "When the project was last updated.";
        };
        readonly createdAt: {
            readonly type: "string";
            readonly format: "date-time";
            readonly nullable: true;
            readonly example: "2023-02-10T08:36:35.262Z";
            readonly description: "When the project was created.";
        };
        readonly favorite: {
            readonly type: "boolean";
            readonly example: true;
            readonly description: "`true` if the project was favorited, otherwise `false`.";
        };
    };
    readonly components: {
        readonly schemas: {
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
            readonly projectEnvironmentSchema: {
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
            readonly projectStatsSchema: {
                readonly $id: "#/components/schemas/projectStatsSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["avgTimeToProdCurrentWindow", "createdCurrentWindow", "createdPastWindow", "archivedCurrentWindow", "archivedPastWindow", "projectActivityCurrentWindow", "projectActivityPastWindow", "projectMembersAddedCurrentWindow"];
                readonly description: "Statistics for a project, including the average time to production, number of features created, the project activity and more.\n\nStats are divided into current and previous **windows**.\n- The **current window** is the past 30 days.\n- The **previous window** is the 30 days **before** the current window (from 60 to 30 days ago)";
                readonly properties: {
                    readonly avgTimeToProdCurrentWindow: {
                        readonly type: "number";
                        readonly example: 10;
                        readonly description: "The average time from when a feature was created to when it was enabled in the \"production\" environment during the current window";
                    };
                    readonly createdCurrentWindow: {
                        readonly type: "number";
                        readonly example: 15;
                        readonly description: "The number of feature flags created during the current window";
                    };
                    readonly createdPastWindow: {
                        readonly type: "number";
                        readonly example: 15;
                        readonly description: "The number of feature flags created during the previous window";
                    };
                    readonly archivedCurrentWindow: {
                        readonly type: "number";
                        readonly example: 5;
                        readonly description: "The number of feature flags that were archived during the current window";
                    };
                    readonly archivedPastWindow: {
                        readonly type: "number";
                        readonly example: 5;
                        readonly description: "The number of feature flags that were archived during the previous window";
                    };
                    readonly projectActivityCurrentWindow: {
                        readonly type: "number";
                        readonly example: 100;
                        readonly description: "The number of project events that occurred during the current window";
                    };
                    readonly projectActivityPastWindow: {
                        readonly type: "number";
                        readonly example: 100;
                        readonly description: "The number of project events that occurred during the previous window";
                    };
                    readonly projectMembersAddedCurrentWindow: {
                        readonly type: "number";
                        readonly example: 1;
                        readonly description: "The number of members that were added to the project during the current window";
                    };
                };
                readonly components: {};
            };
            readonly createFeatureNamingPatternSchema: {
                readonly $id: "#/components/schemas/createFeatureNamingPatternSchema";
                readonly type: "object";
                readonly description: "Create a feature naming pattern";
                readonly required: readonly ["pattern"];
                readonly properties: {
                    readonly pattern: {
                        readonly type: "string";
                        readonly nullable: true;
                        readonly description: "A JavaScript regular expression pattern, without the start and end delimiters. Optional flags are not allowed.";
                        readonly example: "^[A-Za-z]+\\.[A-Za-z]+\\.[A-Za-z0-9-]+$";
                    };
                    readonly example: {
                        readonly type: "string";
                        readonly nullable: true;
                        readonly description: "An example of a feature name that matches the pattern. Must itself match the pattern supplied.";
                        readonly example: "dx.feature1.1-135";
                    };
                    readonly description: {
                        readonly type: "string";
                        readonly nullable: true;
                        readonly description: "A description of the pattern in a human-readable format. Will be shown to users when they create a new feature flag.";
                        readonly example: "<project>.<featureName>.<ticket>\n\nThe flag name should contain the project name, the feature name, and the ticket number, each separated by a dot.";
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
export type DeprecatedProjectOverviewSchema = FromSchema<typeof deprecatedProjectOverviewSchema>;
//# sourceMappingURL=deprecated-project-overview-schema.d.ts.map