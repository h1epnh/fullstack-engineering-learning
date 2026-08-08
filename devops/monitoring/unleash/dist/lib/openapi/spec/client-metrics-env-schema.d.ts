import type { FromSchema } from 'json-schema-to-ts';
export declare const clientMetricsEnvSchema: {
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
export type ClientMetricsEnvSchema = FromSchema<typeof clientMetricsEnvSchema>;
//# sourceMappingURL=client-metrics-env-schema.d.ts.map