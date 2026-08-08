import type { FromSchema } from 'json-schema-to-ts';
export declare const sdkContextSchema: {
    readonly $id: "#/components/schemas/sdkContextSchema";
    readonly description: "The Unleash context as modeled in client SDKs";
    readonly type: "object";
    readonly required: readonly ["appName"];
    readonly additionalProperties: true;
    readonly properties: {
        readonly appName: {
            readonly type: "string";
            readonly minLength: 1;
            readonly example: "My cool application.";
            readonly description: "The name of the application.";
        };
        readonly currentTime: {
            readonly type: "string";
            readonly format: "date-time";
            readonly example: "2022-07-05T12:56:41+02:00";
            readonly description: "A DateTime (or similar) data class instance or a string in an RFC3339-compatible format. Defaults to the current time if not set by the user.";
        };
        readonly environment: {
            readonly type: "string";
            readonly deprecated: true;
            readonly description: "The environment the app is running in.";
        };
        readonly properties: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
            readonly description: "Additional Unleash context properties";
            readonly example: {
                readonly customContextField: "this is one!";
                readonly otherCustomField: "3";
            };
        };
        readonly remoteAddress: {
            readonly type: "string";
            readonly example: "192.168.1.1";
            readonly description: "The app's IP address";
        };
        readonly sessionId: {
            readonly type: "string";
            readonly example: "b65e7b23-fec0-4814-a129-0e9861ef18fc";
            readonly description: "An identifier for the current session";
        };
        readonly userId: {
            readonly type: "string";
            readonly example: "username@provider.com";
            readonly description: "An identifier for the current user";
        };
    };
    readonly components: {};
};
export type SdkContextSchema = FromSchema<typeof sdkContextSchema>;
//# sourceMappingURL=sdk-context-schema.d.ts.map