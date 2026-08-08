import type { FromSchema } from 'json-schema-to-ts';
export declare const projectFeaturesSchema: {
    readonly $id: "#/components/schemas/projectFeaturesSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["version", "features"];
    readonly description: "A list of features in a project";
    readonly deprecated: true;
    readonly properties: {
        readonly version: {
            readonly type: "integer";
            readonly description: "The version of the feature's schema";
        };
        readonly features: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/components/schemas/projectFeatureSchema";
            };
            readonly description: "A list of features";
        };
    };
    readonly components: {
        readonly schemas: {
            readonly projectFeatureSchema: {
                readonly $id: "#/components/schemas/projectFeatureSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["name", "type", "description", "stale", "favorite", "impressionData", "createdAt", "lastSeenAt", "environments"];
                readonly description: "A project feature flag definition";
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
                        readonly example: "2023-01-28T15:21:39.975Z";
                        readonly description: "The date the feature was created";
                    };
                    readonly lastSeenAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly nullable: true;
                        readonly deprecated: true;
                        readonly example: "2023-01-28T16:21:39.975Z";
                        readonly description: "The date and time when metrics where last collected for this flag in any environment. This field was deprecated in v5. You should instead use the `lastSeenAt` property on the individual environments listed under the `environments` property.";
                    };
                    readonly environments: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "#/components/schemas/projectFeatureEnvironmentSchema";
                        };
                        readonly description: "The list of environments where the feature can be used";
                    };
                    readonly tags: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "#/components/schemas/tagSchema";
                        };
                        readonly nullable: true;
                        readonly description: "The list of feature tags";
                    };
                };
                readonly components: {
                    readonly schemas: {
                        readonly projectFeatureEnvironmentSchema: {
                            readonly $id: "#/components/schemas/projectFeatureEnvironmentSchema";
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly required: readonly ["name", "type", "enabled", "sortOrder", "variantCount", "lastSeenAt"];
                            readonly description: "A detailed description of the feature environment";
                            readonly properties: {
                                readonly name: {
                                    readonly type: "string";
                                    readonly example: "my-dev-env";
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
                                readonly schemas: {};
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
            readonly projectFeatureEnvironmentSchema: {
                readonly $id: "#/components/schemas/projectFeatureEnvironmentSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["name", "type", "enabled", "sortOrder", "variantCount", "lastSeenAt"];
                readonly description: "A detailed description of the feature environment";
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly example: "my-dev-env";
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
                    readonly schemas: {};
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
export type ProjectFeaturesSchema = FromSchema<typeof projectFeaturesSchema>;
//# sourceMappingURL=project-features-schema.d.ts.map