import type { FromSchema } from 'json-schema-to-ts';
export declare const sdkFlatContextSchema: {
    readonly $id: "#/components/schemas/sdkFlatContextSchema";
    readonly description: "The Unleash context with flattened properties";
    readonly type: "object";
    readonly required: readonly ["appName"];
    readonly additionalProperties: true;
    readonly properties: {
        appName: {
            readonly type: "string";
            readonly minLength: 1;
            readonly example: "My cool application.";
            readonly description: "The name of the application.";
        };
        currentTime: {
            readonly type: "string";
            readonly format: "date-time";
            readonly example: "2022-07-05T12:56:41+02:00";
            readonly description: "A DateTime (or similar) data class instance or a string in an RFC3339-compatible format. Defaults to the current time if not set by the user.";
        };
        environment: {
            readonly type: "string";
            readonly deprecated: true;
            readonly description: "The environment the app is running in.";
        };
        remoteAddress: {
            readonly type: "string";
            readonly example: "192.168.1.1";
            readonly description: "The app's IP address";
        };
        sessionId: {
            readonly type: "string";
            readonly example: "b65e7b23-fec0-4814-a129-0e9861ef18fc";
            readonly description: "An identifier for the current session";
        };
        userId: {
            readonly type: "string";
            readonly example: "username@provider.com";
            readonly description: "An identifier for the current user";
        };
    };
    readonly components: {};
};
export type SdkFlatContextSchema = FromSchema<typeof sdkFlatContextSchema>;
//# sourceMappingURL=sdk-flat-context-schema.d.ts.map