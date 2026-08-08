import type { FromSchema } from 'json-schema-to-ts';
export declare const featureUsageSchema: {
    readonly $id: "#/components/schemas/featureUsageSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "How many applications have seen this feature flag, as well as how this feature was evaluated the last hour";
    readonly required: readonly ["version", "maturity", "featureName", "lastHourUsage", "seenApplications"];
    readonly properties: {
        readonly version: {
            readonly description: "The version of this schema";
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly maturity: {
            readonly description: "The maturity level of this API (alpha, beta, stable, deprecated)";
            readonly type: "string";
            readonly example: "stable";
        };
        readonly featureName: {
            readonly description: "The name of the feature";
            readonly type: "string";
            readonly example: "my.special.feature";
        };
        readonly lastHourUsage: {
            readonly description: "Last hour statistics. Accumulated per feature per environment. Contains counts for evaluations to true (yes) and to false (no)";
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/components/schemas/featureEnvironmentMetricsSchema";
            };
        };
        readonly seenApplications: {
            readonly description: "A list of applications seen using this feature";
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly example: readonly ["accounting", "billing", "booking"];
        };
    };
    readonly components: {
        readonly schemas: {
            readonly featureEnvironmentMetricsSchema: {
                readonly $id: "#/components/schemas/featureEnvironmentMetricsSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["environment", "timestamp", "yes", "no"];
                readonly description: "How many times `feautreName` was evaluated to `true` (yes) and `false` (no) for `appName` in `environmnet`";
                readonly properties: {
                    readonly featureName: {
                        readonly description: "The name of the feature";
                        readonly type: "string";
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
                        readonly description: "The start of the time window these metrics are valid for. The window is usually 1 hour wide";
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
export type FeatureUsageSchema = FromSchema<typeof featureUsageSchema>;
//# sourceMappingURL=feature-usage-schema.d.ts.map