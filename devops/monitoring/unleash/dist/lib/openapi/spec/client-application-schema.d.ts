import type { FromSchema } from 'json-schema-to-ts';
export declare const clientApplicationSchema: {
    readonly $id: "#/components/schemas/clientApplicationSchema";
    readonly type: "object";
    readonly required: readonly ["appName", "interval", "started", "strategies"];
    readonly description: "A client application is an instance of one of our SDKs";
    readonly properties: {
        readonly appName: {
            readonly description: "An identifier for the app that uses the sdk, should be static across SDK restarts";
            readonly type: "string";
            readonly example: "example-app";
        };
        readonly instanceId: {
            readonly description: "A unique identifier identifying the instance of the application running the SDK. Often changes based on execution environment. For instance: two pods in Kubernetes will have two different instanceIds";
            readonly type: "string";
            readonly example: "b77f3d13-5f48-4a7b-a3f4-a449b97ce43a";
        };
        readonly sdkVersion: {
            readonly type: "string";
            readonly description: "An SDK version identifier. Usually formatted as \"unleash-client-<language>:<version>\"";
            readonly example: "unleash-client-java:7.0.0";
        };
        readonly environment: {
            readonly description: "The SDK's configured 'environment' property. This property was deprecated in v5. This property  does **not** control which Unleash environment the SDK gets toggles for. To control Unleash environments, use the SDKs API key.";
            readonly deprecated: true;
            readonly type: "string";
            readonly example: "development";
        };
        readonly platformName: {
            readonly description: "The platform the application is running on. For languages that compile to binaries, this can be omitted";
            readonly type: "string";
            readonly example: ".NET Core";
        };
        readonly platformVersion: {
            readonly description: "The version of the platform the application is running on. Languages that compile to binaries, this is expected to be the compiler version used to assemble the binary.";
            readonly type: "string";
            readonly example: "3.1";
        };
        readonly yggdrasilVersion: {
            readonly description: "The semantic version of the Yggdrasil engine used by the client. If the client is using a native engine this can be omitted.";
            readonly type: "string";
            readonly example: "1.0.0";
        };
        readonly specVersion: {
            readonly description: "The version of the Unleash client specification the client supports";
            readonly type: "string";
            readonly example: "3.0.0";
        };
        readonly interval: {
            readonly type: "number";
            readonly description: "How often (in seconds) does the client refresh its toggles";
            readonly example: 10;
            readonly minimum: 0;
        };
        readonly started: {
            readonly description: "Either an RFC-3339 timestamp or a unix timestamp in seconds";
            readonly oneOf: readonly [{
                readonly type: "string";
                readonly format: "date-time";
            }, {
                readonly type: "number";
            }];
            readonly example: "2023-06-13T16:35:00.000Z";
        };
        readonly strategies: {
            readonly description: "Which strategies the SDKs runtime knows about";
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly example: readonly ["default", "gradualRollout", "remoteAddress"];
        };
    };
    readonly components: {};
};
export type ClientApplicationSchema = FromSchema<typeof clientApplicationSchema>;
//# sourceMappingURL=client-application-schema.d.ts.map