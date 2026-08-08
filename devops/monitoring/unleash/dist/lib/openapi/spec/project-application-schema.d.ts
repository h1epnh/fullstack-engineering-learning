import type { FromSchema } from 'json-schema-to-ts';
export declare const projectApplicationSchema: {
    readonly $id: "#/components/schemas/projectApplicationSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["name", "environments", "instances", "sdks"];
    readonly description: "A project application instance.";
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly description: "Name of the application that is using the SDK. This is the same as the appName in the SDK configuration.";
        };
        readonly environments: {
            readonly description: "The environments that the application is using. This is the same as the environment in the SDK configuration.";
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly example: readonly ["development", "production"];
        };
        readonly instances: {
            readonly description: "The instances of the application that are using the SDK.";
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly example: readonly ["prod-b4ca", "prod-ac8a"];
        };
        readonly sdks: {
            readonly type: "array";
            readonly description: "The SDKs that the application is using.";
            readonly items: {
                readonly $ref: "#/components/schemas/projectApplicationSdkSchema";
            };
        };
    };
    readonly components: {
        readonly projectApplicationSdkSchema: {
            readonly $id: "#/components/schemas/projectApplicationSdkSchema";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["name", "versions"];
            readonly description: "A project application instance SDK.";
            readonly properties: {
                readonly name: {
                    readonly type: "string";
                    readonly description: "Name of the SDK package that the application is using.";
                    readonly example: "unleash-client-node";
                };
                readonly versions: {
                    readonly description: "The versions of the SDK that the application is using.";
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                    readonly example: readonly ["4.1.1"];
                };
            };
            readonly components: {};
        };
    };
};
export type ProjectApplicationSchema = FromSchema<typeof projectApplicationSchema>;
//# sourceMappingURL=project-application-schema.d.ts.map