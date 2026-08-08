import type { FromSchema } from 'json-schema-to-ts';
export declare const applicationOverviewSchema: {
    readonly $id: "#/components/schemas/applicationOverviewSchema";
    readonly type: "object";
    readonly description: "Data about an application that's connected to Unleash via an SDK.";
    readonly additionalProperties: false;
    readonly required: readonly ["projects", "featureCount", "environments", "issues"];
    readonly properties: {
        readonly projects: {
            readonly description: "The list of projects the application has been using.";
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly example: readonly ["default", "payment"];
        };
        readonly featureCount: {
            readonly description: "The number of features the application has been using.";
            readonly type: "number";
            readonly example: 5;
        };
        readonly environments: {
            readonly type: "array";
            readonly description: "The list of environments the application has been using.";
            readonly items: {
                readonly $ref: "#/components/schemas/applicationOverviewEnvironmentSchema";
            };
        };
        readonly issues: {
            readonly description: "This list of issues that might be wrong with the application";
            readonly $ref: "#/components/schemas/applicationOverviewIssuesSchema";
        };
    };
    readonly components: {
        readonly schemas: {
            readonly applicationOverviewEnvironmentSchema: {
                readonly $id: "#/components/schemas/applicationOverviewEnvironmentSchema";
                readonly type: "object";
                readonly description: "Data about an application environment";
                readonly additionalProperties: false;
                readonly required: readonly ["name", "instanceCount", "sdks", "lastSeen", "issues"];
                readonly properties: {
                    readonly name: {
                        readonly description: "Name of the application environment";
                        readonly type: "string";
                        readonly example: "production";
                    };
                    readonly instanceCount: {
                        readonly description: "The number of instances of the application environment";
                        readonly type: "number";
                        readonly example: 5;
                    };
                    readonly sdks: {
                        readonly description: "SDKs used in the application environment";
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                        readonly example: readonly ["unleash-client-node:5.4.0", "unleash-client-node:5.3.0"];
                    };
                    readonly lastSeen: {
                        readonly type: "string";
                        readonly nullable: true;
                        readonly format: "date-time";
                        readonly example: "2023-04-19T08:15:14.000Z";
                        readonly description: "The last time the application environment was seen";
                    };
                    readonly issues: {
                        readonly description: "This list of issues that might be wrong with the application";
                        readonly $ref: "#/components/schemas/applicationEnvironmentIssuesSchema";
                    };
                };
                readonly components: {
                    readonly schemas: {
                        readonly applicationEnvironmentIssuesSchema: {
                            readonly $id: "#/components/schemas/applicationEnvironmentIssuesSchema";
                            readonly type: "object";
                            readonly description: "This list of issues that might be wrong with the application";
                            readonly additionalProperties: false;
                            readonly required: readonly ["missingFeatures", "outdatedSdks"];
                            readonly properties: {
                                readonly missingFeatures: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                    readonly description: "The list of features that are missing in Unleash";
                                    readonly example: readonly ["feature1", "feature2"];
                                };
                                readonly outdatedSdks: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                    readonly description: "The list of used SDKs that are outdated";
                                    readonly example: readonly ["unleash-client-node:5.4.0", "unleash-client-node:5.3.0"];
                                };
                            };
                            readonly components: {};
                        };
                    };
                };
            };
            readonly applicationOverviewIssuesSchema: {
                readonly $id: "#/components/schemas/applicationOverviewIssuesSchema";
                readonly type: "object";
                readonly description: "This list of issues that might be wrong with the application";
                readonly additionalProperties: false;
                readonly required: readonly ["missingStrategies"];
                readonly properties: {
                    readonly missingStrategies: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                        readonly description: "The list of strategies that are missing from Unleash";
                        readonly example: readonly ["feature1", "feature2"];
                    };
                };
                readonly components: {};
            };
            readonly applicationEnvironmentIssuesSchema: {
                readonly $id: "#/components/schemas/applicationEnvironmentIssuesSchema";
                readonly type: "object";
                readonly description: "This list of issues that might be wrong with the application";
                readonly additionalProperties: false;
                readonly required: readonly ["missingFeatures", "outdatedSdks"];
                readonly properties: {
                    readonly missingFeatures: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                        readonly description: "The list of features that are missing in Unleash";
                        readonly example: readonly ["feature1", "feature2"];
                    };
                    readonly outdatedSdks: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                        readonly description: "The list of used SDKs that are outdated";
                        readonly example: readonly ["unleash-client-node:5.4.0", "unleash-client-node:5.3.0"];
                    };
                };
                readonly components: {};
            };
        };
    };
};
export type ApplicationOverviewSchema = FromSchema<typeof applicationOverviewSchema>;
//# sourceMappingURL=application-overview-schema.d.ts.map