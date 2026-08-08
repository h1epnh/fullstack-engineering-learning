import type { FromSchema } from 'json-schema-to-ts';
export declare const uiConfigSchema: {
    readonly $id: "#/components/schemas/uiConfigSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "A collection of properties used to configure the Unleash Admin UI.";
    readonly required: readonly ["version", "unleashUrl", "baseUriPath", "versionInfo"];
    readonly properties: {
        readonly slogan: {
            readonly type: "string";
            readonly description: "The slogan to display in the UI footer.";
            readonly example: "The enterprise-ready feature flag service.";
        };
        readonly name: {
            readonly type: "string";
            readonly description: "The name of this Unleash instance. Used to build the text in the footer.";
            readonly example: "Unleash enterprise";
        };
        readonly version: {
            readonly type: "string";
            readonly description: "The current version of Unleash";
            readonly example: "5.3.0-main";
        };
        readonly environment: {
            readonly type: "string";
            readonly description: "What kind of Unleash instance it is: Enterprise, Pro, or Open source";
            readonly example: "Enterprise";
        };
        readonly billing: {
            readonly type: "string";
            readonly description: "The billing model in use for this Unleash instance.";
            readonly example: "subscription";
            readonly enum: readonly ["subscription", "pay-as-you-go"];
        };
        readonly unleashUrl: {
            readonly type: "string";
            readonly description: "The URL of the Unleash instance.";
            readonly example: "https://unleash.mycompany.com/enterprise";
        };
        readonly baseUriPath: {
            readonly type: "string";
            readonly description: "The base URI path at which this Unleash instance is listening.";
            readonly example: "/enterprise";
        };
        readonly feedbackUriPath: {
            readonly type: "string";
            readonly description: "The URI path at which the feedback endpoint is listening.";
            readonly example: "/feedback";
        };
        readonly disablePasswordAuth: {
            readonly type: "boolean";
            readonly description: "Whether password authentication should be disabled or not.";
            readonly example: false;
        };
        readonly emailEnabled: {
            readonly type: "boolean";
            readonly description: "Whether this instance can send out emails or not.";
            readonly example: true;
        };
        readonly maintenanceMode: {
            readonly type: "boolean";
            readonly description: "Whether maintenance mode is currently active or not.";
            readonly example: false;
        };
        readonly segmentValuesLimit: {
            readonly type: "number";
            readonly description: "The maximum number of values that can be used in a single segment.";
            readonly example: 1000;
            readonly deprecated: true;
        };
        readonly strategySegmentsLimit: {
            readonly type: "number";
            readonly description: "The maximum number of segments that can be applied to a single strategy.";
            readonly example: 5;
            readonly deprecated: true;
        };
        readonly resourceLimits: {
            readonly $ref: "#/components/schemas/resourceLimitsSchema";
            readonly description: "A map of resource names and their limits.";
            readonly example: {};
        };
        readonly prometheusAPIAvailable: {
            readonly type: "boolean";
            readonly description: "Whether a Prometheus API is available.";
            readonly example: true;
        };
        readonly frontendApiOrigins: {
            readonly type: "array";
            readonly description: "The list of origins that the front-end API should accept requests from.";
            readonly example: readonly ["*"];
            readonly items: {
                readonly type: "string";
            };
        };
        readonly flags: {
            readonly type: "object";
            readonly description: "Additional (largely experimental) features that are enabled in this Unleash instance.";
            readonly example: {
                readonly messageBanner: {
                    readonly name: "disabled";
                    readonly enabled: false;
                };
                readonly featuresExportImport: true;
            };
            readonly additionalProperties: {
                readonly anyOf: readonly [{
                    readonly type: "boolean";
                }, {
                    readonly $ref: "#/components/schemas/variantFlagSchema";
                }];
            };
        };
        readonly links: {
            readonly description: "Relevant links to use in the UI.";
            readonly example: readonly [{
                readonly value: "Documentation";
                readonly icon: "library_books";
                readonly href: "https://docs.getunleash.io/docs";
                readonly title: "User documentation";
            }, {
                readonly value: "GitHub";
                readonly icon: "c_github";
                readonly href: "https://github.com/Unleash/unleash";
                readonly title: "Source code on GitHub";
            }];
            readonly 'x-enforcer-exception-skip-codes': "WSCH006";
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly authenticationType: {
            readonly type: "string";
            readonly description: "The type of authentication enabled for this Unleash instance";
            readonly example: "enterprise";
            readonly enum: readonly ["open-source", "demo", "enterprise", "hosted", "custom", "none"];
        };
        readonly versionInfo: {
            readonly $ref: "#/components/schemas/versionSchema";
        };
        readonly oidcConfiguredThroughEnv: {
            readonly type: "boolean";
            readonly description: "Whether the OIDC configuration is set through environment variables or not.";
            readonly example: false;
        };
        readonly samlConfiguredThroughEnv: {
            readonly type: "boolean";
            readonly description: "Whether the SAML configuration is set through environment variables or not.";
            readonly example: false;
        };
        readonly maxSessionsCount: {
            readonly type: "number";
            readonly description: "The maximum number of sessions that a user has.";
            readonly example: 10;
        };
    };
    readonly components: {
        readonly schemas: {
            readonly versionSchema: {
                readonly $id: "#/components/schemas/versionSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly description: "Detailed information about an Unleash version";
                readonly required: readonly ["current", "latest", "isLatest"];
                readonly properties: {
                    readonly current: {
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly description: "The current version of Unleash.";
                        readonly properties: {
                            readonly oss: {
                                readonly description: "The OSS version used when building this Unleash instance, represented as a git revision belonging to the [main Unleash git repo](https://github.com/Unleash/unleash/)";
                                readonly example: "5.3.0-main";
                                readonly type: "string";
                            };
                            readonly enterprise: {
                                readonly description: "The Enterpris version of Unleash used to build this instance, represented as a git revision belonging to the [Unleash Enterprise](https://github.com/ivarconr/unleash-enterprise) repository. Will be an empty string if no enterprise version was used,";
                                readonly example: "5.3.0-main+2105.45ed03c9";
                                readonly type: "string";
                            };
                        };
                    };
                    readonly latest: {
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly description: "Information about the latest available Unleash releases. Will be an empty object if no data is available.";
                        readonly properties: {
                            readonly oss: {
                                readonly description: "The latest available OSS version of Unleash";
                                readonly type: "string";
                                readonly example: "5.1.5";
                            };
                            readonly enterprise: {
                                readonly description: "The latest available Enterprise version of Unleash";
                                readonly type: "string";
                                readonly example: "5.1.5";
                            };
                        };
                    };
                    readonly isLatest: {
                        readonly type: "boolean";
                        readonly description: "Whether the Unleash server is running the latest release (`true`) or if there are updates available (`false`)";
                        readonly example: true;
                    };
                    readonly instanceId: {
                        readonly type: "string";
                        readonly description: "The instance identifier of the Unleash instance";
                        readonly example: "0d652a82-43db-4144-8e02-864b0b030710";
                    };
                    readonly buildDate: {
                        readonly description: "The date and time of when this Unleash instance version was built";
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly nullable: true;
                        readonly example: "2023-06-30T11:41:00.123Z";
                    };
                };
                readonly components: {};
            };
            readonly variantFlagSchema: {
                readonly $id: "#/components/schemas/variantFlagSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly description: "A representation of an evaluated Unleash feature variant.";
                readonly properties: {
                    readonly name: {
                        readonly description: "The name of the variant. Will always be disabled if `enabled` is false.";
                        readonly example: "blue";
                        readonly type: "string";
                    };
                    readonly enabled: {
                        readonly type: "boolean";
                        readonly description: "Whether the variant is enabled or not.";
                        readonly example: true;
                    };
                    readonly payload: {
                        readonly type: "object";
                        readonly description: "Additional data associated with this variant.";
                        readonly additionalProperties: false;
                        readonly properties: {
                            readonly type: {
                                readonly description: "The type of data contained.";
                                readonly type: "string";
                                readonly enum: readonly ["string", "json", "csv", "number"];
                                readonly example: "json";
                            };
                            readonly value: {
                                readonly description: "The actual associated data";
                                readonly type: "string";
                                readonly example: "{ \"starter\": \"squirtle\" }";
                            };
                        };
                    };
                    readonly feature_enabled: {
                        readonly type: "boolean";
                        readonly description: "Whether the feature is enabled or not.";
                        readonly example: true;
                    };
                    readonly featureEnabled: {
                        readonly deprecated: true;
                        readonly type: "boolean";
                        readonly description: "Use `feature_enabled` instead.";
                        readonly example: true;
                    };
                };
                readonly components: {};
            };
            readonly resourceLimitsSchema: {
                readonly $id: "#/components/schemas/resourceLimitsSchema";
                readonly type: "object";
                readonly description: "A map of resource names and their limits.";
                readonly required: readonly ["segmentValues", "strategySegments", "actionSetActions", "actionSetsPerProject", "actionSetFilters", "actionSetFilterValues", "signalEndpoints", "signalTokensPerEndpoint", "featureEnvironmentStrategies", "constraintValues", "environments", "projects", "apiTokens", "segments", "featureFlags", "constraints"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly segmentValues: {
                        readonly type: "integer";
                        readonly example: 10;
                        readonly description: "The maximum number of values per segment allowed.";
                    };
                    readonly strategySegments: {
                        readonly type: "integer";
                        readonly example: 10;
                        readonly description: "The maximum number of strategy segments allowed.";
                    };
                    readonly actionSetActions: {
                        readonly type: "integer";
                        readonly example: 10;
                        readonly description: "The maximum number of actions per action set allowed.";
                    };
                    readonly actionSetsPerProject: {
                        readonly type: "integer";
                        readonly example: 10;
                        readonly description: "The maximum number of action set definitions per project allowed.";
                    };
                    readonly actionSetFilters: {
                        readonly type: "integer";
                        readonly example: 10;
                        readonly description: "The maximum number of filters per action set allowed.";
                    };
                    readonly actionSetFilterValues: {
                        readonly type: "integer";
                        readonly example: 10;
                        readonly description: "The maximum number of filter values inside an action set allowed.";
                    };
                    readonly signalEndpoints: {
                        readonly type: "integer";
                        readonly example: 10;
                        readonly description: "The maximum number of signal endpoints allowed.";
                    };
                    readonly signalTokensPerEndpoint: {
                        readonly type: "integer";
                        readonly example: 10;
                        readonly description: "The maximum number of signal tokens per endpoint allowed.";
                    };
                    readonly featureEnvironmentStrategies: {
                        readonly type: "integer";
                        readonly example: 30;
                        readonly description: "The maximum number of feature environment strategies allowed.";
                    };
                    readonly constraintValues: {
                        readonly type: "integer";
                        readonly example: 250;
                        readonly description: "The maximum number of values for a single constraint.";
                    };
                    readonly constraints: {
                        readonly type: "integer";
                        readonly example: 30;
                        readonly description: "The maximum number of constraints in a single strategy.";
                    };
                    readonly environments: {
                        readonly type: "integer";
                        readonly minimum: 1;
                        readonly example: 50;
                        readonly description: "The maximum number of environments allowed.";
                    };
                    readonly apiTokens: {
                        readonly type: "integer";
                        readonly minimum: 0;
                        readonly example: 2000;
                        readonly description: "The maximum number of SDK and admin API tokens you can have at the same time. This limit applies only to server-side and client-side SDK tokens and to admin tokens. Personal access tokens are not subject to this limit. The limit applies to the total number of tokens across all projects in your organization.";
                    };
                    readonly projects: {
                        readonly type: "integer";
                        readonly minimum: 1;
                        readonly example: 500;
                        readonly description: "The maximum number of projects allowed.";
                    };
                    readonly segments: {
                        readonly type: "integer";
                        readonly example: 300;
                        readonly description: "The maximum number of segments allowed.";
                    };
                    readonly featureFlags: {
                        readonly type: "integer";
                        readonly minimum: 1;
                        readonly example: 5000;
                        readonly description: "The maximum number of feature flags you can have at the same time. Archived flags do not count towards this limit.";
                    };
                };
                readonly components: {};
            };
        };
    };
};
export type UiConfigSchema = FromSchema<typeof uiConfigSchema>;
//# sourceMappingURL=ui-config-schema.d.ts.map