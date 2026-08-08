import type { FromSchema } from 'json-schema-to-ts';
export declare const bulkMetricsSchema: {
    readonly $id: "#/components/schemas/bulkMetricsSchema";
    readonly type: "object";
    readonly required: readonly ["applications", "metrics"];
    readonly description: "A batch of metrics accumulated by Edge (or other compatible applications). Includes both application registrations as well usage metrics from clients";
    readonly properties: {
        readonly applications: {
            readonly description: "A list of applications registered by an Unleash SDK";
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/components/schemas/bulkRegistrationSchema";
            };
        };
        readonly metrics: {
            readonly description: "a list of client usage metrics registered by downstream providers. (Typically Unleash Edge)";
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/components/schemas/clientMetricsEnvSchema";
            };
        };
    };
    readonly components: {
        readonly schemas: {
            readonly bulkRegistrationSchema: {
                readonly $id: "#/components/schemas/bulkRegistrationSchema";
                readonly type: "object";
                readonly required: readonly ["appName", "instanceId", "environment"];
                readonly description: "An application registration. Defines the format POSTed by our server-side SDKs when they're starting up";
                readonly properties: {
                    readonly connectVia: {
                        readonly type: "array";
                        readonly description: "A list of applications this app registration has been registered through. If connected directly to Unleash, this is an empty list. \n This can be used in later visualizations to tell how many levels of proxy or Edge instances our SDKs have connected through";
                        readonly items: {
                            readonly type: "object";
                            readonly required: readonly ["appName", "instanceId"];
                            readonly properties: {
                                readonly appName: {
                                    readonly type: "string";
                                };
                                readonly instanceId: {
                                    readonly type: "string";
                                };
                            };
                        };
                        readonly example: readonly [{
                            readonly appName: "unleash-edge";
                            readonly instanceId: "edge-pod-bghzv5";
                        }];
                    };
                    readonly appName: {
                        readonly description: "The name of the application that is evaluating toggles";
                        readonly type: "string";
                        readonly example: "Ingress load balancer";
                    };
                    readonly environment: {
                        readonly description: "Which environment the application is running in";
                        readonly type: "string";
                        readonly example: "development";
                    };
                    readonly instanceId: {
                        readonly description: "A [(somewhat) unique identifier](https://docs.getunleash.io/reference/sdks/node#advanced-usage) for the application";
                        readonly type: "string";
                        readonly example: "application-name-dacb1234";
                    };
                    readonly interval: {
                        readonly description: "How often (in seconds) the application refreshes its features";
                        readonly type: "number";
                        readonly example: 10;
                    };
                    readonly started: {
                        readonly description: "The application started at";
                        readonly example: "1952-03-11T12:00:00.000Z";
                        readonly $ref: "#/components/schemas/dateSchema";
                    };
                    readonly strategies: {
                        readonly description: "Enabled [strategies](https://docs.getunleash.io/reference/activation-strategies) in the application";
                        readonly type: "array";
                        readonly example: readonly ["standard", "gradualRollout"];
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly sdkVersion: {
                        readonly description: "The version the sdk is running. Typically <client>:<version>";
                        readonly example: "unleash-client-java:8.0.0";
                        readonly type: "string";
                    };
                };
                readonly components: {
                    readonly schemas: {
                        readonly dateSchema: {
                            readonly $id: "#/components/schemas/dateSchema";
                            readonly description: "A representation of a date. Either as a date-time string or as a UNIX timestamp.";
                            readonly oneOf: readonly [{
                                readonly type: "string";
                                readonly format: "date-time";
                                readonly description: "An [RFC-3339](https://www.rfc-editor.org/rfc/rfc3339.html)-compliant timestamp.";
                                readonly example: "2023-07-27T11:23:44Z";
                            }, {
                                readonly type: "integer";
                                readonly description: "A [UNIX timestamp](https://en.wikipedia.org/wiki/Unix_time).";
                                readonly example: 1690449593;
                            }];
                            readonly components: {};
                        };
                    };
                };
            };
            readonly dateSchema: {
                readonly $id: "#/components/schemas/dateSchema";
                readonly description: "A representation of a date. Either as a date-time string or as a UNIX timestamp.";
                readonly oneOf: readonly [{
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly description: "An [RFC-3339](https://www.rfc-editor.org/rfc/rfc3339.html)-compliant timestamp.";
                    readonly example: "2023-07-27T11:23:44Z";
                }, {
                    readonly type: "integer";
                    readonly description: "A [UNIX timestamp](https://en.wikipedia.org/wiki/Unix_time).";
                    readonly example: 1690449593;
                }];
                readonly components: {};
            };
            readonly clientMetricsEnvSchema: {
                readonly $id: "#/components/schemas/clientMetricsEnvSchema";
                readonly type: "object";
                readonly required: readonly ["featureName", "appName", "environment"];
                readonly description: "Used for reporting feature evaluation results from SDKs";
                readonly properties: {
                    readonly featureName: {
                        readonly type: "string";
                        readonly description: "Name of the feature checked by the SDK";
                        readonly example: "my.special.feature";
                    };
                    readonly appName: {
                        readonly description: "The name of the application the SDK is being used in";
                        readonly type: "string";
                        readonly example: "accounting";
                    };
                    readonly environment: {
                        readonly description: "Which environment the SDK is being used in";
                        readonly type: "string";
                        readonly example: "development";
                    };
                    readonly timestamp: {
                        readonly description: "The start of the time window these metrics are valid for. The window is 1 hour wide";
                        readonly example: "1926-05-08T12:00:00.000Z";
                        readonly $ref: "#/components/schemas/dateSchema";
                    };
                    readonly yes: {
                        readonly description: "How many times the toggle evaluated to true";
                        readonly type: "integer";
                        readonly example: 974;
                        readonly minimum: 0;
                    };
                    readonly no: {
                        readonly description: "How many times the toggle evaluated to false";
                        readonly type: "integer";
                        readonly example: 50;
                        readonly minimum: 0;
                    };
                    readonly variants: {
                        readonly description: "How many times each variant was returned";
                        readonly type: "object";
                        readonly additionalProperties: {
                            readonly type: "integer";
                            readonly minimum: 0;
                        };
                        readonly example: {
                            readonly variantA: 15;
                            readonly variantB: 25;
                            readonly variantC: 5;
                        };
                    };
                };
                readonly components: {
                    readonly schemas: {
                        readonly dateSchema: {
                            readonly $id: "#/components/schemas/dateSchema";
                            readonly description: "A representation of a date. Either as a date-time string or as a UNIX timestamp.";
                            readonly oneOf: readonly [{
                                readonly type: "string";
                                readonly format: "date-time";
                                readonly description: "An [RFC-3339](https://www.rfc-editor.org/rfc/rfc3339.html)-compliant timestamp.";
                                readonly example: "2023-07-27T11:23:44Z";
                            }, {
                                readonly type: "integer";
                                readonly description: "A [UNIX timestamp](https://en.wikipedia.org/wiki/Unix_time).";
                                readonly example: 1690449593;
                            }];
                            readonly components: {};
                        };
                    };
                };
            };
        };
    };
};
export type BulkMetricsSchema = FromSchema<typeof bulkMetricsSchema>;
//# sourceMappingURL=bulk-metrics-schema.d.ts.map