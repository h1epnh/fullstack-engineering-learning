import type { FromSchema } from 'json-schema-to-ts';
export declare const frontendApiClientSchema: {
    readonly $id: "#/components/schemas/frontendApiClientSchema";
    readonly type: "object";
    readonly required: readonly ["appName", "interval", "started", "strategies"];
    readonly description: "Frontend SDK client registration information";
    readonly properties: {
        readonly appName: {
            readonly type: "string";
            readonly description: "Name of the application using Unleash";
        };
        readonly instanceId: {
            readonly type: "string";
            readonly description: "Instance id for this application (typically hostname, podId or similar)";
        };
        readonly sdkVersion: {
            readonly type: "string";
            readonly description: "Optional field that describes the sdk version (name:version)";
        };
        readonly environment: {
            readonly type: "string";
            readonly deprecated: true;
            readonly description: "deprecated";
            readonly example: "development";
        };
        readonly interval: {
            readonly type: "number";
            readonly description: "At which interval, in milliseconds, will this client be expected to send metrics";
        };
        readonly started: {
            readonly oneOf: readonly [{
                readonly type: "string";
                readonly format: "date-time";
            }, {
                readonly type: "number";
            }];
            readonly description: "When this client started. Should be reported as ISO8601 time.";
        };
        readonly strategies: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly description: "List of strategies implemented by this application";
        };
    };
    readonly components: {};
};
export type FrontendApiClientSchema = FromSchema<typeof frontendApiClientSchema>;
//# sourceMappingURL=frontend-api-client-schema.d.ts.map