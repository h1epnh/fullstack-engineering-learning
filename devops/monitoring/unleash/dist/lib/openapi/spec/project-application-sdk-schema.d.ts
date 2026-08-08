import type { FromSchema } from 'json-schema-to-ts';
export declare const projectApplicationSdkSchema: {
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
export type ProjectApplicationSdkSchema = FromSchema<typeof projectApplicationSdkSchema>;
//# sourceMappingURL=project-application-sdk-schema.d.ts.map