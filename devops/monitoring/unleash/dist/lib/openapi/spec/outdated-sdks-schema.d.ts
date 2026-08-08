import type { FromSchema } from 'json-schema-to-ts';
export declare const outdatedSdksSchema: {
    readonly $id: "#/components/schemas/outdatedSdksSchema";
    readonly type: "object";
    readonly description: "Data about outdated SDKs that should be upgraded.";
    readonly additionalProperties: false;
    readonly required: readonly ["sdks"];
    readonly properties: {
        readonly sdks: {
            readonly type: "array";
            readonly description: "A list of SDKs";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["sdkVersion", "applications"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly sdkVersion: {
                        readonly type: "string";
                        readonly description: "An outdated SDK version identifier. Usually formatted as \"unleash-client-<language>:<version>\"";
                        readonly example: "unleash-client-java:7.0.0";
                    };
                    readonly applications: {
                        readonly type: "array";
                        readonly items: {
                            readonly description: "Name of the application";
                            readonly type: "string";
                            readonly example: "accounting";
                        };
                        readonly description: "A list of applications using the SDK version";
                    };
                };
            };
        };
    };
    readonly components: {};
};
export type OutdatedSdksSchema = FromSchema<typeof outdatedSdksSchema>;
//# sourceMappingURL=outdated-sdks-schema.d.ts.map